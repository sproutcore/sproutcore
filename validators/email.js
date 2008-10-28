// ==========================================================================
// Email Validator
// Author: Charles Jolley
//
// Force a field to be an email address.
//
// ==========================================================================

require('validators/validator') ;

/**
  Requires a valid email format.
  
  @class
  @extends SC.Validator
  @author Charles Jolley
  @version 1.0
*/
SC.Validator.Email = SC.Validator.extend(
/** @scope SC.Validator.Email.prototype */ {
  
  validate: function(form, field) { 
    return (field.get('fieldValue') || '').match(/.+@.+\...+/) ; 
  },
  
  validateError: function(form, field) {
    var label = field.get('errorLabel') || 'Field' ;
    return $error("Invalid.Email(%@)".loc(label), label) ;
  }  
    
}) ;

/**
  This variant allows an empty field as well as an email address.
  
  @class
  @extends SC.Validator.Email
  @author Charles Jolley
  @version 1.0
*/
SC.Validator.EmailOrEmpty = SC.Validator.Email.extend(
/** @scope SC.Validator.EmailOrEmpty.prototype */ {
  validate: function(form, field) {
    var value = field.get('fieldValue') ; 
    return (value && value.length > 0) ? value.match(/.+@.+\...+/) : true ;
  }
}) ;
