/*globals global __dirname */

if(!global.SC) require('./sc/thoth_sc');
var CONSTANTS = require('constants'),
    lib_dir = __dirname,
    util = require('util'),
    http = require('http'),
    url = require('url'),
    path = require('path'),
    fs = require('fs'),
    qfs = require('./qfs'),
    cp = require('child_process'),
    jslint = require('./jslint').JSLINT,
    log = util.log,
    inspect = util.inspect;

exports.CONSTANTS = CONSTANTS;
exports.lib_dir = lib_dir;
exports.util = util;
exports.http = http;
exports.url = url;
exports.path = path;
exports.fs = fs;
exports.qfs = qfs;
exports.cp = cp;
exports.jslint = jslint;
exports.log = log;
exports.inspect = inspect;

var createDirectory = function(p){
  var prefix = path.dirname(p);
  
  if(prefix !== "." && prefix !== "/"){
    createDirectory(prefix);
  }
  // make async!
  try {
    fs.mkdirSync(p, parseInt('0755',8));
  }
  catch(e){
    //this.log('constants is ' + this.inspect(CONSTANTS));
    //log('e is ' + inspect(e));
    //log('constants is ' + inspect(CONSTANTS));
    //if(e.errno !== CONSTANTS.EEXIST) throw e;
    if(e.code !== 'EEXIST') throw e;
  }
};

var createDir = function(p,callback){
  var creator = function(dir,cb){
    fs.mkdir(p, parseInt('0755',8),cb);
  };
  
  var prefix = path.dirname(p);
  if((prefix !== '.') && (prefix !== "/")){
    createDir(prefix, function(err){
      if(err){
        //log("creator cb error is: " + inspect(err));
        if(err.code !== 'EEXIST') throw err;
      }
      callback();
      //else creator(p,callback);
    });
  } 
  else {
    creator(p,callback);
  }
};

exports.createDirectory = createDirectory;
exports.createDir = createDir;

