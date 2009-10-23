// ==========================================================================
// SC.Logger
// ==========================================================================


/**
  If {@link SC.Logger.format} is true, this delimiter will be put between arguments.
  
  @property {String}
*/
SC.LOGGER_LOG_DELIMITER = ", ";

/**
  If {@link SC.Logger.error} falls back onto {@link SC.Logger.log}, this will be
  prepended to the output.
  
  @property {String}
*/
SC.LOGGER_LOG_ERROR = "ERROR: ";

/**
  If {@link SC.Logger.info} falls back onto {@link SC.Logger.log}, this will be
  prepended to the output.
  
  @property {String}
*/
SC.LOGGER_LOG_INFO = "INFO: ";

/**
  If {@link SC.Logger.warn} falls back onto {@link SC.Logger.log}, this will be
  prepended to the output.
  
  @property {String}
*/
SC.LOGGER_LOG_WARN = "WARNING: ";

/** @class
  
  Object to allow for safe logging actions, such as using the browser console.
  
  The FireFox plugin Firebug was used as a function reference. Please see
  {@link <a href="http://getfirebug.com/logging.html">Firebug Logging Reference</a>}
  for further information.
  
  @author Colin Campbell
  @extends SC.Object
  @since Sproutcore 1.0
  @see <a href="http://getfirebug.com/logging.html">Firebug Logging Reference</a>
*/
SC.Logger = SC.Object.create({ 
  
  // ..........................................................
  // PROPERTIES
  //   
  
  /**
    Computed property that checks for the existence of the reporter object.
    
    @property {Boolean}
  */
  exists: function() {
    return typeof(this.get('reporter')) !== 'undefined' && this.get('reporter') != null;
  }.property('reporter').cacheable(),
  
  /**
    If console.log does not exist, SC.Logger will use window.alert instead.
    
    This property is only used inside {@link SC.Logger.log}. If fallBackOnLog is
    false and you call a different function, an alert will not be opened.
    
    @property {Boolean}
  */
  fallBackOnAlert: NO,
  
  /**
    If some function, such as console.dir, does not exist,
    SC.Logger will try console.log if this is true.
    
    @property {Boolean}
  */
  fallBackOnLog: YES,
  
  /**
    Whether or not to format multiple arguments together
    or let the browser deal with that.
    
    @property {Boolean}
  */
  format: YES,
  
  /**
    The reporter is the object which implements the actual logging functions.
    
    @default The browser's console
    @property {Object}
  */
  reporter: console,
  
  // ..........................................................
  // METHODS
  // 

  /**
    Log output to the console, but only if it exists.
    
    @param {String|Array|Function|Object}
    @returns {Boolean} true if reporter.log exists, false otherwise
  */
  log: function() {
    var reporter = this.get('reporter');
    
    // log through the reporter
    if (this.get('exists') && typeof(reporter.log) === "function") {
      if (this.get('format')) {
        reporter.log(this._argumentsToString.apply(this, arguments));
      }
      else {
        reporter.log.apply(reporter, arguments);
      }
      return true;
    }
    
    // log through alert
    else if (this.fallBackOnAlert) {
      var s = this.get('format') ? this._argumentsToString.apply(this, arguments) : arguments;
      // include support for overriding the alert through the reporter
      // if it has come this far, it's likely this will fail
      if (this.get('exists') && typeof(reporter.alert) === "function") {
        reporter.alert(s);
      }
      else {
        alert(s);
      }
      return true;
    }
    return false;
  },
  
  /**
    Prints the properties of an object.
    
    Logs the object using {@link SC.Logger.log} if the reporter.dir function does not exist and
    {@link SC.Logger.fallBackOnLog} is true.
    
    @param {Object}
    @returns {Boolean} true if logged to console, false if not
  */
  dir: function() {
    var reporter = this.get('reporter');
    
  	if (this.get('exists') && typeof(reporter.dir) === "function") {
      // Firebug's console.dir doesn't support multiple objects here
      // but maybe custom reporters will
  	  reporter.dir.apply(reporter, arguments);
  	  return true;
	  }
  	return (this.fallBackOnLog) ? this.log.apply(this, arguments) : false;
  },
  
  /**
    Prints an XML outline for any HTML or XML object.
    
    Logs the object using {@link SC.Logger.log} if reporter.dirxml function does not exist and
    {@lnk SC.Logger.fallBackOnLog} is true.
    
    @param {Object}
    @returns {Boolean} true if logged to reporter, false if not
  */
  dirxml: function() {
    var reporter = this.get('reporter');
    
    if (this.get('exists') && typeof(reporter.dirxml) === "function") {
      // Firebug's console.dirxml doesn't support multiple objects here
      // but maybe custom reporters will
      reporter.dirxml.apply(reporter, arguments);
      return true;
    }
    return (this.fallBackOnLog) ? this.log.apply(this, arguments) : false;
  },
  
  /**
    Log an error to the console
    
    Logs the error using {@link SC.Logger.log} if reporter.error does not exist and
    {@link SC.Logger.fallBackOnLog} is true.
    
    @param {String|Array|Function|Object}
    @returns {Boolean} true if logged to reporter, false if not
  */
  error: function() {
    var reporter = this.get('reporter');
    
    if (this.get('exists') && typeof(reporter.error) === "function") {
      reporter.error.apply(reporter, arguments);
      return true;
    }
    else if (this.fallBackOnLog) {
      var a = this._argumentsToArray(arguments);
      if (typeof(a.unshift) === "function") a.unshift(SC.LOGGER_LOG_ERROR);
      return this.log.apply(this, a);
    }
    return false;
  },
  
  /**
    Every log after this call until {@link SC.Logger.groupEnd} is called
    will be indented for readability. You can create as many levels
    as you want.
    
    @param {String} [title] An optional title to display above the group
    @returns {Boolean} true if reporter.group exists, false otherwise
  */
  group: function(s) {
    var reporter = this.get('reporter');
    
    if (this.get('exists') && typeof(reporter.group) === "function") {
      reporter.group(s);
      return true;
    }
    return false;
  },
  
  /**
    Ends a group declared with {@link SC.Logger.group}.
    
    @returns {Boolean} true if the reporter.groupEnd exists, false otherwise
    @see SC.Logger.group
  */
  groupEnd: function() {
    var reporter = this.get('reporter');
    
    if (this.get('exists') && typeof(reporter.groupEnd) === "function") {
      reporter.groupEnd();
      return true;
    }
    return false;
  },
  
  /**
    Log an information response to the reporter.
    
    Logs the response using {@link SC.Logger.log} if reporter.info does not exist and
    {@link SC.Logger.fallBackOnLog} is true.
    
    @param {String|Array|Function|Object}
    @returns {Boolean} true if logged to reporter, false if not
  */
  info: function() {
    var reporter = this.get('reporter');
    
    if (this.get('exists') && typeof(reporter.info) === "function") {
      reporter.info.apply(reporter, arguments);
      return true;
    }
    else if (this.fallBackOnLog) {
      var a = this._argumentsToArray(arguments);
      if (typeof(a.unshift) === "function") a.unshift(SC.LOGGER_LOG_INFO);
      return this.log.apply(this, a);
    }
    return false;
  },
  
  /**
    Begins the JavaScript profiler, if it exists. Call {@link SC.Logger.profileEnd}
    to end the profiling process and receive a report.
    
    @returns {Boolean} true if reporter.profile exists, false otherwise
  */
  profile: function() {
    var reporter = this.get('reporter');
    
    if (this.get('exists') && typeof(reporter.profile) === "function") {
      reporter.profile();
      return true;
    }
    return false;
  },
  
  /**
    Ends the JavaScript profiler, if it exists.
    
    @returns {Boolean} true if reporter.profileEnd exists, false otherwise
    @see SC.Logger.profile
  */
  profileEnd: function() {
    var reporter = this.get('reporter');
    
    if (this.get('exists') && typeof(reporter.profileEnd) === "function") {
      reporter.profileEnd();
      return true;
    }
    return false;
  },
  
  /**
    Measure the time between when this function is called and
    {@link SC.Logger.timeEnd} is called.
    
    @param {String} name The name of the profile to begin
    @returns {Boolean} true if reporter.time exists, false otherwise
    @see SC.Logger.timeEnd
  */
  time: function(name) {
    var reporter = this.get('reporter');
    
    if (this.get('exists') && typeof(reporter.time) === "function") {
      reporter.time(name);
      return true;
    }
    return false;
  },
  
  /**
    Ends the profile specified.
    
    @param {String} name The name of the profile to end
    @returns {Boolean} true if reporter.timeEnd exists, false otherwise
    @see SC.Logger.time
  */
  timeEnd: function(name) {
    var reporter = this.get('reporter');
    
    if (this.get('exists') && typeof(reporter.timeEnd) === "function") {
      reporter.timeEnd(name);
      return true;
    }
    return false;
  },
  
  /**
    Prints a stack-trace.
    
    @returns {Boolean} true if reporter.trace exists, false otherwise
  */
  trace: function() {
    var reporter = this.get('reporter');
    
    if (this.get('exists') && typeof(reporter.trace) === "function") {
      reporter.trace();
      return true;
    }
    return false;
  },
  
  /**
    Log a warning to the console.
    
    Logs the warning using {@link SC.Logger.log} if reporter.warning does not exist and
    {@link SC.Logger.fallBackOnLog} is true.
    
    @param {String|Array|Function|Object}
    @returns {Boolean} true if logged to reporter, false if not
  */
  warn: function() {
    var reporter = this.get('reporter');
    
    if (this.get('exists') && typeof(reporter.warn) === "function") {
      reporter.warn.apply(reporter, arguments);
      return true;
    }
    else if (this.fallBackOnLog) {
      var a = this._argumentsToArray(arguments);
      if (typeof(a.unshift) === "function") a.unshift(SC.LOGGER_LOG_WARN);
      return this.log.apply(this, a);
    }
    return false;
  },
  
  // ..........................................................
  // INTERNAL SUPPORT
  // 
  
  /**
    @private
    
    The arguments function property doesn't support Array#unshift. This helper
    copies the elements of arguments to a blank array.
    
    @param {Array} arguments The arguments property of a function
    @returns {Array} An array containing the elements of arguments parameter
  */
  _argumentsToArray: function(arguments) {
    if (!arguments) return [];
    var a = [];
    for (var i = 0; i < arguments.length; i++) {
      a[i] = arguments[i];
    }
    return a;
  },
  
  /**
    @private
    
    Formats the arguments array of a function by creating a string
    with SC.LOGGER_LOG_DELIMITER between the elements.
    
    @returns {String} A string of formatted arguments
  */
  _argumentsToString: function() {
  	var s = "";
  	for (var i = 0; i<arguments.length - 1; i++) {
  		s += arguments[i] + SC.LOGGER_LOG_DELIMITER;
  	}
  	s += arguments[arguments.length-1];
  	return s;
  }
  
});