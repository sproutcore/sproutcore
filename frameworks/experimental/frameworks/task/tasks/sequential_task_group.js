// ==========================================================================
// Project: SproutCore Task Framework
// Copyright: @2013 Michael Krotscheck and contributors
// License: Licensed under MIT license (see license.js)
// ==========================================================================

sc_require("tasks/task_group");
sc_require("enum/state");

/**
 * The SequentialTaskGroup allows a user to execute multiple, asynchronous tasks
 * in order, and will report back once all of them are either
 * <code>FINISHED</code> or one of them terminated with an error. If this
 * group is suspended or cancelled, only the current active task will be
 * suspended/cancelled.
 * 
 * This Task Group may only be suspended, cancelled, rewound, or restarted if
 * ALL child tasks are capable of performing this action. Thus you cannot rewind
 * a task group if one of its children does not implement rewindTask().
 * 
 * If rewind() is called, the current active task is rewound, and every previous task will be rewound afterwards.
 * 
 * <pre>
 * {@code
 * var myTaskGroup = SC.Task.SequentialTaskGroup.create({
 * 
 * 		tasks: ['myFirstTask', 'mySecondTask', 'myThirdTask'],
 * 
 * 		myFirstTask : SC.Task.plugin(&quot;MyApp.MyFirstTask&quot;, { param: 'foo' }),
 * 		mySecondTask : SC.Task.plugin(&quot;MyApp.MySecondTask&quot;, { param: 'bar' }),
 * 		myThirdTask : SC.Task.plugin(&quot;MyApp.MyThirdTask&quot;, { param: 'baz' }),
 * 		
 * 		startTask : function() {
 * 			var firstTask = this.get('myFirstTask');
 * 			SC.Event.add(firstTask, SC.TaskEvent.FINISHED, this, &quot;_firstTaskComplete&quot;);
 * 			
 * 			sc_super();
 * 		},
 * 
 * 		_firstTaskComplete : function(event) {
 *			// Do something
 * 			SC.Event.remove(firstTask, SC.TaskEvent.FINISHED, this, &quot;_firstTaskComplete&quot;);
 * 		}
 * });
 * 
 * SC.TaskEvent.add(myTaskGroup, &quot;complete&quot;, myObj, &quot;_onTaskComplete&quot;);
 * SC.TaskEvent.add(myTaskGroup, &quot;error&quot;, myObj, &quot;_onTaskError&quot;);
 * 
 * myTaskGroup.start();
 * 
 * }
 * 
 * @author Michael Krotscheck
 * 
 */
SC.SequentialTaskGroup = SC.TaskGroup.extend({

	/**
	 * @private
	 * 
	 * Internal index that keeps track of what step we're on.
	 */
	_currentIndex : 0,

	/**
	 * @override
	 */
	startTask : function() {
		this._currentIndex = 0;
		this._nextTask();
	},

	/**
	 * @private
	 * 
	 * When a task is removed, make sure we adjust the index if necessary.
	 */
	handleTaskRemoved : function(task, index) {
		if (index <= this._currentIndex) {
			this._currentIndex--;
		}
	},

	/**
	 * @private
	 * 
	 * When all tasks are removed, clear the current index.
	 */
	handleRemoveAll : function() {
		this._currentIndex = 0;
	},

	/**
	 * @private
	 * 
	 * When a child task completes, check to see whether we're moving on to the
	 * next task.
	 */
	handleTaskComplete : function(t) {
		var state = this.get('state'), K = SC.TaskState, length = this.get('length'), isRewinding = this.get('isRewinding');

		// Increment our index
		this._currentIndex += isRewinding ? -1 : 1;

		if (state == K.ACTIVE) {
			// We're currently active, so move on to the next task.
			this._nextTask();
		} else if (state == K.SUSPENDED && length > this._currentIndex) {
			// Add the new task to the active task list, so that it will be started when resume is called.
			this.addActiveTask(this._allTasks[this._currentIndex]);
		}
	},

	/**
	 * @private
	 * 
	 * Execute the next task in the list. If we don't have any left, fire
	 * complete.
	 */
	_nextTask : function() {
		var size = this.get('length'), isRewinding = this.get('isRewinding');

		if (size == this._currentIndex || (isRewinding && this._currentIndex == 0)) {
			this._logMessage("Completed all tasks");
			this.complete();
		} else {
			var task = this.getTask(this._currentIndex);
			this._logMessage("Starting next task: %@".fmt(task));
			this.startChildTask(task);
		}
	}

});