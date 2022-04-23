#!/usr/bin/env node
const commander = require('commander');
const path = require('path');
const fs = require('fs');

const DEV_SKIP_DIRS = [".lproj", "apps", "tests", "dist", "node_modules"];
const PROD_SKIP_DIRS = [".lproj", "apps", "fixtures", "dist", "node_modules"];
const TEST_SKIP_DIRS = [".lproj", "apps", "tests", "dist", "node_modules"]


function sortFilesByRequirements (files, beginWithFiles, endWithFiles) {
  const ret = [];

  const beingProcessed = [];

      /*
      The recursive sort function.
      - If passed a folder path (ends in '/'), recurses all matching files.
      - If passed a file name (not a file; '.js' appended if needed), and if file hasn't already been handled
        (i.e. is in ret), recurses its dependencies and adds to ret.
      - the parent parameter describes the file where fileOrFolder is being requested in
    */
  function recurser (fileOrFolder, parent) {

    // handle folders
    if (fileOrFolder.relPath.slice(-1) === path.sep) {
      // scan all files, recursing aany matches
      const folderLen = fileOrFolder.length;
      for (let i = 0; i < files.length; i += 1) {
        if (files[i].relPath.substr(0, folderLen) === fileOrFolder.relPath) {
          recurser(files[i], parent);
        }
      }
    }
    // for files, check if it has been handled, if not, recurse its deps
    else {
      // append file extension if needed.
      if (fileOrFolder.relPath.slice(-3) !== ".js") fileOrFolder.relPath += ".js";

      if (!ret.includes(fileOrFolder)) {
        if (beingProcessed.includes(fileOrFolder)) {
          console.error(`Encountered a circular dependency: ${fileOrFolder.absPath} was required, while already being processed. Please fix before continuing.`);
          throw new Error("Circular Dep in app");
        }
        const theseDeps = fileOrFolder.deps || [];
        beingProcessed.push(fileOrFolder);
        theseDeps.forEach(d => {
          const depFile = files.find(f => f.absPath === d);
          if (!depFile) {
            console.log(`cannot find depFile for ${d} in ${fileOrFolder.relPath}`);
            return;
          }
          recurser(depFile, fileOrFolder);
        })
        beingProcessed.pop();
        ret.push(fileOrFolder);
      }
    }
  };

  // first beginWithFiles
  beginWithFiles.forEach(f => {
    recurser(f);
  });
  // next the middle files.
  const middleFiles = files.filter(f => !beginWithFiles.includes(f) && !endWithFiles.includes(f));
  middleFiles.forEach(f => {
    recurser(f);
  });

  // next end files
  endWithFiles.forEach(f => {
    recurser(f);
  })

  return ret;
}

