var tools = require('./tools');
var File = require('./file').File;

exports.Scanner = SC.Object.extend({
  framework: null,
  
  callback: null,
  
  path: null,
  
  init: function(){
    this._count = 0;
    this._countHandled = 0;
    this._files = [];
    if(this.path) this._scanPath(this.path);
  },
  
  _count: null,
  
  _countHandled: null,
  
  _files: null,
  
  _hasFinishedScanning: function(){
    if(this._count === this._countHandled){
      if(this.callback) this.callback(this._files);
    }
  },
  
  _scanPath: function(path){
    
    var me = this;
    var f = function(err,stats){
      me._countHandled += 1;
      if(err) throw err;

      if(stats.isDirectory()){
        me._handledir(path);
      }
      else {
        if (!me.framework.shouldExcludeFile(path)) {
          me._files.push(File.create({ path: path, framework: me.framework }));
        }
      }
      me._hasFinishedScanning();
    };
    
    this._count += 1;
    tools.fs.stat(path,f);
  },

  
  _handledir: function(path){
    this._count += 1;
    var me = this;
    var f = function(err,subpaths){
      var i,len,newpath;
      me._countHandled +=1;
      if(err) throw err;
      for(i=0,len=subpaths.length;i<len;i+=1){
        if(subpaths[i][0] !== "."){ // first character of string
          newpath = tools.path.join(path,subpaths[i]);
          me._scanPath(newpath);
        }
      }
      me._hasFinishedScanning();
    };
    
    tools.fs.readdir(path,f); // start reading dir
  }
});

/*

Framework.prototype.scanFiles = function(callback) {
  var Scanner = function(framework, callback) {
    var that = this;
    
    that.count = 0;
    
    that.files = [];
        
    that.callbackIfDone = function() {
      if (that.count <= 0) callback(that.files);
    };

    that.scan = function(path) {      
      that.count += 1;
      
      l.fs.stat(path, function(err, stats) {
        that.count -= 1;
        
        if (err) throw err;
        
        if (stats.isDirectory()) {
          that.count += 1;
          l.fs.readdir(path, function(err, subpaths) {
            that.count -= 1;
            
            if (err) throw err;
            
            subpaths.forEach(function(subpath) {
              if (subpath[0] !== '.') {
                that.scan(l.path.join(path, subpath));
              }
            });
            
            that.callbackIfDone();
          });
          
        } else {
          if (!framework.shouldExcludeFile(path)) {
            that.files.push(new File({ path: path, framework: framework }));
          }
        }

        that.callbackIfDone();
      });
    };
  };
  
  return new Scanner(this, callback).scan(this.path);
};
*/