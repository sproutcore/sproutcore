var tools = require('../tools');
var Handler = require('./handler').Handler;

exports.SymlinkHandler = Handler.extend({
  
  file: null,
  
  handle: function(file,request,callback){
    this.file = file;
    callback();
  },
  
  finish: function(request,r,callback){
    this.file.symlink.handler.handle(this.file.symlink,request,callback);
  }
});

/*
sharedHandlers.add('symlink', function() {    
  var that = {};

  that.handle = function(file, request, callback) {
    file.symlink.handler.handle(file.symlink, request, callback);
  };

  return that;
});
*/