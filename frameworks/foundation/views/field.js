// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('views/view') ;
sc_require('mixins/control') ;
sc_require('mixins/validatable') ;

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
/** @scope SC.FieldView.prototype */ {
  
  /**
     If YES then we use textarea instead of input. 
     WARNING: Use only with textField** Juan
  */
  isTextArea: NO,

  _field_isMouseDown: NO,

  /**
    The raw value of the field itself.  This is computed from the 'value'
    property by passing it through any validator you might have set.  This is 
    the value that will be set on the field itself when the view is updated.
    
    @property {String}
  */  
  fieldValue: function() {
    return this.getFieldValue();
  }.property().cacheable(),

  // ..........................................................
  // PRIMITIVES
  // 
  
  /**
    Override to return an CoreQuery object that selects the input elements
    for the view.  If this method is defined, the field view will 
    automatically edit the attrbutes of the input element to reflect the 
    current isEnabled state among other things.
  */
  $input: function() { 
    if(this.get('isTextArea')){
      return this.$('textarea').andSelf().filter('textarea'); 
    }else{
      return this.$('input').andSelf().filter('input');
    }
  },
  
  /**
    Override to set the actual value of the field.
    
    The default implementation will simple copy the newValue to the value
    attribute of any input tags in the receiver view.  You can override this
    method to provide specific functionality needed by your view.
    
    @param {Object} newValue the value to display.
    @returns {SC.FieldView} receiver
  */
  setFieldValue: function(newValue) {
    if (SC.none(newValue)) newValue = '' ;
    var input = this.$input();

    // Don't needlessly set the element if it already has the value, because
    // doing so moves the cursor to the end in some browsers.
    if (input.val() !== newValue) {
      input.val(newValue);
    }

    this.notifyPropertyChange('fieldValue'); // invalidate 'fieldValue' cache

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
    Helper function to fetch raw text from the text field, transform it
    into a value, and validate that value.
  */
  getValidatedValueFromFieldValue: function(isPartial) {
    var fieldValue = this.getFieldValue(); // get raw text
    var value = this.objectForFieldValue(fieldValue); // optionally transform to value object
    return this.performValidate(value, isPartial); // validate the transformed value
  },
  
  /**
    Helper function to transform a value to its textual representation
    and write it to the text field.
  */
  applyValueToField: function(value) {
    value = (SC.typeOf(value) === SC.T_ERROR) ? value.get('errorValue') : value;
    value = this.fieldValueForObject(value); // get text representation of 'value'
    this.setFieldValue(value); // set field text
  },  

  _field_fieldValueDidChange: function(evt) {
    SC.RunLoop.begin();
    this.fieldValueDidChange(NO);
    SC.RunLoop.end();  
  },

  /**
    Your class should call this method anytime you think the value of the 
    input element may have changed.  This will retrieve the value and update
    the value property of the view accordingly.
    
    If this is a partial change (i.e. the user is still editing the field and
    you expect the value to change further), then be sure to pass YES for the
    partialChange parameter.  This will change the kind of validation done on
    the value.  Otherwise, the validator may mark the field as having an error
    when the user is still in mid-edit.
  
    @param partialChange (optional) YES if this is a partial change.
    @returns {Boolean|SC.Error} result of validation.
  */
  fieldValueDidChange: function(isPartial) {
    // collect the field value and convert it back to a validated value
    var value = this.getValidatedValueFromFieldValue(isPartial);
    this.setIfChanged('value', value);

    // if we've transformed the value at all, give the text field a chance
    // to sync the textual representation of it
    this.applyValueToField(value);
  },

  // ..........................................................
  // INTERNAL SUPPORT
  // 
  
  /** @private
    invoked when the value property changes.  Sets the field value...
  */
  _field_valueDidChange: function() {
    this.applyValueToField(this.get('value'));
  }.observes('value'),

  /** @private
    after the layer is created, set the field value and observe events
  */
  didCreateLayer: function() {
    this._field_valueDidChange(); // force initialization of text in $input.
    SC.Event.add(this.$input(), 'change', this, this._field_fieldValueDidChange) ;
  },

  /** @private
    after the layer is append to the doc, set the field value and observe events
    only for textarea.
  */
  didAppendToDocument: function() {
    if (this.get('isTextArea')) {
      this.applyValueToField(this.get('value'));
      SC.Event.add(this.$input(), 'change', this, this._field_fieldValueDidChange) ;
    }
  },
  
  willDestroyLayer: function() {
    SC.Event.remove(this.$input(), 'change', this, this._field_fieldValueDidChange); 
  },
  
  // ACTIONS
  // You generally do not need to override these but they may be used.
  
  // OVERRIDE IN YOUR SUBCLASS
  // Override these primitives in your subclass as required.
  
  /**
    Allow the browser to do its normal event handling for the mouse down
    event.  But first, set isActive to YES.
  */
  mouseDown: function(evt) {  
    this._field_isMouseDown = YES;
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
  
  /** @private
    on mouse up, remove the isActive class and then allow the browser to do
    its normal thing.
  */  
  mouseUp: function(evt) {
    // track independently in case isEnabled has changed
    if (this._field_isMouseDown) this.set('isActive', NO); 
    this._field_isMouseDown = NO;
    evt.allowDefault();
    return YES ;
  },
  
  /** @private
    Simply allow keyDown & keyUp to pass through to the default web browser
    implementation.
  */
  keyDown: function(evt) {

    // handle tab key
    if (evt.which === 9) {
      var view = evt.shiftKey ? this.get('previousValidKeyView') : this.get('nextValidKeyView');
      if (view) view.becomeFirstResponder();
      else evt.allowDefault();
      return YES ; // handled
    }
    
    // validate keyDown...
    if (this.performValidateKeyDown(evt)) {
      this._isKeyDown = YES ;
      evt.allowDefault(); 
    } else {
      evt.stop();
    }
    
    return YES; 
  },
  
  /** tied to the isEnabled state */
  acceptsFirstResponder: function() {
    if(!SC.SAFARI_FOCUS_BEHAVIOR) return this.get('isEnabled');
    else return NO;
  }.property('isEnabled'),
  
  willBecomeKeyResponderFrom: function(keyView) {
    // focus the text field.
    if (!this._isFocused) {
      this._isFocused = YES ;
      this.becomeFirstResponder();
      if (this.get('isVisibleInWindow')) {
        this.$input()[0].focus();
      }
    }
  },
  
  willLoseKeyResponderTo: function(responder) {
    if (this._isFocused) this._isFocused = NO ;
  }
  
});

