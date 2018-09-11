// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

// ========================================================================
// RootResponder Tests
// ========================================================================
/*global module, test, ok, equals */

var responder;

module("SC.RootResponder", {
	setup: function() {
		responder = SC.RootResponder.create();
	},

	teardown: function() {
    responder.destroy();
  }
});

test("Basic requirements", function() {
  ok(SC.RootResponder, "SC.RootResponder");
  ok(SC.RootResponder.responder && SC.RootResponder.responder, "SC.RootResponder.responder");
  equals(
    SC.RootResponder.responder ? SC.RootResponder.responder.constructor : "no responder!",
    SC.RootResponder,
    "SC.RootResponder.responder is an instance of"
  );
});
