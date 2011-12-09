var tools = require('../tools');
var handlers = {
  'contentType': require('./content_type').ContentType,
  'cache': require('./cache').Cache,
  'ifModifiedSince': require('./ifModifiedSince').IfModifiedSince,
  'minify': require('./minify').Minify,
  'rewriteFile': require('./rewrite_file').RewriteFile,
  'rewriteSuper': require('./rewrite_super').RewriteSuper,
  'rewriteStatic': require('./rewrite_static').RewriteStatic,
  'wrapTest': require('./wrap_test').WrapTest,
  'join': require('./join').Join,
  'jslint': require('./jslint').JSLintHandler,
  'symlink': require('./symlink').SymlinkHandler,
  'file': require('./file').FileHandler,
  'handlebars': require('./handlebars').Handlebars
}; 

exports.HandlerSet = SC.Object.extend({
  
  _handlerClasses: handlers,
  
  handlers: null,
  
  handlerList: null,
  
  urlPrefix: null,
  
  init: function(){
    arguments.callee.base.apply(this,arguments);
    if(this.handlerList) this.build(this.handlerList);
  },
  
  build: function(list){
    var f = function(name){
      var k, params;
      if(name instanceof Array){
        // we have parameters
        k = name[0];
        params = name[1];
      }
      else k = name;
      
      k = this._handlerClasses[k];
      // it would be nice to also have the file on which the handler set is put
      if(k) k = k.create({ urlPrefix: this.urlPrefix, parameters: params }); 
      return k;
    };
    this.handlers = list.map(f,this);
    return this;
  },
  
  handle: function(file,request,callback){
    // work through the entire list of handlers
    var count = 0;
    var result = {};
    var me = this;
    var numHandlers = this.handlers.length;
    
    //tools.util.log('about to process ' + file.get('path'));
    //tools.util.log('handlerList: ' + this.handlerList);
    
    var f = function(stop){
      count += 1; // make sure we have +1, so the wrap up starts at the right index
      if((count < numHandlers) && !stop){ // if stop is given, it should start wrapping up immediately
        //tools.util.log('about to call handle ' + me.handlerList[count]);
        me.handlers[count].handle(file,request,f);
      }
      else wrapup(result);
    };
    
    var wrapup = function(ret){
      // now walk backwards 
      count -= 1;
      //tools.util.log('wrapping up ' + count + " handlers...");
      if(count >= 0) {
        //tools.util.log('wrapping up handler: ' + me.handlerList[count]);
        me.handlers[count].finish(request,ret,wrapup);
      } 
      else {
        //tools.util.log(' about to send back the content: ' + ret.data);
        callback(ret);
      } 
    };
    
    //tools.log("start handlers with handler " + this.handlerList[count]);
    this.handlers[count].handle(file,request,f);
    //wrapup();
  }
  
});