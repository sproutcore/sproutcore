// ==========================================================================
// Project: SproutCore Task Framework
// Copyright: @2013 Michael Krotscheck and contributors
// License: Licensed under MIT license (see license.js)
// ==========================================================================

module("SC.Task", {

	setup : function() {
		TaskReceiver.clear();
	},
	teardown : function() {
		TaskReceiver.clear();
	}
});

var TaskReceiver = {

	_task : null,

	_expectedEvents : [],

	_lastEventIndex : 0,

	_onTaskEvent : function(event) {
		var expectedEvent = this._expectedEvents[this._lastEventIndex];

		if (SC.empty(expectedEvent)) {
			ok(false, "Unexpected event encountered: %@".fmt(event.type));
		}

		equals(event.type, expectedEvent.eventType, "Expected event [%@]".fmt(expectedEvent.eventType));
		equals(event.target.get('state'), expectedEvent.taskState, "Expected state [%@]".fmt(expectedEvent.taskState));

		this._lastEventIndex++;
	},

	addExpectedEvent : function(eventType, taskState) {
		this._expectedEvents.push({
			'eventType' : eventType,
			'taskState' : taskState
		});
	},

	clear : function() {
		this._lastEventIndex = 0;
		this._expectedEvents = [];

		if (this._task) {
			SC.Event.remove(this._task, SC.TaskEvent.START, this, "_onTaskEvent");
			SC.Event.remove(this._task, SC.TaskEvent.COMPLETE, this, "_onTaskEvent");
			SC.Event.remove(this._task, SC.TaskEvent.SUSPEND, this, "_onTaskEvent");
			SC.Event.remove(this._task, SC.TaskEvent.RESUME, this, "_onTaskEvent");
			SC.Event.remove(this._task, SC.TaskEvent.CANCEL, this, "_onTaskEvent");
			SC.Event.remove(this._task, SC.TaskEvent.ERROR, this, "_onTaskEvent");
			SC.Event.remove(this._task, SC.TaskEvent.REWIND, this, "_onTaskEvent");

			this._task = null;
		}
	},

	listen : function(task) {
		this._task = task;

		SC.Event.add(task, SC.TaskEvent.START, this, "_onTaskEvent");
		SC.Event.add(task, SC.TaskEvent.COMPLETE, this, "_onTaskEvent");
		SC.Event.add(task, SC.TaskEvent.SUSPEND, this, "_onTaskEvent");
		SC.Event.add(task, SC.TaskEvent.RESUME, this, "_onTaskEvent");
		SC.Event.add(task, SC.TaskEvent.CANCEL, this, "_onTaskEvent");
		SC.Event.add(task, SC.TaskEvent.ERROR, this, "_onTaskEvent");
		SC.Event.add(task, SC.TaskEvent.REWIND, this, "_onTaskEvent");
	},

	assertAllEventsFired : function() {
		equals(this._lastEventIndex, this._expectedEvents.length, "All events must have been fired");
	}
};

/**
 * Demonstrates that tasks exist.
 */
test("Basic properties", function() {
	ok(SC.Task, "Class must exist");

	// default values...
	var task = SC.Task.create();
	equals(task.get('name'), "SC.Task", "Name must have a default value");
	task = SC.Task.create({
		name : "FooTask"
	});
	equals(task.get('name'), "FooTask", "Name must be overridable");

	equals(task.get('isRestartable'), false, "isRestartable default is FALSE");
	equals(task.get('isCancelable'), false, "isCancelable default is FALSE");
	equals(task.get('isSuspendable'), false, "isSuspendable default is FALSE");
	equals(task.get('isRewindable'), false, "isRewindable default is FALSE");
	equals(task.get('rewindOnError'), false, "rewindOnError default is FALSE");
	equals(task.get('rewindOnCancel'), false, "rewindOnCancel default is FALSE");
	equals(task.get('state'), SC.TaskState.INACTIVE, "state default is INACTIVE");
});

test("Demonstrate the basic task lifecycle.", function() {
	var task = SC.Task.create({});

	// We're expecting a start and a complete event.
	equals(task.get('state'), SC.TaskState.INACTIVE, "state default is INACTIVE");

	TaskReceiver.addExpectedEvent(SC.TaskEvent.START, SC.TaskState.ACTIVE);
	TaskReceiver.addExpectedEvent(SC.TaskEvent.COMPLETE, SC.TaskState.FINISHED);
	TaskReceiver.listen(task);

	task.start();
	TaskReceiver.assertAllEventsFired();
});

