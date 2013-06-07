

/**
  This mixin automatically positions the view's child views in a stack either
  vertically or horizontally and adjusts the View's height or width respectively
  to fit.  It does this by checking the height or width of each child view
  (depending on the direction of layout) and positioning the following child view
  accordingly.

  If the child view's frame changes, then the parent view will re-layout all of
  the others to fit and re-adjust its width or height to fit as well.

  A possible usage scenario is a long "form" view made of unique subsection
  views.  If we want to adjust the height of a subsection, to make space for an
  error message for example, it would be a lot of work to manually reposition
  all the other sections below it.

    For example,

      MyApp.MyView = SC.View.extend(SC.StackableChildViews, {
        // Laid out from left to right.
        direction: SC.LAYOUT_HORIZONTAL,

        // Actual layout will be { left: 10, bottom: 20, top: 20, width: 270 }
        layout: { left: 10, bottom: 20, top: 20 },

        // Keep the child views ordered!
        childViews: ['sectionA', 'sectionB', 'sectionC'],

        sectionA: SC.View.design({
          // Actual layout will be { left: 0, bottom: 0, top: 0, width: 100 }
          layout: { width: 100 }
        }),

        sectionB: SC.View.design({
          // Actual layout will be { border: 1, left: 100, bottom: 0, top: 0, width: 50 }
          layout: { border: 1, width: 50 }
        }),

        sectionC: SC.View.design({
          // Actual layout will be { left: 150, bottom: 0, top: 0, width: 120 }
          layout: { width: 120 }
        })
      });

  You can also specify values for the padding before the first child view,
  `paddingBefore`, for the padding after the last child view, `paddingAfter` and
  for the spacing between each child view, `spacing`.

  For more control over the spacing between child views, you can provide
  relevant margin properties on each child view.  When the layout direction
  is SC.LAYOUT_HORIZONTAL, then child views can adjust their automatic
  position from left to right by providing marginLeft or marginRight.  Likewise,
  when the direction is SC.LAYOUT_VERTICAL, child views can override the
  default spacing by providing marginTop or marginBottom.

    For example,

      MyApp.MyView = SC.View.extend(SC.StackableChildViews, {
        // Laid out from left to right.
        direction: SC.LAYOUT_HORIZONTAL,

        // Actual layout will be { left: 10, bottom: 20, top: 20, width: 570 }
        layout: { left: 10, bottom: 20, top: 20 },

        // Keep the child views ordered!
        childViews: ['sectionA', 'sectionB', 'sectionC'],

        sectionA: SC.View.design({
          // Actual layout will be { left: 0, bottom: 0, top: 0, width: 100 }
          layout: { width: 100 },
          // Force the following child view to be 200px further to the right.
          marginRight: 200
        }),

        sectionB: SC.View.design({
          // Actual layout will be { left: 200, bottom: 0, top: 0, width: 50 }
          layout: { width: 50 }
        }),

        sectionC: SC.View.design({
          // Actual layout will be { left: 450, bottom: 0, top: 0, width: 120 }
          layout: { width: 120 },
          // Force this child view to be 200px further from the previous.
          marginLeft: 200
        })
      });

  Finally, you can leave a child view out of automatic stacking by explicitly
  specifying `isStackable` is false on the child view.
*/
SC.StackableChildViews = {

  /**
    The direction of layout, either SC.LAYOUT_HORIZONTAL or SC.LAYOUT_VERTICAL.

    @default: SC.LAYOUT_VERTICAL
  */
  direction: SC.LAYOUT_VERTICAL,

  /**
    Ignores changes to child views heights and visibilities when false.

    If your child views are not going to change height or visibility, you
    can improve performance by setting this to false in order to prevent the
    view from observing its child views for changes.

    @default true
  */
  liveAdjust: true,

  /**
    Padding after the last child view.

    @default: 0
  */
  paddingAfter: 0,

  /**
    Padding before the first child view.

    @default: 0
  */
  paddingBefore: 0,

  /**
    The spacing between child views.

    This is essentially the margins between each child view.  It can be
    overridden as needed by setting `marginBottom` and `marginTop` on a
    child view when using SC.LAYOUT_VERTICAL direction or by setting
    `marginLeft` and `marginRight` on a child view when using
    SC.LAYOUT_HORIZONTAL direction.

    Note that the spacing specified becomes the minimum margin between child
    views, without explicitly overriding it from both sides.  For example,
    if `spacing` is 25, setting `marginBottom` to 10 on a child view will not
    result in the next child view being 10px below it, unless the next child
    view also specified `marginTop` as 10.

    What this means is that it takes less configuration if you set `spacing` to
    be the smallest margin you wish to exist and then use the overrides to
    expand it.  For example, if `spacing` is 5, setting `marginBottom` to 10
    on a child view will result in the next child view being 10px below it,
    without having to specify `marginTop` on that next child view.

    @default: 0
  */
  spacing: 0,

  /** @private Whenever the childViews array changes, we need to change each layout. */
  childViewsDidChange: function() {
    // If liveAdjust is off, this should do nothing.
    if (!this.get('liveAdjust')) return;

    // Add observers on layout and isVisible.  If liveadjust
    // is later unset, these observers will be removed in
    // liveAdjustDidChange().
    var childViews = this.get('childViews'),
      i, len;

    for (i = 0, len = childViews.get('length'); i < len; i++) {
      var childView = childViews.objectAt(i);
      if (!childView.hasObserverFor('layout') && !childView.get('useStaticLayout')) {
        childView.addObserver('layout', this, this.layoutChildren);
        childView.addObserver('marginTop', this, this.layoutChildren);
        childView.addObserver('marginBottom', this, this.layoutChildren);
        childView.addObserver('marginRight', this, this.layoutChildren);
        childView.addObserver('marginLeft', this, this.layoutChildren);
        childView.addObserver('isVisible', this, this.layoutChildren);
      }
    }

    this.layoutChildren();
  },

  /** @private Whenever the direction changes, we need to clear previous layouts. */
  directionDidChange: function() {
    var childViews = this.get('childViews'),
      direction = this.get('direction'),
      i, len;

    for (i = 0, len = childViews.get('length'); i < len; i++) {
      var childView = childViews.objectAt(i);

      if (direction === SC.LAYOUT_VERTICAL) {
        // Clear out the left position.
        childView.adjust('left', null);
      } else {
        // Clear out the top position.
        childView.adjust('top', null);
      }
    }

    if (direction === SC.LAYOUT_VERTICAL) {
      this.adjust('width', this._initialWidth);
    } else {
      this.adjust('height', this._initialHeight);
    }

    this.layoutChildren();
  },

  /** @private */
  destroyMixin: function() {
    this.removeObserver('liveAdjust', this, this.liveAdjustDidChange);
    this.removeObserver('childViews', this, this.childViewsDidChange);
    this.removeObserver('direction', this, this.directionDidChange);
  },

  /** @private */
  initMixin: function() {
    var layout = this.get('layout');

    this.addObserver('liveAdjust', this, this.liveAdjustDidChange);
    this.addObserver('childViews', this, this.childViewsDidChange);
    this.addObserver('direction', this, this.directionDidChange);

    this._initialHeight = layout.height;
    this._initialWidth = layout.width;

    this.childViewsDidChange();
  },

  /** @private */
  layoutChildren: function() {
    var childViews = this.get('childViews'),
        direction = this.get('direction'),
        i, len,
        marginBottom,
        marginRight,
        paddingAfter = this.get('paddingAfter'),
        position = 0,
        spacing = this.get('spacing');

    marginBottom = marginRight = this.get('paddingBefore');

    for (i = 0, len = childViews.get('length'); i < len; i++) {
      var childView = childViews.objectAt(i),
        lastMargin = 0, // Used to avoid adding spacing to the final margin.
        isStackable,
        marginLeft,
        marginTop;

      // Ignore child views with isStackable false or that are not visible.
      isStackable = childView.get('isStackable');
      if (!SC.none(isStackable) && !isStackable) { continue; }
      if (!childView.get('isVisible') || childView.get('useStaticLayout')) { continue; }

      //@if(debug)
      // Add some developer support.
      var layout = childView.get('layout');

      if (direction === SC.LAYOUT_VERTICAL && SC.none(layout.height)) {
        SC.warn('Developer Warning: Views that mix in SC.StackableChildViews for vertical layout may only define childView layouts with height plus left and right, left and width, right and width or centerX and width!  This childView has an invalid layout: %@'.fmt(childView));
        return;
      } else if (direction === SC.LAYOUT_HORIZONTAL && SC.none(layout.width)) {
        SC.warn('Developer Warning: Views that mix in SC.StackableChildViews for horizontal layout may only define childView layouts with width plus top and bottom, top and height, bottom and height or centerY and height!  This childView has an invalid layout: %@'.fmt(childView));
        return;
      }
      //@endif

      if (direction === SC.LAYOUT_VERTICAL) {
        // Determine the top margin.
        marginTop = childView.get('marginTop') || 0;
        position += Math.max(marginBottom, marginTop);

        if (childView.getPath('layout.top') !== position) {
          childView.adjust('top', position);
        }
        position += childView.getPath('borderFrame.height');

        // Determine the bottom margin.
        lastMargin = childView.get('marginBottom') || 0;
        marginBottom = lastMargin || spacing;
      } else {
        // Determine the left margin.
        marginLeft = childView.get('marginLeft') || 0;
        position += Math.max(marginRight, marginLeft);

        if (childView.getPath('layout.left') !== position) {
          childView.adjust('left', position);
        }
        position += childView.getPath('borderFrame.width');

        // Determine the right margin.
        lastMargin = childView.get('marginRight') || 0;
        marginRight = lastMargin || spacing;
      }
    }

    // Adjust our frame to fit as well, this ensures that SC.ScrollView works.
    paddingAfter = Math.max(lastMargin, paddingAfter);
    if (direction === SC.LAYOUT_VERTICAL) {
      if (this.getPath('layout.height') !== position) { this.adjust('height', position + paddingAfter); }
    } else {
      if (this.getPath('layout.width') !== position) { this.adjust('width', position + paddingAfter); }
    }
  },

  /** @private */
  liveAdjustDidChange: function() {
    if (this.get('liveAdjust')) {
      // If liveAdjust gets set to true, auto adjust child views.
      this.childViewsDidChange();
    } else {
      // Else, remove live adjust observers from the child views.
      var childViews = this.get('childViews'),
        i, len;

      for (i = 0, len = childViews.get('length'); i < len; i++) {
        var childView = childViews.objectAt(i);

        if (childView.hasObserverFor('layout') && !childView.get('useStaticLayout')) {
          childView.removeObserver('layout', this, this.layoutChildren);
          childView.removeObserver('marginTop', this, this.layoutChildren);
          childView.removeObserver('marginBottom', this, this.layoutChildren);
          childView.removeObserver('marginRight', this, this.layoutChildren);
          childView.removeObserver('marginLeft', this, this.layoutChildren);
          childView.removeObserver('isVisible', this, this.layoutChildren);
        }
      }
    }
  }
};
