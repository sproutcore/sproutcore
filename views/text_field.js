// ========================================================================
// SproutCore
// copyright 2006-2007 Sprout Systems, Inc.
// ========================================================================

require('views/field') ;

// A text field is an input element with type "text".  This view adds support
// for hinted values, etc.
SC.TextFieldView = SC.FieldView.extend({
  
  emptyElement: '<input type="text" value="" />',

  // PROPERTIES
  // set this property to the hinted value.
  hint: null,
  
  // automatically set by text field if the hint is current showing.
  isHintShowing: false,


  // PRIVATE SUPPORT METHODS
  init: function() {
    
    // compatibility...
    if (this.hint == null) {
      this.hint = this.rootElement.getAttribute('hint') ;
    }

    if (this.validator == null) {
      this.validator = this.rootElement.getAttribute('validate') ;
    }

    arguments.callee.base.call(this) ;
    
    // observe important events for this field.
    var focusListener = this._fieldDidFocus.bindAsEventListener(this) ;
    Event.observe(this.rootElement, 'focus', focusListener) ;

    var blurListener = this._fieldDidBlur.bindAsEventListener(this) ;
    Event.observe(this.rootElement, 'blur', blurListener) ;

    this._updateFieldHint() ;
  },


  // FOCUS AND BLUR EVENTS -
  // These should be hooked into the firstResponder system..
  _fieldDidFocus: function() {
    if (!this._isFocused) {
      this._isFocused = true ;
      this.becomeFirstResponder() ;
    }
  },
  
  _fieldDidBlur: function() {
    if (this._isFocused) {
      this._isFocused = false ;
      this.resignFirstResponder() ;
    }
  },
  
  acceptsFirstResponder: function() {
    return this.get('isEnabled');
  }.property('isEnabled'),
  
  // First Responder
  // When we become first responder, make sure the field gets focus and
  // the hint value is hidden if needed.

  // when we become first responder, focus the text field if needed and
  // hide the hint text.
  didBecomeFirstResponder: function() {

    // focus the text field.
    if (!this._isFocused) {
      this._isFocused = true ;
      if (this.get('isVisibleInWindow')) {
        this.rootElement.focus();
        this.rootElement.select.bind(this.rootElement).delay(0.05);
      }
    }

    // hide the hint text if it is showing.
    this._updateFieldHint() ;
  },

  // when we lose first responder, blur the text field if needed and show
  // the hint text if needed.
  willLoseFirstResponder: function() {
    
    if (this._isFocused) {
      this._isFocused = false ;
      return this.rootElement.blur() ;
    }
    
    this._value = this.rootElement.value ;
    this.fieldValueDidChange() ;
    this._updateFieldHint() ;
  },
  
  _isFocused: false,
  
  _updateFieldHint: function() {
    
    // show the hint if:
    // - flag is true
    // - hint != null or empty.
    // - this._value = null or empty.
    var hint = this.get('hint') ;
    var showHint = !!(!this._isFocused && ((this._value == null) || this._value == '') && (hint)) ;
    
    this.setClassName('show-hint', showHint);
    this.rootElement.value = (showHint) ? hint : (this._value || '') ;
    this.set('isHintShowing', showHint);
  },
  
  // field value updates...
  getFieldValue: function() {
    return this._value ;
  },
  
  setFieldValue: function(value) {
    if (this._value == value) return ;
    this._value = value ;
    this._updateFieldHint() ;
  },
  
  mouseDown: function(e)
  {
    e._stopWhenHandled = false;
    return false;
  },
  
  // trap key-press events and notify as needed.
  keyDown: function(evt) {
    if (this._value != this.rootElement.value) {
      this._value = this.rootElement.value ;
      this.fieldValueDidChange(true) ;
    }
    
    return this.interpretKeyEvents(evt); // start bubbling key events...
    //return false;
  },
  
  keyUp: function() {
    if (this._value != this.rootElement.value) {
      this._value = this.rootElement.value ;
      this.fieldValueDidChange(true) ;
    }
  },

  // if make a text field first responder before the view becomes visible,
  // then focus the text field when it does become visible.
  _focusOnVisible: function() {
    if (this.get('isVisibleInWindow') && this._isFocused) {
      this.rootElement.focus() ;
      this.rootElement.select.bind(this.rootElement).delay(0.05);
    }  
  }.observes('isVisibleInWindow'),
  
  // THESE ARE DUMMY IMPLEMENTATIONS OF THE REPONDER METHODS FOR KEYBOARD
  // ACTIONS HANDLED BY THE BROWSER.  This avoids having the responder 
  // bubble up these items.
  deleteBackward: function(evt) { evt._stopWhenHandled = false; return true; },
  deleteForward: function(evt) { evt._stopWhenHandled = false; return true; },
  moveLeft: function(evt) { evt._stopWhenHandled = false; return true; },
  moveRight: function(evt) { evt._stopWhenHandled = false; return true; },
  moveUp: function(evt) { evt._stopWhenHandled = false; return true; },
  moveDown: function(evt) { evt._stopWhenHandled = false; return true; },
  moveLeftAndModifySelection: function(evt) { evt._stopWhenHandled = false; return true; },
  moveRightAndModifySelection: function(evt) { evt._stopWhenHandled = false; return true; },
  moveUpAndModifySelection: function(evt) { evt._stopWhenHandled = false; return true; },
  moveDownAndModifySelection: function(evt) { evt._stopWhenHandled = false; return true; },
  moveToBeginningOfDocument: function(evt) { evt._stopWhenHandled = false; return true; },
  moveToEndOfDocument: function(evt) { evt._stopWhenHandled = false; return true; },
  selectAll: function(evt) { evt._stopWhenHandled = false; return true; }
  
}) ;
