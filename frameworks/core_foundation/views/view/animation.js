sc_require("views/view");
sc_require("views/view/layout_style");

/**
  Properties that can be animated
  (Hash for faster lookup)
*/
SC.ANIMATABLE_PROPERTIES = {
  top:     YES,
  left:    YES,
  bottom:  YES,
  right:   YES,
  width:   YES,
  height:  YES,
  centerX: YES,
  centerY: YES,
  opacity: YES,
  scale:   YES,
  rotate:  YES,
  rotateX: YES,
  rotateY: YES,
  rotateZ: YES
};

SC.View.reopen(
  /** @scope SC.View.prototype */ {

  didCreateLayerMixin: function () {
    // Animation prep
    if (SC.platform.supportsCSSTransitions) { this.resetAnimation(); }
  },

  /**
    Animate a given property using CSS animations.

    Takes a key, value and either a duration, or a hash of options.
    The options hash has the following parameters

     - duration: Duration of animation in seconds
     - callback: Callback method to run when animation completes
     - timing: Animation timing function
     - delay: Animation delay in seconds

    @param {String|Hash} key
    @param {Object} value
    @params {Number|Hash} duration or options
    @returns {SC.View} receiver
  */
  animate: function (keyOrHash, valueOrOptions, optionsOrCallback, callback) {
    var cur, curAnim,
      didChange = NO,
      hash, key, layout,
      options, optionsType,
      timing,
      value;

    // Normalize arguments
    if (typeof keyOrHash === SC.T_STRING) {
      hash = {};
      hash[keyOrHash] = valueOrOptions;
      options = optionsOrCallback;
    } else {
      hash = keyOrHash;
      options = valueOrOptions;
      callback = optionsOrCallback;
    }

    optionsType = SC.typeOf(options);
    if (optionsType === SC.T_NUMBER) {
      options = { duration: options };
    } else if (optionsType !== SC.T_HASH) {
      throw "Must provide options hash or duration!";
    }

    // Callback
    if (callback) { options.callback = callback; }

    // In the case of zero duration, just adjust and call the callback.
    if (options.duration === 0) {
      //@if(debug)
      // Provide a little developer support if they are doing something that should be considered wrong.
      SC.warn("Developer Warning: SC.View:animate() was called with a duration of 0 seconds.");
      //@endif
      var ret = this.adjust(hash);
      if (callback) {
        this.layoutStyleCalculator.invokeOnceLater('runAnimationCallback', 1, callback, null, NO);
      }
      return ret;
    }

    // Timing function
    timing = options.timing;
    if (timing) {
      if (typeof timing !== SC.T_STRING) {
        options.timing = "cubic-bezier(" + timing[0] + ", " + timing[1] + ", " +
                                         timing[2] + ", " + timing[3] + ")";
      } // else leave as is (assume proper CSS timing String)
    } else {
      options.timing = 'linear';
    }

    // Delay
    if (SC.none(options.delay)) { options.delay = 0; }

    // Get the layout (may be a partially adjusted one already queued up).
    layout = this._animateLayout || SC.clone(this.get('layout'));
    if (!layout.animate) { layout.animate = {}; }

    // Very similar to #adjust
    for (key in hash) {
      // Fast path.
      if (!hash.hasOwnProperty(key) || !SC.ANIMATABLE_PROPERTIES[key]) { continue; }

      value = hash[key];
      cur = layout[key];
      curAnim = layout.animate[key];

      if (SC.none(value)) { throw "Can only animate to an actual value!"; }

      // If the new adjustment changes the previous adjustment's options, overwrite the previous adjustment.
      if (cur !== value || (curAnim && (curAnim.duration !== options.duration || curAnim.timing !== options.timing || curAnim.delay !== options.delay))) {
        didChange = YES;
        layout.animate[key] = options;
        layout[key] = value;
      }
    }

    // If anything did change, prepare adjusted layout.
    if (didChange) {
      this._animateLayout = layout;

      // Always run the animation asynchronously so that the original layout is guaranteed to be applied to the DOM.
      this.invokeOnceLater('_animate');
    } else if (callback) {
      // Otherwise, schedule the callback to run at the end of the runloop.
      this.layoutStyleCalculator.invokeOnceLater('runAnimationCallback', 1, callback, null, NO);
    }

    return this;
  },

  /** @private */
  _animate: function () {
    // Apply the animation layout.
    this.set('layout', this._animateLayout);

    // Clear the layout cache value.
    delete this._animateLayout;
  },

  /**
  Resets animation, stopping all existing animations.
  */
  resetAnimation: function () {
    var layout = this.get('layout'),
      animations = this.layoutStyleCalculator._activeAnimations,
      didChange = NO;

    if (!animations) { return; }

    for (var key in animations) {
      didChange = YES;
      delete animations[key];
    }

    if (didChange) {
      this.set('layout', layout);
      this.notifyPropertyChange('layout');
    }

    return this;
  },

  /**
    Called when animation ends, should not usually be called manually
  */
  transitionDidEnd: function (evt) {
    // WARNING: Sometimes this will get called more than once for a property. Not sure why.
    this.get('layoutStyleCalculator').transitionDidEnd(evt);
  }
});
