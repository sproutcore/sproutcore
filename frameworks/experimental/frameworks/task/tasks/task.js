// ==========================================================================
// Project: SproutCore Task Framework
// Copyright: @2013 Michael Krotscheck and contributors
// License: Licensed under MIT license (see license.js)
// ==========================================================================

/**
 * This is the basic building block of the SproutCore task framework, a class
 * which allows you to wrap a single piece of business logic into a reusable
 * widget. This may be an animation, a file upload, a service request, an
 * wait-for-refresh operation or any other piece of logic that you're likely to
 * reuse frequently. While ostensibly it represents an asynchronous operation,
 * there is nothing that prevents you from encapsulating synchronous logic
 * within a task - just be careful about the order in which they're executed.
 * 
 * The easiest way to get started with this framework is to extend SC.Task, and
 * override the <code>startTask()</code> method to run your custom logico.
 * Once your task is complete, invoke <code>complete()</code>.
 * 
 * Because of the generic set of events that are fired by the Task Framework,
 * you can chain multiple different tasks to run either sequentially or in
 * parallel, and again chain those Task Groups to run sequentially or in
 * parallel as well. Tasks may even be taught how to rewind themselves, so that
 * your application can easily and quickly recover from unexpected error
 * conditions.
 * 
 * Events fired by tasks are as follows:
 * 
 * <ul>
 * <li>SC.TaskEvent.START</li>
 * <li>SC.TaskEvent.SUSPEND</li>
 * <li>SC.TaskEvent.RESUME</li>
 * <li>SC.TaskEvent.CANCEL</li>
 * <li>SC.TaskEvent.ERROR</li>
 * <li>SC.TaskEvent.REWIND</li>
 * </ul>
 * 
 * A minimal subclass of SC.Task would override the <code>startTask</code>
 * method, though you may also override <code>cancelTask</code>,
 * <code>rewindTask</code>, <code>suspendTask</code>, and
 * <code>resumeTask</code>. Each of these method implementations must also be
 * matched by setting the correct flag: <code>isCancelable</code>,
 * <code>isRewindable</code>, and <code>isSuspendable</code>.
 * 
 * @author Michael Krotscheck
 */
