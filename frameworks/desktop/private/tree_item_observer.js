// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/**
  @class
  
  A TreeNode is an internal class that will manage a single item in a tree
  when trying to display the item in a hierarchy. 
  
  When displaying a tree of objects, a tree item object will be nested to 
  cover every object that might have child views.
  
  TreeNode stores an array which contains either a number pointing to the 
  next place in the array there is a child item or it contains a child item.
*/
SC._TreeItemObserver = SC.Object.extend(SC.Array, {

  /**
    The node in the tree this observer will manage.  Set when creating the
    object.
  */
  item: null,

  /**
    The parent TreeItemObserver for this observer.  Must be set on create.
  */
  parent: null,

  /**
    Index location in parent's children array.
  */
  index: 0,
  
  /**
    The controller delegate used to extract information from the item.
  */
  delegate: null,
  
  /**
    Array of children.  Extracted from the item if not set on init.
  */
  children: null,
  
  // ..........................................................
  // EXTRACTED FROM DELEGATE
  // 
  
  /**
    Disclosure state of this item.  Must be SC.BRANCH_OPEN or SC.BRANCH_CLOSED
    If this is the root of a item tree, the observer will have children but
    no parent or parent item.  IN this case the disclosure state is always
    SC.BRANCH_OPEN.
    
    @property
    @type Number
  */
  disclosureState: SC.BRANCH_OPEN,

  /**
    IndexSet of children with branches.  This will ask the delegate to name 
    these indexes.  The default implementation will iterate over the children
    of the item but a more optimized version could avoid touching each item.
    
    @property
    @type SC.IndexSet
  */
  branchIndexes: function() {
    var del    = this.get('delegate'),
        item   = this.get('item'),
        parent = item ? this.get('parent') : null,
        pitem  = parent ? parent.get('item') : null,
        index  = parent ? this.get('index') : -1;
        
    return del.treeItemBranchIndexes(item, pitem, index);
  }.property().cacheable(),
  
  
  // ..........................................................
  // SC.ARRAY SUPPORT
  // 
  
  /**
    Get the current length of the tree item including any of its children.
  */
  length: 0,
  
  /**
    Get the object at the specified index.  This will talk the tree info
    to determine the proper place.  The offset should be relative to the 
    start of this tree item.  Calls recursively down the tree.
    
    This should only be called with an index you know is in the range of item
    or its children based on looking at the length.
  */
  objectAt: function(index) {
    var len   = this.get('length'),
        item  = this.get('item'), 
        cache = this._objectAtCache,
        cur   = index,
        loc   = 0,
        indexes, children;
     
    if (index >= len) return undefined;
    
    if (item) {
      if (index === 0) return item;
      else cur = cur-1; // lookup in children
      item = null; 
    }

    if (!cache) cache = this._objectAtCache = [];
    if ((item = cache[index]) !== undefined) return item ;

    children = this.get('children');
    if (!children) return undefined; // no children - nothing to get
    
    // loop through branch indexes, reducing the offset until it matches 
    // something we might actually return.
    if (indexes = this.get('branchIndexes')) {
      indexes.forEach(function(i) {
        if (item || (i > cur)) return ; // past end - nothing to do

        var observer = this.branchObserverAt(i),
            len      = observer.get('length');

        // if cur lands inside of this observer's length, use objectAt to get
        // otherwise, just remove len from cur.
        if (i+len > cur) {
          item = observer.objectAt(cur-i);
          cur  = -1;
        } else cur -= len-1 ;
        
      },this);
    }
    
    if (cur>=0) item = children.objectAt(cur); // get internal if needed
    cache[index] = item ; // save in cache 
    
    return item ;
  },

  /**
    Called whenever the content for the passed observer has changed.  Default
    version notifies the parent if it exists and updates the length.
    
    The start, amt and delta params should reflect changes to the children
    array, not to the expanded range for the wrapper.
  */
  observerContentDidChange: function(start, amt, delta) {
    
    // clear caches
    this.invalidateBranchObserversAt(start);
    this._objectAtCache = null;
    this.notifyPropertyChange('branchIndexes');
    
    var oldlen = this.get('length'),
        newlen = this._computeLength(),
        parent = this.get('parent'), set;
    
    // update length if needed
    if (oldlen !== newlen) this.set('length', newlen);
    
    // if we have a parent, notify that parent that we have changed.
    if (!this._notifyParent) return this; // nothing more to do
    
    if (parent) {
      set = SC.IndexSet.create(this.get('index'));
      parent._childrenRangeDidChange(parent.get('children'), null, '[]', set);
      
    // otherwise, note the enumerable content has changed.  note that we need
    // to convert the passed change to reflect the computed range
    } else {
      if (SC.stopIt) debugger ;
      if (oldlen === newlen) {
        amt = this.expandChildIndex(start+amt);
        start = this.expandChildIndex(start);
        amt = amt - start ;
        delta = 0 ;
        
      } else {
        start = this.expandChildIndex(start);
        amt   = newlen - start;
        delta = newlen - oldlen ;
      }

      console.log('%@.enumerableContentDidChange(%@,%@,%@)'.fmt(this, start, amt, delta));
      this.enumerableContentDidChange(start, amt, delta);
    }
  },

  /**
    Accepts a child index and expands it to reflect any nested groups.
  */
  expandChildIndex: function(index) {
    
    var ret = this.parent ? index+1 : index; // add 1 for item header

    // fast path
    var branches = this.get('branchIndexes');
    if (!branches || branches.get('length')===0) return ret;
    
    // we have branches, adjust for their length
    branches.forEachIn(0, index, function(idx) {
      ret += this.branchObserverAt(idx).get('length')-1;
    }, this);
    
    return ret; // add 1 for item header
  },
  
  // ..........................................................
  // BRANCH NODES
  //   

  /**
    Returns the branch item for the specified index.  If none exists yet, it
    will be created.
  */
  branchObserverAt: function(index) {
    var byIndex = this._branchObserversByIndex,
        indexes = this._branchObserverIndexes,
        ret, parent, pitem, item, children, guid, del ;
        
    if (!byIndex) byIndex = this._branchObserversByIndex = [];
    if (!indexes) {
      indexes = this._branchObserverIndexes = SC.IndexSet.create();
    }

    if (ret = byIndex[index]) return ret ; // use cache

    // no observer for this content exists, create one
    del    = this.get('delegate');
    parent = this.get('parent');
    pitem  = parent ? parent.get('item') : null ;
    children = this.get('children');
    item   = children ? children.objectAt(index) : null ;
    
    byIndex[index] = ret = SC._TreeItemObserver.create({
      item:     item,
      delegate: del,
      parent:   this,
      index:  index
    });
    indexes.add(index); // save for later invalidation
    return ret ;
  },
  
  /**
    Invalidates any branch observers on or after the specified index range.
  */
  invalidateBranchObserversAt: function(index) {
    var byIndex = this._branchObserversByIndex,
        indexes = this._branchObserverIndexes;

    if (!byIndex || byIndex.length<=index) return this ; // nothing to do
    if (index < 0) index = 0 ;
    
    // destroy any observer on or after the range
    indexes.forEachIn(index, indexes.get('max')-index, function(i) {
      var observer = byIndex[i];
      if (observer) observer.destroy();
    }, this);
    
    byIndex.length = index; // truncate to dump extra indexes
    
    return this;
  },
  
  // ..........................................................
  // INTERNAL METHODS
  // 
  
  init: function() {
    sc_super();
    
    // begin all properties on item if there is one.  This will allow us to
    // track important property changes.
    var item = this.get('item'), children = this.get('children');
    if (item) {
      item.addObserver('*', this, this._itemPropertyDidChange);
      this._itemPropertyDidChange(item, '*');
    } else if (children) this._childrenDidChange();
    this._notifyParent = YES ;
  },
  
  /**
    Called just before a branch observer is removed.  Should stop any 
    observering and invalidate any child observers.
  */
  destroy: function() {
    this.invalidateBranchObserversAt(0);
    this._objectAtCache = null ;
    sc_super();
  },
  
  /**
    Called whenever a property changes on the item.  Determines if either the
    children array or the disclosure state has changed and then notifies as 
    necessary..
  */
  _itemPropertyDidChange: function(target, key) {
    var children = this.get('children'),
        state    = this.get('disclosureState'),
        next ;
        
    this.beginPropertyChanges();
    
    next = this._computeDisclosureState();
    if (state !== next) this.set('disclosureState', next);
    
    next = this._computeChildren();
    if (children !== next) this.set('children', next);
    
    this.endPropertyChanges();
  },
  
  /**
    Called whenever the children or disclosure state changes.  Begins or ends
    observing on the children array so that changes can propogate outward.
  */
  _childrenDidChange: function() {
    var state = this.get('disclosureState'),
        cur   = state === SC.BRANCH_OPEN ? this.get('children') : null,
        last  = this._children,
        ro    = this._childrenRangeObserver;
        
    if (last === cur) return this; //nothing to do
    if (ro) last.removeRangeObserver(ro);
    if (cur) {
      this._childrenRangeObserver = 
          cur.addRangeObserver(null, this, this._childrenRangeDidChange);
    } else this._childrenRangeObserver = null;
    
    this._children = cur ;
    this._childrenRangeDidChange(cur, null, '[]', null);
    
  }.observes("children", "disclosureState"),

  /**
    Called anytime the actual content of the children has changed.  If this 
    changes the length property, then notifies the parent that the content
    might have changed.
  */
  _childrenRangeDidChange: function(array, objects, key, indexes) {
    var children = this.get('children'),
        len = children ? children.get('length') : 0,
        min = indexes ? indexes.get('min') : 0,
        max = indexes ? indexes.get('max') : len,
        old = this._childrenLen || 0;
        
    this._childrenLen = len; // save for future calls
    this.observerContentDidChange(min, max-min, len-old);
  },
  
  /**
    Computes the current disclosure state of the item by asking the delegate.
  */
  _computeDisclosureState: function() {
    var del    = this.get('delegate'),  
        item   = this.get('item'),
        parent = this.get('parent'),
        pitem  = parent ? parent.get('item') : null,
        index  = parent ? this.get('index') : null;
        
    if (item||parent) return del.treeItemDisclosureState(item, pitem, index);
    else return SC.BRANCH_OPEN;
  },
  
  /**
    Computes the current children property by asking the delegate.
  */
  _computeChildren: function() {
    var del    = this.get('delegate'),
        item   = this.get('item'),
        parent = this.get('parent'),
        pitem  = parent ? parent.get('item') : null,
        index  = parent ? this.get('index') : -1 ;
    return del.treeItemChildren(item, pitem, index);
  },
  
  /**
    Computes the length of the array by looking at children.
  */
  _computeLength: function() {
    var ret = this.get('item') ? 1 : 0,
        children, indexes ;
        
    // if disclosure is open, add children count + length of branch observers.
    if (this.get('disclosureState') === SC.BRANCH_OPEN && (children = this.get('children'))) {
      ret += children.get('length');
      if (indexes = this.get('branchIndexes')) {
        indexes.forEach(function(idx) {
          var observer = this.branchObserverAt(idx);
          ret += observer.get('length')-1;
        }, this);
      }
    } 
    return ret ;
  }
    
});


