// ==========================================================================
// SC.Logger Unit Test
// ==========================================================================

/*globals module test equals */


// Test console needed because testing for null functions,
// ie. setting the actual console.log = null means setting up
// and tearing down no longer work properly.

module("SC.Logger");

test("addReporter", function() {
  var reporter = {
    log: function() { SC.Logger.set('hasBeenCalled', YES); }
  };
  
  SC.Logger.set('hasBeenCalled', NO);
  SC.Logger.addReporter(reporter);
  SC.Logger.log();
  
  ok(SC.Logger.get('reporters').indexOf(reporter) > -1, "Reporter was added to reporters array");
  ok(SC.Logger.get('hasBeenCalled'), "Function as called when invoked on SC.Logger");
  delete SC.Logger.hasBeenCalled;
});

test("clearReporters", function() {
  var reporter = {
    log: function() { SC.Logger.set('hasBeenCalled', YES); }
  };
  
  SC.Logger.set('hasBeenCalled', NO);
  SC.Logger.addReporter(reporter);
  
  ok(SC.Logger.get('reporters').indexOf(reporter) > -1, "precond - Reporter was added to reporters array");
  
  SC.Logger.clearReporters(YES);
  
  ok(SC.Logger.get('reporters').indexOf(reporter) === -1, "Reporter was removed from reporters array");
});

test("log", function() {
  equals(SC.Logger.log("test"), SC.Logger, "Function is defined and returns SC.Logger");
});

test("debug", function() {
  ok(SC.Logger.debug("Debug"), SC.Logger, "Function is defined and returns SC.Logger");
});

test("dir", function() {
  equals(SC.Logger.dir({test:"string"}), SC.Logger, "Function is defined and returns SC.Logger");
});

test("error", function() {
  equals(SC.Logger.error("Error"), SC.Logger, "Function is defined and returns SC.Logger");
});

test("info", function() {
  equals(SC.Logger.info("Info"), SC.Logger, "Function is defined and returns SC.Logger");
});

test("warn", function() {
  equals(SC.Logger.warn("Warn"), SC.Logger, "Function is defined and returns SC.Logger");
});
