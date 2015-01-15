// ==========================================================================
// Project:   SproutCore
// License:   Licensed under MIT license
// ==========================================================================
/*globals CoreTest, module, test, ok, equals, same, expect, start, stop */

var gesture;
module("SC.PinchGesture", {

  setup: function () {
    gesture = SC.PinchGesture;
  },

  teardown: function () {
    if (gesture.destroy) { gesture.destroy(); }
    gesture = null;
  }
});

/* Properties */

test("Default Properties:", function () {
  gesture = gesture.create();
  equals(gesture.name, 'pinch', "The default value of name is");
});

/* Methods */

// This method registers _sc_pinchAnchorScale to the value of the view's scale.
test("Method: touchSessionStarted", function () {
  gesture = gesture.create({
    view:  SC.View.create({ layout: { scale: 1.5 } })
  });
  equals(gesture.touchSessionStarted(), undefined, "The method returns");

  equals(gesture._sc_pinchAnchorScale, 1.5, "The value of _sc_pinchAnchorScale has been set to");
});

// This method registers _sc_pinchAnchorD as the average distance between all touches.
test("Method: touchAddedToSession", function () {
  var view = SC.View.create({ });

  gesture = gesture.create({
    view: view
  });

  var testTouch1 = SC.Touch.create({
      identifier: 'test-touch-1',
      pageX: 0,
      pageY: 0
    }, SC.RootResponder.responder),

    testTouch2 = SC.Touch.create({
      identifier: 'test-touch-2',
      pageX: 100,
      pageY: 100
    }, SC.RootResponder.responder),

    testTouch3 = SC.Touch.create({
      identifier: 'test-touch-3',
      pageX: 200,
      pageY: 200
    }, SC.RootResponder.responder);

  // Set up root responder nonsense.
  SC.RootResponder.responder._touchedViews[SC.guidFor(view)] = {
    touches: SC.CoreSet.create([testTouch1])
  };

  equals(gesture.touchAddedToSession(testTouch2, [testTouch1]), true, "The method returns");
  equals(gesture._sc_pinchAnchorD.toFixed(1), '70.7', "The variable _sc_pinchAnchorD is");

  gesture.touchAddedToSession(testTouch3, [testTouch2, testTouch1]);
  equals(gesture._sc_pinchAnchorD.toFixed(1), '141.4', "The variable _sc_pinchAnchorD is now");
});

// This method updates the anchors to the new fewer number of touches. If only one touch remains it nulls out the anchors.
test("Method: touchCancelledInSession", function () {
  var view = SC.View.create({});

  gesture = gesture.create({
    view: view
  });

  var testTouch1 = SC.Touch.create({
      identifier: 'test-touch-1',
      pageX: 0,
      pageY: 0
    }, SC.RootResponder.responder),

    testTouch2 = SC.Touch.create({
      identifier: 'test-touch-2',
      pageX: 100,
      pageY: 100
    }, SC.RootResponder.responder),

    testTouch3 = SC.Touch.create({
      identifier: 'test-touch-3',
      pageX: 200,
      pageY: 200
    }, SC.RootResponder.responder);

  // Set up root responder nonsense.
  SC.RootResponder.responder._touchedViews[SC.guidFor(view)] = {
    touches: SC.CoreSet.create([testTouch1, testTouch2])
  };

  equals(gesture.touchCancelledInSession(testTouch3, [testTouch1, testTouch2]), true, "The method returns");
  equals(gesture._sc_pinchAnchorD.toFixed(1), '70.7', "The variable _sc_pinchAnchorD is now");

  // Also check that an active pinch is killed. Fake out an active pinch.
  gesture._sc_isPinching = true;
  gesture._sc_pinchingTimer = SC.Timer.schedule({
    interval: 100
  });

  gesture.touchCancelledInSession(testTouch2, [testTouch1]);
  equals(gesture._sc_pinchAnchorD, null, "The variable _sc_pinchAnchorD is finally");
  equals(gesture._sc_isPinching, false, "The variable _sc_isPinching is now");

  gesture.touchCancelledInSession(testTouch1, []);
  equals(gesture._sc_pinchAnchorD, null, "The variable _sc_pinchAnchorD is still");
});

// This method updates the anchors to the new fewer number of touches. If only one touch remains it nulls out the anchors and cancels any active pinch.
test("Method: touchEndedInSession", function () {
  var view = SC.View.create(SC.Gesturable, {
      gestures: [SC.PinchGesture],

      pinchEnd: function () {
        ok(true, 'called', 'called', "The pinchEnd method was");
      }
    });

  gesture = gesture.create({
    view: view
  });

  var testTouch1 = SC.Touch.create({
      identifier: 'test-touch-1',
      pageX: 0,
      pageY: 0
    }, SC.RootResponder.responder),

    testTouch2 = SC.Touch.create({
      identifier: 'test-touch-2',
      pageX: 100,
      pageY: 100
    }, SC.RootResponder.responder),

    testTouch3 = SC.Touch.create({
      identifier: 'test-touch-3',
      pageX: 200,
      pageY: 200
    }, SC.RootResponder.responder);

  // Set up root responder nonsense.
  SC.RootResponder.responder._touchedViews[SC.guidFor(view)] = {
    touches: SC.CoreSet.create([testTouch1, testTouch2])
  };

  equals(gesture.touchEndedInSession(testTouch3, [testTouch1, testTouch2]), true, "The method returns");
  equals(gesture._sc_pinchAnchorD.toFixed(1), '70.7', "The variable _sc_pinchAnchorD is now");

  // Also check that an active pinch is killed. Fake out an active pinch.
  gesture._sc_isPinching = true;
  gesture._sc_pinchingTimer = SC.Timer.schedule({
    interval: 100
  });

  gesture.touchEndedInSession(testTouch2, [testTouch1]);
  equals(gesture._sc_pinchAnchorD, null, "The variable _sc_pinchAnchorD is finally");
  equals(gesture._sc_isPinching, false, "The variable _sc_isPinching is now");

  gesture.touchCancelledInSession(testTouch1, []);
  equals(gesture._sc_pinchAnchorD, null, "The variable _sc_pinchAnchorD is still");
});

