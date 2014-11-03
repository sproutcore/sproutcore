// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
sc_require('views/scroll_view');


/** @class

  Implements a scroll view for menus.  This class extends SC.ScrollView for
  menus.

  The main difference with SC.ScrollView is that there is only vertical
  scrolling. Value Syncing between SC.MenuScrollView and SC.MenuScrollerView
  is done using valueBinding.

  @extends SC.ScrollView
  @since SproutCore 1.0
*/
SC.MenuScrollView = SC.ScrollView.extend(
/** @scope SC.MenuScrollView.prototype */{

  /**
    @type Array
    @default ['sc-menu-scroll-view']
    @see SC.View#classNames
  */
  classNames: ['sc-menu-scroll-view'],


  // ..........................................................
  // PROPERTIES
  //


  /**
    The maximum horizontal scroll offset allowed given the current contentView
    size and the size of the scroll view.  If horizontal scrolling is
    disabled, this will always return 0.

    @type Number
    @default 0
  */
  maximumHorizontalScrollOffset: 0,


  // ..........................................................
  // SCROLLERS
  //

  /**
    YES if the view should maintain a horizontal scroller.   This property
    must be set when the view is created.

    @type Boolean
    @default NO
  */
  hasHorizontalScroller: NO,

  /**
    The horizontal scroller view class. This will be replaced with a view
    instance when the ScrollView is created unless hasHorizontalScroller is
    NO.

    @type SC.View
    @default SC.MenuScrollerView
  */
  horizontalScrollerView: SC.MenuScrollerView,

  /**
    YES if the horizontal scroller should be visible.  You can change this
    property value anytime to show or hide the horizontal scroller.  If you
    do not want to use a horizontal scroller at all, you should instead set
    hasHorizontalScroller to NO to avoid creating a scroller view in the
    first place.

    @type Boolean
    @default NO
  */
  isHorizontalScrollerVisible: NO,

  /**
    Returns YES if the view both has a horizontal scroller, the scroller is
    visible.

    @type Boolean
    @default NO
  */
  canScrollHorizontal: NO,

  /**
    If YES, the horizontal scroller will autohide if the contentView is
    smaller than the visible area.  You must set hasHorizontalScroller to YES
    for this property to have any effect.

    @type Boolean
    @default NO
  */
  autohidesHorizontalScroller: NO,

  /**
    YES if the view should maintain a vertical scroller.   This property must
    be set when the view is created.

    @type Boolean
    @default YES
  */
  hasVerticalScroller: YES,

  /**
    The vertical scroller view class. This will be replaced with a view
    instance when the ScrollView is created unless hasVerticalScroller is NO.

    @type SC.View
    @default SC.MenuScrollerView
  */
  verticalScrollerView: SC.MenuScrollerView,
  verticalScrollerView2: SC.MenuScrollerView,

  /**
    YES if the vertical scroller should be visible.  For SC.MenuScroll the
    vertical scroller is always there we just hide the arrows to scroll.

    @type Boolean
    @default YES
  */
  isVerticalScrollerVisible: YES,

  /**
    @type Boolean
    @default YES
  */
  canScrollVertical: YES,

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


  // ..........................................................
  // CUSTOM VIEWS
  //

  /**
    Control Size for Menu content: change verticalLineScroll

    @type String
    @default SC.REGULAR_CONTROL_SIZE
  */
  controlSize: SC.REGULAR_CONTROL_SIZE,

  /**
    The container view that will contain your main content view.  You can
    replace this property with your own custom subclass if you prefer.

    @type SC.ContainerView
    @default SC.ContainerView
  */
  containerView: SC.ContainerView,

  // ..........................................................
  // METHODS
  //

  /**
    @param {SC.View} view
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

    var vscroll2 = this.get('verticalScrollerView2');
    if (vscroll2 && vscroll2.get('isVisible')) {
      vf.height += vscroll2.get('frame').height;
    }

    var vscroll = this.get('verticalScrollerView');
    if (vscroll && vscroll.get('isVisible')) {
      vf.top -= vscroll.get('frame').height;
    }

    return this.scrollToRect(vf);
  },

  /** @private
    Adjusts the layout for the various internal views.  This method is called
    once when the scroll view is first configured and then anytime a scroller
    is shown or hidden.  You can call this method yourself as well to retile.

    You may also want to override this method to handle layout for any
    additional controls you have added to the view.
  */
  tile: function () {
    // get vertical scroller/determine if we should have a scroller
    var hasScroller, vscroll, vscroll2, hasVertical, clip, clipLayout, viewportHeight;
    hasScroller = this.get('hasVerticalScroller');
    vscroll = hasScroller ? this.get('verticalScrollerView') : null;
    vscroll2 = hasScroller ? this.get('verticalScrollerView2') : null;
    hasVertical = vscroll && this.get('isVerticalScrollerVisible');

    // get the containerView
    clip = this.get('containerView');
    clipLayout = { left: 0, top: 0 };

    if (hasVertical) {
      viewportHeight = 0;
      var scrollerThickness = vscroll.get('scrollerThickness') || vscroll2.get('scrollerThickness');
      var view   = this.get('contentView'),
            f      = (view) ? view.get('frame') : null,
            height = (f) ? f.height : 0,
            elem = this.containerView.$()[0],
            verticalOffset = this.get('verticalScrollOffset'),
            topArrowInvisible = { height: 0, top: 0, right: 0, left: 0 },
            topArrowVisible = { height: scrollerThickness, top: 0, right: 0, left: 0 },
            bottomArrowVisible = { height: scrollerThickness, bottom: 0, right: 0, left: 0 },
            bottomArrowInvisible = { height: 0, bottom: 0, right: 0, left: 0 };

      if (elem) viewportHeight = elem.offsetHeight;

      if (verticalOffset === 0) {
        clipLayout.top = 0;
        clipLayout.bottom = scrollerThickness;
        vscroll.set('layout', topArrowInvisible);
        vscroll2.set('layout', bottomArrowVisible);
      } else if (verticalOffset >= (height - viewportHeight - scrollerThickness)) {
        clipLayout.top = scrollerThickness;
        clipLayout.bottom = 0;
        vscroll.set('layout', topArrowVisible);
        vscroll2.set('layout', bottomArrowInvisible);
      } else {
        clipLayout.top = scrollerThickness;
        clipLayout.bottom = scrollerThickness;
        vscroll.set('layout', topArrowVisible);
        vscroll2.set('layout', bottomArrowVisible);
      }
    }

    if (vscroll) {
      vscroll.set('isVisible', hasVertical);
      vscroll2.set('isVisible', hasVertical);
    }

    clip.set('layout', clipLayout);
  },

  /** @private
    Called whenever a scroller visibility changes.  Calls the tile() method.
  */
  scrollerVisibilityDidChange: function () {
    this.tile();
  }.observes('isVerticalScrollerVisible', 'isHorizontalScrollerVisible', 'verticalScrollOffset'),


  // ..........................................................
  // INTERNAL SUPPORT
  //

  /** @private
    Instantiate scrollers & container views as needed.  Replace their classes
    in the regular properties.
  */
  createChildViews: function () {
    var childViews = [], view, view2, controlSize = this.get('controlSize');

    // create the containerView.  We must always have a container view.
    // also, setup the contentView as the child of the containerView...
    if (SC.none(view = this.containerView)) view = SC.ContainerView;

    childViews.push(this.containerView = this.createChildView(view, {
      contentView: this.contentView
    }));

    // and replace our own contentView...
    this.contentView = this.containerView.get('contentView');

    // create a vertical scroller
    if ((view = this.verticalScrollerView) && (view2 = this.verticalScrollerView2)) {
      if (this.get('hasVerticalScroller')) {
        view = this.verticalScrollerView = this.createChildView(view, {
          layout: {top: 0, left: 0, right: 0},
          controlSize: controlSize,
          valueBinding: '*owner.verticalScrollOffset'
        });
        childViews.push(view);
        view2 = this.verticalScrollerView2 = this.createChildView(view2, {
          scrollDown: YES,
          layout: { bottom: 0, left: 0, right: 0 },
          controlSize: controlSize,
          valueBinding: '*owner.verticalScrollOffset'
        });
        childViews.push(view2);
      } else {
        this.verticalScrollerView = null;
        this.verticalScrollerView2 = null;
      }
    }

    // set childViews array.
    this.childViews = childViews;

    this.contentViewFrameDidChange(); // setup initial display...
    this.tile(); // set up initial tiling
  },

  /** @private */
  init: function () {
    sc_super();

    // start observing initial content view.  The content view's frame has
    // already been setup in prepareDisplay so we don't need to call
    // viewFrameDidChange...
    this._scroll_contentView = this.get('contentView');
    var contentView = this._scroll_contentView;

    if (contentView) {
      contentView.addObserver('frame', this, this.contentViewFrameDidChange);
    }

    if (this.get('isVisibleInWindow')) this._scsv_registerAutoscroll();
  },

  /** @private Registers/deregisters view with SC.Drag for autoscrolling */
  _scsv_registerAutoscroll: function () {
    if (this.get('isVisibleInWindow')) SC.Drag.addScrollableView(this);
    else SC.Drag.removeScrollableView(this);
  }.observes('isVisibleInWindow'),

  /** @private
    Invoked whenever the contentView's frame changes.  This will update the
    scroller maximum and optionally update the scroller visibility if the
    size of the contentView changes.  We don't care about the origin since
    that is tracked separately from the offset values.
  */
  contentViewFrameDidChange: function () {
    var view   = this.get('contentView'), view2,
        f      = (view) ? view.get('frame') : null,
        width  = (f) ? f.width : 0,
        height = (f) ? f.height : 0,
        dim    = this.get('frame'),
        viewportHeight, elem;

    // cache out scroll settings...
    //if ((width === this._scroll_contentWidth) && (height === this._scroll_contentHeight)) return;
    this._scroll_contentWidth = width;
    this._scroll_contentHeight = height;

    if (this.get('hasVerticalScroller') && (view = this.get('verticalScrollerView')) && (view2 = this.get('verticalScrollerView2'))) {
      height -= 1; // accurately account for our layout
      // decide if it should be visible or not
      if (this.get('autohidesVerticalScroller')) {
        this.set('isVerticalScrollerVisible', height > dim.height);
      }
      height -= this.get('verticalScrollerBottom');
      viewportHeight = 0;
      elem = this.containerView.$()[0];
      if (elem) viewportHeight = elem.offsetHeight;
      height = height - viewportHeight;
      view.setIfChanged('maximum', height);
      view2.setIfChanged('maximum', height);
    }
  }
});
