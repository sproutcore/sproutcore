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
  SCALE: {

    /** @private */
    setupIn: function (view, options) {
      // Cache the original scale on the view, so that we can reset properly.
      view._preScaleInScale = view.get('layout').scale || null;

      view.adjust({ scale: 0 });
    },

    /** @private */
    runIn: function (view, options, context) {
      var transition = this;

      view.animate('scale', view._preScaleInScale || 1, {
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
      // Reset the scale to its original value (may be undefined).
      view.adjust({ scale: view._preScaleInScale });

      // Clean up.
      delete view._preScaleInScale;
    },

    /** @private */
    setupOut: function (view, options) {
      // Cache the original scale on the view, so that we can reset properly.
      view._preScaleOutScale = view.get('layout').scale;
    },

    /** @private */
    runOut: function (view, options, context) {
      var transition = this;

      view.animate('scale', 0, {
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
      // Reset the scale to its original value (may be undefined).
      view.adjust({ scale: view._preScaleOutScale || null });

      // Clean up.
      delete view._preScaleOutScale;
    }

  }
});
