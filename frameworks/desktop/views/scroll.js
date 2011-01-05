// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('views/scroller');
sc_require('mixins/border');

SC.NORMAL_SCROLL_DECELERATION = 0.95;
SC.FAST_SCROLL_DECELERATION = 0.85;

/** @class

  Implements a complete scroll view.  This class uses a manual implementation
  of scrollers in order to properly support clipping frames.
  
  Important Events:
  
  - contentView frame size changes (to autoshow/hide scrollbar - adjust scrollbar size)
  - horizontalScrollOffset change
  - verticalScrollOffsetChanges
  - scroll wheel events
  
  @extends SC.View
  @since SproutCore 1.0
*/
SC.ScrollView = SC.View.extend(SC.Border, {
  /** @scope SC.ScrollView.prototype */
  classNames: ['sc-scroll-view'],
  
  // ..........................................................
  // PROPERTIES
  // 
  
  isScrollable: YES,
  
  /** 
    The content view you want the scroll view to manage. This will be assigned to the contentView of the clipView also.
  */
  contentView: null,
  
  /**
    The horizontal alignment for non-filling content inside of the ScrollView.
  */
  horizontalAlign: SC.ALIGN_LEFT,
  
  /**
    The vertical alignment for non-filling content inside of the ScrollView.
  */
  verticalAlign: SC.ALIGN_TOP,

  /**
    The current horizontal scroll offset. Changing this value will update both the contentView and the horizontal scroller, if there is one.
  */
  horizontalScrollOffset: function(key, value) {
    if (value !== undefined) {
      var minOffset = this.minimumHorizontalScrollOffset(),
          maxOffset = this.get('maximumHorizontalScrollOffset');
      this._scroll_horizontalScrollOffset = Math.max(minOffset,Math.min(maxOffset, value)) ;
    }

    return this._scroll_horizontalScrollOffset||0;
  }.property().cacheable(),
  
  /**
    The current vertical scroll offset.  Changing this value will update both the contentView and the vertical scroller, if there is one.
  */
  verticalScrollOffset: function(key, value) {
    if (value !== undefined) {
      var minOffset = this.get('minimumVerticalScrollOffset'),
          maxOffset = this.get('maximumVerticalScrollOffset');
      this._scroll_verticalScrollOffset = Math.max(minOffset,Math.min(maxOffset, value)) ;
    }

    return this._scroll_verticalScrollOffset||0;
  }.property().cacheable(),
  
  /**
    @private
    Calculates the maximum offset given content and container sizes, and the
    alignment.
  */
  maximumScrollOffset: function(contentSize, containerSize, align) {
    // if our content size is larger than or the same size as the container, it's quite
    // simple to calculate the answer. Otherwise, we need to do some fancy-pants
    // alignment logic (read: simple math)
    if (contentSize >= containerSize) return contentSize - containerSize;
    
    // alignment, yeah
    if (align === SC.ALIGN_LEFT || align === SC.ALIGN_TOP) {
      // if we left-align something, and it is smaller than the view, does that not mean
      // that it's maximum (and minimum) offset is 0, because it should be positioned at 0?
      return 0;
    } else if (align === SC.ALIGN_MIDDLE || align === SC.ALIGN_CENTER) {
      // middle align means the difference divided by two, because we want equal parts on each side.
      return 0 - Math.round((containerSize - contentSize) / 2);
    } else {
      // right align means the entire difference, because we want all that space on the left
      return 0 - (containerSize - contentSize);
    }
  },
  
  /**
    @private
    Calculates the minimum offset given content and container sizes, and the
    alignment.
  */
  minimumScrollOffset: function(contentSize, containerSize, align) {
    // if the content is larger than the container, we have no need to change the minimum
    // away from the natural 0 position.
    if (contentSize > containerSize) return 0;
    
    // alignment, yeah
    if (align === SC.ALIGN_LEFT || align === SC.ALIGN_TOP) {
      // if we left-align something, and it is smaller than the view, does that not mean
      // that it's maximum (and minimum) offset is 0, because it should be positioned at 0?
      return 0;
    } else if (align === SC.ALIGN_MIDDLE || align === SC.ALIGN_CENTER) {
      // middle align means the difference divided by two, because we want equal parts on each side.
      return 0 - Math.round((containerSize - contentSize) / 2);
    } else {
      // right align means the entire difference, because we want all that space on the left
      return 0 - (containerSize - contentSize);
    }
  },
  
  /**
    The maximum horizontal scroll offset allowed given the current contentView 
    size and the size of the scroll view.  If horizontal scrolling is 
    disabled, this will always return 0.
    
    @property {Number}
  */
  maximumHorizontalScrollOffset: function() {
    var view = this.get('contentView') ;
    var contentWidth = view ? view.get('frame').width : 0,
        calculatedWidth = view ? view.get('calculatedWidth') : 0;
    
    // The following code checks if there is a calculatedWidth (collections)
    // to avoid looking at the incorrect value calculated by frame.
    if (calculatedWidth) {
      contentWidth = view.calculatedWidth; 
    }
    contentWidth *= this._scale;
    
    var containerWidth = this.get('containerView').get('frame').width ;
    
    // we still must go through minimumScrollOffset even if we can't scroll
    // because we need to adjust for alignment. So, just make sure it won't allow scrolling.
    if (!this.get('canScrollHorizontal')) contentWidth = Math.min(contentWidth, containerWidth);
    return this.maximumScrollOffset(contentWidth, containerWidth, this.get("horizontalAlign"));
  }.property(),
  
  /**
    The maximum vertical scroll offset allowed given the current contentView 
    size and the size of the scroll view.  If vertical scrolling is disabled,
    this will always return 0 (or whatever alignment dictates).
    
    @property {Number}
  */
  maximumVerticalScrollOffset: function() {
    var view = this.get('contentView'),
        contentHeight = (view && view.get('frame')) ? view.get('frame').height : 0,
        calculatedHeight = view ? view.get('calculatedHeight') : 0;
    
    // The following code checks if there is a calculatedWidth (collections)
    // to avoid looking at the incorrect value calculated by frame.
    if(calculatedHeight){
      contentHeight = calculatedHeight; 
    }
    contentHeight *= this._scale;
    
    var containerHeight = this.get('containerView').get('frame').height ;
    
    // we still must go through minimumScrollOffset even if we can't scroll
    // because we need to adjust for alignment. So, just make sure it won't allow scrolling.
    if (!this.get('canScrollVertical')) contentHeight = Math.min(contentHeight, containerHeight);
    return this.maximumScrollOffset(contentHeight, containerHeight, this.get("verticalAlign"));
  }.property(),
  
  
  /**
    The minimum horizontal scroll offset allowed given the current contentView 
    size and the size of the scroll view.  If horizontal scrolling is 
    disabled, this will always return 0 (or whatever alignment dictates).
    
    @property {Number}
  */
  minimumHorizontalScrollOffset: function() {
    var view = this.get('contentView') ;
    var contentWidth = view ? view.get('frame').width : 0,
        calculatedWidth = view ? view.get('calculatedWidth') : 0;
    // The following code checks if there is a calculatedWidth (collections)
    // to avoid looking at the incorrect value calculated by frame.
    if(calculatedWidth){
      contentWidth = calculatedWidth; 
    }
    contentWidth *= this._scale;
    
    var containerWidth = this.get('containerView').get('frame').width ;
    
    // we still must go through minimumScrollOffset even if we can't scroll
    // because we need to adjust for alignment. So, just make sure it won't allow scrolling.
    if (!this.get('canScrollHorizontal')) contentWidth = Math.min(contentWidth, containerWidth);
    return this.minimumScrollOffset(contentWidth, containerWidth, this.get("horizontalAlign"));
  }.property(),
  
  /**
    The minimum vertical scroll offset allowed given the current contentView 
    size and the size of the scroll view.  If vertical scrolling is disabled,
    this will always return 0 (or whatever alignment dictates).
    
    @property {Number}
  */
  minimumVerticalScrollOffset: function() {
    var view = this.get('contentView') ;
    var contentHeight = (view && view.get('frame')) ? view.get('frame').height : 0,
        calculatedHeight = view ? view.get('calculatedHeight') : 0;
    
    // The following code checks if there is a calculatedWidth (collections)
    // to avoid looking at the incorrect value calculated by frame.
    if(calculatedHeight){
      contentHeight = view.calculatedHeight; 
    }
    contentHeight *= this._scale;
    
    var containerHeight = this.get('containerView').get('frame').height ;
    
    // we still must go through minimumScrollOffset even if we can't scroll
    // because we need to adjust for alignment. So, just make sure it won't allow scrolling.
    if (!this.get('canScrollVertical')) contentHeight = Math.min(contentHeight, containerHeight);
    return this.minimumScrollOffset(contentHeight, containerHeight, this.get("verticalAlign"));
  }.property(),
  
  
  
  /** 
    Amount to scroll one vertical line.
  
    Used by the default implementation of scrollDownLine() and scrollUpLine().  
    Defaults to 20px.
  */
  verticalLineScroll: 20,
  
  /**
    Amount to scroll one horizontal line.
  
    Used by the default implementation of scrollLeftLine() and 
    scrollRightLine(). Defaults to 20px.
  */
  horizontalLineScroll: 20,
  
  /**
    Amount to scroll one vertical page.
    
    Used by the default implementation of scrollUpPage() and scrollDownPage(). 
    Defaults to current frame height.
  */
  verticalPageScroll: function() {
    return this.get('frame').height ;
  }.property('frame'),
  
  /**
    Amount to scroll one horizontal page.
    
    Used by the default implementation of scrollLeftPage() and 
    scrollRightPage().  Defaults to current innerFrame width.
  */
  horizontalPageScroll: function() {
    return this.get('frame').width ;  
  }.property('frame'),
    
  // ..........................................................
  // SCROLLERS
  // 
  
  /** 
    YES if the view should maintain a horizontal scroller.   This property 
    must be set when the view is created.
    
    @property {Boolean}
  */
  hasHorizontalScroller: YES,
  
  /**
    The horizontal scroller view class. This will be replaced with a view 
    instance when the ScrollView is created unless hasHorizontalScroller is 
    NO.
    
    @property {SC.View}
  */
  horizontalScrollerView: SC.ScrollerView,
  
  /**
    The horizontal scroller view for touch. This will be replaced with a view
    instance when touch is enabled when the ScrollView is created unless 
    hasHorizontalScroller is NO.
  */
  horizontalTouchScrollerView: SC.TouchScrollerView,
  
  /**
    YES if the horizontal scroller should be visible.  You can change this 
    property value anytime to show or hide the horizontal scroller.  If you 
    do not want to use a horizontal scroller at all, you should instead set 
    hasHorizontalScroller to NO to avoid creating a scroller view in the 
    first place.
    
    @property {Boolean}
  */
  isHorizontalScrollerVisible: YES,

  /**
    Returns YES if the view both has a horizontal scroller, the scroller is
    visible.
    
    @property {Boolean}
  */
  canScrollHorizontal: function() {
    return !!(this.get('hasHorizontalScroller') && 
      this.get('horizontalScrollerView') && 
      this.get('isHorizontalScrollerVisible')) ;
  }.property('isHorizontalScrollerVisible').cacheable(),
  
  /**
    If YES, the horizontal scroller will autohide if the contentView is
    smaller than the visible area.  You must set hasHorizontalScroller to YES 
    for this property to have any effect.  
  */
  autohidesHorizontalScroller: YES,
  
  /** 
    YES if the view shuld maintain a vertical scroller.   This property must 
    be set when the view is created.
    
    @property {Boolean}
  */
  hasVerticalScroller: YES,
  
  /**
    The vertical scroller view class. This will be replaced with a view 
    instance when the ScrollView is created unless hasVerticalScroller is NO.
    
    @property {SC.View}
  */
  verticalScrollerView: SC.ScrollerView,
  
  /**
    The vertical touch scroller view class. This will be replaced with a view
    instance when the ScrollView is created.
  */
  verticalTouchScrollerView: SC.TouchScrollerView,
  
  /**
    YES if the vertical scroller should be visible.  You can change this 
    property value anytime to show or hide the vertical scroller.  If you do 
    not want to use a vertical scroller at all, you should instead set 
    hasVerticalScroller to NO to avoid creating a scroller view in the first 
    place.
    
    @property {Boolean}
  */
  isVerticalScrollerVisible: YES,

  /**
    Returns YES if the view both has a horizontal scroller, the scroller is
    visible.
    
    @property {Boolean}
  */
  canScrollVertical: function() {
    return !!(this.get('hasVerticalScroller') && 
      this.get('verticalScrollerView') && 
      this.get('isVerticalScrollerVisible')) ;
  }.property('isVerticalScrollerVisible').cacheable(),

  /**
    If YES, the vertical scroller will autohide if the contentView is
    smaller than the visible area.  You must set hasVerticalScroller to YES 
    for this property to have any effect.  
  */
  autohidesVerticalScroller: YES,
  
  /**
    Use this property to set the 'bottom' offset of your vertical scroller, 
    to make room for a thumb view or other accessory view. Default is 0.
    
    @property {Number}
  */
  verticalScrollerBottom: 0,
  
  /**
    Use this to overlay the vertical scroller.
    
    This ensures that the container frame will not resize to accomodate the
    vertical scroller, hence overlaying the scroller on top of 
    the container.
  
    @property {Boolean}
  */
  verticalOverlay: function() {
    if (SC.platform.touch) return YES;
    return NO;
  }.property().cacheable(),
  
  /**
    Use this to overlay the horizontal scroller.
    
    This ensures that the container frame will not resize to accomodate the
    horizontal scroller, hence overlaying the scroller on top of 
    the container
    
    @property {Boolean}
  */
  horizontalOverlay: function() {
    if (SC.platform.touch) return YES;
    return NO;
  }.property().cacheable(),
  
  /**
    Use to control the positioning of the vertical scroller.  If you do not
    set 'verticalOverlay' to YES, then the content view will be automatically
    sized to meet the left edge of the vertical scroller, wherever it may be.
    This allows you to easily, for example, have “one pixel higher and one
    pixel lower” scroll bars that blend into their parent views.
    
    If you do set 'verticalOverlay' to YES, then the scroller view will
    “float on top” of the content view.
    
    Example: { top: -1, bottom: -1, right: 0 }
  */
  verticalScrollerLayout: null,
  
  /**
    Use to control the positioning of the horizontal scroller.  If you do not
    set 'horizontalOverlay' to YES, then the content view will be
    automatically sized to meet the top edge of the horizontal scroller,
    wherever it may be.
    
    If you do set 'horizontalOverlay' to YES, then the scroller view will
    “float on top” of the content view.
    
    Example: { left: 0, bottom: 0, right: 0 }
  */
  horizontalScrollerLayout: null,
  
  // ..........................................................
  // CUSTOM VIEWS
  // 
  
  /**
    The container view that will contain your main content view.  You can 
    replace this property with your own custom subclass if you prefer.
    
    @type {SC.ContainerView}
  */
  containerView: SC.ContainerView.extend({

  }),
  
  // ..........................................................
  // METHODS
  // 
  
  /**
    Scrolls the receiver to the specified x,y coordinate.  This should be the
    offset into the contentView you want to appear at the top-left corner of
    the scroll view.
    
    This method will contrain the actual scroll based on whether the view
    can scroll in the named direction and the maximum distance it can
    scroll.
    
    If you only want to scroll in one direction, pass null for the other 
    direction.  You can also optionally pass a Hash for the first parameter 
    with x and y coordinates.
    
    @param x {Number} the x scroll location
    @param y {Number} the y scroll location
    @returns {SC.ScrollView} receiver
  */
  scrollTo: function(x,y) {
    // normalize params
    if (y===undefined && SC.typeOf(x) === SC.T_HASH) {
      y = x.y; x = x.x;
    }
    
    if (!SC.none(x)) {
      x = Math.max(this.get('minimumHorizontalScrollOffset'),Math.min(this.get('maximumHorizontalScrollOffset'), x)) ;
      this.set('horizontalScrollOffset', x) ;
    }
    
    if (!SC.none(y)) {
      y = Math.max(this.get('minimumVerticalScrollOffset'),Math.min(this.get('maximumVerticalScrollOffset'), y)) ;
      this.set('verticalScrollOffset', y) ;
    }
    
    return this ;
  },
  
  /**
    Scrolls the receiver in the horizontal and vertical directions by the 
    amount specified, if allowed.  The actual scroll amount will be 
    constrained by the current scroll view settings.
    
    If you only want to scroll in one direction, pass null or 0 for the other 
    direction.  You can also optionally pass a Hash for the first parameter 
    with x and y coordinates.
    
    @param x {Number} change in the x direction (or hash)
    @param y {Number} change in the y direction
    @returns {SC.ScrollView} receiver
  */
  scrollBy: function(x , y) {
    // normalize params
    if (y===undefined && SC.typeOf(x) === SC.T_HASH) {
      y = x.y; x = x.x;
    }
    
    // if null, undefined, or 0, pass null; otherwise just add current offset
    x = (x) ? this.get('horizontalScrollOffset')+x : null ;
    y = (y) ? this.get('verticalScrollOffset')+y : null ;
    return this.scrollTo(x,y) ;
  },
  
  /**
    Scroll the view to make the view's frame visible.  For this to make sense,
    the view should be a subview of the contentView.  Otherwise the results
    will be undefined.
    
    @param {SC.View} view view to scroll or null to scroll receiver visible
    @returns {Boolean} YES if scroll position was changed
  */
  scrollToVisible: function(view) {
    
    // if no view is passed, do default
    if (arguments.length === 0) return sc_super(); 
    
    var contentView = this.get('contentView') ;
    if (!contentView) return NO; // nothing to do if no contentView.

    // get the frame for the view - should work even for views with static 
    // layout, assuming it has been added to the screen.
    var vf = view.get('frame');
    if (!vf) return NO; // nothing to do
    
    // convert view's frame to an offset from the contentView origin.  This
    // will become the new scroll offset after some adjustment.
    vf = contentView.convertFrameFromView(vf, view.get('parentView')) ;
    
    return this.scrollToRect(vf);
  },
  
  /**
    Scroll to the supplied rectangle.
    @param {rect} Rectangle to scroll to.
    @returns {Boolean} YES if scroll position was changed.
  */
  scrollToRect: function(rect) {
    // find current visible frame.
    var vo = SC.cloneRect(this.get('containerView').get('frame')) ;
    
    vo.x = this.get('horizontalScrollOffset') ;
    vo.y = this.get('verticalScrollOffset') ;

    var origX = vo.x, origY = vo.y;
    
    // if top edge is not visible, shift origin
    vo.y -= Math.max(0, SC.minY(vo) - SC.minY(rect)) ;
    vo.x -= Math.max(0, SC.minX(vo) - SC.minX(rect)) ;
    
    // if bottom edge is not visible, shift origin
    vo.y += Math.max(0, SC.maxY(rect) - SC.maxY(vo)) ;
    vo.x += Math.max(0, SC.maxX(rect) - SC.maxX(vo)) ;
    
    // scroll to that origin.
    if ((origX !== vo.x) || (origY !== vo.y)) {
      this.scrollTo(vo.x, vo.y);
      return YES ;
    } else return NO;
  },
  
  
  /**
    Scrolls the receiver down one or more lines if allowed.  If number of
    lines is not specified, scrolls one line.
    
    @param lines {Number} options number of lines
    @returns {SC.ScrollView} receiver
  */
  scrollDownLine: function(lines) {
    if (lines === undefined) lines = 1 ;
    return this.scrollBy(null, this.get('verticalLineScroll')*lines) ;
  },
  
  /**
    Scrolls the receiver up one or more lines if allowed.  If number of
    lines is not specified, scrolls one line.
    
    @param lines {Number} options number of lines
    @returns {SC.ScrollView} receiver
  */
  scrollUpLine: function(lines) {
    if (lines === undefined) lines = 1 ;
    return this.scrollBy(null, 0-this.get('verticalLineScroll')*lines) ;
  },
  
  /**
    Scrolls the receiver right one or more lines if allowed.  If number of
    lines is not specified, scrolls one line.
    
    @param lines {Number} options number of lines
    @returns {SC.ScrollView} receiver
  */
  scrollRightLine: function(lines) {
    if (lines === undefined) lines = 1 ;
    return this.scrollTo(this.get('horizontalLineScroll')*lines, null) ;
  },
  
  /**
    Scrolls the receiver left one or more lines if allowed.  If number of
    lines is not specified, scrolls one line.
    
    @param lines {Number} options number of lines
    @returns {SC.ScrollView} receiver
  */
  scrollLeftLine: function(lines) {
    if (lines === undefined) lines = 1 ;
    return this.scrollTo(0-this.get('horizontalLineScroll')*lines, null) ;
  },
  
  /**
    Scrolls the receiver down one or more page if allowed.  If number of
    pages is not specified, scrolls one page.  The page size is determined by
    the verticalPageScroll value.  By default this is the size of the current
    scrollable area.
    
    @param pages {Number} options number of pages
    @returns {SC.ScrollView} receiver
  */
  scrollDownPage: function(pages) {
    if (pages === undefined) pages = 1 ;
    return this.scrollBy(null, this.get('verticalPageScroll')*pages) ;
  },
  
  /**
    Scrolls the receiver up one or more page if allowed.  If number of
    pages is not specified, scrolls one page.  The page size is determined by
    the verticalPageScroll value.  By default this is the size of the current
    scrollable area.
    
    @param pages {Number} options number of pages
    @returns {SC.ScrollView} receiver
  */
  scrollUpPage: function(pages) {
    if (pages === undefined) pages = 1 ;
    return this.scrollBy(null, 0-(this.get('verticalPageScroll')*pages)) ;
  },
  
  /**
    Scrolls the receiver right one or more page if allowed.  If number of
    pages is not specified, scrolls one page.  The page size is determined by
    the verticalPageScroll value.  By default this is the size of the current
    scrollable area.
    
    @param pages {Number} options number of pages
    @returns {SC.ScrollView} receiver
  */
  scrollRightPage: function(pages) {
    if (pages === undefined) pages = 1 ;
    return this.scrollBy(this.get('horizontalPageScroll')*pages, null) ;
  },
  
  /**
    Scrolls the receiver left one or more page if allowed.  If number of
    pages is not specified, scrolls one page.  The page size is determined by
    the verticalPageScroll value.  By default this is the size of the current
    scrollable area.
    
    @param pages {Number} options number of pages
    @returns {SC.ScrollView} receiver
  */
  scrollLeftPage: function(pages) {
    if (pages === undefined) pages = 1 ;
    return this.scrollBy(0-(this.get('horizontalPageScroll')*pages), null) ;
  },
  
  /**
    Adjusts the layout for the various internal views.  This method is called
    once when the scroll view is first configured and then anytime a scroller
    is shown or hidden.  You can call this method yourself as well to retile.
    
    You may also want to override this method to handle layout for any
    additional controls you have added to the view.
  */
  tile: function() {
    // get horizontal scroller/determine if we should have a scroller
    var hscroll = this.get('hasHorizontalScroller') ? this.get('horizontalScrollerView') : null ;
    var hasHorizontal = hscroll && this.get('isHorizontalScrollerVisible');
    
    // get vertical scroller/determine if we should have a scroller
    var vscroll = this.get('hasVerticalScroller') ? this.get('verticalScrollerView') : null ;
    var hasVertical = vscroll && this.get('isVerticalScrollerVisible') ;
    
    // get the containerView
    var clip = this.get('containerView') ;
    var clipLayout = { left: 0, top: 0 } ;
    var t, layout, vo, ho, vl, hl;
    
    var ht = ((hasHorizontal) ? hscroll.get('scrollbarThickness') : 0) ;
    var vt = (hasVertical) ?   vscroll.get('scrollbarThickness') : 0 ;
    
    if (hasHorizontal) {
      hl     = this.get('horizontalScrollerLayout');
      layout = { 
        left: (hl ? hl.left : 0), 
        bottom: (hl ? hl.bottom : 0), 
        right: (hl ? hl.right + vt-1 : vt-1), 
        height: ht 
      };
      hscroll.set('layout', layout) ;
      ho = this.get('horizontalOverlay');
      clipLayout.bottom = ho ? 0 : (layout.bottom + ht) ;
    } else {
      clipLayout.bottom = 0 ;
    }
    if (hscroll) hscroll.set('isVisible', hasHorizontal) ;
    
    if (hasVertical) {
      ht     = ht + this.get('verticalScrollerBottom') ;
      vl     = this.get('verticalScrollerLayout');
      layout = { 
        top: (vl ? vl.top : 0), 
        bottom: (vl ? vl.bottom + ht : ht), 
        right: (vl ? vl.right : 0), 
        width: vt 
      };
      vscroll.set('layout', layout) ;
      vo = this.get('verticalOverlay');
      clipLayout.right = vo ? 0 : (layout.right + vt) ;
    } else {
      clipLayout.right = 0 ;
    }
    if (vscroll) vscroll.set('isVisible', hasVertical) ;

    clip.adjust(clipLayout) ;
  },
  
  /** @private
    Called whenever a scroller visibility changes.  Calls the tile() method.
  */
  scrollerVisibilityDidChange: function() {
    this.tile();
  }.observes('isVerticalScrollerVisible', 'isHorizontalScrollerVisible'),
  
  // ..........................................................
  // SCROLL WHEEL SUPPORT
  // 
  
  /** @private */ _scroll_wheelDeltaX: 0,
  /** @private */ _scroll_wheelDeltaY: 0,
  
  // save adjustment and then invoke the actual scroll code later.  This will
  // keep the view feeling smooth.
  mouseWheel: function(evt) {
    var deltaAdjust = (SC.browser.safari && SC.browser.version > 533.0) ? 120 : 1;
    
    this._scroll_wheelDeltaX += evt.wheelDeltaX / deltaAdjust;
    this._scroll_wheelDeltaY += evt.wheelDeltaY / deltaAdjust;
    this.invokeLater(this._scroll_mouseWheel, 10) ;
    return this.get('canScrollHorizontal') || this.get('canScrollVertical') ;  
  },

  /** @private */
  _scroll_mouseWheel: function() {
    this.scrollBy(this._scroll_wheelDeltaX, this._scroll_wheelDeltaY);
    if (SC.WHEEL_MOMENTUM && this._scroll_wheelDeltaY > 0) {
      this._scroll_wheelDeltaY = Math.floor(this._scroll_wheelDeltaY*0.950);
      this._scroll_wheelDeltaY = Math.max(this._scroll_wheelDeltaY, 0);
      this.invokeLater(this._scroll_mouseWheel, 10) ;
    } else if (SC.WHEEL_MOMENTUM && this._scroll_wheelDeltaY < 0){
      this._scroll_wheelDeltaY = Math.ceil(this._scroll_wheelDeltaY*0.950);
      this._scroll_wheelDeltaY = Math.min(this._scroll_wheelDeltaY, 0);
      this.invokeLater(this._scroll_mouseWheel, 10) ;
    } else {
      this._scroll_wheelDeltaY = 0;
      this._scroll_wheelDeltaX = 0;
    }
  },
  
  /*..............................................
    SCALING SUPPORT
  */
  
  /**
    Determines whether scaling is allowed.
  */
  canScale: NO,
  
  /**
    The current scale.
  */
  _scale: 1.0,
  scale: function(key, value) {
    if (value !== undefined) {
      this._scale = Math.min(Math.max(this.get("minimumScale"), value), this.get("maximumScale"));
    }
    return this._scale;
  }.property().cacheable(),
  
  /**
    The minimum scale.
  */
  minimumScale: 0.25,
  
  /**
    The maximum scale.
  */
  maximumScale: 2.0,
  
  /**
    Whether to automatically determine the scale range based on the size of the content.
  */
  autoScaleRange: NO,
  
  _scale_css: "",
  
  updateScale: function(scale) {
    var contentView = this.get("contentView");
    if (!contentView) return;
    
    if (contentView.isScalable) {
      this.get("contentView").applyScale(scale);
      this._scale_css = "";
    } else {
      this._scale_css = "scale3d(" + scale + ", " + scale + ", 1)";
    }
  },
  
  /*..............................................
    TOUCH SUPPORT
  */
  acceptsMultitouch: YES,
  
  /**
    The scroll deceleration rate.
  */
  decelerationRate: SC.NORMAL_SCROLL_DECELERATION,
  
  /**
    If YES, bouncing will always be enabled in the horizontal direction, even if the content
    is smaller or the same size as the view. NO by default.
  */
  alwaysBounceHorizontal: NO,
  
  /**
    If NO, bouncing will not be enabled in the vertical direction when the content is smaller
    or the same size as the scroll view. YES by default.
  */
  alwaysBounceVertical: YES,
  
  /**
    Whether to delay touches from passing through to the content.
  */
  delaysContentTouches: YES,
  
  /**
    @private
    If the view supports it, this 
  */
  _touchScrollDidChange: function() {
    if (this.get("contentView").touchScrollDidChange) {
      this.get("contentView").touchScrollDidChange(
        this._scroll_horizontalScrollOffset,
        this._scroll_verticalScrollOffset
      );
    }
    
    // tell scrollers
    if (this.verticalScrollerView && this.verticalScrollerView.touchScrollDidChange) {
      this.verticalScrollerView.touchScrollDidChange(this._scroll_verticalScrollOffset);
    }
    
    if (this.horizontalScrollerView && this.horizontalScrollerView.touchScrollDidChange) {
      this.horizontalScrollerView.touchScrollDidChange(this._scroll_horizontalScrollOffset);
    }
  },
  
  _touchScrollDidStart: function() {
    if (this.get("contentView").touchScrollDidStart) {
      this.get("contentView").touchScrollDidStart(this._scroll_horizontalScrollOffset, this._scroll_verticalScrollOffset);
    }
    
    // tell scrollers
    if (this.verticalScrollerView && this.verticalScrollerView.touchScrollDidStart) {
      this.verticalScrollerView.touchScrollDidStart(this._touch_verticalScrollOffset);
    }
    if (this.horizontalScrollerView && this.horizontalScrollerView.touchScrollDidStart) {
      this.horizontalScrollerView.touchScrollDidStart(this._touch_horizontalScrollOffset);
    }
  },
  
  _touchScrollDidEnd: function() {
    if (this.get("contentView").touchScrollDidEnd) {
      this.get("contentView").touchScrollDidEnd(this._scroll_horizontalScrollOffset, this._scroll_verticalScrollOffset);
    }
    
    // tell scrollers
    if (this.verticalScrollerView && this.verticalScrollerView.touchScrollDidEnd) {
      this.verticalScrollerView.touchScrollDidEnd(this._touch_verticalScrollOffset);
    }
    
    if (this.horizontalScrollerView && this.horizontalScrollerView.touchScrollDidEnd) {
      this.horizontalScrollerView.touchScrollDidEnd(this._touch_horizontalScrollOffset);
    }
  },
  
  _applyCSSTransforms: function(layer) {
    var transform = "";
    this.updateScale(this._scale);
    transform += 'translate3d('+ -this._scroll_horizontalScrollOffset +'px, '+ -Math.round(this._scroll_verticalScrollOffset)+'px,0) ';
    transform += this._scale_css;
    if (layer) {
      layer.style.webkitTransform = transform;
      layer.style.webkitTransformOrigin = "top left";
    }
  },
  
  captureTouch: function(touch) {
    return YES;
  },
  
  touchGeneration: 0,
  touchStart: function(touch) {
    var generation = ++this.touchGeneration;
    if (!this.tracking && this.get("delaysContentTouches")) {
      this.invokeLater(this.beginTouchesInContent, 150, generation);
    } else if (!this.tracking) {
      // NOTE: We still have to delay because we don't want to call touchStart
      // while touchStart is itself being called...
      this.invokeLater(this.beginTouchesInContent, 1, generation);
    }
    this.beginTouchTracking(touch, YES);
    return YES;
  },

  beginTouchesInContent: function(gen) {
    if (gen !== this.touchGeneration) return;
    
    var touch = this.touch, itemView;
    if (touch && this.tracking && !this.dragging && !touch.touch.scrollHasEnded) {
      // try to capture the touch
      touch.touch.captureTouch(this, YES);
      
      if (!touch.touch.touchResponder) {
        // if it DIDN'T WORK!!!!!
        // then we need to take possession again.
        touch.touch.makeTouchResponder(this);
      } else {
        // Otherwise, it did work, and if we had a pending scroll end, we must do it now
        if (touch.needsScrollEnd) {
          this._touchScrollDidEnd();
        }
      }
    }
  },

  /**
    Initializes the start state of the gesture.

    We keep information about the initial location of the touch so we can
    disambiguate between a tap and a drag.

    @param {Event} evt
  */
  beginTouchTracking: function(touch, starting) {
    var avg = touch.averagedTouchesForView(this, starting);
    
    var verticalScrollOffset = this._scroll_verticalScrollOffset || 0,
        horizontalScrollOffset = this._scroll_horizontalScrollOffset || 0,
        startClipOffsetX = horizontalScrollOffset,
        startClipOffsetY = verticalScrollOffset,
        needsScrollEnd = NO;
    
    if (this.touch && this.touch.timeout) {
      // clear the timeout
      clearTimeout(this.touch.timeout);
      this.touch.timeout = null;
      
      // get the scroll offsets
      startClipOffsetX = this.touch.startClipOffset.x;
      startClipOffsetY = this.touch.startClipOffset.y;
      needsScrollEnd = YES;
    }
    
    // calculate container+content width/height
    var view = this.get('contentView') ;
    var contentWidth = view ? view.get('frame').width : 0,
        contentHeight = view ? view.get('frame').height : 0;
    
    if(view.calculatedWidth && view.calculatedWidth!==0) contentWidth = view.calculatedWidth;
    if (view.calculatedHeight && view.calculatedHeight !==0) contentHeight = view.calculatedHeight;
    
    var containerWidth = this.get('containerView').get('frame').width,
        containerHeight = this.get('containerView').get('frame').height;
    

    // calculate position in content
    var globalFrame = this.convertFrameToView(this.get("frame"), null),
        positionInContentX = (horizontalScrollOffset + (avg.x - globalFrame.x)) / this._scale,
        positionInContentY = (verticalScrollOffset + (avg.y - globalFrame.y)) / this._scale;

    this.touch = {
      startTime: touch.timeStamp,
      notCalculated: YES,
      
      enableScrolling: { 
        x: contentWidth * this._scale > containerWidth || this.get("alwaysBounceHorizontal"), 
        y: contentHeight * this._scale > containerHeight || this.get("alwaysBounceVertical") 
      },
      scrolling: { x: NO, y: NO },
      
      enableBouncing: SC.platform.bounceOnScroll,
      
      // offsets and velocities
      startClipOffset: { x: startClipOffsetX, y: startClipOffsetY },
      lastScrollOffset: { x: horizontalScrollOffset, y: verticalScrollOffset },
      startTouchOffset: { x: avg.x, y: avg.y },
      scrollVelocity: { x: 0, y: 0 },
      
      startTouchOffsetInContent: { x: positionInContentX, y: positionInContentY },
      
      containerSize: { width: containerWidth, height: containerHeight },
      contentSize: { width: contentWidth, height: contentHeight },
      
      startScale: this._scale,
      startDistance: avg.d,
      canScale: this.get("canScale") && SC.platform.pinchToZoom,
      minimumScale: this.get("minimumScale"),
      maximumScale: this.get("maximumScale"),
      
      globalFrame: globalFrame,
      
      // cache some things
      layer: this.get("contentView").get('layer'),

      // some constants
      resistanceCoefficient: 0.998,
      resistanceAsymptote: 320,
      decelerationFromEdge: 0.05,
      accelerationToEdge: 0.1,
      
      // how much percent of the other drag direction you must drag to start dragging that direction too.
      scrollTolerance: { x: 15, y: 15 },
      scaleTolerance: 5,
      secondaryScrollTolerance: 30,
      scrollLock: 500,
      
      decelerationRate: this.get("decelerationRate"),

      // general status
      lastEventTime: touch.timeStamp,      
      
      // the touch used
      touch: (starting ? touch : (this.touch ? this.touch.touch : null)),
      
      // needsScrollEnd will cause a scrollDidEnd even if this particular touch does not start a scroll.
      // the reason for this is because we don't want to say we've stopped scrolling just because we got
      // another touch, but simultaneously, we still need to send a touch end eventually.
      // there are two cases in which this will be used:
      // 
      //    1. If the touch was sent to content touches (in which case we will not be scrolling)
      //    2. If the touch ends before scrolling starts (no scrolling then, either)
      needsScrollEnd: needsScrollEnd
    };

    if (!this.tracking) {
      this.tracking = YES;
      this.dragging = NO;
    }
  },
  
  _adjustForEdgeResistance: function(offset, minOffset, maxOffset, resistanceCoefficient, asymptote) {
    var distanceFromEdge;
    
    // find distance from edge
    if (offset < minOffset) distanceFromEdge = offset - minOffset;
    else if (offset > maxOffset) distanceFromEdge = maxOffset - offset;
    else return offset;
    
    // manipulate logarithmically
    distanceFromEdge = Math.pow(resistanceCoefficient, Math.abs(distanceFromEdge)) * asymptote;
    
    // adjust mathematically
    if (offset < minOffset) distanceFromEdge = distanceFromEdge - asymptote;
    else distanceFromEdge = -distanceFromEdge + asymptote;
    
    // generate final value
    return Math.min(Math.max(minOffset, offset), maxOffset) + distanceFromEdge;
  },
  
  touchesDragged: function(evt, touches) {
    var avg = evt.averagedTouchesForView(this);
    this.updateTouchScroll(avg.x, avg.y, avg.d, evt.timeStamp);
  },
  
  updateTouchScroll: function(touchX, touchY, distance, timeStamp) {
    // get some vars
    var touch = this.touch,
        touchXInFrame = touchX - touch.globalFrame.x,
        touchYInFrame = touchY - touch.globalFrame.y,
        offsetY,
        maxOffsetY,
        offsetX,
        maxOffsetX,
        minOffsetX, minOffsetY;
        
    // calculate new position in content
    var positionInContentX = ((this._scroll_horizontalScrollOffset||0) + touchXInFrame) / this._scale,
        positionInContentY = ((this._scroll_verticalScrollOffset||0) + touchYInFrame) / this._scale;
    
    // calculate deltas
    var deltaX = positionInContentX - touch.startTouchOffset.x,
        deltaY = positionInContentY - touch.startTouchOffset.y;
    
    var isDragging = touch.dragging;
    if (!touch.scrolling.x && Math.abs(deltaX) > touch.scrollTolerance.x && touch.enableScrolling.x) {
      // say we are scrolling
      isDragging = YES;
      touch.scrolling.x = YES;
      touch.scrollTolerance.y = touch.secondaryScrollTolerance;
      
      // reset position
      touch.startTouchOffset.x = touchX;
      deltaX = 0;
    }
    if (!touch.scrolling.y && Math.abs(deltaY) > touch.scrollTolerance.y && touch.enableScrolling.y) {
      // say we are scrolling
      isDragging = YES;
      touch.scrolling.y = YES;
      touch.scrollTolerance.x = touch.secondaryScrollTolerance;
      
      // reset position
      touch.startTouchOffset.y = touchY;
      deltaY = 0;
    }
    
    // handle scroll start
    if (isDragging && !touch.dragging) {
      touch.dragging = YES;
      this.dragging = YES;
      this._touchScrollDidStart();
    }
    
    // calculate new offset
    if (!touch.scrolling.x && !touch.scrolling.y && !touch.canScale) return;
    if (touch.scrolling.x && !touch.scrolling.y) {
      if (deltaX > touch.scrollLock && !touch.scrolling.y) touch.enableScrolling.y = NO;
    }
    if (touch.scrolling.y && !touch.scrolling.x) {
      if (deltaY > touch.scrollLock && !touch.scrolling.x) touch.enableScrolling.x = NO;
    }
    
    // handle scaling through pinch gesture
    if (touch.canScale) {
      
      var startDistance = touch.startDistance, dd = distance - startDistance;
      if (Math.abs(dd) > touch.scaleTolerance) {
        touch.scrolling.y = YES; // if you scale, you can scroll.
        touch.scrolling.x = YES;
        
        // we want to say something that was the startDistance away from each other should now be
        // distance away. So, if we are twice as far away as we started...
        var scale = touch.startScale * (distance / Math.max(startDistance, 50));

        var newScale = this._adjustForEdgeResistance(scale, touch.minimumScale, touch.maximumScale, touch.resistanceCoefficient, touch.resistanceAsymptote);
        this.dragging = YES;
        this._scale = newScale;
        var newPositionInContentX = positionInContentX * this._scale,
            newPositionInContentY = positionInContentY * this._scale;
      }
    }
    
    // these do exactly what they sound like. So, this comment is just to
    // block off the code a bit
    // In english, these calculate the minimum X/Y offsets
    minOffsetX = this.minimumScrollOffset(touch.contentSize.width * this._scale, touch.containerSize.width, this.get("horizontalAlign"));
    minOffsetY = this.minimumScrollOffset(touch.contentSize.height * this._scale, touch.containerSize.height, this.get("verticalAlign"));
    
    // and now, maximum...
    maxOffsetX = this.maximumScrollOffset(touch.contentSize.width * this._scale, touch.containerSize.width, this.get("horizontalAlign"));
    maxOffsetY = this.maximumScrollOffset(touch.contentSize.height * this._scale, touch.containerSize.height, this.get("verticalAlign"));
    
    
    // So, the following is the completely written out algebra:
    // (offsetY + touchYInFrame) / this._scale = touch.startTouchOffsetInContent.y
    // offsetY + touchYInFrame = touch.startTouchOffsetInContent.y * this._scale;
    // offsetY = touch.startTouchOffset * this._scale - touchYInFrame
    
    // and the result applied:
    offsetX = touch.startTouchOffsetInContent.x * this._scale - touchXInFrame;
    offsetY = touch.startTouchOffsetInContent.y * this._scale - touchYInFrame;
    
    
    // we need to adjust for edge resistance, or, if bouncing is disabled, just stop flat.
    if (touch.enableBouncing) {
      offsetX = this._adjustForEdgeResistance(offsetX, minOffsetX, maxOffsetX, touch.resistanceCoefficient, touch.resistanceAsymptote);
      offsetY = this._adjustForEdgeResistance(offsetY, minOffsetY, maxOffsetY, touch.resistanceCoefficient, touch.resistanceAsymptote);
    } else {
      offsetX = Math.max(minOffsetX, Math.min(maxOffsetX, offsetX));
      offsetY = Math.max(minOffsetY, Math.min(maxOffsetY, offsetY));
    }
    
    // and now, _if_ scrolling is enabled, set the new coordinates
    if (touch.scrolling.x) this._scroll_horizontalScrollOffset = offsetX;
    if (touch.scrolling.y) this._scroll_verticalScrollOffset = offsetY;
    
    // and apply the CSS transforms.
    this._applyCSSTransforms(touch.layer);
    this._touchScrollDidChange();
    
    
    // now we must prepare for momentum scrolling by calculating the momentum.
    if (timeStamp - touch.lastEventTime >= 1 || touch.notCalculated) {
      touch.notCalculated = NO;
      var horizontalOffset = this._scroll_horizontalScrollOffset;
      var verticalOffset = this._scroll_verticalScrollOffset;
      
      touch.scrollVelocity.x = ((horizontalOffset - touch.lastScrollOffset.x) / Math.max(1, timeStamp - touch.lastEventTime)); // in px per ms
      touch.scrollVelocity.y = ((verticalOffset - touch.lastScrollOffset.y) / Math.max(1, timeStamp - touch.lastEventTime)); // in px per ms
      touch.lastScrollOffset.x = horizontalOffset;
      touch.lastScrollOffset.y = verticalOffset;
      touch.lastEventTime = timeStamp;
    }
  },

  touchEnd: function(touch) {
    var touchStatus = this.touch,
        avg = touch.averagedTouchesForView(this);
    
    touch.scrollHasEnded = YES;
    if (avg.touchCount > 0) {
      this.beginTouchTracking(touch, NO);
    } else {
      if (this.dragging) {
        touchStatus.dragging = NO;

        // reset last event time
        touchStatus.lastEventTime = touch.timeStamp;

        this.startDecelerationAnimation();
      } else {
        // well. The scrolling stopped. Let us tell everyone if there was a pending one that this non-drag op interrupted.
        if (touchStatus.needsScrollEnd) this._touchScrollDidEnd();
        
        // this part looks weird, but it is actually quite simple.
        // First, we send the touch off for capture+starting again, but telling it to return to us
        // if nothing is found or if it is released.
        touch.captureTouch(this, YES);
        
        // if we went anywhere, did anything, etc., call end()
        if (touch.touchResponder && touch.touchResponder !== this) {
          touch.end();
        } else if (!touch.touchResponder || touch.touchResponder === this) {
          // if it was released to us or stayed with us the whole time, or is for some
          // wacky reason empty (in which case it is ours still). If so, and there is a next responder,
          // relay to that.
          
          if (touch.nextTouchResponder) touch.makeTouchResponder(touch.nextTouchResponder);
        } else {
          // in this case, the view that captured it and changed responder should have handled
          // everything for us.
        }
        
        this.touch = null;
      }
      
      this.tracking = NO;
      this.dragging = NO;
    }
  },
  
  touchCancelled: function(touch) {
    var touchStatus = this.touch,
        avg = touch.averagedTouchesForView(this);
    
    // if we are decelerating, we don't want to stop that. That would be bad. Because there's no point.
    if (!this.touch || !this.touch.timeout) {
      this.beginPropertyChanges();
      this.set("scale", this._scale);
      this.set("verticalScrollOffset", this._scroll_verticalScrollOffset);
      this.set("horizontalScrollOffset", this._scroll_horizontalScrollOffset);
      this.endPropertyChanges();
      this.tracking = NO;
    
      if (this.dragging) {
        this._touchScrollDidEnd();
      }
    
      this.dragging = NO;
      this.touch = null;
    }
  },

  startDecelerationAnimation: function(evt) {
    var touch = this.touch;
    touch.decelerationVelocity = {
      x: touch.scrollVelocity.x * 10,
      y: touch.scrollVelocity.y * 10
    };
    
    this.decelerateAnimation();
  },
  
  /**
    @private
    Does bounce calculations, adjusting velocity.
    
    Bouncing is fun. Functions that handle it should have fun names,
    don'tcha think?
    
    P.S.: should this be named "bouncityBounce" instead?
  */
  bouncyBounce: function(velocity, value, minValue, maxValue, de, ac, additionalAcceleration) {
    // we have 4 possible paths. On a higher level, we have two leaf paths that can be applied
    // for either of two super-paths.
    //
    // The first path is if we are decelerating past an edge: in this case, this function must
    // must enhance that deceleration. In this case, our math boils down to taking the amount
    // by which we are past the edge, multiplying it by our deceleration factor, and reducing
    // velocity by that amount.
    //
    // The second path is if we are not decelerating, but are still past the edge. In this case,
    // we must start acceleration back _to_ the edge. The math here takes the distance we are from
    // the edge, multiplies by the acceleration factor, and then performs two additional things:
    // First, it speeds up the acceleration artificially  with additionalAcceleration; this will
    // make the stop feel more sudden, as it will still have this additional acceleration when it reaches
    // the edge. Second, it ensures the result does not go past the final value, so we don't end up
    // bouncing back and forth all crazy-like.
    if (value < minValue) {
      if (velocity < 0) velocity = velocity + ((minValue - value) * de);
      else {
        velocity = Math.min((minValue-value) * ac + additionalAcceleration, minValue - value - 0.01);
      }
    } else if (value > maxValue) {
      if (velocity > 0) velocity = velocity - ((value - maxValue) * de);
      else {
        velocity = -Math.min((value - maxValue) * ac + additionalAcceleration, value - maxValue - 0.01);
      }
    }
    return velocity;
  },

  decelerateAnimation: function() {
    // get a bunch of properties. They are named well, so not much explanation of what they are...
    // However, note maxOffsetX/Y takes into account the scale;
    // also, newX/Y adds in the current deceleration velocity (the deceleration velocity will
    // be changed later in this function).
    var touch = this.touch,
        scale = this._scale,
        minOffsetX = this.minimumScrollOffset(touch.contentSize.width * this._scale, touch.containerSize.width, this.get("horizontalAlign")),
        minOffsetY = this.minimumScrollOffset(touch.contentSize.height * this._scale, touch.containerSize.height, this.get("verticalAlign")),
        maxOffsetX = this.maximumScrollOffset(touch.contentSize.width * this._scale, touch.containerSize.width, this.get("horizontalAlign")),
        maxOffsetY = this.maximumScrollOffset(touch.contentSize.height * this._scale, touch.containerSize.height, this.get("verticalAlign")),
        
        now = Date.now(),
        t = Math.max(now - touch.lastEventTime, 1),
        
        newX = this._scroll_horizontalScrollOffset + touch.decelerationVelocity.x * (t/10),
        newY = this._scroll_verticalScrollOffset + touch.decelerationVelocity.y * (t/10);
    
    var de = touch.decelerationFromEdge, ac = touch.accelerationToEdge;
    
    // under a few circumstances, we may want to force a valid X/Y position.
    // For instance, if bouncing is disabled, or if position was okay before
    // adjusting scale.
    var forceValidXPosition = !touch.enableBouncing, forceValidYPosition = !touch.enableBouncing;
    
    // determine if position was okay before adjusting scale (which we do, in
    // a lovely, animated way, for the scaled out/in too far bounce-back).
    // if the position was okay, then we are going to make sure that we keep the
    // position okay when adjusting the scale.
    //
    // Position OKness, here, referring to if the position is valid (within
    // minimum and maximum scroll offsets)
    if (newX >= minOffsetX && newX <= maxOffsetX) forceValidXPosition = YES;
    if (newY >= minOffsetY && newY <= maxOffsetY) forceValidYPosition = YES;
    
    // We are going to change scale in a moment, but the position should stay the
    // same, if possible (unless it would be more jarring, as described above, in
    // the case of starting with a valid position and ending with an invalid one).
    //
    // Because we are changing the scale, we need to make the position scale-neutral.
    // we'll make it non-scale-neutral after applying scale.
    //
    // Question: might it be better to save the center position instead, so scaling
    // bounces back around the center of the screen?
    newX /= this._scale;
    newY /= this._scale;
    
    // scale velocity (amount to change) starts out at 0 each time, because 
    // it is calculated by how far out of bounds it is, rather than by the
    // previous such velocity.
    var sv = 0;
    
    // do said calculation; we'll use the same bouncyBounce method used for everything
    // else, but our adjustor that gives a minimum amount to change by and (which, as we'll
    // discuss, is to make the stop feel slightly more like a stop), we'll leave at 0 
    // (scale doesn't really need it as much; if you disagree, at least come up with 
    // numbers more appropriate for scale than the ones for X/Y)
    sv = this.bouncyBounce(sv, scale, touch.minimumScale, touch.maximumScale, de, ac, 0);
    
    // add the amount to scale. This is linear, rather than multiplicative. If you think
    // it should be multiplicative (or however you say that), come up with a new formula.
    this._scale = scale = scale + sv;
    
    // now we can convert newX/Y back to scale-specific coordinates...
    newX *= this._scale;
    newY *= this._scale;
    
    // It looks very weird if the content started in-bounds, but the scale animation
    // made it not be in bounds; it causes the position to animate snapping back, and,
    // well, it looks very weird. It is more proper to just make sure it stays in a valid
    // position. So, we'll determine the new maximum/minimum offsets, and then, if it was
    // originally a valid position, we'll adjust the new position to a valid position as well.
    
    
    // determine new max offset
    minOffsetX = this.minimumScrollOffset(touch.contentSize.width * this._scale, touch.containerSize.width, this.get("horizontalAlign"));
    minOffsetY = this.minimumScrollOffset(touch.contentSize.height * this._scale, touch.containerSize.height, this.get("verticalAlign"));
    maxOffsetX = this.maximumScrollOffset(touch.contentSize.width * this._scale, touch.containerSize.width, this.get("horizontalAlign"));
    maxOffsetY = this.maximumScrollOffset(touch.contentSize.height * this._scale, touch.containerSize.height, this.get("verticalAlign"));
    
    // see if scaling messed up the X position (but ignore if 'tweren't right to begin with).
    if (forceValidXPosition && (newX < minOffsetX || newX > maxOffsetX)) {
      // Correct the position
      newX = Math.max(minOffsetX, Math.min(newX, maxOffsetX));
      
      // also, make the velocity be ZERO; it is obviously not needed...
      touch.decelerationVelocity.x = 0;
    }
    
    // now the y
    if (forceValidYPosition && (newY < minOffsetY || newY > maxOffsetY)) {
      // again, correct it...
      newY = Math.max(minOffsetY, Math.min(newY, maxOffsetY));
      
      // also, make the velocity be ZERO; it is obviously not needed...
      touch.decelerationVelocity.y = 0;
    }
    
    
    // now that we are done modifying the position, we may update the actual scroll
    this._scroll_horizontalScrollOffset = newX;
    this._scroll_verticalScrollOffset = newY;
    
    this._applyCSSTransforms(touch.layer); // <- Does what it sounds like.

    this._touchScrollDidChange();
    
    // Now we have to adjust the velocities. The velocities are simple x and y numbers that
    // get added to the scroll X/Y positions each frame.
    // The default decay rate is .950 per frame. To achieve some semblance of accuracy, we
    // make it to the power of the elapsed number of frames. This is not fully accurate,
    // as this is applying the elapsed time between this frame and the previous time to
    // modify the velocity for the next frame. My mind goes blank when I try to figure out
    // a way to fix this (given that we don't want to change the velocity on the first frame),
    // and as it seems to work great as-is, I'm just leaving it.
    var decay = touch.decelerationRate;
    touch.decelerationVelocity.y *= Math.pow(decay, (t / 10));
    touch.decelerationVelocity.x *= Math.pow(decay, (t / 10));
    
    // We have a bouncyBounce method that adjusts the velocity for bounce. That is, if it is
    // out of range and still going, it will slow it down. This step is decelerationFromEdge.
    // If it is not moving (or has come to a stop from decelerating), but is still out of range, 
    // it will start it moving back into range (accelerationToEdge)
    // we supply de and ac as these properties.
    // The .3 artificially increases the acceleration by .3; this is actually to make the final
    // stop a bit more abrupt.
    touch.decelerationVelocity.x = this.bouncyBounce(touch.decelerationVelocity.x, newX, minOffsetX, maxOffsetX, de, ac, 0.3);
    touch.decelerationVelocity.y = this.bouncyBounce(touch.decelerationVelocity.y, newY, minOffsetY, maxOffsetY, de, ac, 0.3);
 
    // if we ain't got no velocity... then we must be finished, as there is no where else to go.
    // to determine our velocity, we take the absolue value, and use that; if it is less than .01, we
    // must be done. Note that we check scale's most recent velocity, calculated above using bouncyBounce,
    // as well.
    var absXVelocity = Math.abs(touch.decelerationVelocity.x);
    var absYVelocity = Math.abs(touch.decelerationVelocity.y);
    if (absYVelocity < 0.05 && absXVelocity < 0.05 && Math.abs(sv) < 0.05) {
      // we can reset the timeout, as it will no longer be required, and we don't want to re-cancel it later.
      touch.timeout = null;
      this.touch = null;
      
      // trigger scroll end
      this._touchScrollDidEnd();
      
      // set the scale, vertical, and horizontal offsets to what they technically already are,
      // but don't know they are yet. This will finally update things like, say, the clipping frame.
      this.beginPropertyChanges();
      this.set("scale", this._scale);
      this.set("verticalScrollOffset", this._scroll_verticalScrollOffset);
      this.set("horizontalScrollOffset", this._scroll_horizontalScrollOffset);
      this.endPropertyChanges();
      
      return;
    }
    
    // We now set up the next round. We are doing this as raw as we possibly can, not touching the
    // run loop at all. This speeds up performance drastically--keep in mind, we're on comparatively
    // slow devices, here. So, we'll just make a closure, saving "this" into "self" and calling
    // 10ms later (or however long it takes). Note also that we save both the last event time
    // (so we may calculate elapsed time) and the timeout we are creating, so we may cancel it in future.
    var self = this;
    touch.lastEventTime = Date.now();
    this.touch.timeout = setTimeout(function(){
      SC.run(self.decelerateAnimation(), self);
    }, 10);
  },
  
  // ..........................................................
  // INTERNAL SUPPORT
  // 
  
  /** @private
    Instantiate scrollers & container views as needed.  Replace their classes
    in the regular properties.
  */
  createChildViews: function() {
    var childViews = [] , view; 
       
    // create the containerView.  We must always have a container view. 
    // also, setup the contentView as the child of the containerView...
    if (SC.none(view = this.containerView)) view = SC.ContainerView;
    
    childViews.push(this.containerView = this.createChildView(view, {
      contentView: this.contentView,
      isScrollContainer: YES
    }));
    
    // and replace our own contentView...
    this.contentView = this.containerView.get('contentView');
    
    // create a horizontal scroller view if needed...
    view = SC.platform.touch ? this.get("horizontalTouchScrollerView") : this.get("horizontalScrollerView");
    if (view) {
      if (this.get('hasHorizontalScroller')) {
        view = this.horizontalScrollerView = this.createChildView(view, {
          layoutDirection: SC.LAYOUT_HORIZONTAL,
          valueBinding: '*owner.horizontalScrollOffset'
        }) ;
        childViews.push(view);
      } else this.horizontalScrollerView = null ;
    }
    
    // create a vertical scroller view if needed...
    view = SC.platform.touch ? this.get("verticalTouchScrollerView") : this.get("verticalScrollerView");
    if (view) {
      if (this.get('hasVerticalScroller')) {
        view = this.verticalScrollerView = this.createChildView(view, {
          layoutDirection: SC.LAYOUT_VERTICAL,
          valueBinding: '*owner.verticalScrollOffset'
        }) ;
        childViews.push(view);
      } else this.verticalScrollerView = null ;
    }
    
    // set childViews array.
    this.childViews = childViews ;
    
    this.contentViewDidChange() ; // setup initial display...
    this.tile() ; // set up initial tiling
  },
  
  init: function() {
    sc_super();
    
    // start observing initial content view.  The content view's frame has
    // already been setup in prepareDisplay so we don't need to call 
    // viewFrameDidChange...
    this._scroll_contentView = this.get('contentView') ;
    var contentView = this._scroll_contentView ;

    if (contentView) {
      contentView.addObserver('frame', this, this.contentViewFrameDidChange);
      contentView.addObserver('calculatedWidth', this, this.contentViewFrameDidChange);
      contentView.addObserver('calculatedHeight', this, this.contentViewFrameDidChange);
    }

    if (this.get('isVisibleInWindow')) this._scsv_registerAutoscroll() ;
  },
  
  /** @private Registers/deregisters view with SC.Drag for autoscrolling */
  _scsv_registerAutoscroll: function() {
    if (this.get('isVisibleInWindow')) SC.Drag.addScrollableView(this);
    else SC.Drag.removeScrollableView(this);
  }.observes('isVisibleInWindow'),
  
  /** @private
    Whenever the contentView is changed, we need to observe the content view's
    frame to be notified whenever it's size changes.
  */
  contentViewDidChange: function() {
    var newView = this.get('contentView'),
        oldView = this._scroll_contentView,
        frameObserver = this.contentViewFrameDidChange,
        layerObserver = this.contentViewLayerDidChange;

    if (newView !== oldView) {
      
      // stop observing old content view
      if (oldView) {
        oldView.removeObserver('calculatedWidth', this, this.contentViewFrameDidChange);
        oldView.removeObserver('calculatedHeight', this, this.contentViewFrameDidChange);
        oldView.removeObserver('frame', this, frameObserver);
        oldView.removeObserver('layer', this, layerObserver);
      }
      
      // update cache
      this._scroll_contentView = newView;
      if (newView) {
        newView.addObserver('frame', this, frameObserver);
        newView.addObserver('calculatedWidth', this, this.contentViewFrameDidChange);
        newView.addObserver('calculatedHeight', this, this.contentViewFrameDidChange);
        newView.addObserver('layer', this, layerObserver);
      }
      
      // replace container
      this.containerView.set('contentView', newView);
      
      this.contentViewFrameDidChange();
    }
  }.observes('contentView'),

  /** @private
    If we redraw after the initial render, we need to make sure that we reset
    the scrollTop/scrollLeft properties on the content view.  This ensures
    that, for example, the scroll views displays correctly when switching
    views out in a ContainerView.
  */
  render: function(context, firstTime) {
    this.invokeLast(this.adjustElementScroll);
    if (firstTime) {
      context.push('<div class="corner"></div>');
    }
    return sc_super();
  },

  /** @private
    Invoked whenever the contentView's frame changes.  This will update the 
    scroller maxmimum and optionally update the scroller visibility if the
    size of the contentView changes.  We don't care about the origin since
    that is tracked separately from the offset values.

    @param {Boolean} force (optional)  Re-calculate everything even if the contentView’s frame didn’t change size
  */

  oldMaxHOffset: 0,
  oldMaxVOffset: 0,

  contentViewFrameDidChange: function(force) {
    var view   = this.get('contentView'), 
        f      = (view) ? view.get('frame') : null,
        scale  = this._scale,
        width  = 0,
        height = 0,
        dim, dimWidth, dimHeight;
    
    if (view) {
      width = view.get('calculatedWidth') || f.width || 0;
      height = view.get('calculatedHeight') || f.height || 0;
    }
    
    width *= scale;
    height *= scale;
    
    // cache out scroll settings...
    if (!force && (width === this._scroll_contentWidth) && (height === this._scroll_contentHeight)) return ;
    this._scroll_contentWidth  = width;
    this._scroll_contentHeight = height;

    dim       = this.getPath('containerView.frame');
    dimWidth  = dim.width;
    dimHeight = dim.height;
    
    if (this.get('hasHorizontalScroller') && (view = this.get('horizontalScrollerView'))) {
      // decide if it should be visible or not
      if (this.get('autohidesHorizontalScroller')) {
        this.set('isHorizontalScrollerVisible', width > dimWidth);
      }
      view.setIfChanged('maximum', width-dimWidth) ;
      view.setIfChanged('proportion', dimWidth/width);
    }
    
    if (this.get('hasVerticalScroller') && (view = this.get('verticalScrollerView'))) {
      // decide if it should be visible or not
      if (this.get('autohidesVerticalScroller')) {
        this.set('isVerticalScrollerVisible', height > dimHeight);
      }
      view.setIfChanged('maximum', height-dimHeight) ;
      view.setIfChanged('proportion', dimHeight/height);
    }
    
    // If there is no vertical scroller and auto hiding is on, make
    // sure we are at the top if not already there
    if (!this.get('isVerticalScrollerVisible') && (this.get('verticalScrollOffset') !== 0) && 
       this.get('autohidesVerticalScroller')) {
      this.set('verticalScrollOffset', 0);
    }
    
    // Same thing for horizontal scrolling.
    if (!this.get('isHorizontalScrollerVisible') && (this.get('horizontalScrollOffset') !== 0) && 
       this.get('autohidesHorizontalScroller')) {
      this.set('horizontalScrollOffset', 0);
    }
    
    // This forces to recalculate the height of the frame when is at the bottom
    // of the scroll and the content dimension are smaller that the previous one
    var mxVOffSet   = this.get('maximumVerticalScrollOffset'),
        vOffSet     = this.get('verticalScrollOffset'),
        mxHOffSet   = this.get('maximumHorizontalScrollOffset'),
        hOffSet     = this.get('horizontalScrollOffset'),
        forceHeight = mxVOffSet < vOffSet,
        forceWidth  = mxHOffSet < hOffSet;
    if (forceHeight || forceWidth) {
      this.forceDimensionsRecalculation(forceWidth, forceHeight, vOffSet, hOffSet);
    }
  },

  /** @private
    If our frame changes, then we need to re-calculate the visiblility of our
    scrollers, etc.
  */
  frameDidChange: function() {
    this.contentViewFrameDidChange(YES);
  }.observes('frame'),

  /** @private
    If the layer of the content view changes, we need to readjust the
    scrollTop and scrollLeft properties on the new DOM element.
  */
  contentViewLayerDidChange: function() {
    // Invalidate these cached values, as they're no longer valid
    if (this._verticalScrollOffset !== 0) this._verticalScrollOffset = -1;
    if (this._horizontalScrollOffset !== 0) this._horizontalScrollOffset = -1;
    this.invokeLast(this.adjustElementScroll);
  },

  /** @private
    Whenever the horizontal scroll offset changes, update the scrollers and 
    edit the location of the contentView.
  */
  _scroll_horizontalScrollOffsetDidChange: function() {
    this.invokeLast(this.adjustElementScroll);
  }.observes('horizontalScrollOffset'),
  
  /** @private
    Whenever the vertical scroll offset changes, update the scrollers and 
    edit the location of the contentView.
  */
  _scroll_verticalScrollOffsetDidChange: function() {
    this.invokeLast(this.adjustElementScroll);
  }.observes('verticalScrollOffset'),

  /** @private
    Called at the end of the run loop to actually adjust the scrollTop
    and scrollLeft properties of the container view.
  */
  adjustElementScroll: function() {
    var container = this.get('containerView'),
        content = this.get('contentView'),
        verticalScrollOffset = this.get('verticalScrollOffset'),
        horizontalScrollOffset = this.get('horizontalScrollOffset');

    // We notify the content view that its frame property has changed
    // before we actually update the scrollTop/scrollLeft properties.
    // This gives views that use incremental rendering a chance to render
    // newly-appearing elements before they come into view.
    if (content) {
      content._viewFrameDidChange();

      // Use accelerated drawing if the browser supports it
      if (SC.platform.touch) {
        this._applyCSSTransforms(content.get('layer'));
      }
    }

    if (container && !SC.platform.touch) {
      container = container.$()[0];
      
      if (container) {
        if (verticalScrollOffset !== this._verticalScrollOffset) {
          container.scrollTop = verticalScrollOffset;
          this._verticalScrollOffset = verticalScrollOffset;
        }

        if (horizontalScrollOffset !== this._horizontalScrollOffset) {
          container.scrollLeft = horizontalScrollOffset;
          this._horizontalScrollOffset = horizontalScrollOffset;
        }
      }
    }
  },

  forceDimensionsRecalculation: function (forceWidth, forceHeight, vOffSet, hOffSet) {
    var oldScrollHOffset = hOffSet;
    var oldScrollVOffset = vOffSet;
    this.scrollTo(0,0);
    if(forceWidth && forceHeight){
      this.scrollTo(this.get('maximumHorizontalScrollOffset'), this.get('maximumVerticalScrollOffset'));
    }
    if(forceWidth && !forceHeight){
      this.scrollTo(this.get('maximumHorizontalScrollOffset'), oldScrollVOffset);
    }
    if(!forceWidth && forceHeight){
      this.scrollTo(oldScrollHOffset ,this.get('maximumVerticalScrollOffset'));
    }
  },

  _scroll_verticalScrollOffset: 0,
  _scroll_horizontalScrollOffset: 0
  
});
