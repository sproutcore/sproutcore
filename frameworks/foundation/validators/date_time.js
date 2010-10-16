// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

require('validators/validator');

/**
  This validates a SC.DateTime, used in SC.DateFieldView.
  
  @class
  @extends SC.Validator
  @author Juan Pablo Goldfinger
  @version 1.0
*/
SC.Validator.DateTime = SC.Validator.extend({

  /**
    The standard format you want the validator to convert dates to.
  */
  format: '%d/%m/%Y',

  /**
    if we have a number, then convert to a date object.
  */
  fieldValueForObject: function(object, form, field) {
    if (SC.kindOf(object, SC.DateTime)) {
      object = object.toFormattedString(this.get('format'));
    } else {
      object = null;
    }
    return object;
  },

  /**
    Try to pase value as a date. convert into a number, or return null if
    it could not be parsed.
  */
  objectForFieldValue: function(value, form, field) {
    if (value) {
      value = SC.DateTime.parse(value, this.get('format'));
    }
    return value;
  }

});
