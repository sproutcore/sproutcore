// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

sc_require('mixins/tree_item_content');
sc_require('mixins/collection_content');

/** 
  @ignore
  @class
  
  A TreeNode is an internal class that will manage a single item in a tree
  when trying to display the item in a hierarchy. 
  
  When displaying a tree of objects, a tree item object will be nested to 
  cover every object that might have child views.
  
  TreeNode stores an array which contains either a number pointing to the 
  next place in the array there is a child item or it contains a child item.
  
  @extends SC.Object
  @extends SC.Array
  @extends SC.CollectionContent
  @since SproutCore 1.0
*/
SC.TreeItemObserver = SC.Object.extend(SC.Array, SC.CollectionContent, {

  /**
    The node in the tree this observer will manage.  Set when creating the
    object.  If you are creating an observer manually, you must set this to
    a non-null value.
  */
  item: null,

  /**
    The controller delegate.  If the item does not implement the 
    TreeItemContent method, delegate properties will be used to determine how
    to access the content.  Set automatically when a tree item is created.
    
    If you are creating an observer manually, you must set this to a non-null
    value.
  */
  delegate: null,
  
  // ..........................................................
  // FOR NESTED OBSERVERS
  // 
  
  /**
    The parent TreeItemObserver for this observer.  Must be set on create.
  */
  parentObserver: null,

  /**
    The parent item for the observer item.  Computed automatically from the 
    parent.  If the value of this is null, then this is the root of the tree.
  */
  parentItem: function() {
    var p = this.get('parentObserver');
    return p ? p.get('item') : null;
  }.property('parentObserver').cacheable(),
  
  /**
    Index location in parent's children array.  If this is the root item
    in the tree, should be null.
  */
  index: null,
  
  outlineLevel: 0, 
  
  // ..........................................................
  // EXTRACTED FROM ITEM
  // 
  
  /**
    Array of child tree items.  Extracted from the item automatically on init.
  */
  children: null,
  
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
    var item = this.get('item'), 
        len, pitem, idx, children, ret;
    
    // no item - no branches
    if (!item) return SC.IndexSet.EMPTY;
    
    // if item is treeItemContent then ask it directly
    else if (item.isTreeItemContent) {
      pitem  = this.get('parentItem');
      idx    = this.get('index') ;
      return item.treeItemBranchIndexes(pitem, idx);
      
    // otherwise, loop over children and determine disclosure state for each
    } else {
      children = this.get('children');
      if (!children) return null; // no children - no branches
      ret = SC.IndexSet.create();
      len = children.get('length');
      pitem = item ; // save parent
      
      for(idx=0;idx<len;idx++) {
        if (!(item = children.objectAt(idx))) continue ;
        if (!this._computeChildren(item, pitem, idx)) continue; // no chil'en
        if (this._computeDisclosureState(item, pitem, idx) !== SC.LEAF_NODE) {
          ret.add(idx);
        }
      }

      return ret.get('length')>0 ? ret : null;
    }
  }.property('children').cacheable(),
  
  /**
    Returns YES if the item itself should be shown, NO if only its children
    should be shown.  Normally returns YES unless the parentObject is null.
  */
  isHeaderVisible: function() {
    return !!this.get('parentObserver');
  }.property('parentObserver').cacheable(),
  
  /**
    Get the current length of the tree item including any of its children.
  */
  length: 0,
  
  // ..........................................................
  // SC.ARRAY SUPPORT
  // 
  
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
    if (this.get('isHeaderVisible')) {
      if (index === 0) return item;
      else cur--;
    }
    item = null; 

    if (!cache) cache = this._objectAtCache = [];
    if ((item = cache[index]) !== undefined) return item ;

    children = this.get('children');
    if (!children) return undefined; // no children - nothing to get
    
    // loop through branch indexes, reducing the offset until it matches 
    // something we might actually return.
    if (indexes = this.get('branchIndexes')) {
      indexes.forEach(function(i) {
        if (item || (i > cur)) return ; // past end - nothing to do

        var observer = this.branchObserverAt(i), len;
        if (!observer) return ; // nothing to do

        // if cur lands inside of this observer's length, use objectAt to get
        // otherwise, just remove len from cur.
        len = observer.get('length') ;
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
    Implements SC.Array.replace() primitive.  For this method to succeed, the
    range you replace must lie entirely within the same parent item, otherwise
    this will raise an exception.
    
    Note that this replace method accepts an additional parameter "operation"
    which is used when you try to insert an item on a boundary between 
    branches whether it should be inserted at the end of the previous group
    after the group.  If you don't pass operation, the default is 
    SC.DROP_BEFORE, which is the expected behavior.
  */
  replace: function(start, amt, objects, operation) {

    var cur      = start,
        observer = null,
        indexes, len, max;
        
    if (operation === undefined) operation = SC.DROP_BEFORE;
    
    // adjust the start location based on branches, possibly passing on to an
    // observer.
    if (this.get('isHeaderVisible')) cur--; // exclude my own header item 
    if (cur < 0) throw "Tree Item cannot replace itself";

    // remove branch lengths.  If the adjusted start location lands inside of
    // another branch, then just let that observer handle it.
    if (indexes = this.get('branchIndexes')) {
      indexes.forEach(function(i) {
        if (observer || (i>=cur)) return ; // nothing to do
        if (!(observer = this.branchObserverAt(i))) return; // nothing to do
        len = observer.get('length');
        
        // if this branch range is before the start loc, just remove it and 
        // go on.  If cur is somewhere inside of the range, then save to pass
        // on.  Note use of operation to determine the abiguous end op.
        if ((i+len === cur) && operation === SC.DROP_AFTER) cur -= i;
        else if (i+len > cur) cur -= i; // put inside of nested range
        else {
          cur -= len-1; observer = null ;
        }
      }, this);      
    }
      
    // if an observer was saved, pass on call.
    if (observer) {
      observer.replace(cur, amt, objects, operation);
      return this;
    }
    
    // no observer was saved, which means cur points to an index inside of
    // our own range.  Now amt just needs to be adjusted to remove any
    // visible branches as well.
    max = cur + amt;
    if (amt>1 && indexes) { // if amt is 1 no need...
      indexes.forEachIn(cur, indexes.get('max')-cur, function(i) {
        if (i > max) return; // nothing to do
        if (!(observer = this.branchObserverAt(i))) return; // nothing to do
        len = observer.get('length');
        max -= len-1;
      }, this);
    }
    
    // get amt back out.  if amt is negative, it means that the range passed
    // was not cleanly inside of this range.  raise an exception.
    amt = max-cur; 
    
    // ok, now that we are adjusted, get the children and forward the replace
    // call on.  if there are no children, bad news...
    var children = this.get('children');
    if (!children) throw "cannot replace() tree item with no children";

    if ((amt < 0) || (max>children.get('length'))) {
      throw "replace() range must lie within a single tree item";
    }

    children.replace(cur, amt, objects, operation);
    
    // don't call enumerableContentDidChange() here because, as an observer,
    // we should be notified by the children array itself.
    
    return this;
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
    this._objectAtCache = this._outlineLevelCache = null;
    this._disclosureStateCache = null;
    this._contentGroupIndexes = NO;
    this.notifyPropertyChange('branchIndexes');
    
    var oldlen = this.get('length'),
        newlen = this._computeLength(),
        parent = this.get('parentObserver'), set;
    
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

      this.enumerableContentDidChange(start, amt, delta);
    }
  },

  /**
    Accepts a child index and expands it to reflect any nested groups.
  */
  expandChildIndex: function(index) {
    
    var ret = index;
    if (this.get('isHeaderVisible')) index++;

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
  // SC.COLLECTION CONTENT SUPPORT
  // 

  _contentGroupIndexes: NO,
  
  /**
    Called by the collection view to return any group indexes.  The default 
    implementation will compute the indexes one time based on the delegate 
    treeItemIsGrouped
  */
  contentGroupIndexes: function(view, content) {
    if (content !== this) return null; // only care about receiver

    var ret = this._contentGroupIndexes;
    if (ret !== NO) return ret ;
    
    // if this is not the root item, never do grouping
    if (this.get('parentObserver')) return null;
    
    var item = this.get('item'), group, indexes, len, cur, loc, children;
    
    if (item && item.isTreeItemContent) group = item.get('treeItemIsGrouped');
    else group = !!this.delegate.get('treeItemIsGrouped');
    
    // if grouping is enabled, build an index set with all of our local 
    // groups.
    if (group) {
      ret      = SC.IndexSet.create();
      indexes  = this.get('branchIndexes');
      children = this.get('children');
      len      = children ? children.get('length') : 0;
      cur = loc = 0;
      
      if (indexes) {
        indexes.forEach(function(i) {
          ret.add(cur, (i+1)-loc); // add loc -> i to set
          cur += (i+1)-loc;
          loc = i+1 ;
          
          var observer = this.branchObserverAt(i);
          if (observer) cur += observer.get('length')-1;
        }, this);
      }

      if (loc<len) ret.add(cur, len-loc);
    } else ret = null;
    
    this._contentGroupIndexes = ret ;
    return ret;
  },
  
  contentIndexIsGroup: function(view, content, idx) {
    var indexes = this.contentGroupIndexes(view, content);
    return indexes ? indexes.contains(idx) : NO ;
  },
  
  /**
    Returns the outline level for the specified index.
  */
  contentIndexOutlineLevel: function(view, content, index) {
    if (content !== this) return -1; // only care about us
    
    var cache = this._outlineLevelCache;
    if (cache && (cache[index] !== undefined)) return cache[index];
    if (!cache) cache = this._outlineLevelCache = [];
    
    var len   = this.get('length'),
        cur   = index,
        loc   = 0,
        ret   = null,
        indexes, children, observer;
    
    if (index >= len) return -1;
     
    if (this.get('isHeaderVisible')) {
      if (index === 0) return cache[0] = this.get('outlineLevel')-1;
      else cur--;
    }

    // loop through branch indexes, reducing the offset until it matches 
    // something we might actually return.
    if (indexes = this.get('branchIndexes')) {
      indexes.forEach(function(i) {
        if ((ret!==null) || (i > cur)) return ; // past end - nothing to do

        var observer = this.branchObserverAt(i), len;
        if (!observer) return ; // nothing to do

        // if cur lands inside of this observer's length, use objectAt to get
        // otherwise, just remove len from cur.
        len = observer.get('length') ;
        if (i+len > cur) {
          ret  = observer.contentIndexOutlineLevel(view, observer, cur-i);
          cur  = -1;
        } else cur -= len-1 ;
        
      },this);
    }
    
    if (cur>=0) ret = this.get('outlineLevel'); // get internal if needed
    cache[index] = ret ; // save in cache 
    return ret ;
  },

  /**
    Returns the disclosure state for the specified index.
  */
  contentIndexDisclosureState: function(view, content, index) {
    if (content !== this) return -1; // only care about us
    
    var cache = this._disclosureStateCache;
    if (cache && (cache[index] !== undefined)) return cache[index];
    if (!cache) cache = this._disclosureStateCache = [];
    
    var len   = this.get('length'),
        cur   = index,
        loc   = 0,
        ret   = null,
        indexes, children, observer;
    
    if (index >= len) return SC.LEAF_NODE;
     
    if (this.get('isHeaderVisible')) {
      if (index === 0) return cache[0] = this.get('disclosureState');
      else cur--;
    }

    // loop through branch indexes, reducing the offset until it matches 
    // something we might actually return.
    if (indexes = this.get('branchIndexes')) {
      indexes.forEach(function(i) {
        if ((ret!==null) || (i > cur)) return ; // past end - nothing to do

        var observer = this.branchObserverAt(i), len;
        if (!observer) return ; // nothing to do

        // if cur lands inside of this observer's length, use objectAt to get
        // otherwise, just remove len from cur.
        len = observer.get('length') ;
        if (i+len > cur) {
          ret  = observer.contentIndexDisclosureState(view, observer, cur-i);
          cur  = -1;
        } else cur -= len-1 ;
        
      },this);
    }
    
    if (cur>=0) ret = SC.LEAF_NODE; // otherwise its a leaf node
    cache[index] = ret ; // save in cache 
    return ret ;
  },

  /**
    Expands the specified content index.  This will search down until it finds
    the branchObserver responsible for this item and then calls _collapse on
    it.
  */
  contentIndexExpand: function(view, content, idx) {

    var indexes, cur = idx, children, item;
    
    if (content !== this) return; // only care about us
    if (this.get('isHeaderVisible')) {
      if (idx===0) {
        this._expand(this.get('item'));
        return;
      } else cur--;
    } 
    
    if (indexes = this.get('branchIndexes')) {
      indexes.forEach(function(i) {
        if (i >= cur) return; // past end - nothing to do
        var observer = this.branchObserverAt(i), len;
        if (!observer) return ; 
        
        len = observer.get('length');
        if (i+len > cur) {
          observer.contentIndexExpand(view, observer, cur-i);
          cur = -1 ; //done
        } else cur -= len-1;
        
      }, this);  
    }
    
    // if we are still inside of the range then maybe pass on to a child item
    if (cur>=0) {
      children = this.get('children');  
      item     = children ? children.objectAt(cur) : null;
      if (item) this._expand(item, this.get('item'), cur);
    }
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

    var indexes, children, item, cur = idx;
        
    if (content !== this) return; // only care about us
    if (this.get('isHeaderVisible')) {
      if (idx===0) {
        this._collapse(this.get('item'));
        return;
      } else cur--;
    } 
    
    
    if (indexes = this.get('branchIndexes')) {
      indexes.forEach(function(i) {
        if (i >= cur) return; // past end - nothing to do
        var observer = this.branchObserverAt(i), len;
        if (!observer) return ; 
        
        len = observer.get('length');
        if (i+len > cur) {
          observer.contentIndexCollapse(view, observer, cur-i);
          cur = -1 ; //done
        } else cur -= len-1;
        
      }, this);  
    }

    // if we are still inside of the range then maybe pass on to a child item
    if (cur>=0) {
      children = this.get('children');  
      item     = children ? children.objectAt(cur) : null;
      if (item) this._collapse(item, this.get('item'), cur);
    }
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
    children = this.get('children');
    item   = children ? children.objectAt(index) : null ;
    if (!item) return null ; // can't create an observer for a null item
    
    byIndex[index] = ret = SC.TreeItemObserver.create({
      item:     item,
      delegate: this.get('delegate'),
      parentObserver:   this,
      index:  index,
      outlineLevel: this.get('outlineLevel')+1
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
    var item = this.get('item');
    if (!item) throw "SC.TreeItemObserver.item cannot be null";
    
    item.addObserver('*', this, this._itemPropertyDidChange);
    this._itemPropertyDidChange(item, '*');
    this._notifyParent = YES ; // avoid infinite loops
  },
  
  /**
    Called just before a branch observer is removed.  Should stop any 
    observering and invalidate any child observers.
  */
  destroy: function() {
    this.invalidateBranchObserversAt(0);
    this._objectAtCache = null ;
    
    // cleanup observing
    var item = this.get('item');
    if (item) item.removeObserver('*', this, this._itemPropertyDidChange);
    
    var children = this._children,
        ro = this._childrenRangeObserver;
    if (children && ro) children.removeRangeObserver(ro);
    
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
        item     = this.get('item'),
        next ;
        
    this.beginPropertyChanges();
    
    next = this._computeDisclosureState(item);
    if (state !== next) this.set('disclosureState', next);
    
    next = this._computeChildren(item);
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
    Computes the current disclosure state of the item by asking the item or 
    the delegate.  If no pitem or index is passed, the parentItem and idex 
    will be used.
  */
  _computeDisclosureState: function(item, pitem, index) {
    var key, del;

    // no item - assume leaf node
    if (!item || !this._computeChildren(item)) return SC.LEAF_NODE;
    
    // item implement TreeItemContent - call directly
    else if (item.isTreeItemContent) {
      if (pitem === undefined) pitem = this.get('parentItem');
      if (index === undefined) index = this.get('index');
      return item.treeItemDisclosureState(pitem, index);
      
    // otherwise get treeItemDisclosureStateKey from delegate
    } else {
      key = this._treeItemIsExpandedKey ;
      if (!key) {
        del = this.get('delegate');
        key = del ? del.get('treeItemIsExpandedKey') : 'treeItemIsExpanded';
        this._treeItemIsExpandedKey = key ;
      }
      return item.get(key) ? SC.BRANCH_OPEN : SC.BRANCH_CLOSED;
    }
  },
  
  /**
    Collapse the item at the specified index.  This will either directly 
    modify the property on the item or call the treeItemCollapse() method.
  */
  _collapse: function(item, pitem, index) {
    var key, del;

    // no item - assume leaf node
    if (!item || !this._computeChildren(item)) return this;
    
    // item implement TreeItemContent - call directly
    else if (item.isTreeItemContent) {
      if (pitem === undefined) pitem = this.get('parentItem');
      if (index === undefined) index = this.get('index');
      item.treeItemCollapse(pitem, index);
      
    // otherwise get treeItemDisclosureStateKey from delegate
    } else {
      key = this._treeItemIsExpandedKey ;
      if (!key) {
        del = this.get('delegate');
        key = del ? del.get('treeItemIsExpandedKey') : 'treeItemIsExpanded';
        this._treeItemIsExpandedKey = key ;
      }
      item.setIfChanged(key, NO);
    }
    
    return this ;
  },

  /**
    Expand the item at the specified index.  This will either directly 
    modify the property on the item or call the treeItemExpand() method.
  */
  _expand: function(item, pitem, index) {
    var key, del;

    // no item - assume leaf node
    if (!item || !this._computeChildren(item)) return this;
    
    // item implement TreeItemContent - call directly
    else if (item.isTreeItemContent) {
      if (pitem === undefined) pitem = this.get('parentItem');
      if (index === undefined) index = this.get('index');
      item.treeItemExpand(pitem, index);
      
    // otherwise get treeItemDisclosureStateKey from delegate
    } else {
      key = this._treeItemIsExpandedKey ;
      if (!key) {
        del = this.get('delegate');
        key = del ? del.get('treeItemIsExpandedKey') : 'treeItemIsExpanded';
        this._treeItemIsExpandedKey = key ;
      }
      item.setIfChanged(key, YES);
    }
    
    return this ;
  },
  
  /**
    Computes the children for the passed item.
  */
  _computeChildren: function(item) {
    var del, key;
    
    // no item - no children
    if (!item) return null;
    
    // item implement TreeItemContent - call directly
    else if (item.isTreeItemContent) return item.get('treeItemChildren');
          
    // otherwise get treeItemChildrenKey from delegate
    else {
      key = this._treeItemChildrenKey ;
      if (!key) {
        del = this.get('delegate');
        key = del ? del.get('treeItemChildrenKey') : 'treeItemChildren';
        this._treeItemChildrenKey = key ;
      }
      return item.get(key);
    }
  },
  
  /**
    Computes the length of the array by looking at children.
  */
  _computeLength: function() {
    var ret = this.get('isHeaderVisible') ? 1 : 0,
        state = this.get('disclosureState'),
        children = this.get('children'),
        indexes ;

    // if disclosure is open, add children count + length of branch observers.
    if ((state === SC.BRANCH_OPEN) && children) {
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