// This method calls `pinchStart` once as long as still moving. It also calls `pinch` with the scale each time the average touch distance changes. Once enough time has passed, calls `pinchEnd` (via timer).
test("Method: touchesMovedInSession", function () {
  var lastScale = 1,
    view = SC.View.create(SC.Gesturable, {
      gestures: [SC.PinchGesture],

      pinchStart: function () {
        ok(true, 'called', 'called', "The pinchStart method was");
      },

      pinch: function (scale) {
        ok(true, 'called', 'called', "The pinch method was");
        ok(scale < lastScale, 'changed', 'changed', "The scale (%@) has".fmt(scale));
        lastScale = scale;
      },

      pinchEnd: function () {
        ok(true, 'called', 'called', "The pinchEnd method was");
      }
    });

  gesture = gesture.create({
    view: view
  });

  var testTouch1 = SC.Touch.create({
      identifier: 'test-touch-1',
      pageX: 0,
      pageY: 0
    }, SC.RootResponder.responder),

    testTouch2 = SC.Touch.create({
      identifier: 'test-touch-2',
      pageX: 100,
      pageY: 100
    }, SC.RootResponder.responder);

  // Set up root responder nonsense.
  SC.RootResponder.responder._touchedViews[SC.guidFor(view)] = {
    touches: SC.CoreSet.create([testTouch1, testTouch2])
  };

  // Set up the initial touch distance and view scale.
  gesture._sc_pinchAnchorD = 70.7;
  gesture._sc_pinchAnchorScale = 1;

  // Move a touch.
  testTouch2.pageX = 99;
  testTouch2.pageY = 99;

  equals(gesture.touchesMovedInSession([testTouch1, testTouch2]), true, "The method returns");

  // Should include the pinchStart ok().
  expect(4);

  // Move a touch.
  testTouch2.pageX = 98;
  testTouch2.pageY = 98;
  gesture.touchesMovedInSession([testTouch1, testTouch2]);

  // Should only include the pinch ok's.
  expect(6);

  setTimeout(function () {
    expect(7);
    start();
  }, gesture.get('pinchDelay') + 200);

  // Don't continue to the next test.
  stop();
});

// This method clears out all variables and cancels an active pinch.
test("Method: touchSessionCancelled", function () {
  var view = SC.View.create({});

  gesture = gesture.create({
    view: view
  });

  var testTouch1 = SC.Touch.create({
      identifier: 'test-touch-1',
      pageX: 0,
      pageY: 0
    }, SC.RootResponder.responder),

    testTouch2 = SC.Touch.create({
      identifier: 'test-touch-2',
      pageX: 100,
      pageY: 100
    }, SC.RootResponder.responder);

  // Set up root responder nonsense.
  SC.RootResponder.responder._touchedViews[SC.guidFor(view)] = {
    touches: SC.CoreSet.create([testTouch1, testTouch2])
  };

  // Also check that an active pinch is killed. Fake out an active pinch.
  gesture._sc_isPinching = true;
  gesture._sc_pinchingTimer = SC.Timer.schedule({
    interval: 100
  });

  equals(gesture.touchSessionCancelled(), undefined, "The method returns");
  equals(gesture._sc_pinchAnchorD, null, "The variable _sc_pinchAnchorD is now");
  equals(gesture._sc_isPinching, false, "The variable _sc_isPinching is now");
});

// This method clears out all variables and cancels an active pinch.
test("Method: touchSessionEnded", function () {
  var view = SC.View.create({});

  gesture = gesture.create({
    view: view
  });

  var testTouch1 = SC.Touch.create({
      identifier: 'test-touch-1',
      pageX: 0,
      pageY: 0
    }, SC.RootResponder.responder),

    testTouch2 = SC.Touch.create({
      identifier: 'test-touch-2',
      pageX: 100,
      pageY: 100
    }, SC.RootResponder.responder);

  // Set up root responder nonsense.
  SC.RootResponder.responder._touchedViews[SC.guidFor(view)] = {
    touches: SC.CoreSet.create([testTouch1, testTouch2])
  };

  // Also check that an active pinch is killed. Fake out an active pinch.
  gesture._sc_isPinching = true;
  gesture._sc_pinchingTimer = SC.Timer.schedule({
    interval: 100
  });

  equals(gesture.touchSessionCancelled(), undefined, "The method returns");
  equals(gesture._sc_pinchAnchorD, null, "The variable _sc_pinchAnchorD is now");
  equals(gesture._sc_isPinching, false, "The variable _sc_isPinching is now");
});
