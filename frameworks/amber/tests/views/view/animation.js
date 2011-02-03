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
    stop(1000);

    SC.RunLoop.begin();
    // We shouldn't have to use invokeLater, but it's the only way to get this to work!
    view.invokeLater('animate', 1, 'left', 100, .5, function() {
      start();
      ok(true, "Callback was called.");
    });
    SC.RunLoop.end();
  });

  test("callbacks should have appropriate data", function(){
    stop(1000);

    SC.RunLoop.begin();
    // We shouldn't have to use invokeLater, but it's the only way to get this to work!
    view.invokeLater('animate', 1, 'left', 100, .5, function(data) {
      start();

      // TODO: Test this better
      ok(data.event, "has event");
      equals(data.propertyName, 'left', "propertyName is 'left'");
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
  test("callbacks should be called for each property", function(){
    stop(1000);
    var stopped = true;

    expect(2);
    var propertyNames = "top left".w();

    SC.RunLoop.begin();
    // We shouldn't have to use invokeLater, but it's the only way to get this to work!
    view.invokeLater('animate', 1, { top: 100, left: 100 }, .5, function(data) {
      if (stopped) {
        start();
        stopped = false;
      }

      var hasProperty = false;
      if (propertyNames.contains(data.propertyName)) {
        propertyNames.removeObject(data.propertyName);
        hasProperty = true;
      }

      ok(hasProperty, "has property: "+data.propertyName);
    });
    SC.RunLoop.end();
  });

  test("multiple animations should be able to run simultaneously", function(){
    stop(2000);

    expect(2);

    SC.RunLoop.begin();
    view.invokeLater('animate', 1, 'top', 100, 1, function(){
      ok(true, 'top finished');
    });
    view.invokeLater('animate', 500, 'left', 100, .5, function(){
      ok(true, 'left finished');
      start();
    });
    SC.RunLoop.end();
  });

  test("altering existing animation should call callback as cancelled", function(){
    stop(2000);

    expect(2);

    SC.RunLoop.begin();
    view.invokeLater('animate', 1, 'top', 100, 1, function(data){
      equals(data.isCancelled, true, 'first cancelled');
    });
    view.invokeLater('animate', 500, 'top', 0, .5, function(data){
      equals(data.isCancelled, false, 'second not cancelled');
      start();
    });
    SC.RunLoop.end();
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
    stop(1500);

    SC.RunLoop.begin();
    view.invokeLater('animate', 1, { top: 100, scale: 2 }, 0.5);
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
    stop(1000);
    var stopped = true;

    expect(3);
    var propertyNames = "top left scale".w();

    SC.RunLoop.begin();
    // We shouldn't have to use invokeLater, but it's the only way to get this to work!
    view.invokeLater('animate', 1, { top: 100, left: 100, scale: 2 }, .5, function(data) {
      if (stopped) {
        start();
        stopped = false;
      }

      var hasProperty = false;
      if (propertyNames.contains(data.propertyName)) {
        propertyNames.removeObject(data.propertyName);
        hasProperty = true;
      }

      ok(hasProperty, "has property: "+data.propertyName);
    });
    SC.RunLoop.end();
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
  var ranCallback = false;

  SC.RunLoop.begin();
  view.animate('left', 100, 1, function() { ranCallback = true; });
  SC.RunLoop.end();

  ok(ranCallback, "should run callback");
});
