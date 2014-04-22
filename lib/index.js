/*jshint node:true */

// a simple way to include sproutcore as a nodejs module
// which will do the following:
// - given a framework dir, descend into it, exclude stuff which should not be taken
// - load every file, wrapping it with some extra code, and execute it using nodejs' vm
// - doesn't export anything currently, but does give a repl with
//
// Currently only runtime, because core_foundation causes trouble.

/*
  default includes and defines
 */

var fslib = require('fs');
var pathlib = require('path');
var util = require('util');
var curdir = __dirname;
var vm  = require("vm");
var context;
var filesLoadedInContext = [];


/*
Sproutnode config
 */

//var fws = ["frameworks/runtime", "frameworks/core_foundation"];
var fws = ["frameworks/bootstrap", "frameworks/runtime", "frameworks/core_foundation"].map(function (f) { return pathlib.join(curdir, '..', f); });
var dirsToSkip = ["tests", "views", "panes", "protocols", "child_view_layouts", "debug"];
var skipFiles = [
  "frameworks/core_foundation/system/color.js",
  "frameworks/core_foundation/system/core_query.js"
];

var fileInSkipFiles = function (f) {
  return skipFiles.some(function (sf) {
    return f.indexOf(sf) > -1;
  });
};
/*
Utility functions
 */

// external, because we need it for loadFile too
var replaceSuper = function (c) {
  return c.replace(/sc_super\(\)/g, "arguments.callee.base.apply(this,arguments)");
};

// we do stuff sync as it is startup anyway
// scanDir both scans the directory recursively, as well as load the contents of files
// parse sc_super and check for dependencies
// arguments:
// dir:       directory to scan
// baseDir:   directory to prepend to sc_require arguments
// files:     hash with filenames and file contents
// sortOrder: hash containing the dependencies per file
//
var scanDir = function (dir, baseDir, files, sortOrder) {
  var ret = [];
  var fileList = fslib.readdirSync(dir);
  fileList.forEach(function (fn) {
    var c, match, relpath;
    var isJS = pathlib.extname(fn) === ".js";
    var p = pathlib.join(dir, fn);
    var stat = fslib.statSync(p);
    var re = new RegExp("sc_require\\([\"'](.*?)[\"']\\)", "g");
    if (stat.isFile() && isJS && !fileInSkipFiles(p)) {
      ret.push(p);
      c = fslib.readFileSync(p).toString(); // immediately read, replace sc_super, and find deps
      c = replaceSuper(c);
      sortOrder[p] = [];
      while (match = re.exec(c)) {
        relpath = match[1];
        relpath = (relpath.lastIndexOf(".js") === -1) ? relpath + ".js": relpath;
        relpath = pathlib.join(baseDir, relpath);
        if (sortOrder[p].indexOf(relpath) === -1) sortOrder[p].push(relpath);
      }
      files[p] = c;
    }
    else if (stat.isDirectory() && dirsToSkip.indexOf(fn) === -1) {
      ret = ret.concat(scanDir(p, baseDir, files, sortOrder));
    }
  });
  return ret;
};

var sortFilesByRequirements = function (files, beginWithFiles, endWithFiles, dependencies) {
  var ret = [], // The sorted file list.
      currentlyProcessingFiles = []; // A stack of files that are currently being processed. (Used for circular dependency detection.)

  /*
    The recursive sort function.
    - If passed a folder path (ends in '/'), recurses all matching files.
    - If passed a file name (not a file; '.js' appended if needed), and if file hasn't already been handled
      (i.e. is in ret), recurses its dependencies and adds to ret.
  */
  var recurser = function (fileOrFolder) {
    var i, len, folderLen;
    if (fileOrFolder.slice(-1) === '/') { // Handle folders.
      // Scan all files, recursing any matches.
      folderLen = fileOrFolder.length;
      for (i = 0, len = files.length; i < len; i++) {
        if (files[i].substr(0, folderLen) === fileOrFolder) {
          recurser(files[i]);
        }
      }
    }
    // For files, check if it's been handled; if not, recurse its dependencies.
    else {
      // Append file extension if needed. (Would be great to deprecate this.)
      // TODO: Generalize this. We won't always be dealing with .js files.
      if (fileOrFolder.slice(-3) !== '.js') fileOrFolder += '.js';

      if (ret.indexOf(fileOrFolder) === -1) {  // If the file hasn't been processed yet...
        if (currentlyProcessingFiles.indexOf(fileOrFolder) > -1) { // Check for circularity and error out if found.
          util.log("BuildTools encountered a circular dependency.");
          util.log('The file ' + fileOrFolder + ' was required via sc_require(), while already being processed:');
          currentlyProcessingFiles.forEach(function (file) { util.log('  ' + file + ' =>'); });
          util.log('  ' + fileOrFolder);
          util.log('You must fix this before proceeding.');
          throw new Error(" oops...");
        }

        // Get the file's dependencies.
        var theseDependencies = dependencies[fileOrFolder] ? dependencies[fileOrFolder] : [];
        currentlyProcessingFiles.push(fileOrFolder); // Mark file as in progress (for circular dependency check).
        for (i = 0, len = theseDependencies.length; i < len; i++) { // Recurse each one.
          recurser(theseDependencies[i]);
        }
        currentlyProcessingFiles.pop(); // Un-mark file as in progress.
        ret.push(fileOrFolder);// Add to the list.
      }
    }
  };

  // First we process beginWithFiles.
  var i, len;
  for (i = 0, len = beginWithFiles.length; i < len; i++) {
    recurser(beginWithFiles[i]);
  }

  // Next we process the middle files. (We have to remove endWithFiles from them to be sure that they're not processed
  // until the end; we remove beginWithFiles just for consistency and maybe a speed boost.)
  //var middleFiles = files.slice().removeObjects(beginWithFiles).removeObjects(endWithFiles);
  var middleFiles = files.slice().filter(function (f) {
    return !(beginWithFiles.indexOf(f) > -1 || endWithFiles.indexOf(f) > -1);
  });
  for (i = 0, len = middleFiles.length; i < len; i++) {
    recurser(middleFiles[i]);
  }

  // Finally we process endWithFiles.
  for (i = 0, len = endWithFiles.length; i < len; i++) {
    recurser(endWithFiles[i]);
  }

  return ret;
};

