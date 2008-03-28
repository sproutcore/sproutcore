// ========================================================================
// SproutCore
// copyright 2006-2007 Sprout Systems, Inc.
// ========================================================================

require('views/view') ;

// This is the generic base class for input-type views such as text fields,
// checkboxes, etc.  You can extend this for your own purposes as well.
SC.FieldView = SC.View.extend({

  // PUBLIC PROPERTIES
  // You generally do not need to override these properties though you might
  // change them....
  
  // this is the value of the field.  The form view will pick up whatever 
  // value is published here.  Generally you do not need to override this 
  // method.  Instead you should override setFieldValue(), getFieldValue()
  // and the error property.
  value: null,

  // set to true to enable editing on the field. 
  isEnabled: true,
  
  // points to the validator for this field.  Set to a validator class or
  // instance.  If this points to a class, it will be instantiated when the
  // validator is first used.
  validator: null,

  // this should be set to the name of the key you want to be published for
  // the owner form.
  fieldKey: null,
  
  // this should be set to the human readable label you want shown for errors.
  // defaults to the value of fieldKey.
  fieldLabel: null,
  
  // computed property returns the human readable label for this field for
  // use in error strings.  This is either the fieldLabel or a humanized
  // form of the fieldKey.
  errorLabel: function() {
    var ret = this.get('fieldLabel') ;
    if (ret) return ret ;
    
    // if field label is not provided, compute something...
    var fk = this.get('fieldKey') ;
    var def = (fk || '').humanize().capitalize() ;  
    return "FieldKey.%@".fmt(fk).locWithDefault(def) ; // localize if poss.
  }.property('fieldLabel','fieldKey'),
  
  // computed property, true when error is null.
  isValid: function() { 
    return $type(this.get('value')) != T_ERROR; 
  }.property('value'),

  // this is the raw value of the field, ignoring validation.  You generally
  // should not override this.  Instead override setFieldValue and
  // getFieldValue.
  fieldValue: function(key,value) {
    if (value !== undefined) this._setFieldValue(value) ;
    return this._getFieldValue() ;
  }.property('value'),

  // ACTIONS
  // You generally do not need to override these but they may be used.

  // This is called to perform validation on the field just before the form 
  // is submitted.  If you have a validator attached, this will get the
  // validators.
  validateSubmit: function() {
    var ret = true ;
    var value ;
    
    if (this._validator) {
      ret = this._validator.validateSubmit(this.get('ownerForm'),this) ;
      value = ($type(ret) == T_ERROR) ? ret : this._getFieldValue() ;
    } else value = this._getFieldValue() ;
    
    if (value != this.get('value')) this.set('value',value) ;
    return ret ;
  },
  
  // OVERRIDE IN YOUR SUBCLASS
  // Override these primitives in your subclass as required.
  
  // the two primitives below can be overridden by subclasses to translate
  // the FieldView value to an element value and visa-versa.
  setFieldValue: function(newValue) {
    if (this.rootElement.value != newValue) this.rootElement.value = newValue;
  },
  
  getFieldValue: function() {
    return this.rootElement.value;
  },

  // This method should be called by you subclass anytime you want the view to
  // pick up the current value from the form and post it out. 
  //
  // partial (opt): default false.  If true, this will be validated as a
  //                partial.  Otherwise validated as a change.
  //
  fieldValueDidChange: function(partialChange) {
    var ret = true ;

    if (this._validator) {
      var form = this.get('ownerForm') ;
      if (partialChange == true) {
        ret = this._validator.validatePartial(form,this) ;

        // if the partial returned NO_CHANGE, then check to see if the 
        // field is valid anyway.  If it is not valid, then don't update the
        // value.  This way the user can have partially constructed values 
        // without the validator trying to convert it to an object.
        if (ret == SC.Validator.NO_CHANGE) {
          if (this._validator.validateChange(form, this) != SC.Validator.OK) {
            return ret ; // EXIT POINT
          }
        }
      } else {
        ret = this._validator.validateChange(form, this) ;
        
      }
    }

    // get the field value and set it.
    // if ret is an error, use that instead of the field value.
    var value = ($type(ret) == T_ERROR) ? ret : this._getFieldValue() ;
    if (value != this.get('value')) this.set('value',value) ;
    
    // if the validator says everything is OK, then in addition to posting
    // out the value, go ahead and pass the value back through itself.
    // This way if you have a formatter applied, it will reformat.
    if (!partialChange && ($type(ret) != T_ERROR)) {
      this._setFieldValue(value) ;
    }
    
    return ret ;
  },

  // override to enable editing of this field.
  enableField: function() {
    Form.Element.enable(this.rootElement) ;
  },

  // override to disable editing of this field.
  disableField: function() {
    Form.Element.disable(this.rootElement) ;
  },
  

  // PRIVATE SUPPORT METHODS
  //
  
  init: function() {
    arguments.callee.base.call(this) ;
    this._validatorObserver() ;
    this._enabledObserver() ;
    if (this.rootElement) this._setFieldValue(this.get('value')) ;
  },
  
  
  // add a class name when the valid state changes.
  _validObserver: function() {
    this.setClassName('invalid',!this.get('isValid')) ;
  }.observes('isValid'),
  
  // called whenever isEnabled changes.
  _enabledObserver: function(target, key, isEnabled) {
    isEnabled = this.get('isEnabled') ;
    this.setClassName('disabled', !isEnabled) ;
    (isEnabled) ? this.enableField() : this.disableField(); 
  }.observes('isEnabled'),
  
  // called whenever the value is set on the object.  Will set the value
  // on the field if the value is changed.
  _valueObserver: function() {
    var value = this.get('value') ;
    var isError = $type(value) == T_ERROR ;
    if (!isError && (value != this._getFieldValue())) {
      this._setFieldValue(value) ;
    } 
  }.observes('value'),
  
  // invoked whenever the attached validator changes.
  _validatorObserver: function() {
    var form = this.get('ownerForm') ;
    var val = SC.Validator.findFor(form, this, this.get('validator')) ;
    if (val != this._validator) {
      if (this._validator) this._validator.detachFrom(form, this) ;
      this._validator = val;
      if (this._validator) this._validator.attachTo(form, this) ;
    }  
  }.observes('validator', 'ownerForm'),
  
  // these methods use the validator to conver the raw field value returned
  // by your subclass into an object and visa versa.
  _setFieldValue: function(newValue) {
    if (this._validator) {
      newValue = this._validator.fieldValueForObject(newValue, this.get('ownerForm'), this) ;
    }
    return this.setFieldValue(newValue) ;
  },
  
  _getFieldValue: function() {
    var val = this.getFieldValue() ;
    if (this._validator) {
      val = this._validator.objectForFieldValue(val, this.get('ownerForm'), this) ;
    }
    return val ;
  }
  
}) ;


