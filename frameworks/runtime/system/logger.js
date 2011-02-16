// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================


/** @class

  Object to allow for safe logging actions, such as using the browser console.

  The FireFox plugin Firebug was used as a function reference. Please see
  {@link <a href="http://getfirebug.com/logging.html">Firebug Logging Reference</a>}
  for further information.

  @author Colin Campbell
  @author Benedikt Böhm
  @extends SC.Object
  @since Sproutcore 1.0
  @see <a href="http://getfirebug.com/logging.html">Firebug Logging Reference</a>
*/
SC.Logger = SC.Object.create(
/** @scope SC.Logger */ {

  // ..........................................................
  // PROPERTIES
  //

  /**
    If console.log does not exist, SC.Logger will use window.alert instead.

    This property is only used inside {@link SC.Logger.log}. If fallBackOnLog is
    false and you call a different function, an alert will not be opened.

    @property {Boolean}
  */
  fallBackOnAlert: NO,

  /**
    Whether or not to format multiple arguments together
    or let the browser deal with that.

    @property {Boolean}
  */
  format: YES,

  /** @private
    Provide backwards compatibility for developers setting the reporter object.
  */
  reporter: function(key, value) {
    if (value !== undefined) {
      this.set('reporters', [value]);
    }
    return this.get('reporters')[0];
  }.property(),

  /**
    An array of objects which can report messages. This will contain the 'console'
    object, if it exists, by default.
    
    @property {Array}
    @default []
  */
  reporters: [],

  init: function() {
    if (window.console !== undefined) this.get('reporters').push(window.console);
  },


  // ..........................................................
  // REPORTERS SUPPORT
  // 

  /**
    @since SproutCore 1.5
    @param {Object} reporter The report object to add
    @returns {SC.Logger}
  */
  addReporter: function(reporter) {
    this.get('reporters').push(reporter);
    return this;
  },

  // ..........................................................
  // LOGGING SUPPORT
  //

  /**
    Log output to the console, but only if it exists.

    @param {String|Array|Function|Object}
    @returns {SC.Logger}
  */
  log: function() {
    var reporters = this.get('reporters'),
        args = arguments,
        f;

    // log through the reporter
    reporters.forEach(function(reporter) {
      if (reporter.log !== undefined && reporter.log.apply !== undefined) f = reporter.log;
      else if (this.get('fallBackOnAlert')) f = alert;

      if (this.get('format')) args = [SC.A(args).join(", ")];
      f.apply(reporter, args);
    }, this);

    return this;
  },

  /**
    Log a debug message to the console.

    Logs the response using {@link SC.Logger.log} if reporter.debug does not exist and
    {@link SC.Logger.fallBackOnLog} is true.

    @param {String|Array|Function|Object}
    @returns {SC.Logger}
  */
  debug: function() {
    var reporters = this.get('reporters'),
        args = SC.A(arguments),
        f;

    reporters.forEach(function(reporter) {
      if (reporter.debug !== undefined && reporter.debug.apply !== undefined) {
        f = reporter.debug;
      } else if (reporter.log !== undefined && reporter.log.apply !== undefined) {
        args.unshift('DEBUG');
        f = reporter.log;
      } else if (this.get('fallBackOnAlert')) {
        args.unshift('DEBUG');
        f = alert;
      }

      if (this.get('format')) args = [args.join(", ")];
      f.apply(reporter, args);
    }, this);

    return this;
  },

  /**
    Prints the properties of an object.

    @param {Object}
    @returns {SC.Logger}
  */
  dir: function() {
    var reporters = this.get('reporters'),
        args = SC.A(arguments),
        f;

    reporters.forEach(function(reporter) {
      if (reporter.dir !== undefined && reporter.dir.apply !== undefined) {
        f = reporter.dir;
      } else if (reporter.log !== undefined && reporter.log.apply !== undefined) {
        f = reporter.log;
        args = args.map(function(obj) { return SC.inspect(obj); });
      } else if (this.get('fallBackOnAlert')) {
        f = alert;
        args = args.map(function(obj) { return SC.inspect(obj); });
      }

      f.apply(reporter, args); // we don't want to format these results
    }, this);

    return this;
  },

  /**
    Log an error to the console

    @param {String|Array|Function|Object}
    @returns {SC.Logger}
  */
  error: function() {
    var reporters = this.get('reporters'),
        args = SC.A(arguments),
        f;

    reporters.forEach(function(reporter) {
      if (reporter.error !== undefined && reporter.error.apply !== undefined) {
        f = reporter.error;
      } else if (reporter.log !== undefined && reporter.log.apply !== undefined) {
        args.unshift('ERROR');
        f = reporter.log;
      } else if (this.get('fallBackOnAlert')) {
        args.unshift('ERROR');
        f = alert;
      }

      if (this.get('format')) args = [args.join(", ")];
      f.apply(reporter, args);
    }, this);

    return this;
  },

  /**
    Log an information response to the reporter.

    Logs the response using {@link SC.Logger.log} if reporter.info does not exist and
    {@link SC.Logger.fallBackOnLog} is true.

    @param {String|Array|Function|Object}
    @returns {SC.Logger}
  */
  info: function() {
    var reporters = this.get('reporters'),
        args = SC.A(arguments),
        f;

    reporters.forEach(function(reporter) {
      if (reporter.info !== undefined && reporter.info.apply !== undefined) {
        f = reporter.info;
      } else if (reporter.log !== undefined && reporter.log.apply !== undefined) {
        args.unshift('INFO');
        f = reporter.log;
      } else if (this.get('fallBackOnAlert')) {
        args.unshift('INFO');
        f = alert;
      }

      if (this.get('format')) args = [args.join(", ")];
      f.apply(reporter, args);
    }, this);

    return this;
  },

  /**
    Log a warning to the console.

    Logs the warning using {@link SC.Logger.log} if reporter.warning does not exist and
    {@link SC.Logger.fallBackOnLog} is true.

    @param {String|Array|Function|Object}
    @returns {SC.Logger}
  */
  warn: function() {
    var reporters = this.get('reporters'),
        args = SC.A(arguments),
        f;

    reporters.forEach(function(reporter) {
      if (reporter.warn !== undefined && reporter.warn.apply !== undefined) {
        f = reporter.warn;
      } else if (reporter.log !== undefined && reporter.log.apply !== undefined) {
        args.unshift('WARN');
        f = reporter.log;
      } else if (this.get('fallBackOnAlert')) {
        args.unshift('WARN');
        f = alert;
      }

      if (this.get('format')) args = [args.join(", ")];
      f.apply(reporter, args);
    }, this);

    return this;
  }

});

SC.log = function() {
  return SC.Logger.log.apply(SC.Logger, arguments);
};
