// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @namespace

  Views that include the Validatable mixin can be used with validators to 
  ensure their values are valid.  
  
*/
SC.Validatable = {
  
  /** @private */
  initMixin: function() {
    this._validatable_validatorDidChange() ;
  },
  
  /**
    The validator for this field.  
  
    Set to a validator class or instance.  If this points to a class, it will 
    be instantiated when the validator is first used.
    
    @property {SC.Validator}
  */
  validator: null,

  /**
    This property must return the human readable name you want used when 
    describing an error condition.  For example, if set this property to
    "Your Email", then the returned error string might be something like
    "Your Email is not valid".
    
    You can return a loc string here if you like.  It will be localized when
    it is placed into the error string.
    
    @property {String}
  */
  errorLabel: null,

  /**
    Value being edited can be cached here when it is not committed during
    partial edits.  If this is an SC.Error object, isValid() returns NO as
    an indication that the current edited state of the value is invalid.
  */
  editingValue: null,

  /**
    YES if the receiver is currently valid.
    
    This property watches the value property by default.  You can override
    this property if you want to use some other method to calculate the
    current valid state.
    
    @property {Boolean}
  */
  isValid: function() { 
    return (SC.typeOf(this.get('value')) !== SC.T_ERROR) && (SC.typeOf(this.get('editingValue')) !== SC.T_ERROR); 
  }.property('value', 'editingValue'),
  
  /**
    Runs a keypress validation.  Returns YES if the keypress should be 
    allowed, NO otherwise.  If no validator is defined, always returns YES.
    
    @param {String} charStr the key string
    @returns {Boolean}
  */
  performValidateKeyDown: function(evt) {
    // ignore anything with ctrl or meta key press
    var charStr = evt.getCharString();
    if (!charStr) return YES ;
    return this._validator ? this._validator.validateKeyDown(charStr, this) : YES;
  },
  
  /**
    Asks the validator to perform either partial or commit validation on 'object',
    depending on the 'isPartial' flag.
  */
  performValidate: function(object, isPartial) {
    if (SC.typeOf(object) !== SC.T_ERROR) {
      if (isPartial) {
        object = this._validator ? this._validator.validatePartial(object, this) : object;
      }
      else {
        object = this._validator ? this._validator.validateCommit(object, this) : object;
      }
    }
    return object;
  },
  
  /**
    Returns the validator object, if one has been created.
    
    @property {SC.Validator}
  */
  validatorObject: function() {
    return this._validator;
  }.property(),

  /**
    Convert the field value string into an object.
    
    This method will call the validators objectForFieldValue if it exists.
    
    @param {Object} fieldValue the raw value from the field.
    @param {Boolean} partialChange
    @returns {Object}
  */
  objectForFieldValue: function(fieldValue) {
    return this._validator ? this._validator.objectForFieldValue(fieldValue, this) : fieldValue ;
  },
  
  /**
    Convert the object into a field value.
    
    This method will call the validator's fieldValueForObject if it exists.
    
    @param object {Object} the objec to convert
    @returns {Object}
  */
  fieldValueForObject: function(object) {
    return this._validator ? this._validator.fieldValueForObject(object, this) : object ;
  },
  
  _validatable_displayObserver: function() {
    this.displayDidChange();
  }.observes('isValid', 'editingValue'),

  /** @private */
  renderMixin: function(context) {
    context.setClass('invalid', !this.get('isValid'));
  },

  // invoked whenever the attached validator changes.
  _validatable_validatorDidChange: function() {
    var val = SC.Validator.findFor(this, this.get('validator')) ;
    if (val != this._validator) {
      this.propertyWillChange('validatorObject');
      if (this._validator) this._validator.detachFrom(this) ;
      this._validator = val;
      if (this._validator) this._validator.attachTo(this) ;
      this.propertyDidChange('validatorObject');
    }  
  }.observes('validator')

};
