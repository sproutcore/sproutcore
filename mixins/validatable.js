// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

/**
  @namespace

  Views that include the Validatable mixin can be used with validators to 
  ensure their values are valid.  
  
*/
SC.Validatable = {
  
  initMixin: function() {
    this._validatorObserver() ;
  },
  
  /**
    The validator for this field.  
  
    Set to a validator class or instance.  If this points to a class, it will 
    be instantiated when the validator is first used.
  */
  validator: null,

  /**
    This property must return the human readable name you want used when 
    describing an error condition.  For example, if set this property to
    "Your Email", then the returned error string might be something like
    "Your Email is not valid".
    
    You can return a loc string here if you like.  It will be localized when
    it is placed into the error string.
  */
  errorLabel: null,

  /**
    YES if the receiver is currently valid.
    
    This property watches the value property by default.  You can override
    this property if you want to use some other method to calculate the
    current valid state.
    
    @field
  */
  isValid: function() { 
    return $type(this.get('value')) != T_ERROR; 
  }.property('value'),
  
  /**
    The form that the view belongs to.  May be null if the view does not 
    belong to a form.  This property is usually set automatically by an 
    owner form view.
  */
  ownerForm: null,
  
  /**
    Attempts to validate the receiver. 
    
    Runs the validator and returns SC.Validator.OK, SC.Validator.NO_CHANGE,
    or an error object.  If no validator is installed, this method will
    always return SC.Validator.OK.

    @param {Boolean} partialChange YES if this is a partial edit.
    @returns SC.Validator.OK, error, or SC.Validator.NO_CHANGE
  */
  performValidate: function(partialChange) {
    var ret = SC.Validator.OK ;

    if (this._validator) {
      var form = this.get('ownerForm') ;
      if (partialChange) {
        ret = this._validator.validatePartial(form,this) ;

        // if the partial returned NO_CHANGE, then check to see if the 
        // field is valid anyway.  If it is not valid, then don't update the
        // value.  This way the user can have partially constructed values 
        // without the validator trying to convert it to an object.
        if ((ret == SC.Validator.NO_CHANGE) && (this._validator.validateChange(form, this) == SC.Validator.OK)) {
          ret = SC.Validator.OK; 
        }
      } else ret = this._validator.validateChange(form, this) ;
    }
    return ret ;
  },

  /**
    Runs validateSubmit.  You should use this in your implementation of 
    validateSubmit.  If no validator is installed, this always returns
    SC.Validator.OK
  */
  performValidateSubmit: function() {
    return (this._validator) ? this._validator.validateSubmit(this.get('ownerForm'), this) : SC.Validator.OK;
  },
  
  /**
    Invoked by the owner form just before submission.  Override with your 
    own method to commit any final changes after you perform validation. 
    
    The default implementation simply calls performValidateSubmit() and 
    returns that value.
  */
  validateSubmit: function() { return this.performValidateSubmit(); },
  
  /**
    Convert the field value string into an object.
    
    This method will call the validators objectForFieldValue if it exists.
    
    @param fieldValue the raw value from the field.
    @returns converted object
  */
  objectForFieldValue: function(fieldValue) {
    return (this._validator) ? this._validator.objectForFieldValue(fieldValue, this.get('ownerForm'), this) : fieldValue ;
  },
  
  /**
    Convert the object into a field value.
    
    This method will call the validator's fieldValueForObject if it exists.
    
    @param object the objec to convert
    @returns converted field value
  */
  fieldValueForObject: function(object) {
    return (this._validator) ? this._validator.fieldValueForObject(object, this.get('ownerForm'), this) : object ;
  },
  
  /**
    Default observer for isValid property.
    
    The default implementation will add/remove a valid class name to the
    root element of your view.
  */
  isValidObserver: function() {
    var invalid = !this.get('isValid') ;
    this.setClassName('invalid', invalid) ;
  }.observes('isValid'),
  
  // invoked whenever the attached validator changes.
  _validatorObserver: function() {
    var form = this.get('ownerForm') ;
    var val = SC.Validator.findFor(form, this, this.get('validator')) ;
    if (val != this._validator) {
      if (this._validator) this._validator.detachFrom(form, this) ;
      this._validator = val;
      if (this._validator) this._validator.attachTo(form, this) ;
    }  
  }.observes('validator', 'ownerForm')
      
};
