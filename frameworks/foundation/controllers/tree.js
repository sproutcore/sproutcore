// ========================================================================
// SproutCore -- JavaScript Application Framework
// Copyright ©2006-2008, Sprout Systems, Inc. and contributors.
// Portions copyright ©2008 Apple Inc.  All rights reserved.
// ========================================================================

sc_require('controllers/object');
sc_require('mixins/selection_support');
sc_require('private/tree_item_observer');

/**
  @class

  A TreeController manages a tree of model objects that you might want to 
  display in the UI using a collection view.  For the most part, you should
  work with a TreeController much like you would an ObjectController, except
  that the TreeController will also provide an arrangedObjects property that 
  can be used as the content of a CollectionView.
  
  TODO: Document More

  @extends SC.ObjectController
  @extends SC.SelectionSupport
  @since SproutCore 1.0
*/
SC.TreeController = SC.ObjectController.extend(SC.SelectionSupport,
/** @scope SC.TreeController.prototype */ {

  // ..........................................................
  // PROPERTIES
  // 
  
  /**
    Set to YES if you want the top-level items in the tree to be displayed as
    group items in the collection view.
    
    @property {Boolean}
  */
  treeItemIsGrouped: NO,
  
  /**
    If your content support expanding and collapsing of content, then set this
    property to the name of the key on your model that should be used to 
    determine the expansion state of the item.  The default is 
    "treeItemIsExpanded"
    
    @property {String}
  */
  treeItemIsExpandedKey: "treeItemIsExpanded",
  
  /**
    Set to the name of the property on your content object that holds the 
    children array for each tree node.  The default is "treeItemChildren".
    
    @property {String}
  */
  treeItemChildrenKey: "treeItemChildren",
  
  /**
    Returns an SC.Array object that actually will represent the tree as a 
    flat array suitable for use by a CollectionView.  Other than binding this
    property as the content of a CollectionView, you generally should not 
    use this property directly.  Instead, work on the tree content using the
    TreeController like you would any other ObjectController.
  
    @property {SC.Array}
  */
  arrangedObjects: function() {
    var ret, content = this.get('content');
    if (content) {
      ret = SC.TreeItemObserver.create({ item: content, delegate: this });
    } else ret = null; // empty!
    this._sctc_arrangedObjects = ret ;
    
    return ret ;
  }.property().cacheable(),

  // ..........................................................
  // PRIVATE
  // 
  
  /**
    @private
    
    Manually invalidate the arrangedObjects cache so that we can teardown
    any existing value.  We do it via an observer so that this will fire 
    immediately instead of waiting on some other component to get 
    arrangedObjects again.
  */
  _sctc_invalidateArrangedObjects: function() {
    this.propertyWillChange('arrangedObjects');
    
    var ret = this._sctc_arrangedObjects;
    if (ret) ret.destroy();
    this._sctc_arrangedObjects = null;
    
    this.propertyDidChange('arrangedObjects');
  }.observes('content', 'treeItemIsExpandedKey', 'treeItemChildrenKey', 'treeItemIsGrouped'),
  
  _sctc_arrangedObjectsContentDidChange: function() {
    this.updateSelectionAfterContentChange();
  }.observes('*arrangedObjects.[]'),
  
  /**
    @private
    
    Returns the first item in arrangeObjects that is not a group.  This uses
    a brute force approach right now; we assume you probably don't have a lot
    of groups up front.
  */
  firstSelectableObject: function() {
    var objects = this.get('arrangedObjects'),
        indexes, len, idx     = 0;
        
    if (!objects) return null; // fast track
    
    indexes = objects.contentGroupIndexes(null, objects);
    len = objects.get('length');
    while(indexes.contains(idx) && (idx<len)) idx++;
    return idx>=len ? null : objects.objectAt(idx);
  }.property()
  
});

