// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global main */

SC.BENCHMARK_LOG_READY = YES;

sc_require('system/event') ;

SC.mixin({
  /** @private
    Set this _isReadyBound if you'd like to avoid SC from setting up the DOM
    listeners to determine when to DOM is loaded, and it's safe to call
    _didBecomeReady() .
    
    This is a private variable, so play at your own risk.
  */
  _isReadyBound: (SC._isReadyBound!==undefined ? SC._isReadyBound: NO),
  
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
    if (SC.browser.msie && (window === top)) {
      (function() {
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
    }
    
    if ( SC.browser.opera ) {
      document.addEventListener( "DOMContentLoaded", function () {
        if (SC.isReady) return;
        for (var i = 0; i < document.styleSheets.length; i++) {
          if (document.styleSheets[i].disabled) {
            setTimeout( arguments.callee, 0 );
            return;
          }
        }
        // and execute any waiting functions
        SC._didBecomeReady();
      }, NO);
    }
    
    if (SC.browser.safari && SC.browser.safari < 530.0 ) {
      console.error("ready() is not yet supported on Safari 3.1 and earlier");
      // TODO: implement ready() in < Safari 4 
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
  
  /**
    isReady is YES when the DOM has successfully loaded and the SproutCore
    framework itself is initialized and the main() function of the application 
    has been invoked.
    
    @property
    @type Boolean
  */
  isReady: NO,
  
  /** @private invoked when the document becomes ready. */
  _didBecomeReady: function() {
    // Only call once
    if (SC.isReady) return ;
    if (typeof SC.mapDisplayNames === SC.T_FUNCTION) SC.mapDisplayNames();
    if (typeof SC.addInvokeOnceLastDebuggingInfo === SC.T_FUNCTION) SC.addInvokeOnceLastDebuggingInfo();
     
    // setup locale
    SC.Locale.createCurrentLocale();
    
    // if there is a body tag on the document, set the language
    if (document && document.getElementsByTagName) {
      var body = document.getElementsByTagName('body')[0];
      if (body) {
        var className = body.className ;
        var language = SC.Locale.currentLanguage.toLowerCase() ;
        body.className = (className && className.length>0) ? [className, language].join(' ') : language ;
      }
    }

    SC.Benchmark.addEvent('ready');
    SC.Benchmark.start('main') ;
    
    // Begin runloop
    SC.run(function() {
      var handler, ary, idx, len ;

      // correctly handle queueing new SC.ready() calls
      do {
        ary = SC._readyQueue ;
        SC._readyQueue = [] ; // reset
        for (idx=0, len=ary.length; idx<len; idx++) {
          handler = ary[idx] ;
          var target = handler[0] || document ;
          var method = handler[1] ;
          if (method) method.call(target) ;
        }
      } while (SC._readyQueue.length > 0) ;

      // okay, now we're ready (any SC.ready() calls will now be called immediately)
      SC.isReady = YES ;

      // clear the queue
      SC._readyQueue = null ;

      // trigger any bound ready events
      SC.Event.trigger(document, "ready", null, NO);

      // Remove any loading div
      if (SC.removeLoading) SC.$('#loading').remove();

      // Now execute main, if defined and SC.UserDefaults is ready
      if(SC.userDefaults.get('ready')){
        if ((SC.mode === SC.APP_MODE) && (typeof main != "undefined") && (main instanceof Function) && !SC.suppressMain) main();
      } else {
        SC.userDefaults.readyCallback(window, main);
      }
    }, this);
    
    SC.Benchmark.end('main') ;
    if (SC.BENCHMARK_LOG_READY) {
      SC.Benchmark.loadPreloadEvents();
      
      SC.Benchmark.start('boot-and-display', undefined, SC.Benchmark.javascriptStartTime);
      
      SC.Benchmark.start('boot', undefined, SC.Benchmark.javascriptStartTime);
      SC.Benchmark.end('boot');
      
      SC.Benchmark.start('display');
      setTimeout(function() {
        SC.Benchmark.addEvent('load complete');
        SC.Benchmark.end('boot-and-display');
        SC.Benchmark.end('display');
        SC.Benchmark.log();
      }, 0);
    }
  },
  
  /** 
    Add the passed target and method to the queue of methods to invoke when
    the document is ready.  These methods will be called after the document
    has loaded and parsed, but before the main() function is called.
    
    Methods are called in the order they are added.
  
    If you add a ready handler when the main document is already ready, then
    your handler will be called immediately.
    
    @param target {Object} optional target object
    @param method {Function} method name or function to execute
    @returns {SC}
  */
  ready: function(target, method) {
    var queue = this._readyQueue;
    
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
    queue.push([target, method]) ;
    return this ; 
  }
  
}) ;

SC._bindReady() ;
SC.removeLoading = YES;

// default to app mode.  When loading unit tests, this will run in test mode
SC.APP_MODE = "APP_MODE";
SC.TEST_MODE = "TEST_MODE";
SC.mode = SC.APP_MODE;
