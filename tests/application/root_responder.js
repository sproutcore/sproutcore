// ========================================================================
// RootResponder Tests
// ========================================================================
/*globals module test ok isObj equals expects */

module("SC.RootResponder");

test("Basic requirements", function() {
  expect(2);
  ok(SC.RootResponder, "SC.RootResponder");
  ok(SC.RootResponder.responder, "SC.RootResponder.responder");
});
