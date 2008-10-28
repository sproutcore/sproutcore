// ==========================================================================
// SC.TableView
// ==========================================================================

require('views/collection/collection') ;
require('views/label');

/** @class

  Displays a table view with columns

  @extends SC.CollectionView
  @author    Charles Jolley  
  @version 1.0
*/
SC.TableView = SC.CollectionView.extend(
/** @scope SC.TableView.prototype */ {
  
  emptyElement: '<div class="sc-table-view"></div>',
  
  /** 
    The common row height for list view items.
    
    If you set this property, then the TableView will be able to use this
    property to perform absolute layout of its children and to minimize t
    number of actual views it has to create.
    
    The value should be an integer expressed in pixels.
  */
  rowHeight: 20,
  
  /**
    The default example item view will render text-based items.
    
    You can override this as you wish.
  */
  exampleView: SC.LabelView,
  
  insertionOrientation: SC.VERTICAL_ORIENTATION,
  
  contentRangeInFrame: function(frame) {
    var rowHeight = this.get('rowHeight') || 0 ;
    var min = Math.max(0,Math.floor(SC.minY(frame) / rowHeight)-1) ;
    var max = Math.ceil(SC.maxY(frame) / rowHeight) ;
    var ret = { start: min, length: max - min } ; 
    // console.log('contentRangeInFrame(%@) = %@'.fmt($H(frame).inspect(), $H(ret).inspect()));
    //if (frame.height < 100) debugger ;
    return ret ;
  },
  
  /** @private */
  layoutItemView: function(itemView, contentIndex, firstLayout) {
    //if (!itemView) debugger ;
    SC.Benchmark.start('SC.TableView.layoutItemViewsFor') ;
    
    var rowHeight = this.get('rowHeight') || 0 ;
    var parentView = itemView.get('parentView') ;
    var f = { 
      x: 0, 
      y: contentIndex*rowHeight,
      height: rowHeight, 
      width: (parentView || this).get('innerFrame').width 
    } ;
    
    if (firstLayout || !SC.rectsEqual(itemView.get('frame'), f)) {
      itemView.set('frame', f) ;      
    }
    SC.Benchmark.end('SC.TableView.layoutItemViewsFor') ;
  },
  
  computeFrame: function() {
    var content = this.get('content') ;
    var rows = (content) ? content.get('length') : 0 ;
    var rowHeight = this.get('rowHeight') || 20 ;
    
    var parent = this.get('parentNode') ;
    var f = (parent) ? parent.get('innerFrame') : { width: 100, height: 100 } ;

    f.x = f.y = 0;
    f.height = Math.max(f.height, rows * rowHeight) ;
    // console.log('computeFrame(%@)'.fmt($H(f).inspect())) ;
    return f ;
  },
  
  insertionPointClass: SC.View.extend({
    emptyElement: '<div class="list-insertion-point"><span class="anchor"></span></div>'
  }),
  
  showInsertionPointBefore: function(itemView) {
    if (!itemView) return ;

    if (!this._insertionPointView) {
      this._insertionPointView = this.insertionPointClass.create() ;
    } ;
    
    var insertionPoint = this._insertionPointView ;
    f = { height: 0, x: 8, y: itemView.get('frame').y, width: itemView.owner.get('frame').width };
    insertionPoint.set('frame', f) ;

    if (insertionPoint.parentNode != itemView.parentNode) {
      itemView.parentNode.appendChild(insertionPoint) ;
    }
  },
  
  hideInsertionPoint: function() {
    var insertionPoint = this._insertionPointView ;
    if (insertionPoint) insertionPoint.removeFromParent() ;
  },
  
  // We can do this much faster programatically using the rowHeight
  insertionIndexForLocation: function(loc) {  
    var f = this.get('innerFrame') ;
    var sf = this.get('scrollFrame') ;
    var ret = Math.floor(((loc.y - f.y - sf.y) / this.get('rowHeight')) + 0.4) ;
    return ret ;
  }
  
}) ;
