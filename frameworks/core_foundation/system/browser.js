// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================


SC.mixin(SC.browser,
/** @scope SC.browser */ {

  /**
    Version Strings should not be compared against Numbers.  For example,
    the version "1.20" is greater than "1.2" and less than "1.200", but as
    Numbers, they are all 1.2.

    Pass in one of the browser versions: SC.browser.version,
    SC.browser.engineVersion or SC.browser.osVersion and a String to compare
    against.  The function will split each version on the decimals and compare
    the parts numerically.

    Examples:

      SC.browser.compare('1.20', '1.2') == 18
      SC.browser.compare('1.08', '1.8') == 0
      SC.browser.compare('1.1.1', '1.1.004') == -3

    @param version {String} One of SC.browser.version, SC.browser.engineVersion or SC.browser.osVersion
    @param other {String} The version to compare against.
    @return {Number} The difference between the versions at the first difference.
  */
  compare: function(version, other) {
    var coerce,
        parts,
        tests;

    // Ensure that the versions are Strings.
    if (typeof version === 'number' || typeof other === 'number') {
      SC.warn('SC.browser.compare(): Versions compared against Numbers may not provide accurate results.  Use a String of decimal separated Numbers instead.')
      version = String(version);
      other = String(other);
    }

    // This function transforms the String to a Number or NaN
    coerce = function (part) {
      return Number(part.match(/^[0-9]+/));
    };

    parts = SC.A(version.split('.')).map(coerce);
    tests = SC.A(other.split('.')).map(coerce);

    // Test each part stopping when there is a difference.
    for (var i = 0; i < tests.length; i++) {
      var check = parts[i] - tests[i];
      if (isNaN(check)) return 0;
      if (check !== 0) return check;
    }

    return 0;
  },

  /** @deprecated Since 1.7. Use SC.browser.compare(version, otherVersion) instead.

    Pass any number of arguments, and this will check them against the browser
    version split on ".".  If any of them are not equal, return the inequality.
    If as many arguments as were passed in are equal, return 0.  If something
    is NaN, return 0.
  */

  // Deprecation Note:
  //
  // This function forces the comparison against the value of
  // SC.browser.version, but the old value of SC.browser.version would
  // occasionally be the browser's version or the layout engine's version,
  // which could cause unexpected results.  As well, there was no way to
  // compare the actual browser version or OS version.
  compareVersion: function () {
    SC.warn('SC.browser.compareVersion() has been deprecated.  Please ' +
        'use SC.browser.compare() instead.  Example: ' +
        'SC.browser.compareVersion(16,0,912) < 0 becomes ' +
        'SC.browser.compare(SC.browser.engineVersion, \'16.0.912\').');

    if (this._versionSplit === undefined) {
      var coerce = function (part) {
        return Number(part.match(/^[0-9]+/));
      };
      this._versionSplit = SC.A(this.version.split('.')).map(coerce);
    }

    var tests = SC.A(arguments).map(Number);
    for (var i = 0; i < tests.length; i++) {
      var check = this._versionSplit[i] - tests[i];
      if (isNaN(check)) return 0;
      if (check !== 0) return check;
    }

    return 0;
  }

});