//  getters and setters that allows external programs
// to set and get things inside the environment

var getPath = function (path) {
  var tuple = context.SC.tupleForPropertyPath(path, context);
  if (tuple === null || tuple[0] === null) return undefined;
  return context.SC.get(tuple[0], tuple[1]);
};

var setPath = function (path, value) {
  if (path.indexOf('.') >= 0) {
    var tuple = context.SC.tupleForPropertyPath(path, context);
    if (!tuple || !tuple[0]) return null;
    tuple[0].set(tuple[1], value);
  }
  //return this;
};

var setPathIfChanged = function (path, value) {
  if (path.indexOf('.') >= 0) {
    var tuple = context.SC.tupleForPropertyPath(path, context);
    if (!tuple || !tuple[0]) return null;
    if (tuple[0].get(tuple[1]) !== value) {
      tuple[0].set(tuple[1], value);
    }
  } //else this.setIfChanged(path, value); // shortcut
  //return this;
};

var runInContext = function (code, filename) {
  var oldDir = context.__dirname;
  var oldFile = context.__filename;
  if (filename !== undefined) {
    context.__dirname = pathlib.dirname(filename);
    context.__filename = filename;
  }
  try {
    vm.runInContext(code, context, filename);
  }
  catch (e) {
    util.log('Evaluation error in ' + filename + ':' + util.inspect(e));
    util.log('error.errorcode: ' + util.inspect(e.message));
    // throw it again to give a proper stack trace, otherwise the original source file
    // cannot be determined
    throw e;
  }
  if (oldDir || oldFile) {
    context.__dirname = oldDir;
    context.__filename = oldFile;
  }
};

var loadFile = function (file) { // could be sc_require...
  // like require but then not node
  try {
    var c = fslib.readFileSync(file).toString();
    c = replaceSuper(c);
    // vm.runInContext(c, context, file);
    runInContext(c, file);
    filesLoadedInContext.push(file);
    return { ok: true };
  }
  catch (e) {
    e.isError = true;
    if (e.code !== "ENOENT") throw e;
    else return e;
  }
};

var loadFramework = function (fw) {
  var files = {},
      order = {};
  files[fw] = scanDir(fw, fw, files, order);
  files[fw].sort();
  files[fw] = sortFilesByRequirements(files[fw], [pathlib.join(fw, "core.js")], [], order);
  // we need to hack the context in order to get sc_require working
  //console.log('sort order: ' + util.inspect(files[fw]));
  context.__fwdir = fw;
  //var c, f;
  // for (var i = 0, len = files[fw].length; i < len; i += 1) {
  //   f = files[fw][i];
  //   c = files[f];
  //   runInContext(c, context, f);
  //   console.log('successfully ran ' + f);
  //   filesLoadedInContext.push(f);
  // }
  files[fw].forEach(function (f) {
    var c = files[f];
    runInContext(c, f);
    //vm.runInContext(c, context, f);
    //console.log('successfully ran ' + f);
    filesLoadedInContext.push(f);
  });
  context.__fwdir = null;
};

/*
Setting up running context
 */

