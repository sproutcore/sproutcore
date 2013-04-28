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
  BOUNCE_IN: {

    /** @private */
    setup: function (view, options) {
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
      view._preBounceInFrame = viewFrame;
      view._preBounceInLayout = SC.clone(view.get('layout'));
      view.adjust({ bottom: null, left: left || viewFrame.x, right: null, top: top || viewFrame.y, height: viewFrame.height, width: viewFrame.width });
    },

    /** @private */
    run: function (view, options) {
      var layout = view.get('layout'),
        bounciness = options.bounciness || 0.25,
        bounce,
        callback,
        duration,
        frames,
        finalValue,
        value, bounce1, bounce2,
        viewFrame = view._preBounceInFrame,
        transition = this;

      switch (options.direction) {
      case 'left':
        finalValue = viewFrame.x;
        value = { left: finalValue };
        bounce = -(finalValue - layout.left) * bounciness;
        bounce1 = { left: finalValue + bounce };
        bounce2 = { left: finalValue + (bounce * 0.5) };
        break;
      case 'up':
        finalValue = viewFrame.y;
        value = { top: finalValue };
        bounce = -(finalValue - layout.top) * bounciness;
        bounce1 = { top: finalValue + bounce };
        bounce2 = { top: finalValue + (bounce * 0.5) };
        break;
      case 'down':
        finalValue = viewFrame.y;
        value = { top: finalValue };
        bounce = (layout.top - finalValue) * bounciness;
        bounce1 = { top: finalValue + bounce };
        bounce2 = { top: finalValue + (bounce * 0.5) };
        break;
      default:
        finalValue = viewFrame.x;
        value = { left: finalValue };
        bounce = (layout.left - finalValue) * bounciness;
        bounce1 = { left: finalValue + bounce };
        bounce2 = { left: finalValue + (bounce * 0.5) };
      }

      // Split the duration evenly per frame.
      duration = options.duration || 0.4;
      duration = duration * 0.2;

      // Define the frames.
      frames = [
        { value: value, duration: duration, timing: 'ease-in' },
        { value: bounce1, duration: duration, timing: 'ease-out' },
        { value: value, duration: duration, timing: 'ease-in' },
        { value: bounce2, duration: duration, timing: 'ease-out' },
        { value: value, duration: duration, timing: 'ease-in' }
      ];

      callback = function () {
        // Only send the '_didTransitionIn' event if the view is still in the 'attached_building_in' or 'attached_showing' state by the time it transitions in.
        var state = view.get('_state');

        if (state === 'attached_building_in' || state === 'attached_showing') {
          view._didTransitionIn(transition, options);
        }
      };

      // Animate through the frames.
      view._animateFrames(frames, callback, options.delay || 0);
    },

    /** @private */
    cancel: function (view, options) {
      view.cancelAnimation();
      this.teardown(view, options);
    },

    /** @private */
    teardown: function (view, options) {
      // Reset the layout to its original value.
      view.adjust(view._preBounceInLayout);

      // Clean up.
      view._preBounceInLayout = null;
      view._preBounceInFrame = null;
    }

  },

  /** @class

    @extends SC.TransitionProtocol
    @since Version 1.10
  */
  BOUNCE_OUT: {

    /** @private */
    setup: function (view, options) {
      var viewFrame = view.get('borderFrame'),
        left = viewFrame.x,
        top = viewFrame.y,
        height = viewFrame.height,
        width = viewFrame.width;

      view._preBounceOutLayout = SC.clone(view.get('layout'));
      view.adjust({ centerX: null, centerY: null, bottom: null, left: left, right: null, top: top, height: height, width: width });
    },

    /** @private */
    run: function (view, options) {
      var bounciness = options.bounciness || 0.25,
        bounce,
        bounce1, bounce2,
        callback,
        duration,
        finalValue,
        layout = view.get('layout'),
        viewFrame = view.get('borderFrame'),
        parentView = view.get('parentView'),
        parentFrame,
        startValue,
        transition = this;

      // If there is no parentView, use the window's frame.
      if (parentView) {
        parentFrame = parentView.get('borderFrame');
      } else {
        parentFrame = SC.RootResponder.responder.currentWindowSize;
      }

      switch (options.direction) {
      case 'left':
        startValue = { left: layout.left };
        finalValue = { left: -viewFrame.width };
        bounce = (layout.left + viewFrame.width) * bounciness;
        bounce1 = { left: layout.left - (bounce * 0.5) };
        bounce2 = { left: layout.left - bounce };
        break;
      case 'up':
        startValue = { top: layout.top };
        finalValue = { top: -viewFrame.height };
        bounce = (layout.top + viewFrame.height) * bounciness;
        bounce1 = { top: layout.top - (bounce * 0.5) };
        bounce2 = { top: layout.top - bounce };
        break;
      case 'down':
        startValue = { top: layout.top };
        finalValue = { top: parentFrame.height };
        bounce = (parentFrame.height - layout.top) * bounciness;
        bounce1 = { top: layout.top + (bounce * 0.5) };
        bounce2 = { top: layout.top + bounce };
        break;
      default:
        startValue = { left: layout.left };
        finalValue = { left: parentFrame.width };
        bounce = (parentFrame.width - layout.left) * bounciness;
        bounce1 = { left: layout.left + (bounce * 0.5) };
        bounce2 = { left: layout.left + bounce };
      }

      // Split the duration evenly per frame.
      duration = options.duration || 0.4;
      duration = duration * 0.2;

      // Define the frames.
      frames = [
        { value: bounce1, duration: duration, timing: 'ease-out' },
        { value: startValue, duration: duration, timing: 'ease-in' },
        { value: bounce2, duration: duration, timing: 'ease-out' },
        { value: startValue, duration: duration, timing: 'ease-in' },
        { value: finalValue, duration: duration, timing: 'ease-in' }
      ];

      callback = function () {
        // Only send the '_didTransitionOut' event if the view is still in the 'attached_hiding' or 'attached_hiding' state by the time it transitions in.
        var state = view.get('_state');

        if (state === 'attached_building_out' || state === 'attached_hiding') {
          view._didTransitionOut(transition, options);
        }
      };

      // Animate through the frames.
      view._animateFrames(frames, callback, options.delay || 0);
    },

    /** @private */
    cancel: function (view, options) {
      view.cancelAnimation();
      this.teardown(view, options);
    },

    /** @private */
    teardown: function (view, options) {
      // Convert to previous layout.
      view.adjust(view._preBounceOutLayout);

      // Clean up.
      view._preBounceOutLayout = null;
    }
  },

  /** @class

    @extends SC.TransitionProtocol
    @see SC.View#animate for other timing functions.
    @since Version 1.10
  */
  FADE_IN: {

    /** @private */
    setup: function (view, options) {
      // Cache the original opacity on the view, so that we can reset properly.
      view._preFadeInOpacity = view.get('layout').opacity;

      view.adjust({ opacity: 0 });
    },

    /** @private */
    run: function (view, options) {
      var transition = this;

      view.animate('opacity', 1, {
        delay: options.delay || 0,
        duration: options.duration || 0.4,
        timing: options.timing || 'ease'
      }, function (data) {
        // Only send the '_didTransitionIn' event if the view is still in the 'attached_building_in' or 'attached_showing' state by the time it transitions in.
        var state = this.get('_state');

        if (state === 'attached_building_in' || state === 'attached_showing') {
          this._didTransitionIn(transition, options);
        }
      });
    },

    /** @private */
    cancel: function (view, options) {
      view.cancelAnimation();
      this.teardown(view, options);
    },

    /** @private */
    teardown: function (view, options) {
      // Reset the opacity to its original value (may be undefined).
      view.adjust({ opacity: view._preFadeInOpacity || null });

      // Clean up.
      delete view._preFadeInOpacity;
    }

  },

  /** @class

    @extends SC.TransitionProtocol
    @see SC.View#animate for other timing functions.
    @since Version 1.10
  */
  FADE_OUT: {

    /** @private */
    setup: function (view, options) {
      // Cache the original opacity on the view, so that we can reset properly.
      view._preFadeOutOpacity = view.get('layout').opacity;
    },

    /** @private */
    run: function (view, options) {
      var transition = this;

      view.animate('opacity', 0, {
        delay: options.delay || 0,
        duration: options.duration || 0.4,
        timing: options.timing || 'ease'
      }, function (data) {
        // Only send the '_didTransitionOut' event if the view is still in the 'attached_building_out' or 'attached_hiding' state by the time it transitions out.
        var state = this.get('_state');

        if (state === 'attached_building_out' || state === 'attached_hiding') {
          this._didTransitionOut(transition, options);
        }
      });
    },

    /** @private */
    cancel: function (view, options) {
      view.cancelAnimation();
      this.teardown(view, options);
    },

    /** @private */
    teardown: function (view, options) {
      // Reset the opacity to its original value (may be undefined).
      view.adjust({ opacity: view._preFadeOutOpacity || null });

      // Clean up.
      delete view._preFadeOutOpacity;
    }

  },

  /** @class

    @extends SC.TransitionProtocol
    @see SC.View#animate for other timing functions.
    @since Version 1.10
  */
  MOVE_IN: {

    /** @private */
    setup: function (view, options) {
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
      view._preMoveInFrame = viewFrame;
      view._preMoveInLayout = SC.clone(view.get('layout'));
      view.adjust({ bottom: null, left: left || viewFrame.x, right: null, top: top || viewFrame.y, height: viewFrame.height, width: viewFrame.width });
    },

    /** @private */
    run: function (view, options) {
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
        // Only send the '_didTransitionIn' event if the view is still in the 'attached_building_in' or 'attached_showing' state by the time it transitions in.
        var state = this.get('_state');

        if (state === 'attached_building_in' || state === 'attached_showing') {
          this._didTransitionIn(transition, options);
        }
      });
    },

    /** @private */
    cancel: function (view, options) {
      view.cancelAnimation();
      this.teardown(view, options);
    },

    /** @private */
    teardown: function (view, options) {
      // Reset the layout to its original value.
      view.adjust(view._preMoveInLayout);

      // Clean up.
      view._preMoveInLayout = null;
      view._preMoveInFrame = null;
    }

  },

  /** @class

    @extends SC.TransitionProtocol
    @see SC.View#animate for other timing functions.
    @since Version 1.10
  */
  MOVE_OUT: {

    /** @private */
    setup: function (view, options) {
      var viewFrame = view.get('borderFrame'),
        left = viewFrame.x,
        top = viewFrame.y,
        height = viewFrame.height,
        width = viewFrame.width;

      view._preMoveOutLayout = SC.clone(view.get('layout'));
      view.adjust({ centerX: null, centerY: null, bottom: null, left: left, right: null, top: top, height: height, width: width });
    },

    /** @private */
    run: function (view, options) {
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
        // Only send the '_didTransitionOut' event if the view is still in the 'attached_building_out' or 'attached_hiding' state by the time it transitions out.
        var state = this.get('_state');

        if (state === 'attached_building_out' || state === 'attached_hiding') {
          this._didTransitionOut(transition, options);
        }
      });
    },

    /** @private */
    cancel: function (view, options) {
      view.cancelAnimation();
      this.teardown(view, options);
    },

    /** @private */
    teardown: function (view, options) {
      // Convert to previous layout.
      view.adjust(view._preMoveOutLayout);

      // Clean up.
      view._preMoveOutLayout = null;
    }
  },

  /** @class

    @extends SC.TransitionProtocol
    @see SC.View#animate for other timing functions.
    @since Version 1.10
  */
  SCALE_IN: {

    /** @private */
    setup: function (view, options) {
      // Cache the original scale on the view, so that we can reset properly.
      view._preScaleInScale = view.get('layout').scale;

      view.adjust({ scale: 0 });
    },

    /** @private */
    run: function (view, options) {
      var transition = this;

      view.animate('scale', view._preScaleInScale || 1, {
        delay: options.delay || 0,
        duration: options.duration || 0.4,
        timing: options.timing || 'ease'
      }, function (data) {
        // Only send the '_didTransitionIn' event if the view is still in the 'attached_building_in' or 'attached_showing' state by the time it transitions in.
        var state = this.get('_state');

        if (state === 'attached_building_in' || state === 'attached_showing') {
          this._didTransitionIn(transition, options);
        }
      });
    },

    /** @private */
    cancel: function (view, options) {
      view.cancelAnimation();
      this.teardown(view, options);
    },

    /** @private */
    teardown: function (view, options) {
      // Reset the scale to its original value (may be undefined).
      view.adjust({ scale: view._preScaleInScale || null });

      // Clean up.
      delete view._preScaleInScale;
    }

  },

  /** @class

    @extends SC.TransitionProtocol
    @see SC.View#animate for other timing functions.
    @since Version 1.10
  */
  SCALE_OUT: {

    /** @private */
    setup: function (view, options) {
      // Cache the original scale on the view, so that we can reset properly.
      view._preScaleOutScale = view.get('layout').scale;
    },

    /** @private */
    run: function (view, options) {
      var transition = this;

      view.animate('scale', 0, {
        delay: options.delay || 0,
        duration: options.duration || 0.4,
        timing: options.timing || 'ease'
      }, function (data) {
        // Only send the '_didTransitionOut' event if the view is still in the 'attached_building_out' or 'attached_hiding' state by the time it transitions out.
        var state = this.get('_state');

        if (state === 'attached_building_out' || state === 'attached_hiding') {
          this._didTransitionOut(transition, options);
        }
      });
    },

    /** @private */
    cancel: function (view, options) {
      view.cancelAnimation();
      this.teardown(view, options);
    },

    /** @private */
    teardown: function (view, options) {
      // Reset the scale to its original value (may be undefined).
      view.adjust({ scale: view._preScaleOutScale || null });

      // Clean up.
      delete view._preScaleOutScale;
    }

  }

});


