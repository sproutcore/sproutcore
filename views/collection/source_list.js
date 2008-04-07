// ==========================================================================
// SC.SourceListView
// ==========================================================================

require('views/collection') ;
require('views/collection/text_cell');

/** @class

  Displays a source list like the source list in iTunes.

  @extends SC.CollectionView
  @author    Charles Jolley  
  @version 1.0
*/
SC.SourceListView = SC.CollectionView.extend(
/** @scope SC.SourceListView.prototype */ {
  
  emptyElement: '<div class="sc-source-list-view"></div>',
  
  /** 
    The common row height for list view items.
    
    If you set this property, then the SourceListView will be able to use this
    property to perform absolute layout of its children and to minimize t
    number of actual views it has to create.
    
    The value should be an integer expressed in pixels.
  */
  rowHeight: 32,
  
  /**
    The default example item view will render text-based items.
    
    You can override this as you wish.
  */
  exampleView: SC.TextCellView,
  
  /**
    The standard group view provided by source list view generally 
    provides all the functionality you need.
  */
  exampleGroupView: SC.View.extend({
    
    emptyElement: '<div class="sc-source-list-group"><div class="sc-collection-item sc-source-list-label"></div></div>',
    
    groupValue: null,
    
    groupValueObserver: function() {
      var v=  this.get('groupValue') || '' ;
      this.outlet('labelView').set('content', v.capitalize()) ;  
    }.observes('groupValue'),
    
    labelView: SC.LabelView.outletFor('.sc-source-list-label:1:1')
    
  }),
  
  insertionOrientation: SC.VERTICAL_ORIENTATION,
  
  // disable incremental rendering for now
  contentRangeInFrame: function(frame) {
    // var rowHeight = this.get('rowHeight') || 0 ;
    // var min = Math.max(0,Math.floor(SC.minY(frame) / rowHeight)-1) ;
    // var max = Math.ceil(SC.maxY(frame) / rowHeight) ;
    // var ret = { start: min, length: max - min } ; 
    var content =this.get('content') ;
    var len = (content) ? content.get('length') : 0 ;
    var ret = { start: 0, length: len } ;
    return ret ;
  },
  
  /** @private */
  layoutItemView: function(itemView, contentIndex, firstLayout) {
    SC.Benchmark.start('SC.SourceListView.layoutItemViewsFor') ;
    
    var rowHeight = this.get('rowHeight') || 0 ;
    
    // layout relative to top of group.  Leave open row for title
    var range = this.groupRangeForContentIndex(contentIndex) ;

    //console.log('layout: %@ -- range: {%@,%@} -- v: %@'.fmt(contentIndex, range.start, range.length, itemView.getPath('content.name'))) ;

    contentIndex = (contentIndex - range.start) + 1 ;
    var f = { 
      x: 0, 
      y: contentIndex*rowHeight,
      height: rowHeight, 
      width: this.get('innerFrame').width 
    } ;
    
    
    if (firstLayout || !SC.rectsEqual(itemView.get('frame'), f)) {
      itemView.set('frame', f) ;      
    }
    SC.Benchmark.end('SC.SourceListView.layoutItemViewsFor') ;
  },
  
  layoutGroupView: function(groupView, groupValue, contentIndexHint, firstLayout) {
    SC.Benchmark.start('SC.SourceListView.layoutGroupView') ;
    
    console.log('layoutGouprView', groupValue) ;
    
    // find the range this group will belong to
    var range = this.groupRangeForContentIndex(contentIndexHint) ;
    var priorGroupCount = this.countGroupsInRange({ start: 0, length: range.start }) ;
    var rowHeight = this.get('rowHeight') || 0 ;
    var parentView = groupView.get('parentView') || this ;

    var f = { 
      x: 0, 
      y: (range.start + priorGroupCount)*rowHeight,
      height: rowHeight * (range.length + 1), 
      width: (parentView || this).get('innerFrame').width 
    } ;
    
    if (firstLayout || !SC.rectsEqual(groupView.get('frame'), f)) {
      groupView.set('frame', f) ;      
    }
    SC.Benchmark.end('SC.SourceListView.layoutGroupView') ;    
  },
  
  // Calculates groups in the specified range
  countGroupsInRange: function(range) {
    var max = SC.maxRange(range) ;
    var loc = SC.minRange(range) ;
    var ret = 0 ;
    while(loc < max) {
      var range = this.groupRangeForContentIndex(loc) ;
      loc = SC.maxRange(range) ;
      ret++;
    }
    return ret ;
  },
  
  computeFrame: function() {
    var content = this.get('content') ;
    var rows = (content) ? content.get('length') : 0 ;
    var rowHeight = this.get('rowHeight') || 20 ;
    
    // find number of groups.  If group count == 1, it will be hidden to set 
    // to 0
    var groupCount = this.countGroupsInRange({ start: 0, length: content.get('length') });
    if (groupCount <= 1) groupCount = 0 ;
    
    var parent = this.get('parentNode') ;
    var f = (parent) ? parent.get('innerFrame') : { width: 100, height: 100 } ;

    f.x = f.y = 0;
    f.height = Math.max(f.height, (rows + groupCount) * rowHeight) ;
//    console.log('computeFrame(%@)'.fmt($H(f).inspect())) ;
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
    var rowHeight = this.get('rowHeight') || 0 ;

    // find the offset to work with.
    var offset = loc.y - f.y - sf.y ;
    var ret = -1; // the return value

    // search groups until we find one that matches
    var top = 0;
    var idx = 0 ;
    while((ret<0) && (range = this.groupRangeForContentIndex(idx)).length>0){
      var max = top + ((range.length+1) * rowHeight) ;
      
      // the offset is within the group, find the row in the group.  Remember
      // that the top row is actually the label, so we should return -1 if 
      // we hit there.
      if (max >= offset) {
        offset -= top ;
        ret = Math.floor((offset / rowHeight) + 0.4) ;
        if (ret < 1) return -1 ; // top row!
        ret = (ret - 1) + idx ;
        
      // we are not yet within the group, go on to the next group.
      } else {
        idx += range.length ;
        top = max ;
      }
    }
    return ret ;
  }
  
}) ;