test("Demonstrate the restartable lifecycle.", function() {
	var task = SC.Task.create({
		isRestartable : YES
	});

	// We're expecting a start and a complete event.
	equals(task.get('state'), SC.TaskState.INACTIVE, "state default is INACTIVE");

	TaskReceiver.addExpectedEvent('start', SC.TaskState.ACTIVE);
	TaskReceiver.addExpectedEvent('complete', SC.TaskState.INACTIVE);
	TaskReceiver.listen(task);

	task.start();
	TaskReceiver.assertAllEventsFired();
});

test("Demonstrate the suspend/resume lifecycle with isSuspendable as false.", function() {
	// With isSuspendable as false.
	var task = SC.Task.create({
		startTask : function() {
			ok(!this.suspend(), "Suspension must fail.");
		}
	});

	// We're expecting a start and a complete event.
	TaskReceiver.addExpectedEvent('start', SC.TaskState.ACTIVE);
	TaskReceiver.listen(task);
	task.start();
	TaskReceiver.assertAllEventsFired();
});

test("Demonstrate the suspend/resume lifecycle with isSuspendable as true.", function() {
	var task = SC.Task.create({
		isSuspendable : YES,
		startTask : function() {
			ok(this.suspend(), "Suspension must succeed.");
		},
		suspendTask : function() {
			ok(this.resume(), "Resumption must succeed.");
		},
		resumeTask : function() {
			this.complete();
		}
	});

	// We're expecting a start and a complete event.
	TaskReceiver.addExpectedEvent(SC.TaskEvent.START, SC.TaskState.ACTIVE);
	TaskReceiver.addExpectedEvent(SC.TaskEvent.SUSPEND, SC.TaskState.SUSPENDED);
	TaskReceiver.addExpectedEvent(SC.TaskEvent.RESUME, SC.TaskState.ACTIVE);
	TaskReceiver.addExpectedEvent(SC.TaskEvent.COMPLETE, SC.TaskState.FINISHED);
	TaskReceiver.listen(task);
	task.start();
	TaskReceiver.assertAllEventsFired();
});

test("Demonstrate the cancel lifecycle with isCancelable as false.", function() {
	var task = SC.Task.create({
		startTask : function() {
			ok(!this.cancel(), "Canceling must fail.");
		}
	});

	// We're expecting a start and a complete event.
	TaskReceiver.addExpectedEvent(SC.TaskEvent.START, SC.TaskState.ACTIVE);
	TaskReceiver.listen(task);
	task.start();
	TaskReceiver.assertAllEventsFired();
});

test("Demonstrate the cancel lifecycle with isCancelable as true.", function() {
	var task = SC.Task.create({
		isCancelable : YES,
		startTask : function() {
			ok(this.cancel(), "Canceling must succeed.");
		}
	});

	// We're expecting a start and a complete event.
	TaskReceiver.addExpectedEvent(SC.TaskEvent.START, SC.TaskState.ACTIVE);
	TaskReceiver.addExpectedEvent(SC.TaskEvent.CANCEL, SC.TaskState.FINISHED);
	TaskReceiver.listen(task);
	task.start();
	TaskReceiver.assertAllEventsFired();
});

test("Demonstrate the cancel lifecycle with isCancelable as true and isRestartable as true.", function() {
	var task = SC.Task.create({
		isCancelable : YES,
		isRestartable : YES,
		startTask : function() {
			ok(this.cancel(), "Canceling must succeed.");
		}
	});

	// We're expecting a start and a complete event.
	TaskReceiver.addExpectedEvent(SC.TaskEvent.START, SC.TaskState.ACTIVE);
	TaskReceiver.addExpectedEvent(SC.TaskEvent.CANCEL, SC.TaskState.INACTIVE);
	TaskReceiver.listen(task);
	task.start();
	TaskReceiver.assertAllEventsFired();
});

