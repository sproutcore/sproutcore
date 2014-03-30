// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2011 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module, test, ok, equals */

var pane, scroll, inner, event,
    scrollStart, innerStart, scrollDragged, innerDragged, scrollEnd, innerEnd, scrollCancel, innerCancel;

// Sets up and tears down our pane and event.
module("SC.ScrollView touch", {
  setup: function() {

    // Initialize our counters.
    scrollStart = scrollDragged = scrollEnd = scrollCancel = 0;
    innerStart = innerDragged = innerEnd = innerCancel = 0;

    // Create our pane.
    pane = SC.MainPane.extend({
      layout: { height: 80 },
      childViews: ['contentView'],
      contentView: SC.ScrollView.extend({

        touchStart: function() {
          scrollStart++;
          return sc_super();
        },
        touchesDragged: function() {
          scrollDragged++;
          return sc_super();
        },
        touchEnd: function() {
          scrollEnd++;
          return sc_super();
        },
        touchCancelled: function() {
          scrollCancel++;
          return sc_super();
        },

        contentView: SC.View.extend({
          layout: { height: 100 },
          touchStart: function() {
            innerStart++;
          },
          touchesDragged: function(evt, touchesForView) {
            innerDragged++;
            // If we've scrolled more than 15 pixels, pass back to the scroller.
            if (Math.abs(evt.startY - evt.pageY) > 15) {
              touchesForView.invoke('restoreLastTouchResponder')
            }
          },
          touchEnd: function() {
            innerEnd++;
          },
          touchCancelled: function() {
            innerCancel++;
          }
        })
      })
    });
    SC.run(function() {
      // (Actually create it, in a run loop.)
      pane = pane.create().append();
    });

    // Set up our pertinent reused variables.
    scroll = pane.contentView;
    inner = scroll.contentView;
    targetLayer = inner.get('layer');

    event = SC.Event.simulateEvent(targetLayer, 'touchstart');
    event.touches = [event];
    event.identifier = 4;
    event.pageX = 50;
    event.pageY = 50;
    event.changedTouches = [event];
  },
  teardown: function() {
    pane.destroy();
    pane = null;
    event = null;
  }
});


// Test a touch lifecycle with no vertical movement and delaysContentTouches: YES - the scroll view will capture the touch,
// but since there was no scroll, it will give inner views a chance to respond to it on touchEnd.
test("Tapping with delaysContentTouches: YES", function() {
  // Trigger touchstart
  SC.run(function() {
    SC.Event.trigger(targetLayer, 'touchstart', [event]);
  });

  equals(scrollStart, 1, "After touchstart, the scroll view's touchStart should have been called once");
  equals(innerStart, 0, "After touchstart, the inner view's touchStart should not have been called, as the touch was captured by the scroll view");

  // Trigger touchmove:
  SC.run(function() {
    SC.Event.trigger(targetLayer, 'touchmove', [event]);
  });

  equals(scrollDragged, 1, "After touchmove, the scroll view's touchesDragged should have been called once");
  equals(innerDragged, 0, "After touchmove, the inner view's touchesDragged should not have been called, as the touch is still owned by the scroll view");

  // Trigger touchend:
  SC.run(function() {
    SC.Event.trigger(targetLayer, 'touchend', [event]);
  });

  equals(scrollEnd, 1, "After touchend, the scroll view's touchEnd should have been called once");
  equals(innerStart, 1, "Once the scroll view has handled touchEnd, it passes the touch to the inner view, so innerStart should have run");
  equals(innerDragged, 0, "The inner view's touchesDragged method should still not have been called");
  equals(innerEnd, 1, "The scroll view ends the touch as soon as the inner view has had a chance to start it, thus tap; this triggers the inner view's touchEnd immediately");
});


