// ==========================================================================
// Project: SproutCore Task Framework
// Copyright: @2013 Michael Krotscheck and contributors
// License: Licensed under MIT license (see license.js)
// ==========================================================================

module("SC.ParallelTaskGroup", {

	setup : function() {
		window.taskTarget = [];
	},
	teardown : function() {
		window.taskTarget = [];
	}
});

window.taskTarget = [];

TestParallelTask = SC.Task.extend({
	letter : "a",
	startTask : function() {
		window.taskTarget.push(this.get('letter'));
		this.complete();
	}
});

TestParallelGroup = SC.ParallelTaskGroup.extend({
	tasks : [ 'taskOne', 'taskTwo', 'taskThree' ],
	taskOne : TestParallelTask,
	taskTwo : TestParallelTask.extend({
		letter : "b"
	}),
	taskThree : SC.Task.plugin('TestParallelTask', {
		letter : "c"
	})
});

test("Test Identity", function() {
	ok(SC.ParallelTaskGroup, "TaskGroup must exist");
	ok(SC.kindOf(SC.ParallelTaskGroup, SC.TaskGroup), "SC.ParallelTaskGroup must extend SC.TaskGroup");
});

test("Test Basic execution", function() {
	var task = TestParallelGroup.create();

	equals(task.get('state'), SC.TaskState.INACTIVE, "Task must start INACTIVE");
	equals(task.get('length'), 3, "We must start with three tasks");
	ok(task.start(), "Task must start");
	ok(taskTarget.indexOf('a') > -1, "Target must contain 'a'");
	ok(taskTarget.indexOf('b') > -1, "Target must contain 'b'");
	ok(taskTarget.indexOf('c') > -1, "Target must contain 'c'");
	ok(taskTarget.length == 3, "Target length must be 3");
	equals(task.get('state'), SC.TaskState.FINISHED, "Task must finish FINISHED");
});