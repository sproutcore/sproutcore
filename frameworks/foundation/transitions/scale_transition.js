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
        this._didTransitionIn(transition, options);
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
        this._didTransitionOut(transition, options);
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
