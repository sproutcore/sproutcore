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

  // ---------------------------------------------------------------------------------------------
  // Properties
  //

  /**
    The bottom scroller view class. This will be replaced with a view instance when the
    MenuScrollView is created unless hasVerticalScroller is false.

    @type SC.View
    @default SC.MenuScrollerView
  */
  bottomScrollerView: SC.MenuScrollerView,

  /**
    Returns true if the view has both a vertical scroller and the scroller is visible.

    @field
    @type Boolean
    @readonly
    @see SC.ScrollView
  */
  canScrollVertical: function () {
    return !!(this.get('hasVerticalScroller') && // This property isn't bindable.
      this.get('bottomScrollerView') && // This property isn't bindable.
      this.get('topScrollerView') && // This property isn't bindable.
      this.get('isVerticalScrollerVisible'));
  }.property('isVerticalScrollerVisible').cacheable(),

  /** SC.View.prototype
    @type Array
    @default ['sc-menu-scroll-view']
    @see SC.View#classNames
  */
  classNames: ['sc-menu-scroll-view'],

  /**
    Control Size for Menu content: change verticalLineScroll

    @type String
    @default SC.REGULAR_CONTROL_SIZE
    @see SC.Control
  */
  controlSize: SC.REGULAR_CONTROL_SIZE,

  /**
    YES if the view should maintain a horizontal scroller. This property must be set when the view
    is created.

    @type Boolean
    @default false
    @see SC.ScrollView
  */
  hasHorizontalScroller: false,

  /**
    The top scroller view class. This will be replaced with a view instance when the MenuScrollView
    is created unless hasVerticalScroller is false.

    @type SC.View
    @default SC.MenuScrollerView
  */
  topScrollerView: SC.MenuScrollerView,

  // ---------------------------------------------------------------------------------------------
  // Methods
  //

  /** @private @see SC.ScrollView. Check frame changes for size changes. */
  _sc_contentViewFrameDidChange: function () {
    sc_super();

    // Unlike a normal SC.ScrollView, the visibility of the top & bottom scrollers changes as the
    // scrolling commences. For example, once the user scrolls a tiny bit, we need to show the
    // top scroller.
    this._sc_repositionScrollers();
  },

  /** @private @see SC.ScrollView. When the content view's size changes, we need to update our scroll offset properties. */
  _sc_repositionContentViewUnfiltered: function () {
    var hasVerticalScroller = this.get('hasVerticalScroller'),
        // UNUSED. minimumVerticalScrollOffset = this.get('minimumVerticalScrollOffset'),
        maximumVerticalScrollOffset = this.get('maximumVerticalScrollOffset');

    if (hasVerticalScroller) {
      var bottomScrollerView = this.get('bottomScrollerView'),
          topScrollerView = this.get('topScrollerView');

      topScrollerView.set('maximum', maximumVerticalScrollOffset);
      bottomScrollerView.set('maximum', maximumVerticalScrollOffset);

      // Update if the visibility of the scrollers has changed now.
      var containerHeight = this._sc_containerHeight,
          contentHeight = this._sc_contentHeight;

      if (this.get('autohidesVerticalScroller')) {
        this.setIfChanged('isVerticalScrollerVisible', contentHeight > containerHeight);
      }
    }

    sc_super();
  },

  /** @private @see SC.ScrollView. Re-position the scrollers and content depending on the need to scroll or not. */
  _sc_repositionScrollersUnfiltered: function () {
    var hasScroller = this.get('hasVerticalScroller'),
        containerView = this.get('containerView');

    if (hasScroller && this.get('autohidesVerticalScroller')) {
      var bottomScrollerView = this.get('bottomScrollerView'),
          bottomScrollerThickness = bottomScrollerView.get('scrollerThickness'),
          maximumVerticalScrollOffset = this.get('maximumVerticalScrollOffset'),
          topScrollerView = this.get('topScrollerView'),
          topScrollerThickness = topScrollerView.get('scrollerThickness'),
          verticalOffset = this.get('verticalScrollOffset'),
          isBottomScrollerVisible = bottomScrollerView.get('isVisible'),
          isTopScrollerVisible = topScrollerView.get('isVisible');

      // This asymetric update moves the container view out of the way of the scrollers (essentially
      // so that the scroller views can be transparent). What's important is that as the container
      // view is adjusted, the vertical scroll offset is adjusted properly so that the content view
      // position doesn't jump around.
      if (isTopScrollerVisible) {
        if (verticalOffset <= topScrollerThickness) {
          topScrollerView.set('isVisible', false);
          containerView.adjust('top', 0);
          this.decrementProperty('verticalScrollOffset', topScrollerThickness);
        }
      } else if (verticalOffset > 0) {
        topScrollerView.set('isVisible', true);
        containerView.adjust('top', topScrollerThickness);
        this.incrementProperty('verticalScrollOffset', topScrollerThickness);
      }

      if (isBottomScrollerVisible) {
        if (verticalOffset >= maximumVerticalScrollOffset - bottomScrollerThickness) {
          bottomScrollerView.set('isVisible', false);
          containerView.adjust('bottom', 0);
          this.incrementProperty('verticalScrollOffset', bottomScrollerThickness);
        }
      } else if (verticalOffset < maximumVerticalScrollOffset) {
        bottomScrollerView.set('isVisible', true);
        containerView.adjust('bottom', bottomScrollerThickness);
        this.decrementProperty('verticalScrollOffset', bottomScrollerThickness);
      }
    }
  },

  /** @private
    Instantiate scrollers & container views as needed.  Replace their classes
    in the regular properties.
  */
  createChildViews: function () {
    var childViews = [],
      autohidesVerticalScroller = this.get('autohidesVerticalScroller');

    // Set up the container view.
    var containerView = this.get('containerView');

    //@if(debug)
    // Provide some debug-mode only developer support to prevent problems.
    if (!containerView) {
      throw new Error("Developer Error: SC.ScrollView must have a containerView class set before it is instantiated.");
    }
    //@endif

    containerView = this.containerView = this.createChildView(containerView, {
      contentView: this.contentView // Initialize the view with the currently set container view.
    });
    this.contentView = containerView.get('contentView'); // Replace our content view with the instantiated version.
    childViews.push(containerView);

    // Set up the scrollers.
    if (!this.get('hasVerticalScroller')) {
      // Remove the class entirely.
      this.topScrollerView = null;
      this.bottomScrollerView = null;
    } else {
      var controlSize = this.get('controlSize'),
          topScrollerView = this.get('topScrollerView');

      // Use a default scroller view.
      /* jshint eqnull:true */
      if (topScrollerView == null) {
        topScrollerView = SC.MenuScrollerView;
      }

      // Replace the class property with an instance.
      topScrollerView = this.topScrollerView = this.createChildView(topScrollerView, {
        controlSize: controlSize,
        scrollDown: false,
        isVisible: !autohidesVerticalScroller,
        layout: { height: 0 },

        value: this.get('verticalScrollOffset'),
        valueBinding: '.parentView.verticalScrollOffset', // Bind the value of the scroller to our vertical offset.
        minimum: this.get('minimumVerticalScrollOffset'),
        maximum: this.get('maximumVerticalScrollOffset')
      });

      var topScrollerThickness = topScrollerView.get('scrollerThickness');
      topScrollerView.adjust('height', topScrollerThickness);

      // Add the scroller view to the child views array.
      childViews.push(topScrollerView);


      var bottomScrollerView = this.get('bottomScrollerView');

      // Use a default scroller view.
      /* jshint eqnull:true */
      if (bottomScrollerView == null) {
        bottomScrollerView = SC.MenuScrollerView;
      }

      // Replace the class property with an instance.
      bottomScrollerView = this.bottomScrollerView = this.createChildView(bottomScrollerView, {
        controlSize: controlSize,
        scrollDown: true,
        isVisible: !autohidesVerticalScroller,
        layout: { bottom: 0, height: 0 },

        value: this.get('verticalScrollOffset'),
        valueBinding: '.parentView.verticalScrollOffset', // Bind the value of the scroller to our vertical offset.
        minimum: this.get('minimumVerticalScrollOffset'),
        maximum: this.get('maximumVerticalScrollOffset')
      });

      var bottomScrollerThickness = bottomScrollerView.get('scrollerThickness');
      bottomScrollerView.adjust('height', bottomScrollerThickness);

      // Add the scroller view to the child views array.
      childViews.push(bottomScrollerView);

      // If the scrollers aren't initially hidden, adjust the container.
      if (!autohidesVerticalScroller) {
        containerView.adjust('top', topScrollerThickness);
        containerView.adjust('bottom', bottomScrollerThickness);
      }
    }

    // Set the childViews array.
    this.childViews = childViews;
  }

});
