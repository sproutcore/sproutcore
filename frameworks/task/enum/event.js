// ==========================================================================
// Project: SproutCore Task Framework
// Copyright: @2013 Michael Krotscheck and contributors
// License: Licensed under MIT license (see license.js)
// ==========================================================================

/**
 * Enumeration of event names that are dispatched by the task framework.
 * 
 * @author Michael Krotscheck
 */
SC.TaskEvent =
/** @scope SC.TaskEvent */
{
	/**
	 * Name for the event fired when a Task is started.
	 */
	START : "start",

	/**
	 * Name for the event fired when a Task is suspended.
	 */
	SUSPEND : "suspend",

	/**
	 * Name for the event fired when a Task is resumed.
	 */
	RESUME : "resume",

	/**
	 * Name for the event fired when a Task is completed.
	 */
	COMPLETE : "complete",

	/**
	 * Name for the event fired when a Task is cancelled.
	 */
	CANCEL : "cancel",

	/**
	 * Name for the event fired when a Task errors out.
	 */
	ERROR : "error",

	/**
	 * Name for the event fired when a Task is successfully rewound.
	 */
	REWIND : "rewind"
};