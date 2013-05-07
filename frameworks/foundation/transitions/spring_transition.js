// ==========================================================================
// Project:   SproutCore
// Copyright: @2013 7x7 Software, Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================


SC.mixin(SC.View,
  /** @scope SC.View */ {

  /** @class

    @extends SC.TransitionProtocol
    @since Version 1.10
  */
  SPRING: {

    /** @private */
    setupIn: function (view, options) {
      var parentView = view.get('parentView'),
        parentFrame,
        viewFrame = view.get('borderFrame'),
        left,
        top,
        height,
        width;

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

      // Cache the original layout and frame on the view, so that we can reset properly.
      view._preSpringInFrame = viewFrame;
      view._preSpringInLayout = SC.clone(view.get('layout'));
      view.adjust({ bottom: null, left: left || viewFrame.x, right: null, top: top || viewFrame.y, height: viewFrame.height, width: viewFrame.width });
    },

    /** @private */
    runIn: function (view, options, context) {
      var layout = view.get('layout'),
        springiness = options.springiness || 0.25,
        spring,
        callback,
        duration,
        frames,
        finalValue,
        spring1, spring2, spring3,
        value,
        viewFrame = view._preSpringInFrame,
        transition = this;

      switch (options.direction) {
      case 'left':
        finalValue = viewFrame.x;
        value = { left: finalValue };
        spring = (layout.left - finalValue) * springiness;
        spring1 = { left: finalValue - spring };
        spring2 = { left: finalValue + (spring * 0.5) };
        spring3 = { left: finalValue - (spring * 0.25) };
        break;
      case 'up':
        finalValue = viewFrame.y;
        value = { top: finalValue };
        spring = (layout.top - finalValue) * springiness;
        spring1 = { top: finalValue - spring };
        spring2 = { top: finalValue + (spring * 0.5) };
        spring3 = { top: finalValue - (spring * 0.25) };
        break;
      case 'down':
        finalValue = viewFrame.y;
        value = { top: finalValue };
        spring = (finalValue - layout.top) * springiness;
        spring1 = { top: finalValue + spring };
        spring2 = { top: finalValue - (spring * 0.5) };
        spring3 = { top: finalValue + (spring * 0.25) };
        break;
      default:
        finalValue = viewFrame.x;
        value = { left: finalValue };
        spring = (finalValue - layout.left) * springiness;
        spring1 = { left: finalValue + spring };
        spring2 = { left: finalValue - (spring * 0.5) };
        spring3 = { left: finalValue + (spring * 0.25) };
      }

      // Split the duration evenly per frame.
      duration = options.duration || 0.4;
      duration = duration * 0.25;

      // Define the frames.
      frames = [
        { value: spring1, duration: duration, timing: 'ease-out' },
        { value: spring2, duration: duration, timing: 'ease-in-out' },
        { value: spring3, duration: duration, timing: 'ease-in-out' },
        { value: value, duration: duration, timing: 'ease-in-out' }
      ];

      callback = function () {
        view.didTransitionIn(transition, options, context);
      };

      // Animate through the frames.
      view._animateFrames(frames, callback, options.delay || 0);
    },

    /** @private */
    cancelIn: function (view, options) {
      view.cancelAnimation();
      this.teardown(view, options);
    },

    /** @private */
    teardownIn: function (view, options) {
      // Reset the layout to its original value.
      view.set('layout', view._preSpringInLayout);

      // Clean up.
      view._preSpringInLayout = null;
      view._preSpringInFrame = null;
    },

    /** @private */
    setupOut: function (view, options) {
      var viewFrame = view.get('borderFrame'),
        left = viewFrame.x,
        top = viewFrame.y,
        height = viewFrame.height,
        width = viewFrame.width;

      view._preSpringOutLayout = SC.clone(view.get('layout'));
      view.adjust({ centerX: null, centerY: null, bottom: null, left: left, right: null, top: top, height: height, width: width });
    },

    /** @private */
    runOut: function (view, options, context) {
      var springiness = options.springiness || 0.25,
        callback,
        duration,
        finalValue,
        layout = view.get('layout'),
        viewFrame = view.get('borderFrame'),
        parentView = view.get('parentView'),
        parentFrame,
        spring,
        spring1, spring2,
        transition = this;

      // If there is no parentView, use the window's frame.
      if (parentView) {
        parentFrame = parentView.get('borderFrame');
      } else {
        parentFrame = SC.RootResponder.responder.currentWindowSize;
      }

      switch (options.direction) {
      case 'left':
        finalValue = { left: -viewFrame.width };
        spring = (layout.left + viewFrame.width) * springiness;
        spring1 = { left: layout.left - (spring * 0.5) };
        spring2 = { left: layout.left + spring };
        break;
      case 'up':
        finalValue = { top: -viewFrame.height };
        spring = (layout.top + viewFrame.height) * springiness;
        spring1 = { top: layout.top - (spring * 0.5) };
        spring2 = { top: layout.top + spring };
        break;
      case 'down':
        finalValue = { top: parentFrame.height };
        spring = (parentFrame.height - layout.top) * springiness;
        spring1 = { top: layout.top + (spring * 0.5) };
        spring2 = { top: layout.top - spring };
        break;
      default:
        finalValue = { left: parentFrame.width };
        spring = (parentFrame.width - layout.left) * springiness;
        spring1 = { left: layout.left + (spring * 0.5) };
        spring2 = { left: layout.left - spring };
      }

      // Split the duration evenly per frame.
      duration = options.duration || 0.3;
      duration = duration * 0.33;

      // Define the frames.
      frames = [
        { value: spring1, duration: duration, timing: 'ease-in-out' },
        { value: spring2, duration: duration, timing: 'ease-in-out' },
        { value: finalValue, duration: duration, timing: 'ease-in' }
      ];

      callback = function () {
        view.didTransitionOut(transition, options, context);
      };

      // Animate through the frames.
      view._animateFrames(frames, callback, options.delay || 0);
    },

    /** @private */
    cancelOut: function (view, options) {
      view.cancelAnimation();
      this.teardown(view, options);
    },

    /** @private */
    teardownOut: function (view, options) {
      // Convert to previous layout.
      view.set('layout', view._preSpringOutLayout);

      // Clean up.
      view._preSpringOutLayout = null;
    }
  }
});
