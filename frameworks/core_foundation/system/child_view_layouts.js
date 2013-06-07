// ==========================================================================
// Project:   SproutCore
// Copyright: @2013 7x7 Software, Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
sc_require('views/view');


// This adds child layout plugin constants to SC.View.
SC.mixin(SC.View,
  /** @scope SC.View */ {

  /**
    This child layout plugin automatically positions the view's child views in a
    vertical stack and adjusts the parent view's height to fit.  It does this by
    checking the height of each child view and positioning the following child
    view accordingly.  By default any time that a child view's height changes,
    the view will use this plugin to re-adjust all other child views and
    its own height appropriately.

    A possible usage scenario is a long "form" view made of unique subsection
    views.  If we want to adjust the height of a subsection, to make space for
    an error message for example, it would be a lot of work to manually
    reposition all the other sections below it.  A much easier to code and
    cleaner solution is to just set the childViewLayout plugin on the view.

    For example,

        MyApp.MyView = SC.View.extend({

          // Child views will be stacked in order vertically.
          childViewLayout: SC.View.VERTICAL_STACK,

          // The order of child views is important!
          childViews: ['sectionA', 'sectionB', 'sectionC'],

          // Actual layout will become { left: 10, right: 10, top: 20, height: 270 }
          layout: { left: 10, right: 10, top: 20 },

          sectionA: SC.View.design({
            // Actual layout will become { left: 0, right: 0, top: 0, height: 100 }
            layout: { height: 100 }
          }),

          sectionB: SC.View.design({
            // Actual layout will become { border: 1, left: 0, right: 0, top: 100, height: 50 }
            layout: { border: 1, height: 50 }
          }),

          sectionC: SC.View.design({
            // Actual layout will become { left: 10, right: 10, top: 150, height: 120 }
            layout: { left: 10, right: 10, height: 120 }
          })

        });

    ## Modify all child view layouts with `childViewLayoutOptions`

    To modify the plugin behavior for all child view layouts, you can set the
    following child view layout options in `childViewLayoutOptions` on the view:

      - paddingBefore - Adds padding before the first child view.  Default: 0
      - paddingAfter - Adds padding after the last child view.  Default: 0
      - spacing - Adds spacing between each child view.  Default: 0
      - useLiveAdjust - Determines whether the view should re-lay out child views if any child view's height or visibility changes.  Default: true

    For example,

        MyApp.MyView = SC.View.extend({

          // Child views will be stacked in order vertically.
          childViewLayout: SC.View.VERTICAL_STACK,

          // Change the behavior of the VERTICAL_STACK plugin
          childViewLayoutOptions: {
            paddingBefore: 10,
            spacing: 5
          }

        });

    ## Modify specific child view layouts

    To adjust the child layout on a more granular level per child view, you can
    also set the following properties on each child view:

      - marginBefore - Specify the minimum spacing above the child view.
      - marginAfter - Specify the minimum spacing below the child view.
      - useAbsoluteLayout - Don't include this child view in automatic layout, use absolute positioning based on `layout` property.
      - useStaticLayout - This child view uses relative positioning and is not eligible for automatic layout.
      - isVisible - Non-visible child views are not included in the stack.

      For example,

        MyApp.MyView = SC.View.extend({

          // Child views will be stacked in order vertically.
          childViewLayout: SC.View.VERTICAL_STACK,

          // Actual layout will become { left: 10, right: 10, top: 20, height: 570 }
          layout: { left: 10, right: 10, top: 20 },

          // Keep the child views ordered!
          childViews: ['sectionA', 'float', 'sectionB', 'sectionC'],

          sectionA: SC.View.design({
            // Actual layout will become { left: 0, right: 50, top: 0, height: 100 }
            layout: { right: 50, height: 100 },
            // The following child view will be at least 50px further down.
            marginAfter: 50
          }),

          float: SC.View.design({
            // This view will not be included in automatic layout and will not effect the stack.
            layout: { top: 5, right: 5, width: 50, height: 50 },
            useAbsoluteLayout: true
          }),

          sectionB: SC.View.design({
            // Actual layout will become { left: 0, right: 0, top: 150, height: 120 }
            layout: { height: 120 }
          }),

          sectionC: SC.View.design({
            // Actual layout will become { left: 0, bottom: 0, top: 470, height: 100 }
            layout: { height: 100 },
            // This child view will be at least 200px below the previous.
            marginBefore: 200
          })

        });

    ### A Note About Spacing

    Note that the spacing attribute becomes the minimum margin between child
    views, without explicitly overriding it from both sides using `marginBottom`
    and `marginTop`.  For example, if `spacing` is 25, setting `marginBottom` to
    10 on a child view will not result in the next child view being 10px below
    it, unless the next child view also specified `marginTop` as 10.

    What this means is that it takes less configuration if you set `spacing` to
    be the _smallest margin you wish to exist_ and then use the overrides to
    expand it if necessary.  For example, if `spacing` is 5, setting
    `marginBottom` to 10 on a child view will result in the next child view
    being 10px below it, without having to specify `marginTop` on that next
    child view.
  */
  VERTICAL_STACK: {

    /** @private */
    adjustChildViews: function (view) {
      var childViews = view.get('childViews'),
        options = view.get('childViewLayoutOptions') || {},
        lastMargin = 0, // Used to avoid adding spacing to the final margin.
        i, len,
        marginBottom = options.paddingBefore || 0,
        animateOptions = options.animateOptions,
        paddingAfter = options.paddingAfter || 0,
        position = 0,
        spacing = options.spacing || 0;

      for (i = 0, len = childViews.get('length'); i < len; i++) {
        var childView = childViews.objectAt(i),
          marginTop;

        // Ignore child views with useAbsoluteLayout true, useStaticLayout true or that are not visible.
        if (childView.get('useAbsoluteLayout') || !childView.get('isVisible') ||
          childView.get('useStaticLayout')) { continue; }

        //@if(debug)
        // Add some developer support.
        var layout = childView.get('layout');

        if (SC.none(layout.height)) {
          SC.warn('Developer Warning: The SC.View.VERTICAL_STACK plugin requires that each childView layout contains at least a height and optionally also left and right, left and width, right and width or centerX and width.  The childView %@ has an invalid layout: %@'.fmt(childView, SC.stringFromLayout(layout)));
          return;
        }
        //@endif

        // Determine the top margin.
        marginTop = childView.get('marginTop') || 0;
        position += Math.max(marginBottom, marginTop);

        if (childView.getPath('layout.top') !== position) {
          if (animateOptions) {
            childView.animate('top', position, animateOptions);
          } else {
            childView.adjust('top', position);
          }
        }
        position += childView.getPath('borderFrame.height');

        // Determine the bottom margin.
        lastMargin = childView.get('marginBottom') || 0;
        marginBottom = lastMargin || spacing;
      }

      // Adjust our frame to fit as well, this ensures that scrolling works.
      paddingAfter = Math.max(lastMargin, paddingAfter);
      if (view.getPath('layout.height') !== position) {
        if (animateOptions) {
          view.animate('height', position + paddingAfter, animateOptions);
        } else {
          view.adjust('height', position + paddingAfter);
        }
      }
    },

    beginObserving: function (view) {
      // Add observers on layout and isVisible.
      var childViews = view.get('childViews'), i, len;

      for (i = 0, len = childViews.get('length'); i < len; i++) {
        var childView = childViews.objectAt(i);
        if (!childView.hasObserverFor('layout') && !childView.get('useStaticLayout')) {
          childView.addObserver('layout', view, view.childViewLayoutNeedsUpdate);
          childView.addObserver('marginTop', view, view.childViewLayoutNeedsUpdate);
          childView.addObserver('marginBottom', view, view.childViewLayoutNeedsUpdate);
          childView.addObserver('isVisible', view, view.childViewLayoutNeedsUpdate);
        }
      }
    }

  }

});
