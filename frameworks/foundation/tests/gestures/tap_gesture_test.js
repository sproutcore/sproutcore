// ==========================================================================
// Project:   SproutCore
// License:   Licensed under MIT license
// ==========================================================================
/*globals CoreTest, module, test, ok, equals, same, expect */

var gesture;
module("SC.TapGesture", {

  setup: function () {
    gesture = SC.TapGesture;
  },

  teardown: function () {
    if (gesture.destroy) { gesture.destroy(); }
    gesture = null;
  }
});

/* Properties */
test("Default Properties:", function () {
  gesture = gesture.create();
  equals(gesture.name, 'tap', "The default value of name is");
  equals(gesture.touchUnityDelay, 75, "The default value of touchUnityDelay is");
  equals(gesture.tapLengthDelay, 250, "The default value of tapLengthDelay is");
  equals(gesture.tapStartDelay, 150, "The default value of tapStartDelay is");
  equals(gesture.tapWiggle, 10, "The default value of tapWiggle is");
});

/* Methods */

// This method returns true if the new touch is not too much later than the first touch.
test("Method: touchAddedToSession");
test("Method: touchCancelledInSession");
test("Method: touchEndedInSession");
test("Method: touchesMovedInSession");
test("Method: touchSessionCancelled");
test("Method: touchSessionEnded");

// This method registers _sc_firstTouchAddedAt & creates the _sc_tapStartTimer.
test("Method: touchSessionStarted", function () {
  gesture = gesture.create({
    view: {}
  });
  equals(gesture.touchSessionStarted(), undefined, "The method returns");

  ok(gesture._sc_firstTouchAddedAt !== null, 'set', 'set', "The value of _sc_firstTouchAddedAt has been");
  ok(gesture._sc_tapStartTimer !== null, 'created', 'created', "The timer _sc_tapStartTimer has been");
  equals(gesture._sc_tapStartTimer.interval, gesture.get('tapStartDelay'), "The timer has the interval equal to tapStartDelay of");
});

// This method calls start.
test("Method: _sc_triggerTapStart", function () {

});
