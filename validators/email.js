// ==========================================================================
// Email Validator
// Author: Charles Jolley
//
// Force a field to be an email address.
//
// ==========================================================================

require('validators/validator') ;
SC.Validator.Email = SC.Validator.extend({
  
  validate: function(form, field) { 
    return (field.get('fieldValue') || '').match(/.+@.+\...+/) ; 
  },
  
  validateError: function(form, field) {
    var label = field.get('errorLabel') || 'Field' ;
    return $error("Invalid.Email(%@)".loc(label), label) ;
  }  
    
}) ;

// this variant allows an email to be empty.
SC.Validator.EmailOrEmpty = SC.Validator.Email.extend({
  validate: function(form, field) {
    var value = field.get('fieldValue') ; 
    return (value && value.length > 0) ? value.match(/.+@.+\...+/) : true ;
  }
}) ;
