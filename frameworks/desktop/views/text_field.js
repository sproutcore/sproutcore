// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/**
  @class
  
  A text field is an input element with type "text".  This view adds support
  for hinted values, etc.
  
  @extends SC.FieldView
  @extends SC.Editable
  @author Charles Jolley
*/
SC.TextFieldView = SC.FieldView.extend(SC.StaticLayout, SC.Editable,
/** @scope SC.TextFieldView.prototype */ {
  
  tagName: 'label',
  classNames: ['sc-text-field-view'],
  
  // ..........................................................
  // PROPERTIES
  // 
  
  /**
    The type of the input tag. Default is 'text', can be 'password', for example.
  */
  type: 'text',
  
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
  
  render: function(context, firstTime) {
    var disabled = this.get('isEnabled') ? '' : 'disabled="disabled"';
    var name = SC.guidFor(this);
    var hint = this.get('hint');
    var type = this.get('type');

    // always have at least an empty string
    var v = this.get('fieldValue');
    if (SC.none(v)) v = ''; 
    
    // update layer classes always
    context.setClass('not-empty', v.length>0);
    
    if (firstTime) {
      context.push('<span class="sc-hint">', hint, '</span>');
      context.push('<input type="%@" name="%@" %@ value="%@" />'.fmt(type, name, disabled, v));
      
    // if this is not first time rendering, update the hint itself since we
    // can't just blow away the text field like we might most other controls
    } else {
      if (hint !== this._textField_currentHint) {
        this._textField_currentHint = hint ;
        this.$('.sc-hint').text(hint);
      }          
    }
  },

  // more efficient input
  $input: function() { return this.$('input'); },
  
  // ..........................................................
  // HANDLE NATIVE CONTROL EVENTS
  // 
  
  didCreateLayer: function() {
    sc_super();

    var input = this.$input();
    SC.Event.add(input, 'focus', this, this._textField_fieldDidFocus);
    SC.Event.add(input, 'blur',  this, this._textField_fieldDidBlur);
  },
  
  willDestroyLayer: function() {
    sc_super();
    
    var input = this.$input();
    SC.Event.remove(input, 'focus', this, this._textField_fieldDidFocus);
    SC.Event.remove(input, 'blur',  this, this._textField_fieldDidBlur);
  },
  
  _textField_fieldDidFocus: function(evt) {
    SC.RunLoop.begin();
    this.fieldDidFocus();
    SC.RunLoop.end();
  },

  _textField_fieldDidBlur: function(evt) {
    SC.RunLoop.begin();
    this.fieldDidBlur();
    SC.RunLoop.end();
  },
  
  fieldDidFocus: function(evt) {
    if (!this._isFocused) {
      this._isFocused = YES ;
      this._applyFirefoxCursorFix();
      this.beginEditing();
    }
  },
  
  fieldDidBlur: function() {
    if (this._isFocused) {
      this._isFocused = NO ;
      this._removeFirefoxCursorFix();
      this.commitEditing();
    }
  },

  _applyFirefoxCursorFix: function() {
    if (SC.browser.mozilla) {
      var layer = this.get('layer');
      var p = SC.viewportOffset(this.get('layer')) ;
      var top    = p.y, 
          left   = p.x, 
          width  = layer.offsetWidth, 
          height = layer.offsetHeight ;

      // brittle, but the layout is correct :(
      top += 3; left += 3; width -= 6; height -= 6; 
      
      var style = 'position: fixed; top: %@px; left: %@px; width: %@px; height: %@px;'.fmt(top, left, width, height) ;
      this.$input().attr('style', style) ;
    }
  },

  _removeFirefoxCursorFix: function() {
    if (SC.browser.mozilla) this.$input().attr('style', '') ;
  },
  
  /** tied to the isEnabled state */
  acceptsFirstResponder: function() {
    return this.get('isEnabled');
  }.property('isEnabled'),
    
  // ..........................................................
  // FIRST RESPONDER SUPPORT
  // 
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
      this.$input().get(0).blur() ;
    } else {
      this.fieldValueDidChange() ;
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
