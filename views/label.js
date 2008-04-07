// ========================================================================
// SproutCore
// copyright 2006-2007 Sprout Systems, Inc.
// ========================================================================

require('views/view') ;

SC.LabelView = SC.View.extend({

  /**
  * Can the label be edited using the inline editor?
  * @type Boolean
  **/
  isEditable: false,
  /**
  * Is the editor open?
  * @type Boolean
  **/
  isEditing: false,


  /**
    set to true to have any markup in the content escaped.
  */
  escapeHTML: true,

  /**
    set to true to have the value you set automatically localized.
  */
  localize: false,
  
  
  /**
  * @constructor
  */
  init: function()
  {
    arguments.callee.base.call(this) ;
    if (this.get("localize"))
    {
      var inner = this.get("innerHTML");
      if (inner !== "") this.set("content", inner);
    }
  },

  /**
  * Event dispatcher callback.
  * If isEditable is set to true, opens the inline text editor view.
  * @param {DOMMouseEvent} evt DOM event
  */
  doubleClick: function( evt )
  {
    this.beginInlineEdit();
  },
  
  
  /**
  * Opens the inline text editor (closing it if it was already open for another view).
  * @return void
  **/
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
  * Closes the inline text editor.
  * @return void
  **/
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


  // setting this to a non-null value will cause the label to get the
  // property value and use that for display.
  property: function(key, value) {
    if ((value !== undefined) && (value != this._property)) {
      if (this._content) {
        var func = this._boundObserver() ;
        if (this._property && this._content && this._content.removeObserver) this._content.removeObserver(this._property,func);
        this._property = value ;
        if (this._property && this._content && this._content.addObserver) this._content.addObserver(this._property,func) ;
      } else this._property = value ;
    }
    return this._property ;
  }.property(),
  
  // set to a validator object to have your content converted using the
  // validator.  The formatter will be applied before localization.
  formatter: null,
  
  // change this property value to update the content.
  content: function(key,value) {
    if ((value !== undefined) && (this._content != value)) {
      var prop = this.get('property') ;
      var func = this._boundObserver() ;
      if (prop && this._content && this._content.removeObserver) this._content.removeObserver(prop, func) ;
      this._content = value ;
      if (prop && this._content && this._content.addObserver) this._content.addObserver(prop, func) ;
      this._updateValue() ;      
    } 
    return this._content ;
  }.property(),

  contentBindingDefault: SC.Binding.Single,

  _updateValue: function() {
    var value = this._content ;
    var prop = this.get('property') ;
    if (prop && value && value.get) value = value.get(prop) ;

    // apply formatter
    var formatter = this.get('formatter') ;
    if (formatter) {
      var formattedValue = (SC.typeOf(formatter) == "function") ? formatter(value,this) : formatter.fieldValueForObject(value) ;
      if (formattedValue) value = formattedValue ;
    }

    if ($type(value) == 'number') value = value.toString() ; // handle 0
    
    // localize
    if (value && this.get('localize')) value = value.loc() ;
    
    if (this.get('escapeHTML')) {
      this.set('innerText', value || '') ;
    } else {
      this.set('innerHTML',value || '') ;
    }

  },
  
  _boundObserver: function() {
    if (!this._observer) this._observer = this._updateValue.bind(this) ;
    return this._observer ;
  }

});
