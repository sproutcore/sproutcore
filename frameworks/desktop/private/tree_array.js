// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/**
  @class
  
  A TreeArray works with a TreeController to present a tree of objects as a
  single flat array.  This is a private class used by TreeController.  You
  should not use it in your own application code.
  
  @extends SC.Object
  @extends SC.Array
  @since SproutCore 1.0
*/
SC._TreeArray = SC.Object.extend(SC.Array, 
/** @scope SC._TreeArray.prototype */ {

  /**
    The tree controller this array is managing.
    
    @property
    @type SC.TreeController
  */
  controller: null,

  treeChildrenIsVisibleFor: function(content) {
    return content ? content.get('showChildren') : NO;
  },
  
  treeChildrenFor: function(content) {
    return content ? content.get('children') : null ;
  },
  
  /** 
   Compute an index by walking the tree and building a cache that can be
   used to quickly find locations in the tree and calculate their visible 
   state.
   
   { 
      object: obj, // the object this item represents
      disclosureState: state,
      childCount: x, // number of child nodes if open branch
   }
  */
  treeInfo: function() {
    var children = this.controller.get('content'),
        len      = children.get('length'),
        ret      = [], idx, loc=0;
        
    if (!children) return ret; // nothing to do
    
    for(idx=0;idx<len;idx++) {
      loc = this.fillTreeInfoAt(ret, loc, children.objectAt(idx));
    }
    ret.length = loc; // set length incase we skipped nodes at end
    return ret ;
  }.property().cacheable(),
  
  fillTreeInfoAt: function(info, loc, node) {
    var state      = node ? this.treeDisclosureStateFor(node) : SC.LEAF_NODE;
        childCount = 0,
        next       = loc+1,
        children, idx;
        
    if (state === SC.BRANCH_OPEN) {
      if (children = this.treeChildrenFor(node)) {
        childCount = children.get('length');
        if (this.treeChildrenAreLeafNodes(node, children)) {
          next += childCount ; // all leaf nodes, just make room for them

        } else { // otherwise fill in space for them
          for(idx=0;idx<childCount;idx++) {
            next = this.fillTreeInfoAt(info, next, children.objectAt(idx));
            childCount = next - (loc+1);
          }
        }
      }
    }
    
    // fill in node info for myself
    info[loc] = { node: node, disclosure: state, childCount: childCount };
    return next ;
  },
  
  /**
    Returns the tree info for the node at the specified index.  This will
    compute the tree info if needed then possibly fill in a leaf node as 
    needed.
  */
  treeInfoAt: function(idx) {
    var info = this.get('treeInfo'),
        ret  = info[idx],
        loc = 0, lim = info.length;
        
    if (idx >= lim) return null ; // nothing to do
    
    // if no node was returned, then this is a leaf node.  We need to compute
    // the info by just walking the tree
    if (!ret) {
      while(loc<idx && loc<lim) {
        ret = info[loc];
      }
    }
  },
  
  treeLengthFor: function(children) {  
    var len = children ? children.get('length') : 0,
        ret = len, idx, content, next;

    for(idx=0;idx<len;idx++) {
      content = children.objectAt(idx);      
      if (content && this.treeChildrenIsVisibleFor(content)) {
        len += this.treeLengthFor(this.treeChildrenFor(content));
      }
    }
    
    return length;
  },
  
  // ..........................................................
  // SC.ARRAY SUPPORT
  // 
  
  length: function() {
    var children = this.controller.get('content');
    return children ? this.treeLengthFor(children) : 0 ;
  }.property().cacheable(),

  /**
    Returns the object at the specified index.  The value will be extracted
    from the flattened content array.
  */
  objectAt: function(contentIndex) {
    var info = this.treeInfo(),
        node = info[contentIndex];
    
    // if no node is found then we may not have cached it yet.  Leaf nodes
    // work this way.
  },
  
  /** 
    Primitive to replace specific items in the array.  The range you replace
    must lie entirely within a single parent range in order to work.  
    Otherwise this will raise an exception.
    
    @param {Number} start 
      Starting index in the array to replace.  If idx >= length, then append 
      to the end of the array.

    @param {Number} length
      Number of elements that should be removed from the array, starting at 
      *idx*.

    @param {Array} objects 
      An array of zero or more objects that should be inserted into the array 
      at *idx* 

    @returns {SC.TreeArray} receiver
  */
  replace: function(start, length, objects) {
    
  },
  
});