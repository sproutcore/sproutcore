// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('core') ;
require('foundation/object');

/**
  @class

  A Timer executes a method after a defined period of time.  Timers are 
  significantly more efficient than using setTimeout() or setInterval() 
  because they are cooperatively scheduled using the run loop.  Timers are
  also gauranteed to fire at the same time, making it far easier to keep 
  multiple timers in sync.
  
  h2. Overview
  
  Timers were created for SproutCore as a way to efficiently defer execution
  of code fragments for use in Animations, event handling, and other tasks.
  
  Browsers are typically fairly inconsistant about when they will fire a 
  timeout or interval based on what the browser is currently doing.  Timeouts 
  and intervals are also fairly expensive for a browser to execute, which 
  means if you schedule a large number of them it can quickly slow down the 
  browser considerably.
  
  Timers, on the other handle, are scheduled cooperatively using the 
  SC.runLoop, which uses exactly one timeout to fire itself when needed and 
  then executes by timers that need to fire on its own.  This approach can
  be many timers faster than using timers and gaurantees that timers scheduled
  to execute at the same time generally will do so, keeping animations and
  other operations in sync.
  
  h2. Scheduling a Timer

  To schedule a basic timer, you can simply call SC.Timer.schedule() with 
  a target and action you wish to have invoked:
  
  {{{
    var timer = SC.Timer.schedule({ 
      target: myObject, action: 'timerFired', interval: 100 
    });
  }}}

  When this timer fires, it will call the timerFired() method on myObject.
  
  In addition to calling a method on a particular object, you can also use
  a timer to execute a variety of other types of code:
  
  - If you include an action name, but not a target object, then the action will be passed down the responder chain.
  - If you include a property path for the action property (e.g. 'MyApp.someController.someMethod'), then the method you name will be executed.
  - If you include a function in the action property, then the function will be executed.  If you also include a target object, the function will be called with this set to the target object.

  In general these properties are read-only.  Changing an interval, target,
  or action after creating a timer will have an unknown effect.

  h2. Scheduling Repeating Timers
  
  In addition to scheduling one time timers, you can also schedule timers to
  execute periodically until some termination date.  You make a timer
  repeating by adding the repeats: YES property:
  
  {{{
    var timer = SC.Timer.schedule({
      target: myObject, 
      action: 'updateAnimation', 
      interval: 100,
      repeats: YES, 
      until: Time.now() + 1000
    }) ;
  }}}
  
  The above example will execute the myObject.updateAnimation() every 100msec
  for 1 second from the current time.  
  
  If you want a timer to repeat without expiration, you can simply omit the
  until: property.  The timer will then repeat until you invalidate it.
  
  h2. Pausing and Invalidating Timers
  
  If you have created a timer but you no longer want it to execute, you can
  call the invalidate() method on it.  This will remove the timer from the 
  run loop and clear certain properties so that it will not run again.
  
  You can use the invalidate() method on both repeating and one-time timers.
  
  If you do not want to invalidate a timer completely but you just want to
  stop the timer from execution temporarily, you can alternatively set the
  isPaused property to YES:
  
  {{{
    timer.set('isPaused', YES) ;
    // Perform some critical function; timer will not execute
    timer.set('isPaused', NO) ;
  }}}
  
  When a timer is paused, it will be scheduled and will fire like normal, 
  but it will not actually execute the action method when it fires.  For a 
  one time timer, this means that if you have the timer paused when it fires,
  it may never actually execute the action method.  For repeating timers, 
  this means the timer will remain scheduled but simply will not execute its
  action while the timer is paused.
  
  h2. Firing Timers
  
  If you need a timer to execute immediately, you can always call the fire()
  method yourself.  This will execute the timer action, if the timer is not
  paused.  For a one time timer, it will also invalidate the timer and remove
  it from the run loop.  Repeating timers can be fired anytime and it will
  not interrupt their regular scheduled times.

  
  @extends SC.Object
  @author Charles Jolley
  @version 1.0
  @since version 1.0
*/
SC.Timer = SC.Object.extend(
/** @scope SC.Timer.prototype */ {

  /**
    The target object whose method will be invoked when the time fires.
    
    You can set either a target/action property or you can pass a specific
    method.
    
    @type {Object}
    @field
  */
  target: null,
  
  /**
    The action to execute.
    
    The action can be a method name, a property path, or a function.  If you
    pass a method name, it will be invoked on the target object or it will 
    be called up the responder chain if target is null.  If you pass a 
    property path and it resolves to a function then the function will be 
    called.  If you pass a function instead, then the function will be 
    called in the context of the target object.
    
    @type {String, Function}
  */
  action: null,
  
  /**
    The time interval in milliseconds.
    
    You generally set this when you create the timer.  If you do not set it
    then the timer will fire as soon as possible in the next run loop.
    
    @type {Number}
  */
  interval: 0,
  
  /**
    Timer start date offset.
    
    The start date determines when the timer will be scheduled.  The first
    time the timer fires will be interval milliseconds after the start 
    date. 
    
    Generally you will not set this property yourself.  Instead it will be 
    set automatically to the current run loop start date when you schedule 
    the timer.  This ensures that all timers scheduled in the same run loop
    cycle will execute in the sync with one another.
    
    The value of this property is an offset like waht you get if you call
    Date.now().
    
    @type {Number}
  */
  startTime: null,
  
  /**
    YES if you want the timer to execute repeatedly.
    
    @type {Boolean}
  */
  repeats: NO,
  
  /**
    Last date when the timer will execute.
    
    If you have set repeats to YES, then you can also set this property to
    have the timer automatically stop executing past a certain date.
    
    This property should contain an offset value like startOffset.  However if
    you set it to a Date object on create, it will be converted to an offset
    for you.
    
    If this property is null, then the timer will continue to repeat until you
    call invalidate().
    
    @type {Date, Number}
  */
  until: null,
  
  /**
    Set to YES to pause the timer.
    
    Pausing a timer does not remove it from the run loop, but it will 
    temporarily suspend it from firing.  You should use this property if
    you will want the timer to fire again the future, but you want to prevent
    it from firing temporarily.
    
    If you are done with a timer, you should call invalidate() instead of 
    setting this property.
    
    @type {Boolean}
  */
  isPaused: NO,

  /**
    YES onces the timer has been scheduled for the first time.
  */
  isScheduled: NO,
  
  /**
    YES if the timer can still execute.
    
    This read only property will return YES as long as the timer may possibly
    fire again in the future.  Once a timer has become invalid, it cannot 
    become valid again. 
    
    @field
    @type {Boolean}
  */
  isValid: function() {
    return !this._invalid ;
  }.property('isPaused'),
  
  /**
    Returns the next time offset when the property will fire.
    
    This property changes automatically after a timer has fired.  If the 
    timer is invalid this will return 0.
    
    @field
    @type {Number}
  */
  fireTime: null,
  
  /**
    Invalidates the timer so that it will not execute again.  If a timer has
    been scheduled, it will be removed from the run loop immediately.
    
    @returns {SC.Timer} The receiver
  */
  invalidate: function() {
    this.propertyWillChange('isValid') ;
    this._invalid = YES ;
    SC.runLoop.cancelTimer(this) ;
    this.propertyDidChange('isValid') ;
    this.action = this.target = null ; // avoid memory leaks
    return this ;
  },
  
  /**
    Immediately fires the timer.
    
    If the timer is not-repeating, it will be invalidated.  If it is repeating
    you can call this method without interrupting its normal schedule.
    
    @returns {void}
  */
  fire: function() {
    
    // whenever the timer fires, calculate the next fireTime immediately.
    var nextFireTime = this._computeNextFireTime();
    
    // now perform the fire action unless paused.
    if (!this.get('isPaused')) this.performAction() ;
    
     // reschedule the timer if needed...
     (nextFireTime>0) ? this.schedule() : this.invalidate();
  },

  /**
    Actually fires the action. You can override this method if you need
    to change how the timer fires its action.
  */
  performAction: function() {
    // if the action is a function, just try to call it.
    if ($type(this.action) == T_FUNCTION) {
      this.action.call((this.target || this), this) ;

    // otherwise, action should be a string.  If it has a period, treat it
    // like a property path.
    } else if (this.action.indexOf('.') >= 0) {
      var path = this.action.split('.') ;
      var property = path.pop() ;

      var target = SC.Object.objectForPropertyPath(path, window) ;
      var action = (target.get) ? target.get(property) : target[property];
      if (action && $type(action) == T_FUNCTION) {
        action.call(target, this) ;
      } else {
        throw '%@: Timer could not find a function at %@'.fmt(this, this.action) ;
      }

    // otherwise, try to execute action direction on target or send down
    // responder chain.
    } else SC.app.sendAction(this.action, this.target, this) ;
  },
  
  /**
    Schedules the timer to execute in the runloop. 
    
    This method is called automatically if you create the timer using the
    schedule() class method.  If you create the timer manually, you will
    need to call this method yourself for the timer to execute.
    
    @returns {SC.Timer} The receiver
  */
  schedule: function() {

    this.beginPropertyChanges();
    
    // if start time was not set explicitly when the timer was created, 
    // get it from the run loop.  This way timer scheduling will always
    // occur in sync.
    if (!this.startTime) this.set('startTime', SC.runLoop.get('startTime')) ;
    
    // If this is the first time the timer was scheduled, compute the fireTime
    var fireTime = (this.fireTime) ? this.get('fireTime') : this._computeNextFireTime() ; // sets the fire time...
    
    // now schedule the timer if needed.
    if (!this._invalid) {
      this.set('isScheduled', YES) ;
      SC.runLoop.scheduleTimer(this, fireTime) ;
    }
    
    this.endPropertyChanges() ;
    
    return this ;
  },
  
  init: function() {
    arguments.callee.base.call(this) ;
    
    // convert startTime and until to times if they are dates.
    if (this.startTime instanceof Date) {
      this.startTime = this.startTime.getTime() ;
    }
    
    if (this.until instanceof Date) {
      this.until = this.until.getTime() ;
    }
  },
  
  // if the paused state changes, notify the runloop so that it can 
  // reschedule its timeout.
  _isPausedObserver: function() {
    SC.runLoop.timerPausedStateDidChange(this) ;
  }.observes('isPaused'),

  /** @private
    Computes the next fireTime and updates the property.
    
    @returns the next fire time (also set on fireTime property)
  */
  _computeNextFireTime: function() {
    
    var fireTime = 0 ;
    if (!this._invalid && this.get('isValid')) {

      var now = Date.now() ;
      var start = this.get('startTime') || now ;
      var until = this.get('until') ;
      
      // only calculate if we have not passed unitl.
      if ((!until) || (until === 0) || (now < until)) {

        var interval = this.get('interval') ;
        var repeats = this.get('repeats') ;
        var cycle = Math.ceil(((now - start) / interval)+0.01) ;
        if (cycle < 1) cycle = 1 ;
        
        fireTime = ((cycle <= 1) || repeats) ? start + (cycle * interval) : 0;
      }
    }
    
    this.setIfChanged('fireTime', fireTime) ;
    return fireTime ;
  }
  
}) ;

/**
  @scope SC.Timer
  
  Created a new timer with the passed properties and schedules it to 
  execute.  This is the same as calling SC.Time.create({ props }).schedule().
  
  @params {Hash} props Any properties you want to set on the timer.
  @returns {SC.Timer} new timer instance.
*/
SC.Timer.schedule = function(props) {
  return this.create(props).schedule() ;
} ;


