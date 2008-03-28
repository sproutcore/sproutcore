// ==========================================================================
// Not Empty Validator
// Author: Charles Jolley
//
// Force a field to be not empty.
//
// ==========================================================================

require('validators/validator') ;
SC.Validator.NotEmpty = SC.Validator.extend({
  
  validate: function(form, field) {
    var value = field.get('fieldValue'); 
    var ret = !!value ;
    if (ret && value.length) ret = value.length > 0 ;
    return ret ;
  },
  
  validateError: function(form, field) {
    var label = field.get('errorLabel') || 'Field' ;
    return $error("Invalid.NotEmpty(%@)".loc(label.capitalize()), field.get('errorLabel'));
  }
    
}) ;
