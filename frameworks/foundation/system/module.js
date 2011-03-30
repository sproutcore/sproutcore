// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*jslint evil:true */

SC.LOG_MODULE_LOADING = YES;

/**
  SC.Module is responsible for dynamically loading in JavaScript and other
  resources. These packages of code and resources, called bundles, can be
  loaded by your application once it has finished loading, allowing you to
  reduce the time taken for it to launch.

  You can explicitly load a module by calling SC.Module.loadModule(), or you
  can mark a module as prefetched in your Buildfile. In those cases,
  SproutCore will automatically start to load the bundle once the application
  has loaded and the user has remained idle for more than one second.
*/

SC.Module = SC.Object.create(/** @scope SC.Module */ {

  /**
    Returns YES if the module is ready; NO if it is not loaded or its
    dependencies have not yet loaded.

    @param {String} moduleName the name of the module to check
    @returns {Boolean}
  */
  isModuleReady: function(moduleName) {
    var moduleInfo = SC.MODULE_INFO[moduleName] ;
    return moduleInfo ? !!moduleInfo.isReady : NO ;
  },

  /**
    Asynchronously loads a module if it is not already loaded. If you pass
    a function, or a target and action, it will be called once the module
    has finished loading.

    If the module you request has dependencies (as specified in the Buildfile)
    that are not yet loaded, it will load them first before executing the
    requested module.

    @param moduleName {String}
    @param target {Function}
    @param method {Function}
    @returns {Boolean} YES if already loaded, NO otherwise
  */
  loadModule: function(moduleName, target, method) {
    var module = SC.MODULE_INFO[moduleName], callbacks, targets;
    var args   = SC.A(arguments).slice(3);
    var log    = SC.LOG_MODULE_LOADING;
    var idx, len;

    // Treat the first parameter as the callback if the target is a function and there is
    // no method supplied.
    if (method === undefined && SC.typeOf(target) === SC.T_FUNCTION) {
      method = target;
      target = null;
    }

    if (log) {
      SC.Logger.log("SC.Module: Attempting to load '%@'".fmt(moduleName));
    }

    // If we couldn't find anything in the SC.MODULE_INFO hash, we don't have any record of the
    // requested module.
    if (!module) {
      throw "SC.Module: could not find module '%@'".fmt(moduleName) ;
    }

    // If this module was in the middle of being prefetched, we now need to
    // execute it immediately when it loads.
    module.isPrefetching = NO;

    // If the module is already loaded, execute the callback immediately if SproutCore is loaded,
    // or else as soon as SC has finished loading.
    if (module.isLoaded) {
      if (log) SC.Logger.log("SC.Module: Module '%@' already loaded.".fmt(moduleName));

      // If the module has finished loading and we have the string
      // representation, try to evaluate it now.
      if (module.source) {
        if (log) SC.Logger.log("SC.Module: Evaluating JavaScript for module '%@'.".fmt(moduleName));
        this._evaluateStringLoadedModule(module);
      }

      if (method) {
        if (SC.isReady) {
          SC.Module._invokeCallback(moduleName, target, method, args);
        } else {
          // Queue callback for when SC has finished loading.
          SC.ready(SC.Module, function() {
            SC.Module._invokeCallback(moduleName, target, method, args);
          });
        }
      }

      return YES;
    }
    // The module is not yet loaded, so register the callback and, if necessary, begin loading
    // the code.
    else {
      if (log) SC.Logger.log("SC.Module: Module '%@' is not loaded, loading now.".fmt(moduleName));

      // If this method is called more than once for the same module before it is finished
      // loading, we might have multiple callbacks that need to be executed once it loads.

      // Retrieve array of callbacks from MODULE_INFO hash.
      callbacks = module.callbacks || [] ;

      if (method) {
        callbacks.push(function() {
          SC.Module._invokeCallback(moduleName, target, method, args);
        });
      }

      module.callbacks = callbacks;

      // If this is the first time the module has been requested, determine its dependencies
      // and begin loading them as well as the JavaScript for this module.
      if (!module.isLoading) {
        this._loadDependenciesForModule(moduleName);
        this._loadCSSForModule(moduleName);
        this._loadJavaScriptForModule(moduleName);
        module.isLoading = YES;
      }

      return NO;
    }
  },

  /**
    @private

    Loads a module in string form. If you prefetch a module, its source will
    be held as a string in memory until SC.Module.loadModule() is called, at
    which time its JavaScript will be evaluated.

    You shouldn't call this method directly; instead, mark modules as
    prefetched in your Buildfile. SproutCore will automatically prefetch those
    modules once your application has loaded and the user is idle.

    @param {String} moduleName the name of the module to prefetch
  */
  prefetchModule: function(moduleName) {
    var module = SC.MODULE_INFO[moduleName];

    if (module.isLoading || module.isLoaded) return;

    if (SC.LOG_MODULE_LOADING) SC.Logger.log("SC.Module: Prefetching module '%@'.".fmt(moduleName));
    this._loadDependenciesForModule(moduleName);
    this._loadCSSForModule(moduleName);
    this._loadJavaScriptForModule(moduleName);
    module.isLoading = YES;
    module.isPrefetching = YES;
  },

  // ..........................................................
  // INTERNAL SUPPORT
  //

  /** @private
    If a module is marked for lazy instantiation, this method will execute the closure and call
    any registered callbacks.
  */
  _executeLazilyInstantiatedModule: function(moduleName, targetName, methodName){
    var lazyInfo =  SC.LAZY_INSTANTIATION[moduleName];
    var target;
    var method;
    var idx, len;

    if (SC.LOG_MODULE_LOADING) {
      SC.Logger.log("SC.Module: Module '%@' is marked for lazy instantiation, instantiating it now…".fmt(moduleName));
    }

    len = lazyInfo.length;
    for (idx = 0; idx < len; idx++) {
      // Iterate through each function associated with this module, and attempt to execute it.
      try {
        lazyInfo[idx]();
      } catch(e) {
        SC.Logger.error("SC.Module: Failed to lazily instatiate entry for  '%@'".fmt(moduleName));
      }
    }

    // Free up memory containing the functions once they have been executed.
    delete SC.LAZY_INSTANTIATION[moduleName];

    // Now that we have executed the functions, try to find the target and action for the callback.
    target = this._targetForTargetName(targetName);
    method = this._methodForMethodNameInTarget(methodName, target);

    if (!method) {
      throw "SC.Module: could not find callback for lazily instantiated module '%@'".fmt(moduleName);
    }
  },

  /**
    Evaluates a module's JavaScript if it is stored in string format, then
    deletes that code from memory.

    @param {Hash} module the module to evaluate
  */
  _evaluateStringLoadedModule: function(module) {
    var moduleSource = module.source;

    jQuery.globalEval(moduleSource);
    delete module.source;

    module.isReady = YES;
  },

  /**
    @private

    Creates <link> tags for every CSS resource in a module.

    @param {String} moduleName the name of the module whose CSS should be loaded
  */
  _loadCSSForModule: function(moduleName) {
    var head = document.getElementsByTagName('head')[0] ;
    var module = SC.MODULE_INFO[moduleName];
    var styles = module.styles || [];
    var len = styles.length;
    var url;
    var el;
    var idx;

    if (!head) head = document.documentElement ; // fix for Opera
    len = styles.length;

    for (idx = 0; idx < len; idx++) {
      url = styles[idx] ;

      if (url.length > 0) {
        if (SC.LOG_MODULE_LOADING) SC.Logger.log("SC.Module: Loading CSS file in '%@' -> '%@'".fmt(moduleName, url));
        el = document.createElement('link') ;
        el.setAttribute('href', url) ;
        el.setAttribute('rel', "stylesheet") ;
        el.setAttribute('type', "text/css") ;
        head.appendChild(el) ;
      }
    }

    el = null;
  },

  _loadJavaScriptForModule: function(moduleName) {
    var module = SC.MODULE_INFO[moduleName];
    var el;
    var url;
    var dependencies = module.dependencies;
    var dependenciesAreLoaded = YES;

    // If this module has dependencies, determine if they are loaded.
    if (dependencies && dependencies.length > 0) {
      dependenciesAreLoaded = this._dependenciesMetForModule(moduleName);
    }

    // If the module is prefetched, always load the string representation.
    if (module.isPrefetched) {
      url = module.stringURL;
    } else {
      if (dependenciesAreLoaded) {
        // Either we have no dependencies or they've all loaded already,
        // so just execute the code immediately once it loads.
        url = module.scriptURL;
      } else {
        // Because the dependencies might load after this module, load the
        // string representation so we can execute it once all dependencies
        // are in place.
        url = module.stringURL;
      }
    }

    if (url.length > 0) {
      if (SC.LOG_MODULE_LOADING) SC.Logger.log("SC.Module: Loading JavaScript file in '%@' -> '%@'".fmt(moduleName, url));

      el = document.createElement('script') ;
      el.setAttribute('type', "text/javascript") ;
      el.setAttribute('src', url) ;

      if (SC.browser.isIE) {
        el.onreadystatechange = function() {
          if (this.readyState == 'complete' || this.readyState == 'loaded') {
            SC.Module._moduleDidLoad(moduleName);
          }
        };
      } else {
        el.onload = function() {
          SC.Module._moduleDidLoad(moduleName);
        };
      }

      document.body.appendChild(el) ;
    }
  },

  /**
    @private

    Returns YES if all of the dependencies for a module are ready.

    @param {String} moduleName the name of the module being checked
    @returns {Boolean} whether the dependencies are loaded
  */
  _dependenciesMetForModule: function(moduleName) {
    var dependencies = SC.MODULE_INFO[moduleName].dependencies || [];
    var idx, len = dependencies.length;
    var dependencyName;
    var module;

    for (idx = 0; idx < len; idx++) {
      dependencyName = dependencies[idx];
      module = SC.MODULE_INFO[dependencyName];

      if (!module) throw "SC.loadModule: Unable to find dependency %@ for module %@.".fmt(dependencyName, moduleName);

      if (!module.isReady) {
        return NO;
      }
    }

    return YES;
  },

  /**
    Loads all unloaded dependencies for a module, then creates the <script> and <link> tags to
    load the JavaScript and CSS for the module.
  */
  _loadDependenciesForModule: function(moduleName) {
      // Load module's dependencies first.
      var moduleInfo      = SC.MODULE_INFO[moduleName];
      var log             = SC.LOG_MODULE_LOADING;
      var dependencies    = moduleInfo.dependencies || [];
      var dependenciesMet = YES;
      var len             = dependencies.length;
      var idx;
      var requiredModuleName;
      var requiredModule;
      var dependents;

      for (idx = 0; idx < len; idx++) {
        requiredModuleName = dependencies[idx];
        requiredModule = SC.MODULE_INFO[requiredModuleName];

        // Try to find dependent module in MODULE_INFO
        if (!requiredModule) {
          throw "SC.Module: could not find required module '%@' for module '%@'".fmt(requiredModuleName, moduleName) ;
        } else {

          // Required module has been requested but hasn't loaded yet.
          if (requiredModule.isLoading) {
            dependenciesMet = NO ;

            dependents = requiredModule.dependents;
            if (!dependents) requiredModule.dependents = dependents = [];
            dependents.push(moduleName);
          }

          // Required module has already been loaded and evaluated, no need to worry about it.
          else if (requiredModule.isReady) {
            continue ;
          }
          // Required module has not been loaded nor requested yet.
          else {
            dependenciesMet = NO ;

            // Register this as a dependent module (used by SC._moduleDidLoad()...)
            dependents = requiredModule.dependents;
            if (!dependents) requiredModule.dependents = dependents = [];

            dependents.push(moduleName) ;

            if (log) SC.Logger.log("SC.Module: '%@' depends on '%@', loading dependency…".fmt(moduleName, requiredModuleName));

            // Load dependencies
            SC.Module.loadModule(requiredModuleName) ;
          }
        }
      }
    },

    /**
      @private

      Calls an action on a target to notify the target that a module has loaded.
    */
    _invokeCallback: function(moduleName, targetName, methodName, args) {
      var method;
      var target;

      target = this._targetForTargetName(targetName);
      method = this._methodForMethodNameInTarget(methodName, target);

      // If we weren't able to find the callback, this module may be lazily instantiated and
      // the callback won't exist until we execute the closure that it is wrapped in.
      if (!method) {
        if (SC.LAZY_INSTANTIATION[moduleName]) {
          this._executeLazilyInstantiatedModule(moduleName, targetName, methodName);

          target = this._targetForTargetName(targetName);
          method = this._methodForMethodNameInTarget(methodName, target);
        } else {
          throw "SC.Module: could not find callback for '%@'".fmt(moduleName);
        }
      }

      if (!args) {
        args = [];
      }

      // The first parameter passed to the callback is the name of the module.
      args.unshift(moduleName);

      // Invoke the callback. Wrap it in a run loop if we are not in a runloop already.
      var needsRunLoop = !!SC.RunLoop.currentRunLoop;
      if (needsRunLoop) {
        SC.run(function() {
          method.apply(target, args);
        });
      } else {
        method.apply(target, args);
      }
    },

    /** @private
      Given a module name, iterates through all registered callbacks and calls them.
    */
    _invokeCallbacksForModule: function(moduleName) {
      var moduleInfo = SC.MODULE_INFO[moduleName], callbacks ;
      if (!moduleInfo) return ; // shouldn't happen, but recover anyway

      if (SC.LOG_MODULE_LOADING) SC.Logger.log("SC.Module: Module '%@' has completed loading, invoking callbacks.".fmt(moduleName));

      callbacks = moduleInfo.callbacks || [] ;

      for (var idx=0, len=callbacks.length; idx<len; ++idx) {
        callbacks[idx]() ;
      }
    },

    _evaluateAndInvokeCallbacks: function(moduleName) {
      var moduleInfo = SC.MODULE_INFO;
      var module = moduleInfo[moduleName];
      var log = SC.LOG_MODULE_LOADING;

      if (log) SC.Logger.log("SC.Module: Evaluating and invoking callbacks for '%@'.".fmt(moduleName));

      if (module.source) {
        this._evaluateStringLoadedModule(module);
      }
      module.isReady = YES;

      if (SC.isReady) {
        SC.Module._invokeCallbacksForModule(moduleName) ;
        delete module.callbacks;
      } else {
        SC.ready(SC, function() {
          SC.Module._invokeCallbacksForModule(moduleName) ;
          delete module.callbacks;
        });
      }

      // for each dependent module, try and load them again...
      var dependents = module.dependents || [] ;
      var dependentName, dependent;

      for (var idx = 0, len = dependents.length; idx < len; idx++) {
        dependentName = dependents[idx];
        dependent = moduleInfo[dependentName];
        if (dependent.isLoaded && this._dependenciesMetForModule(dependentName)) {
          if (log) SC.Logger.log("SC.Module: Now that %@ has loaded, all dependencies for a dependent %@ are met.".fmt(moduleName, dependentName));
          this._evaluateAndInvokeCallbacks(dependentName);
        }
      }
    },

  /** @private
    Called when the JavaScript for a module finishes loading.

    Any pending callbacks are called (if SC.isReady), and any dependent
    modules which were waiting for this module to load are notified so they
    can continue loading.

    @param moduleName {String} the name of the module that just loaded
*/
  _moduleDidLoad: function(moduleName) {
    var module = SC.MODULE_INFO[moduleName];
    var log    = SC.LOG_MODULE_LOADING;
    var dependenciesMet;
    var callbacks, targets;

    if (log) SC.Logger.log("SC.Module: Module '%@' finished loading.".fmt(moduleName));

    if (!module) {
      if (log) SC.Logger.log("SC._moduleDidLoad() called for unknown module '@'.".fmt(moduleName));
      module = SC.MODULE_INFO[moduleName] = { isLoaded: YES, isReady: YES } ;
      return;
    }

    if (module.isLoaded) {
      if (log) SC.Logger.log("SC._moduleDidLoad() called more than once for module '%@'. Skipping.".fmt(moduleName));
      return ;
    }

    // Remember that we're loaded.
    delete module.isLoading ;
    module.isLoaded = YES ;

    if (!module.isPrefetching) {
      dependenciesMet = this._dependenciesMetForModule(moduleName);
      if (dependenciesMet) {
        this._evaluateAndInvokeCallbacks(moduleName);
      } else {
        if (log) SC.Logger.log("SC.Module: Dependencies for '%@' not met yet, waiting to evaluate.".fmt(moduleName));
      }
    } else {
      delete module.isPrefetching;
      if (log) SC.Logger.log("SC.Module: Module '%@' was prefetched, not evaluating until needed.".fmt(moduleName));
    }
  },

  /**
    @private

    If necessary, converts a property path into a target object.

    @param {String|Object} targetName the string or object representing the target
    @returns Object
  */
  _targetForTargetName: function(targetName){
    if (SC.typeOf(targetName) === SC.T_STRING) {
      return SC.objectForPropertyPath(targetName);
    }

    return targetName;
  },

  /**
    @private

    If necessary, converts a property path into a method object.

    @param {String|Object} methodName the string or object representing the method
    @param {Object} target the target from which to retrieve the method
    @returns Object
  */
  _methodForMethodNameInTarget: function(methodName, target){
    if (SC.typeOf(methodName) === SC.T_STRING) {
      return SC.objectForPropertyPath(methodName, target);
    }

    return methodName;
  }
});

/**
Inspect the list of modules and, for every prefetched module, create a
background task to load the module when the user remains idle.
*/
SC.ready(function() {
  var moduleInfo = SC.MODULE_INFO;
  var moduleName;
  var module;
  var task;

  // Iterate through all known modules and look for those that are marked
  // as prefetched.
  for (moduleName in moduleInfo) {
    module = moduleInfo[moduleName];

    if (module.isPrefetched) {
      var prefetchedModuleName = moduleName;

      // Create a task that will load the module, and then register it with
      // the global background task queue.
      task = SC.Task.create({
        run: function() {
          SC.Module.prefetchModule(prefetchedModuleName);
        }
      });

      SC.backgroundTaskQueue.push(task);
    }
  }
});
