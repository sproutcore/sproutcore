// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

SC.DateTime.mixin(
/** @scope SC.DateTime */ {

  /**
    @private

    Called on `document.ready`.

    Because localizations may have been modified by an application developer,
    we need to wait for the ready event to actually evaluate the localizations.
  */
  _setup: function() {
    SC.DateTime.dayNames = SC.String.w(SC.String.loc('_SC.DateTime.dayNames'));
    SC.DateTime.abbreviatedDayNames = SC.String.w(SC.String.loc('_SC.DateTime.abbreviatedDayNames'));
    SC.DateTime.monthNames = SC.String.w(SC.String.loc('_SC.DateTime.monthNames'));
    SC.DateTime.abbreviatedMonthNames = SC.String.w(SC.String.loc('_SC.DateTime.abbreviatedMonthNames'));
    SC.DateTime.AMPMNames = SC.String.w(SC.String.loc('_SC.DateTime.AMPMNames'));
  }

});

jQuery(document).ready(function() {
  SC.DateTime._setup();
});
