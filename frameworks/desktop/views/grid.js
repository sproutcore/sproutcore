// ==========================================================================
// SC.GridView
// ==========================================================================

require('views/list') ;

/** @class

  A grid view renders a collection of items in a grid of rows and columns.

  @extends SC.CollectionView
  @author    Charles Jolley  
  @version 1.0
*/
SC.GridView = SC.ListView.extend(
/** @scope SC.GridView.prototype */ {
    classNames: ['sc-grid-view'],
  
  layout: { left:0, right:0, top:0, bottom:0 },

  /** 
    The common row height for grid items.
    
    The value should be an integer expressed in pixels.
  */
  rowHeight: 48,
  
  /**
    The minimum column width for grid items.  Items will actually
    be laid out as needed to completely fill the space, but the minimum
    width of each item will be this value.
  */
  columnWidth: 64,

  /**
    The default example item view will render text-based items.
    
    You can override this as you wish.
  */
  exampleView: SC.LabelView,
  
  insertionOrientation: SC.HORIZONTAL_ORIENTATION,
  
  /** @private */
  itemsPerRow: function() {
    var f = this.get('frame') ;
    var columnWidth = this.get('columnWidth') || 0 ;

    return (columnWidth <= 0) ? 1 : Math.floor(f.width / columnWidth) ;
  }.property('clippingFrame', 'columnWidth').cacheable(),
  
  /** @private
    Find the contentIndexes to display in the passed rect. Note that we 
    ignore the width of the rect passed since we need to have a single
    contiguous range.
  */
  contentIndexesInRect: function(rect) {
    var rowHeight = this.get('rowHeight') || 48 ;
    var itemsPerRow = this.get('itemsPerRow') ;
    
    var min = Math.floor(SC.minY(rect) / rowHeight) * itemsPerRow  ;
    var max = Math.ceil(SC.maxY(rect) / rowHeight) * itemsPerRow ;
    return SC.IndexSet.create(min, max-min);
  },
  
  /** @private */
  layoutForContentIndex: function(contentIndex) {
    var rowHeight = this.get('rowHeight') || 48 ;
    var frameWidth = this.get('clippingFrame').width ;
    var itemsPerRow = this.get('itemsPerRow') ;
    var columnWidth = Math.floor(frameWidth/itemsPerRow);
    
    var row = Math.floor(contentIndex / itemsPerRow) ;
    var col = contentIndex - (itemsPerRow*row) ;
    return { 
      left: col * columnWidth,
      top: row * rowHeight,
      height: rowHeight,
      width: columnWidth
    };
  },
  
  /** @private
    Overrides default CollectionView method to compute the minimim height
    of the list view.
  */
  computeLayout: function() {
    var content = this.get('content') ;
    var count = (content) ? content.get('length') : 0 ;
    var rowHeight = this.get('rowHeight') || 48 ;
    var itemsPerRow = this.get('itemsPerRow') ;
    var rows = Math.ceil(count / itemsPerRow) ;
  
    // use this cached layout hash to avoid allocing memory...
    var ret = this._cachedLayoutHash ;
    if (!ret) ret = this._cachedLayoutHash = {};
    
    // set minHeight
    ret.minHeight = rows * rowHeight ;
    this.calculatedHeight = ret.minHeight;
    return ret; 
  },
  
  insertionPointClass: SC.View.extend({
    classNames: ['grid-insertion-point'],
    
    render: function(context, firstTime) {
      if (firstTime) context.push('<span class="anchor"></span>') ;
    }

  }),
  
  showInsertionPoint: function(itemView, dropOperation) {
    if (!itemView) return ;
    
    // if drop on, then just add a class...
    if (dropOperation === SC.DROP_ON) {
      if (itemView !== this._dropOnInsertionPoint) {
        this.hideInsertionPoint() ;
        itemView.addClassName('drop-target') ;
        this._dropOnInsertionPoint = itemView ;
      }
      
    } else {
      
      if (this._dropOnInsertionPoint) {
        this._dropOnInsertionPoint.removeClassName('drop-target') ;
        this._dropOnInsertionPoint = null ;
      }
    
      if (!this._insertionPointView) {
        this._insertionPointView = this.insertionPointClass.create() ;
      }
    
      var insertionPoint = this._insertionPointView ;
      var itemViewFrame = itemView.get('frame') ;
      var f = { height: itemViewFrame.height - 6, 
            x: itemViewFrame.x, 
            y: itemViewFrame.y + 6, 
            width: 0 
          };

      if (!SC.rectsEqual(insertionPoint.get('frame'), f)) {
        insertionPoint.set('frame', f) ;
      }

      if (insertionPoint.parentNode != itemView.parentNode) {
        itemView.parentNode.appendChild(insertionPoint) ;
      }
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
  
  // // We can do this much faster programatically using the rowHeight
  insertionIndexForLocation: function(loc, dropOperation) {  
    var f = this.get('frame') ;
    var sf = this.get('scrollFrame') ;
    
    var itemsPerRow = this.get('itemsPerRow') ; 
    var columnWidth = Math.floor(f.width / itemsPerRow) ;
    var row = Math.floor((loc.y - f.y - sf.y) / this.get('rowHeight')) ;

    var retOp = SC.DROP_BEFORE ;
    
    var offset = (loc.x - f.x - sf.x) ;
    var col = Math.floor(offset / columnWidth) ;
    var percentage = (offset / columnWidth) - col ;
    
    // if the dropOperation is SC.DROP_ON and we are in the center 60%
    // then return the current item.
    if (dropOperation === SC.DROP_ON) {
      if (percentage > 0.80) col++ ;
      if ((percentage >= 0.20) && (percentage <= 0.80)) {
        retOp = SC.DROP_ON;
      }
    } else {
      if (percentage > 0.45) col++ ;
    }
    
    // convert to index
    var ret= (row*itemsPerRow) + col ;
    return [ret, retOp] ;
  },

  /** @private
    If the size of the clipping frame changes, all of the item views
    on screen are potentially in the wrong position.  Update all of their
    layouts if different.
  */
  _gv_clippingFrameDidChange: function() {
    var nowShowing = this.get('nowShowing'), itemView, idx, len;
    this.notifyPropertyChange('itemsPerRow');

    len = nowShowing.get('length');

    for (idx=0; idx < len; idx++) {
      itemView = this.itemViewForContentIndex(idx);
      itemView.adjust(this.layoutForContentIndex(idx));
    }
  }.observes('clippingFrame')
}) ;