// This adds transition engine constants to SC.ContainerView.
SC.mixin(SC.ContainerView,
/** @scope SC.ContainerView.prototype */ {

  /** @class
    Provides dissolve transitions to SC.ContainerView.  The new content will
    fade in as the old content fades out of the view.

    To modify the dissolve animation, you can set the following transition
    options:

      - duration {Number} the number of seconds for the animation.  Default: 0.4
      - timing {String} the animation timing function.  Default: 'ease'

    @extends SC.TransitionProtocol
    @see SC.View#animate for other timing functions.
    @since Version 1.10
  */
  DISSOLVE: {

    /** @private */
    willBuildInToView: function (container, content, previousStatechart, options) {
      content.adjust({ opacity: 0 });
    },

    /** @private */
    buildInToView: function (statechart, container, content, previousStatechart, options) {
      content.animate('opacity', 1, {
        duration: options.duration || 0.4,
        timing: options.timing || 'ease'
      }, function (data) {
        // We may already be in exiting state by the time we transition in.
        if (statechart.get('state') === 'entering') {
          statechart.entered();
        }
      });
    },

    /** @private */
    buildOutFromView: function (statechart, container, content, options, exitCount) {
      // We can call this transition repeatedly without effecting the current exit transition.
      if (exitCount == 1) {
        // Fade the current content at the same time.
        content.animate('opacity', 0, {
          duration: options.duration || 0.4,
          timing: options.timing || 'ease'
        }, function (data) {
          statechart.exited();
        });
      }
    },

    /** @private */
    didBuildOutFromView: function (container, content, options) {
      // Reset the opacity in case this view is used elsewhere.
      content.adjust({ opacity: 1 });
    }

  },

  /** @class
    Provides fade through color transitions to SC.ContainerView.  The old
    content will fade out to a color and the new content will then fade in.

    To modify the fade through color animation, you can set the following
    transition options:

      - color {String} any valid CSS Color.  Default: 'black'
      - duration {Number} the number of seconds for the animation.  Default: 0.4
      - timing {String} the animation timing function.  Default: 'ease'

    @extends SC.TransitionProtocol
    @see SC.View#animate for other timing functions.
    @since Version 1.10
  */
  FADE_COLOR: {

    /** @private */
    willBuildInToView: function (container, content, previousStatechart, options) {
      var color,
        colorView;

      content.adjust({ opacity: 0 });

      // Create a color view to fade through.
      color = SC.Color.from(options.color || 'black');
      colorView = SC.View.create({
        layout: { opacity: 0, zIndex: 1 },
        render: function (context) {
          context.addStyle('background-color', color.get('cssText'));
        }
      });
      container.appendChild(colorView);
    },

    /** @private */
    buildInToView: function (statechart, container, content, previousStatechart, options) {
      var childViews = container.get('childViews'),
        colorView;

      colorView = childViews.objectAt(childViews.get('length') - 1);

      // Fade the color in (uses half the total duration)
      colorView.animate('opacity', 1, {
        duration: options.duration * 0.5 || 0.4,
        timing: options.timing || 'ease-in'
      }, function () {
        // Show new content, then fade the color out.
        content.adjust('opacity', 1);

        colorView.animate('opacity', 0, {
          duration: options.duration * 0.5 || 0.4,
          timing: options.timing || 'ease-in'
        }, function (data) {
          // It's best to clean up the colorView here rather than try to find it again on teardown,
          // since multiple color views could be added.
          container.removeChild(this);
          this.destroy();

          // We may already be in exiting state by the time we transition in.
          if (statechart.get('state') === 'entering') {
            statechart.entered();
          }
        });
      });
    }

  },


  /** @class
    Provides move in transitions to SC.ContainerView.  The new content will
    move in over top of the old content.

    To modify the move in animation, you can set the following transition
    options:

      - direction {String} the direction to move new content in.  Default: 'left'.
        ** 'left' - moves new content from the right to the left
        ** 'right' - moves new content from the left to the right
        ** 'up' - moves new content from the bottom to the top
        ** 'down' - moves new content from the top to the bottom
      - duration {Number} the number of seconds for the animation.  Default: 0.4
      - timing {String} the animation timing function.  Default: 'ease'

    @extends SC.TransitionProtocol
    @see SC.View#animate for other timing functions.
    @since Version 1.10
  */
  MOVE_IN: {

    /** @private */
    willBuildInToView: function (container, content, previousStatechart, options) {
      var frame = container.get('frame'),
        left,
        top,
        height,
        width;

      height = frame.height;
      width = frame.width;

      switch (options.direction) {
      case 'right':
        left = -width;
        break;
      case 'up':
        top = height;
        break;
      case 'down':
        top = -height;
        break;
      default:
        left = width;
      }

      content.adjust({ bottom: null, left: left || 0, right: null, top: top || 0, height: height, width: width });
    },

    /** @private */
    buildInToView: function (statechart, container, content, previousStatechart, options) {
      var key,
        value;

      switch (options.direction) {
      case 'right':
        key = 'left';
        break;
      case 'up':
        key = 'top';
        break;
      case 'down':
        key = 'top';
        break;
      default:
        key = 'left';
      }

      content.animate(key, 0, {
        duration: options.duration || 0.4,
        timing: options.timing || 'ease'
      }, function (data) {
        // We may already be in exiting state by the time we transition in.
        if (statechart.get('state') === 'entering') {
          statechart.entered();
        }
      });
    },

    /** @private */
    didBuildInToView: function (container, content, options) {
      // Convert to a flexible layout.
      content.adjust({ bottom: 0, right: 0, height: null, width: null });
    },

    /** @private */
    didBuildOutFromView: function (container, content, options) {
      // Convert to a flexible layout (in case we never fully entered).
      content.adjust({ bottom: 0, right: 0, height: null, width: null });
    }
  },

  /** @class
    Provides push transitions to SC.ContainerView.  The new content will push
    the old content out of the view.

    To modify the push animation, you can set the following transition options:

      - direction {String} the direction to push new content in.  Default: 'left'
        ** 'left' - pushes new content from the right to the left
        ** 'right' - pushes new content from the left to the right
        ** 'up' - pushes new content from the bottom to the top
        ** 'down' - pushes new content from the top to the bottom
      - duration {Number} the number of seconds for the animation.  Default: 0.4
      - timing {String} the animation timing function.  Default: 'ease'

    @extends SC.TransitionProtocol
    @see SC.View#animate for other timing functions.
    @since Version 1.10
  */
  PUSH: {

    /** @private */
    willBuildInToView: function (container, content, previousStatechart, options) {
      var adjustLeft = 0,
        adjustTop = 0,
        frame = container.get('frame'),
        left = 0,
        top = 0,
        height,
        width;

      height = frame.height;
      width = frame.width;

      // Push on to the edge of whatever the current position of previous content is.
      if (previousStatechart && previousStatechart.get('content')) {
        var adjustments = previousStatechart.getPath('content.liveAdjustments');

        adjustLeft = adjustments.left || 0;
        adjustTop = adjustments.top || 0;
      }

      switch (options.direction) {
      case 'right':
        left = -width + adjustLeft;
        break;
      case 'up':
        top = height + adjustTop;
        break;
      case 'down':
        top = -height + adjustTop;
        break;
      default:
        left = width + adjustLeft;
      }

      // Convert to an animatable layout.
      content.adjust({ bottom: null, right: null, left: left, top: top, height: height, width: width });
    },

    /** @private */
    buildInToView: function (statechart, container, content, previousStatechart, options) {
      var key;

      switch (options.direction) {
      case 'up':
        key = 'top';
        break;
      case 'down':
        key = 'top';
        break;
      default:
        key = 'left';
      }

      content.animate(key, 0, {
        duration: options.duration || 0.4,
        timing: options.timing || 'ease'
      }, function (data) {
        // We may already be in exiting state by the time we transition in.
        if (statechart.get('state') === 'entering') {
          statechart.entered();
        }
      });
    },

    /** @private */
    didBuildInToView: function (container, content, options) {
      // Convert to a flexible layout.
      content.adjust({ bottom: 0, right: 0, height: null, width: null });
    },

    /** @private */
    willBuildOutFromView: function (container, content, options) {
      var frame = container.get('frame'),
        height,
        width;

      height = frame.height;
      width = frame.width;

      // Convert to an animatable layout.
      content.adjust({ bottom: null, right: null, height: height, width: width });
    },

    /** @private */
    buildOutFromView: function (statechart, container, content, options, exitCount) {
      var frame = container.get('frame'),
        key,
        value;

      switch (options.direction) {
      case 'right':
        key = 'left';
        value = frame.width;
        break;
      case 'up':
        key = 'top';
        value = -frame.height;
        break;
      case 'down':
        key = 'top';
        value = frame.height;
        break;
      default:
        key = 'left';
        value = -frame.width;
      }

      content.animate(key, value * exitCount, {
        duration: options.duration || 0.4,
        timing: options.timing || 'ease'
      }, function (data) {
        if (!data.isCancelled) {
          statechart.exited();
        }
      });
    },

    /** @private */
    didBuildOutFromView: function (container, content, options) {
      // Convert to a flexible layout.
      content.adjust({ bottom: 0, right: 0, height: null, width: null });
    },

    /** @private */
    transitionClippingFrame: function (container, clippingFrame, options) {
      var frame = container.get('frame');

      switch (options.direction) {
      case 'right':
        clippingFrame.width = frame.width * 2;
        clippingFrame.x = -frame.width;
        break;
      case 'up':
        clippingFrame.height = frame.height * 2;
        clippingFrame.y = -frame.height;
        break;
      case 'down':
        clippingFrame.height = frame.height * 2;
        clippingFrame.y = 0;
        break;
      default:
        clippingFrame.width = frame.width * 2;
        clippingFrame.x = 0;
      }

      return clippingFrame;
    }
  },

  /** @class
    Provides reveal transitions to SC.ContainerView.  The old content will
    move out revealing the new content underneath.

    To modify the reveal animation, you can set the following transition
    options:

      - direction {String} The direction to move old content off.  Default: 'left'
        ** 'left' - moves old content off to the left
        ** 'right' - moves old content off to the right
        ** 'up' - moves old content off to the top
        ** 'down' - moves old content off to the bottom
      - duration {Number} the number of seconds for the animation.  Default: 0.4
      - timing {String} the animation timing function.  Default: 'ease'

    @extends SC.TransitionProtocol
    @see SC.View#animate for other timing functions.
    @since Version 1.10
  */
  REVEAL: {

    /** @private */
    willBuildOutFromView: function (container, content, options, exitCount) {
      var frame = container.get('frame'),
        height,
        width;

      height = frame.height;
      width = frame.width;

      // Convert to a fixed layout. Put this view on top.
      content.adjust({ bottom: null, right: null, height: height, width: width, zIndex: exitCount });
    },

    /** @private */
    buildOutFromView: function (statechart, container, content, options, exitCount) {
      // We can call this transition repeatedly without effecting the current exit transition.
      if (exitCount === 1) {
        var frame = container.get('frame'),
          key,
          value;

        switch (options.direction) {
        case 'right':
          key = 'left';
          value = -frame.width;
          break;
        case 'up':
          key = 'top';
          value = -frame.height;
          break;
        case 'down':
          key = 'top';
          value = frame.height;
          break;
        default:
          key = 'left';
          value = frame.width;
        }

        content.animate(key, value, {
          duration: options.duration || 0.4,
          timing: options.timing || 'ease'
        }, function (data) {
          if (!data.isCancelled) {
            statechart.exited();
          }
        });
      }
    },

    /** @private */
    didBuildOutFromView: function (container, content, options) {
      // Convert to a flexible layout.
      content.adjust({ bottom: 0, right: 0, height: null, width: null, zIndex: null });
    }

  }

});
