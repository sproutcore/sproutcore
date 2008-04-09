// ==========================================================================
// SC.TextCellView
// ==========================================================================

require('mixins/control') ;

/** @class

  A Text Cell can display some textual or HTML content based on a content 
  object.  Unlike a label view, a text cell relies on an owner view (usually
  a collection view) to handle all of its event management and many of its 
  drawing properties and functions.

  @extends SC.View
  @author    AuthorName  
  @version 0.1
*/
SC.TextCellView = SC.View.extend(SC.Control,
/** @scope SC.TextCellView.prototype */ {

  emptyElement: '<div class="text-cell collection-item"></div>',

  /** 
    The value of the text cell.
    
    You may also set the value using a content object and a 
    contentValueProperty.
    
    @field {String}
  */
  value: '',

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
  
  contentValueProperty: null,
    
  /** 
    @private
    
    Invoked whenever the monitored value on the content object 
    changes.
    
    The value processed is either the contentValueProperty, if set, or 
    it is the content object itself.
  */
  _valueDidChange: function() {
    var value = this.get('value') ;
    var owner = this.get('owner') ;
    
    // 1. apply the formatter
    var formatter = this.getDelegateProperty(this.collectionDelegate, 'formatter') ;
    if (formatter) {
      var formattedValue = ($type(formatter) == T_FUNCTION) ? formatter(value, this) : formatter.fieldValueForObject(value, this) ;
      if (formattedValue != null) value = formattedValue ;
    }
    
    // 2. If the returned value is not a string, convert it.
    if (value != null && value.toString) value = value.toString() ;
    
    // 3. Localize
    if (value && this.getDelegateProperty(this.collectionDelegate, 'localize')) value = value.loc() ;
    
    // 4. Escape HTML
    if (this.getDelegateProperty(this.collectionDelegate, 'escapeHtml')) {
      this.set('innerText', value || '') ;
    } else this.set('innerHTML', value || '') ;

  }.observes('value')
  
}) ;
