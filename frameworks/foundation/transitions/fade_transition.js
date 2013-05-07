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
  FADE: {

    /** @private */
    setupIn: function (view, options) {
      // Cache the original opacity on the view, so that we can reset properly.
      view._preFadeInOpacity = view.get('layout').opacity;

      view.adjust({ opacity: 0 });
    },

    /** @private */
    runIn: function (view, options, context) {
      var transition = this;

      view.animate('opacity', 1, {
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
      // Reset the opacity to its original value (may be undefined).
      view.adjust({ opacity: view._preFadeInOpacity || null });

      // Clean up.
      delete view._preFadeInOpacity;
    },

    /** @private */
    setupOut: function (view, options) {
      // Cache the original opacity on the view, so that we can reset properly.
      view._preFadeOutOpacity = view.get('layout').opacity;
    },

    /** @private */
    runOut: function (view, options, context) {
      var transition = this;

      view.animate('opacity', 0, {
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
      // Reset the opacity to its original value (may be undefined).
      view.adjust({ opacity: view._preFadeOutOpacity || null });

      // Clean up.
      delete view._preFadeOutOpacity;
    }

  }

});
