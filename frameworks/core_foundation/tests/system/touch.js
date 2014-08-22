// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2014 Strobe Inc. and contributors.
//            portions copyright @2011 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

var pane,
    // TODO: This custom event counting could/should be replaced with CoreTest.stub.
    outerCapture = 0,
    outerStart = 0,
    outerDragged = 0,
    outerCancel = 0,
    outerEnd = 0,
    innerStart = 0,
    innerDragged = 0,
    innerCancel = 0,
    innerEnd = 0;

module("SC.View#captureTouch", {
  setup: function() {
    SC.run(function() {
      pane = SC.Pane.create({
        layout: { width: 200, height: 200, left: 0, top: 0 },
        childViews: ['outerView'],

        outerView: SC.View.extend({
          captureTouch: function() { outerCapture++; return YES; },
          touchStart: function() { outerStart++; return YES; },
          // When touch is dragged, this passes control of the touch to the inner view.
          touchesDragged: function(evt, viewTouches) {
            outerDragged++;
            viewTouches.forEach(function(touch) {
              touch.stackNextTouchResponder(this.innerView);
            }, this);
          },
          touchCancelled: function() { outerCancel++; },
          touchEnd: function() { outerEnd++; },

          childViews: ['innerView'],
          innerView: SC.View.extend({
            layout: { width: 50, height: 50, left: 100, top: 100 },
            touchStart: function() { innerStart++; },
            // When touch is dragged, this passes control of the touch BACK to the outer view.
            touchesDragged: function(evt, viewTouches) {
              innerDragged++;
              viewTouches.invoke('restoreLastTouchResponder');
            },
            touchCancelled: function() { innerCancel++; },
            touchEnd: function() { innerEnd++; }
          })
        })
      }).append();
    });
  },

  teardown: function() {
    pane.remove();
    pane = null;
  }
});

test("Touch event handling and juggling.", function() {
  var outer = pane.outerView,
      inner = outer.innerView,
      layer = inner.get('layer'),
      event = SC.Event.simulateEvent(layer, 'touchstart');

  event.touches = [];
  event.identifier = 4;
  event.changedTouches = [event];

  // Trigger touchstart: outerView.captureTouch > outerView.touchStart
  SC.run(function() {
    SC.Event.trigger(layer, 'touchstart', [event]);
  });

  equals(outerCapture, 1, "To capture the initial touch, outerView.captureTouch should have run:");
  equals(outerStart, 1, "Having captured the initial touch, outerView.touchStart should have run:");
  if (innerStart) ok(false, "outerView.innerStart should not have been called yet!");
  if (outerDragged) ok(false, "outerView.touchesDragged should not have been called yet!");
  if (innerDragged) ok(false, "innerView.touchesDragged should not have been called yet!");
  if (outerCancel) ok(false, "outerView.touchCancelled should not have been called yet!");
  if (innerCancel) ok(false, "innerView.touchCancelled should not have been called yet!");
  if (innerEnd) ok(false, "innerView.touchEnd should not have been called yet!");
  if (outerEnd) ok(false, "outerView.touchEnd should not have been called yet!");

  // Trigger touchmoved: outerView.touchesDragged > [passes touch to innerView] > innerView.touchStart
  event.type = 'touchmove';
  SC.run(function() {
    SC.Event.trigger(layer, 'touchmove', [event]);
  });

  if (outerCapture !== 1) ok(false, "outerView.captureTouch should only have been called once!");
  if (outerStart !== 1) ok(false, "outerView.touchStart should only have been called once!");
  equals(outerDragged, 1, "Having captured the initial touch, outerView.touchesDragged should have been called:");
  equals(outerCancel, 0, "Having given up ownership but not removed itself from the stack, outerView.touchCancelled should not have been called:");
  equals(innerStart, 1, "Having been passed touch ownership by outerView, innerView.touchesStart should have been called:");
  if (innerDragged) ok(false, "innerView.touchesDragged should not have been called yet!");
  if (innerCancel) ok(false, "innerView.touchCancelled should not have been called yet!");
  if (innerEnd) ok(false, "innerView.touchEnd should not have been called yet!");
  if (outerEnd) ok(false, "outerView.touchEnd should not have been called yet!");

  // Trigger touchmoved x2: innerView.touchesDragged > [passes touch back to outerView] > outerView.touchStart > innerView.touchCancelled
  SC.run(function() {
    SC.Event.trigger(layer, 'touchmove', [event]);
  });

  if (outerCapture !== 1) ok(false, "outerView.captureTouch should only have been called once!");
  equals(outerDragged, 1, "Having passed ownership to innerView, outerView.touchesDragged should not have been called again:");
  if (outerStart !== 1) ok(false, "Even having retaken ownership of the touch, outerView.touchStart should only have been called once!");
  if (innerStart !== 1) ok(false, "innerView.touchStart should only have been called once!");
  equals(innerDragged, 1, "Now having ownership of the touch, innerView.touchesDragged should have been called:");
  if (outerCancel) ok(false, "Having never been removed from the touch responder stack, outerView.touchCancelled should not have been called!");
  equals(innerCancel, 1, "Having passed ownership permanently back to outerView, innerView.touchCancelled should have been called:");
  if (innerEnd) ok(false, "innerView.touchEnd should not have been called yet!");
  if (outerEnd) ok(false, "outerView.touchEnd should not have been called yet!");

  // Trigger touchend: outerView.touchEnd
  event.type = 'touchend';
  SC.run(function() {
    SC.Event.trigger(layer, 'touchend', [event]);
  });

  if (outerCapture !== 1) ok(false, "outerView.captureTouch should only have been called once!");
  if (outerStart !== 1) ok(false, "outerView.touchStart should only have been called once!");
  if (innerStart !== 1) ok(false, "innerView.touchStart should only have been called once!");
  if (outerDragged !== 1) ok(false, "outerView.touchesDragged should only have been called once!");
  if (innerDragged !== 1) ok(false, "innerView.touchesDragged should only have been called once!");
  if (innerCancel !== 1) ok(false, "innerView.touchCancelled should only have been called once!");
  equals(outerCancel, 0, "Having never been removed from the touch's responder stack, outerView.touchCancelled should never have been called.");
  equals(innerEnd, 0, "Having previously given up control of the touch, innerView.touchEnd should never have been called:");
  equals(outerEnd, 1, "outerView.touchEnd should have been called:")

});
