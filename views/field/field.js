// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('views/view') ;
require('mixins/control') ;
require('mixins/validatable') ;

/**
  @class

  Generic base class for working with views that depend on the "input" HTML 
  tag such as text fields.
  
  You can work with subclasses of SC.FieldView or extend this class with your
  own values as well.  Unlike most other HTML elements, web browsers have 
  built-in support for editing the value of an input field.  This class
  handles blending the browser input methods with the editing and events 
  handling provided by the framework.  
  
  @extends SC.View
  @extends SC.Control
  @extends SC.Validatable
  @author Charles Jolley
  @version 1.0
*/
SC.FieldView = SC.View.extend(SC.Control, SC.Validatable,
/** @scope SC.FieldView.prototype */ {

  // PUBLIC PROPERTIES
  // You generally do not need to override these properties though you might
  // change them....
  
  /**
    The value of the field.  
    
    The form view will pick up whatever value is published here.  Generally 
    you do not need to observe this property directly.  Instead you should 
    override setFieldValue(), getFieldValue() and the error property.
    
    @field
  */
  value: null,

  /**
    name of key this field should display as part of a form.
  
    If you add a field as part of an SC.FormView, then the form view will 
    automatically bind the field to the property key you name here on the 
    content object.
  */
  fieldKey: null,
  
  /**
    The human readable label you want shown for errors.  May be a loc string.
  
    If your field fails validation, then this is the name that will be shown
    in the error explanation.
  */  
  fieldLabel: null,
  
  /**
    The human readable label for this field for use in error strings.  
    
    This is either the fieldLabel or a humanized form of the fieldKey.
    
    @field
  */  
  errorLabel: function() {
    var ret = this.get('fieldLabel') ;
    if (ret) return ret ;
    
    // if field label is not provided, compute something...
    var fk = this.get('fieldKey') ;
    var def = (fk || '').humanize().capitalize() ;  
    return "FieldKey.%@".fmt(fk).locWithDefault(def) ; // localize if poss.
  }.property('fieldLabel','fieldKey'),
  
  /**
    The raw value of the field, ignoring validation.  
  
    You generally should not override this.  Instead override setFieldValue() 
    and getFieldValue().
  
    @field
  */  
  fieldValue: function(key,value) {
    if (value !== undefined) this._setFieldValue(value) ;
    return this._getFieldValue() ;
  }.property('value'),

  // ACTIONS
  // You generally do not need to override these but they may be used.

  /**
    Called to perform validation on the field just before the form 
    is submitted.  If you have a validator attached, this will get the
    validators.
  */  
  validateSubmit: function() {
    var ret = this.performValidateSubmit() ;
    // save the value if needed
    var value = ($ok(ret)) ? this._getFieldValue() : ret ;
    if (value != this.get('value')) this.set('value', value) ;
    return ret ;
  },
  
  // OVERRIDE IN YOUR SUBCLASS
  // Override these primitives in your subclass as required.
  
  /**
    Override to set the actual value of the field.
    
    The default implementations set the value on the new value.  The value
    will have already been converted to a field value using any validator.
    
    @param {Object} newValue the value to display.
  */
  setFieldValue: function(newValue) {
    if (this.rootElement.value != newValue) this.rootElement.value = newValue;
  },

  /**
    Override to retrieve the actual value of the field.
    
    The default implementation gets the value attribute of the rootElement.
  */
  getFieldValue: function() {
    return this.rootElement.value;
  },

  /**
    Call by your subclass anytime you want the view to pick up the current 
    value from the form and post it out. 
  
    @param partialChange (optional) YES if this is a partial change.
    @returns result of validation.
  */
  fieldValueDidChange: function(partialChange) {

    // get the field value and set it.
    // if ret is an error, use that instead of the field value.
    var ret = this.performValidate(partialChange) ;
    if (ret == SC.Validator.NO_CHANGE) return ret ;

    // if the validator says everything is OK, then in addition to posting
    // out the value, go ahead and pass the value back through itself.
    // This way if you have a formatter applied, it will reformat.
    //
    // Do this BEFORE we set the value so that the valueObserver will not
    // overreact.
    //
    var value = ($ok(ret)) ? this._getFieldValue() : ret ;
    if (!partialChange && $ok(ret)) this._setFieldValue(value) ;
    if (value != this.get('value')) this.set('value',value) ;
    return ret ;
  },

  /**
    Override to enable editing of this field.
    
    The default just sets the disabled property on the root element.
  */
  enableField: function() {
    this.rootElement.disabled = NO ;
  },

  /**
    Override to disable editing of the field
    
    The default just sets the disabled property on the root element.
  */
  disableField: function() {
    this.rootElement.disabled = YES ;
  },

  /**
    Overrides enabled observer to also call enableField()/disableField() 
    methods.
  */
  isEnabledObserver: function() {
    isEnabled = this.get('isEnabled') ;
    sc_super();
    (isEnabled) ? this.enableField() : this.disableField(); 
  }.observes('isEnabled'),

  // PRIVATE SUPPORT METHODS
  //
  init: function() {
    arguments.callee.base.call(this) ;
    if (this.rootElement) this._setFieldValue(this.get('value')) ;
  },
  
  
  // called whenever the value is set on the object.  Will set the value
  // on the field if the value is changed.
  _valueObserver: function() {
    var value = this.get('value') ;
    var isError = $type(value) == T_ERROR ;
    if (!isError && (value != this._getFieldValue())) {
      this._setFieldValue(value) ;
    } 
  }.observes('value'),
  
  // these methods use the validator to conver the raw field value returned
  // by your subclass into an object and visa versa.
  _setFieldValue: function(newValue) {
    return this.setFieldValue(this.fieldValueForObject(newValue)) ;
  },
  
  _getFieldValue: function() {
    return this.objectForFieldValue(this.getFieldValue()) ;
  }
  
}) ;


