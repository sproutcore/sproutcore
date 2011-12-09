/*globals process*/
var fs = require('fs'),
    tools = require('./tools');

exports.File = SC.Object.extend({
  path: null,
  framework: null,
  handler: null,
  children: null,
  isHtml: false,
  isVirtual: false,
  _resourceExtensions: ".png .jpg .jpeg .gif .svg".w(),
  
  extname: function(){
    return tools.path.extname(this.path);
  }.property(),
  
  url: function(){
    if(!this.framework.urlFor){
      tools.log('this is a problem... a file without a proper framework ref... ' + this.get('path'));
      tools.log('content of framework: ' + tools.inspect(this.framework));
    }
    else return this.framework.urlFor(this.path);
  }.property(),
  
  language: function(){
    var match = /([a-z]+)\.lproj\//.exec(this.path);
    return (match === null)? null : match[1];
  }.property().cacheable(),
  
  isStylesheet: function(){
    return this.get('extname') === '.css';
  }.property('extname').cacheable(),
  
  isScript: function(){
    //    return this.get('extname') === '.js' && !/tests\//.test(this.path);
    //return /^\.(js|handlebars)$/.test(this.get('extname')) && !/tests\//.test(this.path);
    var ext = this.get('extname');
    return (((ext === '.js') || (ext === '.handlebars')) && !/tests\//.test(this.get('path')));
  }.property('extname').cacheable(),
  
  isTest: function(){
    return this.get('extname') === '.js' && /tests\//.test(this.path);
  }.property('extname').cacheable(),
  
  isResource: function(){
    var ext = this.get('extname');
    var f = function(extension){ return extension === ext; };
    return this._resourceExtensions.some(f);
  }.property('extname').cacheable(),
  
  isDirectory: function(){
    return this.get('children') !== null;
  }.property('children').cacheable(),
  
  savePath: function(){
    return this.get('isHtml')? this.get('url') + ".html": this.get('url');
  }.property('isHtml').cacheable(),
  
  content: function(callback){
    tools.qfs.readFile(this.get('path'),callback);
  }
  
});
/*
var self = this,
    l = {},
    File;



self.File = function(options) {
  var key;
  
  this.path = null;
  this.framework = null;
  this.handler = null;
  this.children = null;
  this.isHtml = false;
  this.isVirtual = false;
  
  for (key in options) {
    this[key] = options[key];
  }
};

File = self.File;

File.prototype.extname = function() {
  if (this._extname === undefined) {
    this._extname = l.path.extname(this.path);
  }
  
  return this._extname;
};

File.prototype.url = function() {
  if (this._url === undefined) {
    this._url = this.framework.urlFor(this.path);
  }
  
  return this._url;
};

File.prototype.language = function() {
  var match;
  
  if (this._language === undefined) {
    match = /([a-z]+)\.lproj\//.exec(this.path);
    this._language = match === null ? null : match[1];
  }
  
  return this._language;
};

File.prototype.isStylesheet = function() {
  return this.extname() === '.css';
};

File.prototype.isScript = function() {
  return this.extname() === '.js' && !/tests\//.test(this.path);
};

File.prototype.isTest = function() {
  return this.extname() === '.js' && /tests\//.test(this.path);
};

File.resourceExtensions = ['.png', '.jpg', '.gif', '.svg'];

File.prototype.isResource = function() {
  return File.resourceExtensions.some(function(extname) {
    return extname === this.extname();
  }, this);
};

File.prototype.isDirectory = function() {
  return this.children !== null;
};

File.prototype.savePath = function() {
  if (this.isHtml === true) {
    return this.url() + '.html';
  } else {
    return this.url();
  }
};

File.prototype.content = function(callback) {
  l.qfs.readFile(this.path, callback);
};

File.createDirectory = function(path) {
  var prefix = l.path.dirname(path),
      suffix;
  
  if (prefix !== '.' && prefix !== '/') {
    File.createDirectory(prefix);
  }
  
  try {
    l.fs.mkdirSync(path, parseInt('0755', 8));
  } catch (e) {
    if (e.errno !== l.CONSTANTS.EEXIST) throw e;
  }
};
*/