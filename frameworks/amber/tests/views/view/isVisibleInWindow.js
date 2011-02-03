// ========================================================================
// View metrics Unit Tests
// ========================================================================
/*globals module test ok isObj equals expects */

/**
  These tests verify that all view metrics -- frame, clippingFrame,
  isVisibleInWindow, etc. are correct.
*/

// ..........................................................
// BASE TESTS
//
// These tests exercise the API.  See below for tests that cover edge
// conditions.  If you find a bug, we recommend that you add a test in the
// edge case section.

var FRAME = { x: 10, y: 10, width: 30, height: 30 } ;

var pane, view ; // test globals

module("isVisibleInWindow", {

  setup: function() {
    pane = SC.MainPane.create() ;
    pane.append() ;
    view = SC.View.create() ;
  },

  teardown: function() {
    view = null ;
    pane.remove().destroy() ;
    pane = null ;
  }

});

test("a new view should not be visible initially", function() {
  ok(!view.get('isVisibleInWindow'), "view.get('isVisibleInWindow') === NO") ;
});

test("adding a new view to a visible pane should make it visible", function() {
  ok(!view.get('isVisibleInWindow'), "view.get('isVisibleInWindow') === NO") ;
  ok(pane.get('isVisibleInWindow'), "pane.get('isVisibleInWindow') === YES") ;

  pane.appendChild(view) ;
  ok(view.get('isVisibleInWindow'), "after pane.appendChild(view), view.get('isVisibleInWindow') === YES") ;
});

test("removing a view from a visible pane should make it invisible again", function() {
  ok(!view.get('isVisibleInWindow'), "view.get('isVisibleInWindow') === NO") ;
  ok(pane.get('isVisibleInWindow'), "pane.get('isVisibleInWindow') === YES") ;
  pane.appendChild(view) ;
  ok(view.get('isVisibleInWindow'), "after pane.appendChild(view), view.get('isVisibleInWindow') === YES") ;

  view.removeFromParent() ;
  ok(!view.get('isVisibleInWindow'), "after view.removeFromParent(), view.get('isVisibleInWindow') === NO") ;
});

// .......................................................
// integration with updateLayer and layoutChildViews
//
test("updateLayer should not be invoked even if layer becomes dirty until isVisibleInWindow changes, then it should invoke", function() {

  var callCount = 0 ;
  view.createLayer = function() {
    SC.View.prototype.createLayer.apply(this, arguments);
    callCount++;
  };
  ok(!view.get('isVisibleInWindow'), 'precond - view should not be visible to start');

  SC.RunLoop.begin();
  view.displayDidChange();
  SC.RunLoop.end();
  equals(callCount, 0, 'createLayer should not run b/c its not visible');

  SC.RunLoop.begin();
  pane.appendChild(view); // make visible in window...
  ok(view.get('isVisibleInWindow'), 'view should now be visible in window');
  SC.RunLoop.end();
  equals(callCount, 1, 'createLayer should exec now b/c isVisibleInWindow is YES');
});

test("layoutChildViewsIfNeeded should not be invoked even if layer needs layout until isVisibleInWindow changes, then it should invoke", function() {

  var child = SC.View.create();
  view.appendChild(child);

  var callCount = 0 ;
  view.layoutChildViews = function() { callCount++; };
  ok(!view.get('isVisibleInWindow'), 'precond - view should not be visible to start');

  SC.RunLoop.begin();
  view.layoutDidChangeFor(child);
  SC.RunLoop.end();
  equals(callCount, 0, 'layoutChildViews should not run b/c its not visible');

  SC.RunLoop.begin();
  pane.appendChild(view); // make visible in window...
  ok(view.get('isVisibleInWindow'), 'view should now be visible in window');
  SC.RunLoop.end();
  equals(callCount, 1, 'layoutChildViews should exec now b/c isVisibleInWindow is YES');
});

test("setting isVisible to NO should trigger a layer update to hide the view", function() {

  SC.RunLoop.begin();
  pane.appendChild(view);
  SC.RunLoop.end();

  SC.RunLoop.begin();
  view.set('isVisible', NO);
  SC.RunLoop.end();

  ok(view.renderContext(view.get('layer')).classNames().indexOf('hidden') >= 0, "layer should have the 'hidden' class");
});
