// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2014 Strobe Inc. and contributors.
//            portions copyright @2011 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*global module, test, ok, equals */

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
      event = SC.Event.simulateEvent(layer, 'touchstart'),
      touch;

  event.touches = [];
  event.identifier = 4;
  event.changedTouches = [event];

  // Trigger touchstart: outerView.captureTouch > outerView.touchStart
  SC.Event.trigger(layer, 'touchstart', [event]);

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

  // Copy the last DOM touch as the basis of an updated DOM touch.
  touch = SC.RootResponder.responder._touches[event.identifier];
  touch = SC.copy(touch);

  event = SC.Event.simulateEvent(layer, 'touchmove', { touches: [touch], identifier: 4, changedTouches: [touch] });
  SC.Event.trigger(layer, 'touchmove', [event]);

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
  // Copy the last DOM touch as the basis of an updated DOM touch.
  touch = SC.RootResponder.responder._touches[event.identifier];
  touch = SC.copy(touch);

  event = SC.Event.simulateEvent(layer, 'touchmove', { touches: [touch], identifier: 4, changedTouches: [touch] });
  SC.Event.trigger(layer, 'touchmove', [event]);

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

  // Copy the last DOM touch as the basis of an updated DOM touch.
  touch = SC.RootResponder.responder._touches[event.identifier];
  touch = SC.copy(touch);

  event = SC.Event.simulateEvent(layer, 'touchend', { touches: [touch], identifier: 4, changedTouches: [touch] });
  SC.Event.trigger(layer, 'touchend', [event]);

  if (outerCapture !== 1) ok(false, "outerView.captureTouch should only have been called once!");
  if (outerStart !== 1) ok(false, "outerView.touchStart should only have been called once!");
  if (innerStart !== 1) ok(false, "innerView.touchStart should only have been called once!");
  if (outerDragged !== 1) ok(false, "outerView.touchesDragged should only have been called once!");
  if (innerDragged !== 1) ok(false, "innerView.touchesDragged should only have been called once!");
  if (innerCancel !== 1) ok(false, "innerView.touchCancelled should only have been called once!");
  equals(outerCancel, 0, "Having never been removed from the touch's responder stack, outerView.touchCancelled should never have been called.");
  equals(innerEnd, 0, "Having previously given up control of the touch, innerView.touchEnd should never have been called:");
  equals(outerEnd, 1, "outerView.touchEnd should have been called:");

});

module("SC.Touch", {
});

/* Class Methods */

// This method creates a new SC.Touch.
test("Class Method: create", function () {
  equals(SC.Touch.create({ identifier: 'test-touch' }).constructor, SC.Touch.prototype.constructor, "The method returns instance of type");
});

// This method returns the average of all the given touches.
test("Class Method: averagedTouch", function () {
  var touch1 = SC.Touch.create({ identifier: 'touch-1', pageX: 0, pageY: 0, velocityX: 0, velocityY: 0 }),
      touch2 = SC.Touch.create({ identifier: 'touch-2', pageX: 100, pageY: 100, velocityX: 0, velocityY: 0 }),
      touch3 = SC.Touch.create({ identifier: 'touch-3', pageX: 200, pageY: 200, velocityX: 0, velocityY: 0 }),
      avgTouch;

  // Test two touches.
  avgTouch = SC.Touch.averagedTouch([touch1, touch2]);
  equals(avgTouch.x.toFixed(1), '50.0', "The value of x is");
  equals(avgTouch.y.toFixed(1), '50.0', "The value of y is");
  equals(avgTouch.velocityX.toFixed(1), '0.0', "The value of velocityX is");
  equals(avgTouch.velocityY.toFixed(1), '0.0', "The value of velocityY is");
  equals(avgTouch.d.toFixed(1), '70.7', "The value of d is");

  // Test two touches in reverse.
  avgTouch = SC.Touch.averagedTouch([touch2, touch1]);
  equals(avgTouch.x.toFixed(1), '50.0', "The value of x is");
  equals(avgTouch.y.toFixed(1), '50.0', "The value of y is");
  equals(avgTouch.velocityX.toFixed(1), '0.0', "The value of velocityX is");
  equals(avgTouch.velocityY.toFixed(1), '0.0', "The value of velocityY is");
  equals(avgTouch.d.toFixed(1), '70.7', "The value of d is");

  // Test three touches.
  avgTouch = SC.Touch.averagedTouch([touch1, touch2, touch3]);
  equals(avgTouch.x.toFixed(1), '100.0', "The value of x is");
  equals(avgTouch.y.toFixed(1), '100.0', "The value of y is");
  equals(avgTouch.velocityX.toFixed(1), '0.0', "The value of velocityX is");
  equals(avgTouch.velocityY.toFixed(1), '0.0', "The value of velocityY is");
  equals(avgTouch.d.toFixed(1), '94.3', "The value of d is");

  // Test three touches in different order.
  avgTouch = SC.Touch.averagedTouch([touch2, touch3, touch1]);
  equals(avgTouch.x.toFixed(1), '100.0', "The value of x is");
  equals(avgTouch.y.toFixed(1), '100.0', "The value of y is");
  equals(avgTouch.velocityX.toFixed(1), '0.0', "The value of velocityX is");
  equals(avgTouch.velocityY.toFixed(1), '0.0', "The value of velocityY is");
  equals(avgTouch.d.toFixed(1), '94.3', "The value of d is");
});

/* Properties */

test("Default Properties:", function () {
  var touch = SC.Touch.create({ identifier: 'test-touch' });

  equals(touch.identifier, 'test-touch', "The default value of identifier is");
});

/* Methods */

// This method registers _sc_pinchAnchorScale to the value of the view's scale.
test("Method: touchSessionStarted", function () {
});
