/*
Webpack loader to deal with sc_static and static_url in the sproutcore code.

sc_static is used in script files
static_url is used in style sheets
It might be that these workers will be split.

The way it should work is that it finds sc_static(filename) and replace it
with new URL(relative_path_to_file, import.meta.url). The complexity is mainly
that sc_static starts searching for possible matches. It is not clear yet whether that approach
can work.
*/

const getOptions = require('loader-utils').getOptions;
const validate = require('schema-utils').validate;
const fs = require('fs');
const path = require('path');


const schema = {
  type: 'object',
  properties: {
    additionalSearchDirs: { type: "array", items: "string" }
  }
}


// we only need to do directory listings
/**
 * Search for a needle in the directory structure, returning the first match
 * @param {String} needle The relative path that should be found, can be relPath or filename
 * @param {String} currentDir The current directory which should be searched
 * @param {String} rootContext The base directory at which searching needs to stop
 * @param {Set} visited Set of visited folders, relative to the base directory
 */
function searchFile (needle, currentDir, rootContext, visited) {
  // console.log("now searching for", needle, "in", currentDir);
  const absPath = path.join(currentDir, needle);
  if (fs.existsSync(absPath)) {
    return absPath;
  }

  const currentDirContent = fs.readdirSync(currentDir, { withFileTypes: true });
  for (let e of currentDirContent.filter(e => e.isFile())) {
    if (e.name === needle) {
      return path.resolve(currentDir, e.name);
    } else if (needle === path.basename(e.name, path.extname(e.name))) { 
      return path.resolve(currentDir, e.name); // found our match
    }
  }
  
  
  visited.add(currentDir);
  // try to find by simple concat
  const nestedDirs = currentDirContent.filter(e => e.isDirectory());
  for (let d of nestedDirs) {
    const curD = path.resolve(currentDir, d.name);
    if (visited.has(curD)) continue;
    const result = searchFile(needle, curD, rootContext, visited);
    if (result) return result;
  }

  // interesting... this would be the best place to allow the upward searching, but 
  // I get max call stack issues...

  // stop searching if we land at rootContext
  if (currentDir === rootContext) return null;

  // if no result, we descend one layer
  const oneDirLower = path.resolve(currentDir, '..');
  return searchFile(needle, oneDirLower, rootContext, visited);  
}

/*
The searchFile above starts at the current context, tries the path of the file.
if it cannot find the file, it will step one directory down, to see whether it is there.
This will not find things that are in directories that have a clear sproutcore project folder layout.
Resources can be in themes for example. The question is whether we should add some "magic", as in,
test whether something like themes exists and try to search there...

*/

// it seems the best way would be to create a list of all paths, 
// which are then matched with the file... kind of find ./*
// 
// Biggest question I have: does webpack has a list of paths which could be
// reused for this? I can cache it, but that might mean that it gets outdated quickly....

// the searching need to be a bit more clever.
// the needle given can contain a colon separator. We should only search for the 
// first bit. Also, urls sometimes need to be inserted a frameworks ref...

/*
sc_static supports the : as a separator for files in a framework.
this means: if a : is found in the needle, it should regard the part before as a 
framework reference, and everything afterwards as a needle to find in the framework folder

This brings us two paths: normal file resolving and special framework resolving
*/

function searchFrameworkFile (needle, rootDir) {
  // 
  const [frameworkRef, fileRef] = needle.split(":");

  console.log("searchFrameworkFile", needle, rootDir);

  // search for frameworkRef first to find the correct folder
  const pathParts = frameworkRef.split("/");
  // resolve one part at a time
  let fwPath = rootDir;
  for (let p of pathParts) {
    if (fs.existsSync(path.join(fwPath, p))) {
      fwPath = path.join(fwPath, p);
    }
    else if (fs.existsSync(path.join(fwPath, 'frameworks', p))) {
      fwPath = path.join(fwPath, "frameworks", p);
    }
    else if (fs.existsSync(path.join(__dirname, '..', 'frameworks', p))) {
      fwPath = path.join(__dirname, '..', 'frameworks', p);
    }
    else {
      throw new Error(`cannot find framework path for ${fwPath}, ${needle}`);
    }
  }
  // we should have fwPath now
  let ret = searchUpward(fileRef, fwPath);
  if (!ret && fileRef.indexOf("_") !== -1) {
    ret = searchUpward(fileRef.replace("_", "."), fwPath);
  }
  return ret;
}



function searchUpward (needle, rootDir, logSearch = false) {
  // fast path
  const absPath = path.join(rootDir, needle);
  if (fs.existsSync(absPath)) {
    if (logSearch) console.log("direct abspath math")
    return absPath;
  }
  
  const allPaths = fs.readdirSync(rootDir, { withFileTypes: true })
    .filter(e => e.isDirectory())
    .map(p => path.join(rootDir, p.name)); // allPaths => list of absPaths
  // const visited = new Set();
  let curPath;
  while ((curPath = allPaths.shift())) {
    const absPath = path.join(curPath, needle);
    if (fs.existsSync(absPath)) {
      return absPath;
    }

    // not found directly, try matching
    for (let e of fs.readdirSync(curPath, { withFileTypes: true }).filter(e => e.isFile())) {
      if (e.name === needle) {
        return path.resolve(curPath, e.name);
      } else if (needle === path.basename(e.name, path.extname(e.name))) { 
        return path.resolve(curPath, e.name); // found our match
      }
      else if (e.name.indexOf(needle) > -1) {
        return path.resolve(curPath, e.name);
      }
    }

    const subPaths = fs.readdirSync(curPath, { withFileTypes: true })
      .filter(e => e.isDirectory());
    for (let p of subPaths) {
      allPaths.push(path.join(curPath, p.name));
    }
  }
  return false;
}



