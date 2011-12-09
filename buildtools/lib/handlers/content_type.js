var tools = require('../tools');
var Handler = require('./Handler').Handler;

exports.ContentType = Handler.extend({
  contentTypes: {
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.json': 'application/json',
    '.svg': 'image/svg+xml'
  },
  
  _type: null,
  
  _file: null,
  
  handle: function(file,request,callback){
    this._file = file;
    //tools.util.log('contenttype handle for ' + file.get('path'));
    this._type = file.get('extname');
    //tools.util.log('extname: ' + this._type);
    callback();
  },
  
  finish: function(request,r,callback){
    //tools.util.log('contenttype finish for ' + this._file.get('path'));
    r.contentType = this.contentTypes[this._type];
    callback(r);
  }
});

/*
sharedHandlers.add('contentType', function(contentType) {
  var that = {};
  
  that.contentType = contentType;
  
  that.contentTypes = {
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.json': 'application/json',
    '.svg': 'image/svg+xml'
  };
  
  that.handle = function(file, request, callback) {
    that.next.handle(file, request, function(response) {
      response.contentType = that.contentType === undefined ? that.contentTypes[file.extname()] : that.contentType;
      callback(response);
    });
  };

  return that;
});
*/