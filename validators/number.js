// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('validators/validator') ;

/**
  Handles parsing and validating of numbers.
  
  @extends SC.Validator
  @author Charles Jolley
  @version 1.0
  @class
*/
SC.Validator.Number = SC.Validator.extend(
/** @scope SC.Validator.Number.prototype */ {

  /**
    Number of decimal places to show.  
    
    If 0, then numbers will be treated as integers.  Otherwise, numbers will
    show with a fixed number of decimals.
  */
  places: 0,
  
  fieldValueForObject: function(object, form, field) {
    switch($type(object)) {
      case T_NUMBER:
        object = object.toFixed(this.get('places')) ;
        break ;
      case T_NULL:
      case T_UNDEFINED:
        object = '';
        break ;
    }
    return object ;
  },

  objectForFieldValue: function(value, form, field) {
    switch($type(value)) {
      case T_STRING:
        if (value.length == '') {
          value = null ;
        } else if (this.get('places') > 0) {
          value = parseFloat(value) ;
        } else {
          value = parseInt(value,0) ;
        }
        break ;
      case T_NULL:
      case T_UNDEFINED:
        value = null ;
        break ;
    }
    return value ;
  },
  
  validate: function(form, field) { 
    var value = field.get('fieldValue') ;
    return (value == '') || !(isNaN(value) || isNaN(parseFloat(value))) ; 
  },
  
  validateError: function(form, field) {
    var label = field.get('errorLabel') || 'Field' ;
    return $error("Invalid.Number(%@)".loc(label), label) ;
  }
    
}) ;