SC.Task = SC.Object.extend({

	/**
	 * An optional task name, used for logging.
	 */
	name : function() {
		return this.constructor.toString();
	}.property(),

	/**
	 * This flag indicates whether the task may be restarted. Set this to true
	 * if your task may be re-run an arbitrary number of times.
	 */
	isRestartable : NO,

	/**
	 * This flag indicates that the task may be canceled in mid-operation. Set
	 * this to true if your task implements the cancel() method. A SequenceTask
	 * or ParallelTask may only be cancelled if ALL of their child tasks may be
	 * cancelled.
	 */
	isCancelable : NO,

	/**
	 * This flag indicates that the task may be suspended. Set this to true if
	 * your task implements the suspend() method. A SequenceTask or ParallelTask
	 * may only be suspended if all of the currently active tasks are
	 * suspendable.
	 */
	isSuspendable : NO,

	/**
	 * This flag indicates that the task may be rewound. Set this to true if
	 * your task implements the rewind() method. A SequenceTask or ParallelTask
	 * may only be rewound if all of the currently active tasks are recoverable.
	 */
	isRewindable : NO,

	/**
	 * Set this flag to true if the task should rewind if it encounters an
	 * error. Note that this will only work if rewind() is implemented, and
	 * isRewindable is set to true.
	 */
	rewindOnError : NO,

	/**
	 * Set this flag to true if the task should rewind if it is cancelled. Note
	 * that this will only work if rewind() is implemented, and isRewindable is
	 * set to true.
	 */
	rewindOnCancel : NO,

	/**
	 * The current state of the task.
	 * 
	 * @readonly
	 */
	state : function() {
		return this._state;
	}.property('_state').cacheable(),

	/**
	 * @private
	 * 
	 * The current state of the task.
	 */
	_state : SC.TaskState.INACTIVE,

	/**
	 * This method starts the execution of the task, checking state and
	 * dispatching necessary lifecycle events. start
	 * 
	 * @return true if the Task was started successfully, false if it was in an
	 *         illegal state
	 */
	start : function() {
		// State check.. INACTIVE or SUSPENDED.
		var state = this.get('state'), K = SC.TaskState;
		if (state == K.INACTIVE) {
			// Are we inactive? Start!
			this._state = K.ACTIVE;
			this.propertyDidChange('state');
			SC.Event.trigger(this, SC.TaskEvent.START);
			this.startTask();
			return true;
		} else if (state == K.SUSPENDED) {
			// Are we suspended? Go to resume instead.
			return this.resume();
		} else {
			this._logMessage("Attempt to start Task in illegal state [%@]".fmt(state));
			return false;
		}
	},

	/**
	 * Signals that this Task has completed. All tasks should call this method
	 * when the operation has completed. If this method executes successfully
	 * the <code>COMPLETE</code> event will be fired.
	 * 
	 * @return true if the Task successfully switched its internal state, false
	 *         if otherwise
	 */
	complete : function() {
		var state = this.get('state'), K = SC.TaskState;

		if (state != K.ACTIVE && state != K.REWINDING) {
			this._logMessage("Attempt to complete task %@ in illegal state [%@]".fmt(this.get('name'), state));
			return false;
		}

		this._state = (this.get('isRestartable') || state == K.REWINDING) ? SC.TaskState.INACTIVE : SC.TaskState.FINISHED;
		this.propertyDidChange('state');
		SC.Event.trigger(this, SC.TaskEvent.COMPLETE);
		return true;
	},

	/**
	 * Suspends this Task. For this method to succeed the suspendable property
	 * of this Task must be set to true and the current state of the Task must
	 * be <code>ACTIVE</code>. If this method executes successfully the
	 * <code>SUSPEND</code> event will be fired.
	 * 
	 * @return true if the Task successfully switched its internal state, false
	 *         if otherwise
	 */
	suspend : function() {
		var state = this.get('state'), name = this.get('name'), isSuspendable = this.get('isSuspendable'), K = SC.TaskState;

		if (!isSuspendable) {
			this._logMessage("Task '%@' is not suspendable".fmt(name));
			return false;
		}
		if (state != K.ACTIVE) {
			this._logMessage("Attempt to suspend Task [%@] in illegal state: %@".fmt(name, state));
			return false;
		}

		// Reset the state, fire the suspend event, and call any custom logic necessary.
		this._state = K.SUSPENDED;
		this.propertyDidChange('state');
		SC.Event.trigger(this, SC.TaskEvent.SUSPEND);
		this.suspendTask();

		return true;
	},

	/**
	 * Resumes this Task if it is suspended. For this method to succeed the
	 * suspendable property of this Task must be set to true and the current
	 * state of the Task must be <code>SUSPENDED</code>. If this Task is
	 * member of a <code>TaskGroup</code> it cannot be resumed if the parent
	 * <code>TaskGroup</code> is still suspended. If this method executes
	 * successfully the <code>RESUME</code> event will be fired.
	 * 
	 * @return true if the Task successfully switched its internal state, false
	 *         if otherwise
	 */
	resume : function() {
		var state = this.get('state'), name = this.get('name'), K = SC.TaskState;

		if (state != K.SUSPENDED) {
			this._logMessage("Attempt to resume Task [%@] in illegal state: %@".fmt(name, state));
			return false;
		}

		// Reset the state, fire the suspend event, and call any custom logic necessary.
		this._state = K.ACTIVE;
		this.propertyDidChange('state');
		SC.Event.trigger(this, SC.TaskEvent.RESUME);
		this.resumeTask();

		return true;
	},

	/**
	 * Cancels this Task. For this method to succeed the cancelable property of
	 * this Task must be set to true and the current state of the Task must be
	 * <code>ACTIVE</code> or <code>SUSPENDED</code>. If this method
	 * executes successfully the <code>CANCEL</code> event will be fired.
	 * 
	 * @return true if the Task successfully switched its internal state, false
	 *         if otherwise
	 */
	cancel : function() {
		var state = this.get('state'), name = this.get('name'), isRewindable = this.get('isRewindable'), rewindOnCancel = this.get('rewindOnCancel'), isCancelable = this.get('isCancelable'), isRestartable = this.get('isRestartable'), K = SC.TaskState;

		if (!isCancelable) {
			this._logMessage("Task '%@' is not suspendable".fmt(name));
			return false;
		}
		if (state != K.ACTIVE && state != K.SUSPENDED) {
			this._logMessage("Attempt to cancel Task '%@' in illegal state: %@".fmt(name, state));
			return false;
		}

		if (isRewindable && rewindOnCancel) {
			this.cancelTask();
			this.rewind();
		} else {
			this._state = (isRestartable) ? K.INACTIVE : K.FINISHED;
			this.propertyDidChange('state');
			SC.Event.trigger(this, SC.TaskEvent.CANCEL);
			this.cancelTask();
		}

		return true;
	},

	/**
	 * Signals an error condition and cancels the Task. Subclasses should call
	 * this method when the asynchronous operation cannot be successfully
	 * completed. If this method executes successfully the <code>ERROR</code>
	 * event will be fired.
	 * 
	 * @param message
	 *            the error description
	 * @return true if the Task successfully switched its internal state, false
	 *         if otherwise
	 */
	error : function(message) {
		var state = this.get('state'), name = this.get('name'), isRewindable = this.get('isRewindable'), rewindOnError = this.get('rewindOnError'), K = SC.TaskState;

		if (state != K.ACTIVE) {
			logger.error("Attempt to dispatch error in Task '%@' in illegal state: %@ - message: %@".fmt(name, state, message));
			return false;
		}

		if (isRewindable && rewindOnError) {
			this.rewind();
		} else {
			this._state = K.ERROR;
			this.propertyDidChange('state');
			SC.Event.trigger(this, SC.TaskEvent.ERROR, message);
		}

		return true;
	},

	/**
	 * Rewinds this Task. For this method to succeed the isRewindable property
	 * of this Task must be set to true and the current state of the Task must
	 * be <code>ACTIVE</code>, <code>SUSPENDED</code>, <code>ERROR</code>,
	 * or <code>FINISHED</code>. If this method executes successfully the
	 * <code>REWIND</code> event will be fired.
	 * 
	 * @return true if the Task successfully switched its internal state, false
	 *         if otherwise
	 */
	rewind : function() {
		var state = this.get('state'), name = this.get('name'), isRewindable = this.get('isRewindable'), K = SC.TaskState;

		if (!isRewindable) {
			this._logMessage("Task '%@' is not rewindable".fmt(name));
			return false;
		}

		if (state != K.ACTIVE && state != K.SUSPENDED && state != K.ERROR && state != K.FINISHED) {
			this._logMessage("Attempt to rewind Task '%@' in illegal state: %@".fmt(name, state));
			return false;
		}

		this._state = K.REWINDING;
		this.propertyDidChange('state');
		SC.Event.trigger(this, SC.TaskEvent.REWIND);
		this.rewindTask();

		return true;
	},

	/**
	 * This is the entry point for your task logic. It is invoked after start()
	 * has been called, the state of the task has been checked, and any
	 * additional preconditions are handled. Your own code should invoke
	 * complete() or error() once it is complete.
	 */
	startTask : function() {
		this._logMessage("WARN: %@ did not implement startTask()".fmt(this.get('name')));
		this.complete();
	},

	/**
	 * If your task is cancelable and cancel() is invoked, this method will be
	 * executed to call any additional logic that you would like to run in such
	 * an event: cleanup, etc.
	 */
	cancelTask : function() {
		this._logMessage("WARN: %@ did not implement cancelTask()".fmt(this.get('name')));
	},

	/**
	 * If your task is suspendable and suspend() is invoked, this method will be
	 * executed to call any additional logic necessary to suspend this task.
	 */
	suspendTask : function() {
		this._logMessage("WARN: %@ did not implement suspendTask()".fmt(this.get('name')));
	},

	/**
	 * If your task is resumable and resume() is invoked after a successful
	 * suspension, this method will be executed to call any additional logic
	 * necessary to restart this task.
	 */
	resumeTask : function() {
		this._logMessage("WARN: %@ did not implement resumeTask()".fmt(this.get('name')));
	},

	/**
	 * If your task is rewindable and rewind() is invoked, this method will be
	 * executed to call any logic necessary to return the application to a clean
	 * state. Once the this task cleans up after itself, you MUST call
	 * complete() again to signal that the task has reset itself.
	 */
	rewindTask : function() {
		this._logMessage("WARN: %@ did not implement rewindTask()".fmt(this.get('name')));
		this.complete();
	},

	// ============================= Logging support =============================

	/**
	 * @private
	 * 
	 * Helper method to assist with logging.
	 */
	_logMessage : function(message) {
		message = "[%@] %@".fmt(this.get('name'), message);
		switch (SC.Task.LOGGER_LEVEL) {
			case SC.LOGGER_LEVEL_NONE:
				break;
			case SC.LOGGER_LEVEL_DEBUG:
				SC.debug(message);
				break;
			case SC.LOGGER_LEVEL_INFO:
				SC.info(message);
				break;
			case SC.LOGGER_LEVEL_WARN:
				SC.warn(message);
				break;
			case SC.LOGGER_LEVEL_ERROR:
				SC.error(message);
				break;
		}
	}
});

