var tools = require("../tools");
var Handler = require('./handler').Handler;

exports.IfModifiedSince = Handler.extend({

  _count: 0,
  
  _numFiles: 0,
  
  maxMtime: 0,
  
  _cb: null,
  
  _file: null,
  
  handle: function(file,request,callback){
    var numFiles, count = 0;
    this._file = file;
    //tools.util.log('ifModifiedSince handle for ' + file.get('path'));
    var files = file.get('isDirectory')? file.children: [file];
    numFiles = files.length;
    //tools.log('number of files to check for modification: ' + numFiles);
    //this._cb = callback;
    if(numFiles<1){
      callback();
      return;
    }
    files.forEach(function(file){
      var me = this;
      if(file.get('isVirtual')){
        count += 1;
        //tools.log('virtual file: count: ' + count);
        if(count === numFiles) callback();
      }
      else {
        tools.fs.stat(file.get('path'), function(err, stats) {
          count += 1;
          //tools.log('non virtual file, count: ' + count);
          if(err) tools.util.puts('WARNING: ' + err.message);
          else {
            if (stats.mtime > me.maxMtime) me.maxMtime = stats.mtime;
          }
          if(count === numFiles) callback();
        });
      }
    },this);
  },
  
  finish: function(request,r,callback){
    //tools.util.log('ifModifiedSince finish for ' + this._file.get('path'));
    if (!request || request.headers['if-modified-since'] === undefined || this.maxMtime > Date.parse(request.headers['if-modified-since'])) {
      r.lastModified = this.maxMtime === 0 ? undefined : this.maxMtime;
    } else r.status = 304;
    callback(r);
  }
});

/*

sharedHandlers.add('ifModifiedSince', function() {
  var that = {};
  
  that.handle = function(file, request, callback) {
    var files, scanner;
    
    var Scanner = function(files, callback) {
      var that = this;
      
      that.count = files.length;
      
      that.maxMtime = 0;
      
      that.callbackIfDone = function() {
        if (that.count <= 0) callback(that.maxMtime);
      };
      
      that.scan = function() {
        files.forEach(function(file) {
          if (file.isVirtual) {
            that.count -= 1;
            that.callbackIfDone();
          } else {
            l.fs.stat(file.path, function(err, stats) {
              that.count -= 1;
              if (err) {
                l.sys.puts('WARNING: ' + err.message);
                that.callbackIfDone();
              } else {
                if (stats.mtime > that.maxMtime) {
                  that.maxMtime = stats.mtime;
                }
                that.callbackIfDone();
              }
            });
          }
        });
        that.callbackIfDone();
      };
    };
    
    if (file.isDirectory()) {
      files = file.children;
    } else {
      files = [file];
    }
    
    scanner = new Scanner(files, function(mtime) {
      if (!request || request.headers['if-modified-since'] === undefined || mtime > Date.parse(request.headers['if-modified-since'])) {
        that.next.handle(file, request, function(response) {
          response.lastModified = mtime === 0 ? undefined : mtime;
          callback(response);
        });
      } else {
        callback({ status: 304 });
      }
    });
    
    scanner.scan();
  };

  return that;
});
*/