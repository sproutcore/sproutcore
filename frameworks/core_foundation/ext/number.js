// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('system/Number');

SC.supplement(Number.prototype, {

  /**
   * Returns the oridnal associated for the current number:
   *
   * eg: 1 => st, 2 => 2nd
   *
   * Delegates to the current locale to try and localize it, otherwise uses
   * english.
   */
  ordinal: function () {
    return SC.Locale.currentLocale.ordinalForNumber(this);
  }
});