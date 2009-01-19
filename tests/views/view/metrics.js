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

module('SC.View.isVisibleInWindow CASE 1: View created outside of main pane', {
  
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

test("initial isVisibleInWindow should be false", function() {
  equals(view.get('isVisibleInWindow'), false) ;
});

test("adding to main pane should make it true", function() {
  equals(pane.get('isVisibleInWindow'), true) ;
  
  pane.appendChild(view) ;
  equals(view.get('isVisibleInWindow'), true) ;
});

test("removing from main pane should make it false again", function() {
  pane.appendChild(view) ;
  equals(view.get('isVisibleInWindow'), true) ;
  
  view.removeFromParent() ;
  equals(view.get('isVisibleInWindow'), false) ;
});
