// ==========================================================================
// Project: SproutCore Task Framework
// Copyright: @2013 Michael Krotscheck and contributors
// License: Licensed under MIT license (see license.js)
// ==========================================================================

module("SC.TaskGroup", {
	setup : function() {
		taskTarget = [];
	},
	teardown : function() {
		taskTarget = [];
	}
});

var taskTarget = [];

TestTask = SC.Task.extend({
	letter : "a",
	startTask : function() {
		taskTarget.push(this.get('letter'));
		this.complete();
	}
});

TestTaskGroup = SC.TaskGroup.extend({
	tasks : [ 'taskOne', 'taskTwo', 'taskThree', 'invalidTask' ],
	taskOne : TestTask,
	taskTwo : TestTask.extend({
		letter : "b"
	}),
	taskThree : SC.Task.plugin('TestTask', {
		letter : "c"
	}),
	invalidTask : SC.Task.plugin('SC.Object')
});

test("Test Identity", function() {
	ok(SC.TaskGroup, "TaskGroup must exist");
	ok(SC.kindOf(SC.TaskGroup, SC.Task), "SC.TaskGroup must extend SC.Task");
});

test("Test Autoconstruction of child tasks.", function() {
	var task = TestTaskGroup.create();

	equals(task.get('length'), 3, "Created task must have three children, ignoring the invalid task");

	equals(task.getTask(0).get('letter'), 'a', "Letters must match");
	equals(task.getTask(1).get('letter'), 'b', "Letters must match");
	equals(task.getTask(2).get('letter'), 'c', "Letters must match");
});

test("Test SC.TaskGroup.isRestartable", function() {
	var restartableInstance = SC.TaskGroup.extend({
		tasks : [ 'test1', 'test2' ],
		test1 : TestTask.extend({
			isRestartable : YES,
		}),
		test2 : TestTask.extend({
			isRestartable : YES,
		})
	}).create();
	equals(restartableInstance.get('isRestartable'), YES, "Group with all restartable children must be restartable");

	var nonRestartableInstance = SC.TaskGroup.extend({
		tasks : [ 'test1', 'test2' ],
		test1 : TestTask.extend({
			isRestartable : NO,
		}),
		test2 : TestTask.extend({
			isRestartable : NO,
		})
	}).create();
	equals(nonRestartableInstance.get('isRestartable'), NO, "Group with no restartable children must not be restartable");

	var mixedInstance = SC.TaskGroup.extend({
		tasks : [ 'test1', 'test2' ],
		test1 : TestTask.extend({
			isRestartable : YES,
		}),
		test2 : TestTask.extend({
			isRestartable : NO,
		})
	}).create();
	equals(mixedInstance.get('isRestartable'), NO, "Group with some restartable children must not be restartable");
});

test("Test SC.TaskGroup.isCancelable", function() {
	var yesInstance = SC.TaskGroup.extend({
		tasks : [ 'test1', 'test2' ],
		test1 : TestTask.extend({
			isCancelable : YES,
		}),
		test2 : TestTask.extend({
			isCancelable : YES,
		})
	}).create();
	equals(yesInstance.get('isCancelable'), YES, "Group with all isCancelable children must be isCancelable");

	var noInstance = SC.TaskGroup.extend({
		tasks : [ 'test1', 'test2' ],
		test1 : TestTask.extend({
			isCancelable : NO,
		}),
		test2 : TestTask.extend({
			isCancelable : NO,
		})
	}).create();
	equals(noInstance.get('isCancelable'), NO, "Group with no isCancelable children must not be isCancelable");

	var mixedInstance = SC.TaskGroup.extend({
		tasks : [ 'test1', 'test2' ],
		test1 : TestTask.extend({
			isCancelable : YES,
		}),
		test2 : TestTask.extend({
			isCancelable : NO,
		})
	}).create();
	equals(mixedInstance.get('isCancelable'), NO, "Group with some isCancelable children must not be isCancelable");

});

