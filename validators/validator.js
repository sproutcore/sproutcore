// ==========================================================================
// Validators
// Author: Charles Jolley
// ==========================================================================

//
// Validators provide a way for you to implement simple form field validation
// and transformation.  To use a validator, simply name the validator in the
// "validate" attribute in your text field.  For example, if you want to
// validate a field using the PhoneNumberValidator use this:
//
// <input value="1234567890" validate="phone-number" />
//
// Validators get notified at three points.  You can implement one or all
// of these methods to support validation.  All of the validate methods except
// for validateKeypress behave the same way.  You are passed a form, field,
// and possibly the oldValue.  You are expected to return Validator.OK or
// an error string.  Inside this method you typically do one of all of the
// following:
//
// 1. You can simply validate the field value and return OK or an error str.
// 2. You can modify the field value (for example, you could format the
//    string to match some predefined format).
// 3. If you need to roundtrip the server first to perform validation, you can
//    return Validator.OK, then save the form and field info until after the
//    roundtrip.  On return, if there is a problem, first verify the field
//    value has not changed and then call form.errorFor(field,str) ;
//
SC.Validator = SC.Object.extend({

  // ..........................................
  // OBJECT VALUE CONVERSION
  //
  // The following methods are used to convert the string value of a field
  // to and from an object value.  The default implementations return
  // the string, but you can override this to provide specific behaviors. 
  // For example, you might add or remove a dollar sign or convert the 
  // value to a number.
  
  // This method should return the value to set in the field for the passed
  // object value.  The form and field to be set MAY (but will not always)
  // be passed also.
  fieldValueForObject: function(object, form, field) { return object; },
  
  // This method should return the object value for the string passed. The
  // form and field the value came from MAY (but will not always) be passed
  // also.
  objectForFieldValue: function(value, form, field) { return value; },
  
  // ..........................................
  // VALIDATION PRIMITIVES
  //
  // You can implement standard behavior for your validator by using the
  // vaidate and validateError methods.  validate() should return false
  // if the field is not valid.
  //
  // Expects:
  // form: the form
  // field: the field to validate
  //
  // Returns:
  // true if the field is valid, otherwise not.
  //
  validate: function(form, field) { return true; },

  // This is the other standard validator method that can be used to impement
  // basic validation.  This should return an error object explaining why
  // the field is not valid.  It will only be called if validate() returned
  // false.
  //
  // Expects:
  // form: the form
  // field: the field that is no valid.
  //
  // Returns:
  // Error string.
  //
  validateError: function(form, field) { 
    return $error(
      "Invalid.General(%@)".loc(field.get('fieldValue')),
      field.get('fieldKey')) ; 
  },

  // ..........................................
  // VALIDATION API
  //

  // this method gets invoked just before the user ends editing of the field.
  //
  // Expects;
  // field: the field that was changed.
  // oldValue: the value of the field before the user changed it.
  //
  // Return:
  // SC.Validator.OK if the item was valid, an error object if the item is 
  // not valid.
  //
  validateChange: function(form, field, oldValue) { 
    return (this.validate(form,field)) ? SC.Validator.OK : this.validateError(form, field);
  },

  // this method is called for the field just before the form is submitted.
  //
  // Expects:
  // form: the form the field belongs to
  // field: the field to validate.
  //
  // Returns:
  // An error string of SC.Validator.OK if the field is valid.  If you return
  // an error string, form submission will be cancelled.
  //
  validateSubmit: function(form, field) { 
    return (this.validate(form,field)) ? SC.Validator.OK : this.validateError(form, field);
  },

  // this method gets called 1ms after the user types a key (if a change is
  // allowed).  You can use this validate the new partial string and return 
  // an error if needed.
  //
  // The default will validate a partial only if there was already an error.
  // this allows the user to try to get it right before you bug them.
  //
  // Expects:
  // form: the form the field belongs to
  // field: the field to validate.
  //
  // Returns:
  // An error string if there was a problem, SC.Validator.OK if you checked
  // the field and it was valid or SC.Validator.NO_CHANGE if you did not
  // check the field.  (Passing back OK will hide any showing errors.)
  //
  validatePartial: function(form, field) { 
    if (!field.get('isValid')) {
      return (this.validate(form,field)) ? SC.Validator.OK : this.validateError(form, field);
    } else return SC.Validator.NO_CHANGE ;
  },
  
  // this method gets called when the user types a key.  It's useful to 
  // restrict the letters and numbers the user is allowed to enter.  Return
  // true/false to allow the keypress or not.
  //
  // Expects:
  // form: the form the field belongs to
  // field: the field in focus.
  // char: a string with the characters being added.
  //
  // Returns:
  // true to allow the keypress, false otherwise.
  //
  validateKeypress: function(form, field,charStr) { return true; },

  // .....................................
  // OTHER METHODS

  // this method will be called on all validators when they are attached to
  // a field.  You can use this to do any setup that you need.
  attachTo: function(form,field) {
    // this._form = form ;
    // this._field = field ;
    // var that = this ;
    // ['focus','change','blur','keypress'].each(function(key) {
    //   var f = that['_'+key].bindAsEventListener(that) ;
    //   Event.observe(field,key,f) ;
    // }) ;
    // 
    // if (!this._boundPartial) this._boundPartial = this._partial.bind(this) ;
    // if (field.addObserver) field.addObserver('fieldValue',this._boundPartial);
    // return this ;
  },

  // this method is called on a validator just before it is removed from a 
  // field.  You can tear down any setup you did for the attachTo() method.
  detachFrom: function(form, field) {
    
  }
  
  // detach: function() {
  //     var that = this ;
  //     ['focus','change','blur', 'keypress'].each(function(key) {
  //       var f = that['_'+key].bindAsEventListener(that) ;
  //       Event.stopObserving(that._field,key,f) ;
  //     }) ;
  //     if (this._field.removeObserver) {
  //       this._field.removeObserver('fieldValue',this._boundPartial) ;
  //     }
  //     return this ;
  //   },
  //   
  //   // save the old value before the user makes changes
  //   _focus: function(ev) { 
  //     this._oldValue = this._field.get('fieldValue'); 
  //   },
  //   
  //   _blur: function(ev) {
  //     if (this._oldValue != this._field.get('fieldValue')) this._change(ev) ;
  //     this._oldValue = null ;  
  //   },
  //   
  //   // invoked whenever the field value changes.
  //   _change: function(ev)  {
  //     var err = this.validateChange(this._form,this._field,this._oldValue) ;
  //     this._oldValue = null ;
  //     if (err == SC.Validator.NO_CHANGE) return ; // nothing to do.
  //     if (err == SC.Validator.OK) err = null ;
  //     this._form.setErrorFor(this._field,err) ; // also clears error.
  //   },
  //   
  //   _keypress: function(ev) {
  //     var str = Event.getCharString(ev) ;
  //     var allow = this.validateKeypress(this._form,this._field,str) ;
  //     return allow ;
  //   },
  //   
  //   _partial: function() {
  //     var err = this.validatePartial(this._form,this._field) ;
  //     if (err == SC.Validator.NO_CHANGE) return ; // nothing to do
  //     if (err == SC.Validator.OK) err = null ;
  //     if (this._field.set) this._field.set('isValid', err == null)
  //     this._form.setErrorFor(this._field,err) ;
  //   },
  //   
  //   // invoked by form.
  //   _validate: function() {
  //     var err = this.validateSubmit(this._form,this._field) ;
  //     if (err == SC.Validator.NO_CHANGE) return true ; // nothing to do.
  //     if (err == SC.Validator.OK) err = null ;
  //     this._form.setErrorFor(this._field,err) ;
  //     return (err == null) ; // true = ok to submit.
  //   }
  
}) ;

