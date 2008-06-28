// ==========================================================================
// SC.ListView
// ==========================================================================

require('views/collection/collection') ;
require('views/label');
require('views/list_item') ;

/** @class

  A list view renders vertical lists of items.  It is a specialized form of
  collection view that is simpler than the table view, but more refined than
  a generic collection.
  
  You can use a list view just like a collection view, except that often you
  also should provide a default rowHeight.  Setting this value will allow 
  the ListView to optimize its rendering.

  @extends SC.CollectionView
  @author    Charles Jolley  
  @version 1.0
*/
SC.ListView = SC.CollectionView.extend(
/** @scope SC.ListView.prototype */ {
  
  emptyElement: '<div class="list-view"></div>',
  
  /** 
    The common row height for list view items.
    
    If you set this property, then the ListView will be able to use this
    property to perform absolute layout of its children and to minimize t
    number of actual views it has to create.
    
    The value should be an integer expressed in pixels.
  */
  rowHeight: 20,
  
  /**
    The default example item view will render text-based items.
    
    You can override this as you wish.
  */
  exampleView: SC.ListItemView,
  
  insertionOrientation: SC.VERTICAL_ORIENTATION,
  
  contentRangeInFrame: function(frame) {
    var rowHeight = this.get('rowHeight') || 0 ;
    var min = Math.max(0,Math.floor(SC.minY(frame) / rowHeight)-1) ;
    var max = Math.ceil(SC.maxY(frame) / rowHeight) ;
    var ret = { start: min, length: max - min } ; 
    return ret ;
  },
  
  /** @private */
  layoutItemView: function(itemView, contentIndex, firstLayout) {

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
      itemView.setStyle({ zIndex: contentIndex.toString() }) ;
    }
  },
  
  computeFrame: function() {
    var content = this.get('content') ;
    var rows = (content) ? content.get('length') : 0 ;
    var rowHeight = this.get('rowHeight') || 20 ;
    
    var parent = this.get('parentNode') ;
    var f = (parent) ? parent.get('innerFrame') : { width: 100, height: 100 } ;

    f.x = f.y = 0;
    f.height = Math.max(f.height, rows * rowHeight) ;
    return f ;
  },
  
  insertionPointClass: SC.View.extend({
    emptyElement: '<div class="list-insertion-point"><span class="anchor"></span></div>'
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
      } ;
    
      var insertionPoint = this._insertionPointView ;
      f = { height: 0, x: 8, y: itemView.get('frame').y, width: itemView.owner.get('frame').width };
      insertionPoint.set('frame', f) ;

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

  // We can do this much faster programatically using the rowHeight
  insertionIndexForLocation: function(loc, dropOperation) {  
    var f = this.get('innerFrame') ;
    var sf = this.get('scrollFrame') ;
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
    
    return [ret, retOp] ;
  }
  
}) ;
