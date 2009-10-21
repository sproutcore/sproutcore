// ==========================================================================
// SC.Logger Unit Test
// ==========================================================================

/*globals module test equals */


// Test console needed because testing for null functions,
// ie. setting the actual console.log = null means setting up
// and tearing down no longer work properly.

function testConsole() {
  return {
    log: function() { return true; },
    alert: function() { return true; },
    dir: function() { return true; },
    dirxml: function() { return true; },
    error: function() { return true; },
    group: function() { return true; },
    groupEnd: function() { return true; },
    info: function() { return true; },
    profile: function() { return true; },
    profileEnd: function() { return true; },
    time: function() { return true; },
    timeEnd: function() { return true; },
    trace: function() { return true; },
    warn: function() { return true; }
  };
};

module("SC.Logger", {
  setup: function() {
    SC.Logger.set('reporter', testConsole());
    
    SC.Logger.format = true;
    SC.Logger.fallBackOnLog = true;
    SC.Logger.fallBackOnAlert = false;
  },
  teardown: function() {
  }
});

test("exists", function() {
  equals(SC.Logger.get('exists'), true, "Reporter does exist check");
  
  SC.Logger.set('reporter', null);
  equals(SC.Logger.get('exists'), false, "Reporter does not exist check");
});

test("log", function() {
  equals(SC.Logger.log("test"), true, "Function is defined" );
  
  var reporter = SC.Logger.get('reporter');
  reporter.log = null;
  equals(SC.Logger.log("test"), false, "Function is null");
  
  SC.Logger.fallBackOnAlert = true;
  equals(SC.Logger.log("test"), true, "Function is null -- fallBackOnAlert true");
});

test("dir", function() {
  equals(SC.Logger.dir({test:"string"}), true, "Function is defined");
  
  SC.Logger.get('reporter').dir = null;
  equals(SC.Logger.dir({test:"string"}), true, "Function is null -- fallBackOnLog true");
  
  SC.Logger.fallBackOnLog = false;
  equals(SC.Logger.dir({test:"string"}), false, "Function is null -- fallBackOnLog false");
});

test("dirxml", function() {
  equals(SC.Logger.dirxml("<here id='2'>is some XML</here>"), true, "Function is defined");
  
  SC.Logger.get('reporter').dirxml = null;
  equals(SC.Logger.dirxml("<here id='2'>is some XML</here>"), true, "Function is null -- fallBackOnLog true");
  
  SC.Logger.fallBackOnLog = false;
  equals(SC.Logger.dirxml("<here id='2'>is some XML</here>"), false, "Function is null -- fallBackOnLog false");
});

test("error", function() {
  equals(SC.Logger.error("Error"), true, "Function is defined");
  
  SC.Logger.get('reporter').error = null;
  equals(SC.Logger.error("Error"), true, "Function is null -- fallBackOnLog true");

  SC.Logger.fallBackOnLog = false;
  equals(SC.Logger.error("Error"), false, "Function is null -- fallBackOnLog false");
});

test("group", function() {
  equals(SC.Logger.group("mygroup"), true, "Function is defined");
  
  SC.Logger.get('reporter').group = null;
  equals(SC.Logger.group("mygroup"), false, "Function is null");
});

test("groupEnd", function() {
  equals(SC.Logger.groupEnd("mygroup"), true, "Function is defined");
  
  SC.Logger.get('reporter').groupEnd = null;
  equals(SC.Logger.groupEnd("mygroup"), false, "Function is null");
});

test("info", function() {
  equals(SC.Logger.info("Info"), true, "Function is defined");
  
  SC.Logger.get('reporter').info = null;
  equals(SC.Logger.info("Info"), true, "Function is null -- fallBackOnLog true");

  SC.Logger.fallBackOnLog = false;
  equals(SC.Logger.info("Info"), false, "Function is null -- fallBackOnLog false");
});

test("profile", function() {
  equals(SC.Logger.profile(), true, "Function is defined");
  
  SC.Logger.get('reporter').profile = null;
  equals(SC.Logger.profile(), false, "Function is null");
});

test("profileEnd", function() {
  equals(SC.Logger.profileEnd(), true, "Function is defined");
  
  SC.Logger.get('reporter').profileEnd = null;
  equals(SC.Logger.profileEnd(), false, "Function is null");
});

test("time", function() {
  equals(SC.Logger.time('mytime'), true, "Function is defined");
  
  SC.Logger.get('reporter').time = null;
  equals(SC.Logger.time('mytime'), false, "Function is null");
});

test("timeEnd", function() {
  equals(SC.Logger.timeEnd('mytime'), true, "Function is defined");
  
  SC.Logger.get('reporter').timeEnd = null;
  equals(SC.Logger.timeEnd('mytime'), false, "Function is null");
});

test("trace", function() {
  equals(SC.Logger.trace(), true, "Function is defined");
  
  SC.Logger.get('reporter').trace = null;
  equals(SC.Logger.trace(), false, "Function is null");
});

test("warn", function() {
  equals(SC.Logger.warn("Warn"), true, "Function is defined");
  
  SC.Logger.get('reporter').warn = null;
  equals(SC.Logger.warn("Warn"), true, "Function is null -- fallBackOnLog true");

  SC.Logger.fallBackOnLog = false;
  equals(SC.Logger.warn("Warn"), false, "Function is null -- fallBackOnLog false");
});

test("_argumentsToString", function() {
  equals(SC.Logger._argumentsToString.apply(SC.Logger, ["test", "test2"]), "test" + SC.LOGGER_LOG_DELIMITER + "test2", "Formatting using default delimiter");
  
  SC.LOGGER_LOG_DELIMITER = "|";
  equals(SC.Logger._argumentsToString.apply(SC.Logger, ["test", "test2"]), "test|test2", "Formatting using custom delimiter");
});