SC._TreeArray = SC._TreeItemObserver.extend({
    
});

/**
  @namespace
  
  A TreeItem delegate implements the added methods needed to flatten a tree
  array.  This delegate prototcol is implemented by SC.ArrayController and 
  SC.TreeController.  You do not normally need to implement this yourself,
  though you may choose to override some of these methods to provides 
  optimized behaviors if needed.
  
  @since SproutCore 1.0
*/
SC.TreeItemDelegate = {

  /**
    Returns the array of "child" items for the passed node. 
    
    The default implementation looks for a "children" property on the passed
    item.  The Controllers override this with their own, more configurable,
    implementations.

    If the item is a leaf node and does not contain children, then return 
    null.
    
    If the parent parameter is null, then this item is part of the root 
    children array.  If the parent is null and the index is -1, then you 
    should return the root children array itself.
    
    @param {Object} item the tree item
    @param {Object} parent the parent item containing this item
    @param {Number} index the index of the item in the parent
    @returns {SC.Array} children array
  */
  treeItemChildren: function(item, parent, index) {
    if (item) return item.get ? item.get('children') : item.children;
    else return null ;
  },
  
  /**
    Returns the disclosure state for the item, which is appears at the passed
    index of the parent object.  Must be one of SC.BRANCH_OPEN, 
    SC.BRANCH_CLOSED or SC.LEAF_NODE.

    If the parent parameter is null, then this item is part of the root 
    children array.
    
    This method will only be called for tree items that have children.  Tree
    items with no children are assumed to be leaf nodes.
    
    @param {Object} item the tree item
    @param {Object} parent the parent item containing this item
    @param {Number} idx the index of the item in the parent
    @returns {Number} branch state
  */
  treeItemDisclosureState: function(item, parent, idx) {
    return item ? SC.BRANCH_OPEN : SC.LEAF_NODE;
  },
  
  /**
    Returns an index set containing the child indexes of the item that are 
    themselves branches.  This will only be called on tree items with a branch
    disclosure state.
    
    If the passed item, parent, and index properties are all null, then this
    method should return the branch indexes for the root array of children.
    
    The default implementation iterates over the item's children to get the
    disclosure state of each one.  Child items will a branch disclosure state
    will have their index added to the return index set.  
    
    You may want to override this method to provide a more efficient 
    implementation if you are working with large data sets and can infer which
    children are branches without iterating over each one.

    @param {Object} item the tree item
    @param {Object} parent the parent item containing this item
    @param {Number} index the index of the item in the parent
    @param {SC.IndexSet} branch indexes
  */
  treeItemBranchIndexes: function(item, parent, index) {
    var children = this.treeItemChildren(item, parent, index),
        ret, lim;
    if (!children) return null ; // nothing
    
    ret = SC.IndexSet.create();
    lim = children.get('length');
    parent = item ;
    for(index=0;index<lim;index++) {
      item = children.objectAt(index);
      if (!this.treeItemChildren(item, parent, index)) continue ;
      if (this.treeItemDisclosureState(item, parent, index) !== SC.LEAF_NODE){
        ret.add(index);
      }
    }
    return ret.get('length')>0 ? ret : null;
  }
  
};
