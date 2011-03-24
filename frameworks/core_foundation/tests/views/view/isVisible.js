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
    view = SC.View.create() ; 
  },
  
  teardown: function() {
    view = null ;
    pane.remove() ;
    pane = null ;
  }
  
});

test("a new view should not be visible initially", function() {
  ok(view.get('isVisible'), "view.get('isVisible') === NO") ;
});

test("adding a new view to a visible pane should make it visible", function() {
  ok(view.get('isVisible'), "view.get('isVisible') === YES") ;
  ok(pane.get('isVisible'), "pane.get('isVisible') === YES") ;
  SC.RunLoop.begin();
  pane.appendChild(view) ;
  pane.append() ;
  view.set('isVisible', NO);
  SC.RunLoop.end();
  ok(!view.get('isVisible'), "after pane.appendChild(view), view.get('isVisible') === YES") ;
  ok(view.$().hasClass('sc-hidden'), "after view.set('isVisible', NO), view.$().hasClass('sc-hidden') should be true") ;
});

test("a view with visibility can have a child view without visibility", function() {
  var pane = SC.Pane.create({
    childViews: ['visibleChild'],

    visibleChild: SC.View.design({
      childViews: ['noVisibilityChild'],
      noVisibilityChild: SC.CoreView
    })
  });

  var errored = false;

  try {
    pane.append();
    pane.remove();
  } catch(e) {
    errored = true;
  } finally {
    try {
      pane.remove();
    } catch(e2) {
      errored = true;
    }
  }

  ok(!errored, "Inserting a pane containing a child with visibility that itself has a child without visibility does not cause an error");
});
