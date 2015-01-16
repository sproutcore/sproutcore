// ==========================================================================
// Project:   SproutCore
// License:   Licensed under MIT license
// ==========================================================================
/*globals CoreTest, module, test, ok, equals, same, expect */

var view;
module("SC.Gesturable", {

  setup: function () {
    view = SC.View.extend(SC.Gesturable);
  },

  teardown: function () {
    if (view.destroy) { view.destroy(); }
    view = null;
  }
});

/* Properties */
test("Default Properties:", function () {
  equals(view.gestures, null, "The default value of gestures is");
  view = view.create({
      gestures: [SC.Gesture.extend({
        name: 'a'
      })]
    });

  ok(view.concatenatedProperties.indexOf('gestures') > 0, 'gestures', 'gestures', "The default value of concatenatedProperties includes");
});

/* Methods */

// This method instantiates all gestures.
test("Method: createGestures", function () {
  // It should be able to handle named gesture classess, given gesture classes and instantiated gestures.
  view = view.create({
    // Avoid the auto-call of createGestures.
    initMixin: null,

    gestures: ['aGesture',
      SC.Gesture.extend({
        name: 'b'
      }),
      SC.Gesture.create({
        name: 'c'
      })],

    // Named.
    aGesture: SC.Gesture.extend({
      name: 'a'
    })
  });

  view.createGestures();

  equals(view.get('gestures')[0].isClass, undefined, "The first gesture should not be a class. I.e. the value of isClass should be");
  equals(view.get('gestures')[0].name, 'a', "The first intantiated gesture should be named");
  equals(view.get('gestures')[1].isClass, undefined, "The second gesture should not be a class. I.e. the value of isClass should be");
  equals(view.get('gestures')[1].name, 'b', "The second intantiated gesture should be named");
  equals(view.get('gestures')[2].isClass, undefined, "The third gesture should not be a class. I.e. the value of isClass should be");
  equals(view.get('gestures')[2].name, 'c', "The third intantiated gesture should be named");
});

// This method calls gestureTouchStart.
test("Method: touchStart", function () {
  view = view.create({
    gestures: [SC.Gesture.extend({
        name: 'a'
      })],

    // Stub out the method we expect to call.
    gestureTouchStart: CoreTest.stub('gestureTouchStart', SC.Gesturable.gestureTouchStart)
  });

  var testTouch = SC.Touch.create({ identifier: 'test-touch' }, this);

  view.touchStart(testTouch);
  view.gestureTouchStart.expect(1);
});

// This method calls gestureTouchesDragged.
test("Method: touchesDragged", function () {
  view = view.create({
    gestures: [SC.Gesture.extend({
        name: 'a'
      })],

    // Stub out the method we expect to call.
    gestureTouchesDragged: CoreTest.stub('gestureTouchesDragged', SC.Gesturable.gestureTouchesDragged)
  });

  var testTouch = SC.Touch.create({ identifier: 'test-touch' }, this);

  view.touchStart(testTouch);
  view.touchesDragged({}, [testTouch]);
  view.gestureTouchesDragged.expect(1);
});

// This method calls gestureTouchEnd.
test("Method: touchEnd", function () {
  view = view.create({
    gestures: [SC.Gesture.extend({
        name: 'a'
      })],

    // Stub out the method we expect to call.
    gestureTouchEnd: CoreTest.stub('gestureTouchEnd', SC.Gesturable.gestureTouchEnd)
  });

  var testTouch = SC.Touch.create({ identifier: 'test-touch' }, this);

  view.touchStart(testTouch);
  view.touchEnd(testTouch);
  view.gestureTouchEnd.expect(1);
});

