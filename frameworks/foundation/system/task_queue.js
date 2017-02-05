// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require("tasks/task");

/** @class
  Runs a set of tasks. Most importantly, has a runWhenIdle option that allows
  it to run when no user input is occurring. This allows, for instance, preloading
  bundles while not blocking user interaction.

  ### Basic Use

  SC.backgroundTaskQueue instanciates SC.TaskQueue with the option runWhenIdle
  set to `true`. You can use it to add tasks conveniently.


      SC.backgroundTaskQueue.push(SC.task.create({
        run: function() { return 'mytask'; }
      }));

      // or

      SC.backgroundTaskQueue.push(function() { return 'mytask'; });

  @extends SC.Object
  @extends SC.Task
 */
SC.TaskQueue = SC.Task.extend({

  init: function() {
    var self = this;
    this._doIdleEntry = function() {
      self._idleEntry();
    };

    this._suspendCount = 0;
    this._tasks = [];
  },

  /**
    If YES, the queue will automatically run in the background when the browser idles.

    @type Boolean
    @default NO
  */
  runWhenIdle: NO,

  /**
    A limit which, if exceeded, the task queue will wait until a later run
    to continue.

    @type Number
    @default 50
  */
  runLimit: 50,

  /**
    The duration between idle runs.

    @type Number
    @default 50
  */
  interval: 50,

  /**
    If running, YES.

    @type Boolean
    @default NO
  */
  isRunning: NO,

  /**
    The minimum elapsed time since the last event. As a rule of thumb, perhaps
    something equivalent to the expected duration of a task.

    @type Number
    @default 500
  */
  minimumIdleDuration: 500,

  /** @private */
  _tasks: null,

  /**
    Returns YES if there are tasks in the queue.

    @field
    @type Boolean
  */
  hasTasks: function() {
    return this._tasks.length > 0;
  }.property('taskCount').cacheable(),

  /**
    Returns the number of tasks in the queue.

    @field
    @type Number
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
    Suspends cycling of the queue. Only affects task queues that run when idle,
    such as the backgroundTaskQueue.
  */
  suspend: function() {
    this._suspendCount++;
  },

  /**
    Resumes cycling of the queue.
  */
  resume: function() {
    this._suspendCount--;
    if (this._suspendCount <= 0) {
      this._setupIdle();
    }
  },

  /**
    @private
    Sets up idling if needed when the task count changes.
  */
  _taskCountDidChange: function() {
    this._setupIdle();
  }.observes('taskCount'),

  /**
    When runWhenIdle changes, we need to setup idle again if needed. This allows us to suspend
    and resume processing of the background task queue.
  */
  _runWhenIdleDidChange: function() {
    this._setupIdle();
  }.observes('runWhenIdle'),

  /**
    Sets up the scheduled idling check if needed and applicable.
    @private
  */
  _setupIdle: function() {
    if (
      !this._suspendCount && this.get('runWhenIdle') &&
      !this._idleIsScheduled && this.get('taskCount') > 0
    ) {
      setTimeout(this._doIdleEntry,
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

    // if we are not supposed to run when idle we need to short-circuit out.
    if (!this.get('runWhenIdle') && !this._suspendCount) return;

    // if no recent events (within < 1s)
    if (Date.now() - last > this.get('minimumIdleDuration')) {
      SC.run(this.run, this);
      SC.RunLoop.lastRunLoopEnd = last; // we were never here
    }

    // set up idle timer if needed
    this._setupIdle();
  },

  /**
    Runs tasks until limit (TaskQueue.runLimit by default) is reached.
  */
  run: function(limit) {
    this.set("isRunning", YES);
    if (!limit) limit = this.get("runLimit");

    var task, start = Date.now();

    while (task = this.next()) {
      if (SC.typeOf(task) === SC.T_FUNCTION) {
        task.call(this);
      }
      //@if (debug)
      else if (!task.isTask) {
        SC.error("Developer Error: The added task is not valid.");
      }
      //@endif
      else {
        task.run(this);
      }

      // check if the limit has been exceeded
      if (Date.now() - start > limit) break;
    }

    this.set("isRunning", NO);
  }

});

SC.backgroundTaskQueue = SC.TaskQueue.create({
  runWhenIdle: YES
});
