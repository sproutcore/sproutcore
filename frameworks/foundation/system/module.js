// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

SC.LOG_MODULE_LOADING = NO;

/**
  The global module methods. See also: lib/boostrap.rhtml
*/
SC.Module = SC.Object.create(/** @scope SC.Module */ {
  /**
    Returns YES if moduleName is loaded; NO if moduleName is not loaded or
    no information is available.
    
    @param moduleName {String}
    @returns {Boolean}
  */
  moduleIsLoaded: function(moduleName) {
    var moduleInfo = SC.MODULE_INFO[moduleName] ;
    return moduleInfo ? !!moduleInfo.loaded : NO ;
  },
  
  /**
    @private
    
    Execute callback function.
  */
  _scm_moduleDidLoad: function(moduleName, target, method, args) {
    var m = method, t = target ;

    if(SC.typeOf(target) === SC.T_STRING) {
      t = SC.objectForPropertyPath(target);
    }

    if(SC.typeOf(method) === SC.T_STRING) {
      m = SC.objectForPropertyPath(method, t);
    }
    
    if(!m) {

      if(SC.LAZY_INSTANTIATION[moduleName]) {
        var lazyInfo = SC.LAZY_INSTANTIATION[moduleName];

      if (SC.LOG_MODULE_LOADING) SC.Logger.log("SC.loadModule(): Module '%@' is marked for lazy instantiation, instantiating it now…".fmt(moduleName));            
        
        for(var i=0, iLen = lazyInfo.length; i<iLen; i++) {
          try { 
            lazyInfo[i]();
          }catch(e) {
            SC.Logger.error("SC.loadModule(): Failted to lazily instatiate entry for  '%@'".fmt(moduleName));  
          }
        }
        delete SC.LAZY_INSTANTIATION[moduleName];

        if(SC.typeOf(target) === SC.T_STRING) {
          t = SC.objectForPropertyPath(target);
        }
        if(SC.typeOf(method) === SC.T_STRING) {
          m = SC.objectForPropertyPath(method, t);
        }

        if(!method) {
          throw "SC.loadModule(): could not find callback for lazily instantiated module '%@'".fmt(moduleName);

        }
      } else {
        throw "SC.loadModule(): could not find callback for '%@'".fmt(moduleName);
      }
    }

    if(!args) {
      args = [];
    }

    args.push(moduleName);
    
    var needsRunLoop = !!SC.RunLoop.currentRunLoop;
    if (needsRunLoop) {
      SC.run(function() {
        m.apply(t, args) ;
      });
    } else {
      m.apply(t, args) ;
    }    
  },
  
  tryToLoadModule: function(moduleName, target, method, args) {
    var m, t;
    
    // First see if it is already defined.
    if(SC.typeOf(target) === SC.T_STRING) {
      t = SC.objectForPropertyPath(target);
    }
    if(SC.typeOf(method) === SC.T_STRING) {
      m = SC.objectForPropertyPath(method, t);
    }

    // If the method exists, try to call it. It could have been loaded 
    // through other means but the SC.MODULE_INFO entry doesn't exist.
    if(m || SC.LAZY_INSTANTIATION[moduleName]) {
      if(SC.LOG_MODULE_LOADING) SC.Logger.log("SC.loadModule(): Module '%@' found through other means, will attempt to load…".fmt(moduleName));
      SC.MODULE_INFO[moduleName] = {loaded: YES};
      return SC.MODULE_INFO[moduleName]; 
    }
    return NO;
  },
    
  /**
    Dynamically load moduleName if not already loaded. Call the target and 
    method with any given arguments.
    
    @param moduleName {String}
    @param target {Function} 
    @param method {Function}
  */
  loadModule: function(moduleName, target, method) {
    var idx, len;
    if(method === undefined && SC.typeOf(target) === SC.T_FUNCTION) {
      method = target;
      target = null;
    }

    var moduleInfo = SC.MODULE_INFO[moduleName], callbacks, targets,
        args       = SC.A(arguments).slice(3),
        log        = SC.LOG_MODULE_LOADING;

    if (log) {
      SC.Logger.log("SC.loSC.Logger.adModule(): Attempting to load '%@'".fmt(moduleName));
    }
    
    if (!moduleInfo) {
      if (log) SC.Logger.log("SC.loadModule(): Attemping to load %@ without SC.MODULE_INFO entry… could be loaded through other means.".fmt(moduleName));
      moduleInfo = this.tryToLoadModule(moduleName, target, method, args);
    }
    

    if (!moduleInfo) {        
      throw "SC.loadModule(): could not find module '%@'".fmt(moduleName) ;
    } else if (moduleInfo.loaded) {

      if (log) SC.Logger.log("SC.loadModule(): Module '%@' already loaded, skipping.".fmt(moduleName));

      if(method) {
        // call callback immediately if we're already loaded and SC.isReady
        if (SC.isReady) {
          SC.Module._scm_moduleDidLoad(moduleName, target, method, args);
        } else {
          // queue callback for when SC is ready
          SC.ready(SC.Module, function() {
            SC.Module._scm_moduleDidLoad(moduleName, target, method, args);        
          });
        }
      }
    } else {

      if (log) SC.Logger.log("SC.loadModule(): Module '%@' is not loaded, loading now.".fmt(moduleName));

      // queue callback for later
      callbacks = moduleInfo.callbacks || [] ;

      if (method) {
        callbacks.push(function() {
          SC.Module._scm_moduleDidLoad(moduleName, target, method, args);        
        });
        moduleInfo.callbacks = callbacks ;
      }

      if (!moduleInfo.loading) {
        // load module's dependencies first
        var requires = moduleInfo.requires || [] ;
        var dependenciesMet = YES ;
        for (idx=0, len=requires.length; idx<len; ++idx) {
          var targetName = requires[idx] ;
          var targetInfo = SC.MODULE_INFO[targetName] ;
          if (!targetInfo) {
            throw "SC.loadModule(): could not find required module '%@' for module '%@'".fmt(targetName, moduleName) ;
          } else {
            if (targetInfo.loading) {
              dependenciesMet = NO ;
              break ;
            } else if (targetInfo.loaded) {
              continue ;
            } else {
              dependenciesMet = NO ;
              
              // register ourself as a dependent module (used by 
              // SC.moduleDidLoad()...)
              var dependents = targetInfo.dependents;
              if(!dependents) targetInfo.dependents = dependents = [];

              dependents.push(moduleName) ;

              if (log) SC.Logger.log("SC.loadModule(): '%@' depends on '%@', loading dependency…".fmt(moduleName, targetName));
              
              // recursively load targetName so it's own dependencies are
              // loaded first.
              SC.loadModule(targetName) ;
              break ;
            }
          }
        }
        
        if (dependenciesMet) {
          // add <script> and <link> tags to DOM for module's resources
          var styles, scripts, url, el, head, body;
          head = document.getElementsByTagName('head')[0] ;
          if (!head) head = document.documentElement ; // fix for Opera
          styles = moduleInfo.styles || [] ;
          for (idx=0, len=styles.length; idx<len; ++idx) {
            url = styles[idx] ;
            if (url.length > 0) {
              el = document.createElement('link') ;
              el.setAttribute('href', url) ;
              el.setAttribute('rel', "stylesheet") ;
              el.setAttribute('type', "text/css") ;
              head.appendChild(el) ;
            }
          }

          // Push the URLs on the the queue and then start the loading.
          var jsModuleLoadQueue = this._jsModuleLoadQueue;
          if(!jsModuleLoadQueue) this._jsModuleLoadQueue = jsModuleLoadQueue = {};
          jsModuleLoadQueue[moduleName] = [];
          var q = jsModuleLoadQueue[moduleName] ;
          scripts = moduleInfo.scripts || [] ;
          
          for (idx=0, len=scripts.length; idx<len; ++idx) {
            url = scripts[idx] ;
            if (url.length > 0) {
              q.push(url);
            }
          }
          
          // and remember that we're loading
          moduleInfo.loading = YES ;
          
          // Start the load process.
          this.scriptDidLoad(moduleName);
        }
      }
    }
  },

  /**
    Load the next script in the queue now that the caller of this function
    is complete.
    
    @param {String} moduleName The name of the module.
  */
  scriptDidLoad: function(moduleName) {
    var jsModuleLoadQueue = this._jsModuleLoadQueue;
    if(jsModuleLoadQueue) {
      var q = jsModuleLoadQueue[moduleName];
      if(q) {
        var url = q.shift();
        
        if (url) {
          if (SC.LOG_MODULE_LOADING) SC.Logger.log("SC.scriptDidLoad(): Loading next file in '%@' -> '%@'".fmt(moduleName, url));

          var el = document.createElement('script') ;
          el.setAttribute('type', "text/javascript") ;
          el.setAttribute('src', url) ;
          el.onload = function() {
            SC.Module.scriptDidLoad(moduleName);
          };
          document.body.appendChild(el) ;
        }
      }
    }
  },
  
  /** @private
    Called by module_loaded.js immediately after a framework/module is loaded.
    Any pending callbacks are called (if SC.isReady), and any dependent 
    modules which were waiting for this module to load are notified so they 
    can continue loading.
    
    @param moduleName {String} the name of the module that just loaded
  */
  moduleDidLoad: function(moduleName) {
    var moduleInfo = SC.MODULE_INFO[moduleName], 
        log        = SC.LOG_MODULE_LOADING,
        callbacks, targets ;
    if (!moduleInfo) {
      moduleInfo = SC.MODULE_INFO[moduleName] = { loaded: YES} ;
      return;
    }
    if (moduleInfo.loaded && log) {
      SC.Logger.log("SC.moduleDidLoad() called more than once for module '%@'. Skipping.".fmt(moduleName));
      return ;
    }
    
    // remember that we're loaded
    delete moduleInfo.loading ;
    moduleInfo.loaded = YES ;
    
    // call our callbacks (if SC.isReady), otherwise queue them for later
    if (SC.isReady) {
      SC.Module._invokeCallbacksForModule(moduleName) ;
    } else {
      SC.ready(SC, function() {
        SC.Module._invokeCallbacksForModule(moduleName) ;
      });
    }
    
    // for each dependent module, try and load them again...
    var dependents = moduleInfo.dependents || [] ;
    for (var idx=0, len=dependents.length; idx<len; ++idx) {
      if (log) SC.Logger.log("SC.loadModule(): Module '%@' has completed loading, loading '%@' that depended on it.".fmt(moduleName, dependents[idx]));
      SC.Module.loadModule(dependents[idx]) ;
    }
  },
  
  /** @private Invoke queued callbacks for moduleName. */
  _invokeCallbacksForModule: function(moduleName) {
    var moduleInfo = SC.MODULE_INFO[moduleName], callbacks ;
    if (!moduleInfo) return ; // shouldn't happen, but recover anyway
    
    if (SC.LOG_MODULE_LOADING) SC.Logger.log("SC.loadModule(): Module '%@' has completed loading, invoking callbacks.".fmt(moduleName));

    callbacks = moduleInfo.callbacks || [] ;
    
    SC.RunLoop.begin() ;
    for (var idx=0, len=callbacks.length; idx<len; ++idx) {
      callbacks[idx]() ;
    }
    SC.RunLoop.end() ;
  }
  
});
