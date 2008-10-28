// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('views/field/field') ;
require('mixins/editable') ;

/**
  @class
  
  A text field is an input element with type "text".  This view adds support
  for hinted values, etc.
  
  @extends SC.FieldView
  @extends SC.Editable
  @author Charles Jolley
*/
SC.TextFieldView = SC.FieldView.extend(SC.Editable,
/** @scope SC.TextFieldView.prototype */ {
  
  emptyElement: '<input type="text" value="" />',

  // PROPERTIES

  /**
    The hint to display while the field is not active.  Can be a loc key.
  */  
  hint: null,
  
  /**
    automatically set to YES if the hint is currently showing.
  */
  isHintShowing: false,

  /**
    If YES then the text field is currently editing. 
  */
  isEditing: NO,

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

  /**
    tied to the isEnabled state
  */
  acceptsFirstResponder: function() {
    return this.get('isEnabled');
  }.property('isEnabled'),
  
  // First Responder
  // When we become first responder, make sure the field gets focus and
  // the hint value is hidden if needed.

  // when we become first responder, focus the text field if needed and
  // hide the hint text.
  /** @private */
  didBecomeFirstResponder: function() {

    // focus the text field.
    if (!this._isFocused) {
      this._isFocused = true ;
      if (this.get('isVisibleInWindow')) {
        this.rootElement.focus();
		    this.invokeLater(this._selectRootElement, 1) ;
      }
    }

    // hide the hint text if it is showing.
    this._updateFieldHint() ;
  },

  // In IE, you can't modify functions on DOM elements so we need to wrap the 
  // call to select() like this.
  _selectRootElement: function() {
	this.rootElement.select() ;
  },

  // when we lose first responder, blur the text field if needed and show
  // the hint text if needed.
  /** @private */
  willLoseFirstResponder: function() {
    
    if (this._isFocused) {
      this._isFocused = false ;
      this._updateFieldHint() ;
      return this.rootElement.blur() ;
    } else {
      this._value = this.rootElement.value ;
      this.fieldValueDidChange() ;
      this._updateFieldHint() ;
      return true;
    }
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
  /** @private */
  getFieldValue: function() {
    return this._value ;
  },
  
  /** @private */
  setFieldValue: function(value) {
    if (this._value == value) return ;
    this._value = value ;
    this._updateFieldHint() ;
  },
  
  /** @private */
  mouseDown: function(e)
  {
    e._stopWhenHandled = false;
    return false;
  },
  
  // trap key-press events and notify as needed.
  /** @private */
  keyDown: function(evt) {
    if (this._value != this.rootElement.value) {
      this._value = this.rootElement.value ;
      this.fieldValueDidChange(true) ;
    }
    
    return this.interpretKeyEvents(evt); // start bubbling key events...
    //return false;
  },
  
  /** @private */
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
      
      if(SC.isIE()){
        var selector = function() {
          Element.select(arguments.callee.it);
        };
        selector.it = this.rootElement;
        setTimeout(selector,0.05);
      } else{
        this.rootElement.select.bind(this.rootElement).delay(0.05);  
      }
    }
  }.observes('isVisibleInWindow'),
  
  // THESE ARE DUMMY IMPLEMENTATIONS OF THE REPONDER METHODS FOR KEYBOARD
  // ACTIONS HANDLED BY THE BROWSER.  This avoids having the responder 
  // bubble up these items.

  /** @private */
  deleteBackward: function(evt) { evt._stopWhenHandled = false; return true; },

  /** @private */
  deleteForward: function(evt) { evt._stopWhenHandled = false; return true; },

  /** @private */
  moveLeft: function(evt) { evt._stopWhenHandled = false; return true; },

  /** @private */
  moveRight: function(evt) { evt._stopWhenHandled = false; return true; },

  /** @private */
  moveUp: function(evt) { evt._stopWhenHandled = false; return true; },

  /** @private */
  moveDown: function(evt) { evt._stopWhenHandled = false; return true; },

  /** @private */
  moveLeftAndModifySelection: function(evt) { evt._stopWhenHandled = false; return true; },

  /** @private */
  moveRightAndModifySelection: function(evt) { evt._stopWhenHandled = false; return true; },

  /** @private */
  moveUpAndModifySelection: function(evt) { evt._stopWhenHandled = false; return true; },

  /** @private */
  moveDownAndModifySelection: function(evt) { evt._stopWhenHandled = false; return true; },

  /** @private */
  moveToBeginningOfDocument: function(evt) { evt._stopWhenHandled = false; return true; },

  /** @private */
  moveToEndOfDocument: function(evt) { evt._stopWhenHandled = false; return true; },
  
  /** @private */
  selectAll: function(evt) { evt._stopWhenHandled = false; return true; }
  
}) ;
