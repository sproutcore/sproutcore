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
    debug: function() { return true; },
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
}

module("SC.Logger", {
  setup: function() {
    SC.Logger.set('reporter', testConsole());
    
    SC.Logger.debugEnabled = true;
    SC.Logger.format = true;
    SC.Logger.fallBackOnLog = true;
    SC.Logger.fallBackOnAlert = false;
  },
  teardown: function() {
  }
});


// We'll use these a lot.
var debugMessage    = "Test debug message",
    infoMessage     = "Test informational message",
    warnMessage     = "Test warning message",
    errorMessage    = "Test error message",
    debugGroupTitle = "Test debug group title",
    infoGroupTitle  = "Test informational group title",
    warnGroupTitle  = "Test warning group title",
    errorGroupTitle = "Test error group title";

var outputAll = function() {
  // Outputs a log message for each possible level.
  SC.Logger.debugGroup(debugGroupTitle);
  SC.Logger.debug(debugMessage);
  SC.Logger.debugGroupEnd();

  SC.Logger.infoGroup(debugGroupTitle);
  SC.Logger.info(infoMessage);
  SC.Logger.infoGroupEnd();

  SC.Logger.warnGroup(debugGroupTitle);
  SC.Logger.warn(warnMessage);
  SC.Logger.warnGroupEnd();

  SC.Logger.errorGroup(debugGroupTitle);
  SC.Logger.error(errorMessage);
  SC.Logger.errorGroupEnd();
};
    


test("exists", function() {
  equals(SC.Logger.get('exists'), true, "Reporter does exist check");
  
  SC.Logger.set('reporter', null);
  equals(SC.Logger.get('exists'), false, "Reporter does not exist check");
});

test("profile", function() {
  equals(SC.Logger.profile(), true, "profile() function is defined");
  
  SC.Logger.get('reporter').profile = null;
  equals(SC.Logger.profile(), false, "profile() function is null");
});

test("profileEnd", function() {
  equals(SC.Logger.profileEnd(), true, "profileEnd() function is defined");
  
  SC.Logger.get('reporter').profileEnd = null;
  equals(SC.Logger.profileEnd(), false, "profileEnd() function is null");
});

test("time", function() {
  equals(SC.Logger.time('mytime'), true, "time() function is defined");
  
  SC.Logger.get('reporter').time = null;
  equals(SC.Logger.time('mytime'), false, "time() function is null");
});

test("timeEnd", function() {
  equals(SC.Logger.timeEnd('mytime'), true, "timeEnd() function is defined");
  
  SC.Logger.get('reporter').timeEnd = null;
  equals(SC.Logger.timeEnd('mytime'), false, "timeEnd() function is null");
});

test("trace", function() {
  equals(SC.Logger.trace(), true, "trace() function is defined");
  
  SC.Logger.get('reporter').trace = null;
  equals(SC.Logger.trace(), false, "trace() function is null");
});

test("_argumentsToString", function() {
  equals(SC.Logger._argumentsToString.apply(SC.Logger, ["test", "test2"]), "test" + SC.LOGGER_LOG_DELIMITER + "test2", "Formatting using default delimiter");
  
  SC.LOGGER_LOG_DELIMITER = "|";
  equals(SC.Logger._argumentsToString.apply(SC.Logger, ["test", "test2"]), "test|test2", "Formatting using custom delimiter");
});


// ..........................................................
// LOG LEVELS
//
// Since we can't really test whether or not things are output to the console,
// we'll do all of our log level testing based on the log recording mechanism.
//
// In case anybody else has recorded a log message, all of these tests will
// start out by clearing the recorded log messages array.

test("Ensure that log levels function properly:  none", function() {
  SC.Logger.set('recordedLogMessages', null);

  SC.Logger.set('logRecordingLevel', SC.LOGGER_LEVEL_NONE);
  outputAll();

  // If it was null before, it should be still be null, since no messages
  // should have been logged.
  equals(SC.Logger.get('recordedLogMessages'), null, "recordedLogMessages remains null");

  // If it was an empty array before, it should still be an empty array.
  SC.Logger.set('recordedLogMessages', []);
  outputAll();
  equals(SC.Logger.getPath('recordedLogMessages.length'), 0, "recordedLogMessages remains an empty array");
});

test("Ensure that log levels function properly:  debug", function() {
  SC.Logger.set('recordedLogMessages', null);

  SC.Logger.set('logRecordingLevel', SC.LOGGER_LEVEL_DEBUG);
  outputAll();

  // All four messages (plus group begin / end directives) should have been
  // logged.
  equals(SC.Logger.getPath('recordedLogMessages.length'), 12, "recordedLogMessages should have all twelve entries");

  equals(SC.Logger.getPath('recordedLogMessages.1').message, debugMessage,  "recordedLogMessages[1] should be the debug message");
  equals(SC.Logger.getPath('recordedLogMessages.4').message, infoMessage,   "recordedLogMessages[4] should be the info message");
  equals(SC.Logger.getPath('recordedLogMessages.7').message, warnMessage,   "recordedLogMessages[7] should be the warn message");
  equals(SC.Logger.getPath('recordedLogMessages.10').message, errorMessage, "recordedLogMessages[10] should be the error message");  
});

test("Ensure that log levels function properly:  info", function() {
  SC.Logger.set('recordedLogMessages', null);

  SC.Logger.set('logRecordingLevel', SC.LOGGER_LEVEL_INFO);
  outputAll();

  // Three messages (plus group begin / end directives) should have been
  // logged.
  equals(SC.Logger.getPath('recordedLogMessages.length'), 9, "recordedLogMessages should have nine entries");

  equals(SC.Logger.getPath('recordedLogMessages.1').message, infoMessage,  "recordedLogMessages[1] should be the info message");
  equals(SC.Logger.getPath('recordedLogMessages.4').message, warnMessage,  "recordedLogMessages[4] should be the warn message");
  equals(SC.Logger.getPath('recordedLogMessages.7').message, errorMessage, "recordedLogMessages[7] should be the error message");
});

test("Ensure that log levels function properly:  warn", function() {
  SC.Logger.set('recordedLogMessages', null);

  SC.Logger.set('logRecordingLevel', SC.LOGGER_LEVEL_WARN);
  outputAll();

  // Two messages (plus group begin / end directives) should have been logged.
  equals(SC.Logger.getPath('recordedLogMessages.length'), 6, "recordedLogMessages should have 6 entries");

  equals(SC.Logger.getPath('recordedLogMessages.1').message, warnMessage,  "recordedLogMessages[1] should be the warn message");
  equals(SC.Logger.getPath('recordedLogMessages.4').message, errorMessage, "recordedLogMessages[4] should be the error message");
});

test("Ensure that log levels function properly:  error", function() {
  SC.Logger.set('recordedLogMessages', null);

  SC.Logger.set('logRecordingLevel', SC.LOGGER_LEVEL_ERROR);
  outputAll();

  // Only the error message (plus group begin / end directives) should have
  // been logged.
  equals(SC.Logger.getPath('recordedLogMessages.length'), 3, "recordedLogMessages should have three entries");

  // That message should be equal to the error message.
  equals(SC.Logger.getPath('recordedLogMessages.1').message, errorMessage, "recordedLogMessages[1] should be the error message");
});
