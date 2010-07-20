// ========================================================================
// View Animation Unit Tests
// ========================================================================

/*globals module test ok same equals */

/* These unit tests verify:  animate(). */

var view, pane;
module("ANIMATION", {
  setup: function() {
    SC.RunLoop.begin();
    pane = SC.Pane.create({
      backgroundColor: '#ccc',
      layout: { top: 0, right: 0, width: 200, height: 200, zIndex: 100 }
    });
    pane.append();
    
    view = SC.View.create({
      backgroundColor: '#888',
      layout: { left: 0, top: 0, height: 100, width: 100 },
    });
    pane.appendChild(view);

    SC.RunLoop.end();
  },

  teardown: function(){
    pane.remove();
  }
});

test("should work", function(){
  view.animate('left', 100, { duration: 1 });
  equals('left 1s linear', view.get('layer').style[SC.platform.domCSSPrefix+"Transition"], 'add transition');
  equals(100, view.get('layout').left, 'left is 100');
});

test("should accept shorthand notation", function(){
  view.animate('left', 100, 1);
  equals('left 1s linear', view.get('layer').style[SC.platform.domCSSPrefix+"Transition"], 'add transition');  
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