// Test a touch lifecycle with some vertical movement and delaysContentTouches: YES - The scroll view will capture the
// touch, and since there was a scroll, the inner view will not receive any notifications whatsoever.
test("Dragging with delaysContentTouches: YES", function() {
  // Trigger touchstart
  SC.run(function() {
    SC.Event.trigger(targetLayer, 'touchstart', [event]);
  });

  equals(scrollStart, 1, "After touchstart, the scroll view's touchStart should have been called once");
  equals(innerStart, 0, "After touchstart, the inner view's touchStart should not have been called, as the touch was captured by the scroll view");

  // Give the event some vertical delta:
  event.pageY += 16;
  // Trigger touchmove:
  SC.run(function() {
    SC.Event.trigger(targetLayer, 'touchmove', [event]);
  });

  equals(scrollDragged, 1, "After touchmove, the scroll view's touchesDragged should have been called once");
  equals(innerDragged, 0, "After touchmove, the inner view's touchesDragged should not have been called, as the touch is still owned by the scroll view");

  // Trigger touchend:
  SC.run(function() {
    SC.Event.trigger(targetLayer, 'touchend', [event]);
  });

  equals(scrollEnd, 1, "After touchend, the scroll view's touchEnd should have been called once");
  equals(innerStart, 0, "inner view's touchStart will not have run, as the touch has moved enough to begin scrolling and will bypass the inner view entirely");
  equals(innerDragged, 0, "The inner view's touchesDragged method should still not have been called");
  equals(innerEnd, 0, "Having never started, the inner view will not receive touchEnd either");
});


// Test a touch lifecycle with no vertical movement and delaysContentTouches: NO - the scroll view should not partake in this touch at all.
test("Tapping with delaysContentTouches: NO", function() {
  scroll.set('delaysContentTouches', NO);

  // Trigger touchstart
  SC.run(function() {
    SC.Event.trigger(targetLayer, 'touchstart', [event]);
  });

  equals(scrollStart, 0, "We're not capturing touches, so scroll view's touchStart will not have fired after touchstart");
  equals(innerStart, 1, "After touchstart, inner view's touchStart will have been called once");

  // Trigger touchmove:
  SC.run(function() {
    SC.Event.trigger(targetLayer, 'touchmove', [event]);
  });

  equals(scrollDragged, 0, "Scroll view's touchesDragged will not have fired, as it is not the touch responder");
  equals(innerDragged, 1, "After touchmove, inner view's touchDragged gets straightforwardly called because it is the touch responder");

  // Trigger touchend:
  SC.run(function() {
    SC.Event.trigger(targetLayer, 'touchend', [event]);
  });

  equals(scrollEnd, 0, "Again, the scroll view is completely uninvolved in this touch, so its touchEnd doesn't get called");
  equals(innerEnd, 1, "The inner view's touchEnd gets called because of how it's responding to the touch");
});


// Tests a touch lifecycle with some vertical movement and delaysContentTouches: NO - the inner view will receive the touch,
// but upon it becoming a drag will voluntarily relinquish it back to the scroll view. (See innerView.touchesDragged in the
// current module.setup method.)
test("Dragging with delaysContentTouches: NO", function() {
  scroll.set('delaysContentTouches', NO);

  // Trigger touchstart
  SC.run(function() {
    SC.Event.trigger(targetLayer, 'touchstart', [event]);
  });

  equals(scrollStart, 0, "Since the scroll view isn't capturing touches, it gets no touchStart love");
  equals(innerStart, 1, "After touchstart, the inner view's touchStart should have been straightforwardly called");

  // Give the event some vertical delta:
  event.pageY += 16;
  // Trigger touchmove:
  SC.run(function() {
    SC.Event.trigger(targetLayer, 'touchmove', [event]);
  });

  equals(scrollDragged, 0, "The scroll view's touchDragged should not have been called, since at the time of the event it was not the touch's responder");
  equals(innerDragged, 1, "The inner view's touchesDragged should have straightforwardly handled the event");
  equals(scrollStart, 1, "Having been passed the touch by inner view's touchesDragged, the scroll view's touchStart will now have fired");
  equals(innerCancel, 1, "Having passed the touch back to the scroll view, the inner view's touchCancelled should have run")

  // Trigger touchend:
  SC.run(function() {
    SC.Event.trigger(targetLayer, 'touchend', [event]);
  });

  equals(scrollEnd, 1, "After touchend, the scroll view's touchEnd should have been called once");
});
