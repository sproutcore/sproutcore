// ==========================================================================
// Project: SproutCore Task Framework
// Copyright: @2013 Michael Krotscheck and contributors
// License: Licensed under MIT license (see license.js)
// ==========================================================================

module("SC.TaskState");

/**
 * Demonstrates that the state constants exist.
 */
test("State enumeration must exist", function() {
	ok(SC.TaskState.INACTIVE, "Must have an inactive state");
	ok(SC.TaskState.ACTIVE, "Must have an active state");
	ok(SC.TaskState.SUSPENDED, "Must have an suspended state");
	ok(SC.TaskState.FINISHED, "Must have an finished state");
	ok(SC.TaskState.ERROR, "Must have an error state");
	ok(SC.TaskState.REWINDING, "Must have a rewinding state");
});