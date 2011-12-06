var tools = require('../tools');
var Handler = require('./handler').Handler;

exports.JSLintHandler = Handler.extend({
  
  options:{
    bitwise: true,
    eqeqeq: true,
    immed: true,
    newcap: true,
    nomen: true,
    onevar: true,
    plusplus: true,
    regexp: true,
    undef: true,
    white: true,
    rhino: true
  },
  
  printError: function(e){
    if (e) {
      tools.util.puts('WARNING: jslint error at line ' + e.line + ' character ' + e.character + ': ' + e.reason);
      tools.util.puts('         ' + (e.evidence || '').replace(/^\s*(\S*(\s+\S+)*)\s*$/, "$1"));
      tools.util.puts('');
    }
  },
  
  finish: function(request,r,callback){
    var jslint = tools.jslint;
    if(!jslint(r.data.toString(),this.options)){
      jslint.errors.forEach(this.printError,this);
    }
    callback(r);
  }
});

/*
sharedHandlers.add('jslint', function() {
  var that = {};
  
  that.handle = function(file, request, callback) {
    that.next.handle(file, request, function(response) {
      var i, e, data,
      options = {
        bitwise: true,
        eqeqeq: true,
        immed: true,
        newcap: true,
        nomen: true,
        onevar: true,
        plusplus: true,
        regexp: true,
        undef: true,
        white: true,
        rhino: true
      };
      
      if (!l.jslint(response.data.toString(), options)) {
        for (i = 0; i < l.jslint.errors.length; ++i) {
          e = l.jslint.errors[i];
          if (e) {
            l.sys.puts('WARNING: jslint error at line ' + e.line + ' character ' + e.character + ': ' + e.reason);
            l.sys.puts('         ' + (e.evidence || '').replace(/^\s*(\S*(\s+\S+)*)\s*$/, "$1"));
            l.sys.puts('');
          }
        }
      }
      
      
      callback(response);
    });
  };
  
  return that;
});
*/