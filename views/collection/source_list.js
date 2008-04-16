// ==========================================================================
// SC.SourceListView
// ==========================================================================

require('views/collection') ;
require('views/button/disclosure');

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
  contentValueKey: null,
  
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
    contentIsBranchKey.
  */
  hasContentBranch: NO,
  
  /**
    Name of the content object property that contains the icon .
    
    This is the *name* of the property you want the list items to inspect
    on content objects to retrieve an icon image URL.  For example, if you
    set this property to 'icon', then the icon displayed for each item will
    be the URL returned by content.get('icon').

    The value of this property must be either a URL or a CSS class name.  If
    you use a CSS class name, then the image src will be set to a blank 
    image and the class name will be applied automatically so you can use 
    spriting.  If a URL is returned it will be set as the src property on
    the image tag.
  */
  contentIconKey: null,
  
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
  contentUnreadCountKey: null,
  
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
  contentIsBranchKey: null,
  
  /**
    Key that contains the group name.
    
    If set, the title shown in the group label will be the value returned
    by this property on the group object.
  */
  groupTitleKey: null,

  /**
    Key that contains group visibility.
    
    If set, the group label will display a disclosure triangle matching the
    value of this property.
  */
  groupVisibleKey: null,
  
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
  exampleGroupView: SC.View.extend(SC.DelegateSupport, {
    
    emptyElement: ['<div class="sc-source-list-group">',
      '<a href="javascript:;" class="sc-source-list-label sc-disclosure-view sc-button-view button disclosure">',
      '<img src="%@" class="button" />'.fmt(static_url('blank')),
      '<span class="label"></span></a>',
    '</div>'].join(''),
    
    groupValue: null,
    
    groupTitleKey: null,
    
    groupVisibleKey: null,
    
    groupValueObserver: function() {

      var v=  this.get('groupValue') ;
      var labelView = this.outlet('labelView') ;
       
      // get the title.
      var groupTitleKey = this.getDelegateProperty(this.displayDelegate, 'groupTitleKey') ;
      var title = (v && v.get && groupTitleKey) ? v.get(groupTitleKey) : v;
      labelView.set('title', title.capitalize()) ;  

      // get the disclosure state.
      var groupVisibleKey = this.getDelegateProperty(this.displayDelegate, 'groupVisibleKey') ;
      if (groupVisibleKey) {
        var isVisible = (v && v.get) ? !!v.get(groupVisibleKey) : YES ;
        this.addClassName('show-disclosure') ;
        labelView.set('value', isVisible) ;
      } else this.removeClassName('show-disclosure') ;

    }.observes('groupValue'),
    
    labelView: SC.DisclosureView.outletFor('.sc-source-list-label:1:1')
    
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
