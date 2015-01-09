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

  var touch = SC.Touch.create({ identifier: 'test-touch' }, this);

  view.touchStart(touch);
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

  var touch = SC.Touch.create({ identifier: 'test-touch' }, this);

  view.touchesDragged({}, [touch]);
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

  var touch = SC.Touch.create({ identifier: 'test-touch' }, this);

  view.touchEnd(touch);
  view.gestureTouchEnd.expect(1);
});

// This method initializes the isInteresting property of the touch and calls unassignedTouchDidStart
// on each gesture.
test("Method: gestureTouchStart", function () {
  var testTouch = SC.Touch.create({ identifier: 'test-touch' }, this);

  view = view.create({
    gestures: [
      SC.Gesture.extend({
        name: 'a',

        unassignedTouchDidStart: function (aTouch) {
          equals(aTouch, testTouch, "The touch is passed to the gesture. The touch param is");
          equals(aTouch.isInteresting, 0, "The value of isInteresting is set on the touch to");

          // Bump up isInteresting to assert the order of the gestures is correct.
          aTouch.isInteresting = 1;
        }
      }),
      SC.Gesture.extend({
        name: 'b',

        unassignedTouchDidStart: function (aTouch) {
          equals(aTouch, testTouch, "The touch is passed to the gesture. The touch param is");
          equals(aTouch.isInteresting, 1, "The value of isInteresting is set on the touch to");
        }
      })]
  });

  view.gestureTouchStart(testTouch);

  // Ensure 4 tests run.
  expect(4);
});

// This method calls unassignedTouchesDidChange on each gesture.
test("Method: gestureTouchesDragged", function () {
  var testTouch = SC.Touch.create({ identifier: 'test-touch' }, this);

  view = view.create({
    gestures: [
      SC.Gesture.extend({
        name: 'a',

        unassignedTouchesDidChange: function (evt, touches) {
          same(touches, [testTouch], "The touches are passed to the gesture. The touches param is");
        }
      }),
      SC.Gesture.extend({
        name: 'b',

        unassignedTouchesDidChange: function (evt, touches) {
          same(touches, [testTouch], "The touches are passed to the gesture. The touches param is");
        }
      })]
  });

  view.gestureTouchesDragged({}, [testTouch]);

  // Ensure 2 tests run.
  expect(2);
});


// This method calls unassignedTouchDidEnd on each gesture.
test("Method: gestureTouchEnd", function () {
  var testTouch = SC.Touch.create({ identifier: 'test-touch' }, this);

  view = view.create({
    gestures: [
      SC.Gesture.extend({
        name: 'a',

        unassignedTouchDidEnd: function (touch) {
          equals(touch, testTouch, "The touch is passed to the gesture. The touch param is");
        }
      }),
      SC.Gesture.extend({
        name: 'b',

        unassignedTouchDidEnd: function (touch) {
          equals(touch, testTouch, "The touch is passed to the gesture. The touch param is");
          console.log(touch);
        }
      })]
  });

  view.gestureTouchEnd(testTouch);

  // Ensure 2 tests run.
  expect(2);
});
