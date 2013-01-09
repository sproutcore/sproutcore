// ==========================================================================
// Project: SproutCore Task Framework
// Copyright: @2013 Michael Krotscheck and contributors
// License: Licensed under MIT license (see license.js)
// ==========================================================================

module("Task.SequentialTaskGroup", {

	setup : function() {
		window.taskTarget = [];
	},
	teardown : function() {
		window.taskTarget = [];
	}
});

window.taskTarget = [];

TestSequentialTask = SC.Task.extend({
	letter : "a",
	startTask : function() {
		window.taskTarget.push(this.get('letter'));
		this.complete();
	}
});

TestSequentialGroup = SC.SequentialTaskGroup.extend({
	tasks : [ 'taskOne', 'taskTwo', 'taskThree' ],
	taskOne : TestSequentialTask,
	taskTwo : TestSequentialTask.extend({
		letter : "b"
	}),
	taskThree : SC.Task.plugin('TestSequentialTask', {
		letter : "c"
	})
});

test("Test Identity", function() {
	ok(SC.SequentialTaskGroup, "TaskGroup must exist");
	ok(SC.kindOf(SC.SequentialTaskGroup, SC.TaskGroup), "SC.SequentialTaskGroup must extend SC.TaskGroup");
});

test("Test Basic execution", function() {
	var task = TestSequentialGroup.create();

	equals(task.get('state'), SC.TaskState.INACTIVE, "Task must start INACTIVE");
	equals(task.get('length'), 3, "We must start with three tasks");
	ok(task.start(), "Task must start");
	ok(taskTarget.indexOf('a') == 0, "Target must contain 'a' at index 0");
	ok(taskTarget.indexOf('b') == 1, "Target must contain 'b' at index 1");
	ok(taskTarget.indexOf('c') == 2, "Target must contain 'c' at index 2");
	ok(taskTarget.length == 3, "Target length must be 3");
	equals(task.get('state'), SC.TaskState.FINISHED, "Task must finish FINISHED");
});