function findAndSortFiles (directory, options) {
  // console.log(arguments);
  let skipDirs = options.testMode? TEST_SKIP_DIRS: (options.prodMode? PROD_SKIP_DIRS: DEV_SKIP_DIRS);
  let curLang = options.language || 'en';

  // collect all js files?
  const files = [];

  const stylesheets = [];

  function scanDir (dir) {
    const fileList = fs.readdirSync(dir);
    fileList.forEach(function (fn) {
      const p = path.join(dir, fn);
      let ext = path.extname(p);
      ext = (ext[0] === ".") ? ext.slice(1) : ext;
      const stat = fs.statSync(p);
      if (stat.isFile()) {
        if (p.endsWith("webpack.config.js")) return; // skip file
        if (p.endsWith(".css") || p.endsWith(".scss")) {
          return stylesheets.push({
            filename: fn, ext, absPath: p, relPath: p.replace(directory, "")
          });
        }
        const content = fs.readFileSync(p).toString();
        const deps = [];
        const re = new RegExp("sc_require\\([\"'](.*?)[\"']\\)", "g");
        let match, relpath;
        while (match = re.exec(content)) {
          relpath = match[1];
          relpath = (relpath.lastIndexOf(ext) === -1) ? `${relpath}.${ext}` : relpath;
          let abspath = path.join(directory, relpath);
          if (!deps.includes(abspath)) deps.push(abspath);
        }

        files.push({
          filename: fn,
          ext,
          absPath: p,
          relPath: p.replace(directory, ""),
          // content: fs.readFileSync() // we need the content to
          deps
        });
      }
      else if (stat.isDirectory()) {
        scanDir(p);
      }
    });
  };

  scanDir(directory);

  // need to apply the skipDirs, but only to those folders in the app project structure
  const scripts = [];
  for (let f of files) {
    const relProjDir = f.relPath.split(path.sep);
    // console.log('relProjDir', relProjDir);
    if (!skipDirs.includes(relProjDir[1])) {
      if (f.ext === "js") {
        scripts.push(f);
      }
    }
  }
  // now we do introspection of the scripts to sort

  const beginWithFiles = [];
  const corejs = scripts.find(s => s.relPath === "/core.js");
  const moduleinfojs = scripts.find(s => s.relPath === "/module_info.js");
  const langFiles = scripts.filter(s => {
    const rp = s.relPath;
    if (rp.startsWith(`/${curLang}.lproj`) || rp.startsWith("resources")) {
      if (s.filename === "strings.js") return true;
      if (s.filename === "layout.js") return true;
    }
    return false;
  });
  if (langFiles && langFiles.length) {
    langFiles.forEach(f => beginWithFiles.push(f));
  }
  if (moduleinfojs) beginWithFiles.push(moduleinfojs);
  if (corejs) beginWithFiles.push(corejs);

  const endWithFiles = scripts.filter(function (f) {
    const rp = f.relPath;
    if (rp.startsWith(curLang + ".lproj") || rp.startsWith("resources") || rp.startsWith("/resources")) {
      if (rp.endsWith("_page.js")) return true;
    }
    if (rp.startsWith("main.js") || rp.startsWith("/main.js")) return true; // also have main at the end.
    return false;
  });

  // now sort
  const sorted = sortFilesByRequirements(scripts, beginWithFiles, endWithFiles);

  let src = sorted.map(s => `require('.${s.relPath}');`).join("\n");
  if (options.includeSproutcore) src = `require('sproutcore'); \n ${src}`;

  if (stylesheets && stylesheets.length) {
    src = `
    ${src}
    \n
    // stylesheets
    ${stylesheets.map(s => `require('.${s.relPath}');`).join("\n")}`;
  }

  fs.writeFileSync(path.resolve(directory, './index.js'), src);

}
  // console.log("sort order", sorted.map(s => s.relPath));


  // there are two options here...
  // option 1 is bundling all js files into one, which makes them at least share a name space
  // option 2 is creating a entry for every file, using the path as key
  // and make them depend on all earlier files.
  // option 3 is to have a pre-something tool which generated the import layout of the project
  //

  // let src = sorted.map(s => `require('.${s.relPath}');`).join("\n");
  // src = `require('sproutcore'); \n ${src}`;

  // fslib.writeFileSync(path.resolve(__dirname, './index.js'), src);

let targetDir;

commander
  .version("0.0.1")
  .description("Create or update the webpack index.js for a SproutCore app. Use the root of the app as path")
  .arguments('<directory>')
  .option('-t, --test-mode', "create index.js for test mode")
  .option('-d, --dev-mode', "create index.js for dev mode (default)")
  .option('-p, --prod-mode', "create index.js for production mode")
  .option('-i, --include-sproutcore', "add a require line for sproutcore (default)")
  .option('-l, --language [lang]', "only include language [lang]")
  // This might go a different direction, as it might be better to do this through some kind of
  // global, which is then written into the index.js as if (!PRODMODE) { require ('') }
  .action(function (directory) {

    targetDir = path.resolve(process.cwd(), directory);
  })
  .parse(process.argv);

const opts = commander.args;

if (!targetDir) {
  commander.help();
}
else {
  console.log("creating index in ", targetDir);
  findAndSortFiles(targetDir, opts);
}
