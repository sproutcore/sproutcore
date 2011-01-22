// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require("tasks/task");

/**
  Runs a set of tasks. Most importantly, has a runWhenIdle option that allows
  it to run when no user input is occurring. This allows, for instance, preloading
  bundles while not blocking user interaction.
*/
SC.TaskQueue = SC.Task.extend({
  /**
    If YES, the queue will automatically run in the background when the browser idles.
  */
  runWhenIdle: NO,
  
  /**
    A limit which, if exceeded, the task queue will wait until a later run
    to continue.
  */
  runLimit: 50,
  
  /**
    The duration between idle runs.
  */
  interval: 50,
  
  /**
    If running, YES.
  */
  isRunning: NO,
  
  /**
    The minimum elapsed time since the last event. As a rule of thumb, perhaps
    something equivalent to the expected duration of a task.
  */
  minimumIdleDuration: 500,
  
  _tasks: [],
  
  /**
    Returns YES if there are tasks in the queue.
  */
  hasTasks: function() {
    return this._tasks.length > 0;
  }.property('taskCount').cacheable(),
  
  /**
    Returns the number of tasks in the queue.
  */
  taskCount: function() {
    return this._tasks.length;
  }.property().cacheable(),
  
  /**
    Adds the task to the end of the queue.
  */
  push: function(task) {
    this._tasks.push(task);
    this.notifyPropertyChange('taskCount');
  },
  
  /**
    Removes and returns the first task in the queue.
  */
  next: function() {
    // null if there is no task
    if (this._tasks.length < 1) return null;
    
    // otherwise, return the first one in the queue
    var next = this._tasks.shift();
    this.notifyPropertyChange('taskCount');
    return next;
  },
  
  /**
    @private
    Sets up idling if needed when the task count changes.
  */
  _taskCountDidChange: function() {
    this._setupIdle();
  }.observes('taskCount'),
  
  /**
    Sets up the scheduled idling check if needed and applicable.
    @private
  */
  _setupIdle: function() {
    if (this.get('runWhenIdle') && !this._idleIsScheduled && this.get('taskCount') > 0) {
      var self = this;
      setTimeout(
        function(){
          self._idleEntry();
        }, 
        this.get('interval')
      );
      this._idleIsScheduled = YES;
    }
  },
  
  /**
    The entry point for the idle.
    @private
  */
  _idleEntry: function() {
    this._idleIsScheduled = NO;
    var last = SC.RunLoop.lastRunLoopEnd;
    if (Date.now() - last > this.get('minimumIdleDuration')) {
      // if no recent events (within < 1s)
      this.run();
    } else {
      SC.run(function() {
        this._setupIdle();        
      }, this);
      SC.RunLoop.lastRunLoopEnd = last; // we were never here
    }
  },
  
  /**
    Runs tasks until limit (TaskQueue.runLimit by default) is reached.
  */
  run: function(limit) {
    this.set("isRunning", YES);
    if (!limit) limit = this.get("runLimit");
    
    var task, start = Date.now();
    
    while (task = this.next()) {
      task.run(this);
      
      // check if the limit has been exceeded
      if (Date.now() - start > limit) break;
    }
    
    // set up idle timer if needed
    this._setupIdle();
    
    this.set("isRunning", NO);
  }
  
  
});

SC.backgroundTaskQueue = SC.TaskQueue.create({
  runWhenIdle: YES
});
