// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test equals context ok same Q$ htmlbody */
var pane, fooView, barView, defaultResponder, evt, callCount ;
var handlerYes, handlerNo, handlerMixed;

module("SC.Pane#sendTouchEvent - single view", {
  setup: function() {

    callCount = 0;
    var handler = function(theEvent) {
      callCount++ ;
      equals(theEvent, evt, 'should pass event');
      return YES;
    };

    defaultResponder = SC.Object.create({ defaultEvent: handler });
    pane = SC.Pane.create({
      defaultResponder: defaultResponder,
      childViews: [SC.View.extend({
        fooEvent: handler,
        childViews: [SC.View.extend({
          barEvent: handler
        })]
      })]
    });
    fooView = pane.childViews[0];
    ok(fooView.fooEvent, 'has fooEvent handler');

    barView = fooView.childViews[0];
    ok(barView.barEvent, 'has barEvent handler');

    evt = SC.Object.create(); // mock
  },

  teardown: function() {
    pane = fooView = barView = defaultResponder = evt = null ;
  }
});

test("when invoked with target = nested view", function() {
  var handler ;

  // test event handler on target
  callCount = 0;
  handler = pane.sendTouchEvent('barEvent', evt, barView);
  equals(callCount, 1, 'should invoke handler');
  equals(handler[0], barView, 'should return view that handled event');
  equals(handler.get('length'), 1, 'should only be handled by one view');

  // test event handler on target parent
  callCount = 0;
  handler = pane.sendTouchEvent('fooEvent', evt, barView);
  equals(callCount, 1, 'should invoke handler');
  equals(handler[0], fooView, 'should return responder that handled event');
  equals(handler.get('length'), 1, 'should only be handled by one view');

  // test event handler on default responder
  callCount = 0;
  handler = pane.sendTouchEvent('defaultEvent', evt, barView);
  equals(callCount, 1, 'should invoke handler');
  equals(handler[0], defaultResponder, 'should return responder that handled event');
  equals(handler.get('length'), 1, 'should only be handled by one view');

  // test unhandled event handler
  callCount = 0;
  handler = pane.sendTouchEvent('imaginary', evt, barView);
  equals(callCount, 0, 'should not invoke handler');
  equals(SC.typeOf(handler), SC.T_ARRAY, 'should return array if no handlers');
  equals(handler.get('length'), 0, 'array should be empty');

});

test("when invoked with target = middle view", function() {
  var handler ;

  // test event handler on child view of target
  callCount = 0;
  handler = pane.sendTouchEvent('barEvent', evt, fooView);
  equals(callCount, 0, 'should not invoke handler');
  equals(SC.typeOf(handler), SC.T_ARRAY, 'should return array if no handlers');
  equals(handler.get('length'), 0, 'array should be empty');

  // test event handler on target
  callCount = 0;
  handler = pane.sendTouchEvent('fooEvent', evt, fooView);
  equals(callCount, 1, 'should invoke handler');
  equals(handler[0], fooView, 'should return responder that handled event');
  equals(handler.get('length'), 1, 'should only be handled by one view');

  // test event handler on default responder
  callCount = 0;
  handler = pane.sendTouchEvent('defaultEvent', evt, fooView);
  equals(callCount, 1, 'should invoke handler');
  equals(handler[0], defaultResponder, 'should return responder that handled event');
  equals(handler.get('length'), 1, 'should only be handled by one view');

  // test unhandled event handler
  callCount = 0;
  handler = pane.sendTouchEvent('imaginary', evt, fooView);
  equals(callCount, 0, 'should not invoke handler');
  equals(SC.typeOf(handler), SC.T_ARRAY, 'should return array if no handlers');
  equals(handler.get('length'), 0, 'array should be empty');

});

test("when invoked with target = pane", function() {
  var handler ;

  // test event handler on child view of target
  callCount = 0;
  handler = pane.sendTouchEvent('barEvent', evt, pane);
  equals(callCount, 0, 'should not invoke handler');
  equals(SC.typeOf(handler), SC.T_ARRAY, 'should return array if no handlers');
  equals(handler.get('length'), 0, 'array should be empty');

  // test event handler on target
  callCount = 0;
  handler = pane.sendTouchEvent('fooEvent', evt, pane);
  equals(callCount, 0, 'should not invoke handler');
  equals(SC.typeOf(handler), SC.T_ARRAY, 'should return array if no handlers');
  equals(handler.get('length'), 0, 'array should be empty');

  // test event handler on default responder
  callCount = 0;
  handler = pane.sendTouchEvent('defaultEvent', evt, pane);
  equals(callCount, 1, 'should invoke handler');
  equals(handler[0], defaultResponder, 'should return responder that handled event');
  equals(handler.get('length'), 1, 'should only be handled by one view');

  // test unhandled event handler
  callCount = 0;
  handler = pane.sendTouchEvent('imaginary', evt, pane);
  equals(callCount, 0, 'should not invoke handler');
  equals(SC.typeOf(handler), SC.T_ARRAY, 'should return array if no handlers');
  equals(handler.get('length'), 0, 'array should be empty');

});

