// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('mixins/inline_editable');
sc_require('mixins/inline_editor_delegate');
sc_require('delegates/inline_text_field');

SC.REGULAR_WEIGHT = 'normal';
SC.BOLD_WEIGHT = 'bold';
/**
  @class

  Displays a static string of text.

  You use a label view anytime you need to display a static string of text
  or to display text that may need to be edited using only an inline control.

  @extends SC.View
  @extends SC.Control
  @extends SC.InlineEditable
  @extends SC.InlineEditorDelegate
  @since SproutCore 1.0
*/
SC.LabelView = SC.View.extend(SC.Control, SC.InlineEditable,
/** @scope SC.LabelView.prototype */ {

  classNames: ['sc-label-view'],

  displayProperties: ['displayTitle', 'textAlign', 'fontWeight', 'icon', 'escapeHTML', 'needsEllipsis', 'hint', 'hintEnabled', 'toolTip'],

  /**
    The delegate that gets notified of events related to the editing process. Set
    this to the object you want to handles the lifecycle of the inline editor.

    Defaults to itself.
    @type SC.Object
  */
  inlineEditorDelegate: SC.InlineTextFieldDelegate,

  isEditable: NO,

  /**
    The exampleInlineTextFieldView property is by default a
    SC.InlineTextFieldView but it can be set to a customized inline text field
    view.

    @property
    @type {SC.View}
    @default {SC.InlineTextFieldView}
  */
  exampleEditor: SC.InlineTextFieldView,

  /**
    Specify the font weight for this.  You may pass SC.REGULAR_WEIGHT, or SC.BOLD_WEIGHT.

    @property {String} SC.REGULAR_WEIGHT|SC.BOLD_WEIGHT
    @default null
    @deprecated Use CSS instead.
  */
  fontWeight: null,

  /**
    If true, value will be escaped to avoid scripting attacks.

    This is a default value that can be overridden by the
    settings on the owner view.
  */
  escapeHTML: YES,
  escapeHTMLBindingDefault: SC.Binding.oneWay().bool(),

  /**
    If true, then the value will be localized.
    This is a default that can be overidden by the settings in the owner view.
  */
  localize: NO,
  localizeBindingDefault: SC.Binding.oneWay().bool(),

  /**
    Set this to a validator or to a function and the value
    will be passed through it before being set.

    This is a default default that can be overidden by the
    settings in the owner view.
  */
  formatter: null,

  /**
    The value of the label.

    You may also set the value using a content object and a contentValueKey.

    @field {String}
  */
  value: '',

  /**
    The hint to display if no value is set.  Should be used only if isEditable
    is set to YES.
  */
  hint: null,

  /*
    Whether hint should be shown or not. By default this is tied to isEditable
    so the hint will only show if isEditable is YES.

    @type Boolean
    @property
  */
  hintEnabled: function() {
    return this.get('isEditable');
  }.property('isEditable').cacheable(),

  /**
    An optional icon to display to the left of the label.  Set this value
    to either a CSS class name (for spriting) or an image URL.
  */
  icon: null,

  /**
    Set the alignment of the label view.

    @property {String} SC.ALIGN_LEFT|SC.ALIGN_CENTER|SC.ALIGN_RIGHT
    @default null
    @deprecated Use CSS instead.
  */
  textAlign: null,

  //
  // SUPPORT FOR AUTOMATIC RESIZING
  //
  supportsAutoResize: YES,
  autoResizeLayer: function() { return this.get('layer'); }
  .property('layer').cacheable(),

  autoResizeText: function() { return this.get('displayTitle'); }
  .property('displayTitle').cacheable(),

  autoResizePadding: SC.propertyFromRenderDelegate('autoResizePadding', 10),

  /**
    The name of the theme's SC.LabelView render delegate.

    @property {String}
  */
  renderDelegateName: 'labelRenderDelegate',

  /**
    [RO] The value that will actually be displayed.

    This property is dynamically computed by applying localization,
    string conversion and other normalization utilities.

    @field
  */
  displayTitle: function() {
    var value, formatter;

    value = this.get('value') ;

    // 1. apply the formatter
    formatter = this.getDelegateProperty('formatter', this.displayDelegate) ;
    if (formatter) {
      var formattedValue = (SC.typeOf(formatter) === SC.T_FUNCTION) ?
          formatter(value, this) : formatter.fieldValueForObject(value, this) ;
      if (!SC.none(formattedValue)) value = formattedValue ;
    }

    // 2. If the returned value is an array, convert items to strings and
    // join with commas.
    if (SC.typeOf(value) === SC.T_ARRAY) {
      var ary = [];
      for(var idx=0, idxLen = value.get('length'); idx< idxLen;idx++) {
        var x = value.objectAt(idx) ;
        if (!SC.none(x) && x.toString) x = x.toString() ;
        ary.push(x) ;
      }
      value = ary.join(',') ;
    }

    // 3. If value is not a string, convert to string. (handles 0)
    if (!SC.none(value) && value.toString) value = value.toString() ;

    // 4. Localize
    if (value && this.getDelegateProperty('localize', this.displayDelegate)) value = SC.String.loc(value) ;

    return value ;
  }.property('value', 'localize', 'formatter').cacheable(),


  /**
    [RO] The hint value that will actually be displayed.

    This property is dynamically computed by applying localization
    and other normalization utilities.

  */
  hintValue: function() {
    var hintVal = this.get('hint');
    return hintVal ;
  }.property('hint').cacheable(),

  /**
    Event dispatcher callback.
    If isEditable is set to true, opens the inline text editor view.

    @param {DOMMouseEvent} evt DOM event

  */
  doubleClick: function( evt ) { return this.beginEditing(); },

  /*
  * @method
  *
  * Hide the label view while the inline editor covers it.
  */
  inlineEditorDidBeginEditing: function(original, editor, value, editable) {
    this._oldOpacity = this.get('layout').opacity || 1;
    this.adjust('opacity', 0);

    original(editor, value, editable);
  }.enhance(),

  /*
  * @method
  *
  * Restore the label view when the inline editor finishes.
  */
  inlineEditorDidEndEditing: function() {
    this.adjust('opacity', this._oldOpacity);
    this._oldOpacity = null ;
  }
});
