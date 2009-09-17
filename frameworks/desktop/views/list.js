// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

sc_require('views/collection');
sc_require('mixins/collection_row_delegate');

/** @class
  
  A list view renders vertical lists of items.  It is a specialized form of
  collection view that is simpler than the table view, but more refined than
  a generic collection.
  
  You can use a list view just like a collection view, except that often you
  also should provide a default rowHeight.  Setting this value will allow 
  the ListView to optimize its rendering.
  
  h2. Variable Row Heights

  Normally you set the row height through the rowHeight property.  You can 
  also support custom row heights by implementing the 
  contentCustomRowHeightIndexes property to return an index set.
  
  h2. Using ListView with Very Large Data Sets
  
  ListView implements incremental rendering, which means it will only render
  HTML for the items that are current visible on the screen.  You can use it
  to efficiently render lists with 100K+ items very efficiently.  
  
  If you need to work with very large lists of items, however, be aware that
  calculate variable rows heights can become very expensive since the list 
  view will essentially have to iterate over every item in the collection to
  collect its row height.  
  
  To work with very large lists, you should consider making your row heights
  uniform.  This will allow the list view to efficiently render content 
  without worrying about the overall performance.
  
  Alternatively, you may want to consider overriding the 
  offsetForRowAtContentIndex() and heightForRowAtContentIndex() methods to 
  perform some faster calculations that do not require inspecting every 
  item in the collection.
  
  Note that row heights and offsets are cached so once they are calculated
  the list view will be able to display very quickly.
  
  (Can we also have an 'estimate row heights' property that will simply 
  cheat for very long data sets to make rendering more efficient?)
  
  @extends SC.CollectionView
  @extends SC.CollectionRowDelegate
  @since SproutCore 1.0
*/
SC.ListView = SC.CollectionView.extend(
  SC.CollectionRowDelegate,
/** @scope SC.ListView.prototype */ {
  
  classNames: ['sc-list-view'],

  acceptsFirstResponder: YES,

  // ..........................................................
  // COLLECTION ROW DELEGATE SUPPORT
  // 
  
  
  /**
    Returns the current collectionRowDelegate.  This property will recompute
    everytime the content changes.
  */
  rowDelegate: function() {
    var del     = this.delegate,
        content = this.get('content');
    return this.delegateFor('isCollectionRowDelegate', del, content);
  }.property('delegate', 'content').cacheable(),
  
  /** @private 
    Whenever the rowDelegate changes, begin observing important properties
  */
  _sclv_rowDelegateDidChange: function() {
    var last = this._sclv_rowDelegate,
        del  = this.get('rowDelegate'),
        func = this._sclv_rowHeightDidChange,
        func2 = this._sclv_customRowHeightIndexesDidChange;
        
    if (last === del) return this; // nothing to do
    this._sclv_rowDelegate = del; 

    // last may be null on a new object
    if (last) {
      last.removeObserver('rowHeight', this, func);
      last.removeObserver('customRowHeightIndexes', this, func2);
    }
    
    if (!del) {
      throw "Internal Inconsistancy: ListView must always have CollectionRowDelegate";
    }
    
    del.addObserver('rowHeight', this, func);
    del.addObserver('customRowHeightIndexes', this, func2);
    this._sclv_rowHeightDidChange()._sclv_customRowHeightIndexesDidChange();
    return this ;
  }.observes('rowDelegate'),

  /** @private 
    called whenever the rowHeight changes.  If the property actually changed
    then invalidate all row heights.
  */
  _sclv_rowHeightDidChange: function() {
    var del = this.get('rowDelegate'),
        height = del.get('rowHeight'), 
        indexes;
        
    if (height === this._sclv_rowHeight) return this; // nothing to do
    this._sclv_rowHeight = height;

    indexes = SC.IndexSet.create(0, this.get('length'));
    this.rowHeightDidChangeForIndexes(indexes);
    return this ;
  },

  /** @private 
    called whenever the customRowHeightIndexes changes.  If the property 
    actually changed then invalidate affected row heights.
  */
  _sclv_customRowHeightIndexesDidChange: function() {
    var del     = this.get('rowDelegate'),
        indexes = del.get('customRowHeightIndexes'), 
        last    = this._sclv_customRowHeightIndexes,
        func    = this._sclv_customRowHeightIndexesContentDidChange;
        
    // nothing to do
    if ((indexes===last) || (last && last.isEqual(indexes))) return this;

    // if we were observing the last index set, then remove observer
    if (last && this._sclv_isObservingCustomRowHeightIndexes) {
      last.removeObserver('[]', this, func);
    }
    
    // only observe new index set if it exists and it is not frozen.
    if (this._sclv_isObservingCustomRowHeightIndexes = indexes && !indexes.get('isFrozen')) {
      indexes.addObserver('[]', this, func);
    }
    
    this._sclv_customRowHeightIndexesContentDidChange();
    return this ;
  },

  /** @private
    Called whenever the customRowHeightIndexes set is modified.
  */
  _sclv_customRowHeightIndexesContentDidChange: function() {
    var del     = this.get('rowDelegate'),
        indexes = del.get('customRowHeightIndexes'), 
        last    = this._sclv_customRowHeightIndexes, 
        changed;

    // compute the set to invalidate.  the union of cur and last set
    if (indexes && last) {
      changed = indexes.copy().add(last);
    } else changed = indexes || last ;
    this._sclv_customRowHeightIndexes = indexes ? indexes.frozenCopy() : null; 

    // invalidate
    this.rowHeightDidChangeForIndexes(changed);
    return this ;
  },
  
  // ..........................................................
  // ROW PROPERTIES
  // 
  
  /**
    Returns the top offset for the specified content index.  This will take
    into account any custom row heights and group views.
    
    @param {Number} idx the content index
    @returns {Number} the row offset
  */
  rowOffsetForContentIndex: function(idx) {
    if (idx === 0) return 0 ; // fastpath

    var del       = this.get('rowDelegate'),
        rowHeight = del.get('rowHeight'),
        ret, custom, cache, delta, max, content ;
        
    ret = idx * rowHeight;

		if(this.get('rowSpacing')){ 
      ret += idx * this.get('rowSpacing'); 
    } 

    if (del.customRowHeightIndexes && (custom=del.get('customRowHeightIndexes'))) {
      
      // prefill the cache with custom rows.
      cache = this._sclv_offsetCache;
      if (!cache) {
        cache = this._sclv_offsetCache = [];
        delta = max = 0 ;
        custom.forEach(function(idx) {
          delta += this.rowHeightForContentIndex(idx)-rowHeight;
          cache[idx+1] = delta;
          max = idx ;
        }, this);
        this._sclv_max = max+1;
      }
      
      // now just get the delta for the last custom row before the current 
      // idx.
      delta = cache[idx];
      if (delta === undefined) {
        delta = cache[idx] = cache[idx-1];
        if (delta === undefined) {
          max = this._sclv_max;
          if (idx < max) max = custom.indexBefore(idx)+1;
          delta = cache[idx] = cache[max] || 0;
        }
      }

      ret += delta ;
    }
    
    return ret ;
  },
  
  /**
    Returns the row height for the specified content index.  This will take
    into account custom row heights and group rows.
    
    @param {Number} idx content index
    @returns {Number} the row height
  */
  rowHeightForContentIndex: function(idx) {
    var del = this.get('rowDelegate'),
        ret, cache, content, indexes;
    
    if (del.customRowHeightIndexes && (indexes=del.get('customRowHeightIndexes'))) {
      cache = this._sclv_heightCache ;
      if (!cache) {
        cache = this._sclv_heightCache = [];
        content = this.get('content');
        indexes.forEach(function(idx) {
          cache[idx] = del.contentIndexRowHeight(this, content, idx);
        }, this);
      }
      
      ret = cache[idx];
      if (ret === undefined) ret = del.get('rowHeight');
    } else ret = del.get('rowHeight');
    
    return ret ;
  },
  
  /**
    Call this method whenever a row height has changed in one or more indexes.
    This will invalidate the row height cache and reload the content indexes.
    Pass either an index set or a single index number.

    This method is called automatically whenever you change the rowHeight
    or customRowHeightIndexes properties on the collectionRowDelegate.
    
    @param {SC.IndexSet|Number} indexes 
    @returns {SC.ListView} receiver
  */  
  rowHeightDidChangeForIndexes: function(indexes) {
    var len     = this.get('length');

    // clear any cached offsets
    this._sclv_heightCache = this._sclv_offsetCache = null;
    
    // find the smallest index changed; invalidate everything past it
    if (indexes && indexes.isIndexSet) indexes = indexes.get('min');
    this.reload(SC.IndexSet.create(indexes, len-indexes));
    return this ;
  },
  
  // ..........................................................
  // SUBCLASS IMPLEMENTATIONS
  // 
  
  /**
    The layout for a ListView is computed from the total number of rows 
    along with any custom row heights.
  */
  computeLayout: function() {
    // default layout
    var ret = this._sclv_layout;
    if (!ret) ret = this._sclv_layout = {};
    ret.minHeight = this.rowOffsetForContentIndex(this.get('length'))+4;
    return ret ;
  },
  
  /**
  
    Computes the layout for a specific content index by combining the current
    row heights.
  
  */
  layoutForContentIndex: function(contentIndex) {
    return {
      top:    this.rowOffsetForContentIndex(contentIndex),
      height: this.rowHeightForContentIndex(contentIndex),
      left:   0, 
      right:  0
    };
  },
  
  /**
    Override to return an IndexSet with the indexes that are at least 
    partially visible in the passed rectangle.  This method is used by the 
    default implementation of computeNowShowing() to determine the new 
    nowShowing range after a scroll.
    
    Override this method to implement incremental rendering.
    
    The default simply returns the current content length.
    
    @param {Rect} rect the visible rect or a point
    @returns {SC.IndexSet} now showing indexes
  */
  contentIndexesInRect: function(rect) {
    var rowHeight = this.get('rowDelegate').get('rowHeight'),
        top       = SC.minY(rect),
        bottom    = SC.maxY(rect),
        height    = rect.height || 0,
        len       = this.get('length'),
        offset, start, end;
    
    // estimate the starting row and then get actual offsets until we are 
    // right.
    start = (top - (top % rowHeight)) / rowHeight;
    offset = this.rowOffsetForContentIndex(start);
    
    // go backwards until top of row is before top edge
    while(start>0 && offset>=top) {
      start--;
      offset -= this.rowHeightForContentIndex(start);
    }
    
    // go forwards until bottom of row is after top edge
    offset += this.rowHeightForContentIndex(start);
    while(start<len && offset<top) {
      offset += this.rowHeightForContentIndex(start);
      start++ ;
    }
    if (start<0) start = 0;
    if (start>=len) start=len;
    
    
    // estimate the final row and then get the actual offsets until we are 
    // right. - look at the offset of the _following_ row
    end = start + ((height - (height % rowHeight)) / rowHeight) ;
    if (end > len) end = len;
    offset = this.rowOffsetForContentIndex(end);
    
    // walk backwards until top of row is before or at bottom edge
    while(end>=start && offset>=bottom) {
      end-- ;
      offset -= this.rowHeightForContentIndex(end);
    }
    
    // go forwards until bottom of row is after bottom edge
    offset += this.rowHeightForContentIndex(end);
    while(end<len && offset<=bottom) {
      offset += this.rowHeightForContentIndex(end);
      end++ ;
    }
    
    end++; // end should be after start
    
    // if height is greater than 0, on some platforms we should just render
    // to specific windows in order to minimize render time.
    if (height > 0 && !SC.browser.msie) {
      start = start - (start % 50);
      if (start < 0) start = 0 ;
      end   = end - (end % 50) + 50;
    }
    
    if (end<start) end = start;
    if (end>len) end = len ;
    
    // convert to IndexSet and return
    return SC.IndexSet.create(start, end-start);
  },
  
  // ..........................................................
  // DRAG AND ROP SUPPORT
  // 
  
  
  /**
    Default view class used to draw an insertion point.  The default 
    view will show a vertical line.  Any view you create
    should expect an outlineLevel property set, which should impact your left
    offset.
    
    @property 
    @type {SC.View}
  */
  insertionPointView: SC.View.extend({
    classNames: 'sc-list-insertion-point',
    
    render: function(context, firstTime) {
      if (firstTime) context.push('<div class="anchor"></div>');
    }
    
  }),

  /**
    Default implementation will show an insertion point
  */
  showInsertionPoint: function(itemView, dropOperation) {
    var view = this._insertionPointView;
    if (!view) {
      view = this._insertionPointView 
           = this.get('insertionPointView').create();
    }
    
    var layout = SC.clone(itemView.get('layout')),
        level  = itemView.get('outlineLevel'),
        indent = itemView.get('outlineIndent') || 0;
    if (SC.none(level)) level = -1;
    
    if (dropOperation & SC.DROP_ON) {
      this.hideInsertionPoint();
      itemView.set('isSelected', YES);
      this._lastDropOnView = itemView;
    } else {

      if (this._lastDropOnView) {
        this._lastDropOnView.set('isSelected', NO);
        this._lastDropOnView = null;
      }
      
      if (dropOperation & SC.DROP_AFTER) layout.top += layout.height;
      
      layout.height = 2;
      layout.right  = 0;
      layout.left   = ((level+1) * indent) + 12;
      delete layout.width;

      view.set('layout', layout);
      this.appendChild(view);
    }
  },
  
  hideInsertionPoint: function() {
    if (this._lastDropOnView) {
      this._lastDropOnView.set('isSelected', NO);
      this._lastDropOnView = null;
    }
    
    var view = this._insertionPointView;
    if (view) view.removeFromParent().destroy();
    this._insertionPointView = null;
  },

  /**
    Compute the insertion index for the passed location.  The location is 
    a point, relative to the top/left corner of the receiver view.  The return
    value is an index plus a dropOperation, which is computed as such:
    
    - if outlining is not used and you are within 5px of an edge, DROP_BEFORE
      the item after the edge.
      
    - if outlining is used and you are within 5px of an edge and the previous
      item has a different outline level then the next item, then DROP_AFTER
      the previous item if you are closer to that outline level.
      
    - if dropOperation = SC.DROP_ON and you are over the middle of a row, then
      use DROP_ON.
  */
  insertionIndexForLocation: function(loc, dropOperation) { 
    var indexes = this.contentIndexesInRect(loc),
        index   = indexes.get('min'),
        len     = this.get('length'),
        min, max, diff, clevel, cindent, plevel, pindent, itemView;

    // if there are no indexes in the rect, then we need to either insert
    // before the top item or after the last item.  Figure that out by 
    // computing both.
    if (SC.none(index) || index<0) {
      if ((len===0) || (loc.y <= this.rowOffsetForContentIndex(0))) index = 0;
      else if (loc.y >= this.rowOffsetForContentIndex(len)) index = len;
    }

    // figure the range of the row the location must be within.
    min = this.rowOffsetForContentIndex(index);
    max = min + this.rowHeightForContentIndex(index);
    
    // now we know which index we are in.  if dropOperation is DROP_ON, figure
    // if we can drop on or not.
    if (dropOperation == SC.DROP_ON) {
      // editable size - reduce height by a bit to handle dropping
      if (this.get('isEditable')) diff=Math.min(Math.floor((max-min)*0.2),5);
      else diff = 0;
      
      // if we're inside the range, then DROP_ON
      if (loc.y >= (min+diff) || loc.y <= (max+diff)) {
        return [index, SC.DROP_ON];
      }
    }
    
    dropOperation = SC.DROP_BEFORE;
    
    // ok, now if we are in last 10px, go to next item.
    if ((index<len) && (loc.y >= max-10)) index++;
    
    // finally, let's decide if we want to actually insert before/after.  Only
    // matters if we are using outlining.
    if (index>0) {
      itemView = this.itemViewForContentIndex(index);
      clevel   = itemView ? itemView.get('outlineLevel') : 0;
      cindent  = (itemView ? itemView.get('outlineIndent') : 0) || 0;
      cindent  *= clevel;
      
      itemView = this.itemViewForContentIndex(index);
      pindent  = (itemView ? itemView.get('outlineIndent') : 0) || 0;
      plevel   = itemView ? itemView.get('outlineLevel') : 0;
      pindent  *= plevel;

      // if indent levels are different, then try to figure out which level 
      // it should be on.
      if ((clevel !== plevel) && (cindent !== pindent)) {
        // use most inner indent as boundary
        if (((pindent > cindent) && (loc.x >= pindent)) ||
            ((pindent < cindent) && (loc.x <= cindent))) {
          index-- ;
          dropOperation = SC.DROP_AFTER;
        }
      }
    }

    return [index, dropOperation];
  },
  
  // ..........................................................
  // INTERNAL SUPPORT
  // 

  init: function() {
    sc_super();
    this._sclv_rowDelegateDidChange();
  }  
  
});
