// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('mixins/selection_support') ;
require('controllers/object') ;

/** @class

  A CollectionController works just like an ObjectController except that
  it includes support for a few extra items including the arrangedObjects
  property (which may have a filter applied), and a selection.

  This expects the content object to be a Collection object.

  @extends SC.ObjectController
*/
SC.CollectionController = SC.ObjectController.extend(SC.SelectionSupport,
/** @scope SC.CollectionController.prototype */ {

  // ...................................
  // PROPERTIES
  //

  /**
    This is the current set of objects for the UI.
    
    @type Array
  */
  arrangedObjects: [],
  

  /**
    If true, new, add, remove will work.
  
    @type bool
  */
  canEditCollection: false,

  /**
    Set to the total number of items to show on a single page.  If set to
    zero, then no pagination will be performed.
  
    @type number
  */
  pageSize: 0,
  
  /**
    [RO] read only property with the current total number of pages.
  */
  pageCount: function() {
    var pageSize = this.get('pageSize') ;
    if (pageSize <= 0) return 1 ;
    
    var content = this.get('content') ;
    var count = (content && content.get) ? content.get('count') : 0 ;
    if (count === null) count = 0 ;
    return Math.ceil(count / pageSize) ;
  }.property(),
  
  /**
    Set to the current page.  This will change the offset and limit shown in
    the collection.  If you try to set the page to a number greater than the
    maximum, then it will be set to the last page.
  */
  currentPage: function(key, value) {
    if (value !== undefined) {
      // constrain pages.
      if (this._currentPage != value) {
        var pc = Math.max(this.get('pageCount')-1,0);
        if (value > pc) value = pc ;
        if (value < 0) value = 0 ;
        this._currentPage = value ;
      }
    }
    return this._currentPage || 0 ;  
  }.property(),
  
  // ...................................
  // METHODS
  //

  // adds a new object to the current collection, if allowed, and sets it
  // as the current selection.
  newObject: function(settings) {
    var content = this.get('content') ;
    if (!content || !this.get('canEditCollection')) return ; // only if allowed 
    try {
      if (content.newRecord) { 
        var rec = content.newRecord(settings) ;
        var t = function() {
          this.set('selection',(rec) ? [rec] : []) ;
          this._editingNewRecord = rec ;
        }.invokeLater(this, 1) ;
        return rec;
      }
    }   
    catch (e) {
      // DO SOMETHING
    }
  },

  addObjects: function(objects) {
    var content = this.get('content') ;
    if (!content || !this.get('canEditCollection')) return ; // only if allowed 
    try {
      objects = SC.$A(arguments).flatten() ;
      if (content.addRecords) { 
        content.addRecords(objects) ;
        this.set('selection',(objects) ? objects : []) ;
      }
    }   
    catch (e) {
      // DO SOMETHING
    }
  },
  
  addSelection: function() { 
    return this.addObjects(this.get('selection'));
  },
  
  // adds a new object to the current collection, if allowed, and sets it
  // as the current selection.
  removeObjects: function(objects) {
    var content = this.get('content') ;
    if (!content || !this.get('canEditCollection')) return ; // only if allowed 
    try {
      objects = SC.$A(arguments).flatten() ;
      if (content.removeRecords) { 
        var rec = content.removeRecords(objects) ;
        var sel = (this.get('selection') || []).without(objects) ;
        this.set('selection',(sel) ? sel : []) ;
      }
    }   
    catch (e) {
      // DO SOMETHING
    }
  },

  removeSelection: function() {
    return this.removeObjects(this.get('selection')) ;
  },

  // this method is called if a new object was created through the controller
  // and then the selection was changed from the new record without the 
  // record being saved first.  By default, this will remove the object, but
  // you could override it to just do a commit.
  newObjectDidLoseFocus: function(rec) { rec.destroy() ; },
  
  // ...................................
  // PRIVATE
  //
  
  _newRecordDidLoseFocus: function(rec) {
    if (rec.get('newRecord')) this.newObjectDidLoseFocus(rec) ;
  },
  
  // Update the current page.
  _pageObserver: function() {
    // get content -- nothing to do if no content.
    var content = this.get('content') ; 
    if (content instanceof Array) content = content[0] ;
    if (!content) return ; 
    
    var curOffset = content.get('offset') || 0 ;
    var curLimit = content.get('limit') || 0 ;
    var count = content.get('count') || 0 ;

    // calculate the offset and limit.
    var currentPage = this.get('currentPage') ;
    var pageSize = this.get('pageSize') ;
    var newOffset, newLimit ;
    if (pageSize == 0) {
      newOffset = 0; newLimit = 0 ;
    } else {
      newOffset = currentPage * pageSize ;
      newLimit = pageSize ;      
    }
    
    // set new page info.
    if ((newOffset != curOffset) || (newLimit != curLimit)) {
      content.beginPropertyChanges() ;
      content.set('offset',newOffset) ;
      content.set('limit',newLimit) ;
      content.endPropertyChanges() ;
    }    
  }.observes('currentPage','pageCount','pageSize'),
  
  // invoked whenever the list changes.  Updated the arrangedObjects and
  // potentially the selection.
  _recordsObserver: function(target,key,value) {
    var old = this.get('arrangedObjects') ;
    value = Array.from(target.get(key)) ;
    
    this.set('arrangedObjects',value.slice()) ;
    
    // update selection.
    this.updateSelectionAfterContentChange() ;

  }.observes('records') 
  
}) ;
