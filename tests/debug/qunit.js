// ========================================================================
// RootResponder Tests
// ========================================================================
/*globals module test ok isObj equals expects */

/**
  This file is slightly subtle, in that we want to make sure SproutCore is 
  set up properly before any QUnit tests are run. Therefore...
*/

var mainRan = NO ;

main = function() { mainRan = YES; } ;

module("QUnit") ;

test("tests should not run until SproutCore is ready", function() {
  equals(SC.isReady, true, "SC.isReady");
});

test("tests should not run until the root responder has been setup", function() {
  expect(1);
  ok(SC.RootResponder.responder, "SC.RootResponder.responder");
});

test("main() function should be overridable in a unit test", function() {
  ok(mainRan, "main function defined in unit test did not run");
});