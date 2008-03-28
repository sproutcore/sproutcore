// ========================================================================
// SproutCore
// copyright 2006-2007 Sprout Systems, Inc.
// ========================================================================

require('validators/validator') ;

// Handle the parsing and display of numbers.
SC.Validator.Number = SC.Validator.extend({

  places: 0, // 0 to force int. otherwise fixed.
  
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