SC.Validator.mixin({

  // CONSTANTS
  OK: true, NO_CHANGE: false,  

  // this is invoked by a field whenever a validator is attached to the field.
  // The passed validatorKey can be a validator instance, a validator class
  // or a string naming a validator. To make your validator
  // visible, you should name your validator under the SC.Validator base.
  // for example SC.Validator.Number would get used for the 'number' 
  // validator key.
  //
  // This understands validatorKey strings in the following format:
  // * 'key' or 'multiple_words' will find validators Key and MultipleWords
  // * if you want to share a single validator among multiple fields (for
  //   example to validate that two passwords are the same) set a name inside
  //   brackets. i.e. 'password[pwd]'.
  //
  findFor: function(form,field, validatorKey) {
    
    // Convert the validator into a validator instance.
    var validator ;
    if (!validatorKey) return ; // nothing to do...
    
    if (validatorKey instanceof SC.Validator) {
      validator = validatorKey ;
    } else if (validatorKey.isClass) {
      validator = validatorKey.create() ;
      
    } else if ($type(validatorKey) == T_STRING) {

      // extract optional key name
      var name = null ;
      var m = validatorKey.match(/^(.+)\[(.*)\]/) ;
      if (m) {
        validatorKey = m[1] ; name = m[2]; 
      }
      
      // convert the validatorKey name into a class.
      validatorKey = ('-' + validatorKey).camelize() ;
      var validatorClass = SC.Validator[validatorKey] ;
      if (validatorClass == null) {
        throw "validator %@ not found for %@".fmt(validatorKey, field) ;
        return null ;
      } else if (name) {

        // if a key was also passed, then find the validator in the list of
        // validators for the form.  Otherwise, just create a new instance.
        if (!form) {
          throw "named validator (%@) could not be found for field %@ because the field does not belong to a form".fmt(name,field) ;
          return null ;
        }
        
        if (!form._validatorHash) form._validatorHash = {} ;
        var validator = (name) ? form._validatorHash[name] : null ;
        if (!validator) validator = validatorClass.create() ;
        if (name) form._validatorHash[name] = validator ;
      } else validator = validatorClass.create() ;
    } 
    
    return validator ;
  },
  
  fieldValueForObject: function(object, form, field) {
    return this.prototype.fieldValueForObject(object,form,field) ;
  },
  
  objectForFieldValue: function(value, form, field) {
    return this.prototype.objectForFieldValue(value,form,field) ;
  }
  
})