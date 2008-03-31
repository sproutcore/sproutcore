// ==========================================================================
// SC.GridView
// ==========================================================================

require('views/collection') ;
require('views/collection/text_cell');

/** @class

  A grid view renders a collection of items in a grid of rows and columns.

  @extends SC.CollectionView
  @author    Charles Jolley  
  @version 1.0
*/
SC.GridView = SC.CollectionView.extend(
/** @scope SC.GridView.prototype */ {
  
  emptyElement: '<div class="grid-view"></div>',
  
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
  exampleView: SC.TextCellView,
  
  insertionOrientation: SC.HORIZONTAL_ORIENTATION,
  
  /** @private */
  layoutItemViewsFor: function(parentView, startingView) {
    SC.Benchmark.start('SC.GridView.layoutItemViewsFor') ;

    var rowHeight = this.get('rowHeight') ;
    var columnWidth = this.get('columnWidth') ;
    if ((rowHeight == null) || (columnWidth == null)) return false ;

    // set items per row.
    parentView = parentView || this ;
    var f = parentView.get('innerFrame') ;
    f.x= f.y = 0 ; 
    var itemsPerRow = Math.floor(f.width / (columnWidth || 1)) ;
    if (this.get('itemsPerRow') != itemsPerRow) this.set('itemsPerRow', itemsPerRow);
    
    // fix width to evenly match items per row
    columnWidth = Math.floor((f.width-20)/itemsPerRow) ;
    
    // get the startingView and the starting X,Y
    if (!startingView) startingView = parentView.firstChild ;
    var x,y ;
    if (startingView && startingView.previousSibling) {
      var prevFrame = startingView.previousSibling.get('frame') ;
      x = SC.maxX(prevFrame); y = SC.minY(prevFrame) ;
    } else { x = f.x; y = f.y; } 
    
    // Now setup the default frame
    var maxX = SC.maxX(f);
    var minX = f.x;
    f = { x: 0, y: 0, height: rowHeight, width: columnWidth } ;
    var view = startingView ;
    while(view) {
      // loop back to beginning of next line if needed.
      if ((x+columnWidth) >= maxX) {
        x = minX ;
        y += rowHeight ;
      }

      // save frame
      f.y = y ; f.x = x;
      if (!SC.rectsEqual(view.get('frame'), f)) view.set('frame', f) ;
      x += columnWidth; 
      view = view.nextSibling ;
    }
    
    SC.Benchmark.end('SC.GridView.layoutItemViewsFor') ;
    
    return true; 
  },
  
  // computedViewHeight: function(groupView) {
  //   var content = this.get('content') ;
  //   var rowHeight = this.get('rowHeight') ;
  //   var parentNode = this.get('parentNode') ;
  //   var minHeight = (parentNode) ? 20 : parentNode.get('frame').height ;
  //   var height = 0 ;
  //   
  //   if (content && rowHeight) {
  //     var rows = content.get('length') ;
  //     height = rows * rowHeight ;
  //   }
  //   if (height < minHeight) height = minHeight ;
  //   return height ;
  // },
  
  insertionPointClass: SC.View.extend({
    emptyElement: '<div class="grid-insertion-point"><span class="anchor"></span></div>'
  }),
  
  showInsertionPointBefore: function(itemView) {
    if (!itemView) return ;
  
    if (!this._insertionPointView) {
      this._insertionPointView = this.insertionPointClass.create() ;
    } ;
    
    var insertionPoint = this._insertionPointView ;
    var itemViewFrame = itemView.get('frame') ;
    f = { height: itemViewFrame.height - 6, 
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
  },
  
  hideInsertionPoint: function() {
    var insertionPoint = this._insertionPointView ;
    if (insertionPoint) insertionPoint.removeFromParent() ;
  },
  
  // // We can do this much faster programatically using the rowHeight
  insertionIndexForLocation: function(loc) {  
    var f = this.get('frame') ;
    var sf = this.get('scrollFrame') ;
    loc = this.convertFrameFromView(loc, null) ;
    
    var itemsPerRow = this.get('itemsPerRow') || 1 ; 
    var columnWidth = Math.floor(f.width / itemsPerRow) ;
    var row = Math.floor((loc.y - f.y - sf.y) / this.get('rowHeight')) ;
    var col = Math.floor(((loc.x - f.x - sf.x) / columnWidth) + 0.5) ;
    
    var ret= (row*itemsPerRow) + col ;
    console.log('ret: %@ - itemsPerRow: %@ scrollFrame: %@'.fmt(ret, itemsPerRow, $H(sf).inspect())) ;
    return ret ;
  }
  
}) ;
