// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('views/view') ;
sc_require('mixins/control') ;
sc_require('mixins/inline_editable');
sc_require('mixins/inline_editor_delegate');

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
SC.LabelView = SC.View.extend(SC.Control, SC.InlineEditorDelegate, SC.InlineEditable,
/** @scope SC.LabelView.prototype */ {

  classNames: ['sc-label-view'],

  displayProperties: 'value textAlign fontWeight icon escapeHTML'.w(),


  
  isEditable: NO,
  
  /**
    The exampleInlineTextFieldView property is by default a 
    SC.InlineTextFieldView but it can be set to a customized inline text field
    view.
  
    @property
    @type {SC.View}
    @default {SC.InlineTextFieldView}
  */
  exampleInlineTextFieldView: SC.InlineTextFieldView,
  
  /**
    LabelView is its own delegate by default, but you can change this to use a customized editor.
  */
  editorDelegate: null,
  
  /**
    Specify the font weight for this.  You may pass SC.REGULAR_WEIGHT, or SC.BOLD_WEIGHT.
  */
  fontWeight: SC.REGULAR_WEIGHT,
  
  /**
    If true, value will be escaped to avoid scripting attacks.
    
    This is a default value that can be overridden by the
    settings on the owner view.
  */
  escapeHTML: true,
  escapeHTMLBindingDefault: SC.Binding.oneWay().bool(),

  /**
    If true, then the value will be localized.
    
    This is a default default that can be overidden by the
    settings in the owner view.
  */
  localize: false,
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

  /**
    An optional icon to display to the left of the label.  Set this value
    to either a CSS class name (for spriting) or an image URL.
  */
  icon: null,
  
  /**
    Set the alignment of the label view.
  */
  textAlign: SC.ALIGN_LEFT,

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
  displayValue: function() {
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
    if (value && this.getDelegateProperty('localize', this.displayDelegate)) value = value.loc() ;
        
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
  
  
  /** @private 
    Hide the label view while the inline editor covers it.
  */
  inlineEditorDidBeginEditing: function(inlineEditor) {
    var layer = this.$();
    this._oldOpacity = layer.css('opacity') ;
    layer.css('opacity', 0.0);
  },
  
  updateRenderer: function(r) {
    r.attr({
      "value": this.get("displayValue"),
      "icon": this.get("icon"),
      "hint": this.get("hint"),
      "escapeHTML": this.get("escapeHTML"),
      "isEditing": this.get("isEditing"),
      "textAlign": this.get("textAlign"),
      "fontWeight": this.get("fontWeight")
    });
  },
  
  /** @private 
    Hide the label view while the inline editor covers it.
  */
  inlineEditorDidBeginEditing: function(editor) {
    this._oldOpacity = this.get('layout').opacity ;
    this.adjust('opacity', 0);
  },
  
  /** @private
    Update the field value and make it visible again.
  */
  inlineEditorDidEndEditing: function(editor, finalValue) {
    this.setIfChanged('value', finalValue) ;
    this.adjust('opacity', this._oldOpacity);
    this._oldOpacity = null ;
    this.set('isEditing', NO) ;
  }
});
