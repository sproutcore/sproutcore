// ========================================================================
// SproutCore
// copyright 2006-2007 Sprout Systems, Inc.
// ========================================================================

require('views/view') ;
require('mixins/control') ;
require('mixins/delegate_support');

/**
  @class
  
  Displays a static string of text.
  
  You use a label view anytime you need to display a static string of text 
  or to display text that may need to be edited using only an inline control.
  
  @extends SC.View
  @extends SC.Control
  @author Charles Jolley
  @version 1.0
*/
SC.LabelView = SC.View.extend(SC.DelegateSupport, SC.Control,
/** @scope SC.LabelView.protoype */ {

  emptyElement: '<span class="sc-label-view"></span>',

  /**
    If true, value will be escaped to avoid scripting attacks.
    
    This is a default value that can be overridden by the
    settings on the owner view.
  */
  escapeHtml: true,

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
    set to true to have any markup in the content escaped.
  */
  escapeHTML: true,

  /**
    set to true to have the value you set automatically localized.
  */
  localize: false,
  

  /**
    Event dispatcher callback.
    If isEditable is set to true, opens the inline text editor view.

    @param {DOMMouseEvent} evt DOM event
    
  */
  doubleClick: function( evt )
  {
    this.beginInlineEdit();
  },
  
  
  /**
    Opens the inline text editor (closing it if it was already open for another view).
    
    @return void
  */
  beginInlineEdit: function()
  {
    if ( !this.get('isEditable') ) return;
    if ( this.get('isEditing') ) return;
    
    this.set('isEditing', true);
    this.set("innerHTML", ''); // blank out the label contents
    this.appendChild( SC.inlineTextEditor );
    SC.inlineTextEditor.field.set('value', this.get('content'));
    SC.inlineTextEditor.field.becomeFirstResponder();
  },
  /**
    Closes the inline text editor.
    
    @return void
  */
  endInlineEdit: function()
  {
    if ( !this.get('isEditing') ) return;

    // if there were changes, then commit them... 
    if ( SC.inlineTextEditor.field.get('value') != this.get('content') )
    {
      this._inlineEditValue = SC.inlineTextEditor.field.get('value') ;
      this._closeInlineEditor(false) ;
    }
    else
    {
      this.cancelInlineEdit() ;
    }
  },
  
  _inlineEditValue: '', 
  
  cancelInlineEdit: function()
  {
    if ( !this.get('isEditing') ) return;
    this._closeInlineEditor(true);
  },
  
  _closeInlineEditor: function(canceled)
  {
    this.set('isEditing', false);
    this.removeChild( SC.inlineTextEditor );
    if(!canceled)
    {
      this.set('content',this._inlineEditValue) ;
      this.commitInlineEdit();
    }  
    else
    {
      this._updateValue() ; // restore value.
    }  
  },
  
  // abstract method... implement to persist changes made in the editor.
  commitInlineEdit: function() {},
  
  /** @private */
  init: function()
  {
    arguments.callee.base.call(this) ;
    
    // if we are supposed to localize, get the content value
    if (this.get("localize")) {
      this.value = this._value = this.get('innerHTML').loc() ;
      if (this.value != '') this.set('innerHTML', this.value) ;
    }
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
    if (value == this._value) return; // nothing to do

    // get display value
    var value = this.get('displayValue') ;
    
    // Escape HTML
    if (this.getDelegateProperty(this.displayDelegate, 'escapeHtml')) {
      this.set('innerText', value || '') ;
    } else this.set('innerHTML', value || '') ;

  }.observes('value')
  

});
