// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('views/view') ;
require('mixins/control') ;
require('mixins/delegate_support');
require('views/inline_text_field');
require('mixins/inline_editor_delegate');

SC.ALIGN_LEFT = 'left';
SC.ALIGN_RIGHT = 'right';
SC.ALIGN_CENTER = 'center';

/**
  @class
  
  Displays a static string of text.
  
  You use a label view anytime you need to display a static string of text 
  or to display text that may need to be edited using only an inline control.
  
  @extends SC.View
  @extends SC.Control
  @extends SC.DelegateSupport
  @extends SC.InlineEditorDelegate
  @extends SC.Editable
  @since SproutCore 1.0
*/
SC.LabelView = SC.View.extend(SC.DelegateSupport, SC.Control, SC.InlineEditorDelegate,
/** @scope SC.LabelView.prototype */ {

  styleClass: ['sc-label-view'],

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
    Set the alignment of the label view.
  */
  textAlign: SC.ALIGN_LEFT,
  
  /**
    [RO] The value that will actually be displayed.
    
    This property is dynamically computed by applying localization, 
    string conversion and other normalization utilities.
    
    @field
  */
  displayValue: function() {
    var value = this.get('value') ;
    
    // 1. apply the formatter
    var formatter = this.getDelegateProperty(this.displayDelegate, 'formatter') ;
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
    if (value && this.getDelegateProperty(this.displayDelegate, 'localize')) value = value.loc() ;
    
    return value ;
  }.property('value', 'localize', 'formatter').cacheable(),
  
  /**
    enables editing using the inline editor
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
  beginEditing: function()
  {
    if (this.get('isEditing')) return YES ;
    if (!this.get('isEditable')) return NO ;
    
    var value = this.get('value') || '' ;
    var f = this.convertFrameToView(this.get('frame'), null) ;
    var el = this.rootElement;
    SC.InlineTextFieldView.beginEditing({
      frame: f,
      delegate: this,
      exampleElement: el,
      value: value, 
      multiline: NO, 
      validator: this.get('validator')
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

  displayProperties: ['displayValue', 'textAlign'],
  
  updateDisplay: function() {
    var ret = sc_super();
    var value = this.get('displayValue');
    if (this.getDelegateProperty(this.displayDelegate, 'escapeHTML')) {
      this.$().text(value || '');
    } else this.$().html(value || '') ;
    
    var textAlign = this.get('textAlign');
    if (textAlign) this.$().css('text-align', textAlign) ;
    
    return ret ;
  },
  
  prepareDisplay: function() {
    var ret = sc_super();
    this.updateDisplay();
    return ret ;
  }

});
