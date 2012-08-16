// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
// ========================================================================
// View Animation Unit Tests
// ========================================================================

/*globals module test ok same equals */

/* These unit tests verify:  animate(). */

var view, pane, originalSupportsTransitions = SC.platform.supportsCSSTransitions;

function styleFor(view) {
  return view.get('layer').style;
}

function transitionFor(view){
  return styleFor(view)[SC.platform.domCSSPrefix+"Transition"];
}

var commonSetup = {
  setup: function() {

    SC.RunLoop.begin();

    pane = SC.Pane.create({
      backgroundColor: '#ccc',
      layout: { top: 0, right: 0, width: 200, height: 200, zIndex: 100 }
    });
    pane.append();

    view = SC.View.create({
      backgroundColor: '#888',
      layout: { left: 0, top: 0, height: 100, width: 100 }
    });
    pane.appendChild(view);

    SC.RunLoop.end();
  },

  teardown: function(){
    pane.remove();
  }
};

if (SC.platform.supportsCSSTransitions) {

  module("ANIMATION", commonSetup);

  test("should work", function(){
    SC.RunLoop.begin();
    view.animate('left', 100, { duration: 1 });
    SC.RunLoop.end();
    equals(transitionFor(view), 'left 1s linear', 'add transition');
    equals(100, view.get('layout').left, 'left is 100');
  });

  test("should accept shorthand notation", function(){
    SC.RunLoop.begin();
    view.animate('left', 100, 1);
    SC.RunLoop.end();
    equals(transitionFor(view), 'left 1s linear', 'add transition');
  });

  test("callbacks work in general", function(){
    stop(2000);

    SC.RunLoop.begin();
    // We shouldn't have to use invokeLater, but it's the only way to get this to work!
    view.invokeLater('animate', 1, 'left', 100, 0.500, function() {
      start();
      ok(true, "Callback was called.");
    });
    SC.RunLoop.end();
  });

  test("callbacks should have appropriate data", function(){
    stop(2000);

    SC.RunLoop.begin();
    // We shouldn't have to use invokeLater, but it's the only way to get this to work!
    view.invokeLater('animate', 1, 'left', 100, 0.500, function(data) {
      start();

      // TODO: Test this better
      ok(data.event, "has event");
      equals(data.view, view, "view is correct");
      equals(data.isCancelled, false, "animation is not cancelled");
    });
    SC.RunLoop.end();
  });

  test("handles timing function string", function(){
    SC.RunLoop.begin();
    view.animate('left', 100, { duration: 1, timing: 'ease-in' });
    SC.RunLoop.end();
    equals(transitionFor(view), 'left 1s ease-in', 'uses ease-in timing');
  });

  test("handles timing function array", function(){
    SC.RunLoop.begin();
    view.animate('left', 100, { duration: 1, timing: [0.1, 0.2, 0.3, 0.4] });
    SC.RunLoop.end();
    equals(transitionFor(view), 'left 1s cubic-bezier(0.1, 0.2, 0.3, 0.4)', 'uses cubic-bezier timing');
  });

  test("should allow multiple keys to be set at once", function(){
    SC.RunLoop.begin();
    view.animate({ top: 100, left: 100 }, 1);
    SC.RunLoop.end();
    equals(transitionFor(view), 'top 1s linear, left 1s linear', 'should add transition');
    equals(100, view.get('layout').top, 'top is 100');
    equals(100, view.get('layout').left, 'left is 100');
  });

  // Pretty sure this does the job
  test("callbacks should be called only once for a grouped animation", function(){
    stop(2000);
    var stopped = true;

    expect(1);
    var propertyNames = "top left".w();

    SC.RunLoop.begin();
    // We shouldn't have to use invokeLater, but it's the only way to get this to work!
    view.invokeLater('animate', 1, { top: 100, left: 100 }, 0.500, function(data) {
      if (stopped) {
        start();
        stopped = false;
      }

      ok(true);
    });
    SC.RunLoop.end();
  });

  // This behavior should be up for debate.  Does the callback call immediately, or does it wait until the end of 
  // the specified animation period?  Currently we're calling it immediately.
  test("callback should be called immediately when a property is animated to its current value.", function() {

    stop(2000);

    expect(1);

    SC.RunLoop.begin();
    view.invokeLater('animate', 1, 'top', view.getPath('layout.top'), 0.250, function(){
      ok(true, 'callback called back');
      start();
    });
    SC.RunLoop.end();
  });

  test("callback should be called when a property is animated with a duration of zero.", function() {
    stop(2000);

    expect(1);

    SC.RunLoop.begin();
    view.invokeLater('animate', 1, 'top', 20, 0, function(){
      ok(true, 'callback called back');
      start();
    });
    SC.RunLoop.end();
  });

  test("multiple animations should be able to run simultaneously", function() {
    stop(2000);

    expect(2);

    SC.RunLoop.begin();
    view.invokeLater('animate', 1, 'top', 100, 0.250, function(){
      ok(true, 'top finished');
    });
    view.invokeLater('animate', 2, 'left', 100, 0.500, function(){
      ok(true, 'left finished');
      start();
    });
    SC.RunLoop.end();
  });

  test("altering existing animation should call callback as cancelled", function(){
    stop(2000);

    expect(2);

    SC.RunLoop.begin();
    view.invokeLater('animate', 1, 'top', 100, 0.500, function(data){
      equals(data.isCancelled, true, 'first cancelled');
    });
    view.invokeLater('animate', 250, 'top', 0, 0.500, function(data){
      equals(data.isCancelled, false, 'second not cancelled');
      start();
    });
    SC.RunLoop.end();
  });

  test("should not cancel callback when value hasn't changed", function() {
    var callbacks = 0, wasCancelled = NO, check = 0;
    stop(2000);
    
    SC.RunLoop.begin();
    view.invokeLater(function() {
      // this triggers the initial layoutStyle code
      view.animate('left', 79, 0.500, function(data) {
        callbacks++;
        wasCancelled = data.isCancelled;
      });
      // this triggers a re-render, re-running the layoutStyle code
      view.displayDidChange();
    }, 1);
    SC.RunLoop.end();
    
    setTimeout(function() {
      // capture the callbacks value
      check = callbacks;
    }, 250);
    
    setTimeout(function() {
      start();
      equals(check, 0, "the callback should not have been cancelled initially");
      equals(callbacks, 1, "the callback should have been fired");
      equals(wasCancelled, NO, "the callback should not have been cancelled");
    }, 1000);
  });

  test("should handle transform attributes", function(){
    SC.RunLoop.begin();
    view.animate('rotateX', 45, { duration: 1 });
    SC.RunLoop.end();
    equals(transitionFor(view), '-'+SC.platform.cssPrefix+'-transform 1s linear', 'add transition');
    equals(styleFor(view)[SC.platform.domCSSPrefix+'Transform'], 'rotateX(45deg)', 'has both transforms');
    equals(45, view.get('layout').rotateX, 'rotateX is 45deg');
  });

  test("should handle conflicting transform animations", function(){
    expect(5);

    var originalConsoleWarn = console.warn;
    console.warn = function(warning){
      equals(warning, "Can't animate transforms with different durations! Using first duration specified.", "proper warning");
    };

    SC.RunLoop.begin();
    view.animate('rotateX', 45, 1).animate('scale', 2, 2);
    SC.RunLoop.end();

    equals(transitionFor(view), '-'+SC.platform.cssPrefix+'-transform 1s linear', 'use duration of first');
    equals(styleFor(view)[SC.platform.domCSSPrefix+'Transform'], 'rotateX(45deg) scale(2)');
    equals(45, view.get('layout').rotateX, 'rotateX is 45deg');
    equals(2, view.get('layout').scale, 'scale is 2');

    console.warn = originalConsoleWarn;
  });

  test("should properly handle callbacks from conflicting transforms");

  test("removes animation property when done", function(){
    stop(2000);

    SC.RunLoop.begin();
    view.invokeLater('animate', 1000, { top: 100, scale: 2 }, 0.500);
    SC.RunLoop.end();

    setTimeout(function(){
      start();
      equals(view.get('layout').animateTop, undefined, "animateTop is undefined");
      equals(view.get('layout').animateScale, undefined, "animateScale is undefined");
    }, 1000);
  });

  module("ANIMATION WITH ACCELERATED LAYER", {
    setup: function(){
      commonSetup.setup();
      view.wantsAcceleratedLayer = YES;
    },

    teardown: commonSetup.teardown
  });

  test("handles acceleration when appropriate", function(){
    SC.RunLoop.begin();
    view.animate('top', 100, 1);
    SC.RunLoop.end();
    equals(transitionFor(view), '-'+SC.platform.cssPrefix+'-transform 1s linear', 'transition is on transform');
  });

  test("doesn't use acceleration when not appropriate", function(){
    SC.RunLoop.begin();
    view.adjust({ height: null, bottom: 0 });
    view.animate('top', 100, 1);
    SC.RunLoop.end();
    equals(transitionFor(view), 'top 1s linear', 'transition is not on transform');
  });

  test("combines accelerated layer animation with compatible transform animations", function(){
    SC.RunLoop.begin();
    view.animate('top', 100, 1).animate('rotateX', 45, 1);
    SC.RunLoop.end();

    var transform = styleFor(view)[SC.platform.domCSSPrefix+'Transform'];

    // We need to check these separately because in some cases we'll also have translateZ, this way we don't have to worry about it
    ok(transform.match(/translateX\(0px\) translateY\(100px\)/), 'has translate');
    ok(transform.match(/rotateX\(45deg\)/), 'has rotateX');
  });

  test("should not use accelerated layer if other transforms are being animated at different speeds", function(){
    SC.RunLoop.begin();
    view.animate('rotateX', 45, 2).animate('top', 100, 1);
    SC.RunLoop.end();

    var style = styleFor(view);

    equals(style[SC.platform.domCSSPrefix+'Transform'], 'rotateX(45deg)', 'transform should only have rotateX');
    equals(style['top'], '100px', 'should not accelerate top');
  });

  test("callbacks should work properly with acceleration", function(){
    stop(2000);
    var stopped = true;

    expect(1);
    var propertyNames = "top left scale".w();

    SC.RunLoop.begin();
    // We shouldn't have to use invokeLater, but it's the only way to get this to work!
    view.invokeLater('animate', 1, { top: 100, left: 100, scale: 2 }, 0.500, function(data) {
      if (stopped) {
        start();
        stopped = false;
      }

      ok(true);
    });
    SC.RunLoop.end();
  });

  test("should not add animation for properties that have the same value as existing layout", function() {
    var callbacks = 0;

    SC.RunLoop.begin();
    // we set width to the same value, but we change height
    view.invokeLater('animate', 1, {width: 100, height: 50}, 0.5, function() { callbacks++; });
    SC.RunLoop.end();

    ok(callbacks === 0, "precond - callback should not have been run yet");

    stop(2000);

    // we need to test changing the width at a later time
    setTimeout(function() {
      start();

      equals(callbacks, 1, "callback should have been run once, for height change");

      SC.RunLoop.begin();
      view.animate('width', 50, 0.5);
      SC.RunLoop.end();

      equals(callbacks, 1, "callback should still have only been called once, even though width has now been animated");
    }, 1000);
  });

  test("should warn if multiple callbacks for transitions");

}

module("ANIMATION WITHOUT TRANSITIONS", {
  setup: function(){
    commonSetup.setup();
    SC.platform.supportsCSSTransitions = NO;
  },

  teardown: function(){
    commonSetup.teardown();
    SC.platform.supportsCSSTransitions = originalSupportsTransitions;
  }
});

test("should update layout", function(){
  view.animate('left', 100, 1);
  equals(100, view.get('layout').left, 'left is 100');
});

test("should still run callback", function(){
  var ranCallback = 0;

  SC.RunLoop.begin();
  view.animate({ top: 200, left: 100 }, 1, function() { ranCallback++; });
  SC.RunLoop.end();

  equals(ranCallback, 1, "should run callback");
});
