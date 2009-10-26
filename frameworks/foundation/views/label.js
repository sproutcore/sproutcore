// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

sc_require('views/view') ;
sc_require('mixins/control') ;

SC.ALIGN_LEFT = 'left';
SC.ALIGN_RIGHT = 'right';
SC.ALIGN_CENTER = 'center';

SC.REGULAR_WEIGHT = 'normal';
SC.BOLD_WEIGHT = 'bold';

/**
  @class
  
  Displays a static string of text.
  
  You use a label view anytime you need to display a static string of text 
  or to display text that may need to be edited using only an inline control.
  
  @extends SC.View
  @extends SC.Control
  @extends SC.InlineEditorDelegate
  @since SproutCore 1.0
*/
SC.LabelView = SC.View.extend(SC.Control,
/** @scope SC.LabelView.prototype */ {

  classNames: ['sc-label-view'],

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
    The exampleInlineTextFieldView property is by default a 
    SC.InlineTextFieldView but it can be set to a customized inline text field
    view.
  
    @property
    @type {SC.View}
    @default {SC.InlineTextFieldView}
  */
  exampleInlineTextFieldView: SC.InlineTextFieldView,
  
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
    If you want the inline editor to be multiline set this property to YES.
  */
  isInlineEditorMultiline: NO,
  
  /**
    [RO] The value that will actually be displayed.
    
    This property is dynamically computed by applying localization, 
    string conversion and other normalization utilities.
    
    @field
  */
  displayValue: function() {
    var value = this.get('value') ;
    
    // 1. apply the formatter
    var formatter = this.getDelegateProperty('formatter', this.displayDelegate) ;
    if (formatter) {
      var formattedValue = (SC.typeOf(formatter) === SC.T_FUNCTION) ? formatter(value, this) : formatter.fieldValueForObject(value, this) ;
      if (!SC.none(formattedValue)) value = formattedValue ;
    }
    
    // 2. If the returned value is an array, convert items to strings and 
    // join with commas.
    if (SC.typeOf(value) === SC.T_ARRAY) {
      var ary = [];
      for(var idx=0;idx<value.get('length');idx++) {
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

    // 5. escapeHTML if needed
    if (this.get('escapeHTML')) value = SC.RenderContext.escapeHTML(value);
    
    return value ;
  }.property('value', 'localize', 'formatter', 'escapeHTML').cacheable(),
  
  /**
    Enables editing using the inline editor.
  */
  isEditable: NO,
  isEditableBindingDefault: SC.Binding.bool(),

  /**
    YES if currently editing label view.
  */
  isEditing: NO,
  
  /**
    Validator to use during inline editing.
    
    If you have set isEditing to YES, then any validator you set on this
    property will be used when the label view is put into edit mode.
    
    @type {SC.Validator}
  */
  validator: null,

  /**
    Event dispatcher callback.
    If isEditable is set to true, opens the inline text editor view.

    @param {DOMMouseEvent} evt DOM event
    
  */
  doubleClick: function( evt ) { return this.beginEditing(); },
  
  
  /**
    Opens the inline text editor (closing it if it was already open for 
    another view).
    
    @return {Boolean} YES if did begin editing
  */
  beginEditing: function() {
    if (this.get('isEditing')) return YES ;
    if (!this.get('isEditable')) return NO ;

    var el = this.$();
    var value = this.get('value') || '' ;
    var f = SC.viewportOffset(el[0]) ;
    var frameTemp = this.convertFrameFromView(this.get('frame'), null) ;
    f.width=frameTemp.width;
    f.height=frameTemp.height;
    
    SC.InlineTextFieldView.beginEditing({
      frame: f,
      delegate: this,
      exampleElement: el,
      value: value, 
      multiline: this.get('isInlineEditorMultiline'), 
      isCollection: NO,
      validator: this.get('validator'),
      exampleInlineTextFieldView: this.get('exampleInlineTextFieldView')
    });
  },
  
  /**
    Cancels the current inline editor and then exits editor. 
    
    @return {Boolean} NO if the editor could not exit.
  */
  discardEditing: function() {
    if (!this.get('isEditing')) return YES ;
    return SC.InlineTextFieldView.discardEditing() ;
  },
  
  /**
    Commits current inline editor and then exits editor.
    
    @return {Boolean} NO if the editor could not exit
  */
  commitEditing: function() {
    if (!this.get('isEditing')) return YES ;
    return SC.InlineTextFieldView.commitEditing() ;
  },

  /** @private
    Set editing to true so edits will no longer be allowed.
  */
  inlineEditorWillBeginEditing: function(inlineEditor) {
    this.set('isEditing', YES);
  },

  /** @private 
    Hide the label view while the inline editor covers it.
  */
  inlineEditorDidBeginEditing: function(inlineEditor) {
    this._oldOpacity = this.$().css('opacity') ;
    this.$().css('opacity', 0.0);
  },

  /** @private
    Could check with a validator someday...
  */
  inlineEditorShouldEndEditing: function(inlineEditor, finalValue) {
    return YES ;
  },

  /** @private
    Update the field value and make it visible again.
  */
  inlineEditorDidEndEditing: function(inlineEditor, finalValue) {
    this.setIfChanged('value', finalValue) ;
    this.$().css('opacity', this._oldOpacity);
    this._oldOpacity = null ;
    this.set('isEditing', NO) ;
  },

  displayProperties: 'displayValue textAlign fontWeight icon'.w(),
  
  _TEMPORARY_CLASS_HASH: {},
  
  render: function(context, firstTime) {
    var value = this.get('displayValue'),
        icon = this.get('icon'),
        hint = this.get('hint');
    
    // add icon if needed
    if (icon) {
      var url = (icon.indexOf('/')>=0) ? icon : SC.BLANK_IMAGE_URL;
      var className = (url === icon) ? '' : icon ;
      icon = '<img src="%@" alt="" class="icon %@" />'.fmt(url, className) ;
      context.push(icon);
    }
    
    // if there is a hint set and no value, render the hint
    // otherwise, render the value
    if (hint && (!value || value === '')) {
      context.push('<span class="sc-hint">', hint, '</span>');
    } else { 
      context.push(value);
    }
    
    // and setup alignment and font-weight on styles
    context.addStyle('text-align',  this.get('textAlign'))
           .addStyle('font-weight', this.get('fontWeight'));
           
    var classes = this._TEMPORARY_CLASS_HASH;
    classes.icon = !!this.get('icon');
    context.setClass(classes);
           
    // if we are editing, set the opacity to 0
    if (this.get('isEditing')) context.addStyle('opacity', 0.0);
  }
  
});
