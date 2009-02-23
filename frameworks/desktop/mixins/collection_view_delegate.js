// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/**
  Indicates that the collection view expects to accept a drop ON the specified
  item.
*/
SC.DROP_ON = 0x01 ;

/**
  Indicates that the collection view expects to accept a drop BEFORE the 
  specified item.
*/
SC.DROP_BEFORE = 0x02 ;

/**
  Indicates that the collection view want's to know which operations would 
  be allowed for either drop operation.
*/
SC.DROP_ANY = 0x03 ;

/**
  @namespace

  A Collection View Delegate is consulted by a SC.CollectionView's to control
  certain behaviors such as selection control and drag and drop behaviors.
  
  To act as a Collection Delegate, the object should be set as the delegate
  property of the collection view and should implement one or more of the
  methods below.
  
  You can also choose to mixin this delegate to get suitable default 
  implementations of these methods.
  
  @since SproutCore 1.0
*/
SC.CollectionViewDelegate = {
  
  /**
    This method will be called anytime the collection view is about to
    change the selection in response to user mouse clicks or keyboard events.
    
    You can use this method to adjust the proposed selection, eliminating any
    selected objects that cannot be selected.  The default implementation of
    this method simply returns the proposed selection.
    
    @param view {SC.CollectionView} the collection view
    @param sel {Array} Proposed array of selected objects.
    @returns The actual array allowed or null if no change is allowed.
  */
  collectionViewSelectionForProposedSelection: function(view, sel) {
    return sel ;
  },

  /**
    Called by the collection view just before it starts a drag to give you
    an opportunity to decide if the drag should be allowed. 
    
    You can use this method to implement fine-grained control over when a 
    drag will be allowed and when it will not be allowed.  For example, you
    may enable content reordering but then implement this method to prevent
    reordering of certain items in the view.
    
    The default implementation always returns YES.
    
    @param view {SC.CollectionView} the collection view
    @returns {Boolean} YES to alow, NO to prevent it
  */
  collectionViewShouldBeginDrag: function(view) { return YES; },
  
  /**
    Called by the collection view just before it starts a drag so that 
    you can provide the data types you would like to support in the data.
    
    You can implement this method to return an array of the data types you
    will provide for the drag data.
    
    If you return null or an empty array, can you have set canReorderContent
    to YES on the CollectionView, then the drag will go ahead but only 
    reordering will be allowed.  If canReorderContent is NO, then the drag
    will not be allowed to start.
    
    If you simply want to control whether a drag is allowed or not, you
    should instead implement collectionViewShouldBeginDrag().
    
    The default returns an empty array.
    
    @param view {SC.CollectionView} the collection view to begin dragging.
    @returns {Array} array of supported data types.
  */
  collectionViewDragDataTypes: function(view) { return []; },
  
  /**
    Called by a collection view when a drag concludes to give you the option
    to provide the drag data for the drop.
    
    This method should be implemented essentially as you would implement the
    dragDataForType() if you were a drag data source.  You will never be asked
    to provide drag data for a reorder event, only for other types of data.
    
    The default implementation returns null.
    
    @param view {SC.CollectionView} the collection view that initiated the drag
    @param dataType {String} the data type to provide
    @param drag {SC.Drag} the drag object
    @returns {Object} the data object or null if the data could not be provided.
  */
  collectionViewDragDataForType: function(view, drag, dataType) {  
    return null ;
  },
  
  /**
    Called once during a drag the first time view is entered. Return all possible
    drag operations OR'd together.
    
    @param view {SC.CollectionView} the collection view that initiated the drag
    @param drag {SC.Drag} the drag object
    @param proposedDragOperations {Number} proposed logical OR of allowed drag operations.
    @returns {Number} the allowed drag operations. Defaults to op
  */
  collectionViewComputeDragOperations: function(view, drag, proposedDragOperations) {
    return proposedDragOperations ;
  },
  
  /**
    Called by the collection view during a drag to let you determine the
    kind and location of a drop you might want to accept.
    
    You can override this method to implement fine-grained control over how
    and when a dragged item is allowed to be dropped into a collection view.

    This method will be called by the collection view both to determine in 
    general which operations you might support and specifically the operations
    you would support if the user dropped an item over a specific location.
    
    If the proposedDropOperaration parameter is SC.DROP_ON or SC.DROP_BEFORE, then the
    proposedInsertionPoint will be a non-negative value and you should
    determine the specific operations you will support if the user dropped the
    drag item at that point.
    
    If you do not like the proposed drop operation or insertion point, you 
    can override these properties as well by setting the proposedDropOperation
    and proposedInsertionIndex properties on the collection view during this
    method.  These properties are ignored all other times.
    
    @param view {SC.CollectionView} the collection view
    @param drag {SC.Drag} the current drag object
    @param op {Number} proposed logical OR of allowed drag operations.
    @param proposedInsertionIndex {Number} an index into the content array 
      representing the proposed insertion point.
    @param proposedDropOperation {String} the proposed drop operation.  Will be one of SC.DROP_ON, SC.DROP_BEFORE, or SC.DROP_ANY.
    @returns the allowed drag operation.  Defaults to op
  */
  collectionViewValidateDragOperation: function(view, drag, op, proposedInsertionIndex, proposedDropOperaration) {
    return op ;
  },
  
  /**
    Called by the collection view to actually accept a drop.  This method will
    only be invoked AFTER your validateDrop method has been called to
    determine if you want to even allow the drag operation to go through.
    
    You should actually make changes to the data model if needed here and
    then return the actual drag operation that was performed.  If you return
    SC.DRAG_NONE and the dragOperation was SC.DRAG_REORDER, then the default
    reorder behavior will be provided by the collection view.
    
    @param view {SC.CollectionView}
    @param drag {SC.Drag} the current drag object
    @param op {Number} proposed logical OR of allowed drag operations.
    @param proposedInsertionIndex {Number} an index into the content array representing the proposed insertion point.
    @param proposedDropOperation {String} the proposed drop operation.  Will be one of SC.DROP_ON, SC.DROP_BEFORE, or SC.DROP_ANY.
    @returns the allowed drag operation.  Defaults to proposedDragOperation
  */
  collectionViewPerformDragOperation: function(view, drag, op, proposedInsertionIndex, proposedDropOperaration) {
    return SC.DRAG_NONE ;
  },
  
  /**
    Called by the collection view whenever the deleteSelection() method is
    called.  You can implement this method to get fine-grained control over
    which items can be deleted.  To prevent deletion, return null.
    
    This method is only called if canDeleteContent is YES on the collection
    view.
    
    @param view {SC.CollectionView} the collection view
    @param item {Array} proposed array  of items to delete.
    @returns {Array} items allowed to delete or null.
  */
  collectionViewShouldDeleteContent: function(view, items) { return items; },
  
  /**
    Called by the collection view to actually delete the selected items.
    
    The default behavior will use standard array operators to remove the 
    items from the content array.  You can implement this method to provide
    your own deletion method.
    
    If you simply want to controls the items to be deleted, you should instead
    implement collectionViewShouldDeleteItems().  This method will only be 
    called if canDeleteContent is YES and collectionViewShouldDeleteContent()
    returns a non-empty array.
    
    @param view {SC.CollectionView} the view collection view
    @param items {Array} the items to delete
    @returns {Boolean} YES if the operation succeeded, NO otherwise.
  */
  collectionViewDeleteContent: function(view, items) { return NO; },
  
  /**
    Called by the collection when attempting to select an item.
    
    The default implementation always returns YES.
    
    @param view {SC.CollectionView} the view collection view
    @param item {Object} the item to be selected
    @returns {Boolean} YES to alow, NO to prevent it
  */
  collectionViewShouldSelectItem: function (view, item) { return YES; }
  
};