var isAbsPath = function (p) {
  if (process.platform === "win32") {
    // implement an abspath for windows, regexp to match X:\
  }
  else {
    if (p[0] === "/") return true;
    else return false;
  }
};

/*

Setting up a very basic jQuery
*/

var jQuery = function (el) {
  if (typeof el === "string") {
    return context[el];
  }
  else return el;
};

jQuery.fn = jQuery.prototype = {

};

jQuery.trim = String.trim;

/*
jQuery("body").addClass(loc);

jQuery("html").attr("lang", loc);

jQuery("#loading").remove();
 */

//"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.1916.14 Safari/537.36"
var createUserAgent = function () {
  var engineV = process.versions.node;
  var os = process.platform;
  var osname = os === "darwin" ? "Macintosh": os === "win32"? "Windows" : "Linux"; // we don't support more
  return "NodeJS/" + engineV + "(" + osname + ") Node/" + engineV;
};

var ctx = {
  attachEvent: function () {},
  body: {
    addClass: function () {}
  },
  html: {
    attr: function () {}
  },
  '#loading': {
    remove: function () {}
  },
  jQuery: jQuery,
  $: jQuery,
  document: {
    attachEvent: function () {},
    toString: function () { return "document"; },
    ready: function (fn) {
      ctx.document._readyCallback = fn;
    },
    documentElement: {},
    createElement: function () {
      return { style: {} };
    },
    getElementsByTagName: function () {
      return [ctx.document.createElement()];
    }
  },
  XMLHttpRequest: function () {
    return this;
  },
  navigator: {
    appCodeName: "NodeJS",
    appName: "nodejs",
    appVersion: process.versions.node,
    //"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.1916.14 Safari/537.36"
    userAgent: createUserAgent(),
    language: "en"
  },
  SC: { MODULE_INFO: {}, LAZY_INSTANTIATION: {} },
  require: require,
  process: process,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  // sc_require() does get real functionality
  sc_require: function (filename) {
    // we can have two different paths
    // one is relative to the current file, the other is relative to the framework it is loaded in
    // figure out the current path
    var insideFile = context.__filename;
    var abspath;
    if (!isAbsPath(filename)) {
      if (context.__fwdir) { // inside fw
        abspath = pathlib.join(context.__fwdir, filename);
      }
      else abspath = pathlib.join(context.__dirname, filename);
    }
    else abspath = filename;

    if (filesLoadedInContext.indexOf(abspath) === -1) {
      var ret = loadFile(abspath);
      if (ret.isError) {
        if (ret.code === "ENOENT") { // file doesn't exist
          if (abspath.lastIndexOf('.js') === -1) {
            abspath = abspath + ".js";
            //util.log("trying with .js attached, because the ref doesn't have it: " + abspath);
            if (filesLoadedInContext.indexOf(abspath) === -1) {
              //util.log('file ' + abspath + " has not been loaded before, loading...");
              // try to load in place
              ret = loadFile(abspath);
              if (ret.isError) {
                util.log('inside catch block of sc_require: ' + util.inspect(ret));
                util.log('sc_require is called from ' + insideFile);
                if (ret.code === "ENOENT") {
                  util.log(" file " + abspath + " doesn't seem to exist");
                }
                else throw ret; // throw if it is something else from ENOENT
              }
              //util.log('file ' + abspath + " successfully loaded");
            }
            else {
              //util.log("didn't try to load " + abspath + " because it is already loaded");
            }
          }
        }
      }
      else return ret;
    }
    else {
      return { ok: true };
    }
  }, // add these to prevent overwriting require
  sc_resource: function () {},
  console: console
};

ctx.sc_require.filesLoadedInContext = filesLoadedInContext;

var startUp = function () {
  context = vm.createContext(ctx);
  runInContext("var window = this;", "lib/index.js#startUp");
  //loadFile(pathlib.join(__dirname, 'jquery_node.js'));
  fws.forEach(loadFramework);
  loadFile(pathlib.join(curdir, '..', 'frameworks/foundation/system/benchmark.js'));
  //runInContext("SC.Benchmark.setGlobalStartTime(new Date().getTime();");
  //util.log("filesLoaded: " + util.inspect(filesLoadedInContext));
};

startUp(); // run by default

module.exports = {
  _appContext: context,
  repl: function () {
    require('repl').start("sproutnode> ").context = context;
  },
  loadFramework: loadFramework,
  loadFile: loadFile,
  reset: function () {
    context = null;
    startUp();
  },
  runCode: runInContext,
  getPath: getPath,
  setPath: setPath,
  setPathIfChanged: setPathIfChanged,
  basePath: module
  // loadConfig: function (path) { // this will try to load a set of sc_config files
  //   //x

  // }
};

