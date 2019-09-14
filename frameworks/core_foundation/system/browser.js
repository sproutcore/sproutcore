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

    @param {String} version One of SC.browser.version, SC.browser.engineVersion or SC.browser.osVersion
    @param {String} other The version to compare against.
    @returns {Number} The difference between the versions at the first difference.
  */
  compare: function (version, other) {
    var coerce,
        parts,
        tests;

    // Ensure that the versions are Strings.
    if (typeof version === 'number' || typeof other === 'number') {
      //@if(debug)
      SC.warn('Developer Warning: SC.browser.compare(): Versions compared against Numbers may not provide accurate results.  Use a String of decimal separated Numbers instead.');
      //@endif
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

});
