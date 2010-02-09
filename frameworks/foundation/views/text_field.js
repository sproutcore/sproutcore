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

  applyImmediately: YES,

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
  
  _isFocused: NO,


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
    var element = this.$input()[0],
        range, start, end;

    // Are we being asked to set the value, or return the current value?
    if (value === undefined) {
      // The client is retrieving the value.
      if (element) {
        start = null;
        end = null;

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
                range = selection.createRange() ;

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
         range = element.createTextRange() ;
         start = value.get('start') ;
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

  acceptsFirstResponder: function() {
    return this.get('isEnabled');
  }.property('isEnabled'),


  accessoryViewObserver: function() {
    var classNames,
        viewProperties = ['leftAccessoryView', 'rightAccessoryView'],
        len = viewProperties.length , i, viewProperty, previousView, 
        accessoryView;
        
    for (i=0; i<len; i++) {
      viewProperty = viewProperties[i] ;

      // Is there an accessory view specified?
      previousView = this['_'+viewProperty] ;
      accessoryView = this.get(viewProperty) ;

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

    var disabled = this.get('isEnabled') ? '' : 'disabled="disabled"',
        name = SC.guidFor(this),
        type = this.get('isPassword') ? 'password' : 'text',
        v, accessoryViewWidths, leftAdjustment, rightAdjustment;

    if (this.get('isTextArea')) context.addClass('text-area');

    // always have at least an empty string
    v = this.get('fieldValue');
    if (SC.none(v)) v = '';
    v = String(v);

    // update layer classes always
    context.setClass('not-empty', v.length > 0);

    // If we have accessory views, we'll want to update the padding on the
    // hint to compensate for the width of the accessory view.  (It'd be nice
    // if we could add in the original padding, too, but there's no efficient
    // way to do that without first rendering the element somewhere on/off-
    // screen, and we don't want to take the performance hit.)
    accessoryViewWidths = this._getAccessoryViewWidths() ;
    leftAdjustment  = accessoryViewWidths['left'] ;
    rightAdjustment = accessoryViewWidths['right'] ;

    if (leftAdjustment)  leftAdjustment  += 'px' ;
    if (rightAdjustment) rightAdjustment += 'px' ;

    this._renderField(context, firstTime, v, leftAdjustment, rightAdjustment) ;
    if(SC.browser.mozilla) this.invokeLast(this._applyFirefoxCursorFix);
  },


  /**
    If isTextArea is changed (this might happen in inlineeditor constantly)
    force the field render to render like the firsttime to avoid writing extra
    code. This can be useful also 
  */
  _forceRenderFirstTime: NO,
    
  _renderFieldLikeFirstTime: function(){
    this.set('_forceRenderFirstTime', YES);
  }.observes('isTextArea'),
  
  _renderField: function(context, firstTime, value, leftAdjustment, rightAdjustment) {
    // TODO:  The cleanest thing might be to create a sub- rendering context
    //        here, but currently SC.RenderContext will render sibling
    //        contexts as parent/child.
    var hint = this.get('hint'), disabled, name, adjustmentStyle, type, 
        hintElements, element, paddingElementStyle;
    
    if (firstTime || this._forceRenderFirstTime) {
      this._forceRenderFirstTime = NO;
      disabled = this.get('isEnabled') ? '' : 'disabled="disabled"' ;
      name = this.get('layerId');
      
      context.push('<span class="border"></span>');

      // Render the padding element, with any necessary positioning
      // adjustments to accommodate accessory views.
      adjustmentStyle = '' ;
      if (leftAdjustment  ||  rightAdjustment) {
        adjustmentStyle = 'style="' ;
        if (leftAdjustment)  adjustmentStyle += 'left: '  + leftAdjustment  + '; ' ;
        if (rightAdjustment) adjustmentStyle += 'right: ' + rightAdjustment + ';' ;
        adjustmentStyle += '"' ;
      }
      context.push('<span class="padding" %@>'.fmt(adjustmentStyle));
      
      // Render the hint.
      context.push('<span class="sc-hint">', hint, '</span>') ;
      value = this.get('escapeHTML')?SC.RenderContext.escapeHTML(value):value; 
      // Render the input/textarea field itself, and close off the padding.
      if (this.get('isTextArea')) {
        context.push('<textarea name="', name, '" ', disabled, '>', value, '</textarea></span>') ;
      }
      else {
        type = this.get('isPassword') ? 'password' : 'text' ;
        context.push('<input type="', type,'" name="', name, '" ', disabled, ' value="', value,'"/></span>') ;
      }

    }
    else {
      // If this is not first time rendering, update the hint itself since we
      // can't just blow away the text field like we might most other controls
      hintElements = this.$('.sc-hint') ;
      if (hint !== this._textField_currentHint) {
        this._textField_currentHint = hint ;
        hintElements.text(hint) ;
      }
      
      // Enable/disable the actual input/textarea as appropriate.
      element = this.$input()[0];
      if (element) {
        if (!this.get('isEnabled')) {
          element.disabled = 'true' ;
        }
        else {
          element.disabled = null ;
        }

        // Adjust the padding element to accommodate any accessory views.
        paddingElementStyle = element.parentNode.style;
        if (leftAdjustment) {
          if (paddingElementStyle.left !== leftAdjustment) {
            paddingElementStyle.left = leftAdjustment ;
          }
        }
        else {
          paddingElementStyle.left = null ;
        }

        if (rightAdjustment) {
          if (paddingElementStyle.right !== rightAdjustment) {
            paddingElementStyle.right = rightAdjustment ;
          }
        }
        else {
          paddingElementStyle.right = null ;
        }
      }
    }
  },


  _getAccessoryViewWidths: function() {
    var widths = {},
        accessoryViewPositions = ['left', 'right'],
        numberOfAccessoryViewPositions = accessoryViewPositions.length, i,
        position, accessoryView, frames, width, layout, offset, frame;
    for (i = 0;  i < numberOfAccessoryViewPositions;  i++) {
      position = accessoryViewPositions[i];
      accessoryView = this.get(position + 'AccessoryView');
      if (accessoryView  &&  accessoryView.get) {
        frame = accessoryView.get('frame');
        if (frame) {
          width = frame.width;
          if (width) {
            // Also account for the accessory view's inset.
            layout = accessoryView.get('layout');
            if (layout) {
              offset = layout[position];
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
    // For some strange reason if we add focus/blur events to textarea
    // inmediately they won't work. However if I add them at the end of the
    // runLoop it works fine.
    if(this.get('isTextArea')) this.invokeLast(this._addTextAreaEvents);
    else this._addTextAreaEvents();
  },
  
  _addTextAreaEvents: function() {
    var input = this.$input();
    SC.Event.add(input, 'focus', this, this._textField_fieldDidFocus);
    SC.Event.add(input, 'blur',  this, this._textField_fieldDidBlur);
    
    // There are certain ways users can select text that we can't identify via
    // our key/mouse down/up handlers (such as the user choosing Select All
    // from a menu).
    SC.Event.add(input, 'select', this, this._textField_selectionDidChange);
        
    if(SC.browser.mozilla){
      // cache references to layer items to improve firefox hack perf
      this._cacheInputElement = this.$input();
      this._cachePaddingElement = this.$('.padding');
    }
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
    this.beginEditing();
  },
  
  fieldDidBlur: function() {
    this.commitEditing();
  },

  /**
    Move magic number out so it can be over-written later in inline editor
  */
  _topOffsetForFirefoxCursorFix: 3,

  _applyFirefoxCursorFix: function() {
    // Be extremely careful changing this code.  !!!!!!!! 
    // Contact me if you need to change or improve the code. After several 
    // iterations the new way to apply the fix seems to be the most 
    // consistent.
    // This fixes: selection visibility, cursor visibility, and the ability 
    // to fix the cursor at any position. As of FF 3.5.3 mozilla hasn't fixed this 
    // bug, even though related bugs that I've found on their database appear
    // as fixed.  
    
    // UPDATE: Things seem to be working on FF3.6 therefore we are disabling the
    // hack for the latest versions of FF.
    // 
    // Juan Pinzon
    
    if (parseFloat(SC.browser.mozilla)<1.9 && !this.get('useStaticLayout')) {
      var top, left, width, height, p, layer, element, textfield;
      
      // I'm caching in didCreateLayer this elements to improve perf
      element = this._cacheInputElement;
      textfield = this._cachePaddingElement;
      if(textfield && textfield[0]){
        layer = textfield[0];
        p = SC.$(layer).offset() ;
      
        // this is to take into account an styling issue.
        // this is counterproductive in FF >= 3.6
        if(SC.browser.compareVersion(1,9,2) < 0 && 
           element[0].tagName.toLowerCase()==="input") {
          top = p.top+this._topOffsetForFirefoxCursorFix; 
        }
        else top = p.top;
        left = p.left;
        width = layer.offsetWidth;
        height = layer.offsetHeight ;
      
        var style = 'position: fixed; top: %@px; left: %@px; width: %@px; height: %@px;'.fmt(top, left, width, height) ;
        // if the style is the same don't re-apply
        if(!this._prevStyle || this._prevStyle!=style) element.attr('style', style) ;
        this._prevStyle = style;
      }
    }
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
    if(this.get('isVisibleInWindow')) {
      var inp = this.$input()[0];
      if(inp) inp.focus();
      
      if(!this._txtFieldMouseDown){
        if(SC.browser.mozilla) this.invokeOnce(this._selectRootElement) ;
        else if(SC.browser.safari) this.invokeLater(this._selectRootElement, 1) ; 
        else this._selectRootElement();
      }
    }
  },
  
  willLoseKeyResponderTo: function(responder) {
    //if (this._isFocused) this._isFocused = NO ;
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
    this.$input()[0].blur() ;
  },

  parentViewDidResize: function() {
    if (SC.browser.mozilla) {
      this.invokeLast(this._applyFirefoxCursorFix);
    }
    sc_super();
  },


  /** @private
    Simply allow keyDown & keyUp to pass through to the default web browser
    implementation.
  */
  keyDown: function(evt) {
    // Handle return and escape.  this way they can be passed on to the
    // responder chain.
    // If the event is triggered by a return while entering IME input,
    // don't got through this path.
    if ((evt.which === 13 && !evt.isIMEInput) && !this.get('isTextArea')) return NO ;
    if (evt.which === 27) return NO ;

    // handle tab key
    if (evt.which === 9) {
      var view = evt.shiftKey ? this.get('previousValidKeyView') : this.get('nextValidKeyView');
      if(view) view.becomeFirstResponder();
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

  keyUp: function(evt) {
    // The caret/selection could have moved.  In some browsers, though, the
    // element's values won't be updated until after this event is finished
    // processing.
    this.notifyPropertyChange('selection');

    if (this._isKeyDown && this.get('applyImmediately')) {
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
    } else if((this.value && this.value.length===0) || !this.value) {
      this.$input()[0].focus();
      return YES;
    } else {
      // This fixes the double click issue in firefox
      if(!SC.browser.safari) this.$input()[0].focus();
      return sc_super();
    }
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
    } else if((this.value && this.value.length===0) || !this.value) {
      if(SC.browser.msie<8){
        this.invokeLater(this.focusIE7, 1);
      }else{
        this.$input()[0].focus();
      }
      return YES;
    } else return sc_super();
  },

  focusIE7: function (){
    this.$input()[0].focus();
  },

  selectStart: function(evt) {
    return YES;
  }
}) ;
