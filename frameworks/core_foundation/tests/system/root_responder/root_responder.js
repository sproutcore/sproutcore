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

test("root_responder.ignoreTouchHandle() : Should ignore TEXTAREA, INPUT, A, and SELECT elements", function () {
 var wasMobileSafari = SC.browser.isMobileSafari;
 SC.browser.isMobileSafari = YES;

 ["A", "INPUT", "TEXTAREA", "SELECT"].forEach(function (tag) {
   ok(responder.ignoreTouchHandle({
     target: { tagName: tag },
     allowDefault: SC.K
   }), "should pass touch events through to &lt;" + tag + "&gt; elements");
 });

 ["AUDIO", "B", "Q", "BR", "BODY", "BUTTON", "CANVAS", "FORM",
  "IFRAME", "IMG", "OPTION", "P", "PROGRESS", "STRONG",
  "TABLE", "TBODY", "TR", "TH", "TD", "VIDEO"].forEach(function (tag) {
   ok(!responder.ignoreTouchHandle({
     target: { tagName: tag },
     allowDefault: SC.K
   }), "should NOT pass touch events through to &lt;" + tag + "&gt; elements");
 });

 SC.browser.isMobileSafari = wasMobileSafari;
});
