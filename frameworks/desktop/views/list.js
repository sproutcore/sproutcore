// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

sc_require('views/collection');

/** @class
  
  A list view renders vertical lists of items.  It is a specialized form of
  collection view that is simpler than the table view, but more refined than
  a generic collection.
  
  You can use a list view just like a collection view, except that often you
  also should provide a default rowHeight.  Setting this value will allow 
  the ListView to optimize its rendering.
  
  h2. Variable Row Heights
  
  ListView now supports variable row heights 
  The ListView adds support for a single delegate method:
  
  {{{
    collectionViewRowHeightForContent()
  }}}
  
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
  @since SproutCore 1.0
*/
SC.ListView = SC.CollectionView.extend(
/** @scope SC.ListView.prototype */ {
  
  classNames: ['sc-list-view'],
  
  /**
    The default layout for the list view simply fills the entire parentView.
  */
  layout: { left: 0, right: 0, top: 0, bottom: 0 },
  
  acceptsFirstResponder: YES,
  
  // ..........................................................
  // ROW HEIGHT SUPPORT
  // 
  
  /** 
    The common row height for list view items.
    
    If you set this property, then the ListView will be able to use this
    property to perform absolute layout of its children and to minimize t
    number of actual views it has to create.
    
    The value should be an integer expressed in pixels.
    
    You can alternatively set either the rowHeightKey or implement
    the collectionViewHeightForRowAtContentIndex() delegate method.
  */
  rowHeight: 20,
  
  /**
    If set, this key will be used to calculate the row height for a given
    content object.
  */
  rowHeightKey: null,
  
  /**
    This optional delegate method will be called for each item in your 
    content, giving you a chance to decide what row height to use for the
    content at the named index.
    
    The default version will return either the fixed rowHeight you 
    specified or will lookup the row height on the content object using the
    rowHeightKey.
    
    @params {SC.CollectionView} the requesting collection view
    @params {Number} the index into the content
    @returns {Number} rowHeight
  */
  collectionViewHeightForRowAtContentIndex: function(collectionView, contentIndex) {
    // console.log('collectionViewHeightForRowAtContentIndex invoked in %@ with index %@'.fmt(this, contentIndex));
    // console.log('rowHeightKey is %@'.fmt(this.get('rowHeightKey')));
    // just test for presence of a rowHeightKey..to implement fast path...
    if (!this.rowHeightKey) return this.get('rowHeight');
    var key = this.get('rowHeightKey'), content = this.get('content'), rowHeight;
    if (content) content = content.objectAt(contentIndex);
    rowHeight = content ? content.get(key) : this.get('rowHeight');
    // console.log('content.get(key) is %@'.fmt(content ? content.get(key) : undefined));
    return rowHeight ;
  },
  
  /**
    If some state changes that causes the row height for a range of rows 
    then you should call this method to notify the view that it needs to
    recalculate the row heights for the collection.
    
    Anytime your content array changes, the rows are invalidated 
    automatically so you only need to use this for cases where your rows
    heights may change without changing the content array itself.
    
    If all rows heights have changed, you can pass null to invalidate the
    whole range.
    
    @param {Range} range or null.
    @returns {SC.CollectionView} reciever
  */
  rowHeightsDidChangeInRange: function(range) {
    if (this.get('hasUniformRowHeights')) return ; // nothing to do...
    
    // console.log('rowHeightsDidChangeInRange called on %@ with range %@'.fmt(this, $I(range)));
    // if no range is passed, just wipe the cached...
    if (!range) {
      this._list_rowOffsets = this._list_rowHeights = null ;
      
    // otherwise, truncate the array of rowOffsets so that everything after
    // the start of this range will be recalc'd.  For cached rowHeights,
    // set to undefined unless max range exceeds length, in which case you
    // just truncate.
    } else {
      var min = Math.max(0,range.start) ;
      var offsets = this._list_rowOffsets, heights = this._list_rowHeights;
      if (offsets) offsets.length = min ;
      if (heights) {
        var max = SC.maxRange(range); 
        if (max >= heights.length) {
          heights.length = min ;
        } else {
          while(min<max) heights[min++] = undefined ;
        }
      }
    }
    
    // now update the layout...
    this.adjust(this.computeLayout());
    
    // force recomputation of contentRangeInFrame
    this.notifyPropertyChange('content');
    
    // and notify that nowShowingRange may have changed...
    this.invalidateNowShowingRange() ;
  },
  
  /**
    Set to YES if your list view should have uniform row heights.  This will
    enable an optimization that avoids inspecting actual content objects 
    when calculating the size of the view.
    
    The default version of this property is set to YES unless you set a 
    delegate or a rowHeightKey.
  */
  hasUniformRowHeights: YES,
  // function(key, value) {
  //     if (value !== undefined) this._list_hasUniformRowHeights = value ;
  //     value = this._list_hasUniformRowHeights;
  //     return SC.none(value) ? !((this.delegate && this.delegate.collectionViewHeightForRowAtContentIndex) || this.rowHeightKey) : value ;
  //   }.property('delegate', 'rowHeightKey').cacheable(),
  
  /**
    Calculates the offset for the row at the specified index.  Based on the 
    current setting this may compute the row heights for previous items or 
    it will simply do some math...
  */
  offsetForRowAtContentIndex: function(contentIndex) {
    if (contentIndex === 0) return 0 ;
    
    // do some simple math if we have uniform row heights...
    if (this.get('hasUniformRowHeights')) {
      return this.get('rowHeight') * contentIndex ;
      
    // otherwise, use the rowOffsets cache...
    } else {
      // get caches
      var offsets = this._list_rowOffsets;
      if (!offsets) offsets = this._list_rowOffsets = [] ;
      
      // OK, now try the fast path...if undefined, loop backwards until we
      // find an offset that IS cached...
      var len = offsets.length, cur = contentIndex, height, ret;
      
      // get the cached offset.  Note that if the requested index is longer 
      // than the length of the offsets cache, then just assume the value is
      // undefined.  We don't want to accidentally read an old value...
      if (contentIndex < len) {
        ret = offsets[cur];
      } else {
        ret = undefined ;
        cur = len; // start search at current end of offsets...
      }
      
      // if the cached value was undefined, loop backwards through the offsets
      // hash looking for a cached value to start from
      while((cur>0) && (ret===undefined)) ret = offsets[--cur];
      
      // now, work our way forward, building the cache of offsets.  Use
      // cached heights...
      if (ret===undefined) ret = offsets[cur] = 0 ;
      while (cur < contentIndex) {
        // get height...recache if needed....
        height = this._list_heightForRowAtContentIndex(cur) ;
        
        // console.log('index %@ has height %@'.fmt(cur, height));
        
        // add to ret and save in cache
        ret = ret + height ;
        
        cur++; // go to next offset
        offsets[cur] = ret ;
      }
      
      return ret ;
    }
  },
  
  /**
    Calculates the height for the row at content index.  This method will
    perform some simple math if hasUniformRowHeights is enabled.  Otherwise
    it will consult the collection view delegate to compute the row heights.
  */
  heightForRowAtContentIndex: function(contentIndex) {
    if (this.get('hasUniformRowHeights')) {
      return this.get('rowHeight') ;
    } else return this._list_heightForRowAtContentIndex(contentIndex);
  },
  
  /** @private
    By-passes the uniform row heights check.  Makes offsetForRow... a little
    faster.
  */
  _list_heightForRowAtContentIndex: function(contentIndex) {
    // console.log('_list_heightForRowAtContentIndex invoked on %@ with index %@'.fmt(this, index));
    var heights = this._list_rowHeights;
    if (!heights) heights = this._list_rowHeights = [] ;
    
    var height = (contentIndex < heights.length) ?
      heights[contentIndex] :
      undefined ;
    if (height===undefined) {
      height = heights[contentIndex] = this.invokeDelegateMethod(this.delegate, 'collectionViewHeightForRowAtContentIndex', this, contentIndex) || 0 ;
    }
    
    return height ;
  },
  
  // ..........................................................
  // RENDERING
  // 
  
  render: function(context, firstTime) {
    if (SC.BENCHMARK_RENDER) {
      var bkey = '%@.render'.fmt(this) ;
      SC.Benchmark.start(bkey);
    }
    this.beginPropertyChanges() ; // avoid sending notifications
    
    var content = SC.makeArray(this.get('content')) ;
    var selection = SC.makeArray(this.get('selection'));
    var oldRange = this._oldNowShowingRange ;
    var range = SC.cloneRange(this.get('nowShowingRange')) ;
    this._oldNowShowingRange = SC.cloneRange(range) ;
    var key, itemView = this.createExampleView(content), c ;
    var range2 ; // only used if the old range fits inside the new range
    var idx, end, childId, maxLen ;
    
    // keep track of children we've got rendered
    var childSet = this._childSet ;
    if (!childSet) childSet = this._childSet = [] ;
    
    if (SC.ENABLE_COLLECTION_PARTIAL_RENDER) {
      // used for santity checks during debugging
      if (SC.SANITY_CHECK_PARTIAL_RENDER) var maxLen = range.length ;
      
      if (SC.DEBUG_PARTIAL_RENDER) {
        console.log('oldRange = ') ;
        console.log(oldRange) ;
        console.log('range = ') ;
        console.log(range) ;
      }
      
      // if we're dirty, redraw everything visible
      // (selection changed, content changed, etc.)
      if (this.get('isDirty') || firstTime) {
        childSet.length = 0 ; // full render
        
      // else, only redaw objects we haven't previously drawn
      } else if (oldRange) {
        // ignore ranges that don't overlap above..
        if (range.start >= oldRange.start + oldRange.length) {
          childSet.length = 0 ; // full render
        
        // and below...
        } else if (range.start + range.length <= oldRange.start) {
          childSet.length = 0 ; // full render
        
        // okay, the ranges do overlap. are they equal?
        } else if (SC.rangesEqual(oldRange, range)) {
          range = SC.EMPTY_RANGE ; // nothing to render
        
        // nope, is the old range inside the new range?
        } else if (range.start <= oldRange.start && range.start + range.length >= oldRange.start + oldRange.length) {
          // need to render two ranges...all pre-existing views are valid
          context.updateMode = SC.MODE_APPEND ;
          range2 = { start: oldRange.start + oldRange.length, length: (range.start + range.length) - (oldRange.start + oldRange.length) } ;
          range.length = oldRange.start - range.start ;
        
        // nope, is the new range inside the old range?
        } else if (range.start >= oldRange.start && range.start + range.length <= oldRange.start + oldRange.length) {        
          // need to remove unused childNodes at both ends, start with bottom...
          idx = oldRange.start ;
          end = range.start ;
          while (idx < end) {
            if (SC.DEBUG_PARTIAL_RENDER) console.log('looping on bottom range');
            childId = childSet[idx] ;
            if (childId) context.remove(childId) ;
            if (SC.DEBUG_PARTIAL_RENDER) console.log('deleting content at index %@'.fmt(idx));
            delete childSet[idx] ;
            ++idx ;
          }
        
          // now remove unused childNodes at the top of the range...
          idx = range.start + range.length ;
          end = oldRange.start + oldRange.length ;
          while (idx < end) {
            if (SC.DEBUG_PARTIAL_RENDER) console.log('looping on top range');
            childId = childSet[idx] ;
            if (childId) context.remove(childId) ;
            if (SC.DEBUG_PARTIAL_RENDER) console.log('deleting content at index %@'.fmt(idx));
            delete childSet[idx] ;
            ++idx ;
          }
        
          range = SC.EMPTY_RANGE ; // nothing to render
        
        // nope, is the new range lower than the old range?
        } else if (range.start < oldRange.start) {
          context.updateMode = SC.MODE_APPEND ;
        
          // need to remove unused childNodes at the top of the old range
          idx = range.start + range.length ;
          end = oldRange.start + oldRange.length ;
          while (idx < end) {
            if (SC.DEBUG_PARTIAL_RENDER) console.log('looping on top only');
            childId = childSet[idx] ;
            if (childId) context.remove(childId) ;
            if (SC.DEBUG_PARTIAL_RENDER) console.log('deleting content at index %@'.fmt(idx));
            delete childSet[idx] ;
            ++idx ;
          }
        
          range.length = Math.min(range.length, oldRange.start - range.start) ;
        
        // nope, so the new range is higher than the old range
        } else {
          context.updateMode = SC.MODE_APPEND ;
        
          // need to remove unused childNodes at the bottom of the old range
          idx = oldRange.start ;
          end = range.start ;
          while (idx < end) {
            if (SC.DEBUG_PARTIAL_RENDER) console.log('looping on bottom only');
            childId = childSet[idx] ;
            if (childId) context.remove(childId) ;
            if (SC.DEBUG_PARTIAL_RENDER) console.log('deleting content at index %@'.fmt(idx));
            delete childSet[idx] ;
            ++idx ;
          }
        
          end = range.start + range.length ;
          range.start = oldRange.start + oldRange.length ;
          range.length = end - range.start ;
        }
      }
    
      if (SC.SANITY_CHECK_PARTIAL_RENDER) {
        if (range.length < 0) throw "range.length is " + range.length ;
        if (range.length > maxLen) throw "range.length is " + range.length + ', max length is ' + maxLen ;
        if (range.start < 0) throw "range.start is " + range.start ;
        if (range2) {
          if (range2.length < 0) throw "range2.length is " + range2.length ;
          if (range2.length > maxLen) throw "range2.length is " + range2.length + ', max length is ' + maxLen ;
          if (range2.start < 0) throw "range2.start is " + range2.start ;
        }
      }
    
      if (SC.DEBUG_PARTIAL_RENDER) {
        console.log('rendering = ') ;
        console.log(range) ;
        if (range2) {
          console.log('also rendering = ') ;
          console.log(range2) ;
        }
      }
    }
    
    idx = SC.maxRange(range) ;
    
    var baseKey = SC.guidFor(this) + '_' ;
    var guids = this._itemViewGuids, guid;
    if (!guids) this._itemViewGuids = guids = {};
    
    // TODO: Use SC.IndexSet, not separate ranges, once it's ready.
    // This will also make it possible to do partial updates during content
    // and selection changes. Now we always do a full update.
    
    while (--idx >= range.start) {
      c = content.objectAt(idx) ;
      if (SC.DEBUG_PARTIAL_RENDER) console.log('rendering content(%@) at index %@'.fmt(c.unread, idx));
      
      // use cache of item view guids to avoid creating temporary objects
      guid = SC.guidFor(c);
      if (!(key = guids[guid])) key = guids[guid] = baseKey+guid;
      
      itemView.set('content', c) ;
      itemView.set('isSelected', (selection.indexOf(c) == -1) ? NO : YES) ;
      itemView.layerId = key ; // cannot use .set, layerId is RO
      if (SC.SANITY_CHECK_PARTIAL_RENDER && childSet[idx]) throw key + '(' + c.unread + ')'+ ' at index ' + idx ; // should not re-render a child in the index!
      childSet[idx] = key ;
      itemView.adjust(this.itemViewLayoutAtContentIndex(idx)) ;
      context = context.begin(itemView.get('tagName')) ;
      itemView.prepareContext(context, YES) ;
      context = context.end() ;
    }
    
    if (range2) {
      idx = SC.maxRange(range2) ;
      while (--idx >= range2.start) {
        c = content.objectAt(idx) ;
        if (SC.DEBUG_PARTIAL_RENDER) console.log('rendering content(%@) at index %@'.fmt(c.unread, idx));
        
        // use cache of item view guids to avoid creating temporary objects
        guid = SC.guidFor(c);
        if (!(key = guids[guid])) key = guids[guid] = baseKey+guid;
        
        itemView.set('content', c) ;
        itemView.set('isSelected', (selection.indexOf(c) == -1) ? NO : YES) ;
        itemView.layerId = key ; // cannot use .set, layerId is RO
        if (SC.SANITY_CHECK_PARTIAL_RENDER && childSet[idx]) throw key + '(' + c.unread + ')'+ ' at index ' + idx ; // should not re-render a child in the index!
        childSet[idx] = key ;
        itemView.adjust(this.itemViewLayoutAtContentIndex(idx)) ;
        context = context.begin(itemView.get('tagName')) ;
        itemView.prepareContext(context, YES) ;
        context = context.end() ;
      }
    }
    
    if (SC.DEBUG_PARTIAL_RENDER) console.log('******************************') ;
    
    this.set('isDirty', NO);
    this.endPropertyChanges() ;
    if (SC.BENCHMARK_RENDER) SC.Benchmark.end(bkey);    
  },
  
  // ..........................................................
  // SUBCLASS SUPPORT
  // 
  
  insertionOrientation: SC.VERTICAL_ORIENTATION,
  
  /** @private
    Overrides default CollectionView method to compute the minimim height
    of the list view.
  */
  computeLayout: function() {
    var content = this.get('content') ;
    var rows = (content) ? content.get('length') : 0 ;
    
    // use this cached layout hash to avoid allocing memory...
    var ret = this._cachedLayoutHash ;
    if (!ret) ret = this._cachedLayoutHash = {};
    
    // set minHeight
    ret.minHeight = this.offsetForRowAtContentIndex(rows);
    return ret; 
  },
  
  /** @private
    Calculates the visible content range in the specified frame.  If 
    uniform rows are set, this will use some simple math.  Otherwise it will
    compute all row offsets leading up to the frame.
  */
  contentRangeInFrame: function(frame) {
    // console.log('contentRangeInFrame invoked on %@ with frame {%@, %@, %@, %@}'.fmt(this, frame.x, frame.y, frame.width, frame.height));
    var min, max, ret, rowHeight ;
    var minY = SC.minY(frame), maxY = SC.maxY(frame);
    // use some simple math...
    if (this.get('hasUniformRowHeights')) {
      rowHeight = this.get('rowHeight') || 20 ;
      min = Math.max(0,Math.floor(minY / rowHeight)-1) ;
      max = Math.ceil(maxY / rowHeight) ;
      
      var content = this.get('content') ;
      min = Math.min(min, content.get('length')) ;
      max = Math.min(max, content.get('length')) ;
      
      // convert to range...
      ret = { start: min, length: max - min } ;
      
    // otherwise, get the cached row offsets...
    } else {
      content = this.get('content');
      var len = (content ? content.get('length') : 0), offset = 0;
      
      // console.log('contentRangeInFrame content length is %@'.fmt(len));
      
      // console.log('minY = ' + minY) ;
      // console.log('maxY = ' + maxY) ;
      
      min = null; 
      max = 0;
      do {
        offset = this.offsetForRowAtContentIndex(max); // add offset.
        // console.log('offset is now %@'.fmt(offset));
        if ((min===null) && (offset >= minY)) min = max; // set min
        max++ ;
      } while (max<len && offset < maxY);
      
      // console.log('min = ' + min) ;
      // console.log('max = ' + max) ;
      
      // convert to range...
      ret = { start: Math.max(min-1, 0), length: Math.min(max - min + 2, len) } ;
    }
    
    // console.log('contentRangeInFrame is {%@, %@}'.fmt(ret.start, ret.length));
    return ret ;
  },
  
  /** @private */
  itemViewLayoutAtContentIndex: function(contentIndex) {
    // console.log('%@.itemViewLayoutAtContentIndex(%@)'.fmt(this, contentIndex));
    var layout = { left: 0, right: 0 } ;
    
    // set top & height...
    layout.top = this.offsetForRowAtContentIndex(contentIndex) ;
    layout.height = this.heightForRowAtContentIndex(contentIndex) ;
    
    return layout ;
  },
  
  insertionPointClass: SC.View.extend({
    emptyElement: '<div><span class="anchor"></span></div>',
    classNames: ['sc-list-insertion-point'],
    layout: { top: -6, height: 2, left: 4, right: 2 }
  }),
  
  // TODO refactor code, remove duplication
  showInsertionPoint: function(itemView, dropOperation) {
    if (!itemView) {
      // show insertion point below final itemView
      var content = this.get('content') ;
      content = content.objectAt(content.get('length')-1) ;
      itemView = this.itemViewForContent(content) ;
      
      if (!itemView) return ;
      
      var f = itemView.get('frame') ;
      var top = f.y, height = f.height ;
      
      if (!this._insertionPointView) {
        this._insertionPointView = this.insertionPointClass.create() ;
      }
    
      var insertionPoint = this._insertionPointView ;
      if (insertionPoint.get('parentView') !== itemView.get('parentView')) {
        itemView.get('parentView').appendChild(insertionPoint) ;
      }
      
      insertionPoint.adjust({ top: top + height }) ;
      return ;
    }
    
    // if drop on, then just add a class...
    if (dropOperation === SC.DROP_ON) {
      if (itemView !== this._dropOnInsertionPoint) {
        this.hideInsertionPoint() ;
        itemView.$().addClass('drop-target') ;
        this._dropOnInsertionPoint = itemView ;
      }
      
    } else {
      if (this._dropOnInsertionPoint) {
        this._dropOnInsertionPoint.$().removeClass('drop-target') ;
        this._dropOnInsertionPoint = null ;
      }
      
      if (!this._insertionPointView) {
        this._insertionPointView = this.insertionPointClass.create() ;
      }
      
      insertionPoint = this._insertionPointView ;
      if (insertionPoint.get('parentView') !== itemView.get('parentView')) {
        itemView.get('parentView').appendChild(insertionPoint) ;
      }
      
      var frame = itemView.get('frame') ;
      insertionPoint.adjust({ top: itemView.get('frame').y }) ;
    }
    
  },
  
  hideInsertionPoint: function() {
    var insertionPoint = this._insertionPointView ;
    if (insertionPoint) insertionPoint.removeFromParent() ;
    
    if (this._dropOnInsertionPoint) {
      this._dropOnInsertionPoint.removeClassName('drop-target') ;
      this._dropOnInsertionPoint = null ;
    }
  },
  
  // We can do this much faster programatically using the rowHeight
  insertionIndexForLocation: function(loc, dropOperation) {
    // console.log('insertionIndexForLocation called on %@'.fmt(this));
    var f = this.get('clippingFrame') ;
    var sf = f ; // FIXME this.get('scrollFrame') ;
    var retOp = SC.DROP_BEFORE ;
    
    // find the rowHeight and offset to work with
    var offset = loc.y - f.y - sf.y ;
    var rowOffset, rowHeight, idx ;
    
    // do some simple math if we have uniform row heights...
    if (this.get('hasUniformRowHeights')) {
      rowHeight = this.get('rowHeight') || 0 ;
      idx = Math.floor(offset / rowHeight) ;
      rowOffset = idx * rowHeight ;
    // otherwise, use the rowOffsets cache...
    } else {
      // get caches
      var offsets = this._list_rowOffsets;
      if (!offsets) offsets = this._list_rowOffsets = [] ;
      
      // console.log('offset of pointer is %@'.fmt(offset));
      // console.log('offsets are %@'.fmt(offsets.join(', ')));
      
      // OK, now try the fast path...if undefined, loop backwards until we
      // find an offset that IS cached...
      var len = offsets.length, cur = len, ret;
      
      // if the cached value was undefined, loop backwards through the offsets
      // hash looking for a cached value to start from
      while (cur>0) {
        ret = offsets[--cur];
        if (ret < offset) break ;
      }
      
      rowOffset = offset[cur] ;
      rowHeight = this._list_heightForRowAtContentIndex(cur) ;
      
      // console.log('rowHeight is %@'.fmt(rowHeight));
      
      idx = cur ;
    }
    
    // find the percent through the row...
    var percentage = ((offset - rowOffset) / rowHeight) ;
    
    // console.log('percentage is %@'.fmt(percentage));
    
    // if the dropOperation is SC.DROP_ON and we are in the center 60%
    // then return the current item.
    if (dropOperation === SC.DROP_ON) {
      if (percentage > 0.80) idx++ ;
      if ((percentage >= 0.20) && (percentage <= 0.80)) {
        retOp = SC.DROP_ON;
      }
    } else {
      if (percentage > 0.45) idx++ ;
    }
    
    if (idx !== this._idx || retOp !== this._retOp) {
      // console.log('insertionIndex is %@, op is %@'.fmt(idx, retOp));
      this._idx = idx ;
      this._retOp = retOp ;
    }
    
    // console.log('[ret, retOp] is [%@, %@]'.fmt(ret, retOp));
    return [idx, retOp] ;
  }
  
});