// This method initializes the _sc_interestedGestures & _sc_touchesInSession properties and calls touchSessionStarted
// on each gesture.
test("Method: gestureTouchStart", function () {
  var testTouch = SC.Touch.create({ identifier: 'test-touch' }, this);

  testTouch._isSeen = 0;

  view = view.create({
    gestures: [
      SC.Gesture.extend({
        name: 'a',

        touchSessionStarted: function (aTouch) {
          equals(aTouch, testTouch, "The touch is passed to the gesture. The touch param is");
          equals(aTouch._isSeen, 0, "The value of _isSeen is set on the touch to");

          // Bump up _isSeen to assert the order of the gestures is correct.
          aTouch._isSeen = 1;
        },

        touchAddedToSession: function (aTouch, touchesAlreadyInSession) {
          equals(aTouch, testTouch2, "The touch is passed to the gesture. The touch param is");
          same(touchesAlreadyInSession, [testTouch], "The touchesAlreadyInSession is passed to the gesture. The touchesAlreadyInSession param is");
        }
      }),
      SC.Gesture.extend({
        name: 'b',

        touchSessionStarted: function (aTouch) {
          equals(aTouch, testTouch, "The touch is passed to the gesture. The touch param is");
          equals(aTouch._isSeen, 1, "The value of _isSeen is set on the touch to");
        },

        touchAddedToSession: function (aTouch, touchesAlreadyInSession) {
          equals(aTouch, testTouch2, "The touch is passed to the gesture. The touch param is");
          same(touchesAlreadyInSession, [testTouch], "The touchesAlreadyInSession is passed to the gesture. The touchesAlreadyInSession param is");
        }
      })]
  });

  equals(view.gestureTouchStart(testTouch), true, "The method returns");

  same(view._sc_interestedGestures, view.gestures, "The value of view._sc_interestedGestures is");
  same(view._sc_touchesInSession, [testTouch], "The value of view._sc_touchesInSession is");

  // Ensure 7 tests run.
  expect(7);

  // Add a second touch.
  var testTouch2 = SC.Touch.create({ identifier: 'test-touch-2' }, this);
  view.gestureTouchStart(testTouch2);

  // Ensure 11 tests run.
  expect(11);
});

// This method calls touchesMovedInSession on each gesture.
test("Method: gestureTouchesDragged", function () {
  var testTouch = SC.Touch.create({ identifier: 'test-touch' }, this);

  view = view.create({
    gestures: [
      SC.Gesture.extend({
        name: 'a',

        touchesMovedInSession: function (touches) {
          same(touches, [testTouch], "The touches are passed to the gesture. The touches param is");
        }
      }),
      SC.Gesture.extend({
        name: 'b',

        touchesMovedInSession: function (touches) {
          same(touches, [testTouch], "The touches are passed to the gesture. The touches param is");
        }
      })]
  });

  view.gestureTouchStart(testTouch);
  equals(view.gestureTouchesDragged({}, [testTouch]), undefined, "The method returns");

  // Ensure 3 tests run.
  expect(3);
});


// This method calls touchEndedInSession on each gesture.
test("Method: gestureTouchEnd", function () {
  var testTouch = SC.Touch.create({ identifier: 'test-touch' }, this);

  view = view.create({
    gestures: [
      SC.Gesture.extend({
        name: 'a',

        touchEndedInSession: function (touch, touchesStillInSession) {
          equals(touch, testTouch, "The touch is passed to the gesture. The touch param is");
          same(touchesStillInSession, [], "The touchesStillInSession is passed to the gesture. The touchesStillInSession param is");
        }
      }),
      SC.Gesture.extend({
        name: 'b',

        touchEndedInSession: function (touch, touchesStillInSession) {
          equals(touch, testTouch, "The touch is passed to the gesture. The touch param is");
          same(touchesStillInSession, [], "The touchesStillInSession is passed to the gesture. The touchesStillInSession param is");
        }
      })]
  });

  view.gestureTouchStart(testTouch);
  equals(view.gestureTouchEnd(testTouch), undefined, "The method returns");

  // Ensure 5 tests run.
  expect(5);
});
