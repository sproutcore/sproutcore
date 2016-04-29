/*global module, test, ok, equals */

var pane, scrollView, inner, targetLayer, evt, evt2, evt3,
    scrollStart, innerStart, scrollDragged, innerDragged, scrollEnd, innerEnd, scrollCancel, innerCancel;

module("SC.ScrollView touch scale", {
  setup: function() {
    // Create our pane.
    pane = SC.MainPane.extend({
      childViews: ['contentView'],
      contentView: SC.ScrollView.extend({
        layout: { height: 1000, width: 1000 },
        canScale: YES,
        horizontalOverlay: YES,
        verticalOverlay: YES,
        contentView: SC.View.extend({
          layout: { height: 1000, width: 1000 }
        })
      })
    });
    // (Actually create it, in a run loop.)
    SC.run(function() {
      pane = pane.create().append();
    });

    // Set up our pertinent reused variables.
    scrollView = pane.contentView;
    inner = scrollView.contentView;
    targetLayer = inner.get('layer');

    evt = SC.Event.simulateEvent(targetLayer, 'touchstart');
    evt.identifier = 4;
    evt.pageX = 400;
    evt.pageY = 400;

    evt2 = SC.Event.simulateEvent(targetLayer, 'touchstart');
    evt2.identifier = 5;
    evt2.pageX = 600;
    evt2.pageY = 600;

    evt3 = SC.Event.simulateEvent(targetLayer, 'touchstart');
    evt3.identifier = 6;
    evt3.pageX = 600;
    evt3.pageY = 400;
  },
  teardown: function() {
    SC.run(pane.destroy, pane);
  }
});

/**
  Some quick earned wisdom on testing touches. When you use SC.Event.trigger to trigger a touch event,
  the touch event's `touches` property must be an array with all of the currently operational touches
  (i.e. those previously started and not yet ended); its `changedTouches` property must be all the touches
  whose changes you want the root responder to acknowledge.

  `touchs` and `changedTouches` only need to be present on the event that you're passing to SC.Event.trigger;
  you trigger changes to multiple touches in one event by including them in that touch's `changedTouches`
  property. All `changedTouches` will be used to trigger the same event (for example, 'touchStart'), which
  can lead to testing issues if you pass the incorrect touches.
*/

test("Basic touch scale", function() {
  equals(scrollView.get('verticalScrollOffset'), 0, "PRELIM: Vertical offset starts at");
  equals(scrollView.get('horizontalScrollOffset'), 0, "PRELIM: Horizontal offset starts at");
  equals(scrollView.get('scale'), 1, "PRELIM: Horizontal offset starts at");

  // Start touches.
  evt.touches = [];
  evt.changedTouches = [evt, evt2];
  SC.Event.trigger(targetLayer, 'touchstart', evt);

  equals(SC.RootResponder.responder.touchesForView(scrollView).length, 2, "Two touches should result in two touches");

  // Pinch out to 2x.
  evt.pageX = evt.pageY -= 100;
  evt2.pageX = evt2.pageY += 100;
  evt.touches = [evt, evt2];
  // evt.changedTouches = [touch1, touch2];
  SC.Event.trigger(targetLayer, 'touchmove', evt);

  // SC.ScrollView's touch-pinching depends heavily on SC.RootResponder#averagedTouchesForView. If these tests
  // are misbehaving, first verify that SC.RootResponder's touch tests are passing.
  equals(scrollView.get('scale'), 2, "A 2x pinch gesture should double the scroll's scale");
  equals(scrollView.get('horizontalScrollOffset'), 500, "A centered pinch gesture should move the horizontal offset by half the content view's change in width");
  equals(scrollView.get('verticalScrollOffset'), 500, "A centered pinch gesture should move the vertical offset by half the content view's change in height");

  // Move the gesture.
  evt.pageX = evt.pageY += 100;
  evt2.pageX = evt2.pageY += 100;
  SC.Event.trigger(targetLayer, 'touchmove', evt);

  equals(scrollView.get('scale'), 2, "A gesture change with no change in distance should not change scale");
  equals(scrollView.get('horizontalScrollOffset'), 400, "Gesture change in position by 100 should move offsets by 100");
  equals(scrollView.get('verticalScrollOffset'), 400, "Gesture change in position by 100 should move offsets by 100");

  // Move and pinch (back to 1x) in the same gesture.
  evt.pageX = evt.pageY = 400;
  evt2.pageX = evt2.pageY = 600;
  SC.Event.trigger(targetLayer, 'touchmove', evt);

  equals(scrollView.get('scale'), 1, "A pinch + move gesture should change the scale");
  equals(scrollView.get('horizontalScrollOffset'), 0, "A pinch + move gesture should update the horizontal offset correctly");
  equals(scrollView.get('verticalScrollOffset'), 0, "A pinch + move gesture should update the vertical offset correctly");
});

