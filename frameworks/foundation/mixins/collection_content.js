// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================


/**
  Used for contentIndexDisclosureState().  Indicates open branch node.
  
  @property {Number}
*/
SC.BRANCH_OPEN = 0x0011;

/**
  Used for contentIndexDisclosureState().  Indicates closed branch node.
  
  @property {Number}
*/
SC.BRANCH_CLOSED = 0x0012;

/**
  Used for contentIndexDisclosureState().  Indicates leaf node.
  
  @property {Number}
*/
SC.LEAF_NODE = 0x0020;

/**
  @namespace

  This mixin provides standard methods used by a CollectionView to provide
  additional meta-data about content in a collection view such as selection
  or enabled state.
  
  You can apply this mixin to a class that you set as a delegate or to the
  object you set as content.  SC.ArrayControllers automatically implement
  this mixin.
  
  @since SproutCore 1.0
*/
SC.CollectionContent = {

  /**
    Used to detect the mixin by SC.CollectionView

    @property {Boolean}
  */
  isCollectionContent: YES,
  
  /**
    Return YES if the content index should be selected.  Default behavior 
    looks at the selection property on the view.
    
    @param {SC.CollectionView} view the collection view
    @param {SC.Array} content the content object
    @param {Number} idx the content index
    @returns {Boolean} YES, NO, or SC.MIXED_STATE
  */
  contentIndexIsSelected: function(view, content, idx) {
    var sel = view.get('selection');
    return sel ? sel.contains(content, idx) : NO ;
  },
  
  /**
    Returns YES if the content index should be enabled.  Default looks at the
    isEnabled state of the collection view.
    looks at the selection property on the view.
    
    @param {SC.CollectionView} view the collection view
    @param {SC.Array} content the content object
    @param {Number} idx the content index
    @returns {Boolean} YES, NO, or SC.MIXED_STATE
  */
  contentIndexIsEnabled: function(view, content, idx) {
    return view.get('isEnabled');
  },
  
  // ..........................................................
  // GROUPING
  // 
  
  /**
    Optionally return an index set containing the indexes that may be group
    views.  For each group view, the delegate will actually be asked to 
    confirm the view is a group using the contentIndexIsGroup() method.
    
    If grouping is not enabled, return null.
    
    @param {SC.CollectionView} view the calling view
    @param {SC.Array} content the content object
    @return {SC.IndexSet} 
  */
  contentGroupIndexes: function(view, content) {
    return null;
  },
  
  /**
    Returns YES if the item at the specified content index should be rendered
    using the groupExampleView instead of the regular exampleView.  Note that
    a group view is different from a branch/leaf view.  Group views often 
    appear with different layout and a different look and feel.

    Default always returns NO.
    
    @param {SC.CollectionView} view the collection view
    @param {SC.Array} content the content object
    @param {Number} idx the content index
    @returns {Boolean} YES, NO, or SC.MIXED_STATE
  */
  contentIndexIsGroup: function(view, content, idx) {
    return NO ;
  },
  
  // ..........................................................
  // OUTLINE VIEWS
  // 
  
  /**
    Returns the outline level for the item at the specified index.  Can be 
    used to display hierarchical lists.
    
    Default always returns -1 (no outline).
    
    @param {SC.CollectionView} view the collection view
    @param {SC.Array} content the content object
    @param {Number} idx the content index
    @returns {Boolean} YES, NO, or SC.MIXED_STATE
  */
  contentIndexOutlineLevel: function(view, content, idx) {
    return -1;
  },
  
  /**
    Returns a constant indicating the disclosure state of the item.  Must be
    one of SC.BRANCH_OPEN, SC.BRANCH_CLOSED, SC.LEAF_NODE.  If you return one
    of the BRANCH options then the item may be rendered with a disclosure 
    triangle open or closed.  If you return SC.LEAF_NODe then the item will 
    be rendered as a leaf node.  

    Default returns SC.LEAF_NODE.
    
    @param {SC.CollectionView} view the collection view
    @param {SC.Array} content the content object
    @param {Number} idx the content index
    @returns {Boolean} YES, NO, or SC.MIXED_STATE
  */
  contentIndexDisclosureState: function(view, content, idx) {
    return SC.LEAF_NODE;    
  },
  
  /**
    Called to expand a content index item if it is currently in a closed 
    disclosure state.  The default implementation does nothing.
    
    @param {SC.CollectionView} view the collection view
    @param {SC.Array} content the content object
    @param {Number} idx the content index
    @returns {void}
  */
  contentIndexExpand: function(view, content, idx) {
    console.log('contentIndexExpand(%@, %@, %@)'.fmt(view,content,idx));
  },
  
  /**
    Called to collapse a content index item if it is currently in an open 
    disclosure state.  The default implementation does nothing.  
    
    @param {SC.CollectionView} view the collection view
    @param {SC.Array} content the content object
    @param {Number} idx the content index
    @returns {void}
  */
  contentIndexCollapse: function(view, content, idx) {
    console.log('contentIndexCollapse(%@, %@, %@)'.fmt(view,content,idx));
  }
    
};
