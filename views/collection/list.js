// ==========================================================================
// SC.ListView
// ==========================================================================

require('views/collection') ;
require('views/collection/text_cell');

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
  exampleView: SC.TextCellView,
  
  insertionOrientation: SC.VERTICAL_ORIENTATION,
  
  /** @private */
  layoutChildViewsFor: function(parentView, startingView) {
    var rowHeight = this.get('rowHeight') ;
    if (rowHeight == null) return false ;
    
    if (!startingView) startingView = parentView.firstChild ;
    var y = (startingView && startingView.previousSibling) ? SC.maxY(startingView.previousSibling.get('frame')) : 0;
    var f = (parentView || this).get('frame') ; 
    f = { x: 0, height: rowHeight } ;
    var view = startingView || parentView.firstChild;
    while(view) {
      view.set('isPositioned', true) ;
      f.y = y ;
      if (!SC.rectsEqual(view.get('frame'), f)) view.set('frame', f) ;
      y += rowHeight; 
      view = view.nextSibling ;
    }
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
    var f = this.get('frame') ;
    loc = this.convertFrameFromView(loc, null) ;
    var ret = Math.floor((loc.y - f.y) / this.get('rowHeight') + 0.5) ;
    return ret ;
  }
  
}) ;
