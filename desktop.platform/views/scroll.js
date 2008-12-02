// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('views/view') ;
require('desktop.platform/views/clip');
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
    The content view you want the scroll view to manage. This will be 
    assigned to the contentView of the clipView also.
  */
  contentView: null,

  /**
    The clipping view.  Define your own subclass here if you prefer.  It will
    be instantiated when the view is setup.  Note that the layout for the 
    view must be defined by you when the view is created.
  */
  clipView: SC.ClipView,
  
  /** If YES then a horizontal scroller will be created. */
  canScrollHorizontal: YES,

  /** 
    If YES then the horizontal scroller is visible.  Note that this differs
    from canScrollHorizontal, which determines if a scroller is created at
    all.
  */
  isHorizontalScrollerVisible: YES,
  
  /** 
    Override with your own horizontal scroller class if you prefer.
  */
  horizontalScrollerView: SC.ScrollerView,
  
  horizontalScrollOffset: 0,
  
  /** If YES, then a vertical scroller will be created. */
  canScrollVertical: YES,

  /** 
    If YES then the vertical scroller is visible.  Note that this differs
    from canScrollVertical, which determines if a scroller is created at
    all.
  */
  isVerticalScrollerVisible: YES,
  
  /**
    Override with your own vertical scroller class if you prefer.
  */
  verticalScrollerView: SC.ScrollerView,
  
  verticalScrollOffset: 0,

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
    var clip = this.get('clipView') ;
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