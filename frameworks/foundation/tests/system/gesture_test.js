// ==========================================================================
// Project:   SproutCore
// License:   Licensed under MIT license
// ==========================================================================
/*globals CoreTest, module, test, ok, equals, same, expect */

var gesture;
module("SC.Gesture", {

  setup: function () {
    gesture = SC.Gesture;
  },

  teardown: function () {
    if (gesture.destroy) { gesture.destroy(); }
    gesture = null;
  }
});

/* Properties */
test("Default Properties:", function () {
  gesture = gesture.create();
  equals(gesture.name, 'gesture', "The default value of name is");
});

/* Methods */

// This method sets _sc_isActive to true and calls gestureName + 'Start' on the view with the gesture and any given arguments.
test("Method: start (_sc_isActive === false)", function () {
  var view = SC.View.create({

    gestureStart: function (arg1, arg2) {
      ok(true, 'called', 'called', "The method was");
      equals(arg1, 'a', "The first argument passed to start is passed to gestureStart and is");
      equals(arg2, 'b', "The second argument passed to start is passed to gestureStart and is");
    }

  });

  gesture = gesture.create({
    view: view
  });

  ok(gesture.start !== undefined, 'defined', 'defined', "The method is");

  gesture.start('a', 'b');

  equals(gesture._sc_isActive, true, "The gesture has _sc_isActive set to");
});

// This method does nothing if _sc_isActive is already true.
test("Method: start (_sc_isActive === true)", function () {
  var view = SC.View.create({

    gestureStart: function (theGesture) {
      ok(true, 'called', 'called', "The method was");
    }

  });

  gesture = gesture.create({
    _sc_isActive: true,
    view: view
  });

  gesture.start();

  // Ensure 0 tests run.
  expect(0);
});

// This method sets _sc_isActive to false and calls gestureName + 'End' on the view with the gesture and any given arguments.
test("Method: end (_sc_isActive === true)", function () {
  var view = SC.View.create({

    gestureEnd: function (arg1, arg2) {
      ok(true, 'called', 'called', "The method was");
      equals(arg1, 'a', "The first argument passed to start is passed to gestureEnd and is");
      equals(arg2, 'b', "The second argument passed to start is passed to gestureEnd and is");
    }

  });

  gesture = gesture.create({
    _sc_isActive: true,
    view: view
  });

  ok(gesture.end !== undefined, 'defined', 'defined', "The method is");

  gesture.end('a', 'b');

  equals(gesture._sc_isActive, false, "The gesture has _sc_isActive set to");
});

// This method does nothing if _sc_isActive is already false.
test("Method: end (_sc_isActive === false)", function () {
  var view = SC.View.create({

    gestureEnd: function (theGesture) {
      ok(true, 'called', 'called', "The method was");
    }

  });

  gesture = gesture.create({
    _sc_isActive: false,
    view: view
  });

  gesture.end();

  // Ensure 0 tests run.
  expect(0);
});

// This method calls gestureName + 'Changed' on the view with the gesture and any given arguments.
test("Method: change (_sc_isActive === true)", function () {
  var view = SC.View.create({

    gestureChanged: function (arg1, arg2) {
      ok(true, 'called', 'called', "The method was");
      equals(arg1, 'a', "The first argument passed to start is passed to gestureChanged and is");
      equals(arg2, 'b', "The second argument passed to start is passed to gestureChanged and is");
    }

  });

  gesture = gesture.create({
    _sc_isActive: true,
    view: view
  });

  ok(gesture.change !== undefined, 'defined', 'defined', "The method is");

  gesture.change('a', 'b');
});

// This method does nothing if _sc_isActive is already false.
test("Method: change (_sc_isActive === false)", function () {
  var view = SC.View.create({

    gestureChanged: function (theGesture) {
      ok(true, 'called', 'called', "The method was");
    }

  });

  gesture = gesture.create({
    _sc_isActive: false,
    view: view
  });

  gesture.change();

  // Ensure 0 tests run.
  expect(0);
});

// This method sets _sc_isActive to false and calls gestureName + 'Cancelled' on the view with the gesture and any given arguments.
test("Method: cancel (_sc_isActive === true)", function () {
  var view = SC.View.create({

    gestureCancelled: function (arg1, arg2) {
      ok(true, 'called', 'called', "The method was");
      equals(arg1, 'a', "The first argument passed to start is passed to gestureCancelled and is");
      equals(arg2, 'b', "The second argument passed to start is passed to gestureCancelled and is");
    }

  });

  gesture = gesture.create({
    _sc_isActive: true,
    view: view
  });

  ok(gesture.cancel !== undefined, 'defined', 'defined', "The method is");

  gesture.cancel('a', 'b');

  equals(gesture._sc_isActive, false, "The gesture has _sc_isActive set to");
});

// This method does nothing if _sc_isActive is already false.
test("Method: cancel (_sc_isActive === false)", function () {
  var view = SC.View.create({

    gestureCancelled: function (theGesture) {
      ok(true, 'called', 'called', "The method was");
    }

  });

  gesture = gesture.create({
    _sc_isActive: false,
    view: view
  });

  gesture.cancel();

  // Ensure 0 tests run.
  expect(0);
});

// This method calls gestureName on the view with the gesture and any given arguments.
test("Method: trigger (_sc_isActive === true)", function () {
  var view = SC.View.create({

    gesture: function (arg1, arg2) {
      ok(true, 'called', 'called', "The method was");
      equals(arg1, 'a', "The first argument passed to start is passed to gestureChanged and is");
      equals(arg2, 'b', "The second argument passed to start is passed to gestureChanged and is");
    }

  });

  gesture = gesture.create({
    _sc_isActive: true,
    view: view
  });

  ok(gesture.trigger !== undefined, 'defined', 'defined', "The method is");

  gesture.trigger('a', 'b');
});

// This method does nothing if _sc_isActive is already false.
test("Method: trigger (_sc_isActive === false)", function () {
  var view = SC.View.create({

    gestureChanged: function (theGesture) {
      ok(true, 'called', 'called', "The method was");
    }

  });

  gesture = gesture.create({
    _sc_isActive: false,
    view: view
  });

  gesture.trigger();

  // Ensure 0 tests run.
  expect(0);
});

// This method does nothing.
test("Method: touchSessionStarted", function () {
  gesture = gesture.create();

  ok(gesture.touchSessionStarted !== undefined, 'defined', 'defined', "The method is");
  equals(gesture.touchSessionStarted(), undefined, "The method returns");
});
