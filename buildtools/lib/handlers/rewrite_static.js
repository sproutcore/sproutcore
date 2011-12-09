var tools = require("../tools");
require('../string');
var Handler = require("./handler").Handler;

exports.RewriteStatic = Handler.extend({
  //parameters: "'%@'",
  
  urlPrefix: '/', // as a default...
  
  file: null,
  
  handle: function(file,request,callback){
    //tools.util.log('rewriteStatic handle for ' + file.get('path'));
    this.file = file;
    callback();
  },
  
  alternativeLocations: [
    '',
    'resources', 
    'images',
    'english.lproj',
    'en.lproj'
  ],
  
  gsub: function(source, re, callback, target) {
    var result = '',
        //source = this,
        match;

    target = target || this;
    while (source.length > 0) {
      if (match = re.exec(source)) {
        result += source.slice(0, match.index);
        result += callback.call(target,match);
        source  = source.slice(match.index + match[0].length);
      } else {
        result += source;
        source = '';
      }
    }

    return result;
  },
  
  matcher: function(match){
    var fw = this.file.get('framework');
    var dirname = fw.get('url');
    //tools.log("dirname for file " + this.file.get('path') + ": " + dirname);
    var path = tools.path.join(dirname,match[3]);
    var params = this.parameters || "'%@'";
    var ret;
    
    this.alternativeLocations.some(function(loc){
      return this.file._resourceExtensions.some(function(extname){
        var alternatePath = tools.path.join(dirname, loc, match[3] + extname);
        //tools.log('garcon: trying to find alternative for ' + path + ' at ' +  alternatePath);
        //l.sys.log('garcon: dirname is ' + dirname);
        //l.sys.log('garcon: prefix is ' + prefix);
        //l.sys.log('garcon: name is ' + match[3] + extname);
        if (fw.server.files[alternatePath]) {
          //tools.log('found alternative path for ' + path + ": " + alternatePath);
          path = alternatePath;
          return true;
        } else {
          return false;
        }
      },this);
    },this);
    
    if (!this.file.getPath('framework.server').files[path]) {
      tools.util.puts('WARNING: ' + path + ' referenced in ' + this.file.get('path') + ' but was not found.');
    }
    
    //tools.log('urlPrefix is: ' + this.get('urlPrefix'));
    ret = params.replace('%@', tools.path.join(this.get('urlPrefix'), path));
    //tools.log('returning rewritten staticurl: ' + ret);
    return ret;
  },
  
  finish: function(request,r,callback){
    //tools.util.log('rewriteStatic finish for ' + this.file.get('path'));
    var re = new RegExp("(sc_static|static_url)\\(\\s*['\"](resources\/){0,1}(.+?)['\"]\\s*\\)");
    
    //r.data = r.data.gsub(re,this.matcher,this);
    r.data = this.gsub(r.data,re,this.matcher,this);
    callback(r);
  }
});

/*
sharedHandlers.add('rewriteStatic', function(format) {
  var that = {};
  
  that.format = format || "'%@'";

  that.handle = function(file, request, callback) {
    that.next.handle(file, request, function(response) {
      var re = new RegExp("(sc_static|static_url)\\(\\s*['\"](resources\/){0,1}(.+)['\"]\\s*\\)"),
          dirname = file.framework.url();
      
      response.data = response.data.gsub(re, function(match) {
        var path = l.path.join(dirname, match[3]);
        
        // if the resource was not found, try to guess its location
        if (!file.framework.server.files[path]) {
          
          var altlocs = [
            '',
            'resources', 
            'images',
            'english.lproj',
            'en.lproj'];
          // try the root folder directly, then images/
          altlocs.some(function(prefix) {
            
            // try every resources extensions (.png, .jpg, etc.)
            return File.prototype._resourceExtensions.some(function(extname) {
              var alternatePath = l.path.join(dirname, prefix, match[3] + extname);
              //l.sys.log('garcon: trying to find alternative for ' + path + ' at ' +  alternatePath);
              //l.sys.log('garcon: dirname is ' + dirname);
              //l.sys.log('garcon: prefix is ' + prefix);
              //l.sys.log('garcon: name is ' + match[3] + extname);
              if (file.framework.server.files[alternatePath]) {
                path = alternatePath;
                return true;
              } else {
                return false;
              }
            });
            
          });
                        
          if (!file.framework.server.files[path]) {
            l.sys.puts('WARNING: ' + path + ' referenced in ' + file.path + ' but was not found.');
          }
        }
        
        return that.format.replace('%@', l.path.join(sharedHandlers.urlPrefix, path));
      });
      callback(response);
    });
  };

  return that;
});
*/