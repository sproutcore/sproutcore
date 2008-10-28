// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('foundation/system/event') ;

SC.mixin({
  _isReadyBound: NO,
  
  /** @private configures the ready event handler if needed */
  _bindReady: function() {
    if (this._isReadyBound) return;
    this._isReadyBound = YES ;

    // Mozilla, Opera (see further below for it) and webkit nightlies 
    // currently support this event.  Use the handy event callback
    if ( document.addEventListener && !SC.browser.opera) {
      document.addEventListener( "DOMContentLoaded", SC._didBecomeReady, NO );
    }

    // If IE is used and is not in a frame
    // Continually check to see if the document is ready
    if (SC.browser.msie && (window === top)) (function(){
      if (SC.isReady) return;
      try {
        // If IE is used, use the trick by Diego Perini
        // http://javascript.nwbox.com/IEContentLoaded/
        document.documentElement.doScroll("left");
      } catch( error ) {
        setTimeout( arguments.callee, 0 );
        return;
      }
      // and execute any waiting functions
      SC._didBecomeReady();
    })();

    if ( SC.browser.opera ) {
      document.addEventListener( "DOMContentLoaded", function () {
        if (SC.isReady) return;
        for (var i = 0; i < document.styleSheets.length; i++)
          if (document.styleSheets[i].disabled) {
            setTimeout( arguments.callee, 0 );
            return;
          }
        // and execute any waiting functions
        SC._didBecomeReady();
      }, NO);
    }

    if ( SC.browser.safari ) {
      console.log("ready() is not yet supported on Safari <= 3.1") ;
      // var numStyles;
      // (function(){
      //   if (SC.isReady) return;
      //   if ( document.readyState != "loaded" && document.readyState != "complete" ) {
      //     setTimeout( arguments.callee, 0 );
      //     return;
      //   }
      //   if ( numStyles === undefined ) numStyles = 0 ;
      //     //numStyles = SC.$("style, link[rel=stylesheet]").length;
      //   if ( document.styleSheets.length != numStyles ) {
      //     setTimeout( arguments.callee, 0 );
      //     return;
      //   }
      //   // and execute any waiting functions
      //   SC._didBecomeReady();
      // })();
    }

    // A fallback to window.onload, that will always work
    SC.Event.add( window, "load", SC._didBecomeReady);
  },

  /** @private handlers scheduled to execute on ready. */
  _readyQueue: [],

  /** @private invoked when the document becomes ready. */
  _didBecomeReady: function() {
    // Only call once
    if (SC.isReady) return ;
    SC.isReady = YES ;
    
    // setup locale
    SC.Locale.createCurrentLocale();
    
    // First, start SC.Application
    SC.app = SC.Application.create() ;
    SC.app.run() ;

    // if there is a body tag on the document, set the language
    if (document && document.getElementsByTagName) {
      var body = document.getElementsByTagName('body')[0];
      if (body) {
        var className = body.className ;
        var language = String.currentLanguage().toLowerCase() ;
        body.className = (className && className.length>0) ? [className, language].join(' ') : language ;
      }
    }

    // Begin runloop
    SC.runLoop.beginRunLoop();
    
    // If there are handlers scheduled, execute them.
    var queue = this._readyQueue, idx = (queue) ? queue.length : 0 ;
    while(--idx >= 0) {
      var handler = queue[idx] ;
      var target = handler[0] || document ;
      var method = handler[1] ;
      if (method) method.call(target) ;
    }
    
    // clear the queue
    this._readyQueue = null ;
    
    // trigger any bound ready events
    SC.Event.trigger("ready", null, document, NO) ;
    
    // Now execute main, if defined
    if ((typeof main != "undefined") && (main instanceof Function)) main();
    
    // handle routes, if modules is installed.
    if (SC.Routes && SC.Routes.ping) SC.Routes.ping() ; 
    
    // end run loop.  This is probably where a lot of bindings will trigger
    SC.runLoop.endRunLoop() ; 
  },
  
  /** 
    Add the passed target and method to the queue of methods to invoke when
    the document is ready.  These methods will be called after the document
    has loaded and parsed, but before the main() function is called.
  
    If you add a ready handler when the main document is already ready, then
    your handler will be called immediately.
    
    @param target {Object} optional target object
    @param method {Funciton} method name or function to execute
    @returns {SC}
  */
  ready: function(target, method) {
    // normalize
    if (method === undefined) {
      method = target; target = null ;
    } else if (SC.typeOf(method) === SC.T_STRING) {
      method = target[method] ;
    }
    
    if (!method) return this; // nothing to do.
    
    // if isReady, execute now.
    if (this.isReady) return method.call(target || document) ;
    
    // otherwise, add to queue.
    this._readyQueue.push([target, method]) ;
    return this ; 
  }
  
}) ;

SC._bindReady() ;