/**
 * Mixin constants...
 */
SC.Task.mixin({
	/**
	 * The framework logging level.
	 */
	LOGGER_LEVEL : SC.buildMode == "debug" ? SC.LOGGER_LEVEL_DEBUG : SC.LOGGER_LEVEL_NONE,

	/**
	 * This method allows you to conveniently inject tasks into each other,
	 * without having to bother with the sc_requrie directive. As long as the
	 * Class itself is available at runtime, SC.Task.plugin will find it.
	 * 
	 * If you'd like to extend the class with additional functionality, you can
	 * add a class extension hash as the second parameter.
	 * 
	 * @param className
	 * @param hash
	 *            (optional)
	 * @returns {Function}
	 */
	plugin : function(className) {
		var args = SC.A(arguments);
		args.shift();
		var func = function() {
			var klass = SC.objectForPropertyPath(className);
			if (!klass) {
				console.error('SC.Task.plugin: Unable to determine path %@'.fmt(className));
				return undefined;
			}
			if (!klass.isClass || !klass.kindOf(SC.Task)) {
				console.error('SC.Task.plugin: Unable to extend. %@ must be a class extending from SC.Task'.fmt(className));
				return undefined;
			}
			return klass.extend.apply(klass, args);
		};
		func.isProperty = YES;
		return func;
	}
});