// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================


/** @class
  @author Colin Campbell
  @extends SC.Logger
  @since Sproutcore 1.5
*/
SC.mixin(SC.Logger,
/** @scope SC.Logger */ {

  /**
    @property {Boolean}
    @default NO
    @deprecated
  */
  debugEnabled: NO,

  /**
    @property {Boolean}
    @default NO
    @deprecated
  */
  exists: NO,

  /**
    @property {Boolean}
    @default NO
    @deprecated
  */
  fallBackOnLog: NO,
  
  
  // ..........................................................
  // LOGGING SUPPORT
  //

  /**
    @returns {SC.Logger}
  */
  dirxml: function() {
    var reporters = this.get('reporters'),
        args = SC.A(arguments);

    reporters.forEach(function(reporter) {
      if (reporter.dirxml === undefined || reporter.dirxml.apply === undefined) return;
      reporter.dirxml.apply(reporter, args);
    }, this);

    return this;
  },

  /**
    @returns {SC.Logger}
  */
  group: function() {
    var reporters = this.get('reporters'),
        args = SC.A(arguments);

    reporters.forEach(function(reporter) {
      if (reporter.group === undefined || reporter.group.apply === undefined) return;
      reporter.group.apply(reporter, args);
    }, this);

    return this;
  },

  /**
    @returns {SC.Logger}
  */
  groupEnd: function() {
    var reporters = this.get('reporters'),
        args = SC.A(arguments);

    reporters.forEach(function(reporter) {
      if (reporter.groupEnd === undefined || reporter.groupEnd.apply === undefined) return;
      reporter.groupEnd.apply(reporter, args);
    }, this);

    return this;
  },

  /**
    @returns {SC.Logger}
  */
  profile: function() {
    var reporters = this.get('reporters'),
        args = SC.A(arguments);

    reporters.forEach(function(reporter) {
      if (reporter.profile === undefined || reporter.profile.apply === undefined) return;
      reporter.profile.apply(reporter, args);
    }, this);

    return this;
  },

  /**
    @returns {SC.Logger}
  */
  profileEnd: function() {
    var reporters = this.get('reporters'),
        args = SC.A(arguments);

    reporters.forEach(function(reporter) {
      if (reporter.profileEnd === undefined || reporter.profileEnd.apply === undefined) return;
      reporter.profileEnd.apply(reporter, args);
    }, this);

    return this;
  },

  /**
    @returns {SC.Logger}
  */
  time: function() {
    var reporters = this.get('reporters'),
        args = SC.A(arguments);

    reporters.forEach(function(reporter) {
      if (reporter.time === undefined || reporter.time.apply === undefined) return;
      reporter.time.apply(reporter, args);
    }, this);

    return this;
  },

  /**
    @returns {SC.Logger}
  */
  timeEnd: function() {
    var reporters = this.get('reporters'),
        args = SC.A(arguments);

    reporters.forEach(function(reporter) {
      if (reporter.timeEnd === undefined || reporter.timeEnd.apply === undefined) return;
      reporter.timeEnd.apply(reporter, args);
    }, this);

    return this;
  },

  /**
    @returns {SC.Logger}
  */
  trace: function() {
    var reporters = this.get('reporters'),
        args = SC.A(arguments);

    reporters.forEach(function(reporter) {
      if (reporter.trace === undefined || reporter.trace.apply === undefined) return;
      reporter.trace.apply(reporter, args);
    }, this);

    return this;
  }

});
