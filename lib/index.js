/*jshint node:true */

// a simple way to include sproutcore as a nodejs module
// which will do the following:
// - given a framework dir, descend into it, exclude stuff which should not be taken
// - load every file, wrapping it with some extra code, and execute it using nodejs' vm
// - doesn't export anything currently, but does give a repl with
//
// Currently only runtime, because core_foundation causes trouble.


//var fws = ["frameworks/runtime", "frameworks/core_foundation"];
var fws = ["frameworks/runtime"];
var dirsToSkip = ["tests", "views", "panes", "protocols", "child_view_layouts", "debug"];

var fslib = require('fs');
var pathlib = require('path');
var util = require('util');

// external, because we need it for loadFile too
var replaceSuper = function (c) {
  return c.replace(/sc_super\(\)/g, "arguments.callee.base.apply(this,arguments)");
};

// we do stuff sync as it is startup anyway
// scanDir both scans the directory recursively, as well as load the contents of files
// parse sc_super and check for dependencies
var scanDir = function (dir, baseDir, files, sortOrder) {
  var ret = [];
  var fileList = fslib.readdirSync(dir);
  fileList.forEach(function (fn) {
    var c, match, relpath;
    var isJS = pathlib.extname(fn) === ".js";
    var p = pathlib.join(dir, fn);
    var stat = fslib.statSync(p);
    var re = new RegExp("sc_require\\([\"'](.*?)[\"']\\)", "g");
    if (stat.isFile() && isJS) {
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

var context;
var vm  = require("vm");
var ctx = {
  SC: {},
  require: require,
  sc_require: function () {}, // add these to prevent overwriting require
  sc_resource: function () {}
};

var loadFramework = function (fw) {
  var files = {},
      order = {};
  files[fw] = scanDir(fw, fw, files, order);
  files[fw] = sortFilesByRequirements(files[fw], [pathlib.join(fw, "core.js")], [], order);
  files[fw].forEach(function (f) {
    var c = files[f];
    vm.runInContext(c, context, f);
    console.log('successfully ran ' + f);
  });
};

var loadFile = function (file) { // could be sc_require...
  // like require but then not node
  var c = fslib.readFileSync(file);
  c = replaceSuper(c);
  vm.runInContext(c, context, file);
};

var startUp = function () {
  context = vm.createContext(ctx);
  vm.runInContext("var window = this; ", context, "lib/index.js_startUp");
  fws.forEach(loadFramework);
};

startUp(); // run by default

module.exports = {
  _appContext: context,
  repl: function () {
    require('repl').start("> ").context = context;
  },
  loadFramework: loadFramework,
  loadFile: loadFile,
  reset: function () {
    context = null;
    startUp();
  }
};