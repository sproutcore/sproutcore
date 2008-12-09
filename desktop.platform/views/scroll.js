// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('views/view') ;
require('views/container');
require('desktop.platform/views/scroller');

/** @class

  Implements a complete scroll view.  This class uses a manual implementation
  of scrollers in order to properly support clipping frames.
  
  @extends SC.View
  @since SproutCore 1.0
*/
SC.ScrollView = SC.View.extend({

  styleClass: 'sc-scroll-view',
  
  // ..........................................................
  // PROPERTIES
  // 
  
  /** 
    The content view you want the scroll view to manage. This will be assigned to the contentView of the clipView also.
  */
  contentView: null,

  /**
    The current horizontal scroll offset. Changing this value will update both the contentView and the horizontal scroller, if there is one.
  */
  horizontalScrollOffset: 0,

  /**
    The current vertical scroll offset.  Changing this value will update both the contentView and the vertical scroller, if there is one.
  */
  verticalScrollOffset: 0,
  
  // ..........................................................
  // SCROLLERS
  // 
  
  /** 
    YES if the view shuld maintain a horizontal scroller.   This property must be set when the view is created.
    
    @property {Boolean}
  */
  hasHorizontalScroller: YES,
  
  /**
    The horizontal scroller view class. This will be replaced with a view instance when the ScrollView is created unless hasHorizontalScroller is NO.
    
    @property {SC.View}
  */
  horizontalScrollerView: SC.ScrollerView,
  
  /**
    YES if the horizontal scroller should be visible.  You can change this property value anytime to show or hide the horizontal scroller.  If you do not want to use a horizontal scroller at all, you should instead set hasHorizontalScroller to NO to avoid creating a scroller view in the first place.
    
    @property {Boolean}
  */
  isHorizontalScrollerVisible: YES,

  /** 
    YES if the view shuld maintain a vertical scroller.   This property must be set when the view is created.
    
    @property {Boolean}
  */
  hasVerticalScroller: YES,
  
  /**
    The vertical scroller view class. This will be replaced with a view instance when the ScrollView is created unless hasVerticalScroller is NO.
    
    @property {SC.View}
  */
  verticalScrollerView: SC.ScrollerView,
  
  /**
    YES if the vertical scroller should be visible.  You can change this property value anytime to show or hide the vertical scroller.  If you do not want to use a vertical scroller at all, you should instead set hasVerticalScroller to NO to avoid creating a scroller view in the first place.
    
    @property {Boolean}
  */
  isVerticalScrollerVisible: YES,
  
  // ..........................................................
  // CUSTOM VIEWS
  // 
  
  /**
    The container view that will contain your main content view.
  */
  containerView: SC.ContainerView,
  
  // ..........................................................
  // METHODS
  // 
  
  /**
    Adjusts the layout for the various internal views.  This method is called
    once when the scroll view is first configured and then anytime a scroller
    is shown or hidden.  You can call this method yourself as well to retile.
    
    You may also want to override this method to handle layout for any
    additional controls you have added to the view.
  */
  tile: function() {
    var hscroll = this.get('horizontalScrollerView');
    var vscroll = this.get('verticalScrollerView');
    var hasHorizontal = hscroll && this.get('isHorizontalScrollerVisible');
    var hasVertical = vscroll && this.get('isVerticalScrollerVisible');
    var clip = this.get('containerView') ;
    var clipLayout = { left: 0, top: 0 };
    var t ;
    
    if (hasHorizontal) {
      t = hscroll.get('scrollerThickness');
      hscroll.set('layout', { left: 0, bottom: 0, right: 0, height: t });
      clipLayout.bottom = t;
    } else clipLayout.bottom = 0 ;

    if (hasVertical) {
      t = vscroll.get('scrollerThickness');
      vscroll.set('layout', { top: 0, bottom: 0, right: 0, width: t });
      clipLayout.right = t;
    } else clipLayout.bottom = 0 ;
    
    clip.set('layout', clipLayout);
  },
  
  /** @private
    Called whenever a scroller visibility changes.  Calls the tile() method.
  */
  scrollerVisibilityDidChange: function() {
    this.tile();
  }.observes('isVerticalScrollerVisible', 'isHorizontalScrollerVisible'),
    
  // ..........................................................
  // INTERNAL SUPPORT
  // 
  
  createChildViews: function() {
    var childViews = [] ;
    var view ;

    if (view = this.clipView) {
      childViews.push(this.clipView = this.createChildView(view));
    }
    
    if (view=this.horizontalScrollerView) {
      if (this.get('canScrollHorizontal')) {
        view = this.horizontalScrollerView = this.createChildView(view) ;
        childViews.push(view);
      } else this.horizontalScrollerView = null ;
    }

    if (view=this.verticalScrollerView) {
      if (this.get('canScrollVertical')) {
        view = this.verticalScrollerView = this.createChildView(view) ;
        childViews.push(view);
      } else this.verticalScrollerView = null ;
    }
    
    this.childViews = childViews ;
  },
  
  prepareDisplay: function() {
    sc_super();
    this.tile(); // setup initial tiling
  }    

}) ;