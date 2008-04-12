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
    name of property on the content object to use for the source list text.
  */
  contentValueProperty: null,
  
  /**
    Set to YES if you want source list items to display an icon.
    
    If this property is set, list items will leave space for a display 
    icon to the left of the text label.  To actually display an icon in that
    space, you will also need to set the contenIconUrlProperty or the 
    contentIconClassNameProperty or both.
  */
  hasContentIcon: NO,
  
  /**
    Set if YES if you want the source list to display a branch arrow.
    
    If this property is set, list items will leave space on the right edge
    to display a branch arrow, indicating the user can click on the item to
    reveal a menu or another level of content. 
    
    To actually display a branch arrow, you must also set the 
    contentIsBranchProperty.
  */
  hasContentBranch: NO,
  
  /**
    Name of the content object property that contains the icon url.
    
    This is the *name* of the property you want the list items to inspect
    on content objects to retrieve an icon image URL.  For example, if you
    set this property to 'icon', then the icon displayed for each item will
    be the URL returned by content.get('icon').
    
    The list item will display a blank icon if this property or the property
    you name return a null value.  Note that to display an icon at all, you 
    must set hasContentIcon to YES.
    
    If you would prefer to use a CSS class name instead of an icon URL (for
    example, if you want to use spriting), then you should set the
    contentIconClassNameProperty instead.  If you do set the class name
    property and this property together, then the class name property will
    be used only if the value of this property is null.
  */
  contentIconUrlProperty: null,

  /**
    Name of the content object property that contains the icon class name.
    
    This is the *name* of the property you want the list items to inspect
    on content objects to retrieve an css class name to apply to icon image.
    For example, if you set this property to 'icon', then the icon displayed 
    for each item will be the URL returned by content.get('icon').
    
    You would use this property if you want to use sprites to set the image
    icon for a list item instead of setting the image directly. Spriting 
    common icons can dramatically reduce the load time of your application.  
    If you are using anything other than a custom icon for your icons, it is 
    highly recommended that you use spriting and this property instead of 
    setting image URLs directly.

    No class name will be applied to the img tag if this property or the 
    property you name return a null value.  Note that to display an icon at 
    all, you must set hasContentIcon to YES.
    
    If you would prefer to use an image URL instead of an spriting then you 
    should set the contentIconUrlProperty instead.
  */
  contentIconClassNameProperty: null,
  
  /**
    Name of content object property that contains the unread count.
    
    The unread count is used to indicate to a user when an item in the 
    source list contains items that need their attention.  If the unread 
    count on a content object is a non-zero number, it will be displayed on
    the right side of the list item.
    
    This is the *name* of the property you want the list item to inspect
    on content objects to receive the unread count for the item.  For example,
    if you set this property to "unread", then the unread count will be
    the value returned by content.get('unread').
    
    If you do not want to use unread counts, leave this property to null.
  */
  contentUnreadCountProperty: null,
  
  /**
    Name of the content object property that contains the branch state.
    
    If an item is a branch, then a branch arrow will be displayed at the
    right edge indicating that clicking on the item will reveal another
    level or content or possibly a popup menu.
    
    To display the branch, you must also set hasContentBranch to YES.
    
    This is the *name* of the property you want the list item to inspect 
    on the content objects to retrieve the branch state.  For example, if
    you set this property to "isBranch", then the branch state will be the
    value returned by content.get('isBranch').
  */
  contentIsBranchProperty: null,
  
  /** 
    The common row height for list view items.
    
    The value should be an integer expressed in pixels.
  */
  rowHeight: 32,
  
  /**
    Source list view items are usually list item views.  You can override 
    this if you wish.
  */
  exampleView: SC.ListItemView,
  
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
    
    console.log('layoutGroupView', groupValue) ;
    
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
