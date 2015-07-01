// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('views/field');
sc_require('system/text_selection');
sc_require('mixins/editable');

SC.AUTOCAPITALIZE_NONE = 'none';
SC.AUTOCAPITALIZE_SENTENCES = 'sentences';
SC.AUTOCAPITALIZE_WORDS = 'words';
SC.AUTOCAPITALIZE_CHARACTERS = 'characters';

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

  classNames: ['sc-text-field-view'],

  /**
    Walk like a duck.

    @type Boolean
    @default true
    @readOnly
   */
  isTextField: true,

  // ..........................................................
  // PROPERTIES
  //

  /**
    When `applyImmediately` is turned on, every keystroke will set the value
    of the underlying object. Turning it off will only set the value on blur.

    @type Boolean
    @default true
   */
  applyImmediately: true,

  /**
    Flag indicating whether the editor should automatically commit if you click
    outside it.

    @type Boolean
    @default true
   */
  commitOnBlur: true,

  /**
    If `true` then allow multi-line input.  This will also change the default
    tag type from "input" to "textarea".  Otherwise, pressing return will
    trigger the default insertion handler.

    @type Boolean
    @default false
   */
  isTextArea: false,

  /**
    Whether the text field is currently focused.

    @type Boolean
    @default false
   */
  focused: false,

  /**
    The hint to display while the field is not active.

    @type String
    @default ""
   */
  hint: '',

  /**
    The type attribute of the input.

    @type String
    @default "text"
   */
  type: 'text',

  /**
    This property will set a tabindex="-1" on your view if set to false.

    This gives us control over the native tabbing behavior. When nextValidKeyView
    reaches the end of the views in the pane views tree, it won't go to a textfield
    that can accept the default tabbing behavior in any other pane. This was a
    problem when you had an alert on top of a mainPane with textfields.

    Modal panes set this to false on all textfields that don't belong to itself.
    @type Boolean
    @default true
   */
  isBrowserFocusable: true,

  /**
    Whether the browser should automatically correct the input.

    When `autoCorrect` is set to `null`, the browser will use
    the system defaults.

    @type Boolean
    @default true
   */
  autoCorrect: true,

  /**
    Specifies the autocapitalization behavior.

    Possible values are:

     - `SC.AUTOCAPITALIZE_NONE` -- Do not autocapitalize.
     - `SC.AUTOCAPITALIZE_SENTENCES` -- Autocapitalize the first letter of each
       sentence.
     - `SC.AUTOCAPITALIZE_WORDS` -- Autocapitalize the first letter of each word.
     - `SC.AUTOCAPITALIZE_CHARACTERS` -- Autocapitalize all characters.

    Boolean values are also supported, with `true` interpreted as
    `SC.AUTOCAPITALIZE_NONE` and `false` as `SC.AUTOCAPITALIZE_SENTENCES`.

    When `autoCapitalize` is set to `null`, the browser will use
    the system defaults.

    @type String SC.AUTOCAPITALIZE_NONE|SC.AUTOCAPITALIZE_SENTENCES|SC.AUTOCAPITALIZE_WORDS|SC.AUTOCAPITALIZE_CHARACTERS
    @default SC.CAPITALIZE_SENTENCES
   */
  autoCapitalize: SC.CAPITALIZE_SENTENCES,

  /**
    Whether the browser should automatically complete the input.

    When `autoComplete` is set to `null`, the browser will use
    the system defaults.

    @type Boolean
    @default null
   */
  autoComplete: null,

  /**
    Localizes and escapes the hint if necessary.

    @field
    @type String
   */
  formattedHint: function () {
    var hint = this.get('hint');
    hint = typeof(hint) === 'string' && this.get('localize') ? SC.String.loc(hint) : hint;

    // If the hint is appended via an overlay, ensure that the text is escaped in order to avoid XSS attacks.
    if (this.get('useHintOverlay')) {
      hint = this.get('escapeHTML') ? SC.RenderContext.escapeHTML(hint) : hint;
    }

    return hint;
  }.property('hint', 'localize').cacheable(),

  /**
    Whether to show the hint while the field still has focus.

    While newer versions of Safari, Firefox and Chrome will act this way using the
    placeholder attribute, other browsers will not. By setting this property
    to true, we can ensure that the hint will always appear even when the
    field has focus.

    Note: If `hintOnFocus` is false, this doesn't necessarily mean that the
    hint will disappear on focus, because some browsers will still not remove
    the placeholder on focus when empty.

    *Important:* You can not modify this property once the view has been rendered.

    @type Boolean
    @default true
   */
  hintOnFocus: true,

  /**
    Whether the hint should be localized or not.

    @type Boolean
    @default true
   */
  localize: true,

  /**
    If `true` then the text field is currently editing.

    @type Boolean
    @default false
   */
  isEditing: false,

  /**
    If you set this property to false the tab key won't trigger its default
    behavior (tabbing to the next field).

    @type Boolean
    @default true
   */
  defaultTabbingEnabled: true,

  /**
    Enabled context menu for textfields.

    @type Boolean
    @default true
   */
  isContextMenuEnabled: true,

  /**
    If no, will not allow transform or validation errors (SC.Error objects)
    to be passed to `value`.  Upon focus lost, the text field will revert
    to its previous value.

    @type Boolean
    @default true
   */
  allowsErrorAsValue: true,

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

    @type SC.View
    @default null
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

    @type SC.View
    @default null
   */
  rightAccessoryView: null,

  /**
    This property will enable disable HTML5 spell checking if available on the
    browser. As of today Safari 4+, Chrome 3+ and Firefox 3+ support it.

    @type Boolean
    @default true
   */
  spellCheckEnabled: true,

  /**
    Maximum amount of characters this field will allow.

    @type Number
    @default 5096
   */
  maxLength: 5096,

  /**
    Whether to render a border or not.

    @type Boolean
    @default true
   */
  shouldRenderBorder: true,

  // ..........................................................
  // SUPPORT FOR AUTOMATIC RESIZING
  //

  /**
    Text fields support auto resizing.
    @type Boolean
    @default true
    @see SC.AutoResize#supportsAutoResize
   */
  supportsAutoResize: true,

  /**
    The layer to automatically resize.

    @type DOMElement
    @see SC.AutoResize#autoResizeLayer
   */
  autoResizeLayer: function () {
    return this.$input()[0];
  }.property('layer').cacheable(),

  /**
    The text to be used when automatically resizing the text field.

    @type String
    @see SC.AutoResize#autoResizeText
   */
  autoResizeText: function () {
    return this.get('value');
  }.property('value').cacheable(),

  /**
    How much padding should be used when automatically resizing.
    @type Number
    @default 20
    @see SC.AutoResize#autoResizePadding
   */
  autoResizePadding: SC.propertyFromRenderDelegate('autoResizePadding', 20),

  /**
    This property indicates if the value in the text field can be changed.
    If set to `false`, a `readOnly` attribute will be added to the DOM Element.

    Note if `isEnabledInPane` is `false` this property will have no effect.

    @type Boolean
    @default true
   */
  isEditable: true,

  /**
    The current selection of the text field, returned as an SC.TextSelection
    object.

    Note that if the selection changes a new object will be returned -- it is
    not the case that a previously-returned SC.TextSelection object will
    simply have its properties mutated.

    @field
    @type SC.TextSelection
   */
  selection: function (key, value) {
    var element = this.$input()[0],
        direction = 'none',
        range, start, end;

    // Are we being asked to set the value, or return the current value?
    if (value === undefined) {
      // The client is retrieving the value.
      if (element) {
        start = null;
        end = null;

        if (!element.value) {
          start = end = 0;
        } else {
          // In IE8, input elements don't have hasOwnProperty() defined.
          try {
            if (SC.platform.input.selectionStart) {
              start = element.selectionStart;
            }
            if (SC.platform.input.selectionEnd) {
              end = element.selectionEnd;
            }
            if (SC.platform.input.selectionDirection) {
              direction = element.selectionDirection;
            }
          }
          // In Firefox when you ask the selectionStart or End of a hidden
          // input, sometimes it throws a weird error.
          // Adding this to just ignore it.
          catch (e) {
            return null;
          }

          // Support Internet Explorer.
          if (start === null  ||  end === null) {
            var selection = document.selection;
            if (selection) {
              var type = selection.type;
              if (type  &&  (type === 'None'  ||  type === 'Text')) {
                range = selection.createRange();

                if (!this.get('isTextArea')) {
                  // Input tag support.  Figure out the starting position by
                  // moving the range's start position as far left as possible
                  // and seeing how many characters it actually moved over.
                  var length = range.text.length;
                  start = Math.abs(range.moveStart('character', 0 - (element.value.length + 1)));
                  end = start + length;
                } else {
                  // Textarea support.  Unfortunately, this case is a bit more
                  // complicated than the input tag case.  We need to create a
                  // "dummy" range to help in the calculations.
                  var dummyRange = range.duplicate();
                  dummyRange.moveToElementText(element);
                  dummyRange.setEndPoint('EndToStart', range);
                  start = dummyRange.text.length;
                  end = start + range.text.length;
                }
              }
            }
          }
        }

        return SC.TextSelection.create({ start: start, end: end, direction: direction });
      } else {
        return null;
      }
    } else {
      // The client is setting the value.  Make sure the new value is a text
      // selection object.
      if (!value  ||  !value.kindOf  ||  !value.kindOf(SC.TextSelection)) {
        throw new Error("When setting the selection, you must specify an SC.TextSelection instance.");
      }

      if (element) {
        if (element.setSelectionRange) {
          try {
            element.setSelectionRange(value.get('start'), value.get('end'), value.get('direction'));
          } catch (e) {
            // In Firefox & IE when you call setSelectionRange on a hidden input it will throw weird
            // errors. Adding this to just ignore it.
            return null;
          }

          if (!SC.platform.input.selectionDirection) {
            // Browser doesn't support selectionDirection, set it to 'none' so the wrong value is not cached.
            value.set('direction', 'none');
          }
        } else {
          // Support Internet Explorer.
          range = element.createTextRange();
          start = value.get('start');
          range.move('character', start);
          range.moveEnd('character', value.get('end') - start);
          range.select();
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

  /**
    Whether or not the text field view will use an overlaid label for the hint.

    There are two conditions that will result in the text field adding an
    overlaid label for the hint. The first is when the `hintOnFocus` property is
    true. This allows the user to focus the text field and still see the hint
    text while there is no value in the field. Since some browsers clear the
    placeholder when the field has text, this is a way to ensure the same
    behavior across all browsers.

    The second is when the browser doesn't support the placeholder attribute
    (i.e. < IE 10). By using an overlaid label rather than inserting the hint
    into the input, we are able to show clear text hints over password fields.

    @field
    @type Boolean
    @default true
    @readonly
  */
  useHintOverlay: function () {
    return this.get('hintOnFocus') || !SC.platform.input.placeholder;
  }.property().cacheable(),

  // ..........................................................
  // INTERNAL SUPPORT
  //

  // Note: isEnabledInPane is required here because it is used in the renderMixin function of
  // SC.Control. It is not a display property directly in SC.Control, because the use of it in
  // SC.Control is only applied to input fields, which very few consumers of SC.Control have.
  // TODO: Pull the disabled attribute updating out of SC.Control.
  displayProperties: ['isBrowserFocusable', 'formattedHint', 'fieldValue', 'isEditing', 'isEditable', 'isEnabledInPane',
                      'leftAccessoryView', 'rightAccessoryView', 'isTextArea', 'maxLength'],

  createChildViews: function () {
    sc_super();
    this.accessoryViewObserver();
  },

  acceptsFirstResponder: function () {
    return this.get('isEnabledInPane');
  }.property('isEnabledInPane'),

  accessoryViewObserver: function () {
    var classNames,
        viewProperties = ['leftAccessoryView', 'rightAccessoryView'],
        len = viewProperties.length, i, viewProperty, previousView,
        accessoryView;

    for (i = 0; i < len; i++) {
      viewProperty = viewProperties[i];

      // Is there an accessory view specified?
      previousView = this['_' + viewProperty];
      accessoryView = this.get(viewProperty);

      // If the view is the same, there's nothing to do.  Otherwise, remove
      // the old one (if any) and add the new one.
      if (! (previousView &&
             accessoryView &&
             (previousView === accessoryView))) {

        // If there was a previous previous accessory view, remove it now.
        if (previousView) {
          // Remove the "sc-text-field-accessory-view" class name that we had
          // added earlier.
          classNames = previousView.get('classNames');
          classNames = classNames.without('sc-text-field-accessory-view');
          previousView.set('classNames', classNames);

          if (previousView.createdByParent) {
            this.removeChildAndDestroy(previousView);
          } else {
            this.removeChild(previousView);
          }

          // Tidy up.
          previousView = this['_' + viewProperty] = this['_created' + viewProperty] = null;
        }

        // If there's a new accessory view to add, do so now.
        if (accessoryView) {
          // If the user passed in a class rather than an instance, create an
          // instance now.
          accessoryView = this.createChildView(accessoryView);

          // Fix up right accessory views to be right positioned.
          if (viewProperty === 'rightAccessoryView') {
            var layout = accessoryView.get('layout');

            accessoryView.adjust({ left: null, right: layout.right || 0 });
          }

          // Add in the "sc-text-field-accessory-view" class name so that the
          // z-index gets set correctly.
          classNames = accessoryView.get('classNames');
          var className = 'sc-text-field-accessory-view';
          if (classNames.indexOf(className) < 0) {
            classNames = SC.clone(classNames);
            classNames.push(className);
            accessoryView.set('classNames', classNames);
          }

          // Actually add the view to our hierarchy and cache a reference.
          this.appendChild(accessoryView);
          this['_' + viewProperty] = accessoryView;
        }
      }
    }
  }.observes('leftAccessoryView', 'rightAccessoryView'),

  render: function (context, firstTime) {
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
    accessoryViewWidths = this._getAccessoryViewWidths();
    leftAdjustment  = accessoryViewWidths.left;
    rightAdjustment = accessoryViewWidths.right;

    if (leftAdjustment)  leftAdjustment  += 'px';
    if (rightAdjustment) rightAdjustment += 'px';

    this._renderField(context, firstTime, v, leftAdjustment, rightAdjustment);
  },

  /** @private
    If isTextArea is changed (this might happen in inlineeditor constantly)
    force the field render to render like the firsttime to avoid writing extra
    code. This can be useful also
   */
  _forceRenderFirstTime: false,

  /** @private */
  _renderFieldLikeFirstTime: function () {
    this.set('_forceRenderFirstTime', true);
  }.observes('isTextArea'),

  /** @private */
  _renderField: function (context, firstTime, value, leftAdjustment, rightAdjustment) {
    // TODO:  The cleanest thing might be to create a sub- rendering context
    //        here, but currently SC.RenderContext will render sibling
    //        contexts as parent/child.
    var hint = this.get('formattedHint'),
      hintAttr = '',
      maxLength = this.get('maxLength'),
      isTextArea = this.get('isTextArea'),
      isEnabledInPane = this.get('isEnabledInPane'),
      isEditable = this.get('isEditable'),
      autoCorrect = this.get('autoCorrect'),
      autoCapitalize = this.get('autoCapitalize'),
      autoComplete = this.get('autoComplete'),
      isBrowserFocusable = this.get('isBrowserFocusable'),
      spellCheckString = '', autocapitalizeString = '', autocorrectString = '',
      autocompleteString = '', activeStateString = '', browserFocusableString = '',
      name, adjustmentStyle, type, paddingElementStyle,
      fieldClassNames, isOldSafari;

    context.setClass('text-area', isTextArea);

    //Adding this to differentiate between older and newer versions of safari
    //since the internal default field padding changed
    isOldSafari = SC.browser.isWebkit &&
        SC.browser.compare(SC.browser.engineVersion, '532') < 0;
    context.setClass('oldWebKitFieldPadding', isOldSafari);


    if (firstTime || this._forceRenderFirstTime) {
      this._forceRenderFirstTime = false;
      activeStateString = isEnabledInPane ? (isEditable ? '' : ' readonly="readonly"') : ' disabled="disabled"';
      name = this.get('layerId');

      spellCheckString = this.get('spellCheckEnabled') ? ' spellcheck="true"' : ' spellcheck="false"';

      if (!SC.none(autoCorrect)) {
        autocorrectString = ' autocorrect=' + (!autoCorrect ? '"off"' : '"on"');
      }

      if (!SC.none(autoCapitalize)) {
        if (SC.typeOf(autoCapitalize) === 'boolean') {
          autocapitalizeString = ' autocapitalize=' + (!autoCapitalize ? '"none"' : '"sentences"');
        } else {
          autocapitalizeString = ' autocapitalize=' + autoCapitalize;
        }
      }

      if (!SC.none(autoComplete)) {
        autocompleteString = ' autocomplete=' + (!autoComplete ? '"off"' : '"on"');
      }

      if (!isBrowserFocusable) {
        browserFocusableString = ' tabindex="-1"';
      }

      if (this.get('shouldRenderBorder')) context.push('<div class="border"></div>');

      // Render the padding element, with any necessary positioning
      // adjustments to accommodate accessory views.
      adjustmentStyle = '';
      if (leftAdjustment || rightAdjustment) {
        adjustmentStyle = 'style="';
        if (leftAdjustment)  adjustmentStyle += 'left:'  + leftAdjustment  + ';';
        if (rightAdjustment) adjustmentStyle += 'right:' + rightAdjustment + ';';
        adjustmentStyle += '"';
      }
      context.push('<div class="padding" ' + adjustmentStyle + '>');

      value = this.get('escapeHTML') ? SC.RenderContext.escapeHTML(value) : value;

      // When hintOnFocus is true or the field doesn't support placeholders, ensure that a hint appears by adding an overlay hint element.
      if (this.get('useHintOverlay')) {
        var hintOverlay = '<div aria-hidden="true" class="hint ' +
                      (isTextArea ? '':'ellipsis') + '%@">' + hint + '</div>';
        context.push(hintOverlay.fmt(value ? ' sc-hidden': ''));

      // Use the input placeholder attribute for the hint.
      } else {
        hintAttr = ' placeholder="' + hint + '"';
      }

      fieldClassNames = "field";

      // Render the input/textarea field itself, and close off the padding.
      if (isTextArea) {
        context.push('<textarea aria-label="' + hint + '" class="' + fieldClassNames + '" aria-multiline="true"' +
                      '" name="' + name + '"' + activeStateString + hintAttr +
                      spellCheckString + autocorrectString + autocapitalizeString +
                      browserFocusableString + ' maxlength="' + maxLength +
                      '">' + value + '</textarea></div>');
      } else {
        type = this.get('type');
        context.push('<input aria-label="' + hint + '" class="' + fieldClassNames + '" type="' + type +
                      '" name="' + name + '"' + activeStateString + hintAttr +
                      spellCheckString + autocorrectString + autocapitalizeString +
                      autocompleteString + browserFocusableString + ' maxlength="' + maxLength +
                      '" value="' + value + '"' + '/></div>');
      }
    } else {
      var input = this.$input(),
        element = input[0];

      // Update the hint. If the overlay hint was used, update it.
      if (this.get('useHintOverlay')) {
        context.$('.hint')[0].innerHTML = hint;
      } else {
        input.attr('placeholder', hint);
      }

      input.attr('maxLength', maxLength);

      // IE8 has problems aligning the input text in the center
      // This is a workaround for centering it.
      if (SC.browser.name === SC.BROWSER.ie && SC.browser.version <= 8 && !isTextArea) {
        input.css('line-height', this.get('frame').height + 'px');
      }

      if (!SC.none(autoCorrect)) {
        input.attr('autocorrect', !autoCorrect ? 'off' : 'on');
      } else {
        input.attr('autocorrect', null);
      }

      if (!SC.none(autoCapitalize)) {
        if (SC.typeOf(autoCapitalize) === 'boolean') {
          input.attr('autocapitalize', !autoCapitalize ? 'none' : 'sentences');
        } else {
          input.attr('autocapitalize', autoCapitalize);
        }
      } else {
        input.attr('autocapitalize', null);
      }

      if (!SC.none(autoComplete)) {
        input.attr('autoComplete', !autoComplete ? 'off' : 'on');
      } else {
        input.attr('autoComplete', null);
      }

      if (isBrowserFocusable) {
        input.removeAttr('tabindex');
      } else {
        input.attr('tabindex', '-1');
      }

      // Enable/disable the actual input/textarea as appropriate.
      if (!isEditable) {
        input.attr('readOnly', true);
      } else {
        input.attr('readOnly', null);
      }

      if (element) {
        // Adjust the padding element to accommodate any accessory views.
        paddingElementStyle = element.parentNode.style;
        if (leftAdjustment) {
          if (paddingElementStyle.left !== leftAdjustment) {
            paddingElementStyle.left = leftAdjustment;
          }
        } else {
          paddingElementStyle.left = null;
        }

        if (rightAdjustment) {
          if (paddingElementStyle.right !== rightAdjustment) {
            paddingElementStyle.right = rightAdjustment;
          }
        } else {
          paddingElementStyle.right = null;
        }
      }
    }
  },

  _getAccessoryViewWidths: function () {
    var widths = {},
        accessoryViewPositions = ['left', 'right'],
        numberOfAccessoryViewPositions = accessoryViewPositions.length, i,
        position, accessoryView, width, layout, offset, frame;
    for (i = 0;  i < numberOfAccessoryViewPositions;  i++) {
      position = accessoryViewPositions[i];
      accessoryView = this['_' + position + 'AccessoryView'];
      if (accessoryView && accessoryView.isObservable) {
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

  /**
    Override of SC.FieldView.prototype.didCreateLayer.
  */
  didCreateLayer: function () {
    sc_super();

    // For some strange reason if we add focus/blur events to textarea
    // inmediately they won't work. However if I add them at the end of the
    // runLoop it works fine.
    if (this.get('isTextArea')) {
      this.invokeLast(this._addTextAreaEvents);
    } else {
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

  /**
    SC.View view state callback.

    Once the view is appended, fix up the text layout to hint and input.
  */
  didAppendToDocument: function () {
    this._fixupTextLayout();
  },

  /** @private
    Apply proper text layout to hint and input.
   */
  _fixupTextLayout: function () {
    var height = this.get('frame').height;

    if (SC.browser.name === SC.BROWSER.ie && SC.browser.version <= 8 &&
        !this.get('isTextArea')) {
      this.$input().css('line-height', height + 'px');
    }

    if (this.get('useHintOverlay') && !this.get('isTextArea')) {
      var hintJQ = this.$('.hint');

      hintJQ.css('line-height', hintJQ.outerHeight() + 'px');
    }
  },

  /** @private
    Adds all the textarea events. This functions is called by didCreateLayer
    at different moments depending if it is a textarea or not. Appending
    events to text areas is not reliable unless the element is already added
    to the DOM.
   */
  _addTextAreaEvents: function () {
    var input = this.$input();
    SC.Event.add(input, 'focus', this, this._textField_fieldDidFocus);
    SC.Event.add(input, 'blur',  this, this._textField_fieldDidBlur);

    // There are certain ways users can select text that we can't identify via
    // our key/mouse down/up handlers (such as the user choosing Select All
    // from a menu).
    SC.Event.add(input, 'select', this, this._textField_selectionDidChange);

    // handle a "paste" from app menu and context menu
    SC.Event.add(input, 'input', this, this._textField_inputDidChange);
  },

  /**
    Removes all the events attached to the textfield
   */
  willDestroyLayer: function () {
    sc_super();

    var input = this.$input();
    SC.Event.remove(input, 'focus',  this, this._textField_fieldDidFocus);
    SC.Event.remove(input, 'blur',   this, this._textField_fieldDidBlur);
    SC.Event.remove(input, 'select', this, this._textField_selectionDidChange);
    SC.Event.remove(input, 'keypress',  this, this._firefox_dispatch_keypress);
    SC.Event.remove(input, 'input', this, this._textField_inputDidChange);
  },

  /** @private
     This function is called by the event when the textfield gets focus
  */
  _textField_fieldDidFocus: function (evt) {
    SC.run(function () {
      this.set('focused', true);
      this.fieldDidFocus(evt);
    }, this);
  },

  /** @private
    This function is called by the event when the textfield blurs
   */
  _textField_fieldDidBlur: function (evt) {
    SC.run(function () {
      this.set('focused', false);
      // passing the original event here instead that was potentially set from
      // losing the responder on the inline text editor so that we can
      // use it for the delegate to end editing
      this.fieldDidBlur(this._origEvent || evt);
    }, this);
  },

  fieldDidFocus: function (evt) {
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

  fieldDidBlur: function (evt) {
    this.resignFirstResponder(evt);

    if (this.get('commitOnBlur')) this.commitEditing(evt);

    // get the pane we hid intercept pane for (if any)
    var touchPane = this._didHideInterceptForPane;
    if (touchPane) {
      touchPane.showTouchIntercept();
      touchPane = null;
    }
  },

  /** @private */
  _field_fieldValueDidChange: function (evt) {
    if (this.get('focused')) {
      SC.run(function () {
        this.fieldValueDidChange(false);
      }, this);
    }

    this.updateHintOnFocus();
  },

  /** @private
    Context-menu paste does not trigger fieldValueDidChange normally. To do so, we'll capture the
    input event and avoid duplicating the "fieldValueDidChange" call if it was already issued elsewhere.

    I welcome someone else to find a better solution to this problem. However, please make sure that it
    works with pasting via shortcut, context menu and the application menu on *All Browsers*.
   */
  _textField_inputDidChange: function () {
    var timerNotPending = SC.empty(this._fieldValueDidChangeTimer) || !this._fieldValueDidChangeTimer.get('isValid');
    if (this.get('applyImmediately') && timerNotPending) {
      this.invokeLater(this.fieldValueDidChange, 10);
    }
  },

  /** @private
    Make sure to update visibility of hint if it changes
   */
  updateHintOnFocus: function () {
    // Fast path. If we aren't using the hind overlay, do nothing.
    if (!this.get('useHintOverlay')) return;

    // If there is a value in the field, hide the hint.
    if (this.getFieldValue()) {
      this.$('.hint').addClass('sc-hidden');
    } else {
      this.$('.hint').removeClass('sc-hidden');
      this._fixupTextLayout();
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
  _firefox_dispatch_keypress: function (evt) {
    var selection = this.get('selection'),
        value     = this.get('value'),
        valueLen  = value ? value.length : 0,
        responder;

    if (!selection || ((selection.get('length') === 0 && (selection.get('start') === 0) || selection.get('end') === valueLen))) {
      responder = SC.RootResponder.responder;
      if (evt.keyCode === 9) return;
      responder.keypress.call(responder, evt);
      evt.stopPropagation();
    }
  },

  /** @private */
  _textField_selectionDidChange: function () {
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
  didBecomeKeyResponderFrom: function (keyView) {
    if (this.get('isVisibleInWindow')) {
      var inp = this.$input()[0];
      try {
        if (inp) inp.focus();
      } catch (e) {}

      if (!this._txtFieldMouseDown) {
        this.invokeLast(this._selectRootElement);
      }
    }
  },

  /** @private
    In IE, you can't modify functions on DOM elements so we need to wrap the
    call to select() like this.
   */
  _selectRootElement: function () {
    var inputElem = this.$input()[0],
        isLion;
    // Make sure input element still exists, as a redraw could have remove it
    // already.
    if (inputElem) {
      // Determine if the OS is OS 10.7 "Lion"
      isLion = SC.browser.os === SC.OS.mac &&
          SC.browser.compare(SC.browser.osVersion, '10.7') === 0;

      if (!(SC.browser.name === SC.BROWSER.safari &&
            isLion && SC.buildLocale === 'ko-kr')) {
        inputElem.select();
      }
    }
    else this._textField_selectionDidChange();
  },

  /** @private
    When we lose first responder, blur the text field if needed and show
    the hint text if needed.
   */
  didLoseKeyResponderTo: function (keyView) {
    var el = this.$input()[0];
    if (el) el.blur();
    this.invokeLater("scrollToOriginIfNeeded", 100);
  },

  /** @private
    Scrolls to origin if necessary (if the pane's current firstResponder is not a text field).
   */
  scrollToOriginIfNeeded: function () {
    var pane = this.get("pane");
    if (!pane) return;

    var first = pane.get("firstResponder");
    if (!first || !first.get("isTextField")) {
      document.body.scrollTop = document.body.scrollLeft = 0;
    }
  },

  /** @private */
  keyDown: function (evt) {
    return this.interpretKeyEvents(evt) || false;
  },

  /** @private */
  insertText: function (chr, evt) {
    var which = evt.which,
        keyCode = evt.keyCode,
        maxLengthReached = false;

    // maxlength for textareas
    if (!SC.platform.input.maxlength && this.get('isTextArea')) {
      var val = this.get('value');

      // This code is nasty. It's thanks to Gecko .keycode table that has characters like '&' with the same keycode as up arrow key
      if (val && ((!SC.browser.isMozilla && which > 47) ||
                  (SC.browser.isMozilla && ((which > 32 && which < 43) || which > 47) && !(keyCode > 36 && keyCode < 41))) &&
          (val.length >= this.get('maxLength'))) {
        maxLengthReached = true;
      }
    }

    // Validate keyDown...
    if (this.performValidateKeyDown(evt) && !maxLengthReached) {
      evt.allowDefault();
    } else {
      evt.stop();
    }

    if (this.get('applyImmediately')) {
      // This has gone back and forth several times between invokeLater and setTimeout.
      // Now we're back to invokeLater, please read the code comment above
      // this._textField_inputDidChange before changing it again.
      this._fieldValueDidChangeTimer = this.invokeLater(this.fieldValueDidChange, 10);
    }

    return true;
  },

  /** @private */
  insertTab: function (evt) {
    // Don't handle if default tabbing hasn't been enabled.
    if (!this.get('defaultTabbingEnabled')) {
      evt.preventDefault();
      return false;
    }

    // Otherwise, handle.
    var view = this.get('nextValidKeyView');
    if (view) view.becomeFirstResponder();
    else evt.allowDefault();
    return true; // handled
  },

  /** @private */
  insertBacktab: function (evt) {
    // Don't handle if default tabbing hasn't been enabled.
    if (!this.get('defaultTabbingEnabled')) {
      evt.preventDefault();
      return false;
    }

    // Otherwise, handle.
    var view = this.get('previousValidKeyView');
    if (view) view.becomeFirstResponder();
    else evt.allowDefault();
    return true; // handled
  },

  /**
    @private

    Invoked when the user presses return.  If this is a multi-line field,
    then allow the newline to proceed.  Otherwise, try to commit the
    edit.
  */
  insertNewline: function (evt) {
    if (this.get('isTextArea') || evt.isIMEInput) {
      evt.allowDefault();
      return true; // handled
    }
    return false;
  },

  /** @private */
  deleteForward: function (evt) {
    evt.allowDefault();
    return true;
  },

  /** @private */
  deleteBackward: function (evt) {
    evt.allowDefault();
    return true;
  },

  /** @private */
  moveLeft: function (evt) {
    evt.allowDefault();
    return true;
  },

  /** @private */
  moveRight: function (evt) {
    evt.allowDefault();
    return true;
  },

  /** @private */
  selectAll: function (evt) {
    evt.allowDefault();
    return true;
  },

  /** @private */
  moveUp: function (evt) {
    if (this.get('isTextArea')) {
      evt.allowDefault();
      return true;
    }
    return false;
  },

  /** @private */
  moveDown: function (evt) {
    if (this.get('isTextArea')) {
      evt.allowDefault();
      return true;
    }
    return false;
  },

  keyUp: function (evt) {
    if (SC.browser.isMozilla &&
        evt.keyCode === SC.Event.KEY_RETURN) { this.fieldValueDidChange(); }

    // The caret/selection may have changed.
    // This cannot notify immediately, because in some browsers (tested Chrome 39.0 on OS X), the
    // value of `selectionStart` and `selectionEnd` won't have updated yet. Thus if we notified
    // immediately, observers of this view's `selection` property would get the old value.
    this.invokeNext(this._textField_selectionDidChange);

    evt.allowDefault();
    return true;
  },

  mouseDown: function (evt) {
    if (!this.get('isEnabledInPane')) {
      evt.stop();
      return true;
    } else {
      this._txtFieldMouseDown = true;
      this.becomeFirstResponder();

      return sc_super();
    }
  },

  mouseUp: function (evt) {
    this._txtFieldMouseDown = false;

    if (!this.get('isEnabledInPane')) {
      evt.stop();
      return true;
    }

    // The caret/selection may have changed.
    // This cannot notify immediately, because in some browsers (tested Chrome 39.0 on OS X), the
    // value of `selectionStart` and `selectionEnd` won't have updated yet. Thus if we notified
    // immediately, observers of this view's `selection` property would get the old value.
    this.invokeNext(this._textField_selectionDidChange);

    return sc_super();
  },

  touchStart: function (evt) {
    return this.mouseDown(evt);
  },

  touchEnd: function (evt) {
    return this.mouseUp(evt);
  },

  /**
    Adds mouse wheel support for textareas.
   */
  mouseWheel: function (evt) {
    if (this.get('isTextArea')) {
      evt.allowDefault();
      return true;
    } else return false;
  },

  /**
    Allows text selection in IE. We block the IE only event selectStart to
    block text selection in all other views.
   */
  selectStart: function (evt) {
    return true;
  },

  /** @private
    Overridden from SC.FieldView. Provides correct tag name based on the
    `isTextArea` property.
   */
  _inputElementTagName: function () {
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
  _valueObserver: function () {
    var val = this.get('value'), max;

    if (val && val.length > 0) {
      max = this.get('maxLength');

      if (!SC.platform.input.maxlength && val.length > max) {
        this.set('value', val.substr(0, max));
      }
    }
  }.observes('value')

});
