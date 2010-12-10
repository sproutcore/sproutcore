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
	isModuleLoaded: function(moduleName) {
		var moduleInfo = SC.MODULE_INFO[moduleName] ;
		return moduleInfo ? !!moduleInfo.isLoaded : NO ;
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
	},


	/**
  	If a module is marked for lazy instantiation, this method will execute the closure and call
  	any registered callbacks.
  */
	executeLazilyInstantiatedModule: function(moduleName, targetName, methodName){
		var lazyInfo =  SC.LAZY_INSTANTIATION[moduleName];
		var target;
		var method;
		var idx, len;

		if (SC.LOG_MODULE_LOADING) {
			console.log("SC.loadModule(): Module '%@' is marked for lazy instantiation, instantiating it now…".fmt(moduleName));
		}

		len = lazyInfo.length;
		for (idx = 0; idx < len; idx++) {
			// Iterate through each function associated with this module, and attempt to execute it.
			try {
				lazyInfo[idx]();
			} catch(e) {
				console.error("SC.loadModule(): Failed to lazily instatiate entry for  '%@'".fmt(moduleName));
			}
		}

		// Free up memory containing the functions once they have been executed.
		delete SC.LAZY_INSTANTIATION[moduleName];

		// Now that we have executed the functions, try to find the target and action for the callback.
		target = this._targetForTargetName(targetName);
		method = this._methodForMethodNameInTarget(methodName, target);

		if (!method) {
			throw "SC.loadModule(): could not find callback for lazily instantiated module '%@'".fmt(moduleName);
		}
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
		var module = SC.MODULE_INFO[moduleName], callbacks, targets,
		args           = SC.A(arguments).slice(3),
		log            = SC.LOG_MODULE_LOADING;


		// Treat the first parameter as the callback if the target is a function and there is
		// no method supplied.
		if (method === undefined && SC.typeOf(target) === SC.T_FUNCTION) {
			method = target;
			target = null;
		}

		if (log) {
			console.log("SC.loadModule(): Attempting to load '%@'".fmt(moduleName));
		}

		// If we couldn't find anything in the SC.MODULE_INFO hash, we don't have any record of the
		// requested module.
		if (!module) {
			throw "SC.loadModule(): could not find module '%@'".fmt(moduleName) ;
		}

		// If the module is already loaded, execute the callback immediately if SproutCore is loaded,
		// or else as soon as SC has finished loading.
		if (module.isLoaded) {
			if (log) console.log("SC.loadModule(): Module '%@' already loaded, skipping.".fmt(moduleName));

      if (module.isPrefetched && module.source) {
        eval(module.source);
        delete module.source;
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
		}
		// The module is not yet loaded, so register the callback and, if necessary, begin loading
		// the code.
		else {
			if (log) console.log("SC.loadModule(): Module '%@' is not loaded, loading now.".fmt(moduleName));

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
			if (!module.loading) {
				this._loadDependenciesForModule(moduleName);
				this._loadCSSForModule(moduleName);
				this._loadJavaScriptForModule(moduleName);
				module.loading = YES;
			}
		}
	},

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
  			if (SC.LOG_MODULE_LOADING) console.log("SC.loadModule(): Loading CSS file in '%@' -> '%@'".fmt(moduleName, url));
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
    if (dependencies.length > 0) {
      dependenciesAreLoaded = this._dependenciesAreLoaded(moduleName);
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
			if (SC.LOG_MODULE_LOADING) console.log("SC.loadModule(): Loading JavaScript file in '%@' -> '%@'".fmt(moduleName, url));

			el = document.createElement('script') ;
			el.setAttribute('type', "text/javascript") ;
			el.setAttribute('src', url) ;

			el.onload = function() {
				SC.Module.moduleDidLoad(moduleName);
			};

			document.body.appendChild(el) ;
		}
	},

	/**
	  @private

	  Returns YES if all of the dependencies for a module are loaded.

	  @param {String} moduleName the name of the module being checked
	  @returns {Boolean} whether the dependencies are loaded
	*/
	_dependenciesAreLoaded: function(moduleName) {
	  var dependencies = SC.MODULE_INFO[moduleName].dependencies;
	  var idx, len = dependencies.length;
	  var dependencyName;
	  var module;

	  for (idx = 0; idx < len; idx++) {
	    dependencyName = dependencies[idx];
	    module = SC.MODULE_INFO[dependencyName];

	    if (!module) throw "SC.loadModule: Unable to find dependency %@ for module %@.".fmt(dependencyName, moduleName);

	    if (!module.isLoaded) {
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
			var dependencies        = moduleInfo.dependencies || [];
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
					throw "SC.loadModule(): could not find required module '%@' for module '%@'".fmt(requiredModuleName, moduleName) ;
				} else {

					// Required module has been requested but hasn't loaded yet.
					if (requiredModule.loading) {
						dependenciesMet = NO ;
						break ;
					}
					// Required module has already been loaded, no need to worry about it.
					else if (requiredModule.isLoaded) {
						continue ;
					}
					// Required module has not been loaded nor requested yet.
					else {
						dependenciesMet = NO ;

						// Register this as a dependent module (used by SC.moduleDidLoad()...)
						dependents = requiredModule.dependents;
						if (!dependents) requiredModule.dependents = dependents = [];

						dependents.push(moduleName) ;

						if (log) console.log("SC.loadModule(): '%@' depends on '%@', loading dependency…".fmt(moduleName, requiredModuleName));

						// Load dependencies
						SC.Module.loadModule(requiredModuleName) ;
						break ;
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
          this.executeLazilyInstantiatedModule(moduleName, targetName, methodName);
				} else {
					throw "SC.loadModule(): could not find callback for '%@'".fmt(moduleName);
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

			if (SC.LOG_MODULE_LOADING) console.log("SC.loadModule(): Module '%@' has completed loading, invoking callbacks.".fmt(moduleName));

			callbacks = moduleInfo.callbacks || [] ;

			for (var idx=0, len=callbacks.length; idx<len; ++idx) {
				callbacks[idx]() ;
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
		var moduleInfo = SC.MODULE_INFO[moduleName];
		var log        = SC.LOG_MODULE_LOADING;
		var callbacks, targets;

		if (!moduleInfo) {
			moduleInfo = SC.MODULE_INFO[moduleName] = { loaded: YES} ;
			return;
		}

		if (moduleInfo.isLoaded && log) {
			console.log("SC.moduleDidLoad() called more than once for module '%@'. Skipping.".fmt(moduleName));
			return ;
		}

		// remember that we're loaded
		delete moduleInfo.loading ;
		moduleInfo.isLoaded = YES ;

		// call our callbacks (if SC.isReady), otherwise queue them for later
		if (SC.isReady) {
			SC.Module._invokeCallbacksForModule(moduleName) ;
		  delete moduleInfo.callbacks;
		} else {
			SC.ready(SC, function() {
				SC.Module._invokeCallbacksForModule(moduleName) ;
				delete moduleInfo.callbacks;
			});
		}

		// for each dependent module, try and load them again...
		var dependents = moduleInfo.dependents || [] ;
		for (var idx=0, len=dependents.length; idx<len; ++idx) {
			if (log) console.log("SC.loadModule(): Module '%@' has completed loading, loading '%@' that depended on it.".fmt(moduleName, dependents[idx]));
			SC.Module.loadModule(dependents[idx]) ;
		}
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
					SC.Module.loadModule(prefetchedModuleName);
				}
			});

			SC.backgroundTaskQueue.push(task);
		}
	}
});
