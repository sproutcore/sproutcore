var tools = require('../tools');
var Handler = require('./handler').Handler;

exports.FileHandler = Handler.extend({
  
  file: null,
  
  handle: function(file,request,callback){
    this.file = file;
    callback();
  },
  
  finish: function(request,r,callback){
    var me = this;
    //tools.log('trying to get content of file: ' + this.file.get('path'));
    //tools.log('url of this file is: ' + this.file.get('url'));
    //tools.log('r has content? ' + tools.inspect(r));
    this.file.content(function(err,data){
      if(err){
        //tools.log('problem reading file: ' + tools.inspect(me.file));
        //tools.log('isVirtual? ' + tools.inspect(me.file.get('isVirtual')));
        //tools.log('isFramework? ' + tools.inspect(me.file.get('isFramework')));
        throw err;
      } 
      else {
        var ret = data.length === 0? "": data;
        callback({ data: ret });
      }
    });
  }
});

/*
sharedHandlers.add('file', function() {    
  var that = {};

  that.handle = function(file, request, callback) {
    file.content(function(err, data) {
      if (err) {
        throw err;
      } else {
        callback({ data: data.length === 0 ? '' : data });
      }
    });
  };

  return that;
});
*/ 