test("Test SC.TaskGroup.isSuspendable", function() {
	var yesInstance = SC.TaskGroup.extend({
		tasks : [ 'test1', 'test2' ],
		test1 : TestTask.extend({
			isSuspendable : YES,
		}),
		test2 : TestTask.extend({
			isSuspendable : YES,
		})
	}).create();
	equals(yesInstance.get('isSuspendable'), YES, "Group with all isSuspendable children must be isSuspendable");

	var noInstance = SC.TaskGroup.extend({
		tasks : [ 'test1', 'test2' ],
		test1 : TestTask.extend({
			isSuspendable : NO,
		}),
		test2 : TestTask.extend({
			isSuspendable : NO,
		})
	}).create();
	equals(noInstance.get('isSuspendable'), NO, "Group with no isSuspendable children must not be isSuspendable");

	var mixedInstance = SC.TaskGroup.extend({
		tasks : [ 'test1', 'test2' ],
		test1 : TestTask.extend({
			isSuspendable : YES,
		}),
		test2 : TestTask.extend({
			isSuspendable : NO,
		})
	}).create();
	equals(mixedInstance.get('isSuspendable'), NO, "Group with some isSuspendable children must not be isSuspendable");

});

test("Test SC.TaskGroup.isRewindable", function() {
	var yesInstance = SC.TaskGroup.extend({
		tasks : [ 'test1', 'test2' ],
		test1 : TestTask.extend({
			isRewindable : YES,
		}),
		test2 : TestTask.extend({
			isRewindable : YES,
		})
	}).create();
	equals(yesInstance.get('isRewindable'), YES, "Group with all isRewindable children must be isRewindable");

	var noInstance = SC.TaskGroup.extend({
		tasks : [ 'test1', 'test2' ],
		test1 : TestTask.extend({
			isRewindable : NO,
		}),
		test2 : TestTask.extend({
			isRewindable : NO,
		})
	}).create();
	equals(noInstance.get('isRewindable'), NO, "Group with no isRewindable children must not be isRewindable");

	var mixedInstance = SC.TaskGroup.extend({
		tasks : [ 'test1', 'test2' ],
		test1 : TestTask.extend({
			isRewindable : YES,
		}),
		test2 : TestTask.extend({
			isRewindable : NO,
		})
	}).create();
	equals(mixedInstance.get('isRewindable'), NO, "Group with some isRewindable children must not be isRewindable");

});

test("Test SC.TaskGroup.isRestartable", function() {
	var yesInstance = SC.TaskGroup.extend({
		tasks : [ 'test1', 'test2' ],
		test1 : TestTask.extend({
			isRestartable : YES,
		}),
		test2 : TestTask.extend({
			isRestartable : YES,
		})
	}).create();
	equals(yesInstance.get('isRestartable'), YES, "Group with all isRestartable children must be isRestartable");

	var noInstance = SC.TaskGroup.extend({
		tasks : [ 'test1', 'test2' ],
		test1 : TestTask.extend({
			isRestartable : NO,
		}),
		test2 : TestTask.extend({
			isRestartable : NO,
		})
	}).create();
	equals(noInstance.get('isRestartable'), NO, "Group with no isRestartable children must not be isRestartable");

	var mixedInstance = SC.TaskGroup.extend({
		tasks : [ 'test1', 'test2' ],
		test1 : TestTask.extend({
			isRestartable : YES,
		}),
		test2 : TestTask.extend({
			isRestartable : NO,
		})
	}).create();
	equals(mixedInstance.get('isRestartable'), NO, "Group with some isRestartable children must not be isRestartable");

});

test("Test SC.TaskGroup.addTask & handleTaskAdded", function() {
	// Ensure that handleTaskAdded is invoked.
	var methodInvoked = false;
	var testInstance = SC.TaskGroup.create({
		handleTaskAdded : function(task) {
			methodInvoked = YES;
		}
	});

	equals(testInstance.get('length'), 0, "Initial length must be zero.");
	testInstance.addTask(SC.Task.create());
	ok(methodInvoked, "handleTaskAdded must have been invoked");
	equals(testInstance.get('length'), 1, "New length must be one.");

	testInstance.addTask(SC.Object.create());
	// Must not error out...
	equals(testInstance.get('length'), 1, "New length must be one.");

	// Try a null 
	testInstance.addTask(null);
	// Must not error out...
	equals(testInstance.get('length'), 1, "New length must be one.");
});

