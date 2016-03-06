// ==========================================================================
// Project: SproutCore Task Framework
// Copyright: @2013 Michael Krotscheck and contributors
// License: Licensed under MIT license (see license.js)
// ==========================================================================

sc_require("tasks/task");

SC.TaskGroup = SC.Task.extend({
  
  /**
   * @private
   * 
   * Internal flag: Are we rewinding
   */
  isRewinding: NO,
  
  /**
   * The list of tasks which this group should work on, as a list of property
   * names. This will be converted into actual task instances during creation.
   */
  tasks: [],
  
  /**
   * The number of tasks added to this TaskGroup.
   */
  length: function() {
    return this._allTasks.length;
  }.property().idempotent(),
  
  /**
   * This flag indicates whether the this taskGroup may be restarted. It is only
   * true if ALL child tasks are restartable.
   */
  isRestartable: function() {
    return (this._allTasks.filterProperty('isRestartable', false).length == 0);
  }.property().cacheable(),
  
  /**
   * This flag indicates whether the this taskGroup may be canceled. It is only
   * true if ALL child tasks are cancelable.
   */
  isCancelable: function() {
    return (this._allTasks.filterProperty('isCancelable', false).length == 0);
  }.property().cacheable(),
  
  /**
   * This flag indicates whether the this taskGroup may be suspended. It is only
   * true if ALL child tasks are suspendable.
   */
  isSuspendable: function() {
    return (this._allTasks.filterProperty('isSuspendable', false).length == 0);
  }.property().cacheable(),
  
  /**
   * This flag indicates whether the this taskGroup may be rewound. It is only
   * true if ALL child tasks are rewindable.
   */
  isRewindable: function() {
    return (this._allTasks.filterProperty('isRewindable', false).length == 0);
  }.property().cacheable(),
  
  /**
   * @private
   * 
   * Constructor.
   */
  init: function() {
    sc_super();
    
    this._allTasks = [];
    this._activeTasks = [];
    
    // Iterate over our
    var tasks = this.get('tasks'), taskLen = tasks.length, taskName, taskType, taskInstance;
    for( var i = 0; i < taskLen; i++) {
      taskName = tasks[i];
      taskType = this.get(taskName);
      
      if(SC.empty(taskType) || !SC.kindOf(taskType, SC.Task)) {
        console.error("ERROR: Child tasks must extend SC.Task");
        continue;
      }
      
      taskInstance = taskType.create();
      this.set(taskName, taskInstance);
      this.addTask(taskInstance);
    }
  },
  
  /**
   * @private
   * 
   * Internal storage for all instantiated tasks.
   */
  _allTasks: null,
  
  /**
   * @private
   * 
   * Internal storage for all currently running tasks.
   */
  _activeTasks: null,
  
  /**
   * Adds the specified task to this TaskGroup.
   * 
   * @param task
   *          the Task to be added to this TaskGroup
   * @return true if the Task was successfully added to this TaskGroup
   */
  addTask: function(task) {
    
    if(!SC.kindOf(task, SC.Task)) {
      this._logMessage("ERROR: Cannot add task that does not extend SC.Task");
      return;
    }
    
    var taskState = task.get('state'), K = SC.TaskState, L = SC.TaskEvent;
    
    if(taskState == K.FINISHED) {
      this._logMessage("Attempt to add Task '%@' to a TaskGroup which is not restartable".fmt(task.toString()));
      return false;
    }
    if(taskState != K.INACTIVE) {
      this._logMessage("Attempt to add an already active Task '%@' to a TaskGroup".fmt(task.toString()));
      return false;
    }
    
    this._logMessage("Adding Task: %@".fmt(task.toString()));
    
    task.addEventListener(L.COMPLETE, this, '_tg_onChildComplete');
    task.addEventListener(L.ERROR, this, '_tg_onChildError');
    
    this._allTasks.push(task);
    this.handleTaskAdded(task);
    
    return true;
  },
  
  /**
   * Removes the specified task from this TaskGroup.
   * 
   * @param task
   *          the Task to be removed from this TaskGroup
   * @return false if the Task was successfully removed from this TaskGroup
   */
  removeTask: function(task) {
    var wasActive, taskIndex, K = SC.TaskState, L = SC.TaskEvent, state = this.get('state');
    wasActive = this.removeActiveTask(task);
    taskIndex = this._allTasks.indexOf(task);
    
    if(taskIndex == -1) {
      return false;
    }
    
    task.removeEventListener(L.COMPLETE, this, '_tg_onChildComplete');
    task.removeEventListener(L.ERROR, this, '_tg_onChildError');
    
    this._allTasks.splice(taskIndex, 1);
    
    this.handleTaskRemoved(task, taskIndex);
    
    if(wasActive && (state == K.ACTIVE || state == K.SUSPENDED)) {
      this.handleTaskComplete(task);
    }
    return true;
  },
  
  /**
   * Removes all tasks from this TaskGroup.
   */
  removeAllTasks: function(task) {
    var K = SC.TaskState, state = this.get('state');
    
    while(this.get('length') > 0) {
      this.removeTask(this.getTask(0));
    }
    
    this._activeTasks.length = 0;
    
    this.handleRemoveAll();
    if(state == K.ACTIVE) {
      this.complete();
    }
  },
  
  /**
   * Returns the Task at the specified index.
   * 
   * @param index
   *          the zero-based index of the Task to return.
   * @return the Task at the specified index
   */
  getTask: function(index) {
    return this._allTasks[index];
  },
  
  /**
   * @private
   * 
   * This method starts the specified child task.
   * 
   * @param task
   *          the Task that should be started
   */
  startChildTask: function(task) {
    if(this._activeTasks.indexOf(task) == -1) {
      this._activeTasks.push(task);
    }
    
    task.start();
  },
  
  /**
   * Method hook for subclasses that gets called when a child Task has completed
   * its operation.
   * 
   * @param task
   *          the Task that has completed its operation
   */
  handleTaskComplete: function(task) {
    this._logMessage("WARNING: %@ did not implement handleTaskComplete".fmt(this.toString()));
  },
  
  /**
   * @private
   */
  suspendTask: function() {
    var len = this._activeTasks.length, K = SC.TaskState;
    for( var i = 0; i < len; i++) {
      try {
        var task = this._activeTasks[i];
        if(task.get('state') != K.SUSPENDED) {
          task.suspend();
        }
      } catch(e) {
        // Do nothing, keep going.
      }
    }
  },
  
  /**
   * @private
   */
  resumeTask: function() {
    var len = this._activeTasks.length, K = SC.TaskState;
    if(len == 0) {
      this.complete();
    }
    
    for( var i = 0; i < len; i++) {
      var task = this._activeTasks[i];
      var taskState = task.get('state');
      
      if(taskState == K.INACTIVE) {
        // Task was added to TaskGroup while TaskGroup was suspended
        this.startChildTask(task);
      } else {
        task.resume();
      }
    }
  },
  
  /**
   * @private
   */
  cancelTask: function() {
    var len = this._activeTasks.length;
    for( var i = 0; i < len; i++) {
      try {
        var task = this._activeTasks[i];
        task.cancel();
      } catch(e) {
      }
    }
    // Truncate the active tasks.
    this._activeTasks.length = 0;
  },
  
  /**
   * @private
   */
  rewindTask: function() {
    if(!this.isRewinding) {
      this.isRewinding = YES;
      
      var len = this._activeTasks.length;
      for( var i = 0; i < len; i++) {
        try {
          var task = this._activeTasks[i];
          task.rewind();
        } catch(e) {
        }
      }
    }
  },
  
  /**
   * Method hook for subclasses that gets called when a child Task was added to
   * this TaskGroup.
   * 
   * @param task
   *          the Task that was added to this TaskGroup
   */
  handleTaskAdded: function(task) {
    this._logMessage("WARNING: %@ does not implement handleTaskAdded".fmt(this.constructor.toString()));
  },
  
  /**
   * Method hook for subclasses that gets called when a child Task was removed
   * from this TaskGroup.
   * 
   * @param task
   *          the Task that was removed from this TaskGroup
   * @param index
   *          the zero-based index of the removed Task
   */
  handleTaskRemoved: function(task, index) {
    this._logMessage("WARNING: %@ does not implement handleTaskRemoved".fmt(this.constructor.toString()));
  },
  
  /**
   * Method hook for subclasses that gets called when all child tasks have been
   * removed from this TaskGroup.
   */
  handleRemoveAll: function() {
    this._logMessage("WARNING: %@ does not implement handleRemoveAll".fmt(this.constructor.toString()));
  },
  
  /**
   * @private
   * 
   * Adds a task to the active task list.
   */
  addActiveTask: function(task) {
    
    if(this._allTasks.indexOf(task) == -1) {
      this._logMessage("Cannot add an active task that is not in the _allTasks collection.");
      return;
    }
    
    var index = this._activeTasks.indexOf(task);
    if(index == -1) {
      this._activeTasks.push(task);
    }
  },
  
  /**
   * @private
   * 
   * Removes a task from the active task list.
   */
  removeActiveTask: function(task) {
    var index = this._activeTasks.indexOf(task);
    if(index != -1) {
      this._activeTasks.splice(index, 1);
      return true;
    }
    return false;
  },
  
  /**
   * @private
   * 
   * Cleans up the children, detaching all event listeners.
   */
  destroy: function() {
    this.removeAllTasks();
    sc_super();
  },
  
  /**
   * @private
   * 
   * Child event handler, for COMPLETE events on children.
   * 
   * @param event
   */
  _tg_onChildComplete: function(event) {
    var state = this.get('state'), K = SC.TaskState, task = event.target;
    
    if(!this.removeActiveTask(task)) {
      this._logMessage("Task '%@' threw COMPLETE event but was not active in this TaskGroup".fmt(task.toString()));
      return;
    }
    
    if(state != K.ACTIVE) {
      logger.error("Task '%@' threw COMPLETE event while TaskGroup was in illegal state: %@".fmt(task.toString, state));
      return;
    }
    
    this.handleTaskComplete(task);
  },
  
  /**
   * @private
   * 
   * Child event handler, for ERROR events on children.
   * 
   * @param event
   */
  _tg_onChildError: function(event, message) {
    this.error(message);
  },
});
