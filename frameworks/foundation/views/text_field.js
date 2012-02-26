// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
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

  classNames: ['sc-text-field-view'],
  isTextField: YES,

  // ..........................................................
  // PROPERTIES
  //

  /**
    When applyImmediately is turned on, every keystroke will set the value
    of the underlying object. Turning it off will only set the value on blur.

    @type String
    @default YES
  */
  applyImmediately: YES,

  /*
  * Flag indicating whether the editor should automatically commit if you click
  * outside it.
  *
  * @type {Boolean}
  */
  commitOnBlur: YES,

  /**
    If YES, the field will hide its text from display. The default value is NO.

    @property
    @type Boolean
  */
  isPassword: NO,

  /**
    If YES then allow multi-line input.  This will also change the default
    tag type from "input" to "textarea".  Otherwise, pressing return will
    trigger the default insertion handler.

    @property
    @type Boolean
  */
  isTextArea: NO,

  /** @private
    Override to specify the HTML element type to use as the field. For
    example, "input" or "textarea".
  */
  _inputElementTagName: function() {
    var tagName = this.get("isTextArea") ? 'textarea' : 'input';
    return tagName;
  },


  /**
    The hint to display while the field is not active.

    @property
    @type String
  */
  hint: '',

  /**
    The hint to display while the field is not active.

    @property
    @type String
  */
  type: 'text',

  /**
    This property will set a tabindex="-1" on your view if set to NO.

    This gives us control over the native tabbing behavior. When nextValidKeyView
    reaches the end of the views in the pane views tree, it won't go to a textfield
    that can accept the default tabbing behavior in any other pane. This was a
    problem when you had an alert on top of a mainPane with textfields.

    Modal panes set this to NO on all textfields that don't belong to itself.
    @property {Boolean}
  */

  isBrowserFocusable: YES,

  autoCorrect: true,
  autoCapitalize: true,


  /*
    Localizes the hint if necessary.

    @property
    @type String
  */
  formattedHint: function() {
    var hint = this.get('hint');
    return typeof(hint) === 'string' && this.get('localize') ? SC.String.loc(hint) : hint;
  }.property('hint', 'localize').cacheable(),

  /**
    Whether to show the hint while the field has focus. If YES, it will disappear
    as soon as any character is in the field.

    @property
    @type Boolean
  */
  hintOnFocus: YES,

  /*
    Whether the hint should be localized or not.

    @property
    @type Boolean
  */
  localize: YES,

  /**
    If YES then the text field is currently editing.

    @property
    @type Boolean
  */
  isEditing: NO,

  /**
    If you set this property to false the tab key won't trigger its default
    behavior (tabbing to the next field).

    @property
    @type Boolean
  */
  defaultTabbingEnabled: YES,

  /**
    Enabled context menu for textfields.

    @property
    @type Boolean
  */
  isContextMenuEnabled: YES,

  /**
    @deprecated Use #applyImmediately instead.

    If true, every change to the text in the text field updates 'value'.
    If false, 'value' is only updated when commitEditing() is called (this
    is called automatically when the text field loses focus), or whenever
    the return key is pressed while editing the field.

    @type Boolean
    @default null
  */
  continuouslyUpdatesValue: null,

  /**
    If no, will not allow transform or validation errors (SC.Error objects)
    to be passed to 'value'.  Upon focus lost, the text field will revert
    to its previous value.

    @property
    @type Boolean
  */
  allowsErrorAsValue: YES,

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

    @property
    @type SC.View
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

    @property
    @type SC.View
  */
  rightAccessoryView: null,

  /**
    This property will enable disable HTML5 spell checking if available on the
    browser. As of today Safari 4+, Chrome 3+ and Firefox 3+ support it

    @property
    @type Boolean
  */
  spellCheckEnabled: YES,

  /**
    Maximum amount of characters this field will allow.

    @property
    @type Number
  */
  maxLength: 5096,

  /**
    Whether to render a border or not.

    @property
    @type Boolean
  */
  shouldRenderBorder: YES,

  //
  // SUPPORT FOR AUTOMATIC RESIZING
  //
  supportsAutoResize: YES,
  autoResizeLayer: function() { return this.$input()[0]; }
  .property('layer').cacheable(),

  autoResizeText: function() { return this.get('value'); }
  .property('value').cacheable(),

  autoResizePadding: SC.propertyFromRenderDelegate('autoResizePadding', 20),

  /** @private
    Whether to show hint or not
  */
  _hintON: YES,

  init: function() {
    var val = this.get('value');
    this._hintON = ((!val || val && val.length===0) && !this.get('hintOnFocus')) ? YES : NO;

    var continuouslyUpdatesValue = this.get('continouslyUpdatesValue');
    if (continuouslyUpdatesValue !== null && continuouslyUpdatesValue !== undefined) {
      this.set('applyImmediately',  continuouslyUpdatesValue);

      // @if (debug)
      SC.Logger.warn("SC.TextFieldView#continuouslyUpdatesValue is deprecated. Please use #applyImmediately instead.");
      // @endif
    }

    return sc_super();
  },

  /**
    This property indicates if the value in the text field can be changed.
    If set to NO, a readOnly attribute will be added to the DOM Element.

    Note if isEnabled is NO this property will have no effect.

    @property
    @type Boolean
  */
  isEditable: YES,

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
          try {
            if ('selectionStart' in element) {
              start = element.selectionStart ;
            }
            if ('selectionEnd' in element) {
              end = element.selectionEnd ;
            }
          }
          // In Firefox when you ask the selectionStart or End of a hidden
          // input, sometimes it throws a weird error.
          // Adding this to just ignore it.
          catch (e){
            return null;
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

  displayProperties: ['isBrowserFocusable','formattedHint', 'fieldValue', 'isEditing', 'isEditable', 'leftAccessoryView', 'rightAccessoryView', 'isTextArea'],

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
      if (! (previousView &&
             accessoryView &&
             (previousView === accessoryView) ) ) {

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

    this._renderField(context, firstTime, v, leftAdjustment, rightAdjustment);
  },

  /** @private
    If isTextArea is changed (this might happen in inlineeditor constantly)
    force the field render to render like the firsttime to avoid writing extra
    code. This can be useful also
  */
  _forceRenderFirstTime: NO,

  /** @private */
  _renderFieldLikeFirstTime: function(){
    this.set('_forceRenderFirstTime', YES);
  }.observes('isTextArea'),

  /** @private */
  _renderField: function(context, firstTime, value, leftAdjustment, rightAdjustment) {
    // TODO:  The cleanest thing might be to create a sub- rendering context
    //        here, but currently SC.RenderContext will render sibling
    //        contexts as parent/child.

    var hint = this.get('formattedHint'),
        hintOnFocus = this.get('hintOnFocus'),
        hintString = '',
        maxLength = this.get('maxLength'),
        isTextArea = this.get('isTextArea'),
        isEnabled = this.get('isEnabled'),
        isEditable = this.get('isEditable'),
        autoCorrect = this.get('autoCorrect'),
        autoCapitalize = this.get('autoCapitalize'),
        isBrowserFocusable = this.get('isBrowserFocusable'),
        spellCheckString='', autocapitalizeString='', autocorrectString='',
        name, adjustmentStyle, type, hintElements, element, paddingElementStyle,
        fieldClassNames, isOldSafari, activeState, browserFocusable;

    context.setClass('text-area', isTextArea);

    //Adding this to differentiate between older and newer versions of safari
    //since the internal default field padding changed
    isOldSafari= SC.browser.isWebkit &&
        SC.browser.compare(SC.browser.engineVersion, '532')<0;
    context.setClass('oldWebKitFieldPadding', isOldSafari);



    if (firstTime || this._forceRenderFirstTime) {
      this._forceRenderFirstTime = NO;
      activeState = isEnabled ? (isEditable ? '' : 'readonly="readonly"') : 'disabled="disabled"' ;
      name = this.get('layerId');

      spellCheckString = this.get('spellCheckEnabled') ? ' spellcheck="true"' : ' spellcheck="false"';

      if(SC.browser.mobileSafari){
        autocorrectString = !autoCorrect ? ' autocorrect="off"' : '';
        autocapitalizeString = !autoCapitalize ? ' autocapitalize="off"' : '';
      }

      if(isBrowserFocusable){
        browserFocusable = 'tabindex="-1"';
      }
        // if hint is on and we don't want it to show on focus, create one
      if(SC.platform.input.placeholder && !hintOnFocus) {
        hintString = ' placeholder="' + hint + '"';
      }

      if(this.get('shouldRenderBorder')) context.push('<div class="border"></div>');

      // Render the padding element, with any necessary positioning
      // adjustments to accommodate accessory views.
      adjustmentStyle = '' ;
      if (leftAdjustment  ||  rightAdjustment) {
        adjustmentStyle = 'style="' ;
        if (leftAdjustment)  adjustmentStyle += 'left: '  + leftAdjustment  + '; ' ;
        if (rightAdjustment) adjustmentStyle += 'right: ' + rightAdjustment + ';' ;
        adjustmentStyle += '"' ;
      }
      context.push('<div class="padding" '+adjustmentStyle+'>');

      value = this.get('escapeHTML') ? SC.RenderContext.escapeHTML(value) : value;
      if(this._hintON && !SC.platform.input.placeholder && (!value || (value && value.length===0))) {
        value = hint;
        context.setClass('sc-hint', YES);
      }

      if(hintOnFocus) {
        var hintStr = '<div aria-hidden="true" class="hint '+
                      (isTextArea ? '':'ellipsis')+'%@">'+ hint + '</div>';
        context.push(hintStr.fmt(value ? ' sc-hidden': ''));
      }

      fieldClassNames = "field";

      // Render the input/textarea field itself, and close off the padding.
      if (isTextArea) {
        context.push('<textarea aria-label="' + hint + '" aria-multiline="true" class="'+fieldClassNames+'" name="'+ name+
                      '" '+ activeState + hintString +
                      spellCheckString + autocorrectString + browserFocusable +
                      autocapitalizeString + ' maxlength="'+ maxLength+ '">'+
                      value+ '</textarea></div>') ;
      }
      else {
        type = this.get('type');

        // Internet Explorer won't let us change the type attribute later
        // so we force it to password if needed now, or if the value is not the hint
        if (this.get('isPassword')) { type = 'password'; }

        context.push('<input aria-label="' + hint + '" class="'+fieldClassNames+'" type="'+ type+
                      '" name="'+ name + '" '+ activeState + ' value="'+ value + '"' +
                      hintString + spellCheckString+ browserFocusable +
                      ' maxlength="'+ maxLength+ '" '+autocorrectString+' ' +
                      autocapitalizeString+'/></div>') ;
      }
    }
    else {
      var input=this.$input(),
          elem = input[0],
          val = this.get('value');

      if(hintOnFocus) this.$('.hint')[0].innerHTML = hint;
      else if(!hintOnFocus) elem.placeholder = hint;

      if (!val || (val && val.length === 0)) {
        if (this.get('isPassword')) { elem.type = 'password'; }

        if (!SC.platform.input.placeholder && this._hintON) {
          if (!this.get('isFirstResponder')) {
          // Internet Explorer doesn't allow you to modify the type afterwards
          // jQuery throws an exception as well, so set attribute directly

          context.setClass('sc-hint', YES);
          input.val(hint);
          } else {
          // Internet Explorer doesn't allow you to modify the type afterwards
          // jQuery throws an exception as well, so set attribute directly
            context.setClass('sc-hint', NO);
            input.val('');
          }
        }
      }

      if(SC.browser.mobileSafari){
        input.attr('autoCapitalize', !autoCapitalize ? 'off':'true');
        input.attr('autoCorrect', !autoCorrect ? 'off':'true');
      }

      if (!hintOnFocus && SC.platform.input.placeholder) input.attr('placeholder', hint);

      if(isBrowserFocusable){
        input.removeAttr('tabindex');
      }else{
        input.attr('tabindex', '-1');
      }
      // Enable/disable the actual input/textarea as appropriate.
      element = input[0];
      if (element) {
        if (!isEnabled) {
          element.disabled = 'true' ;
          element.readOnly = null ;
        } else if(!isEditable) {
          element.disabled = null ;
          element.readOnly = 'true' ;
        } else {
          element.disabled = null ;
          element.readOnly = null ;
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
    if(!SC.platform.input.placeholder) this.invokeLast(this._setInitialPlaceHolderIE);
    // For some strange reason if we add focus/blur events to textarea
    // inmediately they won't work. However if I add them at the end of the
    // runLoop it works fine.
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
      if (SC.browser.isMozilla) {
        var input = this.$input();
        SC.Event.add(input, 'keypress', this, this._firefox_dispatch_keypress);
      }
    }
  },

  /**  @private
    Set initial placeholder for IE
  */
  _setInitialPlaceHolderIE: function() {
    if(!SC.platform.input.placeholder && this._hintON){
      var input = this.$input(),
          currentValue = input.val();
      if(!currentValue || (currentValue && currentValue.length===0)){
        input.val(this.get('formattedHint'));
      }
    }
  },

  /**  @private
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
    SC.Event.remove(input, 'keypress',  this, this._firefox_dispatch_keypress);
  },

  /** @private
    This function is called by the event when the textfield gets focus
  */
  _textField_fieldDidFocus: function(evt) {
    SC.run(function() {
      this.set('focused',YES);
      this.fieldDidFocus(evt);
      var val = this.get('value');
      if(!SC.platform.input.placeholder && ((!val) || (val && val.length===0))) {
        this._hintON = NO;
      }
    }, this);
  },

  /** @private
    This function is called by the event when the textfield blurs
  */
  _textField_fieldDidBlur: function(evt) {
    SC.run(function() {
      this.set('focused',NO);
      // passing the original event here instead that was potentially set from
      // loosing the responder on the inline text editor so that we can
      // use it for the delegate to end editing
      this.fieldDidBlur(this._origEvent || evt);
      var val = this.get('value');
      if(!SC.platform.input.placeholder && !this.get('hintOnFocus') && ((!val) || (val && val.length===0))) {
        this._hintON = YES;
      }
    }, this);
  },

  fieldDidFocus: function(evt) {
    this.becomeFirstResponder();

    this.beginEditing(evt);

    // We have to hide the intercept pane, as it blocks the events.
    // However, show any that we previously hid, first just in case something wacky happened.
    if (this._didHideInterceptForPane) {
      this._didHideInterceptForPane.showTouchIntercept();
      this._didHideInterceptForPane = null;
    }

    // now, hide the intercept on this pane if it has one
    var pane = this.get('pane');
    if (pane && pane.get('hasTouchIntercept')) {
      // hide
      pane.hideTouchIntercept();

      // and set our internal one so we can unhide it (even if the pane somehow changes)
      this._didHideInterceptForPane = this.get("pane");
    }
  },

  fieldDidBlur: function(evt) {
    this.resignFirstResponder(evt) ;

    if(this.get('commitOnBlur')) this.commitEditing(evt);

    // get the pane we hid intercept pane for (if any)
    var touchPane = this._didHideInterceptForPane;
    if (touchPane) {
      touchPane.showTouchIntercept();
      touchPane = null;
    }
  },

  /** @private */
  _field_fieldValueDidChange: function(evt) {
    if(this.get('focused')){
      SC.run(function() {
        this.fieldValueDidChange(NO);
      }, this);
    }
    this.updateHintOnFocus();
  },

  /** @private
    Make sure to update visibility of hint if it changes
  */
  updateHintOnFocus: function() {
    // if there is a value in the field, hide the hint
    var hintOnFocus = this.get('hintOnFocus');
    if(!hintOnFocus) return;

    if(this.getFieldValue()) {
      this.$('.hint').addClass('sc-hidden');
    }
    else {
      this.$('.hint').removeClass('sc-hidden');
    }
  }.observes('value'),

  /** @private
    Move magic number out so it can be over-written later in inline editor
  */
  _topOffsetForFirefoxCursorFix: 3,

  /** @private
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
      if(evt.keyCode===9) return;
      responder.keypress.call(responder, evt);
      evt.stopPropagation();
    }
  },

  /** @private */
  _textField_selectionDidChange: function() {
    this.notifyPropertyChange('selection');
  },

  // ..........................................................
  // FIRST RESPONDER SUPPORT
  //
  // When we become first responder, make sure the field gets focus and
  // the hint value is hidden if needed.

  /** @private
    When we become first responder, focus the text field if needed and
    hide the hint text.
  */
  didBecomeKeyResponderFrom: function(keyView) {
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

  /** @private
    In IE, you can't modify functions on DOM elements so we need to wrap the
    call to select() like this.
  */
  _selectRootElement: function() {
    var inputElem = this.$input()[0],
        isLion;
    // Make sure input element still exists, as a redraw could have remove it
    // already.
    if(inputElem){
      // Determine if the OS is OS 10.7 "Lion"
      isLion = SC.browser.os === SC.OS.mac &&
          SC.browser.compare(SC.browser.osVersion, '10.7') === 0;

      if(!(SC.browser.name === SC.BROWSER.safari &&
          isLion && SC.buildLocale==='ko-kr')) {
        inputElem.select() ;
      }
    }
    else this._textField_selectionDidChange();
  },

  /** @private
    When we lose first responder, blur the text field if needed and show
    the hint text if needed.
  */
  didLoseKeyResponderTo: function(keyView) {
    var el = this.$input()[0];
    if (el) el.blur();
    this.invokeLater("scrollToOriginIfNeeded", 100);
  },

  /** @private
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

  /**
    Simply allow keyDown & keyUp to pass through to the default web browser
    implementation.
  */
  keyDown: function(evt) {
    var which = evt.which,
        keyCode = evt.keyCode,
        maxLengthReached = false,
        value, view;

    // Handle return and escape.  this way they can be passed on to the
    // responder chain.
    // If the event is triggered by a return while entering IME input,
    // don't got through this path.
    if ((which === SC.Event.KEY_RETURN && !evt.isIMEInput) && !this.get('isTextArea')) { return NO; }
    if (which === SC.Event.KEY_ESC) { return NO; }

    // handle tab key
    if ((which === SC.Event.KEY_TAB || keyCode === SC.Event.KEY_TAB) && this.get('defaultTabbingEnabled')) {
      view = evt.shiftKey ? this.get('previousValidKeyView') : this.get('nextValidKeyView');
      if (view) view.becomeFirstResponder();
      else evt.allowDefault();
      return YES ; // handled
    }

    // maxlength for textareas
    if(!SC.platform.input.maxlength && this.get('isTextArea')){
      var val = this.get('value');

      // This code is nasty. It's thanks gecko .keycode table that has charters like & with the same keycode as up arrow key
      if(val && ((!SC.browser.isMozilla && which>47) ||
        (SC.browser.isMozilla && ((which>32 && which<43) || which>47) && !(keyCode>36 && keyCode<41))) &&
        (val.length >= this.get('maxLength'))) {
        maxLengthReached = true;
      }
    }
    // validate keyDown...
    // do not validate on touch, as it prevents return.
    if ((this.performValidateKeyDown(evt) || SC.platform.touch) && !maxLengthReached) {
      this._isKeyDown = YES;
      evt.allowDefault();
    } else {
      evt.stop();
    }

    if (this.get('applyImmediately')) {
      // There used to be an invokeLater here instead of setTimeout. What we
      // really need is setTimeout.
      var self = this;
      setTimeout(function() {
        self.fieldValueDidChange();
      }, 10);
    }

    return YES;
  },

  keyUp: function(evt) {
    if (SC.browser.isMozilla &&
        evt.keyCode === SC.Event.KEY_RETURN) { this.fieldValueDidChange(); }

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
    this.becomeFirstResponder();
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

  touchStart: function(evt) {
    return this.mouseDown(evt);
  },

  touchEnd: function(evt) {
    return this.mouseUp(evt);
  },

  /**
    Adds mouse wheel support for textareas.
  */
  mouseWheel: function(evt) {
    if(this.get('isTextArea')) {
      evt.allowDefault();
      return YES;
    } else return NO;
  },

  /*
    Allows text selection in IE. We block the IE only event selectStart to
    block text selection in all other views.
  */
  selectStart: function(evt) {
    return YES;
  },

  /** @private
    Overridden from SC.FieldView. Provides correct tag name based on the 
    'isTextArea' property.
   */
  _inputElementTagName: function() {
    if (this.get('isTextArea')) {
      return 'textarea';
    } else {
      return 'input';
    }
  },
  
  /** @private
    This observer makes sure to hide the hint when a value is entered, or
    show it if it becomes empty.
  */
  _valueObserver: function() {
    var val = this.get('value'), max;
    if (val && val.length>0) {
      this._hintON = NO;

      max = this.get('maxLength');
      if (!SC.platform.input.maxlength && val.length > max) {
        this.set('value', val.substr(0, max));
      }
    } else if(!this.get('hintOnFocus')) {
      this._hintON = YES;
    }
  }.observes('value')

});
