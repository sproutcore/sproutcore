// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
sc_require('validators/validator');

/**
  Handles parsing and validating of numbers with decimals anf thousands.
  
  @extends SC.Validator
  @author Juan Pablo Goldfinger
  @version 1.5
  @class
*/
SC.Validator.FormattedNumber = SC.Validator.extend(
/** @scope SC.Validator.Number.prototype */
{

  fieldValueForObject: function(object, form, field) {
    if (!isNaN(object)) {
      return field.formatNumber(object);
    }
    return null;
  },

  objectForFieldValue: function(value, form, field) {
    if (SC.empty(value)) return null;
    return parseFloat(field.systemDecimal(field.cleanThousands(value)));
  }

});
