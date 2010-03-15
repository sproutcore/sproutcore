// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

SC.VALIDATE_OK = YES;
SC.VALIDATE_NO_CHANGE = NO;

/**
  @class
  
  Validators provide a way for you to implement simple validation
  and transformation.  To use a validator, simply name the validator in the
  "validate" attribute in your text field.  For example, if you want to
  validate a field using the PhoneNumberValidator use this:

  <input value="1234567890" validate="phone-number" />

  Validators get notified at three points.  You can implement one or all
  of these methods to support validation.  All of the validate methods except
  for validateKeypress behave the same way.  You are passed a value to validate
  and the field from which it originated.  You are expected to return the value
  if it is acceptable, a coerced value, or, if unacceptable, an SC.Error instance.
  The SC.Error instance should have 'errorValue' set to the bad value.
  Inside this method you typically do one of all of the
  following:

  1. You can simply validate the field value and return the value or an SC.Error instance.
  
  2. You can modify the field value (for example, you could format the
     string to match some predefined format) and return that.
     
  3. If you need to roundtrip the server first to perform validation, you can
     return the value, then save the value and field info until after the
     roundtrip.  On return, if there is a problem, first verify the field
     value has not changed and then set 'value' to an SC.Error instance.

  @extends SC.Object
  @since SproutCore 1.0
*/
SC.Validator = SC.Object.extend(
/** @scope SC.Validator.prototype */ {

  // ..........................................
  // OBJECT VALUE CONVERSION
  //
  // The following methods are used to convert the string value of a field
  // to and from an object value.  The default implementations return
  // the string, but you can override this to provide specific behaviors. 
  // For example, you might add or remove a dollar sign or convert the 
  // value to a number.
  
  /**
    Returns the value to set in the field for the passed object value.  
  
    The view to be set MAY (but will not always) be passed also.  You
    should override this method to help convert an input object into a value
    that can be displayed by the field.  For example, you might convert a 
    date to a property formatted string or a number to a properly formatted
    value.
  
    @param {Object} object The object to transform
    @param {SC.View} field The view the value is required for.
    @returns {Object} a value (usually a string) suitable for display
  */
  fieldValueForObject: function(object, field) { return object; },
  
  /**
    Returns the object value for the passed string.
    
    The view MAY (but will not always) be passed also.  You should
    override this method to convert a field value, such as string, into an
    object value suitable for consumption by the rest of the app.  For example
    you may convert a string into a date or a number.
    
    You may return an SC.Error instance if you were unable to convert
    the string to a suitable object.  In this case, 'errorValue' should be
    set to the bad input:
    
      return SC.Error.create({ errorValue: fieldValue, message: 'my error message' });
    
    @param {String} fieldValue the field value.  (Usually a String).
    @param {SC.View} view The view this value was pulled from.
    @returns {Object} an object suitable for consumption by the app or an SC.Error instance.
  */
  objectForFieldValue: function(fieldValue, field) { return fieldValue; },

  // ..........................................
  // VALIDATION API
  //

  /**
    Invoked when the user presses a key.  
  
    This method is used to restrict the letters and numbers the user is 
    allowed to enter.  You should not use this method to perform full 
    validation on the field since this does not stop other means of
    entering text into the field such as copy-and-paste.  Instead
    use validatePartial().

    @param {String} char the characters being added
    @param {SC.View} field the field to validate
    
    @returns {Boolean} YES if allowed, NO otherwise
  */
  validateKeyDown: function(charStr, field) {
    return YES;
  },

  /**
    Optionally override this method to implement custom validation for
    a partially edited field (when the user is not finished editing yet).
    For SC.TextFieldView, this will be called when the field changes as a
    result of a 'change' event (typing or copy-and-paste, for example).
    
    The 'value' parameter will be the output from objectForFieldValue() above
    if it was not an SC.Error instance.
  
    @param {Object|String} value the value to validate
    @param {SC.View} field the field to validate
    
    @returns {Object} value, coerced value, or SC.Error instance
  */
  validatePartial: function(value, field) { 
    return value;
  },

  /**
    Optionally override this method to implement custom validation for
    a value when it is finished being edited (when a text field loses focus,
    for example).
    
    The 'value' parameter will be the output from objectForFieldValue() above
    if it was not an SC.Error instance.
    
    @param {Object|String} value the value to validate
    @param {SC.View} field the field to validate
    
    @returns {Object} value, coerced value, or SC.Error instance
  */
  validateCommit: function(value, field) {
    return value;
  },

  // .....................................
  // OTHER METHODS

  /**
    Called on all validators when they are attached to a field.  
  
    You can use this to do any setup that you need.  The default does nothing.
    
    @param {SC.View} field the field to validate
  */
  attachTo: function(field) {},

  /**
    Called on a validator just before it is removed from a field.  You can 
    tear down any setup you did for the attachTo() method.
    
    @param {SC.View} field the field to validate
  */
  detachFrom: function(field) {}

}) ;