test("when invoked with target = null", function() {
  var handler ;

  // should start @ first responder
  pane.firstResponder = fooView;

  // test event handler on child view of target
  callCount = 0;
  handler = pane.sendTouchEvent('barEvent', evt);
  equals(callCount, 0, 'should not invoke handler');
  equals(SC.typeOf(handler), SC.T_ARRAY, 'should return array if no handlers');
  equals(handler.get('length'), 0, 'array should be empty');

  // test event handler on target
  callCount = 0;
  handler = pane.sendTouchEvent('fooEvent', evt);
  equals(callCount, 1, 'should invoke handler');
  equals(handler[0], fooView, 'should return responder that handled event');

  // test event handler on default responder
  callCount = 0;
  handler = pane.sendTouchEvent('defaultEvent', evt);
  equals(callCount, 1, 'should invoke handler');
  equals(handler[0], defaultResponder, 'should return responder that handled event');

  // test unhandled event handler
  callCount = 0;
  handler = pane.sendTouchEvent('imaginary', evt);
  equals(callCount, 0, 'should not invoke handler');
  equals(SC.typeOf(handler), SC.T_ARRAY, 'should return array if no handlers');
  equals(handler.get('length'), 0, 'array should be empty');

});

module("SC.Pane#sendTouchEvent - multiple views", {
  setup: function() {

    callCount = 0;
    handlerYes = function(theEvent) {
      callCount++ ;
      equals(theEvent, evt, 'should pass event');
      return YES;
    };

    handlerNo = function(theEvent) {
      callCount++ ;
      equals(theEvent, evt, 'should pass event');
      return NO;
    };

    handlerMixed = function(theEvent) {
      callCount++ ;
      equals(theEvent, evt, 'should pass event');
      return SC.MIXED_STATE;
    };

    defaultResponder = SC.Object.create({ defaultEvent: handlerMixed,
                                          barEvent: handlerMixed });
    pane = SC.Pane.create({
      defaultResponder: defaultResponder,
      childViews: [SC.View.extend({
        fooEvent: handlerMixed,
        barEvent: handlerMixed,
        childViews: [SC.View.extend({
          barEvent: handlerMixed
        })]
      })]
    });
    fooView = pane.childViews[0];
    ok(fooView.fooEvent, 'has fooEvent handler');

    barView = fooView.childViews[0];
    ok(barView.barEvent, 'has barEvent handler');

    evt = SC.Object.create(); // mock
  },

  teardown: function() {
    pane = fooView = barView = defaultResponder = evt = null ;
  }
});

test('view chain with only non-exclusive responders', function() {
  var handler;

  callCount = 0;
  handler = pane.sendTouchEvent('barEvent', evt, barView);
  equals(callCount, 3, 'should invoke handler on entire chain');
  equals(handler[0], barView, 'should return responder that returned SC.MIXED_STATE');
  equals(handler[1], fooView, 'should return responder that returned SC.MIXED_STATE');
  equals(handler[2], defaultResponder, 'should return responder that returned SC.MIXED_STATE');
  equals(handler.get('length'), 3, 'should be handled by all three responders');
});

test('view chain with one exclusive responder', function() {
  var handler;

  fooView.barEvent = handlerYes;
  callCount = 0;
  handler = pane.sendTouchEvent('barEvent', evt, barView);
  equals(callCount, 2, 'should invoke handler on first two views');
  equals(handler[0], fooView, 'should return responder that returned YES');
  equals(handler.get('length'), 1, 'responder should have exclusive control');
});

test('view chain with default responder that returns YES', function() {
  var handler;

  fooView.barEvent = handlerNo;
  defaultResponder.barEvent = handlerYes;
  callCount = 0;
  handler = pane.sendTouchEvent('barEvent', evt, barView);
  equals(callCount, 3, 'should invoke handler on all three responders');
  equals(handler[0], defaultResponder, 'should return responder that returned YES');
  equals(handler.get('length'), 1, 'responder should have exclusive control');
});
