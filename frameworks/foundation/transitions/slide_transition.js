// ==========================================================================
// Project:   SproutCore
// Copyright: @2013 7x7 Software, Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================


SC.mixin(SC.View,
  /** @scope SC.View */ {

  /** @class

    @extends SC.TransitionProtocol
    @see SC.View#animate for other timing functions.
    @since Version 1.10
  */
  SLIDE: {

    /** @private */
    setupIn: function (view, options) {
      var parentView = view.get('parentView'),
        parentFrame,
        viewFrame = view.get('borderFrame'),
        left,
        top,
        height,
        width;

      // Cache the original layout and frame on the view, so that we can reset properly.
      view._preMoveInFrame = viewFrame;
      view._preMoveInLayout = SC.clone(view.get('layout'));

      // If there is no parentView, use the window's frame.
      if (parentView) {
        parentFrame = parentView.get('borderFrame');
      } else {
        parentFrame = SC.RootResponder.responder.currentWindowSize;
      }

      height = parentFrame.height;
      width = parentFrame.width;

      switch (options.direction) {
      case 'left':
        left = width;
        break;
      case 'up':
        top = height;
        break;
      case 'down':
        top = -height;
        break;
      default:
        left = -width;
      }

      // Convert to a HW accelerate-able layout.
      view.adjust({ bottom: null, left: left || viewFrame.x, right: null, top: top || viewFrame.y, height: viewFrame.height, width: viewFrame.width });
    },

    /** @private */
    runIn: function (view, options, context) {
      var viewFrame = view._preMoveInFrame,
        key,
        value,
        transition = this;

      if (options.direction === 'up' || options.direction === 'down') {
        key = 'top';
        value = viewFrame.y;
      } else {
        key = 'left';
        value = viewFrame.x;
      }

      view.animate(key, value, {
        delay: options.delay || 0,
        duration: options.duration || 0.4,
        timing: options.timing || 'ease'
      }, function (data) {
        this.didTransitionIn(transition, options, context);
      });
    },

    /** @private */
    cancelIn: function (view, options) {
      view.cancelAnimation();
      this.teardown(view, options);
    },

    /** @private */
    teardownIn: function (view, options) {
      // Reset the layout to its original value.
      view.set('layout', view._preMoveInLayout);

      // Clean up.
      view._preMoveInLayout = null;
      view._preMoveInFrame = null;
    },

    /** @private */
    setupOut: function (view, options) {
      var viewFrame = view.get('borderFrame'),
        left = viewFrame.x,
        top = viewFrame.y,
        height = viewFrame.height,
        width = viewFrame.width;

      view._preMoveOutLayout = SC.clone(view.get('layout'));
      view.adjust({ centerX: null, centerY: null, bottom: null, left: left, right: null, top: top, height: height, width: width });
    },

    /** @private */
    runOut: function (view, options, context) {
      var viewFrame = view.get('borderFrame'),
        parentView = view.get('parentView'),
        parentFrame,
        key, value,
        transition = this;

      // If there is no parentView, use the window's frame.
      if (parentView) {
        parentFrame = parentView.get('borderFrame');
      } else {
        parentFrame = SC.RootResponder.responder.currentWindowSize;
      }

      switch (options.direction) {
      case 'left':
        key = 'left';
        value = -viewFrame.width;
        break;
      case 'up':
        key = 'top';
        value = -viewFrame.height;
        break;
      case 'down':
        key = 'top';
        value = parentFrame.height;
        break;
      default:
        key = 'left';
        value = parentFrame.width;
      }

      view.animate(key, value, {
        delay: options.delay || 0,
        duration: options.duration || 0.4,
        timing: options.timing || 'ease'
      }, function (data) {
        this.didTransitionOut(transition, options, context);
      });
    },

    /** @private */
    cancelOut: function (view, options) {
      view.cancelAnimation();
      this.teardown(view, options);
    },

    /** @private */
    teardownOut: function (view, options) {
      // Convert to previous layout.
      view.set('layout', view._preMoveOutLayout);

      // Clean up.
      view._preMoveOutLayout = null;
    }
  }

});
