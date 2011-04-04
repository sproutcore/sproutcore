// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================


SC.DateTime.mixin(
  /** @scope SC.DateTime */ {
  
  /**
    The localized day names. Add the key '_SC.DateTime.dayNames' and its value
    to your strings.js file to add support for another language than English.

    Default is evaluated on the document.ready event.

    @property {Array}
    @default '_SC.DateTime.dayNames'.loc().w()
  */
  dayNames: null,
  
  /**
    The localized abbreviated day names. Add the key
    '_SC.DateTime.abbreviatedDayNames' and its value to your strings.js
    file to add support for another language than English.

    Default is evaluated on the document.ready event.

    @property
    @type {Array}
    @default '_SC.DateTime.abbreviatedDayNames'.loc().w()
  */
  abbreviatedDayNames: null,

  /**
    The localized month names. Add the key '_SC.DateTime.monthNames' and its
    value to your strings.js file to add support for another language than
    English.

    Default is evaluated on the document.ready event.

    @property
    @type {Array}
    @default '_SC.DateTime.monthNames'.loc().w()
  */
  monthNames: null,

  /**
    The localized abbreviated month names. Add the key
    '_SC.DateTime.abbreviatedMonthNames' and its value to your strings.js
    file to add support for another language than English.

    Default is evaluated on the document.ready event.

    @property
    @type {Array}
    @default '_SC.DateTime.abbreviatedMonthNames'.loc().w()
  */
  abbreviatedMonthNames: null,

  /** @private
    Called on document.ready.

    Because localizations may have been modified by an application developer,
    we need to wait for the ready event to actually evaluate the localizations.
  */
  _setup: function() {
    if (!SC.DateTime.dayNames) {
      SC.DateTime.dayNames = '_SC.DateTime.dayNames'.loc().w();
    }

    if (!SC.DateTime.abbreviatedDayNames) {
      SC.DateTime.abbreviatedDayNames = '_SC.DateTime.abbreviatedDayNames'.loc().w();
    }

    if (!SC.DateTime.monthNames) {
      SC.DateTime.monthNames = '_SC.DateTime.monthNames'.loc().w();
    }

    if (!SC.DateTime.abbreviatedMonthNames) {
      SC.DateTime.abbreviatedMonthNames = '_SC.DateTime.abbreviatedMonthNames'.loc().w();
    }
  }

});

jQuery(document).ready(function() {
  SC.DateTime._setup();
});
