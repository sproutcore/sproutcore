// ==========================================================================
// SC.TextCellView
// ==========================================================================

require('views/collection/collection_item') ;

/** @class

  A Text Cell can display some textual or HTML content based on a content 
  object.  Unlike a label view, a text cell relies on an owner view (usually
  a collection view) to handle all of its event management and many of its 
  drawing properties and functions.

  @extends SC.View
  @author    AuthorName  
  @version 0.1
*/
SC.TextCellView = SC.View.extend(SC.CollectionItem,
/** @scope SC.TextCellView.prototype */ {

  emptyElement: '<div class="text-cell collection-item"></div>',
  
  /** 
    The content object this text item view will display. 
  */
  content: null,

  /** 
    The owner view of this cell.  The TextCell relies on this
    view to provide many of its behavioral defaults and for 
    event handling.
  */
  owner: null,
  
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
  
  displayProperty: null,
  
  // invoked whenever the content object changes.
  _contentObserver: function() {
    var content = this.get('content') ;
    if (this._content == content) return ;
    var f = this._boundValueDidChange() ;

    // stop observing the old display property, if there is one.
    if (this._content && this._displayProperty) {
      this._content.removeObserver(this._displayProperty, f) ;
    }
    
    // start observing the new display property, if there is one
    this._displayProperty = this._getDefault('displayProperty') ;
    this._content = content ;
    if (this._content && this._displayProperty) {
      this._content.addObserver(this._displayProperty, f) ;
    }
    
    // notify value did change
    this._valueDidChange() ;
  }.observes('content'),
  
  /** 
    @private
    
    Invoked whenever the monitored value on the content object 
    changes.
    
    The value processed is either the displayProperty, if set, or 
    it is the content object itself.
  */
  _valueDidChange: function() {
    var content = this.get('content') ;
    var value = (content && this._displayProperty) ? content.get(this._displayProperty) : content;
    var owner = this.get('owner') ;
    
    // prepare the value...
    
    // 1. apply the formatter
    var formatter = this._getDefault('formatter') ;
    if (formatter) {
      var formattedValue = ($type(formatter) == T_FUNCTION) ? formatter(value, this) : formatter.fieldValueForObject(value, this) ;
      if (formattedValue != null) value = formattedValue ;
    }
    
    // 2. If the returned value is not a string, convert it.
    if (value != null && value.toString) value = value.toString() ;
    
    // 3. Localize
    if (value && this._getDefault('localize')) value = value.loc() ;
    
    // 4. Escape HTML
    if (value && this._getDefault('escapeHtml')) value = value.escapeHTML() ;
    
    this.set('asHTML', value || '') ;
  },
  
  _boundValueDidChange: function() { 
    return this._boundValueDidChange = this._boundValueDidChange  || this._valueDidChange.bind(this); 
  },
  
  // Retrieves the default value from the owner or locally.
  _getDefault: function(keyName) {
    var ret = (this.owner) ? this.owner.get(keyName) : null ;
    return (ret != null) ? ret : this.get(keyName) ;
  }  
}) ;
