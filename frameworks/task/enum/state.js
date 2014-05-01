// ==========================================================================
// Project: SproutCore Task Framework
// Copyright: @2013 Michael Krotscheck and contributors
// License: Licensed under MIT license (see license.js)
// ==========================================================================

/**
 * Enumeration for the internal state of Task instances.
 * 
 * @author Michael Krotscheck
 */
SC.TaskState =
/** @scope SC.TaskState */
{
	/**
	 * The state of the Task before it has been started for the first time,
	 * after it has been rewound, or (for restartable Tasks) also after it has
	 * completed its execution. Only Task instances with this internal state can
	 * be started.
	 */
	INACTIVE : "INACTIVE",

	/**
	 * The state of a running Task.
	 */
	ACTIVE : "ACTIVE",

	/**
	 * The state of a suspended Task.
	 */
	SUSPENDED : "SUSPENDED",

	/**
	 * The state of a non-restartable Task that has completed its execution.
	 */
	FINISHED : "FINISHED",

	/**
	 * The state of a task that has resulted in an error.
	 */
	ERROR : "ERROR",

	/**
	 * The state of a task that is being rewound.
	 */
	REWINDING : "REWINDING"
};