SC.Validator.mixin(/** @scope SC.Validator */ {

  /**
    Return value when validation was performed and value is OK.
  */
  OK: true, 
  
  /**
    Return value when validation was not performed.
  */
  NO_CHANGE: false,  

  /**
    Invoked by a field whenever a validator is attached to the field.
    
    The passed validatorKey can be a validator instance, a validator class
    or a string naming a validator. To make your validator
    visible, you should name your validator under the SC.Validator base.
    for example SC.Validator.Number would get used for the 'number' 
    validator key.
  
    This understands validatorKey strings in the following format:

    * 'key' or 'multiple_words' will find validators Key and MultipleWords

    * if you want to share a single validator among multiple fields (for
      example to validate that two passwords are the same) set a name inside
      brackets. i.e. 'password[pwd]'.

    @param {SC.View} field the field to validate
    @param {Object} validatorKey the key to validate
    
    @returns {SC.Validator} validator instance or null
  */  
  findFor: function(field, validatorKey) {
    var validator, name, m, validatorClass;
    
    if (!validatorKey) return ; // nothing to do...

    // Convert the validator into a validator instance.
    
    if (validatorKey instanceof SC.Validator) {
      validator = validatorKey ;
    }
    else if (validatorKey.isClass) {
      validator = validatorKey.create() ;
    }
    else if (SC.typeOf(validatorKey) === SC.T_STRING) {

      // extract optional key name
      name = null ;
      m = validatorKey.match(/^(.+)\[(.*)\]/) ;
      if (m) {
        validatorKey = m[1] ; name = m[2]; 
      }

      // convert the validatorKey name into a class.
      validatorKey = validatorKey.classify() ;
      validatorClass = SC.Validator[validatorKey] ;

      if (SC.none(validatorClass)) {
        throw "validator %@ not found for %@".fmt(validatorKey, field) ;
      }
      // else if (name) {
      // 
      //   // if a key was also passed, then find the validator in the list of
      //   // validators for the form.  Otherwise, just create a new instance.
      //   if (!form) {
      //     throw "named validator (%@) could not be found for field %@ because the field does not belong to a form".fmt(name,field) ;
      //   }
      //   
      //   if (!form._validatorHash) {
      //     form._validatorHash = {} ;
      //   }
      //   
      //   validator = (name) ? form._validatorHash[name] : null ;
      // 
      //   if (!validator) validator = validatorClass.create() ;
      // 
      //   if (name) form._validatorHash[name] = validator ;
      // 
      // }
      else {
        validator = validatorClass.create();
      }
    } 

    return validator ;
  },
  
  /**
    Convenience class method to call the fieldValueForObject() instance
    method you define in your subclass.
  */
  fieldValueForObject: function(object, field) {
    if (this.prototype && this.prototype.fieldValueForObject) {
      return this.prototype.fieldValueForObject(object, field) ;
    }
    else return null ;
  },
  
  /**
    Convenience class method to call the objectForFieldValue() instance
    method you define in your subclass.
  */
  objectForFieldValue: function(value, field) {
    if (this.prototype && this.prototype.objectForFieldValue) {
      return this.prototype.objectForFieldValue(value, field) ;
    }
    else return null ;
  }
  
});
