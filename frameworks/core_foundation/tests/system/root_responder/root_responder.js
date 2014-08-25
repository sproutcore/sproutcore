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

var newPane, oldPane, lightPane, darkPane, myPane, responder;


module("SC.RootResponder", {
	setup: function() {
		newPane = SC.Pane.create({ owner: this});
		oldPane = SC.Pane.create({ owner: this});
		lightPane = SC.Pane.create({ owner: this});
		darkPane = SC.Pane.create({ owner: this});
		myPane = SC.Pane.create();
		responder = SC.RootResponder.create();
	},
	
	teardown: function() {
    newPane.destroy();
    oldPane.destroy();
    lightPane.destroy();
    darkPane.destroy();
    myPane.destroy();
    responder.destroy();
  }
});

test("Basic requirements", function() {
  ok(SC.RootResponder, "SC.RootResponder");
  ok(SC.RootResponder.responder, "SC.RootResponder.responder");
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

// With v1.11, SC.Touch now provides its own velocity along each axis.
test("SC.Touch#velocity[X|Y]", function() {
  // Get a layer
  SC.run(newPane.append, newPane);
  var layer = newPane.get('layer'),
    attrs = { touches: [], identifier: 4, changedTouches: [], pageX: 0, pageY: 0 },
    evt = SC.Event.simulateEvent(layer, 'touchstart', attrs),
    touch;

  evt.changedTouches.push(evt);

  // Trigger touchstart
  SC.run(function() {
    SC.Event.trigger(layer, 'touchstart', [evt]);
  });

  touch = SC.RootResponder.responder._touches[evt.identifier];

  equals(touch.velocityX, 0, "Horizontal velocity begin at zero");
  equals(touch.velocityY, 0, "Vertical velocity begin at zero");

  evt.type = 'touchmove';
  evt.timeStamp += 100;
  evt.pageX += 100;
  evt.pageY += 100;
  
  SC.run(function() {
    SC.Event.trigger(layer, 'touchmove', [evt]);
  });

  equals(touch.velocityX, 1, 'VelocityX for 100 pixels in 100 ms is 1.');
  equals(touch.velocityY, 1, 'VelocityY for 100 pixels in 100 ms is 1.');

});

