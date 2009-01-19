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
    pane.remove() ;
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
