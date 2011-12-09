var tools = require('../tools');
var Handler = require('./handler').Handler;

exports.RewriteFile = Handler.extend({
  file: null,
  
  handle: function(file,request,callback){
    if(!this.file) this.file = file;
    callback();
  },
  
  finish: function(request,r,callback){
    r.data = r.data.replace(/__FILE__/g, this.file.get('url'));
    callback(r);
  }
});

/*
sharedHandlers.add('rewriteFile', function(format) {
  var that = {};
  
  that.handle = function(file, request, callback) {
    that.next.handle(file, request, function(response) {
      response.data = response.data.replace(/__FILE__/g, file.url());
      callback(response);
    });
  };

  return that;
});
*/