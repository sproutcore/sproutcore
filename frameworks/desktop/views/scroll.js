// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('views/scroller');

/**
  @static
  @type Number
  @default 0.95
*/
SC.NORMAL_SCROLL_DECELERATION = 0.95;

/**
  @static
  @type Number
  @default 0.85
*/
SC.FAST_SCROLL_DECELERATION = 0.85;

SC.SCROLL = {
  TOUCH: {
    DEFAULT_SCROLL_THRESHOLD: 15,
    DEFAULT_SECONDARY_SCROLL_THRESHOLD: 50,
    DEFAULT_SECONDARY_SCROLL_LOCK: 500,
    DEFAULT_SCALE_THRESHOLD: 3
  }
};

/** @class
  Implements a complete scroll view. SproutCore implements its own JS-based scrolling in order
  to unify scrolling behavior across platforms, and to enable progressive rendering (via the
  clipping frame) during scroll on all devices.

  Important Properties
  -----

  ScrollView positions its contentView according to three properties: `verticalScrollOffset`,
  `horizontalScrollOffset`, and `scale`. These properties are bindable and observable, but you
  should not override them.

  Gutter vs. Overlaid Scrollers
  -----

  Scroll views use swappable scroll-bar views with various behavior (see `verticalScrollerView`
  and `horizontalScrollerView`). `SC.ScrollerView` is a gutter-based scroller which persists and
  takes up fourteen pixels. (By default, no scroller is shown for content that is too small to
  scroll; see `autohidesHorizontalScroller` and `autohidesVerticalScroller`.) `SC.OverlayScrollerView`
  is a gutterless view which fades when not scrolling. By default, SC.ScrollView uses the gutter
  scroller on mouse-based systems and the fading scroller on touch-base systems. If you would
  like your view to always have OS X-style fading overlaid scrollers, you can use the following:

        SC.ScrollView.extend({
          verticalOverlay: YES,
          verticalScrollerView: SC.OverlayScrollerView
          // repeat for horizontal scrollers
        });

  @extends SC.View
  @since SproutCore 1.0
*/
SC.ScrollView = SC.View.extend({
/** @scope SC.ScrollView.prototype */

  /**
    @type Array
    @default ['sc-scroll-view']
    @see SC.View#classNames
  */
  classNames: ['sc-scroll-view'],

  // ..........................................................
  // PROPERTIES
  //

  /**
    Walk like a duck

    @type Boolean
    @default YES
    @readOnly
  */
  isScrollable: YES,

  /**
    The content view you want the scroll view to manage. This will be assigned to the contentView of the clipView also.

    @type SC.View
    @default null
  */
  contentView: null,

  /**
    The horizontal alignment for non-filling content inside of the ScrollView. Possible values:

      - SC.ALIGN_LEFT
      - SC.ALIGN_RIGHT
      - SC.ALIGN_CENTER

    @type String
    @default SC.ALIGN_LEFT
  */
  horizontalAlign: SC.ALIGN_LEFT,

  /**
    The vertical alignment for non-filling content inside of the ScrollView. Possible values:

      - SC.ALIGN_TOP
      - SC.ALIGN_BOTTOM
      - SC.ALIGN_MIDDLE

    @type String
    @default SC.ALIGN_TOP
  */
  verticalAlign: SC.ALIGN_TOP,

  /**
    Your content view's initial horizontal alignment, if wider than the container. This allows you to e.g.
    center the content view when zoomed out, but begin with it zoomed in and left-aligned. If not specified,
    defaults to your horizontalAlign. May be:

      - SC.ALIGN_LEFT
      - SC.ALIGN_RIGHT
      - SC.ALIGN_CENTER

    @type String
  */
  initialHorizontalAlign: SC.outlet('horizontalAlign'),
  // Maybe in the future these could optionally be a %/pixel value?

  /**
    Your content view's initial vertical alignment, if taller than the container. This allows you to e.g.
    center the content view when zoomed out, but begin with it zoomed in and top-aligned. If not specified,
    defaults to your verticalAlign. May be:

      - SC.ALIGN_TOP
      - SC.ALIGN_BOTTOM
      - SC.ALIGN_MIDDLE

    @type String
  */
  initialVerticalAlign: SC.outlet('verticalAlign'),

  /**
    The current horizontal scroll offset. Changing this value will update both the contentView and the
    horizontal scroller, if there is one.

    If you set this value outside of the minimumHorizontalScrollOffset/maximumHorizontalScrollOffset bounds,
    and SC.platform.get('bounceOnScroll') is true, this will adjust it as needed to accommodate horizontal
    bounce. In this case it is your responsibility to notify this view when the interaction is complete so
    that it can bounce back.

    @field
    @type Number
    @default 0
  */
  horizontalScrollOffset: function (key, value) {
    if (value !== undefined) {
      var minOffset = this.get('minimumHorizontalScrollOffset'),
          maxOffset = this.get('maximumHorizontalScrollOffset');

      // Handle out-of-bounds offsets.
      if (!this._scroll_isTouchScrolling && (value < minOffset || value > maxOffset)) {
        // Not allowed on the view or the platform.
        if (!this.get('bounceHorizontal') || !SC.platform.get('bounceOnScroll')) {
          value = Math.max(minOffset, Math.min(maxOffset, value));
        }
        // Not needed due to small content.
        else if (this._scroll_contentWidth <= this._scroll_containerWidth && !this.get('alwaysBounceHorizontal')) {
          value = Math.max(minOffset, Math.min(maxOffset, value));
        }
      }

      // Update the value.
      this._scroll_horizontalScrollOffset = value;

      // If we're flagged as a user-generated change, cache our vertical scale origin.
      if (this._scroll_isExogenous) {
        // Cache our vertical scale origin.
        if (value === minOffset && value === maxOffset) {
          this._scroll_horizontalScaleOrigin = SC.ALIGN_DEFAULT;
        } else if (value === minOffset) {
          this._scroll_horizontalScaleOrigin = SC.ALIGN_LEFT;
        } else if (value === maxOffset) {
          this._scroll_horizontalScaleOrigin = SC.ALIGN_RIGHT;
        } else {
          this._scroll_horizontalScaleOrigin = SC.ALIGN_CENTER;
        }
        // Calculating this when scroll offset changes allows us to retain it when only scale changes. (Note that this calculation
        // doesn't take minimum offset into account; in every case I can think of where this value will be used, the minimum is 0.)
        this._scroll_horizontalScaleOriginPct = (value + (this._scroll_containerWidth / 2)) / (maxOffset + this._scroll_containerWidth)
      }
    }

    return this._scroll_horizontalScrollOffset || 0;
  }.property('minimumHorizontalScrollOffset', 'maximumHorizontalScrollOffset').cacheable(),
  // Note that the properties above don't trigger a recalculation, as calculation is only done during setting. Instead,
  // it invalidates the last-set value so that setting it again will actually do something.

  /**
    The current vertical scroll offset. Changing this value will update both the contentView and the vertical
    scroller, if there is one.

    If you set this value outside of the minimumVerticalScrollOffset/maximumVerticalScrollOffset bounds, and
    SC.platform.get('bounceOnScroll') is true, this will adjust as needed to accommodate vertical bounce. In
    this case it is your responsibility to notify this view when the interaction is complete so that it can
    bounce back.

    @field
    @type Number
    @default 0
  */
  verticalScrollOffset: function (key, value) {
    if (value !== undefined) {
      var minOffset = this.get('minimumVerticalScrollOffset'),
          maxOffset = this.get('maximumVerticalScrollOffset');

      // Handle out-of-bounds offsets.
      if (!this._scroll_isTouchScrolling && (value < minOffset || value > maxOffset)) {
        // Not allowed on the view or the platform.
        if (!this.get('bounceVertical') || !SC.platform.get('bounceOnScroll')) {
          value = Math.max(minOffset, Math.min(maxOffset, value));
        }
        // Not needed due to small content.
        else if (this._scroll_contentHeight <= this._scroll_containerHeight && !this.get('alwaysBounceVertical')) {
          value = Math.max(minOffset, Math.min(maxOffset, value));
        }
      }

      // Update the value.
      this._scroll_verticalScrollOffset = value;

      // If we're flagged as a user-generated change, cache our vertical scale origin.
      if (this._scroll_isExogenous) {
        if (value === minOffset && value === maxOffset) {
          this._scroll_verticalScaleOrigin = SC.ALIGN_DEFAULT;
        } else if (value === minOffset) {
          this._scroll_verticalScaleOrigin = SC.ALIGN_TOP;
        } else if (value === maxOffset) {
          this._scroll_verticalScaleOrigin = SC.ALIGN_BOTTOM;
        } else {
          this._scroll_verticalScaleOrigin = SC.ALIGN_CENTER;
        }
        // Calculating this when scroll offset changes allows us to retain it when only scale changes. (Note that this calculation
        // doesn't take minimum offset into account; in every case I can think of where this value will be used, the minimum is 0.)
        this._scroll_verticalScaleOriginPct = (value + (this._scroll_containerHeight / 2)) / (maxOffset + this._scroll_containerHeight)
      }
    }

    return this._scroll_verticalScrollOffset || 0;
  }.property('minimumVerticalScrollOffset', 'maximumVerticalScrollOffset').cacheable(),
  // Note that the properties above don't trigger a recalculation, as calculation is only done during setting. Instead,
  // it invalidates the last-set value so that setting it again will actually do something.

  /** @private
    Calculates the maximum offset given content and container sizes, and the
    alignment.
  */
  maximumScrollOffset: function (contentSize, containerSize, align) {
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

  /** @private
    Calculates the minimum offset given content and container sizes, and the
    alignment.
  */
  minimumScrollOffset: function (contentSize, containerSize, align) {
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

    @field
    @type Number
    @default 0
  */
  maximumHorizontalScrollOffset: function () {
    var view = this.get('contentView');
    var contentWidth = view ? view.get('frame').width : 0,
        calculatedWidth = view ? view.get('calculatedWidth') : 0;

    // The following code checks if there is a calculatedWidth (collections)
    // to avoid looking at the incorrect value calculated by frame.
    if (calculatedWidth) {
      // Note that calculatedWidth is in the view's (unscaled) space.
      contentWidth = calculatedWidth * this.get('scale');
    }

    var containerWidth = this.get('containerView').get('frame').width;

    // we still must go through minimumScrollOffset even if we can't scroll
    // because we need to adjust for alignment. So, just make sure it won't allow scrolling.
    if (!this.get('canScrollHorizontal')) contentWidth = Math.min(contentWidth, containerWidth);
    return this._scroll_maximumHorizontalScrollOffset = this.maximumScrollOffset(contentWidth, containerWidth, this.get("horizontalAlign"));
  }.property(),

  /**
    The maximum vertical scroll offset allowed given the current contentView
    size and the size of the scroll view.  If vertical scrolling is disabled,
    this will always return 0 (or whatever alignment dictates).

    @field
    @type Number
    @default 0
  */
  maximumVerticalScrollOffset: function () {
    var view = this.get('contentView'),
        contentHeight = (view && view.get('frame')) ? view.get('frame').height : 0,
        calculatedHeight = view ? view.get('calculatedHeight') : 0;

    // The following code checks if there is a calculatedWidth (collections)
    // to avoid looking at the incorrect value calculated by frame.
    if (calculatedHeight) {
      // Note that calculatedWidth is in the view's (unscaled) space.
      contentHeight = calculatedHeight * this.get('scale');
    }

    var containerHeight = this.get('containerView').get('frame').height;

    // we still must go through minimumScrollOffset even if we can't scroll
    // because we need to adjust for alignment. So, just make sure it won't allow scrolling.
    if (!this.get('canScrollVertical')) contentHeight = Math.min(contentHeight, containerHeight);
    return this._scroll_maximumVerticalScrollOffset = this.maximumScrollOffset(contentHeight, containerHeight, this.get("verticalAlign"));
  }.property(),

  /**
    The minimum horizontal scroll offset allowed given the current contentView
    size and the size of the scroll view.  If horizontal scrolling is
    disabled, this will always return 0 (or whatever alignment dictates).

    @field
    @type Number
    @default 0
  */
  minimumHorizontalScrollOffset: function () {
    var view = this.get('contentView');
    var contentWidth = view ? view.get('frame').width : 0,
        calculatedWidth = view ? view.get('calculatedWidth') : 0;
    // The following code checks if there is a calculatedWidth (collections)
    // to avoid looking at the incorrect value calculated by frame.
    if (calculatedWidth) {
      contentWidth = calculatedWidth * this.get('scale');
    }

    var containerWidth = this.get('containerView').get('frame').width;

    // we still must go through minimumScrollOffset even if we can't scroll
    // because we need to adjust for alignment. So, just make sure it won't allow scrolling.
    if (!this.get('canScrollHorizontal')) contentWidth = Math.min(contentWidth, containerWidth);
    return this._scroll_minimumHorizontalScrollOffset = this.minimumScrollOffset(contentWidth, containerWidth, this.get("horizontalAlign"));
  }.property(),

  /**
    The minimum vertical scroll offset allowed given the current contentView
    size and the size of the scroll view.  If vertical scrolling is disabled,
    this will always return 0 (or whatever alignment dictates).

    @field
    @type Number
    @default 0
  */
  minimumVerticalScrollOffset: function () {
    var view = this.get('contentView');
    var contentHeight = (view && view.get('frame')) ? view.get('frame').height : 0,
        calculatedHeight = view ? view.get('calculatedHeight') : 0;

    // The following code checks if there is a calculatedWidth (collections)
    // to avoid looking at the incorrect value calculated by frame.
    if (calculatedHeight) {
      contentHeight = calculatedHeight * this.get('scale');
    }

    var containerHeight = this.get('containerView').get('frame').height;

    // we still must go through minimumScrollOffset even if we can't scroll
    // because we need to adjust for alignment. So, just make sure it won't allow scrolling.
    if (!this.get('canScrollVertical')) contentHeight = Math.min(contentHeight, containerHeight);
    return this._scroll_minimumVerticalScrollOffset = this.minimumScrollOffset(contentHeight, containerHeight, this.get("verticalAlign"));
  }.property(),


  /**
    Amount to scroll one vertical line.

    Used by the default implementation of scrollDownLine() and scrollUpLine().

    @type Number
    @default 20
  */
  verticalLineScroll: 20,

  /**
    Amount to scroll one horizontal line.

    Used by the default implementation of scrollLeftLine() and
    scrollRightLine().

    @type Number
    @default 20
  */
  horizontalLineScroll: 20,

  /**
    Amount to scroll one vertical page.

    Used by the default implementation of scrollUpPage() and scrollDownPage().

    @field
    @type Number
    @default value of frame.height
    @observes frame
  */
  verticalPageScroll: function () {
    return this.get('frame').height;
  }.property('frame'),

  /**
    Amount to scroll one horizontal page.

    Used by the default implementation of scrollLeftPage() and
    scrollRightPage().

    @field
    @type Number
    @default value of frame.width
    @observes frame
  */
  horizontalPageScroll: function () {
    return this.get('frame').width;
  }.property('frame'),

  /**
    Determines whether the vertical scroller should fade out while in overlay mode. Has no effect if verticalOverlay is set to false.

    @property Boolean
    @default YES
   */
  verticalFade: YES,

  /**
    Determines whether the horizontal scroller should fade out while in overlay mode. Has no effect if horizontalOverlay is set to false.

    @property Boolean
    @default YES
   */
  horizontalFade: YES,

  /**
    Determines how long (in seconds) scrollbars wait before fading out.

    @property Number
    @default 0.4
   */
  fadeOutDelay: 0.4,

  // ..........................................................
  // SCROLLERS
  //

  /**
    YES if the view should maintain a horizontal scroller.   This property
    must be set when the view is created.

    @type Boolean
    @default YES
  */
  hasHorizontalScroller: YES,

  /**
    The horizontal scroller view class. This will be replaced with a view
    instance when the ScrollView is created unless hasHorizontalScroller is
    NO.

    @type SC.View
    @default SC.ScrollerView
  */
  horizontalScrollerView: SC.ScrollerView,

  /**
    The horizontal scroller view for touch. This will be replaced with a view
    instance when touch is enabled when the ScrollView is created unless
    hasHorizontalScroller is NO.

    @type SC.View
    @default SC.OverlayScrollerView
  */
  horizontalTouchScrollerView: SC.OverlayScrollerView,

  /**
    YES if the horizontal scroller should be visible.  You can change this
    property value anytime to show or hide the horizontal scroller.  If you
    do not want to use a horizontal scroller at all, you should instead set
    hasHorizontalScroller to NO to avoid creating a scroller view in the
    first place.

    @type Boolean
    @default YES
  */
  isHorizontalScrollerVisible: YES,

  /**
    Returns YES if the view both has a horizontal scroller, the scroller is
    visible.

    @field
    @type Boolean
    @default YES
  */
  canScrollHorizontal: function () {
    return !!(this.get('hasHorizontalScroller') &&
      this.get('horizontalScrollerView') &&
      this.get('isHorizontalScrollerVisible'));
  }.property('isHorizontalScrollerVisible').cacheable(),

  /**
    If YES, the horizontal scroller will autohide if the contentView is
    smaller than the visible area.  You must set hasHorizontalScroller to YES
    for this property to have any effect.

    @type Boolean
    @default YES
  */
  autohidesHorizontalScroller: YES,

  /**
    YES if the view should maintain a vertical scroller. This property must
    be set when the view is created.

    @type Boolean
    @default YES
  */
  hasVerticalScroller: YES,

  /**
    The vertical scroller view class. This will be replaced with a view
    instance when the ScrollView is created unless hasVerticalScroller is NO.

    @type SC.View
    @default SC.ScrollerView
  */
  verticalScrollerView: SC.ScrollerView,

  /**
    The vertical touch scroller view class. This will be replaced with a view
    instance when the ScrollView is created.

    @type SC.View
    @default SC.OverlayScrollerView
  */
  verticalTouchScrollerView: SC.OverlayScrollerView,

  /**
    YES if the vertical scroller should be visible.  You can change this
    property value anytime to show or hide the vertical scroller.  If you do
    not want to use a vertical scroller at all, you should instead set
    hasVerticalScroller to NO to avoid creating a scroller view in the first
    place.

    @type Boolean
    @default YES
  */
  isVerticalScrollerVisible: YES,

  /**
    Returns YES if the view both has a horizontal scroller, the scroller is
    visible.

    @field
    @type Boolean
    @default YES
  */
  canScrollVertical: function () {
    return !!(this.get('hasVerticalScroller') &&
      this.get('verticalScrollerView') &&
      this.get('isVerticalScrollerVisible'));
  }.property('isVerticalScrollerVisible').cacheable(),

  /**
    If YES, the vertical scroller will autohide if the contentView is
    smaller than the visible area.  You must set hasVerticalScroller to YES
    for this property to have any effect.

    @type Boolean
    @default YES
  */
  autohidesVerticalScroller: YES,

  /**
    Use this property to set the 'bottom' offset of your vertical scroller,
    to make room for a thumb view or other accessory view. Default is 0.

    @type Number
    @default 0
  */
  verticalScrollerBottom: 0,

  /**
    Use this to overlay the vertical scroller.

    This ensures that the container frame will not resize to accommodate the
    vertical scroller, hence overlaying the scroller on top of
    the container.

    @field
    @type Boolean
    @default NO
  */
  verticalOverlay: function () {
    if (SC.platform.touch) return YES;
    return NO;
  }.property().cacheable(),

  /**
    Use this to overlay the horizontal scroller.

    This ensures that the container frame will not resize to accommodate the
    horizontal scroller, hence overlaying the scroller on top of
    the container

    @field
    @type Boolean
    @default NO
  */
  horizontalOverlay: function () {
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

    @type Hash
    @default null
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

    @type Hash
    @default null
  */
  horizontalScrollerLayout: null,

  // ..........................................................
  // CUSTOM VIEWS
  //

  /**
    The container view that will contain your main content view.  You can
    replace this property with your own custom subclass if you prefer.

    @type SC.ContainerView
    @default SC.ConainerView
  */
  containerView: SC.ContainerView,


  // ..........................................................
  // METHODS
  //

  /**
    Scrolls the receiver to the specified x,y coordinate.  This should be the
    offset into the contentView you want to appear at the top-left corner of
    the scroll view.

    This method will contain the actual scroll based on whether the view
    can scroll in the named direction and the maximum distance it can
    scroll.

    If you only want to scroll in one direction, pass null for the other
    direction.  You can also optionally pass a Hash for the first parameter
    with x and y coordinates.

    @param {Number} x the x scroll location
    @param {Number} y the y scroll location
    @returns {SC.ScrollView} receiver
  */
  scrollTo: function (x, y) {
    // Core Developer note: Don't call scrollTo (or any of the upstream methods) from within
    // ScrollView or a subclass; instead you should manipulate the ScrollOffset properties
    // directly. scrollTo is reserved for exogenous interactions, presumably triggered by the
    // user, which should cause scale and alignment origins to recalculate.
    this._scroll_isExogenous = YES;

    // normalize params
    if (y === undefined && SC.typeOf(x) === SC.T_HASH) {
      y = x.y;
      x = x.x;
    }

    if (!SC.none(x)) {
      this.set('horizontalScrollOffset', x);
    }

    if (!SC.none(y)) {
      this.set('verticalScrollOffset', y);
    }

    this._scroll_isExogenous = NO;

    return this;
  },

  /**
    Scrolls the receiver in the horizontal and vertical directions by the
    amount specified, if allowed.  The actual scroll amount will be
    constrained by the current scroll minimums and maximums. (If you wish
    to scroll outside of those bounds, you should call `scrollTo` directly.)

    If you only want to scroll in one direction, pass null or 0 for the other
    direction.  You can also optionally pass a Hash for the first parameter
    with x and y coordinates.

    @param {Number} x change in the x direction (or hash)
    @param {Number} y change in the y direction
    @returns {SC.ScrollView} receiver
  */
  scrollBy: function (x, y) {
    // normalize params
    if (y === undefined && SC.typeOf(x) === SC.T_HASH) {
      y = x.y;
      x = x.x;
    }

    // if null, undefined, or 0, pass null; otherwise just add current offset
    x = (x) ? this.get('horizontalScrollOffset') + x : null;
    y = (y) ? this.get('verticalScrollOffset') + y : null;

    // Constrain within mins and maxes. (Calls to scrollBy are generally convenience calls that should not have to
    // worry about exceeding bounds and making the followup call. Features that want to allow overscroll should call
    // scrollTo directly.)
    if (x !== null) {
      x = Math.min(Math.max(this.get('minimumHorizontalScrollOffset'), x), this.get('maximumHorizontalScrollOffset'));
    }
    if (y !== null) {
      y = Math.min(Math.max(this.get('minimumVerticalScrollOffset'), y), this.get('maximumVerticalScrollOffset'));
    }

    return this.scrollTo(x, y);
  },

  /**
    Scroll the view to make the view's frame visible.  For this to make sense,
    the view should be a subview of the contentView.  Otherwise the results
    will be undefined.

    @param {SC.View} view view to scroll or null to scroll receiver visible
    @returns {Boolean} YES if scroll position was changed
  */
  scrollToVisible: function (view) {

    // if no view is passed, do default
    if (arguments.length === 0) return sc_super();

    var contentView = this.get('contentView');
    if (!contentView) return NO; // nothing to do if no contentView.

    // get the frame for the view - should work even for views with static
    // layout, assuming it has been added to the screen.
    var vf = view.get('frame');
    if (!vf) return NO; // nothing to do

    // convert view's frame to an offset from the contentView origin.  This
    // will become the new scroll offset after some adjustment.
    vf = contentView.convertFrameFromView(vf, view.get('parentView'));

    return this.scrollToRect(vf);
  },

  /**
    Scroll to the supplied rectangle.

    If the rectangle is bigger than the viewport, the top-left
    will be preferred.

    (Note that if your content is scaled, the rectangle must be
    relative to the contentView's scale, not the ScrollView's.)

    @param {Rect} rect Rectangle to which to scroll.
    @returns {Boolean} YES if scroll position was changed.
  */
  scrollToRect: function (rect) {
    // find current visible frame.
    var vo = SC.cloneRect(this.get('containerView').get('frame')),
        origX = this.get('horizontalScrollOffset'),
        origY = this.get('verticalScrollOffset'),
        scale = this.get('scale');

    vo.x = origX;
    vo.y = origY;

    // Scale rect.
    if (scale !== 1) {
      rect = SC.cloneRect(rect);
      rect.x *= scale;
      rect.y *= scale;
      rect.height *= scale;
      rect.width *= scale;
    }

    // if bottom edge is not visible, shift origin
    vo.y += Math.max(0, SC.maxY(rect) - SC.maxY(vo));
    vo.x += Math.max(0, SC.maxX(rect) - SC.maxX(vo));

    // if top edge is not visible, shift origin
    vo.y -= Math.max(0, SC.minY(vo) - SC.minY(rect));
    vo.x -= Math.max(0, SC.minX(vo) - SC.minX(rect));

    // scroll to that origin.
    if ((origX !== vo.x) || (origY !== vo.y)) {
      this.scrollTo(vo.x, vo.y);
      return YES;
    } else {
      return NO;
    }
  },


  /**
    Scrolls the receiver down one or more lines if allowed.  If number of
    lines is not specified, scrolls one line.

    @param {Number} lines number of lines
    @returns {SC.ScrollView} receiver
  */
  scrollDownLine: function (lines) {
    if (lines === undefined) lines = 1;
    return this.scrollBy(null, this.get('verticalLineScroll') * lines);
  },

  /**
    Scrolls the receiver up one or more lines if allowed.  If number of
    lines is not specified, scrolls one line.

    @param {Number} lines number of lines
    @returns {SC.ScrollView} receiver
  */
  scrollUpLine: function (lines) {
    if (lines === undefined) lines = 1;
    return this.scrollBy(null, 0 - this.get('verticalLineScroll') * lines);
  },

  /**
    Scrolls the receiver right one or more lines if allowed.  If number of
    lines is not specified, scrolls one line.

    @param {Number} lines number of lines
    @returns {SC.ScrollView} receiver
  */
  scrollRightLine: function (lines) {
    if (lines === undefined) lines = 1;
    return this.scrollTo(this.get('horizontalLineScroll') * lines, null);
  },

  /**
    Scrolls the receiver left one or more lines if allowed.  If number of
    lines is not specified, scrolls one line.

    @param {Number} lines number of lines
    @returns {SC.ScrollView} receiver
  */
  scrollLeftLine: function (lines) {
    if (lines === undefined) lines = 1;
    return this.scrollTo(0 - this.get('horizontalLineScroll') * lines, null);
  },

  /**
    Scrolls the receiver down one or more page if allowed.  If number of
    pages is not specified, scrolls one page.  The page size is determined by
    the verticalPageScroll value.  By default this is the size of the current
    scrollable area.

    @param {Number} pages number of lines
    @returns {SC.ScrollView} receiver
  */
  scrollDownPage: function (pages) {
    if (pages === undefined) pages = 1;
    return this.scrollBy(null, this.get('verticalPageScroll') * pages);
  },

  /**
    Scrolls the receiver up one or more page if allowed.  If number of
    pages is not specified, scrolls one page.  The page size is determined by
    the verticalPageScroll value.  By default this is the size of the current
    scrollable area.

    @param {Number} pages number of lines
    @returns {SC.ScrollView} receiver
  */
  scrollUpPage: function (pages) {
    if (pages === undefined) pages = 1;
    return this.scrollBy(null, 0 - (this.get('verticalPageScroll') * pages));
  },

  /**
    Scrolls the receiver right one or more page if allowed.  If number of
    pages is not specified, scrolls one page.  The page size is determined by
    the verticalPageScroll value.  By default this is the size of the current
    scrollable area.

    @param {Number} pages number of lines
    @returns {SC.ScrollView} receiver
  */
  scrollRightPage: function (pages) {
    if (pages === undefined) pages = 1;
    return this.scrollBy(this.get('horizontalPageScroll') * pages, null);
  },

  /**
    Scrolls the receiver left one or more page if allowed.  If number of
    pages is not specified, scrolls one page.  The page size is determined by
    the verticalPageScroll value.  By default this is the size of the current
    scrollable area.

    @param {Number} pages number of lines
    @returns {SC.ScrollView} receiver
  */
  scrollLeftPage: function (pages) {
    if (pages === undefined) pages = 1;
    return this.scrollBy(0 - (this.get('horizontalPageScroll') * pages), null);
  },

  // ..........................................................
  // SCROLL WHEEL SUPPORT
  //

  /** @private */
  mouseWheel: function (evt) {
    if (!this.get('isEnabledInPane')) return NO;

    this._scsv_clearQueuedAnimations();

    var horizontalScrollOffset = this.get('horizontalScrollOffset'),
        maximumHorizontalScrollOffset = this.get('maximumHorizontalScrollOffset'),
        maximumVerticalScrollOffset = this.get('maximumVerticalScrollOffset'),
        shouldScroll = NO,
        verticalScrollOffset = this.get('verticalScrollOffset');

    // Only attempt to scroll if we are allowed to scroll in the direction and
    // have room to scroll in the direction.  Otherwise, ignore the event so
    // that an outer ScrollView may capture it.
    shouldScroll = ((this.get('canScrollHorizontal') &&
        (evt.wheelDeltaX < 0 && horizontalScrollOffset > 0) ||
        (evt.wheelDeltaX > 0 && horizontalScrollOffset < maximumHorizontalScrollOffset)) ||
        (this.get('canScrollVertical') &&
        (evt.wheelDeltaY < 0 && verticalScrollOffset > 0) ||
        (evt.wheelDeltaY > 0 && verticalScrollOffset < maximumVerticalScrollOffset)));

    if (shouldScroll) {
      this.scrollBy(evt.wheelDeltaX, evt.wheelDeltaY);
    }

    return shouldScroll;
  },

  /*..............................................
    SCALING SUPPORT
  */

  /**
    Determines whether scaling is allowed.

    @type Boolean
    @default NO
  */
  canScale: NO,

  /**
    The current scale. If canScale is true, setting this will adjust the scale of the contentView. (If the
    contentView implements the SC.Scalable protocol, it will instead pass the scale to the contentView's
    applyScale method instead.)

    Note that on platforms that allow bounce, setting scale outside of the minimum/maximumScale bounds will
    result in a bounce. (It is up to the developer to alert this view when the action is over and it should
    bounce back.)

    @field
    @type Number
    @default 1.0
  */
  scale: function (key, value) {
    if (value !== undefined) {
      if (!this.get('canScale')) value = 1;
      else {
        var min = this.get('minimumScale'),
          max = this.get('maximumScale');
        // Constrain if out of bounds and not allowed.
        if (value < min || value > max) {
          if (!SC.platform.get('bounceOnScroll')) value = Math.min(Math.max(min, value), max);
        }
      }

      this._scroll_scale = value;
    }
    return this._scroll_scale;
  }.property('canScale', 'minimumScale', 'maximumScale').cacheable(),

  /**
    The minimum scale.

    @type Number
    @default 0.25
  */
  minimumScale: 0.25,

  /**
    The maximum scale.

    @type Number
    @default 2.0
  */
  maximumScale: 2.0,

  // ------------------------------------------------------------------------
  // Fade Support
  //

  /** @private The minimum delay before applying a fade transition. */
  _sc_minimumFadeOutDelay: function () {
    // The fade out delay is never less than 100ms (so that the current run loop can complete) and is never less than the fade in duration (so that it can fade fully in).
    return Math.max(Math.max(this.get('fadeOutDelay') || 0, 0.1), this.get('fadeInDuration') || 0) * 1000;
  }.property('fadeOutDelay').cacheable(),

  /** @private */
  _sc_fadeOutScrollers: function () {
    this._sc_fadeOutVerticalScroller();
    this._sc_fadeOutHorizontalScroller();
  },

  _sc_fadeOutVerticalScroller: function () {
    var verticalScroller = this.get('verticalScrollerView');

    if (verticalScroller && verticalScroller.get('fadeOut')) {
      // Fade out.
      verticalScroller.fadeOut();
    }

    this._sc_verticalFadeOutTimer = null;
  },

  _sc_fadeOutHorizontalScroller: function () {
    var horizontalScroller = this.get('horizontalScrollerView');

    if (horizontalScroller && horizontalScroller.get('fadeOut')) {
      // Fade out.
      horizontalScroller.fadeOut();
    }

    this._sc_horizontalFadeOutTimer = null;
  },

  /** @private */
  _sc_fadeInScrollers: function () {
    this._sc_fadeInVerticalScroller();
    this._sc_fadeInHorizontalScroller();
  },

  /** @private Fade in the vertical scroller. Each scroller fades in/out independently. */
  _sc_fadeInVerticalScroller: function () {
    var canScrollVertical = this.get('canScrollVertical'),
      verticalScroller = this.get('verticalScrollerView'),
      delay;

    if (canScrollVertical && verticalScroller && verticalScroller.get('fadeIn')) {
      if (this._sc_verticalFadeOutTimer) {
        // Reschedule the current timer (avoid creating a new instance).
        this._sc_verticalFadeOutTimer.startTime = null;
        this._sc_verticalFadeOutTimer.schedule();
      } else {
        // Fade in.
        verticalScroller.fadeIn();

        // Wait the minimum time before fading out again.
        delay = this.get('_sc_minimumFadeOutDelay');
        this._sc_verticalFadeOutTimer = this.invokeLater(this._sc_fadeOutVerticalScroller, delay);
      }
    }
  },

  /** @private Fade in the horizontal scroller. Each scroller fades in/out independently. */
  _sc_fadeInHorizontalScroller: function () {
    var canScrollHorizontal = this.get('canScrollHorizontal'),
      horizontalScroller = this.get('horizontalScrollerView'),
      delay;

    if (canScrollHorizontal && horizontalScroller && horizontalScroller.get('fadeIn')) {
      if (this._sc_horizontalFadeOutTimer) {
        // Reschedule the current timer (avoid creating a new instance).
        this._sc_horizontalFadeOutTimer.startTime = null;
        this._sc_horizontalFadeOutTimer.schedule();
      } else {
        // Fade in.
        horizontalScroller.fadeIn();

        // Wait the minimum time before fading out again.
        delay = this.get('_sc_minimumFadeOutDelay');
        this._sc_horizontalFadeOutTimer = this.invokeLater(this._sc_fadeOutHorizontalScroller, delay);
      }
    }
  },

  // ..........................................................
  // Touch Support
  //

  /**
    @type Boolean
    @default YES
    @readOnly
  */
  acceptsMultitouch: YES,

  /**
    This determines how far (in pixels) a touch must move before it is registered as a scroll.

    You can change this value for all instances of SC.ScrollView in your application by overriding
    `SC.SCROLL.TOUCH.DEFAULT_SCROLL_THRESHOLD` at launch time.

    @type Number
    @default SC.SCROLL.TOUCH.DEFAULT_SCROLL_THRESHOLD
  */
  touchScrollThreshold: SC.outlet('SC.SCROLL.TOUCH.DEFAULT_SCROLL_THRESHOLD', window),

  /**
    Once a vertical or horizontal scroll has been triggered, this determines how far (in pixels) the gesture
    must move on the other axis to trigger a two-axis scroll. If your scroll view's content is omnidirectional
    (e.g. a map) you should set this value to 0.

    You can change this value for all instances of SC.ScrollView in your application by overriding
    `SC.SCROLL.TOUCH.DEFAULT_SECONDARY_SCROLL_THRESHOLD` at launch time.

    @type Number
    @default SC.SCROLL.TOUCH.DEFAULT_SECONDARY_SCROLL_THRESHOLD
  */
  touchSecondaryScrollThreshold: SC.outlet('SC.SCROLL.TOUCH.DEFAULT_SECONDARY_SCROLL_THRESHOLD', window),

  /**
    Once a vertical or horizontal scroll has been triggered, this determines how far (in pixels) the gesture
    must move on the other axis to trigger a two-axis scroll. If your scroll view's content is omnidirectional
    (e.g. a map) you should set this value to 0.

    You can change this value for all instances of SC.ScrollView in your application by overriding
    `SC.SCROLL.TOUCH.DEFAULT_SECONDARY_SCROLL_LOCK` at launch time.

    @type Number
    @default SC.SCROLL.TOUCH.DEFAULT_SECONDARY_SCROLL_LOCK
  */
  touchSecondaryScrollLock: SC.outlet('SC.SCROLL.TOUCH.DEFAULT_SECONDARY_SCROLL_LOCK', window),

  /**
    This determines how much a gesture must pinch (in pixels) before it is registered as a scale action.

    You can change this value for all instances of SC.ScrollView in your application by overriding
    `SC.SCROLL.TOUCH.DEFAULT_SCALE_THRESHOLD` at launch time.

    @type Number
    @default SC.SCROLL.TOUCH.DEFAULT_SCALE_THRESHOLD
  */
  touchScaleThreshold: SC.outlet('SC.SCROLL.TOUCH.DEFAULT_SCALE_THRESHOLD', window),

  /**
    The scroll deceleration rate. (Presently only supported on touch devices.)

    @type Number
    @default SC.NORMAL_SCROLL_DECELERATION
  */
  decelerationRate: SC.outlet('SC.NORMAL_SCROLL_DECELERATION', window),

  /**
    The Bezier curve used to decelerate kinetic scrolling. To generate your own curve, call
    `SC.bezierCurve(mX1, mY1, mX2, mY2)`. (You will generally not change this property.)

    @default {SC.bezierCurve(0, 0.8, 0.5, 1)}
  */
  decelerationCurve: SC.bezierCurve(0, 0.75, 0.5, 1),

  /** @private The flipped-axis inverse of the deceleration curve is used to truncate it at a certain position. */
  _scsv_decelerationCurveInverse: function() {
    var pts = this.get('decelerationCurve').getControlPoints();
    return SC.bezierCurve(pts[0].y, pts[0].x, pts[1].y, pts[1].x);
  }.property('decelerationCurve').cacheable(),

  /**
    The Bezier curve used to bounce kinetic scrolling at the edges. To generate your own curve, call
    `SC.bezierCurve(mX1, mY1, mX2, mY2)`. (You will generally not change this property.)

    @default {SC.bezierCurve(0, 0.5, 0.5, 1)}
  */
  bounceCurve: SC.bezierCurve(0, 0.5, 0.5, 1),

  /**
    The Bezier curve used to bounce kinetic scrolling back from beyond the edges. To generate your own
    curve, call `SC.bezierCurve(mX1, mY1, mX2, mY2)`. (You will generally not change this property.)

    @default {SC.bezierCurve(0.1, 0.1, 0, 1)}
  */
  bounceBackCurve: SC.bezierCurve(0.1, 0.1, 0, 1),

  /**
    The Bezier curve used to bounce touch scaling back in-bounds. To generate your own curve, call
    `SC.bezierCurve(mX1, mY1, mX2, mY2)`. (You will generally not change this property.)

    @default {SC.bezierCurve(0, 0, 1, 1)}
  */
  scaleBackCurve: SC.bezierCurve(0, 0, 1, 1),

  /**
    This value controls how bouncy the scroll view's bounce is. A higher value will result in more bounce.

    @type Number
    @default 0.55
  */
  bounceCoefficient: 0.55,

  /**
    If YES, and SC.platform.get('bounceOnScroll') is YES, horizontal bouncing will be enabled (via supported input;
    at this time, mouse-wheel and touchpad scroll bouncing is not supported).

    You can control whether the view should bounce even with fully-visible content via `alwaysBounceHorizontal`.

    @type Boolean
    @default YES
  */
  bounceHorizontal: YES,

  /**
    If YES, and SC.platform.get('bounceOnScroll') is YES, vertical bouncing will be enabled (via supported input;
    at this time, mouse-wheel and touchpad scroll bouncing is not supported).

    You can control whether the view should bounce even with fully-visible content via `alwaysBounceVertical`.

    @type Boolean
    @default YES
  */
  bounceVertical: YES,

  /**
    If YES, bouncing will always be enabled in the horizontal direction, even if the content
    is smaller or the same size as the view.

    @type Boolean
    @default NO
  */
  alwaysBounceHorizontal: NO,

  /**
    If YES, bouncing will always be enabled in the vertical direction, even if the content
    is smaller or the same size as the view.

    @type Boolean
    @default YES
  */
  alwaysBounceVertical: YES,

  /**
    Whether to delay touches from passing through to the content. By default, if the touch moves enough to
    trigger a scroll within 150ms, this view will retain control of the touch, and content views will not
    have a chance to handle it. This is generally the behavior you want.

    If you set this to NO, the touch will not trigger a scroll until you pass control back to this view via
    `touch.restoreLastTouchResponder`, for example when the touch has dragged by a certain amount. You should
    use this option only if you know what you're doing.

    @type Boolean
    @default YES
  */
  delaysContentTouches: YES,

  /** @private */
  captureTouch: function (touch) {
    // If we're in hand-holding mode, we capture the touch and run our own downstream event propagating.
    if (this.get('delaysContentTouches')) {
      return YES;
    }
    // Otherwise, suggest ourselves as a reasonable fallback responder. (If none of our children capture
    // the touch or handle touchStart, we'll get another crack at it in touchStart.)
    else {
      touch.stackCandidateTouchResponder(this);
      return NO;
    }
  },

  /** @private */
  touchStart: function (touch) {
    // Note the touch ID.
    this._scroll_latestTouchID = touch.identifier;

    // Cancel any in-flight animations.
    this._scsv_clearQueuedAnimations();

    // Initialize (or reinitialize) the current gesture's anchor points et cetera.
    this._scsv_initializeScrollGesture(touch.averagedTouchesForView(this, YES));

    // If this is our first touch through, and we're in hand-holding mode, delay 150ms to see if the
    // user begins scrolling before passing touches in content.
    if (!this._scroll_isTouchScrolling && this.get('delaysContentTouches')) {
      this.invokeLater(this._scsv_beginTouchesInContent, 150, touch);
    }
    return YES;
  },

  /** @private
    This method gives our descendent views a chance to capture the touch via captureTouch, and subsequently to handle the
    touch, via touchStart. If no view elects to do so, control is returned to the scroll view for standard scrolling.
  */
  _scsv_beginTouchesInContent: function (touch) {
    // GATEKEEP.
    // If another touch has come through while we're waiting to be invoked, don't proceed. (TODO: See if this behaves as expected.)
    if (touch.identifier !== this._scroll_latestTouchID) return;
    // If the touch has ended in the mean time, don't proceed.
    if (touch.hasEnded) return;
    // Most importantly, if we've begun scrolling in the mean time, don't proceed.
    if (this._scroll_isTouchScrolling) return;

    // PROCEED.
    // See if any of our descendent views want to handle the touch. If not, we keep our existing respondership and all is well.
    if (!touch.captureTouch(this, YES)) { touch.makeTouchResponder(touch.targetView, YES, this); }
    // Either way, note that content has already been given a chance to handle this gesture.
    this._scroll_touchContentHadItsChance = YES;
  },

  /* @private Every time a touch begins or ends, re-initialize the gesture with the current touch set. */
  _scsv_initializeScrollGesture: function(averagedTouch) {
    // Reset the distance.
    this._scroll_gestureAnchorD = averagedTouch.d;
    this._scroll_gestureAnchorVerticalOffset = this._scroll_verticalScrollOffset;
    this._scroll_gestureAnchorHorizontalOffset = this._scroll_horizontalScrollOffset;
    this._scroll_gestureAnchorScale = this._scroll_scale;
    this._scroll_gestureAnchorContentHeight = this._scroll_contentHeight;
    this._scroll_gestureAnchorContentWidth = this._scroll_contentWidth;

    // If this is our first touch initialization of the gesture, mark down our initial anchor values.
    if (!this._scroll_touchGestureIsInitialized) {
      this._scroll_gestureAnchorX = this._scroll_gesturePriorX = averagedTouch.x;
      this._scroll_gestureAnchorY = this._scroll_gesturePriorY = averagedTouch.y;
      this._scroll_globalContainerFrame = null;
    }
    // If we're mid-scroll, we need to adjust locations rather than overwrite them. (This prevents jumps when
    // adding or removing touches in edge-resistant situations.)
    else {
      this._scroll_gestureAnchorX += averagedTouch.x - this._scroll_gesturePriorX;
      this._scroll_gestureAnchorY += averagedTouch.y - this._scroll_gesturePriorY;
    }

    // We are now (re)initialized.
    this._scroll_touchGestureIsInitialized = YES;
    this._scroll_touchGestureNeedsReinitializing = NO;
  },

  /** @private */
  touchesDragged: function (evt, touchesForView) {
    var avg = evt.averagedTouchesForView(this);

    // If we've gone un-initialized due to losing a touch since the last drag, reinitialize with the new average.
    if (this._scroll_touchGestureNeedsReinitializing) {
      this._scsv_initializeScrollGesture(avg);
    }

    var threshold = this.get('touchScrollThreshold'),
      scaleThreshold = this.get('touchScaleThreshold'),
      // Changes in x and y since the last initialization.
      deltaX = this._scroll_gestureAnchorX - avg.x,
      deltaY = this._scroll_gestureAnchorY - avg.y,
      // Changes in d, constrained to support zero d (one touch) but avoid small-d jiggers.
      anchorD = this._scroll_gestureAnchorD ? Math.max(this._scroll_gestureAnchorD, 40) : 0,
      evtD = avg.d ? Math.max(avg.d, 40) : 0,
      deltaD = anchorD - evtD,
      // The absolute change values are used to test threshold-crossing.
      absDeltaX = Math.abs(deltaX),
      absDeltaY = Math.abs(deltaY),
      absDeltaD = Math.abs(deltaD),
      // If our scale changes, then our vertical/horizontal offsets need to move by an additional factor.
      xInContainer, yInContainer, xOnContent, yOnContent,
      contentNewHeight, contentNewWidth, contentDeltaHeight, contentDeltaWidth,
      scaleAdditionalOffsetX = 0,
      scaleAdditionalOffsetY = 0,
      // We will calculate our target values below.
      goalX, goalY, goalScale,
      goalXDidChange, goalYDidChange, goalScaleDidChange,
      // The bounds are used to constrain target values.
      minX = this._scroll_minimumHorizontalScrollOffset,
      maxX = this._scroll_maximumHorizontalScrollOffset,
      minY = this._scroll_minimumVerticalScrollOffset,
      maxY = this._scroll_maximumVerticalScrollOffset,
      minScale = this.get('minimumScale'),
      maxScale = this.get('maximumScale'),
      // If we're scaling, we need to know these extra bits.
      vAlign, hAlign,
      // A couple of utility players used to calculate target values out of bounds.
      diff, bounce;

    // CHECK THRESHOLDS TO START SCROLLING/SCALING.

    // Start us scaling (and therefore scrolling) if we've crossed the scale threshold.
    if (!this._scroll_isTouchScaling && this.get('canScale')) {
      if (absDeltaD >= scaleThreshold) {
        this._scroll_isTouchScaling = YES;
        // If you can scale, you can scroll.
        this._scroll_isTouchScrolling = YES;
        this._scroll_isTouchScrollingX = YES;
        this._scroll_isTouchScrollingY = YES;
      }
    }

    // Start us scrolling if we've crossed either scroll threshold (or both, in the same event... hmm).
    if (!this._scroll_isTouchScrolling) {
      if (absDeltaY >= threshold && (this.get('canScrollVertical') || this.get('alwaysBounceVertical'))) {
        this._scroll_isTouchScrolling = YES;
        this._scroll_isTouchScrollingY = YES;
      }
      if (absDeltaX >= threshold && (this.get('canScrollHorizontal') || this.get('alwaysBounceHorizontal'))) {
        this._scroll_isTouchScrolling = YES;
        this._scroll_isTouchScrollingX = YES;
      }
    }
    // If we're already scrolling, only start scrolling on the other axis if we're allowed to, and have crossed its
    // threshold, and haven't crossed the scrolling axis's "lock" threshold past which only single-axis scrolling
    // is allowed.
    else if (!this._scroll_isTouchScrollingX && (this.get('canScrollHorizontal') || this.get('alwaysBounceHorizontal'))) {
      if (absDeltaX >= this.get('touchSecondaryScrollThreshold') && absDeltaY < this.get('touchSecondaryScrollLock')) {
        this._scroll_isTouchScrollingX = YES;
      }
    }
    else if (!this._scroll_isTouchScrollingY && (this.get('canScrollVertical') || this.get('alwaysBounceVertical'))) {
      if (absDeltaY >= this.get('touchSecondaryScrollThreshold') && absDeltaX < this.get('touchSecondaryScrollLock')) {
        this._scroll_isTouchScrollingY = YES;
      }
    }

    // CALCULATE SCALE GOAL.

    // Calculate our scale goal if needed, including the additional offset of the scale. (If we're back to
    // one touch after scaling, anchorD will be zero and we should skip this.)
    if (this._scroll_isTouchScaling && anchorD) {
      goalScale = this._scroll_gestureAnchorScale * (evtD / anchorD);
      if (goalScale < minScale || goalScale > maxScale) {
        // Figure out how far out of bounds we are.
        if (goalScale < minScale) diff = minScale - goalScale;
        else diff = goalScale - maxScale;
        // Calculate the scale range.
        var scaleSpreadFactor = maxScale - minScale;
        // Calculate the bounce.
        bounce = (1 - (1 / ((diff * this.get('bounceCoefficient') / scaleSpreadFactor) + 1))) * scaleSpreadFactor;
        // Adjust the value.
        if (goalScale < minScale) goalScale = minScale - bounce;
        else goalScale = maxScale + bounce;
      }
      goalScaleDidChange = goalScale !== this._scroll_scale;

      // If our scale has changed, we need to tweak our offsets too, to maintain the illusion that
      // we're scaling around the center of our pinch gesture.
      if (goalScaleDidChange) {
        // Update size values quick so that we can bypass some expensive calculations later on (cf. contentViewFrameDidChange).
        this._scroll_contentWidth = this._scroll_contentWidth / this._scroll_scale * goalScale;
        this._scroll_contentHeight = this._scroll_contentHeight / this._scroll_scale * goalScale;
        // New size values means new bounds.
        vAlign = this.get('verticalAlign');
        hAlign = this.get('horizontalAlign');
        minX = this._scroll_minimumHorizontalScrollOffset = this.minimumScrollOffset(this._scroll_contentWidth, this._scroll_containerWidth, hAlign);
        maxX = this._scroll_maximumHorizontalScrollOffset = this.maximumScrollOffset(this._scroll_contentWidth, this._scroll_containerWidth, hAlign);
        minY = this._scroll_minimumVerticalScrollOffset = this.minimumScrollOffset(this._scroll_contentHeight, this._scroll_containerHeight, vAlign);
        maxY = this._scroll_maximumVerticalScrollOffset = this.maximumScrollOffset(this._scroll_contentHeight, this._scroll_containerHeight, vAlign);

        // First, calculate the %-across-the-content values.
        if (!this._scroll_globalContainerFrame) {
          this._scroll_globalContainerFrame = this.containerView.convertFrameToView(this.containerView.get('frame'));
        }
        xInContainer = avg.x - this._scroll_globalContainerFrame.x;
        xOnContent = (xInContainer + this._scroll_horizontalScrollOffset) / this._scroll_contentWidth;
        yInContainer = avg.y - this._scroll_globalContainerFrame.y;
        yOnContent = (yInContainer + this._scroll_verticalScrollOffset) / this._scroll_contentHeight;

        // Next, calculate the total change in size that the content is about to undergo. Algebra for 'contentNew[Size]' step:
        // new width / new scale = anchor width / anchor scale
        // new width = (anchor width * new scale) / anchor scale
        contentNewWidth = (this._scroll_gestureAnchorContentWidth * goalScale) / this._scroll_gestureAnchorScale;
        contentDeltaWidth = contentNewWidth - this._scroll_gestureAnchorContentWidth;
        contentNewHeight = (this._scroll_gestureAnchorContentHeight * goalScale) / this._scroll_gestureAnchorScale;
        contentDeltaHeight = contentNewHeight - this._scroll_gestureAnchorContentHeight;

        // Combine the values to determine how much of the total size change comes off the top/left edges.
        scaleAdditionalOffsetX = contentDeltaWidth * xOnContent;
        scaleAdditionalOffsetY = contentDeltaHeight * yOnContent;
      }
    }

    // CALCULATE OFFSET GOALS.
    // Vertical (the original offset plus change since then, plus any offset from the scaling)
    if (this._scroll_isTouchScrollingY) {
      goalY = this._scroll_gestureAnchorVerticalOffset + deltaY + scaleAdditionalOffsetY;
      // If our goal is out of bounds, we have to back it off a bit (the "bounce").
      if (goalY > maxY || goalY < minY) {
        if (goalY < minY) diff = minY - goalY;
        else diff = goalY - maxY;
        bounce = (1 - (1 / ((diff * this.get('bounceCoefficient') / this._scroll_contentHeight) + 1))) * this._scroll_contentHeight;
        if (goalY < minY) goalY = minY - bounce;
        else goalY = maxY + bounce;
      }
      goalYDidChange = goalY !== this._scroll_verticalScrollOffset;
    }
    // Horizontal (the original offset plus change since then, plus any offset from the scaling)
    if (this._scroll_isTouchScrollingX) {
      goalX = this._scroll_gestureAnchorHorizontalOffset + deltaX + scaleAdditionalOffsetX;
      // If our goal is out of bounds, we have to back it off a bit (the "bounce").
      if (goalX > maxX || goalX < minX) {
        if (goalX < minX) diff = minX - goalX;
        else diff = goalX - maxX;
        bounce = (1 - (1 / ((diff * this.get('bounceCoefficient') / this._scroll_contentWidth) + 1))) * this._scroll_contentWidth;
        if (goalX < minX) goalX = minX - bounce;
        else goalX = maxX + bounce;
      }
      goalXDidChange = goalX !== this._scroll_horizontalScrollOffset;
    }

    // APPLY GOALS, if any.
    if (goalXDidChange || goalYDidChange || goalScaleDidChange) {
      this._scroll_isExogenous = YES;
      this.beginPropertyChanges();
      // Horizontal offset.
      if (goalXDidChange) this.set('horizontalScrollOffset', goalX);
      // Vertical offset.
      if (goalYDidChange) this.set('verticalScrollOffset', goalY);
      // Scale.
      if (goalScaleDidChange) {
        this.set('scale', goalScale);
        this.notifyPropertyChange('minimumHorizontalScrollOffset').notifyPropertyChange('maximumHorizontalScrollOffset');
        this.notifyPropertyChange('minimumVerticalScrollOffset').notifyPropertyChange('maximumVerticalScrollOffset');
      }
      this.endPropertyChanges();
      this._scroll_isExogenous = NO;
    }

    // Update the priors to the currents. (Used when adjusting anchors with an additional touch.)
    this._scroll_gesturePriorX = avg.x;
    this._scroll_gesturePriorY = avg.y;
  },

  /** @private Update the scroll if still ongoing, otherwise wrap up. */
  touchEnd: function (touch) {
    var touches = touch.touchesForView(this)

    // FAST PATH: If this isn't the last touch, we're still gesture-handling.
    if (touches && touches.length) {
      this._scroll_touchGestureNeedsReinitializing = YES;
      return YES;
    }

    // FAST PATH: We never started scrolling.
    if (!this._scroll_isTouchScrolling) {
      // If the content hasn't been given a swing at the event yet (either it's been fewer than 150 ms, or
      // we're not in hand-holding mode), give it a swing.
      if (!this._scroll_touchContentHadItsChance) {
        // Run through the captureTouch pass, then failing that go the usual makeTouchResponder (touchStart) pass.
        var captured = touch.captureTouch(this, YES);
        if (!captured) {
          captured = touch.makeTouchResponder(touch.targetView, YES, this);
        }
        // If the content has captured the touch, then immediately end it. (TODO: See if there are problems with
        // beginning and ending a touch on a child view in the same run loop.)
        if (captured) {
          touch.end();
        }
        // Old touchEnd code returned respondership to any previous responders if the touch was not captured. This
        // seems wrong, because any previous responders should receive standard notice via touchCanceled that the
        // touch ended without being returned to them. If returning respondership during touchEnd (so that in this
        // one weird case they receive a touchEnd instead of a touchCancelled) turns out to be desired behavior,
        // implement it here and DOCUMENT WHY.
      }
      return YES;
    }

    // Get our positions, velocities and bounds.
    var verticalScrollOffset = this._scroll_verticalScrollOffset,
      horizontalScrollOffset = this._scroll_horizontalScrollOffset,
      scale = this._scroll_scale,
      // Scale bounds aren't cached anywhere so we grab them once.
      maximumScale = this.get('maximumScale'),
      minimumScale = this.get('minimumScale'),
      // Bounds: vertical.
      verticalMax = this._scroll_maximumVerticalScrollOffset,
      verticalMin = this._scroll_minimumVerticalScrollOffset,
      verticalIsAboveMax = verticalScrollOffset > verticalMax,
      verticalIsBelowMin = verticalScrollOffset < verticalMin,
      verticalIsOutOfBounds = verticalIsAboveMax || verticalIsBelowMin,
      // Bounds: horizontal.
      horizontalMax = this._scroll_maximumHorizontalScrollOffset,
      horizontalIsAboveMax = horizontalScrollOffset > horizontalMax,
      horizontalMin = this._scroll_minimumHorizontalScrollOffset,
      horizontalIsBelowMin = horizontalScrollOffset < horizontalMin,
      horizontalIsOutOfBounds = horizontalIsAboveMax || horizontalIsBelowMin,
      // Bounds: scale.
      scaleIsAboveMax = scale > maximumScale,
      scaleIsBelowMin = scale < minimumScale,
      scaleIsOutOfBounds = scaleIsAboveMax || scaleIsBelowMin,
      // Most importantly! We need our velocities along axes which were actively scrolling.
      avg = touch.averagedTouchesForView(this, YES),
      velocityX = this._scroll_isTouchScrollingX ? avg.velocityX : 0,
      velocityY = this._scroll_isTouchScrollingY ? avg.velocityY : 0;

    // FAST PATH: In bounds with no velocity. Just clean up and go home.
    if (!scaleIsOutOfBounds && !verticalIsOutOfBounds && !horizontalIsOutOfBounds && Math.abs(velocityX) < 0.01 && Math.abs(velocityY) < 0.01) {
      this._scsv_clearTouchCache();
      return YES;
    }

    // BEGIN SLOW PATH.

    // It would be odd if there were any animations ongoing right now, but let's clear them just to be safe.
    this._scsv_clearQueuedAnimations();

    // Convenience functions for converting between scales. (Consider exposing this on SC, with a friendlier arg order.)
    function convertScales(toScaleBottom, toScaleTop, fromScaleBottom, fromScaleVal, fromScaleTop) {
      // Algebra:
      // (scale1Val - toScaleBottom) / (toScaleTop - toScaleBottom) = (fromScaleVal - fromScaleBottom) / (fromScaleTop - fromScaleBottom)
      // scale1Val - toScaleBottom = (toScaleTop - toScaleBottom) * (fromScaleVal - fromScaleBottom) /  (fromScaleTop - fromScaleBottom)
      var scale1Val = toScaleBottom + (toScaleTop - toScaleBottom) * (fromScaleVal - fromScaleBottom) /  (fromScaleTop - fromScaleBottom);
      return scale1Val;
    };
    function convertCappedScales(toScaleBottom, toScaleTop, fromScaleBottom, fromScaleVal, fromScaleTop) {
      return Math.max(toScaleBottom, Math.min(toScaleTop, convertScales(toScaleBottom, toScaleTop, fromScaleBottom, fromScaleVal, fromScaleTop)));
    };

    // A few disposable variables used to define the animations. (`diff` is a utility player.)
    var distanceX, distanceY, distance, fromX, diffX, toX, remainderX, fromY, diffY, toY, remainderY, fromScale, toScale, diff,
      positionFraction, candidatePositionFraction, timeFraction, candidateTimeFraction,
      duration, fullDuration, candidateDuration;

    // IF WE ARE OUT OF BOUNDS ON SCALE, simply animate back in bounds. This preempts all other deceleration/bounces.
    if (scaleIsOutOfBounds) {
      fromScale = scale;
      if (scaleIsAboveMax) {
        toScale = maximumScale;
        diff = fromScale / toScale;
      } else {
        toScale = minimumScale;
        diff = toScale / fromScale;
      }
      // Duration scales from 100 to 250ms as the diff factor scales from 1 to 2.
      duration = convertScales(100, 250, 1, diff, 2);
      // duration = 100 + 150 * (diff - 1) / 1;
      duration = Math.min(250, Math.max(100, duration));

      // Quick see if we're out of offset bounds too. (Adjust the duration if we're very far out of bounds. Duration
      // scales from 100 to 350 as diff scales from 0% to 50% of the container view size.)
      // Vertical.
      if (verticalIsOutOfBounds) {
        fromY = verticalScrollOffset;
        if (verticalIsAboveMax) toY = this._scroll_maximumVerticalScrollOffset;
        else toY = this._scroll_minimumVerticalScrollOffset;
        diff = Math.abs(fromY - toY) / this._scroll_containerHeight;
        candidateDuration = convertCappedScales(100, 350, 0, diff, 0.5);
        if (candidateDuration > duration) duration = candidateDuration;
      }
      // Horizontal.
      if (horizontalIsOutOfBounds) {
        fromX = horizontalScrollOffset;
        if (horizontalIsAboveMax) toX = this._scroll_maximumHorizontalScrollOffset;
        else toX = this._scroll_minimumHorizontalScrollOffset;
        diff = Math.abs(fromX - toX) / this._scroll_containerWidth;
        candidateDuration = convertCappedScales(100, 350, 0, diff, 0.5);
        if (candidateDuration > duration) duration = candidateDuration;
      }

      // Animate!
      this._scsv_queueAnimation(fromX, toX, fromY, toY, fromScale, toScale, duration, this.get('scaleBackCurve'));
    }
    // If scale is in-bounds, proceed with a standard deceleration/bounce.
    else {
      // The deceleration/bounce is made up of (potentially) three curves: 1) a gradual in-bounds deceleration, 2) an
      // abrupt out-of-bounds deceleration, and 3) a bounce back to bounds.

      var decelerationRate = this.get('decelerationRate');

      fromX = horizontalScrollOffset;
      fromY = verticalScrollOffset;
      // Note that positive touch movements (e.g. moving downward) result in negative offsets (scroll down = move content up).
      distanceX = -velocityX * 800 * decelerationRate;
      distanceY = -velocityY * 800 * decelerationRate;
      toX = fromX + distanceX;
      toY = fromY + distanceY;
      // Get some Pythagorean action - a^2 + b^2 = c^2
      distance =  Math.pow(Math.pow(Math.abs(distanceX), 2) + Math.pow(Math.abs(distanceY), 2), 0.5);
      // Duration increases as a factor of distance.
      fullDuration = duration = distance * 8; // NEEDS FINE-TUNING

      // If either axis's initial position is out of bounds, skip animation 1 and prep for animation 2.
      if (verticalIsOutOfBounds || horizontalIsOutOfBounds) {
        positionFraction = timeFraction = 0;
      }
      // 1) If both of our axes are in-bounds, we do a gradual deceleration. If that deceleration would take us out of
      // bounds, we truncate it in preparation for step 2.
      else {
        positionFraction = timeFraction = 1; // Represents an unclipped, fully in-bounds animation.
        // If either end-value is out of bounds, we need to truncate the animation.
        if (toX < horizontalMin || toX > horizontalMax || toY < verticalMin || toY > verticalMax) {
          // Horizontal out of bounds
          if (toX < horizontalMin || toX > horizontalMax) {
            // Reset toX to the bound.
            if (toX < horizontalMin) toX = horizontalMin;
            else if (toX > horizontalMax) toX = horizontalMax;
            // Figure out what fraction of the distance we've lopped off.
            candidatePositionFraction = Math.abs((fromX - toX) / distanceX);
            if (candidatePositionFraction < positionFraction) positionFraction = candidatePositionFraction;
          }
          // If horizontal ends in-bounds, we will have used all our horizontal velocity on animation 1.
          else {
            velocityX = 0;
          }
          // Vertical out of bounds
          if (toY < verticalMin || toY > verticalMax) {
            // Reset toY to the bound.
            if (toY < verticalMin) toY = verticalMin;
            else if (toY > verticalMax) toY = verticalMax;
            // Figure out what fraction of the distance we've lopped off.
            candidatePositionFraction = Math.abs((fromY - toY) / distanceY);
            if (candidatePositionFraction < positionFraction) positionFraction = candidatePositionFraction;
          }
          // If vertical ends in-bounds, we will have used all our vertical velocity on animation 1.
          else {
            velocityY = 0;
          }
          // Now that we have our position cutoff, convert it to the time cutoff.
          var inverseCurve = this.get('_scsv_decelerationCurveInverse');
          timeFraction = inverseCurve(positionFraction);
          duration = fullDuration * timeFraction;
        }
        // If nobody ends out of bounds, we've used up all our velocity on both vectors. No need for further animations.
        else {
          velocityX = velocityY = 0;
        }

        // Animate!
        this._scsv_queueAnimation(fromX, toX, fromY, toY, null, null, duration, this.get('decelerationCurve'), null, timeFraction);

        // Reset values and flags for the (potential) next animation.
        horizontalScrollOffset = toX;
        verticalScrollOffset = toY;
        velocityX *= 1 - positionFraction;
        velocityY *= 1 - positionFraction;
        // Reset bound checks.
        verticalIsAboveMax = verticalScrollOffset > verticalMax;
        verticalIsBelowMin = verticalScrollOffset < verticalMin;
        verticalIsOutOfBounds = verticalIsAboveMax || verticalIsBelowMin;
        horizontalIsAboveMax = horizontalScrollOffset > horizontalMax;
        horizontalIsBelowMin = horizontalScrollOffset < horizontalMin;
        horizontalIsOutOfBounds = horizontalIsAboveMax || horizontalIsBelowMin;
      }

      // 2) If we're at or out of bounds, and have velocity heading out, we add an abrupt deceleration.
      // Minor note: These values are inclusive, rather than exclusive, of the bounds. If we're at the
      // bound (coincidentally or because of animation #1) and we have velocity then we need to burn it
      // on a bounce.
      // Horizontal out of bounds...
      var horizontalIsAboveMaxAndHeadingOut = (horizontalScrollOffset === horizontalMax || horizontalIsAboveMax) && velocityX < 0,
        horizontalIsBelowMinAndHeadingOut = (horizontalScrollOffset === horizontalMin || horizontalIsBelowMin) && velocityX > 0,
        horizontalIsOutOfBoundsAndHeadingOut = horizontalIsAboveMaxAndHeadingOut || horizontalIsBelowMinAndHeadingOut,
        // ...but not too far out of bounds
        horizontalIsTooFarPastMax = horizontalScrollOffset >= horizontalMax + (this._scroll_containerWidth / 2),
        horizontalIsTooFarPastMin = horizontalScrollOffset <= horizontalMin - (this._scroll_containerWidth / 2),
        horizontalIsOutOfBoundsButNotTooFarAndHeadingOut = horizontalIsOutOfBoundsAndHeadingOut && !horizontalIsTooFarPastMax && !horizontalIsTooFarPastMin,
        // Vertical out of bounds...
        verticalIsAboveMaxAndHeadingOut = (verticalScrollOffset === verticalMax || verticalIsAboveMax) && velocityY < 0,
        verticalIsBelowMinAndHeadingOut = (verticalScrollOffset === verticalMin || verticalIsBelowMin) && velocityY > 0,
        verticalIsOutOfBoundsAndHeadingOut = verticalIsAboveMaxAndHeadingOut || verticalIsBelowMinAndHeadingOut,
        // ...but not too far out of bounds
        verticalIsTooFarPastMax = verticalScrollOffset >= verticalMax + (this._scroll_containerHeight / 2),
        verticalIsTooFarPastMin = verticalScrollOffset <= verticalMin - (this._scroll_containerHeight / 2),
        verticalIsOutOfBoundsButNotTooFarAndHeadingOut = verticalIsOutOfBoundsAndHeadingOut && !verticalIsTooFarPastMax && !verticalIsTooFarPastMin;

      if (horizontalIsOutOfBoundsButNotTooFarAndHeadingOut || verticalIsOutOfBoundsButNotTooFarAndHeadingOut) {
        // Null out the reusable variables.
        fromX = toX = fromY = toY = null;
        duration = 0;

        var bounceCoefficient = this.get('bounceCoefficient');

        // Decelerate horizontal:
        // If we're out of bounds (but not too far) and heading out...
        if (horizontalIsOutOfBoundsButNotTooFarAndHeadingOut) {
          fromX = horizontalScrollOffset;
          distanceX = velocityX * 40 * bounceCoefficient;
          toX = fromX - distanceX;
          // Cap the destination at half the container width out of bounds.
          if (toX > horizontalMax) toX = Math.min(toX, horizontalMax + (this._scroll_containerWidth / 2));
          else toX = Math.max(toX, horizontalMin - (this._scroll_containerWidth / 2));
          // Duration scales from 100 to 200 as the diff scales from 10% to 50% of the container's size, UNLESS we're
          // starting all the way out of bounds, in which case it scales from 0 to 200.
          diff = Math.abs(fromX - toX) / this._scroll_containerWidth;
          if (horizontalIsOutOfBounds) duration = convertCappedScales(0, 200, 0.1, diff, 0.5);
          else duration = convertCappedScales(100, 200, 0.1, diff, 0.5);
          velocityX = 0;
          horizontalScrollOffset = toX;
        }
        // Otherwise, if we're in-bounds with velocity we need to contribute a little more to the effort.
        // TODO: THIS ISN'T WORKING YET
        else if (!horizontalIsOutOfBounds && velocityX) {
          toX = horizontalScrollOffset - (duration * velocityX * 0.35); // TUNE POINT
          toX = Math.min(horizontalMax, Math.max(horizontalMin, toX));
          verticalScrollOffset = toY;
        }

        // Decelerate vertical:
        // If we're out of bounds (but not too far) and heading out...
        if (verticalIsOutOfBoundsButNotTooFarAndHeadingOut) {
          fromY = verticalScrollOffset;
          distanceY = velocityY * 40 * bounceCoefficient;
          toY = fromY - distanceY;
          // Cap the destination at half the container height out of bounds.
          if (toY > verticalMax) toY = Math.min(toY, verticalMax + (this._scroll_containerHeight / 2));
          else toY = Math.max(toY, verticalMin - (this._scroll_containerHeight / 2));
          // Duration scales from 100 to 200 as the diff scales from 10% to 50% of the container's size, UNLESS we're
          // starting all the way out of bounds, in which case it scales from 0 to 200.
          diff = Math.abs(fromY - toY) / this._scroll_containerHeight;
          if (verticalIsOutOfBounds) candidateDuration = convertCappedScales(0, 200, 0.1, diff, 0.5);
          else candidateDuration = convertCappedScales(100, 200, 0.1, diff, 0.5);
          if (candidateDuration > duration) duration = candidateDuration;
          velocityY = 0;
          verticalScrollOffset = toY;
        }
        // Otherwise, if we're in-bounds we need to contribute a little more to the effort.
        // TODO: THIS ISN'T WORKING YET
        else if (!verticalIsOutOfBounds && velocityY) {
          toY = verticalScrollOffset - (duration * velocityY * 0.35); // TUNE POINT
          toY = Math.min(verticalMax, Math.max(verticalMin, toY));
          verticalScrollOffset = toY;
        }

        // Animate!
        this._scsv_queueAnimation(fromX, toX, fromY, toY, null, null, duration, this.get('bounceCurve'));

        // Reset bound checks.
        verticalIsAboveMax = verticalScrollOffset > verticalMax;
        verticalIsBelowMin = verticalScrollOffset < verticalMin;
        verticalIsOutOfBounds = verticalIsAboveMax || verticalIsBelowMin;
        horizontalIsAboveMax = horizontalScrollOffset > horizontalMax;
        horizontalIsBelowMin = horizontalScrollOffset < horizontalMin;
        horizontalIsOutOfBounds = horizontalIsAboveMax || horizontalIsBelowMin;
      }

      // 3) If we are (or will end up) out of bounds, bounce back.
      if (verticalIsOutOfBounds || horizontalIsOutOfBounds) {
        duration = 0;
        // Vertical bounce
        if (verticalIsOutOfBounds) {
          fromY = verticalScrollOffset;
          if (verticalIsAboveMax) toY = verticalMax;
          else toY = verticalMin;
          // Duration scales from 250 to 500 as the diff scales from 0% to 50% of the container's size.
          diff = Math.abs(fromY - toY) / this._scroll_containerHeight;
          duration = convertCappedScales(250, 500, 0, diff, 0.5);
        }
        // Horizontal bounce
        if (horizontalIsOutOfBounds) {
          fromX = horizontalScrollOffset;
          if (horizontalIsAboveMax) toX = horizontalMax;
          else toX = horizontalMin;
          // Duration scales from 250 to 500 as the diff scales from 0% to 50% of the container's size.
          diff = Math.abs(fromX - toX) / this._scroll_containerWidth;
          candidateDuration = convertCappedScales(250, 500, 0, diff, 0.5);
          if (candidateDuration > duration) duration = candidateDuration;
        }
        // If either dimension is in-bounds and has velocity, it will need to contribute a little more
        // forward momentum to the effort.
        if (!verticalIsOutOfBounds && velocityY) {
          toY = verticalScrollOffset - (duration * velocityY * 0.35); // TUNE POINT
          toY = Math.min(verticalMax, Math.max(verticalMin, toY));
        }
        if (!horizontalIsOutOfBounds && velocityX) {
          toX = horizontalScrollOffset - (duration * velocityX * 0.35); // TUNE POINT
          toX = Math.min(horizontalMax, Math.max(horizontalMin, toX));
        }

        // Animate!
        this._scsv_queueAnimation(fromX, toX, fromY, toY, null, null, duration, this.get('bounceBackCurve'));
      }
    }

    // Clear the cache.
    this._scsv_clearTouchCache();

    return YES;
  },

  /** @private
    If we're in hand-holding mode and our content claims the touch, we will receive a touchCancelled
    event at its completion. All we need to do is clean up if we're the last ones out.
  */
  touchCancelled: function (touch) {
    var touches = touch.touchesForView(this);
    // If this is the last touch, clear the cached values.
    if (!touches || !touches.length) {
      this._scsv_clearTouchCache();
    }
    return YES;
  },

  _scsv_clearTouchCache: function() {
    this._scroll_touchContentHadItsChance = NO;
    this._scroll_touchGestureIsInitialized = NO;
    this._scroll_touchGestureNeedsReinitializing = NO;
    this._scroll_isTouchScrolling = NO;
    this._scroll_isTouchScrollingX = NO;
    this._scroll_isTouchScrollingY = NO;
    this._scroll_isTouchScaling = NO;
    this._scroll_latestTouchID = 0;
    this._scroll_globalContainerFrame = null;
    this._scroll_gestureAnchorX = null;
    this._scroll_gestureAnchorY = null;
    this._scroll_gestureAnchorD = null;
    this._scroll_gesturePriorX = null;
    this._scroll_gesturePriorY = null;
    this._scroll_gestureAnchorVerticalOffset = null;
    this._scroll_gestureAnchorHorizontalOffset = null;
    this._scroll_gestureAnchorScale = null;
    this._scroll_gestureAnchorContentWidth = null;
    this._scroll_gestureAnchorContentHeight = null;
  },

  // (Once these are locked in, I'll move them down to the bottom with the rest.)
  _scroll_touchContentHadItsChance: NO,
  _scroll_touchGestureIsInitialized: NO,
  _scroll_touchGestureNeedsReinitializing: NO,
  _scroll_isTouchScrolling: NO,
  _scroll_isTouchScrollingX: NO,
  _scroll_isTouchScrollingY: NO,
  _scroll_isTouchScaling: NO,
  _scroll_latestTouchID: 0,
  _scroll_globalContainerFrame: null,
  _scroll_gestureAnchorX: null,
  _scroll_gestureAnchorY: null,
  _scroll_gestureAnchorD: null,
  _scroll_gesturePriorX: null,
  _scroll_gesturePriorY: null,
  _scroll_gestureAnchorVerticalOffset: null,
  _scroll_gestureAnchorHorizontalOffset: null,
  _scroll_gestureAnchorScale: null,
  _scroll_gestureAnchorContentWidth: null,
  _scroll_gestureAnchorContentHeight: null,

  // ..........................................................
  // Internal Animation Support
  //

  // Used by touch deceleration, and a future so-far unimplemented animated scrollTo.
  // Note: It may be possible to run the animations via CSS, however, we would have to ensure that stuff on
  // the JavaScript side (e.g. clipping frame calculations, or interrupted animations) sync up with wherever
  // the animation is at that precise moment, even under suboptimal circumstances. I expect this to be an
  // unsolvable problem. - DCP

  /** @private
    Holds the current list of executing animations. The zeroth animation is currently running or about to
    start; subsequent ones are queued to engage sequentially afterwards.
  */
  _scroll_queuedAnimations: [],

  /** @private Clears all currently-running or queued animations. */
  _scsv_clearQueuedAnimations: function() {
    this._scroll_queuedAnimations.length = 0;
  },

  /** @private
    Sets up a new scroll animation to run at the end of the current queue.

    @param {?Number} fromX The animation's starting horizontal offset. Defaults to the offset at start time.
    @param {?Number} toX The animation's ending horizontal offset. Defaults to no change.
    @param {?Number} fromY The animation's starting vertical offset. Defaults to the offset at start time.
    @param {?Number} toY The animation's ending vertical offset. Defaults to no change.
    @param {?Number} fromScale The animation's starting scale. Defaults to the scale at start time.
    @param {?Number} toScale The animation's ending scale. Defaults to no change.
    @param {Number} durationInMS The number of milliseconds that the animation should take.
    @param {Function|String} timingFunction The animation's timing function, or the CSS transition timing function
      name. The function should take a fractional (0-1) elapsed time as its single argument, and should return a
      fractional (0-1) offset. For example, a linear animation that is half over would take 0.5 as its argument and
      would return 0.5. Default timing functions are available on SC.SCROLL.TIMING; you can create custom Bezier
      timing functions by calling SC._BezierEasing(p1, p2, p3, p4).
    @param {?Number} startFraction If only part of the timing curve should be animated, you can specify the fraction
      at which it should begin. Defaults to 0. (Note that this clips the curve, not the duration.)
    @param {?Number} endFraction If only part of the timing curve should be animated, you can specify the fraction
      at which it should begin. Defaults to 1. (Note that this clips the curve, not the duration.)
  */
  _scsv_queueAnimation: function(fromX, toX, fromY, toY, fromScale, toScale, durationInMs, timingFunction, startFraction, endFraction) {
    if (SC.typeOf(timingFunction) === SC.T_STRING) {
      timingFunction = SC._BezierEasing.css[timingFunction];
    }
    //@if(debug)
    // Provide some developer support for bad timingFunction strings.
    if (SC.typeOf(timingFunction) !== SC.T_FUNCTION) {
      SC.error("You must pass a timing function or specify a css timing function by name in order to animate SC.ScrollView.");
    }
    //@endif

    // Get default start and end fractions.
    if (SC.none(startFraction)) startFraction = 0;
    if (SC.none(endFraction)) endFraction = 1;

    // Generate animation spec.
    var animation = {
      isInitialized: NO,
      // Start values
      fromHorizontalScrollOffset: SC.none(fromX) ? null : fromX,
      fromVerticalScrollOffset: SC.none(fromY) ? null : fromY,
      fromScale: SC.none(fromScale) ? null : fromScale,
      // End values
      toHorizontalScrollOffset: SC.none(toX) ? null : toX,
      toVerticalScrollOffset: SC.none(toY) ? null : toY,
      toScale: SC.none(toScale) ? null : toScale,
      // Timing
      duration: durationInMs,
      timingFunction: timingFunction,
      startFraction: startFraction,
      startFractionPosition: timingFunction(startFraction),
      endFraction: endFraction,
      endFractionPosition: timingFunction(endFraction),
      startTime: null,
      endTime: null
    };

    // Queue it up.
    this._scroll_queuedAnimations.push(animation);

    // Kick off the animation loop if needed.
    this.invokeLast(this.adjustElementScroll);
  },

  // ..........................................................
  // INTERNAL SUPPORT
  //

  /** @private */
  init: function () {
    sc_super();

    // start observing initial content view.  The content view's frame has
    // already been setup in prepareDisplay so we don't need to call
    // viewFrameDidChange...
    this._scroll_contentView = this.get('contentView');
    var contentView = this._scroll_contentView;

    if (contentView) {
      contentView.addObserver('frame', this, 'contentViewFrameDidChange');
      contentView.addObserver('calculatedWidth', this, 'contentViewFrameDidChange');
      contentView.addObserver('calculatedHeight', this, 'contentViewFrameDidChange');
      contentView.addObserver('layer', this, 'contentViewLayerDidChange');
    }

    // Register this with SC.Drag for autoscrolling.
    if (this.get('isVisibleInWindow')) this._sc_registerAutoscroll();
  },

  /** @private */
  destroy: function() {
    sc_super();
    if (this._scroll_animationID) cancelAnimationFrame(this._scroll_animationID);
  },

  /** @private
    If we redraw after the initial render, we need to make sure that we reset
    the scroll transform properties on the content view.  This ensures
    that, for example, the scroll views displays correctly when switching
    views out in a ContainerView.
  */
  render: function (context, firstTime) {
    this.invokeLast(this.adjustElementScroll);

    if (firstTime) {
      context.push('<div class="corner"></div>');
    }
    return sc_super();
  },

  /** @private
    Instantiate scrollers & container views as needed.  Replace their classes
    in the regular properties.
  */
  createChildViews: function () {
    var childViews = [], view;

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
          allowOutlyingValues: YES,
          valueBinding: '*owner.horizontalScrollOffset',
          // Make sure to pipe user events through to us correctly, so that we can recalculate scale origins.
          mouseDown: function() {
            this.get('owner')._scroll_isExogenous = YES;
            if (sc_super()) {
              return YES;
            } else {
              this.get('owner')._scroll_isExogenous = NO;
              return NO;
            }
          },
          mouseUp: function() {
            var ret = sc_super();
            this.get('owner')._scroll_isExogenous = NO;
          }
        });
        childViews.push(view);
      } else this.horizontalScrollerView = null;
    }

    // create a vertical scroller view if needed...
    view = SC.platform.touch ? this.get("verticalTouchScrollerView") : this.get("verticalScrollerView");
    if (view) {
      if (this.get('hasVerticalScroller')) {
        view = this.verticalScrollerView = this.createChildView(view, {
          layoutDirection: SC.LAYOUT_VERTICAL,
          allowOutlyingValues: YES,
          valueBinding: '*owner.verticalScrollOffset',
          // Make sure to pipe user events through to us correctly, so that we can recalculate scale origins.
          mouseDown: function() {
            this.get('owner')._scroll_isExogenous = YES;
            if (sc_super()) {
              return YES;
            } else {
              this.get('owner')._scroll_isExogenous = NO;
              return NO;
            }
          },
          mouseUp: function() {
            var ret = sc_super();
            this.get('owner')._scroll_isExogenous = NO;
          }
        });
        childViews.push(view);
      } else this.verticalScrollerView = null;
    }

    // set childViews array.
    this.childViews = childViews;
  },

  didCreateLayer: function() {
    // We have to invoke-last this because at this precise moment, we're in "rendered" state but our
    // children are not. (See GitHub Issue #1269.)
    this.invokeLast(this._scsv_didCreateLayer);
  },
  _scsv_didCreateLayer: function() {
    // Set initial scale and alignment values.
    this._scroll_horizontalScaleOrigin = this.get('initialHorizontalAlign');
    this._scroll_horizontalScaleOriginPct = 0.5;
    this._scroll_verticalScaleOrigin = this.get('initialVerticalAlign');
    this._scroll_verticalScaleOriginPct = 0.5;

    this._scsv_scaleDidChange(); // set up initial scale and alignment
    this.tile(); // set up initial tiling (scaleDidChange doesn't call tile 100% of time)
  },

  /** @private
    Registers/deregisters view with SC.Drag for autoscrolling
  */
  _sc_registerAutoscroll: function () {
    if (this.get('isVisibleInWindow')) SC.Drag.addScrollableView(this);
    else SC.Drag.removeScrollableView(this);
  }.observes('isVisibleInWindow'),

  /** @private
    Whenever the contentView is changed, we need to observe the content view's
    frame to be notified whenever it's size changes.
  */
  contentViewDidChange: function () {
    var newView = this.get('contentView'),
        oldView = this._scroll_contentView;

    if (newView !== oldView) {

      // stop observing old content view
      if (oldView) {
        oldView.removeObserver('calculatedWidth', this, 'contentViewFrameDidChange');
        oldView.removeObserver('calculatedHeight', this, 'contentViewFrameDidChange');
        oldView.removeObserver('frame', this, 'contentViewFrameDidChange');
        oldView.removeObserver('layer', this, 'contentViewLayerDidChange');
      }

      // update cache
      this._scroll_contentView = newView;

      // Start observing new view
      if (newView) {
        newView.addObserver('frame', this, 'contentViewFrameDidChange');
        newView.addObserver('calculatedWidth', this, 'contentViewFrameDidChange');
        newView.addObserver('calculatedHeight', this, 'contentViewFrameDidChange');
        newView.addObserver('layer', this, 'contentViewLayerDidChange');
      }

      // replace in container
      this.containerView.set('contentView', newView);

      // Kick off the "things changed" cascade. (Conveniently, scaleDidChange handles everything
      // we need.)
      this._scsv_scaleDidChange();
    }
  }.observes('contentView'),

  /** @private
    Invoked whenever the contentView's frame changes.  This will update the
    scroller maximum and optionally update the scroller visibility if the
    size of the contentView changes.
  */
  contentViewFrameDidChange: function () {
    if (this.viewState === SC.View.UNRENDERED) {
      return;
    }

    // FAST PATH: Mid-scale. Running this code during a touch scale (i.e. at every frame) results in a pretty
    // big performance hit, and a number of unsquashed bugs. Ultimately, the best approach will be to fix the
    // bugs and improve the performance across the board.
    if (this._scroll_isTouchScaling) {
      return;
    }

    var view   = this.get('contentView'),
        f      = (view) ? view.get('frame') : null,
        scale  = this.get('scale'),
        width, height,
        calculatedWidth, calculatedHeight,
        dim, dimWidth, dimHeight;

    // FAST PATH: No view, or view with no frame.
    if (!view || !f) { return; }

    // Note that calculatedWidth is in the view's internal (unscaled) space, while its frame is in our
    // external (scale-already-applied) space.
    width = (view.get('calculatedWidth') * scale) || f.width || 0;
    height = (view.get('calculatedHeight') * scale) || f.height || 0;

    dim       = this.getPath('containerView.frame');
    dimWidth  = dim.width;
    dimHeight = dim.height;

    // FAST PATH: container and content view sizes haven't changed.
    if (
      width === this._scroll_contentWidth &&
      height === this._scroll_contentHeight &&
      dimWidth === this._scroll_containerWidth &&
      dimHeight === this._scroll_containerHeight
    ) {
      return;
    }
    // Update our scroll value caches...
    this._scroll_contentWidth = width;
    this._scroll_contentHeight = height;
    this._scroll_containerWidth = dimWidth;
    this._scroll_containerHeight = dimHeight;

    // Scroller visibility and values
    // Horizontal
    if (this.get('hasHorizontalScroller') && (view = this.get('horizontalScrollerView'))) {
      // decide if it should be visible or not. (We bend over backwards to only change if needed
      // because if it changes we will need to recalculate size for the vertical scroller.)
      if (this.get('autohidesHorizontalScroller')) {
        this.setIfChanged('isHorizontalScrollerVisible', width > dimWidth);
      }
      view.setIfChanged('maximum', width - dimWidth);
      view.setIfChanged('proportion', dimWidth / width);
    }
    // Vertical
    if (this.get('hasVerticalScroller') && (view = this.get('verticalScrollerView'))) {
      // decide if it should be visible or not
      if (this.get('autohidesVerticalScroller')) {
        this.setIfChanged('isVerticalScrollerVisible', height > dimHeight);
      }
      view.setIfChanged('maximum', height - dimHeight);
      view.setIfChanged('proportion', dimHeight / height);
    }

    // If there is no scroller and auto-hiding is on, scroll to the minimum offset.
    if (!this.get('isVerticalScrollerVisible') && this.get('autohidesVerticalScroller')) {
      // this.set('verticalScrollOffset', this.get('minimumVerticalScrollOffset'));
    }
    if (!this.get('isHorizontalScrollerVisible') && this.get('autohidesHorizontalScroller')) {
      // this.set('horizontalScrollOffset', this.get('minimumHorizontalScrollOffset'));
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
      // Update the position of the content view to fit.
      this.forceDimensionsRecalculation(forceWidth, forceHeight, vOffSet, hOffSet);
    } else {
      // Reapply the position.
      this.invokeLast(this.adjustElementScroll);
    }

    // send change notifications since they don't invalidate automatically
    this.notifyPropertyChange('maximumVerticalScrollOffset');
    this.notifyPropertyChange('maximumHorizontalScrollOffset');
  },

  /** @private
    If our frame changes, then we need to re-calculate the visibility of our
    scrollers, et cetera.
  */
  frameDidChange: function () {
    this._scroll_contentWidth = this._scroll_contentHeight = this._scroll_containerHeight = this._scroll_containerWidth = null;
    this.contentViewFrameDidChange();
  }.observes('frame'),

  /** @private
    Adjusts the layout for the various internal views.  This method is called
    once when the scroll view is first configured and then anytime a scroller
    is shown or hidden.  You can call this method yourself as well to retile.

    You may also want to override this method to handle layout for any
    additional controls you have added to the view.
  */
  tile: function () {
    if (this.viewState === SC.View.UNRENDERED) {
      return;
    }

    // Get scroller views and determine if we should have a scroller on each axis.
    var hscroll = this.get('hasHorizontalScroller') ? this.get('horizontalScrollerView') : null,
      hasHorizontal = hscroll && this.get('isHorizontalScrollerVisible'),
      vscroll = this.get('hasVerticalScroller') ? this.get('verticalScrollerView') : null,
      hasVertical = vscroll && this.get('isVerticalScrollerVisible'),
      // Initialize the layouts.
      containerLayout = { left: 0, top: 0, right: 0, bottom: 0 },
      scrollerLayout, vl, hl,
      hThickness = hasHorizontal ? hscroll.get('scrollbarThickness') : 0,
      vThickness = hasVertical ? vscroll.get('scrollbarThickness') : 0,
      // We need to know if any guttered scrollers appear or disappear.
      hasHorizontalGutter = NO,
      hasVerticalGutter = NO;

    // Horizontal.
    if (hasHorizontal) {
      hl = this.get('horizontalScrollerLayout');
      scrollerLayout = {
        left: (hl ? hl.left : 0),
        bottom: (hl ? hl.bottom : 0),
        right: (hl ? hl.right + vThickness - 1 : vThickness - 1),
        height: hThickness
      };
      hscroll.set('layout', scrollerLayout);

      // If the scroller is guttered instead of overlaid, adjust the container's layout.
      if (!this.get('horizontalOverlay')) {
        containerLayout.bottom = scrollerLayout.bottom + hThickness;
        hasHorizontalGutter = YES;
      }
    }
    if (hscroll) {
      hscroll.set('isVisible', hasHorizontal);
      this._sc_fadeOutHorizontalScroller();
    }

    // Vertical.
    if (hasVertical) {
      hThickness = hThickness + this.get('verticalScrollerBottom');
      vl = this.get('verticalScrollerLayout');
      scrollerLayout = {
        top: (vl ? vl.top : 0),
        bottom: (vl ? vl.bottom + hThickness : hThickness),
        right: (vl ? vl.right : 0),
        width: vThickness
      };
      vscroll.set('layout', scrollerLayout);

      // If the scroller is guttered instead of overlaid, adjust the container's layout.
      if (!this.get('verticalOverlay')) {
        containerLayout.right = scrollerLayout.right + vThickness;
        hasVerticalGutter = YES;
      }
    }
    if (vscroll) {
      vscroll.set('isVisible', hasVertical);
      this._sc_fadeOutVerticalScroller();
    }

    // Adjust our container view.
    this.get('containerView').adjust(containerLayout);

    // If either of our scrollers live in gutters and have appeared or disappeared, we need to ping the layout people.
    if (hasHorizontalGutter !== this._scroll_hasHorizontalGutter || hasVerticalGutter !== this._scroll_hasVerticalGutter) {
      this.frameDidChange();
      this._scroll_hasHorizontalGutter = hasHorizontalGutter;
      this._scroll_hasVerticalGutter = hasVerticalGutter;
    }

  },

  /** @private
    Whenever a scroller's visibility changes, we have to re-tile the views.
  */
  scrollerVisibilityDidChange: function () {
    this.invokeOnce(this.tile);
  }.observes('isVerticalScrollerVisible', 'isHorizontalScrollerVisible'),

  /** @private
    Whenever the scale changes, we need to reposition our offsets around the
    current scale origin, and recalculate the visibility of our scrollers et
    cetera.
  */
  _scsv_scaleDidChange: function() {
    if (this.viewState === SC.View.UNRENDERED) {
      return;
    }

    // FAST PATH: no content, nothing to do.
    if (!this.get('contentView')) return;

    // FAST PATH: if the content view is taking care of everything, just pass this along to adjustElementScroll.
    if (this.getPath('contentView.isScalable')) {
      this.invokeLast(this.adjustElementScroll);
      return;
    }

    // FAST PATH: If we're in the middle of a user event, just pass this along to adjustElementScroll.
    if (this._scroll_isExogenous) {
      this.invokeLast(this.adjustElementScroll);
      return;
    }

    // SLOW PATH.
    // Get our alignments.
    var horizontalOrigin = this._scroll_horizontalScaleOrigin,
      verticalOrigin = this._scroll_verticalScaleOrigin,
      // Only need the center sometimes, but grab it now anyways.
      hCenterPct = this._scroll_horizontalScaleOriginPct,
      vCenterPct = this._scroll_verticalScaleOriginPct;

    // Translate DEFAULT into the actual defaults.
    if (horizontalOrigin === SC.ALIGN_DEFAULT) horizontalOrigin = this.get('horizontalAlign');
    if (verticalOrigin === SC.ALIGN_DEFAULT) verticalOrigin = this.get('verticalAlign');

    // Let the content view know that its frame has changed. (This will trigger all the downstream recalculations
    // on this view as well, via contentViewFrameDidChange.)
    this.get('contentView').notifyPropertyChange('frame');
    this.tile(); // have to tile immediately

    // Continue our scale-origin adjustments.
    // That triggered a recalculation of our offset bounds, so we can now tweak the offsets to the
    // new bounds to achieve the scale origin effect we're looking for.
    // Horizontal
    switch (horizontalOrigin) {
      case SC.ALIGN_LEFT:
        this.set('horizontalScrollOffset', this.get('minimumHorizontalScrollOffset'));
        break;
      case SC.ALIGN_RIGHT:
        this.set('horizontalScrollOffset', this.get('maximumHorizontalScrollOffset'));
        break;
      default:
        // We know what %age of the way across that we want to position the new center, so we reverse the
        // earlier calculation with the new maximum.
        var newHOffset = ((this.get('maximumHorizontalScrollOffset') + this._scroll_containerWidth) * hCenterPct) - (this._scroll_containerWidth / 2);
        this.set('horizontalScrollOffset', newHOffset);
    }
    // Vertical
    switch (verticalOrigin) {
      case SC.ALIGN_TOP:
        this.set('verticalScrollOffset', this.get('minimumVerticalScrollOffset'));
        break;
      case SC.ALIGN_BOTTOM:
        this.set('verticalScrollOffset', this.get('maximumVerticalScrollOffset'));
        break;
      default:
        // We know what %age of the way down that we want to position the new center, so we reverse the
        // earlier calculation with the new maximum.
        var newVOffset = ((this.get('maximumVerticalScrollOffset') + this._scroll_containerHeight) * vCenterPct) - (this._scroll_containerHeight / 2);
        this.set('verticalScrollOffset', newVOffset);
    }
  }.observes('scale'),

  /** @private
    If the layer of the content view changes, we need to readjust the
    transforms on the new DOM element.
  */
  contentViewLayerDidChange: function () {
    this._scroll_contentLayerChangedSinceLastUpdate = YES;
    this.invokeLast(this._scsv_adjustElementScroll);
  },

  /** @private
    Whenever the alignment changes, we need to poke the offset so that it recalculates
    within the new bounds.
  */
  _scsv_horizontalAlignmentDidChange: function () {
    this.notifyPropertyChange('horizontalScrollOffset');
    this.set('horizontalScrollOffset', this.get('horizontalScrollOffset'));
  }.observes('horizontalAlign'),

  /** @private
    Whenever the alignment changes, we need to poke the offset so that it recalculates
    within the new bounds.
  */
  _scroll_verticalAlignmentDidChange: function () {
    this.notifyPropertyChange('verticalScrollOffset');
    this.set('verticalScrollOffset', this.get('verticalScrollOffset'));
  }.observes('verticalAlign'),

  /** @private
    Whenever the scroll offsets change, update the scrollers and adjust the location
    of the content view.
  */
  _scroll_scrollOffsetsDidChange: function () {
    this.invokeLast(this.adjustElementScroll);
    this.invokeLast(this._sc_fadeInScrollers);
  }.observes('horizontalScrollOffset', 'verticalScrollOffset'),

  /** @private
    Called at the end of the run loop to actually adjust the element's scroll positioning.
  */
  adjustElementScroll: function () {
    if (!this._scroll_animationID) {
      // Run, since we're already in a run loop. This will also kick off subsequent frames.
      this._scsv_adjustElementScroll();
    }
  },

  /** @private
    This method actually does the scroll element adjusting.
  */
  _scsv_adjustElementScroll: function() {
    // Bookkeep.
    this._scroll_animationID = null;

    var contentView = this.get('contentView');

    // FAST PATH: Nothing to scroll.
    if (!contentView) return;

    var verticalScrollOffset = this.get('verticalScrollOffset'),
      horizontalScrollOffset = this.get('horizontalScrollOffset'),
      scale = this.get('scale');

    // FAST PATH: Nothing changed since our last render, and no animations queued.
    if (
      // If no changes to scale and offsets...
      verticalScrollOffset === this._scroll_lastRenderedVerticalScrollOffset &&
      horizontalScrollOffset === this._scroll_lastRenderedHorizontalScrollOffset &&
      scale === this._scroll_lastRenderedScale &&
      // And no running animations...
      !this._scroll_queuedAnimations.length &&
      // And it's the same layer...
      !this._scroll_contentLayerChangedSinceLastUpdate
    ) {
      // ...then there's no need for an update.
      return;
    }

    // (If we're handling a content layer change, we need to unflag the need for it.)
    this._scroll_contentLayerChangedSinceLastUpdate = NO;

    // We notify the content view that its frame property has changed before we actually update the position.
    // This gives views that use incremental rendering a chance to render newly-appearing elements before
    // they come into view.
    if (contentView._viewFrameDidChange) {
      contentView._viewFrameDidChange()
    }

    var transformAttribute = SC.browser.experimentalStyleNameFor('transform');

    // If transform is not supported (basically IE8), we fall back on margin.
    if (transformAttribute === SC.UNSUPPORTED) {
      var containerView = this.get('containerView');
      var containerViewLayer = containerView.get('layer');
      containerViewLayer.style.marginLeft = -horizontalScrollOffset + 'px';
      containerViewLayer.style.marginTop = -verticalScrollOffset + 'px';
      if (contentView.isScalable) {
        contentView.applyScale(scale);
      } else {
        // (If transforms aren't supported then scale isn't either, and is unlikely to be supported in
        // the future.)
      }
    }
    // Otherwise, we proceed with proper modern transforms!
    else {
      // Constrain the offsets to full (actual) pixels to prevent blurry text et cetera. Note that this assumes
      // that the scroll view itself is living at a scale of 1, and may give blurry subpixel results if scaled.
      var pixelRatio = 1 / (window.devicePixelRatio || 1);
      verticalScrollOffset = Math.round(verticalScrollOffset/pixelRatio) * pixelRatio;
      horizontalScrollOffset = Math.round(horizontalScrollOffset/pixelRatio) * pixelRatio;

      var transformStyle = 'translateX(' + (-horizontalScrollOffset) + 'px) translateY(' + (-verticalScrollOffset) + 'px)';

      // If the platform supports 3D transforms, let's add the z translation (tricks some browsers into moving it onto
      // the graphics card).
      if (SC.platform.get('supportsCSS3DTransforms')) { transformStyle += ' translateZ(0)'; }

      // Apply scale.
      if (contentView.isScalable) {
        contentView.applyScale(scale);
      } else {
        transformStyle += ' scale(' + scale + ')';
      }

      // Assign style to the content.
      var contentViewLayer = contentView.get('layer'),
        transformOriginAttribute;
      if (contentViewLayer) {
        // (We don't optimize by applying transform origin only when needed, because browsers translate 'top left'
        // into other values inconsistently; e.g. "0% 0%" for webkit and "left top 0%" in gecko.)
        contentViewLayer.style[SC.browser.experimentalStyleNameFor('transformOrigin')] = 'top left';
        contentViewLayer.style[transformAttribute] = transformStyle;
      }
    }

    // Update the last-rendered numbers.
    this._scroll_lastRenderedVerticalScrollOffset = this._scroll_verticalScrollOffset;
    this._scroll_lastRenderedHorizontalScrollOffset = this._scroll_horizontalScrollOffset;
    this._scroll_lastRenderedScale = this._scroll_scale;

    // Schedule next frame.
    var self = this;
    this._scroll_animationID = window.requestAnimationFrame(function(timestamp) {
      // (Note: The timestamp was giving us trouble, so we're not using it. TODO: Figure that out.)
      SC.run(self._scsv_adjustElementScroll, self);
    });

    // If we have any animations pending, queue up the new values for the next frame.
    if (this._scroll_queuedAnimations.length) {
      var animations = this._scroll_queuedAnimations,
        animation = animations[0],
        // Get the current time. (`startTime` is used in case of expired animations.)
        now = window.performance.now(),
        startTime = now,
        // The current offsets. Either actual current values, or the values from the endpoint of any
        // expired animation.
        currentHorizontalOffset, currentVerticalOffset, currentScale;

      // If the current animation has ended, cycle forward and find one that's ready to go.
      var endTime = animation.endTime;
      // Edge case: the first animation is uninitialized but has expired.
      if (endTime == null) endTime = now + animation.duration;
      while (animation && now >= endTime) {
        startTime = endTime;
        // Update the "current offsets" to the endpoints of the expired animation. This lets us pretend that
        // we ran all the way to the end of any skipped animations. (Note that expired animations only update
        // values that they specify; if one animation specifies scale and the next specifies vertical offset,
        // the final scale value will come from the end of the first one.
        if (animation.toHorizontalScrollOffset != null) currentHorizontalOffset = animation.toHorizontalScrollOffset;
        if (animation.toVerticalScrollOffset != null) currentVerticalOffset = animation.toVerticalScrollOffset;
        if (animation.toScale != null) currentScale = animation.toScale;
        // Update our time-tracking values to see if we've found an animation that should still be running.
        animations.shift();
        animation = animations[0];
        if (animation) {
          endTime += animation.duration;
        }
      }

      // Calculate our new values.
      var newHorizontalOffset, horizontalDidChange,
        newVerticalOffset, verticalDidChange,
        newScale, scaleDidChange;

      // If there's no more animation, set up the final frame based on the endpoints of the last-expired animation.
      if (!animation) {
        newHorizontalOffset = currentHorizontalOffset;
        horizontalDidChange = newHorizontalOffset != null && newHorizontalOffset !== this._scroll_horizontalScrollOffset;
        newVerticalOffset = currentVerticalOffset;
        verticalDidChange = newVerticalOffset != null && newVerticalOffset !== this._scroll_verticalScrollOffset;
        newScale = currentScale;
        scaleDidChange = newScale != null && newScale !== this._scroll_scale;
      }
      // Otherwise, interpolate.
      else {
        // If any of the offset values came through null, just grab the current values.
        if (currentHorizontalOffset == null) currentHorizontalOffset = this._scroll_horizontalScrollOffset;
        if (currentVerticalOffset == null) currentVerticalOffset = this._scroll_verticalScrollOffset;
        if (currentScale == null) currentScale = this._scroll_scale;

        // Initialize if needed. The start values and time are either the currently-applied values and now,
        // or they're the endpoints of the previously-expired animation detected above.
        if (!animation.isInitialized) {
          // Schedule.
          animation.startTime = startTime;
          animation.endTime = startTime + animation.duration;
          // Initialize from-values if needed.
          if (animation.fromHorizontalScrollOffset == null) animation.fromHorizontalScrollOffset = currentHorizontalOffset;
          if (animation.fromVerticalScrollOffset == null) animation.fromVerticalScrollOffset = currentVerticalOffset;
          if (animation.fromScale == null) animation.fromScale = currentScale;
          // Flag as initialized.
          animation.isInitialized = YES;
        }

        // Calculate the animation's fraction elapsed time.
        var elapsedFraction = (animation.startTime - now) / (animation.startTime - animation.endTime);
        // Scale the elapsed fraction between the animation's start and end fractions. This allows a standard shared
        // timing function to be interrupted by another one, for example.
        elapsedFraction *= (animation.endFraction - animation.startFraction);
        // The scaled elapsedFraction is then fed into the timing function to get the positional offset fraction.
        var offsetFraction = animation.timingFunction(elapsedFraction);
        // If we scaled the elapsedFraction, we need to also scale the resulting offset.
        offsetFraction = offsetFraction / (animation.endFractionPosition - animation.startFractionPosition);

        // Calculate where we're currently at along each animating dimension.
        var deltaHorizontalOffset, newHorizontalOffset, horizontalDidChange,
          deltaVerticalOffset, newVerticalOffset, verticalDidChange,
          deltaScale, newScale, scaleDidChange;
        // Horizontal
        if (animation.toHorizontalScrollOffset != null) {
          deltaHorizontalOffset = (animation.toHorizontalScrollOffset - animation.fromHorizontalScrollOffset) * offsetFraction;
          newHorizontalOffset = animation.fromHorizontalScrollOffset + deltaHorizontalOffset;
          horizontalDidChange = newHorizontalOffset !== this._scroll_horizontalScrollOffset;
        }
        // Vertical
        if (animation.toVerticalScrollOffset != null) {
          deltaVerticalOffset = (animation.toVerticalScrollOffset - animation.fromVerticalScrollOffset) * offsetFraction;
          newVerticalOffset = animation.fromVerticalScrollOffset + deltaVerticalOffset;
          verticalDidChange = newVerticalOffset !== this._scroll_verticalScrollOffset;
        }
        // Scale
        if (animation.toScale != null) {
          deltaScale = (animation.toScale - animation.fromScale) * offsetFraction;
          newScale = animation.fromScale + deltaScale;
          scaleDidChange = newScale !== this._scroll_scale;
        }
      }

      // If anything has actually changed, change anything that's actually changed.
      if (horizontalDidChange || verticalDidChange || scaleDidChange) {
        this._scroll_isExogenous = YES;
        this.beginPropertyChanges();
        if (horizontalDidChange) this.set('horizontalScrollOffset', newHorizontalOffset);
        if (verticalDidChange) this.set('verticalScrollOffset', newVerticalOffset);
        if (scaleDidChange) this.set('scale', newScale);
        this.endPropertyChanges();
        this._scroll_isExogenous = NO;
      }
    }
  },

  /** @private */
  forceDimensionsRecalculation: function (forceWidth, forceHeight, vOffSet, hOffSet) {
    var oldScrollHOffset = hOffSet;
    var oldScrollVOffset = vOffSet;

    this.beginPropertyChanges();
    this.set('verticalScrollOffset', 0);
    this.set('horizontalScrollOffset', 0);
    this.endPropertyChanges();

    this.beginPropertyChanges();
    if (forceWidth && forceHeight) {
      this.set('verticalScrollOffset', this.get('maximumVerticalScrollOffset'));
      this.set('horizontalScrollOffset', this.get('maximumHorizontalScrollOffset'));
    }
    else if (forceWidth && !forceHeight) {
      this.set('verticalScrollOffset', oldScrollVOffset);
      this.set('horizontalScrollOffset', this.get('maximumHorizontalScrollOffset'));
    }
    else if (!forceWidth && forceHeight) {
      this.set('horizontalScrollOffset', this.get('maximumVerticalScrollOffset'));
      this.set('verticalScrollOffset', oldScrollHOffset);
    }
    this.endPropertyChanges();
  },

  // ..........................................................
  // PRIVATE VARIABLES
  //
  // Defined for performance, documented for clarity™

  // Views and dimensions

  _scroll_contentView: null,

  _scroll_contentWidth: null,

  _scroll_contentHeight: null,

  _scroll_containerHeight: null,

  _scroll_containerWidth: null,

  // Offsets

  /** @private The cached vertical offset value. */
  _scroll_verticalScrollOffset: 0,

  /** @private The cached horizontal offset value. */
  _scroll_horizontalScrollOffset: 0,

  /** @private The cached minimum vertical offset value. */
  _scroll_minimumVerticalScrollOffset: 0,

  /** @private The cached maximum vertical offset value. */
  _scroll_maximumVerticalScrollOffset: 0,

  /** @private The cached minimum horizontal offset value. */
  _scroll_minimumHorizontalScrollOffset: 0,

  /** @private The cached maximum horizontal offset value. */
  _scroll_maximumHorizontalScrollOffset: 0,

  // tile

  /** @private If the tile method detects the appearance or disappearance of gutters, it triggers a re-layout. */
  _scroll_hasHorizontalGutter: NO,

  /** @private If the tile method detects the appearance or disappearance of gutters, it triggers a re-layout. */
  _scroll_hasVerticalGutter: NO,

  // Scale

  /** @private The cached scale. */
  _scroll_scale: 1,

  /** @private The cached vertical scale origin, i.e. whether the user most recently scrolled to an extreme. Used for scaling and alignment. */
  _scroll_verticalScaleOrigin: SC.ALIGN_TOP,

  /** @private If the user did not scroll to an extreme, this is their most recent %age scroll offset.  Used for scaling and alignment. */
  _scroll_verticalScaleOriginPct: 0.5,

  /** @private The cached horizontal scale origin, i.e. whether the user most recently scrolled to an extreme. Used for scaling and alignment. */
  _scroll_horizontalScaleOrigin: SC.ALIGN_LEFT,

  /** @private If the user did not scroll to an extreme, this is their most recent %age scroll offset.  Used for scaling and alignment. */
  _scroll_horizontalScaleOriginPct: 0.5,

  /** @private
    Used to signal that a scroll offset change is coming from direct user interaction with the scroll view. Exogenous scrolls should
    change the scale origins; changes from other locations (e.g. a scale slider) should not.
  */
  _scroll_isExogenous: NO,

  // Rendered output

  /** @private The last horizontal offset value that's been applied. */
  _scroll_lastRenderedHorizontalScrollOffset: null,

  /** @private The last vertical offset value that's been applied. */
  _scroll_lastRenderedVerticalScrollOffset: null,

  /** @private The last scale that's been applied. */
  _scroll_lastRenderedScale: null

});
