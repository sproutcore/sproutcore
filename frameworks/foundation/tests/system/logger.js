// ==========================================================================
// SC.Logger Unit Test
// ==========================================================================

/*globals module test equals */


// Test console needed because testing for null functions,
// ie. setting the actual console.log = null means setting up
// and tearing down no longer work properly.

module("SC.Logger");

test("dirxml", function() {
  equals(SC.Logger.dirxml(), SC.Logger, "Function is defined and returns SC.Logger");
});

test("group", function() {
  equals(SC.Logger.group(), SC.Logger, "Function is defined and returns SC.Logger");
});

test("groupEnd", function() {
  equals(SC.Logger.groupEnd(), SC.Logger, "Function is defined and returns SC.Logger");
});

test("profile", function() {
  equals(SC.Logger.profile(), SC.Logger, "Function is defined and returns SC.Logger");
});

test("profileEnd", function() {
  equals(SC.Logger.profileEnd(), SC.Logger, "Function is defined and returns SC.Logger");
});

test("time", function() {
  equals(SC.Logger.time(), SC.Logger, "Function is defined and returns SC.Logger");
});

test("timeEnd", function() {
  equals(SC.Logger.timeEnd(), SC.Logger, "Function is defined and returns SC.Logger");
});

test("trace", function() {
  equals(SC.Logger.trace(), SC.Logger, "Function is defined and returns SC.Logger");
});
