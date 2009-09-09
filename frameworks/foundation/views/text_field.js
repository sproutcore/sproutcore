// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

sc_require('views/field') ;
sc_require('system/text_selection') ;
sc_require('mixins/static_layout') ;

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
    If YES, the field will hide its text from display. The default value is NO.
  */
  isPassword: NO,

  /**
    If YES then allow multi-line input.  This will also change the default
    tag type from "input" to "textarea".  Otherwise, pressing return will
    trigger the default insertion handler.
  */
  isTextArea: NO,

  /**
    The hint to display while the field is not active.  Can be a loc key.
  */
  hint: null,

  /**
    If YES then the text field is currently editing.
  */
  isEditing: NO,

  /**
    An optional view instance, or view class reference, which will be visible
    on the left side of the text field.  Visually the accessory view will look
    to be inside the field but the text editing will not overlap the accessory
    view.

    The view will be rooted to the top-left of the text field.  You should use
    a layout with 'left' and/or 'top' specified if you would like to adjust
    the offset from the top-left.

    One example use would be for a web site's icon, found to the left of the
    URL field, in many popular web browsers.

    Note:  If you set a left accessory view, the left padding of the text
    field (really, the left offset of the padding element) will automatically
    be set to the width of the accessory view, overriding any CSS you may have
    defined on the "padding" element.  If you would like to customize the
    amount of left padding used when the accessory view is visible, make the
    accessory view wider, with empty space on the right.
  */
  leftAccessoryView: null,

  /**
    An optional view instance, or view class reference, which will be visible
    on the right side of the text field.  Visually the accessory view will
    look to be inside the field but the text editing will not overlap the
    accessory view.

    The view will be rooted to the top-right of the text field.  You should
    use a layout with 'right' and/or 'top' specified if you would like to
    adjust the offset from the top-right.  If 'left' is specified in the
    layout it will be cleared.

    One example use would be for a button to clear the contents of the text
    field.

    Note:  If you set a right accessory view, the right padding of the text
    field (really, the right offset of the padding element) will automatically
    be set to the width of the accessory view, overriding any CSS you may have
    defined on the "padding" element.  If you would like to customize the
    amount of right padding used when the accessory view is visible, make the
    accessory view wider, with empty space on the left.
  */
  rightAccessoryView: null,


  /** isEditable maps to isEnabled with a TextField. */
  isEditable: function() {
    return this.get('isEnabled') ;
  }.property('isEnabled').cacheable(),


  /**
    The current selection of the text field, returned as an SC.TextSelection
    object.

    Note that if the selection changes a new object will be returned -- it is
    not the case that a previously-returned SC.TextSelection object will
    simply have its properties mutated.

    @property {SC.TextSelection}
  */
  selection: function(key, value) {
    var element = this.$input().get(0) ;

    // Are we being asked to set the value, or return the current value?
    if (value === undefined) {
      // The client is retrieving the value.
      if (element) {
        var start = null, end = null ;

        if (!element.value) {
          start = end = 0 ;
        }
        else {
          // In IE8, input elements don't have hasOwnProperty() defined.
          if ('selectionStart' in element) {
            start = element.selectionStart ;
          }
          if ('selectionEnd' in element) {
            end = element.selectionEnd ;
          }

          // Support Internet Explorer.
          if (start === null  ||  end === null ) {
            var selection = document.selection ;
            if (selection) {
              var type = selection.type ;
              if (type  &&  (type === 'None'  ||  type === 'Text')) {
                var range = selection.createRange() ;

                if (!this.get('isTextArea')) {
                  // Input tag support.  Figure out the starting position by
                  // moving the range's start position as far left as possible
                  // and seeing how many characters it actually moved over.
                  var length = range.text.length ;
                  start = Math.abs(range.moveStart('character', 0 - (element.value.length + 1))) ;
                  end = start + length ;
                }
                else {
                  // Textarea support.  Unfortunately, this case is a bit more
                  // complicated than the input tag case.  We need to create a
                  // "dummy" range to help in the calculations.
                  var dummyRange = range.duplicate() ;
                  dummyRange.moveToElementText(element) ;
                  dummyRange.setEndPoint('EndToStart', range) ;
                  start = dummyRange.text.length ;
                  end = start + range.text.length ;
                }
              }
            }
          }
        }
        return SC.TextSelection.create({ start:start, end:end }) ;
      }
      else {
        return null;
      }
    }
    else {
      // The client is setting the value.  Make sure the new value is a text
      // selection object.
      if (!value  ||  !value.kindOf  ||  !value.kindOf(SC.TextSelection)) {
        throw "When setting the selection, you must specify an SC.TextSelection instance.";
      }

      if (element) {
        var setStart, setEnd ;

        // In IE8, input elements don't have hasOwnProperty() defined.  Also,
        // in Firefox 3.5, trying to get the selectionStart / selectionEnd
        // properties at certain times can cause exceptions.
        if ('selectionStart' in element) {
         element.selectionStart = value.get('start') ;
         setStart = YES ;
        }
        if ('selectionEnd' in element) {
         element.selectionEnd = value.get('end') ;
         setEnd = YES ;
        }

        // Support Internet Explorer.
        if (!setStart  ||  !setEnd) {
         var range = element.createTextRange() ;
         var start = value.get('start') ;
         range.move('character', start) ;
         range.moveEnd('character', value.get('end') - start) ;
         range.select() ;
        }
      }
    }

    // Implementation note:
    // There are certain ways users can add/remove text that we can't identify
    // via our key/mouse down/up handlers (such as the user choosing Paste
    // from a menu).  So that's why we need to update our 'selection' property
    // whenever the field's value changes.
  }.property('fieldValue').cacheable(),



  // ..........................................................
  // INTERNAL SUPPORT
  //

  displayProperties: 'hint fieldValue isEditing leftAccessoryView rightAccessoryView isTextArea'.w(),


  createChildViews: function() {
    this.accessoryViewObserver() ;
  },


  accessoryViewObserver: function() {
    var classNames;
    var viewProperties = ['leftAccessoryView', 'rightAccessoryView'] ;
    var len = viewProperties.length ;
    for (var i=0; i<len; i++) {
      var viewProperty = viewProperties[i] ;

      // Is there an accessory view specified?
      var previousView = this['_'+viewProperty] ;
      var accessoryView = this.get(viewProperty) ;

      // If the view is the same, there's nothing to do.  Otherwise, remove
      // the old one (if any) and add the new one.
      if (! (previousView
             &&  accessoryView
             &&  (previousView === accessoryView) ) ) {

        // If there was a previous previous accessory view, remove it now.
        if (previousView) {
          // Remove the "sc-text-field-accessory-view" class name that we had
          // added earlier.
          classNames = previousView.get('classNames') ;
          classNames = classNames.without('sc-text-field-accessory-view') ;
          previousView.set('classNames', classNames) ;
          this.removeChild(previousView) ;
          previousView = null ;
          this['_'+viewProperty] = null ;
        }

        // If there's a new accessory view to add, do so now.
        if (accessoryView) {
          // If the user passed in a class rather than an instance, create an
          // instance now.
          if (accessoryView.isClass) {
            accessoryView = accessoryView.create({
              layoutView: this
            }) ;
          }

          // Add in the "sc-text-field-accessory-view" class name so that the
          // z-index gets set correctly.
          classNames = accessoryView.get('classNames') ;
          var className = 'sc-text-field-accessory-view' ;
          if (classNames.indexOf(className) < 0) {
            classNames.push(className) ;
          }

          // Actually add the view to our hierarchy and cache a reference.
          this.appendChild(accessoryView) ;
          this['_'+viewProperty] = accessoryView ;
        }
      }
    }
  }.observes('leftAccessoryView', 'rightAccessoryView'),


  layoutChildViewsIfNeeded: function(isVisible) {
    // For the right accessory view, adjust the positioning such that the view
    // is right-justified, unless 'right' is specified.
    if (!isVisible) isVisible = this.get('isVisibleInWindow') ;
    if (isVisible && this.get('childViewsNeedLayout')) {
      var rightAccessoryView = this.get('rightAccessoryView') ;
      if (rightAccessoryView  &&  rightAccessoryView.get) {
        var layout = rightAccessoryView.get('layout') ;
        if (layout) {
          // Clear out any 'left' value.
          layout.left = null;

          // Unless the user specified a 'right' value, specify a default to
          // right-justify the view.
          if (!layout.right) layout.right = 0 ;

          rightAccessoryView.adjust({ layout: layout }) ;
        }
      }
    }

    sc_super() ;
  },


  render: function(context, firstTime) {
    sc_super() ;

    var disabled = this.get('isEnabled') ? '' : 'disabled="disabled"';
    var name = SC.guidFor(this);
    var type = this.get('isPassword') ? 'password' : 'text';

    if (this.get('isTextArea')) context.addClass('text-area');

    // always have at least an empty string
    var v = this.get('fieldValue');
    if (SC.none(v)) v = '';

    // update layer classes always
    context.setClass('not-empty', v.length > 0);

    // If we have accessory views, we'll want to update the padding on the
    // hint to compensate for the width of the accessory view.  (It'd be nice
    // if we could add in the original padding, too, but there's no efficient
    // way to do that without first rendering the element somewhere on/off-
    // screen, and we don't want to take the performance hit.)
    var accessoryViewWidths = this._getAccessoryViewWidths() ;
    var leftAdjustment  = accessoryViewWidths['left'] ;
    var rightAdjustment = accessoryViewWidths['right'] ;

    if (leftAdjustment)  leftAdjustment  += 'px' ;
    if (rightAdjustment) rightAdjustment += 'px' ;

    this._renderField(context, firstTime, v, leftAdjustment, rightAdjustment) ;
  },

  _renderField: function(context, firstTime, value, leftAdjustment, rightAdjustment) {
    // TODO:  The cleanest thing might be to create a sub- rendering context
    //        here, but currently SC.RenderContext will render sibling
    //        contexts as parent/child.
    var hint = this.get('hint') ;
    
    if (firstTime) {
      var disabled = this.get('isEnabled') ? '' : 'disabled="disabled"' ;
      var name = SC.guidFor(this) ;
      
      context.push('<span class="border"></span>');

      // Render the padding element, with any necessary positioning
      // adjustments to accommodate accessory views.
      var adjustmentStyle = '' ;
      if (leftAdjustment  ||  rightAdjustment) {
        adjustmentStyle = 'style="' ;
        if (leftAdjustment)  adjustmentStyle += 'left: '  + leftAdjustment  + '; ' ;
        if (rightAdjustment) adjustmentStyle += 'right: ' + rightAdjustment + ';' ;
        adjustmentStyle += '"' ;
      }
      context.push('<span class="padding" %@>'.fmt(adjustmentStyle));
      
      // Render the hint.
      context.push('<span class="sc-hint">', hint, '</span>') ;
      
      // Render the input/textarea field itself, and close off the padding.
      if (this.get('isTextArea')) {
        context.push('<textarea name="%@" %@ value="%@"></textarea></span>'.fmt(name, disabled, value)) ;
      }
      else {
        var type = this.get('isPassword') ? 'password' : 'text' ;
        context.push('<input type="%@" name="%@" %@ value="%@"/></span>'.fmt(type, name, disabled, value)) ;
      }

    }
    else {
      // If this is not first time rendering, update the hint itself since we
      // can't just blow away the text field like we might most other controls
      var hintElements = this.$('.sc-hint') ;
      if (hint !== this._textField_currentHint) {
        this._textField_currentHint = hint ;
        hintElements.text(hint) ;
      }
      
      // Enable/disable the actual input/textarea as appropriate.
      var element = this.$input()[0];
      if (element) {
        if (!this.get('isEnabled')) {
          element.disabled = 'true' ;
        }
        else {
          element.disabled = null ;
        }

        // Adjust the padding element to accommodate any accessory views.
        var paddingElement = element.parentNode;
        if (leftAdjustment) {
          if (paddingElement.style.left !== leftAdjustment) {
            paddingElement.style.left = leftAdjustment ;
          }
        }
        else {
          paddingElement.style.left = null ;
        }

        if (rightAdjustment) {
          if (paddingElement.style.right !== rightAdjustment) {
            paddingElement.style.right = rightAdjustment ;
          }
        }
        else {
          paddingElement.style.right = null ;
        }


        // Firefox needs a bit of help to recalculate the width of the text
        // field, if it has focus.  (Even though it's set to 100% of its
        // parent, if we adjust the parent it doesn't always adjust in kind.)
        if (SC.browser.mozilla) {
          element.style.width = paddingElement.clientWidth + "px";
        }
      }
    }
  },


  _getAccessoryViewWidths: function() {
    var widths = {};
    var accessoryViewPositions = ['left', 'right'] ;
    var numberOfAccessoryViewPositions = accessoryViewPositions.length ;
    for (var i = 0;  i < numberOfAccessoryViewPositions;  i++) {
      var position = accessoryViewPositions[i];
      var accessoryView = this.get(position + 'AccessoryView');
      if (accessoryView  &&  accessoryView.get) {
        var frame = accessoryView.get('frame');
        if (frame) {
          var width = frame.width;
          if (width) {
            // Also account for the accessory view's inset.
            var layout = accessoryView.get('layout');
            if (layout) {
              var offset = layout[position];
              width += offset;
            }
            widths[position] = width;
          }
        }
      }
    }
    return widths;
  },


  // ..........................................................
  // HANDLE NATIVE CONTROL EVENTS
  //

  didCreateLayer: function() {
    sc_super();

    var input = this.$input();
    SC.Event.add(input, 'focus', this, this._textField_fieldDidFocus);
    SC.Event.add(input, 'blur',  this, this._textField_fieldDidBlur);

    // There are certain ways users can select text that we can't identify via
    // our key/mouse down/up handlers (such as the user choosing Select All
    // from a menu).
    SC.Event.add(input, 'select', this, this._textField_selectionDidChange);
  },

  willDestroyLayer: function() {
    sc_super();

    var input = this.$input();
    SC.Event.remove(input, 'focus', this, this._textField_fieldDidFocus);
    SC.Event.remove(input, 'blur',  this, this._textField_fieldDidBlur);
    SC.Event.remove(input, 'select',  this, this._textField_selectionDidChange);
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
      this.beginEditing();
    }
  },

  fieldDidBlur: function() {
    //if (this._isFocused) {
      this._isFocused = NO ;
      this.commitEditing();
    //}
  },

  _applyFirefoxCursorFix: function() {
    this._applyTimer = null; // clear
    if (this._hasFirefoxCursorFix) return this;
    if (SC.browser.mozilla) {
      this._hasFirefoxCursorFix = YES ;

      var element = this.$input();
      var layer = element[0];
      var p = SC.$(layer).offset() ;
      var top    = p.top,
          left   = p.left,
          width  = layer.offsetWidth,
          height = layer.offsetHeight ;

      var style = 'position: fixed; top: %@px; left: %@px; width: %@px; height: %@px;'.fmt(top, left, width, height) ;
      element.attr('style', style) ;
    }
    return this ;
  },

  _removeFirefoxCursorFix: function() {
    if (!this._hasFirefoxCursorFix) return this;
    this._hasFirefoxCursorFix = NO ;
    if (SC.browser.mozilla) this.$input().attr('style', '') ;
    return this ;
  },

  _textField_selectionDidChange: function() {
    this.notifyPropertyChange('selection');
  },


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
      this.becomeFirstResponder();
      if (this.get('isVisibleInWindow')) {
        this.$input()[0].focus();
        this._applyFirefoxCursorFix();

        if(!this._txtFieldMouseDown){
          if(!SC.browser.safari) this.invokeOnce(this._selectRootElement) ;
          else this.invokeLater(this._selectRootElement, 1) ;
        }
      }
    }
  },

  // In IE, you can't modify functions on DOM elements so we need to wrap the
  // call to select() like this.
  _selectRootElement: function() {
    this.$input()[0].select() ;
  },

  // when we lose first responder, blur the text field if needed and show
  // the hint text if needed.
  /** @private */
  didLoseKeyResponderTo: function(keyView) {
    if (this._isFocused) {
      this._isFocused = NO ;
      this.$input()[0].blur() ;
    } else {
      this.fieldValueDidChange() ;
    }
    if(this._hasFirefoxCursorFix) this._removeFirefoxCursorFix();
  },

  parentViewDidResize: function() {
    if (SC.browser.mozilla && this.get('isFirstResponder')) {
      this._removeFirefoxCursorFix();
      if (this._applyTimer) this._applyTimer.invalidate();
      this._applyTimer = this.invokeLater(this._applyFirefoxCursorFix, 250);
    }

    sc_super();
  },

  _isFocused: false,

  /** @private
    Simply allow keyDown & keyUp to pass through to the default web browser
    implementation.
  */
  keyDown: function(evt) {

    // handle return and escape.  this way they can be passed on to the
    // responder chain.
    if ((evt.which === 13) && !this.get('isTextArea')) return NO ;
    if (evt.which === 27) return NO ;

    // handle tab key
    if (evt.which === 9 && !this.get('isMultiline')) {
      var view = evt.shiftKey ? this.get('previousValidKeyView') : this.get('nextValidKeyView');
      view.becomeFirstResponder();
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

  keyUp: function(evt) {
    // The caret/selection could have moved.  In some browsers, though, the
    // element's values won't be updated until after this event is finished
    // processing.
    this.notifyPropertyChange('selection');

    if (this._isKeyDown) {
      this.invokeLater(this.fieldValueDidChange, 1, YES); // notify change
    }
    this._isKeyDown = NO;
    evt.allowDefault();

    return YES;
  },

  mouseDown: function(evt) {
    this._txtFieldMouseDown=YES;
    if (!this.get('isEnabled')) {
      evt.stop();
      return YES;
    } else return sc_super();
  },

  mouseUp: function(evt) {
    this._txtFieldMouseDown=NO;
    // The caret/selection could have moved.  In some browsers, though, the
    // element's values won't be updated until after this event is finished
    // processing.
    this.notifyPropertyChange('selection');

    if (!this.get('isEnabled')) {
      evt.stop();
      return YES;
    } else return sc_super();
  },

  selectStart: function(evt) {
    return YES;
  }
}) ;
