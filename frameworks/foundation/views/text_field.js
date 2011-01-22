// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('views/field') ;
sc_require('system/text_selection') ;
sc_require('mixins/static_layout') ;
sc_require('mixins/editable');

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
  isTextField: YES,

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
  hint: '',

  /**
    If YES then the text field is currently editing.
  */
  isEditing: NO,
  
  hintON:YES,
  
  /**
    If you set this property to false the tab key won't trigger its default 
    behavior (tabbing to the next field).
  */
  defaultTabbingEnabled:YES,
  
  /**
    Enabled context menu for textfields.
  */
  isContextMenuEnabled: YES,

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
  
  
  /**
    This property will enable disable HTML5 spell checking if available on the 
    browser. As of today Safari 4+, Chrome 3+ and Firefox 3+ support it  
  */
    
  spellCheckEnabled: YES,
  
  maxLength: 5096,
  
  
  _isFocused: NO,
  
  
  init:function(){
    var hintStatus = this.get('hintON'),
        val = this.get('value');
    if(!val || val && val.length===0) this.set('hintON', YES);
    else this.set('hintON', NO);
    return sc_super();
  },

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
        if (element.setSelectionRange) {
          element.setSelectionRange(value.get('start'), value.get('end')) ;
        }
        else {
          // Support Internet Explorer.
          range = element.createTextRange() ;
          start = value.get('start') ;
          range.move('character', start) ;
          range.moveEnd('character', value.get('end') - start) ;
          range.select() ;
        }
      }
      return value;
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
    sc_super();
    this.accessoryViewObserver();
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
            classNames = SC.clone(classNames);
            classNames.push(className) ;
            accessoryView.set('classNames', classNames);
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
    var v, accessoryViewWidths, leftAdjustment, rightAdjustment;

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
        hintElements, element, paddingElementStyle, fieldClassNames,
        spellCheckEnabled=this.get('spellCheckEnabled'), spellCheckString,
        maxLength = this.get('maxLength'), isOldSafari;
        
    context.setClass('text-area', this.get('isTextArea'));
    
    //Adding this to differentiate between older and newer versions of safari
    //since the internal default field padding changed 
    isOldSafari= (parseInt(SC.browser.safari,0)<532);
    context.setClass('oldWebKitFieldPadding', isOldSafari);
    
    spellCheckString = spellCheckEnabled ? ' spellcheck="true"' : ' spellcheck="false"';
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
      context.push('<span class="padding" '+adjustmentStyle+'>');
                  
      value = this.get('escapeHTML')?SC.RenderContext.escapeHTML(value):value;
      if(!this.get('_supportsPlaceHolder') && (!value || (value && value.length===0))) {
        value = this.get('hint');
        context.setClass('sc-hint', YES);
      } 
      
      //for gecko pre 1.9 vertical aligment is completely broken so we need
      //different styling.
      fieldClassNames = (SC.browser.mozilla &&
                          (parseFloat(SC.browser.mozilla)<1.9 || 
                          SC.browser.mozilla.match(/1\.9\.0|1\.9\.1/))) ?
                          "field oldGecko": "field";
      
      // Render the input/textarea field itself, and close off the padding.
      if (this.get('isTextArea')) {
        context.push('<textarea class="',fieldClassNames,'" name="', name, 
                      '" ', disabled, ' placeholder="',hint, '"',
                      spellCheckString,' maxlength="', maxLength, '">', 
                      value, '</textarea></span>') ;
      }
      else {
        type = this.get('isPassword') ? 'password' : 'text' ;
        context.push('<input class="',fieldClassNames,'" type="', type,
                      '" name="', name, '" ', disabled, ' value="', value,
                      '" placeholder="',hint,'"', spellCheckString, 
                      ' maxlength="', maxLength, '" /></span>') ;
      }

    }
    else {
      var input= this.$input();
      if(!this.get('_supportsPlaceHolder')){
        var val = this.get('value');
        if((!val || (val && val.length===0))){
          if(this.get('hintON') && !this.get('isFirstResponder')){
            //console.log('hint on render');
            context.setClass('sc-hint', YES);
            input.val(hint);
          }else{
            // console.log('removing hint on render');
            context.setClass('sc-hint', NO);
            input.val('');
          }
        }
      }else{
        input.attr('placeholder', hint);
      }
      
      // Enable/disable the actual input/textarea as appropriate.
      element = input[0];
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
      if (accessoryView) {
        // need acessoryView as an instance, not class...
        if (accessoryView.isClass) {
          accessoryView = accessoryView.create({
            layoutView: this
          });
        }
        // sanity check
        if (accessoryView.get) {
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
    if(!this.get('_supportsPlaceHolder') && this.get('hintON')){
      var currentValue = this.$input().val();
      if(!currentValue || (currentValue && currentValue.length===0)){
        // console.log('hint on didcreatelayer');
        this.$input().val(this.get('hint'));
      }
    }
    if(this.get('isTextArea')) {
      this.invokeLast(this._addTextAreaEvents);
    }
    else {
      this._addTextAreaEvents();
      
      // In Firefox, for input fields only (that is, not textarea elements),
      // if the cursor is at the end of the field, the "down" key will not
      // result in a "keypress" event for the document (only for the input
      // element), although it will be bubbled up in other contexts.  Since
      // SproutCore's event dispatching requires the document to see the
      // event, we'll manually forward the event along.
      if (SC.browser.mozilla) {
        var input = this.$input();
        SC.Event.add(input, 'keypress', this, this._firefox_dispatch_keypress);
      }
    }
  },
  
  
  /** 
    Adds all the textarea events. This functions is called by didCreateLayer
    at different moments depending if it is a textarea or not. Appending 
    events to text areas is not reliable unless the element is already added 
    to the DOM.
    
  */
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


  /**
    Removes all the events attached to the textfield
  */
  
  willDestroyLayer: function() {
    sc_super();

    var input = this.$input();
    SC.Event.remove(input, 'focus',  this, this._textField_fieldDidFocus);
    SC.Event.remove(input, 'blur',   this, this._textField_fieldDidBlur);
    SC.Event.remove(input, 'select', this, this._textField_selectionDidChange);
    SC.Event.remove(input, 'focus',  this, this._firefox_dispatch_keypress);
  },
  
  /**
    This function is called by the event when the textfield gets focus
  */

  _textField_fieldDidFocus: function(evt) {
    SC.run(function() {
      this.set('focused',YES);
      this.fieldDidFocus(evt);
      var val = this.get('value');
      if(!this.get('_supportsPlaceHolder') && ((!val) || (val && val.length===0))){
        // console.log('turn off hint');
        this.set('hintON', NO);
      }
    }, this);
  },

  /**
    This function is called by the event when the textfield blurs
  */

  _textField_fieldDidBlur: function(evt) {
    SC.run(function() {
      this.set('focused',NO);
      // passing the original event here instead that was potentially set from
      // loosing the responder on the inline text editor so that we can
      // use it for the delegate to end editing
      this.fieldDidBlur(this._origEvent);
      var val = this.get('value');
      if(!this.get('_supportsPlaceHolder') && ((!val) || (val && val.length===0))){
        // console.log('turn on hint');
        this.set('hintON', YES);
      }
    }, this);
  },
  
  fieldDidFocus: function(evt) {
    this.beginEditing(evt);
    
    // We have to hide the intercept pane, as it blocks the events. 
    // However, show any that we previously hid, first just in case something wacky happened.
    if (this._didHideInterceptForPane) {
      this._didHideInterceptForPane.showTouchIntercept();
      this._didHideInterceptForPane = null;
    }
    
    // now, hide the intercept on this pane if it has one
    var pane = this.get('pane');
    if (pane && pane.get("usingTouchIntercept")) {
      // hide
      pane.hideTouchIntercept();
      
      // and set our internal one so we can unhide it (even if the pane somehow changes)
      this._didHideInterceptForPane = this.get("pane");
    }
  },
  
  fieldDidBlur: function(evt) {
    this.commitEditing(evt);
    
    // get the pane we hid intercept pane for (if any)
    var touchPane = this._didHideInterceptForPane;
    if (touchPane) {
      touchPane.showTouchIntercept();
      touchPane = null;
    }
  },
  
  _field_fieldValueDidChange: function(evt) {
    if(this.get('focused')){
      SC.run(function() {
        this.fieldValueDidChange(NO);        
      }, this);
    }
  },

  /**
    Move magic number out so it can be over-written later in inline editor
  */
  _topOffsetForFirefoxCursorFix: 3,


  /**
    Mozilla had this bug until firefox 3.5 or gecko 1.8 They rewrote input text
    and textareas and now they work better. But we have to keep this for older
    versions.
  */
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
  
  
  /**
    In Firefox, as of 3.6 -- including 3.0 and 3.5 -- for input fields only
    (that is, not textarea elements), if the cursor is at the end of the
    field, the "down" key will not result in a "keypress" event for the
    document (only for the input element), although it will be bubbled up in
    other contexts.  Since SproutCore's event dispatching requires the
    document to see the event, we'll manually forward the event along.
  */
  _firefox_dispatch_keypress: function(evt) {
    var selection = this.get('selection'),
        value     = this.get('value'),
        valueLen  = value ? value.length : 0,
        responder;
    
    if (!selection  ||  ((selection.get('length') === 0  &&  (selection.get('start') === 0)  ||  selection.get('end') === valueLen))) {
      responder = SC.RootResponder.responder;
      responder.keypress.call(responder, evt);
      evt.stopPropagation();
    }
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
      try{ 
        if(inp) inp.focus(); 
      } 
      catch(e){}
      if(!this._txtFieldMouseDown){
        this.invokeLast(this._selectRootElement) ;
      }
    }
  },
  
  willLoseKeyResponderTo: function(responder) {
    //if (this._isFocused) this._isFocused = NO ;
  },

  // In IE, you can't modify functions on DOM elements so we need to wrap the
  // call to select() like this.
  _selectRootElement: function() {
    // make sure input element still exists, as a redraw could have remove it
    // already
    var inputElem = this.$input()[0];
    if(inputElem) inputElem.select() ;
    else this._textField_selectionDidChange();
  },

  // when we lose first responder, blur the text field if needed and show
  // the hint text if needed.
  /** @private */
  didLoseKeyResponderTo: function(keyView) {
    var el = this.$input()[0];
    if (el) el.blur();
    
    this.invokeLater("scrollToOriginIfNeeded", 100);
  },
  
  /**
    @private
    Scrolls to origin if necessary (if the pane's current firstResponder is not a text field).
  */
  scrollToOriginIfNeeded: function() {
    var pane = this.get("pane");
    if (!pane) return;
    
    var first = pane.get("firstResponder");
    if (!first || !first.get("isTextField")) {
      document.body.scrollTop = document.body.scrollLeft = 0;
    }
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
    var which = evt.which, maxLengthReached = false;
    if ((which === 13 && !evt.isIMEInput) && !this.get('isTextArea')) return NO ;
    if (which === 27) return NO ;

    // handle tab key
    if (which === 9 && this.get('defaultTabbingEnabled')) {
      var view = evt.shiftKey ? this.get('previousValidKeyView') : this.get('nextValidKeyView');
      if (view) view.becomeFirstResponder();
      else evt.allowDefault();
      return YES ; // handled
    }
    // maxlength for textareas
    if(!SC.browser.safari && this.get('isTextArea')){
      var val = this.get('value');
      if(val && evt.which>47 && (val.length >= this.get('maxLength'))) {
        maxLengthReached = true;
      }
    }
    // validate keyDown...
    // do not validate on touch, as it prevents return.
    if ((this.performValidateKeyDown(evt) || SC.platform.touch) && !maxLengthReached) {
      this._isKeyDown = YES ;
      evt.allowDefault();
    } else {
      evt.stop();
    }
    
    if (this.get('applyImmediately')) {
      // We need this invokeLater as we need to get the value of the field
      // once the event has been processed. I tried with invokeLast , but
      // I guess the field doesn't repaint until js execution finishes and 
      // therefore the field value doesn't update if we don't give it a break.
      this.invokeLater(this.fieldValueDidChange,1); // notify change
    }
    return YES;
  },

  keyUp: function(evt) {
    if(SC.browser.mozilla && evt.keyCode===13) this.fieldValueDidChange(); 
    // The caret/selection could have moved.  In some browsers, though, the
    // element's values won't be updated until after this event is finished
    // processing.
    this.notifyPropertyChange('selection');
    this._isKeyDown = NO;
    evt.allowDefault();
    return YES;
  },

  mouseDown: function(evt) {
    var fieldValue = this.get('fieldValue'); // use 'fieldValue' since we want actual text
    this._txtFieldMouseDown=YES;
    if (!this.get('isEnabled')) {
      evt.stop();
      return YES;
    } else {
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
    } 
    return sc_super();
  },
  
  /**
    Adds mouse wheel support for textareas.
  */
  mouseWheel: function(evt) {
    evt.allowDefault();
    return YES;
  },

  /*
    Allows text selection in IE. We block the IE only event selectStart to 
    block text selection in all other views.
  */
  selectStart: function(evt) {
    return YES;
  },
  
  /**
    This function is to notify if the browser supports the placeholder attribute
    or not. Currently is disabled as in webkit there is a bug where the color 
    of the placeholder doesn't refresh all the time.
  */
  _supportsPlaceHolder: function(){
    return SC.browser.safari && !this.get('isTextArea');
  }.property('isTextArea').cacheable(),
  
  
  valueObserver: function(){
    // console.log('value observer');
    var val = this.get('value');
    if (val && val.length>0) this.set('hintON', NO);
    else this.set('hintON', YES);
  }.observes('value')
  
});
