// ==========================================================================
// Project:   SproutCore
// Copyright: @2013 7x7 Software, Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================


SC.mixin(SC.View,
  /** @scope SC.View */ {

  /** @class

    @extends SC.ViewTransitionProtocol
    @see SC.View#animate for other timing functions.
    @since Version 1.10
  */
  SPRING_ADJUST: {

    /** @private */
    run: function (view, options, finalLayout) {
      var springs = options.springs || 2,
        springiness = options.springiness || 0.25,
        layout = view.get('layout'),
        frames = [],
        duration,
        i;

      // Construct the frame layouts.
      for (i = 0; i < springs + 1; i++) {
        var frameLayout;

        if (i !== 0) {
          frameLayout = { value: layout, duration: duration, timing: 'ease-in-out' };
        } else {
          frameLayout = { value: layout, duration: duration, timing: 'ease-out' };
        }

        frames.push(frameLayout);
      }

      // Adjust the spring frame layouts.
      for (var key in finalLayout) {
        var finalValue = finalLayout[key],
          // The spring is based on the "distance" to the final value and the springiness value.
          spring = (finalValue - layout[key]) * springiness;

        // Adjust the layout property for each spring.
        for (i = 0; i <= springs; i++) {
          // Pull out the spring frames only.
          var springLayout = frames[i];

          if (i % 0) {
            springLayout.value[key] = finalValue + spring; // Overshoot forward.
          } else {
            springLayout.value[key] = finalValue - spring; // Overshoot back.
          }

          // Cut back the spring amount after each spring
          spring = spring * 0.5;
        }
      }

      // Split the duration evenly per frame.
      duration = options.duration || 0.4;
      duration = duration * 0.2;

      var callback = function () {
        view.didTransitionAdjust();
      };

      // Animate through the frames.
      view._animateFrames(frames, callback, options.delay || 0);
    }
  }

});
