/*globals __dirname */
var tools = require('../tools');
var Handler = require('./handler').Handler;

exports.Minify = Handler.extend({
  
  _type: null,
  
  handle: function(file,request,callback){
    var isCss = file.get('isStylesheet');
    var isJs = file.get('isScript');
    if(isCss) this._type = "css";
    if(isJs) this._type = "js";

    callback();
  },
  
  finish: function(request,r,callback){
    var data;
    var args = ['-jar', tools.path.join(__dirname, '../..', 'bin', 'yuicompressor-2.4.2.jar'), '--type', this._type];
    
    var min = tools.cp.spawn('java',args);
    min.stdout.addListener('data', function(newData) {
      data += newData;
    });
    
    min.stderr.addListener('data', function(data) {
      tools.util.print(data);
    });
    
    min.addListener('exit', function(code) {        
      if(code !== 0) tools.util.puts('ERROR: Minifier exited with code ' + code);
      else r.data = data; // if success, replace data
      callback(r); // always call callback 
    });
    
    min.stdin.write(r.data); // now put in the original file data
    min.stdin.end(); // start the procedure
  }
  
});

/*

sharedHandlers.add('minify', function() {
  var that = {};
  
  that.handle = function(file, request, callback) {
    that.next.handle(file, request, function(response) {
      var data = '',
          min, fileType;
      
      if (file.isStylesheet()) fileType = 'css';
      if (file.isScript()) fileType = 'js';
      min = l.spawn('java', ['-jar', l.path.join(__dirname, '..', 'bin', 'yuicompressor-2.4.2.jar'), '--type', fileType]);
      
      min.stdout.addListener('data', function(newData) {
        data += newData;
      });
      
      min.stderr.addListener('data', function(data) {
        l.sys.print(data);
      });
      
      min.addListener('exit', function(code) {        
        if (code !== 0) {
          l.sys.puts('ERROR: Minifier exited with code ' + code);
        } else {
          response.data = data;
        }
        
        callback(response);
      });
      
      min.stdin.write(response.data);
      min.stdin.end();
    });
  };
  
  return that;
});
*/