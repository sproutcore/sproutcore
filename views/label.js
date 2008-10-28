// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('views/view') ;
require('mixins/control') ;
require('mixins/delegate_support');
require('views/inline_text_field');
require('mixins/inline_editor_delegate');

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

  emptyElement: '<span class="sc-label-view"></span>',

  /**
    If true, value will be escaped to avoid scripting attacks.
    
    This is a default value that can be overridden by the
    settings on the owner view.
  */
  escapeHTML: true,

  /**
    If true, then the value will be localized.
    
    This is a default default that can be overidden by the
    settings in the owner view.
  */
  localize: false,
  
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
      var formattedValue = ($type(formatter) == T_FUNCTION) ? formatter(value, this) : formatter.fieldValueForObject(value, this) ;
      if (formattedValue != null) value = formattedValue ;
    }
    
    // 2. If the returned value is an array, convert items to strings and 
    // join with commas.
    if ($type(value) == T_ARRAY) {
      var ary = [];
      for(var idx=0;idx<value.get('length');idx++) {
        var x = value.objectAt(idx) ;
        if (x != null && x.toString) x = x.toString() ;
        ary.push(x) ;
      }
      value = ary.join(',') ;
    }
    
    // 3. If value is not a string, convert to string. (handles 0)
    if (value != null && value.toString) value = value.toString() ;
    
    // 4. Localize
    if (value && this.getDelegateProperty(this.displayDelegate, 'localize')) value = value.loc() ;
    
    return value ;
  }.property('value'),
  
  /**
    enables editing using the inline editor
  */
  isEditable: NO,

  /**
    YES if currently editing label view.
  */
  isEditing: NO,


  /**
    set to true to have the value you set automatically localized.
  */
  localize: false,
  
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
    this._oldOpacity = this.getStyle('opacity') ;
    this.setStyle({ opacity: 0.0 }) ;
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
    this.setStyle({ opacity: this._oldOpacity }) ;
    this._oldOpacity = null ;
    this.set('isEditing', NO) ;
  },

  /** 
    @private
    
    Invoked whenever the monitored value on the content object 
    changes.
    
    The value processed is either the contentValueKey, if set, or 
    it is the content object itself.
  */
  _valueDidChange: function() {

    var value = this.get('value') ;
    if (value === this._value) return; // nothing to do
    this._value = value ;

    // get display value
    value = this.get('displayValue') ;
    
    // Escape HTML
    if (this.getDelegateProperty(this.displayDelegate, 'escapeHTML')) {
      this.set('innerText', value || '') ;
    } else this.set('innerHTML', value || '') ;

  }.observes('value')
  

});
