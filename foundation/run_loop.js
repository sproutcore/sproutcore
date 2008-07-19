// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('core') ;

/**
  @class

  The run loop provides a universal system for coordinating events within
  your application.  The run loop processes timers as well as pending 
  observer notifications within your application.
  
  Typically you will not work with a run loop directly but instead user 
  SC.Timer objects and property observing to indirectly trigger actions on
  the run loop.  The only time you may need to work with the run loop is if
  you implement a setTimeout or event handler yourself.  In these cases, you
  should begin and end your function handler with a call to beginRunLoop()
  and endRunLoop().  This will give the run loop a chance to process any
  pending events on your application.
  
  h2. Using the Loop Start Time
  
  Sometimes you need to schedule events such as timers and you want to make
  sure all of the events you schedule occur at the same time.  If you want to
  keep items in sync you can't use Date.now() because that value will 
  increment as your code executes.  Instead, you should get the loop start
  time and use that.  For example, if you want to schedule three timers to
  repeat until 1 second, 2 seconds and 3 seconds from now you might do:
  
  {{{
    var t1 = SC.Timer.schedule({ 
      interval: 100,
      action: 'timer1', 
      repeats: YES, 
      until: SC.runLoop.get('startTime') + 1000 }) ;

    var t2 = SC.Timer.schedule({ 
      interval: 100,
      action: 'timer1', 
      repeats: YES, 
      until: SC.runLoop.get('startTime') + 2000 }) ;

    var t3 = SC.Timer.schedule({ 
      interval: 100,
      action: 'timer1', 
      repeats: YES, 
      until: SC.runLoop.get('startTime') + 3000 }) ;
  }}}
  
  This will ensure that each timer uses the exact same start time when 
  scheduling.  This is critical if you want to keep animations in sync.
  
  @extends SC.Object
  @author Charles Jolley
  @version 1.0
  @since SproutCore 1.0
*/
SC.runLoop = SC.Object.create({
  
  /**
    Maximum time we allow things to run before taking a break.
  */
  maxRunTime: 3000,
  
  /**
    Called by an observable object to schedule an observer to be notified.
    
    @param target {Object} the target object
    @param action {Function} the method to call
    @param args {Array} array of arguments to pass on
    @returns {void}
  */
  notifyObserver: function(target, action, args) {
    if (!this._notifications) this._notifications = [] ;
    this._notifications.push({ target: target, action: action, args: args });
  },
  
  /**
    Tries to flush observer notifications.  The idea is that this will
    continue to remove observers until all of the notifications have flushed
    or until the max execution time has passed.  Called automatically from
    endRunLoop().
    
    The way this works, it does not unshift pending notifications but
    instead just sets them to null until the entire queue is flushed.  Then
    it will reset the queue to a new array.  This is faster than shifting().
    
    @returns {void}
  */
  deliverNotifications: function() {
    if (!this._notifications || this._notifications.length <=0) return;
    if (this._notifying) return ; // do not allow recursion
    this._notifying = YES ;
    
    var start = this.get('startTime') ;
    var max = start + this.get('maxRunTime') ;
    var loc = 0;
    while((Date.now() < max) && (loc < this._notifications.length)) {
      var notify = this._notifications[loc] ;
      this._notifications[loc] = null;
      loc++ ; // IMPORTANT: Make sure you increment so that we always go on.

      if (notify) {
        var args = notify.args;
        notify.action.call(notify.target, args[0], args[1], args[2], args[3]);
      }
    }
    
    // if we made it through and the queue is empty, reset it
    // otherwise, leave the queue in place and schedule another runloop.
    if (loc >= this._notifications.length) {
      this._notifications = [];
    } else {
      this.invokeLater(this.deliverNotifications) ;
    }
    
    this._notifying = NO ;
  },
  
  /**
    Call this method whenver you begin executing code.  
  
    This is typically invoked automatically for you from event handlers and 
    the timeout handler.  If you call setTimeout() or setInterval() yourself, 
    you may need to invoke this yourself.
  
    @returns {void}
  */
  beginRunLoop: function() {
    this._start = Date.now() ;  
  },

  /**
    Call this method whenever you are done executing code.
    
    This is typically invoked automatically for you from event handlers and
    the timeout handler.  If you call setTimeout() or setInterval() yourself
    you may need to invoke this yourself.
    
    @returns {void}
  */
  endRunLoop: function() {
    // send any pending notifications.
    //this.deliverNotifications() ;
    
    // flush any expired timers, possibly cancelling the timeout.
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
  startTime: function() {
    if (!this._start) this._start = Date.now();
    return this._start ;  
  }.property(),

  // timers are stored in the hash with a double linked list to keep them
  // in order.
  scheduleTimer: function(timer, runTime) {
    
    if (!timer) throw "scheduleTimer requires a timer" ; // nothing to do
    
    if (!this._timers) this._timers = {} ;
    var guid = SC.guidFor(timer) ;

    // either remove the timer record or create a new one and add it.
    var t = this._timers[guid];
    if (t) {
      if (t.prev) t.prev.next = t.next ;
      if (t.next) t.next.prev = t.prev ;
      t.next = t.prev = null ;
      t.at = runTime ;
    } else {
      t = this._timers[guid] = { 
        timer: timer, 
        at: runTime, 
        guid: guid,
        next: null, prev: null 
      } ;
    }

    // now walk the chain to figure out where to insert the timer.  If the
    // timer goes at the front, also reschedule the next timeout.
    var cur = this._next ;
    if (!cur || cur.at > runTime) {
      this._next = t ;
      t.next = cur ;
      if (cur) cur.prev = t.next ;
      this._rescheduleTimeout() ;
      
    } else {
      // find the item to insert after
      while(cur.next && cur.next.at <= runTime) cur = cur.next ;
      t.next = cur.next ;
      if (cur.next) cur.next.prev = t ;
      cur.next = t ;
      t.prev = cur ;
    }
  },
  
  cancelTimer: function(timer) {
    
    if (!timer) return ; //nothing to do
    
    if (!this._timers) this._timers = {} ;
    var guid = SC.guidFor(timer) ;
    var t = this._timers[guid] ;
    
    // if a timer record was found, remove it from the list.  
    // if timer was at the front, reschedule the timeout.
    if (t) {
      if (t.next) t.next.prev = t.prev ;
      if (t.prev) t.prev.next = t.next ;
      if (this._next === t) {
        this._next = t.next ;
        this._rescheduleTimeout() ;
      }
      t.next = t.prev = t.timer = null ; // clear objects
    }
  },

  timerPausedStateDidChange: function(timer) {
    this._rescheduleTimeout() ;
  },
  
  // determines the next time the timeout needs to trigger and reschedules
  // if necessary.  If you pass in the next timer to use, then it will be 
  // scheduled instead of searching the timers.
  _rescheduleTimeout: function() {
    
    // if we are currently flushing, don't do this since it will happen
    // later anyway
    if (this._flushing) return ;
    
    if (!this._timers) this._timers = {} ;
    
    // find next timer to trigger.  If the first unpaused timer.
    var rec = this._next ;
    while(rec && (!rec.timer || rec.timer.get('isPaused')) ) rec = rec.next ;

    // if no next timer was found, then cancel any timer.
    if (!rec) {
      this._timeoutAt = 0 ;
      if (this._timeout) clearTimeout(this._timeout) ;
      this._timeout = null ;

    // determine if we need to reschedule
    } else if ((this._timeoutAt === 0) || (rec.at !== this._timeoutAt)) {
      if (this._timeout) clearTimeout(this._timeout) ;

      var delay = Math.max(rec.at - Date.now(),0) ;
      this._timeout = setTimeout(this._timeoutAction, delay) ;
      this.timeoutAt = rec.at ;
    }
  },
  
  // called when the timeout is executed.  Find any timers that have 
  // expired and call them.  
  _timeoutAction: function() {
    var rl = SC.runLoop;
    rl._timeout = null; rl._timeoutAt = 0 ;
    rl.beginRunLoop() ;
    rl._flushExpiredTimers() ;
    rl.endRunLoop() ;
  },
  
  // finds any timers that might have expired.  This will also find the
  // next timer to execute and reschedule it if needed.
  _flushExpiredTimers: function() {
    if (!this._timers) this._timers = {} ;
    var now = this.get('startTime') ;
    var max = now + this.get('maxRunTime');  // max time we are allowed to run timers

    this._flushing = YES ;
    
    // work down the list, do not fire a timer more than once per loop.
    var fired = {} ;
    var rec = this._next ;
    while(rec && (rec.at <= now) && (Date.now() < max)) {
      
      // if rec has been fired, go on to next one.
      var guid = SC.guidFor(rec.timer) ;
      if (fired[guid]) {
        rec = rec.next;
        
      // otherwise, remove rec from list and then fire it.
      } else {
        var next = rec.next;
        
        if (this._next === rec) this._next = rec.next ;
        if (rec.next) rec.next.prev = rec.prev ;
        if (rec.prev) rec.prev.next = rec.next ;
        delete this._timers[rec.guid] ;
        
        fired[guid] = YES ; 
        if (rec.timer) rec.timer.fire() ;
        
        // finish clean up.
        rec.next = rec.prev = rec.timer = null ;
        rec = next ;
      }
    }
    
    this._flushing = NO ;
    
    // schedule next timer if needed.
    this._rescheduleTimeout() ;
  }
  
  
}) ;

