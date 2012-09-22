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

  didCreateLayerMixin: function() {
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

    @param {String|Hash} key
    @param {Object} value
    @params {Number|Hash} duration or options
    @returns {SC.View} receiver
  */
  animate: function(keyOrHash, valueOrOptions, optionsOrCallback, callback) {
    var hash, options;

    if (typeof keyOrHash === SC.T_STRING) {
      hash = {};
      hash[keyOrHash] = valueOrOptions;
      options = optionsOrCallback;
    } else {
      hash = keyOrHash;
      options = valueOrOptions;
      callback = optionsOrCallback;
    }

    var optionsType = SC.typeOf(options);
    if (optionsType === SC.T_NUMBER) {
      options = { duration: options };
    } else if (optionsType !== SC.T_HASH) {
      throw "Must provide options hash or duration!";
    }

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

    var timing = options.timing;
    if (timing) {
      if (typeof timing !== SC.T_STRING) {
        options.timing = "cubic-bezier("+timing[0]+", "+timing[1]+", "+
                                         timing[2]+", "+timing[3]+")";
      }
    } else {
      options.timing = 'linear';
    }

    var layout = SC.clone(this.get('layout')), didChange = NO, value, cur, animValue, curAnim, key;

    if (!layout.animate) { layout.animate = {}; }

    // Very similar to #adjust
    for (key in hash) {
      if (!hash.hasOwnProperty(key) || !SC.ANIMATABLE_PROPERTIES[key]) { continue; }
      value = hash[key];
      cur = layout[key];
      curAnim = layout.animate[key];

      if (SC.none(value)) { throw "Can only animate to an actual value!"; }

      // FIXME: We should check more than duration
      if (cur !== value || (curAnim && curAnim.duration !== options.duration)) {
        didChange = YES;
        layout.animate[key] = options;
        layout[key] = value;
      }
    }

    // If anything didChange, set adjusted layout.
    if (didChange) { this.set('layout', layout) ; }
    else if (callback) {
      // Otherwise, schedule the callback to run at the end of the runloop.
      this.layoutStyleCalculator.invokeOnceLater('runAnimationCallback', 1, callback, null, NO);
    }

    return this ;
  },

  /**
  Resets animation, stopping all existing animations.
  */
  resetAnimation: function() {
    var layout = this.get('layout'),
        animations = layout.animate,
        didChange = NO, key;

    if (!animations) { return; }

    var hasAnimations;

    for (key in animations) {
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
  transitionDidEnd: function(evt){
    // WARNING: Sometimes this will get called more than once for a property. Not sure why.
    this.get('layoutStyleCalculator').transitionDidEnd(evt);
  }
});
