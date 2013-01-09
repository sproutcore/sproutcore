// ==========================================================================
// Project: SproutCore Task Framework
// Copyright: @2013 Michael Krotscheck and contributors
// License: Licensed under MIT license (see license.js)
// ==========================================================================

sc_require("tasks/task_group");
sc_require("enum/state");

/**
 * The ParallelTaskGroup allows a user to execute multiple, asynchronous tasks
 * simultaneously, and will report back once all of them are either
 * <code>FINISHED</code> or one of them terminated with an error. If this
 * group is suspended or cancelled, all child tasks that are still running will
 * also be suspended and cancelled in turn.
 * 
 * This Task Group may only be suspended, cancelled, rewound, or restarted if
 * ALL child tasks are capable of performing this action. Thus you cannot rewind
 * a task group if one of its children does not implement rewindTask().
 * 
 * If rewind() is called, all child tasks will be rewound simultaneously.
 * 
 * If a task is added to an already running ParallelTaskGroup, it will be
 * executed immediately, unless the ParallelTaskGroup is currently rewinding.s
 * 
 * <pre>
 * {@code
 * var myTaskGroup = SC.Task.ParallelTaskGroup.create({
 * 
 * 		tasks: ['myFirstTask', 'mySecondTask', 'myThirdTask'],
 * 
 * 		myFirstTask : SC.Task.plugin(&quot;MyApp.MyFirstTask&quot;, { param: 'foo' }),
 * 		mySecondTask : SC.Task.plugin(&quot;MyApp.MySecondTask&quot;, { param: 'bar' }),
 * 		myThirdTask : SC.Task.plugin(&quot;MyApp.MyThirdTask&quot;, { param: 'baz' }),
 * 		
 * 		startTask : function() {
 * 			var firstTask = this.get('myFirstTask');
 * 			firstTask.addEventListener(SC.TaskEvent.FINISHED, this, &quot;_firstTaskComplete&quot;);
 * 
 * 			sc_super();
 * 		},
 * 
 * 		_firstTaskComplete : function(event) {
 *			// Do something
 *      var firstTask = this.get('myFirstTask');
 * 			firstTask.removeEventListener(SC.TaskEvent.FINISHED, this, &quot;_firstTaskComplete&quot;);
 * 		}
 * });
 * 
 * myTaskGroup.addEventListener(&quot;complete&quot;, myObj, &quot;_onTaskComplete&quot;);
 * myTaskGroup.addEventListener(&quot;error&quot;, myObj, &quot;_onTaskError&quot;);
 * 
 * myTaskGroup.start();
 * 
 * }
 * 
 * @author Michael Krotscheck
 * 
 */
SC.ParallelTaskGroup = SC.TaskGroup.extend({

	/**
	 * @private
	 */
	startTask : function() {
		var len = this.get('length');
		if (len == 0) {
			this.complete();
			return;
		}

		// Add all the tasks before starting them, because fired complete events
		// might cause the _activeTasks array to appear prematurely empty.
		for ( var i = 0; i < len; i++) {
			var task = this.getTask(i);
			this.addActiveTask(task);
		}

		for ( var i = 0; i < len; i++) {
			var task = this.getTask(i);
			this.startChildTask(task);
		}
	},

	/**
	 * @private
	 */
	rewindTask : function() {
		var len = this.get('length');
		if (len == 0) {
			this.complete();
			return;
		}

		// Add all the tasks before starting them, because fired complete events
		// might cause the _activeTasks array to appear prematurely empty.
		for ( var i = 0; i < len; i++) {
			var task = this.getTask(i);
			this.addActiveTask(task);
		}

		for ( var i = 0; i < len; i++) {
			var task = this.getTask(i);
			task.rewind();
		}

	},

	/**
	 * If a task is added to a parallel group, we may have to start it
	 * immediately.
	 * 
	 * @param task
	 */
	handleTaskAdded : function(task) {
		var state = this.get('state'), K = SC.TaskState, isRewinding = this.get('isRewinding');

		if (isRewinding) {
			return;
		}
		if (state == K.ACTIVE) {
			// Group is already active so we must start the new task immediately
			this.startChildTask(task);
		} else if (state == K.SUSPENDED) {
			// Add the new task to the activeTasks List so it will be started when resuming the TaskGroup
			this.addActiveTask(task);
		}
	},

	/**
	 * @override
	 */
	handleTaskComplete : function(task) {
		var K = SC.TaskState, state = this.get('state');
		if (this._activeTasks.length == 0 && state == K.ACTIVE) {
			this.complete();
		}
	}

});