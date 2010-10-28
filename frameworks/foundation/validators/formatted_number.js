// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
sc_require('validators/validator');

/**
  Handles parsing and validating of numbers.
  
  @extends SC.Validator
  @author Charles Jolley
  @version 1.0
  @class
*/
SC.Validator.FormattedNumber = SC.Validator.extend(
/** @scope SC.Validator.Number.prototype */
{

  fieldValueForObject: function(object, form, field) {
    SC.Logger.log("OBJ: " + object);
    if (!isNaN(object)) {
      return field.formatNumber(object);
    }
    return null;
  },

  objectForFieldValue: function(value, form, field) {
    SC.Logger.log("VALUE: " + value);
    if (SC.empty(value)) return null;
    return parseFloat(field.systemDecimal(field.cleanThousands(value)));
  }/*,

  validate: function(form, field) {
    var value = field.get('fieldValue');
    return (value === '') || !(isNaN(value) || isNaN(parseFloat(value)));
  },

  validateError: function(form, field) {
    var label = field.get('errorLabel') || 'Field';
    return SC.$error("Invalid.Number(%@)".loc(label), label);
  }*/

});
