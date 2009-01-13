// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('views/controls/field') ;
require('views/mixins/editable') ;

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
  
  emptyElement: '<%@1><span class="sc-hint"></span><input type="text" /></%@1>',
  tagName: 'label',
  styleClass: 'sc-text-field-view',
  
  // ..........................................................
  // PROPERTIES
  // 
  
  /**
    The hint to display while the field is not active.  Can be a loc key.
  */  
  hint: null,
  
  /**
    If YES then the text field is currently editing. 
  */
  isEditing: NO,
  
  /** isEditable maps to isEnabled with a TextField. */
  isEditable: function() {
    return this.get('isEnabled') ;
  }.property('isEnabled').cacheable(),
    
  // ..........................................................
  // INTERNAL SUPPORT
  // 
  
  displayProperties: 'hint fieldValue isEditing'.w(),
  updateDisplay: function() {
    sc_super();
    
    var hint = this.get('hint');
    if (hint !== this._lastHint) {
      this._lastHint = hint ;
      this.$('.sc-hint').text(hint);
    }
    
    var v = this.getFieldValue(); // get the raw value from input
    this.$().setClass({
     'not-empty': (v && v.length>0),
     'focus': this.get('isEditing')
    });
  },

  // more efficient input
  $input: function() { return this.$('input'); },
    
  // ..........................................................
  // HANDLE NATIVE CONTROL EVENTS
  //
  
  init: function() {
    sc_super();
    var input = this.$input();
    SC.Event.add(input, 'focus', this, this.fieldDidFocus);
    SC.Event.add(input, 'blur', this, this.fieldDidBlur);
  },
  
  destroy: function() {
    var input = this.$input();
    SC.Event.remove(input, 'focus', this, this.fieldDidFocus);
    SC.Event.remove(input, 'blur', this, this.fieldDidBlur);
    return sc_super();
  },
  
  fieldDidFocus: function(evt) {
    if (!this._isFocused) {
      this._isFocused = YES ;
      
      // FireFox fix -- without this, text is shown unselected.
      // TODO: need to undo firefox fix during a scroll, live resize, or window 
      // resize and reapply on completion.
      if (SC.browser.mozilla) {
        var f = this.convertFrameToView(this.get('frame'), null) ;
        var top = f.y, left = f.x, width = f.width, height = f.height ;
        top += 1, left += 1, width -= 4, height -= 6 ; // brittle, but the layout is correct :(
        var style = 'position: fixed; top: %@px; left: %@px; width: %@px; height: %@px;'.fmt(top, left, width, height) ;
        this.$input().attr('style', style) ;
      }
      
      this.beginEditing();
    }
  },
  
  fieldDidBlur: function() {
    if (this._isFocused) {
      this._isFocused = NO ;
      if (SC.browser.mozilla) this.$input().attr('style', '') ; // undo FireFox fix
      this.commitEditing();
    }
  },
  
  /** tied to the isEnabled state */
  acceptsFirstResponder: function() {
    return this.get('isEnabled');
  }.property('isEnabled'),
    
  // First Responder
  // When we become first responder, make sure the field gets focus and
  // the hint value is hidden if needed.

  // when we become first responder, focus the text field if needed and
  // hide the hint text.
  /** @private */
  willBecomeKeyResponderFrom: function(keyView) {
     // focus the text field.
    if (!this._isFocused) {
      this._isFocused = YES ;
      if (this.get('isVisibleInWindow')) {
        this.$input().get(0).focus();
        // this.invokeLater(this._selectRootElement, 1) ;
        this.invokeOnce(this._selectRootElement) ;
      }
    }
  },
  
  // In IE, you can't modify functions on DOM elements so we need to wrap the 
  // call to select() like this.
  _selectRootElement: function() {
    this.$input().get(0).select() ;
  },
  
  // when we lose first responder, blur the text field if needed and show
  // the hint text if needed.
  /** @private */
  didLoseKeyResponderTo: function(keyView) {
    if (this._isFocused) {
      this._isFocused = NO ;
      return this.$input().get(0).blur() ;
    } else {
      this.fieldValueDidChange() ;
      return true;
    }
  },
  
  _isFocused: false,
  
  /** @private
    Simply allow keyDown & keyUp to pass through to the default web browser
    implementation.
  */
  keyDown: function(evt) { 
    
    // validate keyDown...
    if (this.performValidateKeyDown(evt)) {
      this._isKeyDown = YES ;
      evt.allowDefault(); 
    } else {
      evt.stop();
    }
    
    return YES; 
  },
  
  keyUp: function(evt) { 
    if (this._isKeyDown) {
      this.invokeLater(this.fieldValueDidChange, 1, YES); // notify change
    }
    this._isKeyDown = NO;
    evt.allowDefault(); 
    return YES; 
  },
  
  mouseDown: function(evt) {
    if (!this.get('isEnabled')) {
      evt.stop();
      return YES;
    } else return sc_super();
  },

  mouseUp: function(evt) {
    if (!this.get('isEnabled')) {
      evt.stop();
      return YES;
    } else return sc_super();
  }
  

}) ;
