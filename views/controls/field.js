// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('views/view') ;
require('mixins/control') ;
require('mixins/validatable') ;
require('mixins/delegate_suppport');

/** @class

  Base view for managing a view backed by an input element.  Since the web
  browser provides native support for editing input elements, this view
  provides basic support for listening to changes on these input elements and
  responding to them.
  
  Generally you will not work with a FieldView directly.  Instead, you should
  use one of the subclasses implemented by your target platform such as 
  SC.CheckboxView, SC.RadioView, SC.TextFieldView, and so on.
  
  @extends SC.View
  @extends SC.Control
  @extends SC.Validatable
  @since SproutCore 1.0
*/
SC.FieldView = SC.View.extend(SC.Control, SC.Validatable,
/** @scipe SC.FieldView.prototype */ {

  /**
    The raw value of the field, ignoring validation.  
  
    You generally should not override this.  Instead override setFieldValue() 
    and getFieldValue().
  
    @field
  */  
  fieldValue: function(key,value) {
    if (value !== undefined) this._field_setFieldValue(value) ;
    return this._field_getFieldValue() ;
  }.property('value').cacheable(),

  // ACTIONS
  // You generally do not need to override these but they may be used.

  /**
    Called to perform validation on the field just before the form 
    is submitted.  If you have a validator attached, this will get the
    validators.
  */  
  validateSubmit: function() {
    var ret = this.performValidateSubmit ? this.performValidateSubmit() : YES;
    // save the value if needed
    var value = SC.$ok(ret) ? this._field_getFieldValue() : ret ;
    if (value != this.get('value')) this.set('value', value) ;
    return ret ;
  },
  
  // OVERRIDE IN YOUR SUBCLASS
  // Override these primitives in your subclass as required.
  
  /**
    Override this method to return a CQ object with any input tags you would
    like to monitor for changes.  The default version returns all input tags
    in the receiver view, including the rootElement.
  */
  $input: function() { return this.$('input').andSelf().filter('input'); },
  
  /**
    Override to set the actual value of the field.

    The default implementation will simple copy the newValue to the value
    attribute of any input tags in the receiver view.  You can override this
    method to provide specific functionality needed by your view.
    
    @param {Object} newValue the value to display.
    @returns {SC.FieldView} receiver
  */
  setFieldValue: function(newValue) {
    this.$input().val(newValue);
    return this ;
  },

  /**
    Override to retrieve the actual value of the field.
    
    The default implementation will simply retrieve the value attribute from
    the first input tag in the receiver view.
    
    @returns {String} value
  */
  getFieldValue: function() {
    return this.$input().val();
  },

  /**
    Your class should call this method anytime you think the value of the 
    input element may have changed.  This will retrieve the value and update
    the value property of the view accordingly.
    
    If this is a partial change (i.e. the user is still editing the field and
    you expect the value to change further), then be sure to pass YES for the
    partialChange parameter.  This will change the kind of validation done on
    the value.  Otherwise, the validator may make the field as having an error
    when the user is still in mid-edit.
  
    @param partialChange (optional) YES if this is a partial change.
    @returns {Boolean|SC.Error} result of validation.
  */
  fieldValueDidChange: function(partialChange) {

    // get the field value and set it.
    // if ret is an error, use that instead of the field value.
    var ret = this.performValidate ? this.performValidate(partialChange) : YES;
    if (ret === SC.Validator.NO_CHANGE) return ret ;

    this.propertyWillChange('fieldValue');

    // if the validator says everything is OK, then in addition to posting
    // out the value, go ahead and pass the value back through itself.
    // This way if you have a formatter applied, it will reformat.
    //
    // Do this BEFORE we set the value so that the valueObserver will not
    // overreact.
    //
    var ok = SC.$ok(ret);
    var value = ok ? this._field_getFieldValue() : ret ;
    if (!partialChange && ok) this._field_setFieldValue(value) ;
    if (value != this.get('value')) this.set('value',value) ;
    
    this.propertyDidChange('fieldValue');
    
    return ret ;
  },
  
  // PRIVATE SUPPORT METHODS
  //
  init: function() {
    sc_super();
    this.valueDidChange(); // update field value also...
    SC.Event.add(this.$input(), 'change', this, this.fieldValueDidChange) ;
  },
  
  destroy: function() {
    sc_super();
    SC.Event.remove(this.$input(), 'change', this, this.fieldValueDidChange); 
  },

  /**
    Allow the browser to do its normal event handling for the mouse down
    event.  But first, set isActive to YES.
  */
  mouseDown: function(evt) { 
    if (this.get('isEnabled')) {
      this.set('isActive', YES); 
      this._field_isMouseDown = YES;
    }
    evt.allowDefault(); 
    return YES; 
  },

  /** @private
    Remove the active class on mouseOut if mouse is down.
  */  
  mouseOut: function(evt) {
    if (this._field_isMouseDown) this.set('isActive', NO);
    evt.allowDefault();
    return YES;
  },

  /** @private
    If mouse was down and we renter the button area, set the active state again.
  */  
  mouseOver: function(evt) {
    this.set('isActive', this._field_isMouseDown);
    evt.allowDefault();
    return YES;
  },

  _field_isMouseDown: NO,
  
  /** @private
    on mouse up, remove the isActive class and then allow the browser to do
    its normal thing.
  */  
  mouseUp: function(evt) {
    // track independently in case isEnabled has changed
    if (this._field_isMouseDown) this.set('isActive', NO); 
    this._field_isMouseDown = false;
    evt.allowDefault();
    return YES ;
  },
  
  // called whenever the value is set on the object.  Will set the value
  // on the field if the value is changed.
  valueDidChange: function() {
    var value = this.get('value') ;
    var isError = SC.typeOf(value) === SC.T_ERROR ;
    if (!isError && (value !== this._field_getFieldValue())) {
      this._field_setFieldValue(value) ;
    } 
  }.observes('value'),
  
  // these methods use the validator to convert the raw field value returned
  // by your subclass into an object and visa versa.
  _field_setFieldValue: function(newValue) {
    if (this.fieldValueForObject) {
      newValue = this.fieldValueForObject(newValue) ;
    }
    return this.setFieldValue(newValue) ;
  },
  
  _field_getFieldValue: function() {
    var ret = this.getFieldValue() ;
    if (this.objectForFieldValue) ret=this.objectForFieldValue(ret);
    return ret ;
  }
  
}) ;


