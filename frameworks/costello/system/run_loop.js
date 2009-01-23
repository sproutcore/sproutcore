// ========================================================================
// SproutCore -- JavaScript Application Framework
// Copyright ©2006-2008, Sprout Systems, Inc. and contributors.
// Portions copyright ©2008 Apple, Inc.  All rights reserved.
// ========================================================================

require('core') ;

/**
  @class

  The run loop provides a universal system for coordinating events within
  your application.  The run loop processes timers as well as pending 
  observer notifications within your application.

  To use a RunLoop within your application, you should make sure your event
  handlers always begin and end with SC.RunLoop.begin() and SC.RunLoop.end()
  
  The RunLoop is important because bindings do not fire until the end of 
  your run loop is reached.  This improves the performance of your
  application.
  
  h2. Example
  
  This is how you could write your mouseup handler in jQuery:
  
  {{{
    $('#okButton').on('click', function() {
      SC.RunLoop.begin();
      
      // handle click event...
      
      SC.RunLoop.end(); // allows bindings to trigger...
    });
  }}}
  
  @extends SC.Object
  @since SproutCore 1.0
*/
SC.RunLoop = SC.Object.extend(/** @scope SC.RunLoop.prototype */ {

  /**
    Call this method whenver you begin executing code.  

    This is typically invoked automatically for you from event handlers and 
    the timeout handler.  If you call setTimeout() or setInterval() yourself, 
    you may need to invoke this yourself.

    @returns {SC.RunLoop} receiver
  */
  beginRunLoop: function() {
    this._start = new Date().getTime() ; // can't use Date.now() in costello  
  },

  /**
    Call this method whenever you are done executing code.

    This is typically invoked automatically for you from event handlers and
    the timeout handler.  If you call setTimeout() or setInterval() yourself
    you may need to invoke this yourself.

    @returns {void}
  */
  endRunLoop: function() {

    // at the end of a runloop, flush all the delayed actions we may have 
    // stored up.  Note that if any of these queues actually run, we will 
    // step through all of them again.  This way any changes get flushed
    // out completely.
    var didChange ;

    do {
      didChange = this.flushApplicationQueues() ;
    } while(didChange) ;
    this._start = null ;
  },

  /**
    This method will flushing any changes that were deferred until the end of
    the current run loop.  The default implementation will simply flush any
    pending changed bindings, but you could override this method to provide
    added functionality if you prefer.  For example, the full SproutCore 
    framework patches this function to support timers, etc.
  */
  flushApplicationQueues: function() {
      // flush any pending changed bindings.  This could actually trigger a 
      // lot of code to execute.
      return SC.Binding.flushPendingChanges();
  }

}) ;

/** 
  The current run loop.  This is created automatically the first time you
  call begin(). 
*/
SC.RunLoop.currentRunLoop = null;

/**
  The default RunLoop class.  If you choose to extend the RunLoop, you can
  set this property to make sure your class is used instead.
*/
SC.RunLoop.runLoopClass = SC.RunLoop;

SC.RunLoop.begin = function() {    
  var runLoop = this.currentRunLoop;
  if (!runLoop) runLoop = this.currentRunLoop = this.runLoopClass.create();
  runLoop.beginRunLoop();
};

SC.RunLoop.end = function() {
  var runLoop = this.currentRunLoop;
  if (!runLoop) {
    throw "SC.RunLoop.end() called outside of a runloop!";
  }
  runLoop.endRunLoop();
} ;


