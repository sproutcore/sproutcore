// ==========================================================================
// Project: SproutCore Task Framework
// Copyright: @2013 Michael Krotscheck and contributors
// License: Licensed under MIT license (see license.js)
// ==========================================================================

module("SC.TaskEvent");

/**
 * Demonstrates that the event constants exist.
 */
test("Event enumeration must exist", function() {
	ok(SC.TaskEvent.START, "Must have an start Event");
	ok(SC.TaskEvent.SUSPEND, "Must have an suspend Event");
	ok(SC.TaskEvent.RESUME, "Must have an resume Event");
	ok(SC.TaskEvent.COMPLETE, "Must have an complete Event");
	ok(SC.TaskEvent.CANCEL, "Must have an cancel Event");
	ok(SC.TaskEvent.ERROR, "Must have an error Event");
	ok(SC.TaskEvent.REWIND, "Must have an rewind Event");
});