test("Demonstrate the cancel lifecycle with isCancelable as true and a suspended task.", function() {
	var task = SC.Task.create({
		isCancelable : YES,
		isSuspendable : YES,
		startTask : function() {
			ok(this.suspend(), "Suspending must succeed.");
		},
		suspendTask : function() {
			ok(this.cancel(), "Canceling must succeed.");
		}
	});

	// We're expecting a start and a complete event.
	TaskReceiver.addExpectedEvent(SC.TaskEvent.START, SC.TaskState.ACTIVE);
	TaskReceiver.addExpectedEvent(SC.TaskEvent.SUSPEND, SC.TaskState.SUSPENDED);
	TaskReceiver.addExpectedEvent(SC.TaskEvent.CANCEL, SC.TaskState.FINISHED);
	TaskReceiver.listen(task);
	task.start();
	TaskReceiver.assertAllEventsFired();
});

test("Demonstrate that you cannot resume a cancelled, suspended task.", function() {
	var task = SC.Task.create({
		isCancelable : YES,
		isSuspendable : YES,
		startTask : function() {
			ok(this.suspend(), "Suspending must succeed.");
		},
		suspendTask : function() {
			ok(this.cancel(), "Canceling must succeed.");
		},
		cancelTask : function() {
			ok(!this.resume(), "Resuming must fail");
		}
	});

	// We're expecting a start and a complete event.
	TaskReceiver.addExpectedEvent(SC.TaskEvent.START, SC.TaskState.ACTIVE);
	TaskReceiver.addExpectedEvent(SC.TaskEvent.SUSPEND, SC.TaskState.SUSPENDED);
	TaskReceiver.addExpectedEvent(SC.TaskEvent.CANCEL, SC.TaskState.FINISHED);
	TaskReceiver.listen(task);
	task.start();
	TaskReceiver.assertAllEventsFired();
});

test("Demonstrate rewind lifecycle with isRewindable set to false.", function() {
	var task = SC.Task.create({
		startTask : function() {
			ok(!this.rewind(), "Rewinding must fail.");
		}
	});

	// We're expecting a start and a complete event.
	TaskReceiver.addExpectedEvent(SC.TaskEvent.START, SC.TaskState.ACTIVE);
	TaskReceiver.listen(task);
	task.start();
	TaskReceiver.assertAllEventsFired();
});

test("Demonstrate rewind lifecycle with isRewindable set to true in active state.", function() {
	var task = SC.Task.create({
		isRewindable : YES,
		startTask : function() {
			ok(this.rewind(), "Rewinding must succeed.");
		},
		rewindTask : function() {
			ok(this.complete(), "Completing must succeed");
		}
	});

	// We're expecting a start and a complete event.
	TaskReceiver.addExpectedEvent(SC.TaskEvent.START, SC.TaskState.ACTIVE);
	TaskReceiver.addExpectedEvent(SC.TaskEvent.REWIND, SC.TaskState.REWINDING);
	TaskReceiver.addExpectedEvent(SC.TaskEvent.COMPLETE, SC.TaskState.INACTIVE);
	TaskReceiver.listen(task);
	task.start();
	TaskReceiver.assertAllEventsFired();
});

test("Demonstrate rewind lifecycle with isRewindable set to true in suspended state.", function() {
	var task = SC.Task.create({
		isRewindable : YES,
		isSuspendable : YES,
		startTask : function() {
			ok(this.suspend(), "Suspending must succeed.");
		},
		suspendTask : function() {
			ok(this.rewind(), "Rewinding must succeed.");
		},
		rewindTask : function() {
			ok(this.complete(), "Completing must succeed.");
		}
	});

	// We're expecting a start and a complete event.
	TaskReceiver.addExpectedEvent(SC.TaskEvent.START, SC.TaskState.ACTIVE);
	TaskReceiver.addExpectedEvent(SC.TaskEvent.SUSPEND, SC.TaskState.SUSPENDED);
	TaskReceiver.addExpectedEvent(SC.TaskEvent.REWIND, SC.TaskState.REWINDING);
	TaskReceiver.addExpectedEvent(SC.TaskEvent.COMPLETE, SC.TaskState.INACTIVE);
	TaskReceiver.listen(task);
	task.start();
	TaskReceiver.assertAllEventsFired();
});