test("Test SC.TaskGroup.removeTask & handleTaskRemoved", function() {
	// Ensure that handleTaskAdded is invoked.
	var methodInvoked = false;
	var indexInvoked = null;
	var testClass = SC.TaskGroup.extend({
		tasks : [ 'task1', 'task2' ],
		task1 : SC.Task.extend(),
		task2 : SC.Task.extend(),
		handleTaskRemoved : function(task, taskIndex) {
			methodInvoked = YES;
			indexInvoked = taskIndex;
		}
	});

	var testInstance = testClass.create();

	equals(testInstance.get('length'), 2, "Initial length must be 2.");
	testInstance.removeTask(testInstance.getTask(1));
	ok(methodInvoked, "handleTaskRemoved must have been invoked");
	equals(indexInvoked, 1, "Removed the index in question");
	equals(testInstance.get('length'), 1, "New length must be 1.");

	// Must not error out...
	testInstance.removeTask(SC.Object.create());
	equals(testInstance.get('length'), 1, "New length must be one.");

	// Try a null 
	testInstance.removeTask(null);
	// Must not error out...
	equals(testInstance.get('length'), 1, "New length must be one.");
});

test("Test SC.TaskGroup.removeAllTasks & handleRemoveAll", function() {
	// Ensure that handleTaskAdded is invoked.
	var methodInvoked = false;
	var testClass = SC.TaskGroup.extend({
		tasks : [ 'task1', 'task2' ],
		task1 : SC.Task.extend(),
		task2 : SC.Task.extend(),
		handleRemoveAll : function(task) {
			methodInvoked = YES;
		}
	});

	var testInstance = testClass.create();

	equals(testInstance.get('length'), 2, "Initial length must be 2.");
	testInstance.removeAllTasks();
	ok(methodInvoked, "handleRemoveAllTasks must have been invoked");
	equals(testInstance.get('length'), 0, "New length must be 0.");

	// Multiple invocations must not throw errors.
	testInstance.removeAllTasks();
	equals(testInstance.get('length'), 0, "New length must be 0.");
});

test("Test SC.TaskGroup.addActiveTask and SC.TaskGroup.removeActiveTask", function() {
	var testClass = SC.TaskGroup.extend({
		tasks : [ 'task1', 'task2' ],
		task1 : SC.Task.extend(),
		task2 : SC.Task.extend(),
		handleRemoveAllTasks : function(task) {
			methodInvoked = YES;
		}
	});

	var testInstance = testClass.create();

	equals(testInstance._activeTasks.length, 0, "No active tasks to start with");
	// non task must not be added.
	testInstance.addActiveTask({});
	equals(testInstance._activeTasks.length, 0, "No active tasks");

	// Non internal task must not be added to active tasks.
	testInstance.addActiveTask(SC.Task.create());
	equals(testInstance._activeTasks.length, 0, "No active tasks");

	// Adding an internal task must work.
	testInstance.addActiveTask(testInstance.get('task1'));
	equals(testInstance._activeTasks.length, 1, "1 active task");

	// Adding a duplicate internal task must fail.
	testInstance.addActiveTask(testInstance.get('task1'));
	equals(testInstance._activeTasks.length, 1, "1 active task");

	// Try to remove a task that's not a task...
	testInstance.removeActiveTask({});
	equals(testInstance._activeTasks.length, 1, "1 active task");

	// Try to remove a task that's not internal
	testInstance.removeActiveTask(SC.Task.create());
	equals(testInstance._activeTasks.length, 1, "1 active task");

	// Try to remove an internal task that's not active.
	testInstance.removeActiveTask(testInstance.get('task2'));
	equals(testInstance._activeTasks.length, 1, "1 active task");

	// Try to remove a valid task.
	testInstance.removeActiveTask(testInstance.get('task1'));
	equals(testInstance._activeTasks.length, 0, "0 active tasks");
});