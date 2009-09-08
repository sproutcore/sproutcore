// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/**
  The global bundle methods. See also: lib/boostrap.rhtml
*/
SC.mixin(/** @scope SC */ {
  
  /**
    Returns YES is bundleName is loaded; NO if bundleName is not loaded or
    no information is available.
    
    @param bundleName {String}
    @returns {Boolean}
  */
  bundleIsLoaded: function(bundleName) {
    var bundleInfo = SC.BUNDLE_INFO[bundleName] ;
    return bundleInfo ? !!bundleInfo.loaded : NO ;
  },
  
  _scb_bundleDidLoad: function(bundleName, target, method, args) {
    if(SC.typeOf(target) === SC.T_STRING) {
      target = SC.objectForPropertyPath(target);
    }

    if(SC.typeOf(method) === SC.T_STRING) {
      method = SC.objectForPropertyPath(method, target);
    }
    
    if(!method) {
      throw "SC.loadBundle(): could not find callback for '%@'".fmt(bundleName);
    }

    if(!args) {
      args = [];
    }

    args.push(bundleName);
    
    var needsRunLoop = !!SC.RunLoop.currentRunLoop;
    if (needsRunLoop) SC.RunLoop.begin() ;
    method.apply(target, args) ;
    if (needsRunLoop) SC.RunLoop.end() 
  },
  
  /**
    Dynamically load bundleName if not already loaded. Once loaded (or if
    already loaded), invoke callback on target, passing bundleName as the 
    first (and only) parameter.
    
    @param bundleName {String}
    @param target {Function} 
    @param method {Function}
  */
  loadBundle: function(bundleName, target, method) {
    
    if(method === undefined && SC.typeOf(target) === SC.T_FUNCTION) {
      method = target;
      target = null;
    }

    var bundleInfo = SC.BUNDLE_INFO[bundleName], callbacks, targets ;
    var args = SC.A(arguments).slice(3);

    if (!bundleInfo) {
      throw "SC.loadBundle(): could not find bundle '%@'".fmt(bundleName) ;
    } else if (bundleInfo.loaded) {
      if(method) {
        // call callback immediately if we're already loaded and SC.isReady
        if (SC.isReady) {
          SC._scb_bundleDidLoad(bundleName, target, method, args);
        } else {
          // queue callback for when SC is ready
          SC.ready(SC, function() {
            SC._scb_bundleDidLoad(bundleName, target, method, args);        
          });
        }
      }
    } else {

      // queue callback for later
      callbacks = bundleInfo.callbacks || [] ;

      if (method) {
        callbacks.push(function() {
          SC._scb_bundleDidLoad(bundleName, target, method, args);        
        });
        bundleInfo.callbacks = callbacks ;
      }

      if (!bundleInfo.loading) {
        // load bundle's dependencies first
        var requires = bundleInfo.requires || [] ;
        var dependenciesMet = YES ;
        for (var idx=0, len=requires.length; idx<len; ++idx) {
          var targetName = requires[idx] ;
          var targetInfo = SC.BUNDLE_INFO[targetName] ;
          if (!targetInfo) {
            throw "SC.loadBundle(): could not find required bundle '%@' for bundle '%@'".fmt(targetName, bundleName) ;
          } else {
            if (targetInfo.loading) {
              dependenciesMet = NO ;
              break ;
            } else if (targetInfo.loaded) {
              continue ;
            } else {
              dependenciesMet = NO ;
              
              // register ourself as a dependent bundle (used by 
              // SC.bundleDidLoad()...)
              var dependents = targetInfo.dependents;
              if(!dependents) targetInfo.dependents = dependents = [];

              dependents.push(bundleName) ;
              
              // recursively load targetName so it's own dependencies are
              // loaded first.
              SC.loadBundle(targetName) ;
              break ;
            }
          }
        }
        
        if (dependenciesMet) {
          // add <script> and <link> tags to DOM for bundle's resources
          var styles, scripts, url, el, head, body, idx, len ;
          head = document.getElementsByTagName('head')[0] ;
          if (!head) head = document.documentElement ; // fix for Opera
          styles = bundleInfo.styles || [] ;
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
          
          body = document.body, scripts = bundleInfo.scripts || [] ;
          for (idx=0, len=scripts.length; idx<len; ++idx) {
            url = scripts[idx] ;
            if (url.length > 0) {
              el = document.createElement('script') ;
              el.setAttribute('type', "text/javascript") ;
              el.setAttribute('src', url) ;
              body.appendChild(el) ;
            }
          }
          
          // and remember that we're loading
          bundleInfo.loading = YES ;
        }
      }
    }
  },
  
  /** @private
    Called by bundle_loaded.js immediately after a framework/bundle is loaded.
    Any pending callbacks are called (if SC.isReady), and any dependent 
    bundles which were waiting for this bundle to load are notified so they 
    can continue loading.
    
    @param bundleName {String} the name of the bundle that just loaded
  */
  bundleDidLoad: function(bundleName) {
    var bundleInfo = SC.BUNDLE_INFO[bundleName], callbacks, targets ;
    if (!bundleInfo) bundleInfo = SC.BUNDLE_INFO[bundleName] = {} ;
    if (bundleInfo.loaded) {
      console.log("SC.bundleDidLoad() called more than once for bundle '%@'. Skipping.".fmt(bundleName));
      return ;
    }
    
    // remember that we're loaded
    delete bundleInfo.loading ;
    bundleInfo.loaded = YES ;
    
    // call our callbacks (if SC.isReady), otherwise queue them for later
    if (SC.isReady) {
      SC._invokeCallbacksForBundle(bundleName) ;
    } else {
      SC.ready(SC, function() {
        SC._invokeCallbacksForBundle(bundleName) ;
      })
    }
    
    // for each dependent bundle, try and load them again...
    var dependents = bundleInfo.dependents || [] ;
    for (var idx=0, len=dependents.length; idx<len; ++idx) {
      console.log('dependents: ' + dependents[idx]);
      SC.loadBundle(dependents[idx]) ;
    }
  },
  
  /** @private Invoke queued callbacks for bundleName. */
  _invokeCallbacksForBundle: function(bundleName) {
    var bundleInfo = SC.BUNDLE_INFO[bundleName], callbacks ;
    if (!bundleInfo) return ; // shouldn't happen, but recover anyway
    
    callbacks = bundleInfo.callbacks || [] ;
    
    SC.RunLoop.begin() ;
    for (var idx=0, len=callbacks.length; idx<len; ++idx) {
      callbacks[idx]() ;
    }
    SC.RunLoop.end() ;
  }
  
});
