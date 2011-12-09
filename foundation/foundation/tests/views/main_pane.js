// ========================================================================
// MainPane Unit Tests
// ========================================================================
/*globals module test ok isObj equals expects */

// ..........................................................
// BASE TESTS
// 
// These tests exercise the API.  See below for tests that cover edge 
// conditions.  If you find a bug, we recommend that you add a test in the 
// edge case section.

var FRAME = { x: 10, y: 10, width: 30, height: 30 } ;

var pane, view ; // test globals

module('SC.MainPane');

test("should attach when calling append()", function() {
  var pane = SC.MainPane.create() ;
  pane.append() ;
  equals(pane.get('isPaneAttached'), YES) ;
});

test("appending should make pane main & key", function() {
  var pane = SC.MainPane.create() ;
  pane.append();
  var r = pane.get('rootResponder');
  equals(r.get('mainPane'), pane, 'should become mainPane');
  equals(r.get('keyPane'), pane, 'should become keyPane');
});
