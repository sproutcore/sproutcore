// ==========================================================================
// SC.ListView
// ==========================================================================

require('desktop.platform/views/collection') ;
require('views/label');
require('desktop.platform/views/list_item') ;

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
  
  Alternatively, you may want to consider overriding the offsetForRowAtContentIndex() and heightForRowAtContentIndex() methods to 
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

  styleClass: 'sc-list-view',
  
  /**
    The default example item view will render text-based items.
    
    You can override this as you wish.
  */
  exampleView: SC.LabelView,
  
  /**
    The default layout for the list view simply fills the entire parentView.
  */
  layout: SC.merge(SC.FILL_WIDTH, SC.FILL_HEIGHT),
  
  // ..........................................................
  // ROW HEIGHT SUPPORT
  // 

  /** 
    The common row height for list view items.
    
    If you set this property, then the ListView will be able to use this
    property to perform absolute layout of its children and to minimize t
    number of actual views it has to create.
    
    The value should be an integer expressed in pixels.
    
    You can alternatively set either the contentRowHeightKey or implement
    the collectionViewHeightForRowAtContentIndex() delegate method.
  */
  rowHeight: 20,

  /**
    If set, this key will be used to calculate the row height for a given
    content object.
  */
  contentRowHeightKey: null,
  
  /**
    This optional delegate method will be called for each item in your 
    content, giving you a chance to decide what row height to use for the
    content at the named index.
    
    The default version will return either the fixed rowHeight you 
    specified or will lookup the row height on the content object using the
    contentRowHeightKey.
    
    @params {SC.CollectionView} the requesting collection view
    @params {Number} the index into the content
    @returns {Number} rowHeight
  */
  collectionViewHeightForRowAtContentIndex: function(collectionView, index) {
    // just test for presence of a rowHeightKey..to implement fast path...
    if (!this.contentRowHeightKey) return this.get('rowHeight');
    var key = this.get('contentRowHeightKey'), content = this.get('content');
    if (content) content = content.objectAt(index);
    return content ? content.get(key) : this.get('rowHeight');
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
    @returns {SC.ListView} reciever
  */
  rowHeightsDidChangeInRange: function(range) {
    
    // if no range is passed, just wipe the cached...
    if (!range) {
      this._list_rowOffsets = this._list_rowHeights = null ;
      
    // otherwise, truncate the array of rowOffsets so that everything after
    // the start of this range will be recalc'd.  For cached rowHeights,
    // set to undefined unless max range exceeds length, in which case you
    // just truncate.
    } else {
      var min = Math.max(0,SC.minRange(range)) ;
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
    
    // and notify that nowShowingRange may have changed...
    this.invalidateNowShowingRange() ;
  },
  
  /**
    Set to YES if your list view should have uniform row heights.  This will
    enable an optimization that avoids inspecting actual content objects 
    when calculating the size of the view.
    
    The default version of this property is set to YES unless you set a 
    delegate or a contentRowHeightKey.
  */
  hasUniformRowHeights: YES,
  // function(key, value) {
  //     if (value !== undefined) this._list_hasUniformRowHeights = value ;
  //     value = this._list_hasUniformRowHeights;
  //     return SC.none(value) ? !((this.delegate && this.delegate.collectionViewHeightForRowAtContentIndex) || this.contentRowHeightKey) : value ;
  //   }.property('delegate', 'contentRowHeightKey').cacheable(),

  /**
    Calculates the offset for the row at the specified index.  Based on the 
    current setting this may compute the row heights for previous items or 
    it will simply do some math...
  */
  offsetForRowAtContentIndex: function(index) {
    // do some simple math if we have uniform row heights...
    if (this.get('hasUniformRowHeights')) {
      return this.get('rowHeight') * index ;
      
    // otherwise, use the rowOffsets cache...
    } else {
      // get caches
      var offsets = this._list_rowOffsets;
      if (!offsets) offsets = this._list_rowOffsets = [] ;

      // OK, now try the fast path...if undefined, loop backwards until we
      // find an offset that IS cached...
      var len = offsets.length, cur = index, height, ret;

      // get the cached offset.  Note that if the requested index is longer 
      // than the length of the offsets cache, then just assume the value is
      // undefined.  We don't want to accidentally read an old value...
      if (index<len) {
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
      while(cur < index) {
        cur = cur + 1; // go to next offset
        
        // get height...recache if needed....
        height = this._list_heightForRowAtContentIndex(index) ;
        
        // add to ret and save in cache
        ret = ret + height ;
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
  heightForRowAtContentIndex: function(index) {
    if (this.get('hasUniformRowHeights')) {
      return this.get('rowHeight') ;
    } else return this._list_heightForRowAtContentIndex(index);
  },
  
  /** @private
    By-passes the uniform row heights check.  Makes offsetForRow... a little
    faster.
  */
  _list_heightForRowAtContentIndex: function(index) {
    var heights = this._list_rowHeights;
    if (!heights) heights = this._list_rowHeights = [] ;

    var height = (index<heights.length) ? heights[index] : undefined;
    if (height===undefined) {
      height = heights[index] = this.invokeDelegateMethod(this.delegate, 'collectionViewHeightForRowAtContentIndex', this, index) || 0 ;
    }

    return height ;
  },
  
  // ..........................................................
  // SUBCLASS SUPPORT
  // 

  insertionOrientation: SC.VERTICAL_ORIENTATION,

  /** 
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

  /**
    Calculates the visible content range in the specified frame.  If 
    uniform rows are set, this will use some simple math.  Otherwise it will
    compute all row offsets leading up to the frame.
  */
  contentRangeInFrame: function(frame) {
    var min, max, ret, rowHeight ;
    var minY = SC.minY(frame), maxY = SC.maxY(frame);
    // use some simple math...
    if (this.get('hasUniformRowHeights')) {
      rowHeight = this.get('rowHeight') || 0 ;
      min = Math.max(0,Math.floor(minY / rowHeight)-1) ;
      max = Math.ceil(maxY / rowHeight) ;
      
    // otherwise, get the cached row offsets...
    } else {
      var content = this.get('content');
      var len = (content ? content.get('length') : 0), offset = 0;
      min = null; 
      max = 0;
      do {
        offset += this.offsetForRowAtContentIndex(max); // add offset.
        if ((min===null) && (offset >= minY)) min = max; // set min
      } while (max<len && offset < maxY);
    }
    
    // convert to range...
    ret = { start: min, length: max - min } ; 
    return ret ;
  },
  
  /** @private */
  layoutItemView: function(itemView, contentIndex, firstLayout) {

    // use cached hash to reduce memory allocs
    var layout = this._list_cachedItemViewLayoutHash ;
    if (!layout) {
      layout = this._list_cachedItemViewLayoutHash = { left: 0, right: 0 };
    }
    
    // set top & height...
    layout.top = this.offsetForRowAtContentIndex(contentIndex);
    layout.height = this.heightForRowAtContentIndex(contentIndex);
    layout.zIndex = contentIndex;
    
    itemView.adjust(layout);
  },
  
  insertionPointClass: SC.View.extend({
    emptyElement: '<div><span class="anchor"></span></div>',
    styleClass: 'sc-list-insertion-point',
    layout: { top: -6, height: 2, left: 4, right: 2 }
  }),

  showInsertionPoint: function(itemView, dropOperation) {
    if (!itemView) return ;
    
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
    
      var insertionPoint = this._insertionPointView ;
      if (insertionPoint.get('parentView') !== itemView.get('parentView')) {
        itemView.get('parentView').appendChild(insertionPoint) ;
      }
      
      // var frame = itemView.get('frame') ;
      // console.log($I(frame));
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
    var rowHeight = this.get('rowHeight') || 0 ;

    // find the row and offset to work with
    var offset = loc.y - f.y - sf.y ;
    var retOp = SC.DROP_BEFORE ;
    var ret = Math.floor(offset / this.get('rowHeight')) ;
     
    // find the percent through the row...
    var percentage = (offset / rowHeight) - ret ;
    
    // if the dropOperation is SC.DROP_ON and we are in the center 60%
    // then return the current item.
    if (dropOperation === SC.DROP_ON) {
      if (percentage > 0.80) ret++ ;
      if ((percentage >= 0.20) && (percentage <= 0.80)) {
        retOp = SC.DROP_ON;
      }
    } else {
      if (percentage > 0.45) ret++ ;
    }
    
    // console.log('[ret, retOp] is [%@, %@]'.fmt(ret, retOp));
    return [ret, retOp] ;
  }
  
}) ;
