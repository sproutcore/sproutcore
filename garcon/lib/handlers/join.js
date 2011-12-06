var tools = require('../tools');
var Handler = require("./handler").Handler;
var HandlerSet, Join;

// the HandlerSet code is included and adapted a bit for the join handler
// because we want to be able to have a handler set, but at the same time
// a circular dependency between join and handler_set would make either one
// undefined...


var handlers = {
  // 'contentType': require('./content_type').ContentType,
  // 'cache': require('./cache').Cache,
  // 'ifModifiedSince': require('./ifModifiedSince').IfModifiedSince,
  // 'minify': require('./minify').Minify,
  // 'rewriteFile': require('./rewrite_file').RewriteFile,
  // 'rewriteSuper': require('./rewrite_super').RewriteSuper,
  // 'rewriteStatic': require('./rewrite_static').RewriteStatic,
  // 'wrapTest': require('./wrap_test').WrapTest,
  // 'join': Join,
  // 'jslint': require('./jslint').JSLintHandler,
  // 'symlink': require('./symlink').SymlinkHandler,
  'handlebars': require('./handlebars').Handlebars,
  'file': require('./file').FileHandler
}; 

HandlerSet = SC.Object.extend({
  
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
        //tools.util.log('about to call handlenumber ' + count);
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
        //tools.util.log(' about to send back the content: ' + result.data);
        callback(ret);
      } 
    };
    
    this.handlers[0].handle(file,request,f);
    //wrapup();
  }
  
});

Join = Handler.extend({
  
  data: null,
  
  handle: function(file,request,callback){
    //tools.log('join handle of ' + file.get('path'));
    var data = [], 
        count = 0,
        me = this,
        files, numfiles;
        
    var isDone = function(){
      count += 1;
      if(count === numfiles){
        me.data = data.join("\n");
        callback(true);
      }
    };
            
    var callHandlerSet = function(f,i){
      // three options: or the file is real, or is virtual and has content, or is virtual and has no content
      // when the file is real, we just read it, otherwise it has handlers, and we can call them instead...
      
      var fh = HandlerSet.create({ handlerList: 'handlebars file'.w() });
      
      // tools.log('  file inspected: ' + f.get('path'));
      // tools.log('    file has handler? ' + !!f.handler);
      // if(!!f.handler) tools.log('    files handler list is ' + f.handler.handlerList);
      // tools.log('    file has children? ' + !!f.children);
      
      if(f.children){
        f.handler.handle(f,request,function(d){
          data[i] = d.data;
          isDone();
        });
      }
      else {
        fh.handle(f, request, function(d){
          data[i] = d.data;
          isDone();
        });                
      }
    };
    
    //tools.log('file inspected: ' + tools.inspect(file));
    // tools.log('file inspected: ' + file.get('path'));
    // tools.log('  file has handler? ' + !!file.handler);
    // tools.log('  file has children? ' + !!file.children);
    files = file.children? file.children: [file];
    numfiles = files.length;
    if(numfiles > 0){
      //tools.log('numfiles in join is ' + numfiles);
      files.forEach(callHandlerSet,this); //callback in callHandlerSet
    } 
    else {
      this.data = '';
      callback();
    }
  },
  
  finish: function(request,r,callback){
    r.data = this.data;
    //tools.log('finish of join handler, returning with data: ' + tools.inspect(r));
    callback(r);
  }
});

exports.Join = Join;

/*
sharedHandlers.add('join', function() {
  var that = {};
    
  that.handle = function(file, request, callback) {
    var data = [],
        files, count;
        
    if (file.children === null) {
      files = [file];
    } else {
      files = file.children;
    }
    
    count = files.length;
    
    if (count === 0) {
      callback({ data: '' });
      
    } else {
      files.forEach(function(file, i) {
        var next = that.next ? that.next : file.handler;
                
        next.handle(file, request, function(d) {
          data[i] = d.data;
          count -= 1;
          if (count === 0) {
            callback({ data: data.join('\n') });
          }
        });
      });
    }
  };

  return that;
});
*/