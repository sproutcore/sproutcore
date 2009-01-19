// ========================================================================
// RootResponder Tests
// ========================================================================
/*globals module test ok isObj equals expects */

module("SC.RootResponder");

test("Basic requirements", function() {
  console.log('test is running');
  expect(2);
  ok(SC.RootResponder, "SC.RootResponder");
  ok(SC.RootResponder.responder, "SC.RootResponder.responder");
});
