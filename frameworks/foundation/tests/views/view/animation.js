// ========================================================================
// View Animation Unit Tests
// ========================================================================

/*globals module test ok same equals */

/* These unit tests verify:  animate(). */

var view, pane, originalSupportsTransitions = SC.platform.supportsCSSTransitions;

function transitionFor(view){
  return view.get('layer').style[SC.platform.domCSSPrefix+"Transition"];
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
    view.animate('left', 100, { duration: 1 });
    equals(transitionFor(view), 'left 1s linear', 'add transition');
    equals(100, view.get('layout').left, 'left is 100');
  });

  test("should accept shorthand notation", function(){
    view.animate('left', 100, 1);
    equals(transitionFor(view), 'left 1s linear', 'add transition');  
  });

  test("callbacks work in general", function(){
    var timeout = setTimeout(function(){
      start();
      ok(false, "Timeout! Callback was not called.");
    }, 2000);

    view.animate('left', 100, {
      duration: 1, callback: function() {
        start();
        ok(true, "Callback was called.");
        clearTimeout(timeout);
      }
    });
    stop();
  });

  test("handles timing function string", function(){
    view.animate('left', 100, { duration: 1, timing: 'ease-in' });
    equals(transitionFor(view), 'left 1s ease-in', 'uses ease-in timing');
  });

  test("handles timing function array", function(){
    view.animate('left', 100, { duration: 1, timing: [0.1, 0.2, 0.3, 0.4] });
    equals(transitionFor(view), 'left 1s cubic-bezier(0.1, 0.2, 0.3, 0.4)', 'uses cubic-bezier timing');
  });



  module("ANIMATION WITH ACCELERATED LAYER", {
    setup: function(){
      commonSetup.setup();
      // Force support
      view.hasAcceleratedLayer = YES;
    },

    teardown: commonSetup.teardown
  });

  test("handles acceleration when appropriate", function(){
    view.animate('top', 100, 1);
    equals(transitionFor(view), '-'+SC.platform.cssPrefix+'-transform 1s linear', 'transition is on transform');
  });

  test("doesn't use acceleration when not appropriate", function(){
    view.adjust({ height: '', bottom: 0 });
    view.animate('top', 100, 1);
    equals(transitionFor(view), 'top 1s linear', 'transition is not on transform');
  });

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
  view.animate('left', 100, { duration: 1 });
  equals(100, view.get('layout').left, 'left is 100');
});

test("should still run callback", function(){
  var ranCallback = false;

  view.animate('left', 100, {
    duration: 1, callback: function() { ranCallback = true; }
  });

  ok(ranCallback, "ran callback");
});