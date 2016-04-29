/*global module, test, ok, equals */

var initialPageX = 100,
  initialPageY = 100;

var pane, scrollView, inner, targetLayer, evt, evt2, evt3,
    scrollStart, innerStart, scrollDragged, innerDragged, scrollEnd, innerEnd, scrollCancel, innerCancel;

module("SC.ScrollView touch thresholds and locks", {
  setup: function() {
    // Set up our pane (then create it in a run loop).
    pane = SC.MainPane.extend({
      layout: { height: 100, width: 100 },
      childViews: ['contentView'],
      contentView: SC.ScrollView.extend({
        touchScrollThreshold: 10,
        touchSecondaryScrollThreshold: 20,
        touchSecondaryScrollLock: 30,
        horizontalAlign: SC.ALIGN_LEFT,
        contentView: SC.View.extend({
          layout: { height: 200, width: 200 }
        })
      })
    });
    SC.run(function() { pane = pane.create().append(); });

    // Set up our pertinent reused variables.
    scrollView = pane.contentView;
    inner = scrollView.contentView;
    targetLayer = inner.get('layer');

    evt = SC.Event.simulateEvent(targetLayer, 'touchstart');
    evt.touches = [evt];
    evt.identifier = 4;
    evt.pageX = initialPageX;
    evt.pageY = initialPageY;
    evt.changedTouches = [evt];
  },
  teardown: function() {
    SC.run(pane.destroy, pane);
  }
});

// Disabled. The scroll thresholds don't stop the content from moving, they only allow the touch event to be
// sent to the content if not met. This allows scrolling to begin immediately, not after a small pause.
// test("Touch scroll thresholds", function() {
//   equals(scrollView.get('verticalScrollOffset'), 0, "PRELIM: Vertical offset starts at");
//   equals(scrollView.get('horizontalScrollOffset'), 0, "PRELIM: Horizontal offset starts at");

//   // Start touch
//   SC.run(function() {
//     SC.Event.trigger(targetLayer, 'touchstart', evt);
//   });

//   // Move touch up less than touchScrollThreshold.
//   evt.pageY = initialPageY - 9;
//   SC.run(function() {
//     SC.Event.trigger(targetLayer, 'touchmove', evt);
//   });
//   equals(scrollView.get('verticalScrollOffset'), 0, "Scrolling less than touchScrollThreshold results in no scrolling");
//   if (scrollView.get('horizontalScrollOffset') !== 0) ok(false, "A touch with no horizontal change shouldn't trigger a horizontal scroll!");

//   // Move touch up more than touchScrollThreshold.
//   evt.pageY = initialPageY - 11;
//   SC.run(function() {
//     SC.Event.trigger(targetLayer, 'touchmove', evt);
//   });
//   equals(scrollView.get('verticalScrollOffset'), 11, "Scrolling more than touchScrollThreshold results in scrolling");
//   if (scrollView.get('horizontalScrollOffset') !== 0) ok(false, "A touch with no horizontal change shouldn't trigger a horizontal scroll!");

//   // Move touch sideways less than touchSecondaryScrollThreshold.
//   evt.pageX = initialPageX - 19;
//   SC.run(function() {
//     SC.Event.trigger(targetLayer, 'touchmove', evt);
//   });
//   if (scrollView.get('verticalScrollOffset') !== 11) ok(false, "A touch with no vertical change shouldn't trigger a vertical scroll!");
//   equals(scrollView.get('horizontalScrollOffset'), 0, "With a vertical scroll in motion, scrolling horizontally less than touchSecondaryScrollThreshold results in no scrolling");

//   // Move touch sideways more than touchSecondaryScrollThreshold.
//   evt.pageX = initialPageX - 21;
//   SC.run(function() {
//     SC.Event.trigger(targetLayer, 'touchmove', evt);
//   });
//   if (scrollView.get('verticalScrollOffset') !== 11) ok(false, "A touch with no vertical change shouldn't trigger a vertical scroll!");
//   equals(scrollView.get('horizontalScrollOffset'), 21, "With a vertical scroll in motion, scrolling horizontally by more than touchSecondaryScrollThreshold results in scrolling");

// });

test("Touch scroll lock", function() {
  equals(scrollView.get('verticalScrollOffset'), 0, "PRELIM: Vertical offset starts at");
  equals(scrollView.get('horizontalScrollOffset'), 0, "PRELIM: Horizontal offset starts at");

  // Start touch
  SC.Event.trigger(targetLayer, 'touchstart', evt);

  // Move touch up more than touchSecondaryScrollLock.
  evt.pageY = initialPageY - SC.SCROLL.SCROLL_LOCK_GESTURE_THRESHOLD;
  SC.Event.trigger(targetLayer, 'touchmove', evt);

  equals(scrollView.get('verticalScrollOffset'), SC.SCROLL.SCROLL_LOCK_GESTURE_THRESHOLD, "PRELIM: Scrolling more than touchScrollThreshold results in scrolling");
  equals(scrollView.get('horizontalScrollOffset'), 0, "A touch with no horizontal change shouldn't trigger a horizontal scroll!");

  // Move touch sideways.
  evt.pageX = initialPageX - 50;
  SC.Event.trigger(targetLayer, 'touchmove', evt);

  equals(scrollView.get('verticalScrollOffset'), SC.SCROLL.SCROLL_LOCK_GESTURE_THRESHOLD, "A touch with no vertical change shouldn't trigger a vertical scroll!");
  equals(scrollView.get('horizontalScrollOffset'), 0, "Having scrolled vertically past the scrollGestureSecondaryThreshold, horizontal touch movements are ignored");
});