function gsub(source, re, callback) {
  var result = '',
      match;
  
  while (source.length > 0) {
    if (match = re.exec(source)) {
      result += source.slice(0, match.index);
      result += callback(match);
      source  = source.slice(match.index + match[0].length);
    } else {
      result += source;
      source = '';
    }
  }
  
  return result;
};

module.exports = function (source) {
  // the most important thing is the this reference, which gives info on the 
  // environment: the loader context

  // fast path
  if (source.indexOf("sc_static") === -1 && source.indexOf("static_url") === -1) {
    return source; 
  }

  // using lines doesn't work, as there are multiline sc_statics.
  // so we need to use the different approach
  // const scstaticRegex = /(sc_static|static_url)\(\s*['"](.+?)['"]\)/g;
  // const scstaticRegex = new RegExp("(sc_static|static_url)\\(\\s*(['\"])(resources\/){0,1}(.+?)['\"]\\s*\\)", 'g');
  const scstaticRegex = new RegExp("(sc_static|static_url)\\(\\s*['\"](resources\/){0,1}(.+?)['\"]\\s*\\)");

  const imageExts = /\.(png|gif|jpg|jpeg|svg)/;
  return gsub(source, scstaticRegex, match => {
    let target = match[3];
    // console.log("match is", target);
    // const foundPath = searchFile(target, this.context, this.rootContext, new Set());
    const foundPath = target.indexOf(":") > -1? searchFrameworkFile(target, this.rootContext) : searchUpward(target, this.rootContext);
    if (!foundPath) {
      console.log("WARNING: could not find proper sc_static replacement for", target, "at", this.resourcePath, 'root', this.rootContext);
      if (imageExts.test(path.extname(target))) {
        return `'${target}'`;
      }
      else {
        return `new URL('${target}')`;
      }
      // replace with plain new URL anyway, 
      // if (path.extname(target) === ".js") {
      //   return `new URL('${target}')`;
      // }
      // else {
      //   return `'${target}'`;
      // }
    }
    else {
      let relPath = path.relative(this.context, foundPath);
      // what we replace it with  depends on the file type...
      // a picture can be simply imported, but a script needs an url
      // console.log('target', target, 'relpath replacement', relPath);
      if (!relPath.startsWith('./') && !relPath.startsWith('../')) {
        relPath = "./" + relPath;
      }
      // there is more to consider here, as we are also used for css
      // so detect whether we are called for a css file, and adjust the output
      // accordingly...
      const cssExts = [".scss", ".css"];
      const insideCss = cssExts.indexOf(path.extname(this.resourcePath)) > -1;

      if (!insideCss) {
        if (path.extname(relPath) === ".js") {
          return `new URL('${relPath}', import.meta.url)`;
        }
        else {
          return `require('${relPath}')`;
        }  
      }
      else {
        return `url('${relPath}')`;
      }
    }
  })
  

/*
  // use this.addDependency to keep track of referred files?
  // possibly use this.rootContext as start of a search?
  // other option would be to use this.context to start searching around
  //var scstaticRegex = new RegExp("(sc_static|static_url)\\(\\s*(['\"])(resources\/){0,1}(.+?)['\"]\\s*\\)", 'g');
  const scstaticRegex = /(sc_static|static_url)\(\s*['"](.+?)['"]\)/;
  // we change it a bit to be simpler. We want the entire path, and from there on start matching.
  // it seems the best to do this in a recurring way, ie start at the current context / directory.
  // if found, take it.
  // if not found, go up one layer, recur into all directories to find the resource
  const lines = source.split("\n");
  const ret = [];
  for(let i = 0; i < lines.length; i += 1) {
    const match = scstaticRegex.exec(lines[i]);
    if (match) {
      // search for file
      const foundPath = searchFile(match[2], this.context, this.rootContext, new Set());
      // path is absolute, so we need to do a relative to the current
      if (!foundPath) {
        console.log("WARNING: could not find proper sc_static replacement for", match[2], "at", this.resourcePath);
        // replace with plain new URL anyway, 
        let replacement;
        if (path.extname(match[2]) === ".js") {
          replacement = `new URL('${match[2]}')`;
        }
        else {
          replacement = `'${match[2]}'`;
        } 
        ret[i] = lines[i].replace(scstaticRegex, replacement);  
      }
      else {
        const relPath = path.relative(this.context, foundPath);
        // what we replace it with  depends on the file type...
        // a picture can be simply imported, but a script needs an url
        let replacement;
        if (path.extname(relPath) === ".js") {
          replacement = `new URL('${relPath}', import.meta.url)`;
        }
        else {
          replacement = `require('${relPath}')`;
        }
        ret[i] = lines[i].replace(scstaticRegex, replacement);  
        // this.addDependency(foundPath)
      }
    }
    else {
      ret[i] = lines[i];
    }
    
  }

  return ret.join("\n");

  */
}; 