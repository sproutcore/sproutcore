// implementation of a webpack loader to replace
// a few things...
// this will work for sc_super() most likely.
// for sc_static and static_url it is going to be more complex.
// as it seems that there is no data on the loader available on other
// resources...

// import { getOptions } from 'loader-utils';
// import { validate } from 'schema-utils';
const getOptions = require('loader-utils').getOptions;
const validate = require('schema-utils').validate;

const schema = {
  type: 'object',
  properties: {
    useOldStyle: { type: 'boolean' },
    insertImport: { type: 'boolean'}
  }
}

function replace_sc_super_oldStyle (source, filename) {
  if (source && source.replace) {
    return source.replace(/sc_super\(\)/g, 'arguments.callee.base.apply(this,arguments)');
  }
  else return source;
}

/**
 *
 * @param {String} source
 */
function replace_sc_super_es5strict (source, filename) {

  // bit more extensive edit: provide a named function
  const lines = source.split("\n");
  var fnDefRegExp = /([a-zA-Z_]+)\s*[:=]\s*function\s*([a-zA-Z_]*)?\s*\(([\s\S]*?)\)\s*{?/;
  const shortFnDefRegExp = /([a-zA-Z_]+)\s*\(([\s\S]*?)\)\s*{/
  let insideComment = false;
  const scsupersearch = "sc_super()";
  const ret = [];

  const SCSUPERFOUND = source.indexOf("sc_super") !== -1;
  let REPLACED = false;
  let branch = 0;

  lines.forEach( (l, l_i) => {
    if (l.indexOf("/*") > -1 && l.indexOf("*/") === -1){
      insideComment = true;
      ret.push(l);
    }
    else if (l.indexOf("*/") > -1 && l.indexOf("/*") === -1) {
      insideComment = false;
      ret.push(l);
    }
    else if (insideComment) {
      if (l.indexOf("sc_super") > -1) {
        // console.log("found sc_super, but in comment", filename, l_i);
      }
      ret.push(l);
    }
    else {
      const superIndex = l.indexOf(scsupersearch);
      // if (superIndex === -1 && l.includes("_super")) {
      //   // perhaps do something at some point, for now a no-op
      // }
      // console.log('superIndex', superIndex);
      if (superIndex > -1 && l.indexOf("//") !== -1 && l.indexOf("//") < superIndex) {
        // console.log('sc_super in line comment', filename, l_i);
        ret.push(l); // in comment, skip
      }
      else if (superIndex === -1) {
        ret.push(l); // not found
      }
      else {
        // console.log('found sc_super() on line', l_i, "in file", filename);
        //sc_super found
        let i = l_i; // we do that here, as i is needed for outside the loop as well
        // walk back to the first function definition
        for (i = l_i; i > 0; i -= 1) {
          let curLine = ret[i]; // take from ret for walking back, otherwise we do the same replacement too many times.
          let match = fnDefRegExp.exec(curLine);
          let shortMatch = shortFnDefRegExp.exec(curLine);
          let replacement;
          if (match) {
            // we need to detect whether the function def is anonymous, and if it is, make it named.
            // then replace the sc_super with [name].base.apply(this, arguments);
            // if it isn't, we need to use the name given
            if (!match[2]) {
              if (ret[i] === undefined && i === l_i) {
                l = l.replace("function", `function ${match[1]}`);
              }
              else if (ret[i]) {
                // console.log('replacing function definition ', ret[i], 'in file', filename, 'on line', i);
                // console.log('match for that line was')
                ret[i] = ret[i].replace("function", `function ${match[1]}`);
              }
              replacement = `${match[1]}.base.apply(this, arguments)`;
            }
            else {
              replacement = `${match[2]}.base.apply(this, arguments)`;
            }
            ret.push(l.replace(/sc_super\s*\(\)/g, replacement));
            REPLACED = true;
            break;
          }
          if (shortMatch) {
            if (shortMatch[1] === "if") continue; // don't take if which has the same syntax
            if (shortMatch[1] === "switch") continue;
            if (shortMatch[1] === 'for') continue;
            if (shortMatch[1] === 'catch') continue;
            if (shortMatch[1] === 'exec') continue;
            // we don't have to rewrite the short fn, as it is already named
            // simply take the name and use as is
            // and it turns out that shorthand methods are NOT named functions...
            // big question is why, because it makes things (such as recursion) much more complex.
            replacement = `this.${shortMatch[1]}.base.apply(this, arguments)`;
            ret.push(l.replace(/sc_super\s*\(\)/g, replacement));
            REPLACED = true;
            break;
          }
        }
        if (i === 0) {
          console.log("WARNING: sc_super_loader: cannot find function definition for sc_super. Is it used outside an object literal?"); // needs file indication
        }
      }
    }
  });

  const lastLine = ret[ret.length - 1];
  const scsuperIndex = lastLine.indexOf(/sc_super\s*\(\)/);
  if (scsuperIndex !== -1) {
    if (!insideComment) {
      if (lastLine.indexOf("//") === -1 || lastLine.indexOf("//") > scsuperIndex) {
        console.log("sc_super has not been replaced in line ... in file ...");
      }
    }
  }

  // if (SCSUPERFOUND && !REPLACED) throw new Error("sc_super found but not replaced in " + filename);
  // if (SCSUPERFOUND && !REPLACED) console.log(`sc_super found in file ${filename} but not replaced`);

  return ret.join("\n");
}


function handleRunModeComments (src, buildMode) {

  let startregex;

  switch(buildMode) {
    case "development" || "test":
      startregex = /@if\s?\(build\)/;
      break;
    case "production":
      startregex = /@if\s?\(debug\)/;
      break;
  }

  //var endregex = /@endif/;
  var lines = src.split("\n"), ret = [];
  var insideIfDebug;
  lines.forEach(function (line) {
    if (line.search(startregex) > -1) {
      insideIfDebug = true;
    }
    if (!insideIfDebug) ret.push(line);
    if (insideIfDebug) {
      if (line.indexOf("@end") > -1) insideIfDebug = false; // catches both @end and @endif
    }
  });
  return ret.join("\n");
}


module.exports = function (source) {
  const options = getOptions(this);
  validate(schema, options, {
    name: 'sc_super_loader',
    baseDataPath: 'options'
  });

  // console.log("this inside sc_super_loader", Object.keys(this));
  // console.log('resourcePath', this.resourcePath);
  const filename = this.resourcePath;

  source = handleRunModeComments(source, "development"); // static for now

  /**@type {string} */

  if (/sc_super\(\s*[^\)\s]+\s*\)/.test(source)) {
    throw new Error("ERROR in %@:  sc_super() should not be called with arguments. Modify the arguments array instead.");
  }

  let src;
  if (options.useOldStyle) {
    src = replace_sc_super_oldStyle(source, filename);
  }
  else {
    src = replace_sc_super_es5strict(source, filename);
  }
  if (options.insertImport) {
    // console.log("INSERTING_IMPORT");
    src = `require('sproutcore');\n ${src}`;
  }
  return src;
}

