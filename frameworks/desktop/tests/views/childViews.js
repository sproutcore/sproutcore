// ========================================================================
// View childView Unit Tests
// ========================================================================
/*globals module test ok isObj equals expects */

/* NOTES
   The childViews array is used to automatically propogate certain state changes 
   such as resizing, visibility, and enabled up and down the view hierarchy.  It 
   is also used to control the position of the rootElement manged by the view in 
   the DOM tree.
   
   Whenever a call one of the methods to add/remove a child in the view 
   hierarchy, the childViews array should update immediately but the actual DOM 
   position of the view should only change once at the end of the runloop.
*/
var parent, childA, childB ;

// this helper method can be wrapped around a test function to verify that 
// the child view you pass has its DOM element properly modified.
var testingDomChangeFor = function(testView, finalParentView, func) {
  
  if (func === undefined) {
    func = finalParentView; finalParentView = undefined; 
  }
  
  // save parentNode for testView root
  var parentNode = testView.rootElement.parentNode ;
  
  SC.RunLoop.begin();
  func(); // exec test.
  
  // verify that parentNode has not changed
  ok(testView.rootElement.parentNode === parentNode, "testView.rootElement.parentNode should not change yet!") ;  
  
  SC.RunLoop.end();
  ok(testView.rootElement.parentNode !== parentNode, "testView.rootElement.parentNode did not change after run loop");
  
  // if a finalParentView was passed, verify parentView..
  if (finalParentView === null) {
    equals(testView.rootElement.parentNode, null, 'parentNode should be null');
  } else if (finalParentView) {
    equals(testView.rootElement.parentNode, finalParentView.rootElement, 'parentNode should be parentView.rootElement');
  }
};

var parentViewShouldBeEmpty = function() {
  ok(parent.get('childViews').length === 0, 'childViews empty at start');
};

var hasNoParentView = function(view, log) {
  ok(view.get('parentView') === null, log);
};

// ..........................................................
// BASE TESTS
// 
// These tests exercise the API.  See below for tests that cover edge 
// conditions.  If you find a bug, we recommend that you add a test in the 
// edge case section.

module('SC.View.childViews methods', {
  setup: function() {
    parent = SC.View.create();
    childA = SC.View.create();
    childB = SC.View.create();
  }
});


test("insertBefore() -- adding", function() {
  testingDomChangeFor(childA, parent, function() {
    parentViewShouldBeEmpty();
    hasNoParentView(childA, '1') ;

    // test insertBefore(null) - should return self
    equals(parent.insertBefore(childA, null), parent, "should return this");
    
    var cv = parent.get('childViews');
    equals(cv.length, 1, 'childViews.length') ;
    equals(cv.objectAt(0), childA, 'childViews[0] == childA') ;
    equals(childA.get('parentView'), parent, 'childA.parentView == parent');
    
    // test insertBefore(a, b) ;
    equals(parent.insertBefore(childB, childA), parent, 'should return this');

    cv = parent.get('childViews');
    equals(cv.length, 2, 'childViews.length') ;
    equals(cv.objectAt(0), childB, 'childViews[0] == childB') ;
    equals(cv.objectAt(1), childA, 'childViews[1] == childA') ;
    equals(childB.get('parentView'), parent, 'childB.parentView == parent');    
  });
});

test("insertBefore() -- moving", function() {
  SC.RunLoop.begin();
  childB.appendChild(childA) ;
  SC.RunLoop.end();
  
  equals(childA.get('parentView'), childB, 'childA.parent == childB');
  
  testingDomChangeFor(childA, parent, function() {
    equals(parent.insertBefore(childA, null), parent, 'should return this');
    
    // verify move...
    equals(childA.get('parentView'), parent, 'childA.parent == parent');
    equals(childB.get('childViews').length, 0, 'childB.childViews == 0') ;
    equals(parent.get('childViews').length, 1, 'parent.childViews == 1'); 
  });
  
});

test("removeChild(childA)", function() {
  SC.RunLoop.begin();
  parent.appendChild(childA).appendChild(childB) ;
  SC.RunLoop.end();
  
  testingDomChangeFor(childA, function() {
    // verify precondition
    var cv = parent.get('childViews');
    equals(cv.objectAt(0), childA, '1');
    equals(cv.objectAt(1), childB, '2');
    
    // remove...test API return value
    equals(parent.removeChild(childA), parent, 'should return this');
    
    // verify new child view
    cv = parent.get('childViews') ;
    equals(cv.length, 1, 'should have length 1');
    equals(cv.objectAt(0), childB, 'cv[0] should === childB now') ;
    equals(childA.get('parentView'), null, 'childA.parentView == null');
    
    // remove last item
    equals(parent.removeChild(childB), parent, 'should return this') ;
    
    cv = parent.get('childViews');
    equals(cv.length, 0, 'should have length 0');
    equals(childB.get('parentView'), null, 'childB.parentView == null');
  });
});

// removeAllChildren
test("removeAllChildren", function() {
  // setup initial...
  SC.RunLoop.begin();
  parent.appendChild(childA).appendChild(childB) ;
  SC.RunLoop.end();
  
  testingDomChangeFor(childA, function() {
    // verify precondition
    var cv = parent.get('childViews');
    equals(cv.objectAt(0), childA, '1');
    equals(cv.objectAt(1), childB, '2');
    
    // remove...test API return value
    equals(parent.removeAllChildren(), parent, 'should return this');
    
    cv = parent.get('childViews');
    equals(cv.length, 0, 'should have length 0');
    equals(childA.get('parentView'), null, 'childA.parentView == null');
    equals(childB.get('parentView'), null, 'childB.parentView == null');
  });
});

test("removeFromParent", function() {
  // setup initial...
  SC.RunLoop.begin();
  parent.appendChild(childA).appendChild(childB) ;
  SC.RunLoop.end();
  
  testingDomChangeFor(childA, function() {
    // verify precondition
    var cv = parent.get('childViews');
    equals(cv.objectAt(0), childA, '1');
    equals(cv.objectAt(1), childB, '2');
    
    // remove...test API return value
    equals(childA.removeFromParent(), childA, 'should return this');
    
    cv = parent.get('childViews');
    equals(cv.length, 1, 'should have length 1');
    equals(childA.get('parentView'), null, 'childA.parentView == null');
    equals(childB.get('parentView'), parent, 'childB.parentView == parent');
  });
});

test("removeFromParent when already not in parent is indempotent", function() {
  equals(childA.removeFromParent(), childA, 'should return this');
  equals(childA.get('parentView'), null, 'childA.parentView == null');
});

// replaceChild
test("replaceChild should replace one childView for the other", function() {
  
});

// appendChild

// ..........................................................
// EDDGE CASES
// 

module("Edge Cases");

test("Adding two child views together can cause DOM exception if one child's\
 display location is updated and the next child view is not yet added to DOM", function() {
  
  // setup the hierarchy...
  var parent = SC.View.create();
  var childA = SC.View.create();
  var childB = SC.View.create();
  parent.appendChild(childA).appendChild(childB) ;
  
  // now update display location for childA -- note that childB's rootElement
  // is not yet in the DOM.
  childA.updateDisplayLocationIfNeeded();
});