test("Demonstrate rewind lifecycle with isRewindable set to true in finished state.", function() {
	var task = SC.Task.create({
		isRewindable : YES,
		startTask : function() {
			ok(this.complete(), "Completing must succeed.");
			ok(this.rewind(), "Rewinding must succeed.");
		},
		rewindTask : function() {
			ok(this.complete(), "Completing must succeed.");
		}
	});

	// We're expecting a start and a complete event.
	TaskReceiver.addExpectedEvent(SC.TaskEvent.START, SC.TaskState.ACTIVE);
	TaskReceiver.addExpectedEvent(SC.TaskEvent.COMPLETE, SC.TaskState.FINISHED);
	TaskReceiver.addExpectedEvent(SC.TaskEvent.REWIND, SC.TaskState.REWINDING);
	TaskReceiver.addExpectedEvent(SC.TaskEvent.COMPLETE, SC.TaskState.INACTIVE);
	TaskReceiver.listen(task);
	task.start();
	TaskReceiver.assertAllEventsFired();
});

test("Demonstrate rewind lifecycle with cancellation during rewind.", function() {
	var task = SC.Task.create({
		isRewindable : YES,
		isCancelable : YES,
		startTask : function() {
			ok(this.rewind(), "Rewinding must succeed.");
		},
		rewindTask : function() {
			ok(!this.cancel(), "Cancelling must fail.");
		}
	});

	// We're expecting a start and a complete event.
	TaskReceiver.addExpectedEvent(SC.TaskEvent.START, SC.TaskState.ACTIVE);
	TaskReceiver.addExpectedEvent(SC.TaskEvent.REWIND, SC.TaskState.REWINDING);
	TaskReceiver.listen(task);
	task.start();
	TaskReceiver.assertAllEventsFired();
});

test("Demonstrate error lifecycle.", function() {
	var task = SC.Task.create({
		startTask : function() {
			ok(this.error("message"), "Error must succeed.");
		}
	});

	// We're expecting a start and a complete event.
	TaskReceiver.addExpectedEvent(SC.TaskEvent.START, SC.TaskState.ACTIVE);
	TaskReceiver.addExpectedEvent(SC.TaskEvent.ERROR, SC.TaskState.ERROR);
	TaskReceiver.listen(task);
	task.start();
	TaskReceiver.assertAllEventsFired();
});

test("Demonstrate error lifecycle with rewindOnError.", function() {
	var task = SC.Task.create({
		rewindOnError : YES,
		isRewindable : YES,
		startTask : function() {
			ok(this.error("message"), "Error must succeed.");
		},
		rewindTask : function() {
			ok(this.complete(), "Completing must succeed.");
		}
	});

	// We're expecting a start and a complete event.
	TaskReceiver.addExpectedEvent(SC.TaskEvent.START, SC.TaskState.ACTIVE);
	TaskReceiver.addExpectedEvent(SC.TaskEvent.REWIND, SC.TaskState.REWINDING);
	TaskReceiver.addExpectedEvent(SC.TaskEvent.COMPLETE, SC.TaskState.INACTIVE);
	TaskReceiver.listen(task);
	task.start();
	TaskReceiver.assertAllEventsFired();
});

test("Demonstrate cancel lifecycle with rewindOnCancel.", function() {
	var task = SC.Task.create({
		isCancelable : YES,
		rewindOnCancel : YES,
		isRewindable : YES,
		startTask : function() {
			ok(this.cancel(), "Cancel must succeed.");
		},
		rewindTask : function() {
			ok(this.complete(), "Completing must succeed.");
		}
	});

	// We're expecting a start and a complete event.
	TaskReceiver.addExpectedEvent(SC.TaskEvent.START, SC.TaskState.ACTIVE);
	TaskReceiver.addExpectedEvent(SC.TaskEvent.REWIND, SC.TaskState.REWINDING);
	TaskReceiver.addExpectedEvent(SC.TaskEvent.COMPLETE, SC.TaskState.INACTIVE);
	TaskReceiver.listen(task);
	task.start();
	TaskReceiver.assertAllEventsFired();
});

test("Test Plugin method.", function() {
	// Test plugin method...
	var taskFunc = SC.Task.plugin("SC.Task", {
		foo : 'bar'
	});
	var taskClass = taskFunc();
	ok(taskClass.isClass, "Function results must be a class");
	
	var taskInstance = taskClass.create();
	
	equals(taskInstance.get('foo'), 'bar', "Task parameters must be passed through");
	ok(SC.typeOf(taskInstance, SC.Task), "Task must be of correct type");
});
