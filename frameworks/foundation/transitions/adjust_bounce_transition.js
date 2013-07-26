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
  BOUNCE_ADJUST: {

    /** @private */
    run: function (view, options, finalLayout) {
      var bounces = options.bounces || 2,
        bounciness = options.bounciness || 0.25,
        layout = view.get('layout'),
        frames = [],
        duration,
        i;

      // Construct the frame layouts.
      for (i = 0; i < bounces * 2 + 1; i++) {
        var frameLayout;

        if (i % 2) {
          // Hit target.
          frameLayout = { value: layout, duration: duration, timing: 'ease-in' };
        } else {
          // Bounce back.
          frameLayout = { value: layout, duration: duration, timing: 'ease-out' };
        }

        frames.push(frameLayout);
      }

      // Adjust the bounce frame layouts.
      for (var key in finalLayout) {
        var finalValue = finalLayout[key],
          // The bounce is based on the "distance" to the final value and the bounciness value.
          bounce = (finalValue - layout[key]) * bounciness;

        // Adjust the layout property for each bounce.
        for (i = 1; i <= bounces; i++) {
          // Pull out the bounce frames only.
          var bounceLayout = frames[i * 2];

          bounceLayout.value[key] = finalValue - bounce;

          // Cut back the bounce amount after each bounce
          bounce = bounce * 0.5;
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
