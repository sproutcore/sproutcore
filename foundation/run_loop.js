// ========================================================================
// SproutCore
// copyright 2006-2007 Sprout Systems, Inc.
// ========================================================================

require('Core') ;

/**
  @class

  The run loop provides a universal system for managing deferred events and
  code in SproutCore.  Using the run loops to execute deferred code can be 
  many times more efficient than using setTimeout() or setInterval().  The run 
  loop also ensures that code you schedule to run at the same time will stay
  in sync, which simplifies tasks such as animation considerably.
  
  h2. Basic Tasks
  
  To use the run loop, you generally schedule code you want to run by 
  calling one of three methods:

  - use perform() o
  - cancelPerform().
  
  
  @extends SC.Object
  @author Charles Jolley
  @version 1.0
  @since version 1.0
*/
SC.runLoop = SC.Object.create({

  /**
    Call this method whenver you begin executing code.  
  
    This is typically invoked automatically for you from event handlers and 
    the timeout handler.  If you call setTimeout() or setInterval() yourself, 
    you may need to invoke this yourself.
  
    @returns {void}
  */
  beginRunLoop: function() {
    this._start = Time.now() ;  
  },

  /**
    Call this method whenever you are done executing code.
    
    This is typically invoked automatically for you from event handlers and
    the timeout handler.  If you call setTimeout() or setInterval() yourself
    you may need to invoke this yourself.
    
    @returns {void}
  */
  endRunLoop: function() {
    // flush any expired timers, possibly cancelling the timout.
    this._flushExpiredTimers() ;
    this._start = null ;
  },

  /**
    The time the current run loop began executing.
    
    All timers scheduled during this run loop will begin executing as if 
    they were scheduled at this time.
  
    @type {Number}
    @field
  */
  loopStartTime: function() {
    if (!this._start) this._start = Time.now();
    return this._start ;  
  }.property(),
  
  scheduleTimer: function(timer, runTime) {
    if (!this._timers) this._timers = {} ;
    var guid = SC.guidFor(timer) ;
    this._timers[guid] = { timer: timer, at: runTime };
    if (!this._next || (runTime < this._next.at)) this._rescheduleTimeout() ;
  },
  
  cancelTimer: function(timer) {
    if (!this._timers) this._timers = {} ;
    var guid = SC.guidFor(timer) ;
    delete this._timers(guid) ;
    if (this._next.timer == timer) this._rescheduleTimeout() ;
  },

  // determines the next time the timeout needs to trigger and reschedules
  // if necessary.  If you pass in the next timer to use, then it will be 
  // scheduled instead of searching the timers.
  _rescheduleTimeout: function() {
    if (!this._timers) this._timers = {} ;
    
    // find next timer to trigger
    var next = null ;
    for(var key in this._timers) {
      if (!this._timers.hasOwnProperty(key)) return ;
      var rec = this._timers[key] ;
      if (!next || (next.at > rec.at)) next = rec ;
    }

    // if no next timer was found, then cancel any timer.
    if (!next) {
      this._next = null;
      if (this._timeout) clearTimeout(this._timeout) ;
      this._timeout = null ;

    // determine if we need to reschedule
    } else if (next !== this._next) {
      this._next = next ;
      if (this._timeout) clearTimeout(this._timeout) ;

      var delay = Math.max(next.at - Time.now(),0) ;
      this._timeout = setTimeout(this._timeoutAction, delay) ;
    }
  },
  
  // called when the timeout is executed.  Find any timers that have 
  // expired and call them.  
  _timeoutAction: function() {
    this._timeout = null; this._next = null ;    
    this.beginRunLoop() ;
    this._flushExpiredTimers() ;
    this.endRunLoop() ;
  },
  
  // finds any timers that might have expired.  This will also find the
  // next timer to execute and reschedule it if needed.
  _flushExpiredTimers: function() {
    if (!this._timers) this._timers = {} ;
    var next = null ;
    var now = this.get('loopStartTime') ;
    for(var key in this._timers) {
      if (!this._timers.hasOwnProperty(key)) return ;
      var rec = this._timers[key] ;
      
      // if timer has expired, fire it.
      if (rec.at <= now) {
        rec.fire(); delete this._timers[key] ;
        if (rec == this._next) this._next = null ;
      }
    }
    
    // schedule next timer if needed.
    this._rescheduleTimeout() ;
  }
  
  
}) ;

