var tools = require("../tools");
var Handler = require('./handler').Handler;

exports.WrapTest = Handler.extend({

  finish: function(request,r,callback){
    r.data = [
      '(function() {',
        'SC.filename = "__FILE__";',
        r.data,
      '})();'
    ].join('\n');
    callback(r);
  }

});

/*

sharedHandlers.add('wrapTest', function(format) {
  var that = {};
  
  that.handle = function(file, request, callback) {
    that.next.handle(file, request, function(response) {
      response.data = [
        '(function() {',
          'SC.filename = "__FILE__";',
          response.data,
        '})();'
      ].join('\n');
      
      callback(response);
    });
  };

  return that;
});
*/