test("Adding and removing touches (no scaling).", function() {
  // For this test we need room to scroll.
  SC.run(function() { inner.adjust('height', 2000); });

  equals(scrollView.get('verticalScrollOffset'), 0, "PRELIM: Vertical offset starts at");
  equals(scrollView.get('maximumVerticalScrollOffset'), 1000, "PRELIM: Vertical offset has room to grow");
  equals(scrollView.get('horizontalScrollOffset'), 0, "PRELIM: Horizontal offset starts at");
  equals(scrollView.get('scale'), 1, "PRELIM: Horizontal offset starts at");

  // Start touches.
  evt.touches = [];
  evt.changedTouches = [evt, evt2];
  SC.Event.trigger(targetLayer, 'touchstart', evt);

  equals(SC.RootResponder.responder.touchesForView(scrollView).length, 2, "Two touches should result in two touches");

  evt.pageY -= 100;
  evt2.pageY -= 100;
  evt.touches = [evt, evt2];
  SC.Event.trigger(targetLayer, 'touchmove', evt);

  equals(SC.RootResponder.responder.touchesForView(scrollView).length, 2, "There should still be two touches");
  equals(scrollView.get('scale'), 1, "A two-touch gesture with no pinching should result in no scaling");
  equals(scrollView.get('horizontalScrollOffset'), 0, "A two-touch vertical scroll gesture should not scroll horizontally");
  equals(scrollView.get('verticalScrollOffset'), 100, "A two-touch vertical scroll gesture should successfully scroll vertically");

  // Add a third touch.
  evt.touches = [evt, evt2];
  evt.changedTouches = [evt3];
  SC.Event.trigger(targetLayer, 'touchstart', evt);

  equals(SC.RootResponder.responder.touchesForView(scrollView).length, 3, "Adding a third touch should result in three touches");
  equals(scrollView.get('scale'), 1, "Adding a third touch should not impact scaling");
  equals(scrollView.get('horizontalScrollOffset'), 0, "Adding a third touch should not impact horizontal offset");
  equals(scrollView.get('verticalScrollOffset'), 100, "Adding a third touch should not impact vertical offset");

  // Move all three touches up in tandem.
  evt.pageY -= 100;
  evt2.pageY -= 100;
  evt3.pageY -= 100;
  evt.touches = [evt, evt2, evt3];
  evt.changedTouches = [evt, evt2, evt3];
  SC.Event.trigger(targetLayer, 'touchmove', evt);

  equals(scrollView.get('scale'), 1, "A three-touch gesture with no pinching should result in no scaling");
  equals(scrollView.get('horizontalScrollOffset'), 0, "A now-three-touch vertical scroll gesture should not scroll horizontally");
  equals(scrollView.get('verticalScrollOffset'), 200, "A now-three-touch vertical scroll gesture should successfully scroll vertically");
});

test("Adding and removing touches while scaling.", function() {
  equals(scrollView.get('scale'), 1, "PRELIM: Horizontal offset starts at");
  equals(scrollView.get('verticalScrollOffset'), 0, "PRELIM: Vertical offset starts at");
  equals(scrollView.get('horizontalScrollOffset'), 0, "PRELIM: Horizontal offset starts at");

  // Start touches.
  evt.touches = [];
  evt.changedTouches = [evt, evt2];
  SC.Event.trigger(targetLayer, 'touchstart', evt);
  equals(SC.RootResponder.responder.touchesForView(scrollView).length, 2, "Two touches should result in two touches");

  // Pinch out to 2x to begin scaling.
  evt.touches = [evt, evt2];
  evt.pageX = evt.pageY = 300;
  evt2.pageX = evt2.pageY = 700;
  SC.Event.trigger(targetLayer, 'touchmove', evt);

  equals(scrollView.get('scale'), 2, "A 2x pinch gesture should double the scroll's scale");
  equals(scrollView.get('horizontalScrollOffset'), 500, "A centered pinch gesture should move the horizontal offset by half the content view's change in width");
  equals(scrollView.get('verticalScrollOffset'), 500, "A centered pinch gesture should move the vertical offset by half the content view's change in height");

  // Remove our second touch.
  evt2.touches = [evt, evt2];
  evt2.changedTouches = [evt2];
  SC.Event.trigger(targetLayer, 'touchend', evt2);

  equals(SC.RootResponder.responder.touchesForView(scrollView).length, 1, "Removing one of two touches should leave one touch");
  equals(scrollView.get('scale'), 2, "Removing a touch shouldn't change scale");
  equals(scrollView.get('horizontalScrollOffset'), 500, "Removing a touch shouldn't change the horizontal offset");
  equals(scrollView.get('verticalScrollOffset'), 500, "Removing a touch shouldn't change the vertical offset");

  // Add third touch to spot second touch just left.
  evt3.touches = [evt];
  evt3.changedTouches = [evt3];
  evt3.pageX = 700;
  evt3.pageY = 700;
  SC.Event.trigger(targetLayer, 'touchstart', evt3);

  equals(SC.RootResponder.responder.touchesForView(scrollView).length, 2, "Adding one touch to one touch should result in two touches");
  equals(scrollView.get('scale'), 2, "Adding a touch shouldn't change scale");
  equals(scrollView.get('horizontalScrollOffset'), 500, "Adding a touch shouldn't change the horizontal offset");
  equals(scrollView.get('verticalScrollOffset'), 500, "Adding a touch shouldn't change the vertical offset");

  // Pinch back to 1x. Should revert everybody to initial values.
  evt.touches = [evt, evt3];
  evt.changedTouches = [evt, evt3];
  evt.pageX = evt.pageY = 400;
  evt3.pageX = evt3.pageY = 600;
  SC.Event.trigger(targetLayer, 'touchmove', evt);

  equals(scrollView.get('scale'), 1, "Pinching back down by half should reverse doubling of scaling");
  equals(scrollView.get('horizontalScrollOffset'), 0, "Pinching back down by half should reverse horizontal offset change");
  equals(scrollView.get('verticalScrollOffset'), 0, "Pinching back down by half should reverse vertical offset change");
});