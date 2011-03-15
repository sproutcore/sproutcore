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
    for(key in hash) {
      if (!hash.hasOwnProperty(key) || !SC.ANIMATABLE_PROPERTIES[key]) { continue; }
      value = hash[key];
      cur = layout[key];
      curAnim = layout.animate[key];

      // loose comparison used instead of (value === null || value === undefined)
      if (value == null) { throw "Can only animate to an actual value!"; }

      // FIXME: We should check more than duration
      if (cur !== value || (curAnim && curAnim.duration !== options.duration)) {
        didChange = YES;
        layout.animate[key] = options;
        layout[key] = value;
      }
    }

    // now set adjusted layout
    if (didChange) { this.set('layout', layout) ; }

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
  },

  /**
    Setting wantsAcceleratedLayer to YES will use transforms to move the
    layer when available. On some platforms transforms are hardware accelerated.
  */
  wantsAcceleratedLayer: NO,

  /**
    Specifies whether transforms can be used to move the layer.
  */
  hasAcceleratedLayer: function(){
    if (this.get('wantsAcceleratedLayer') && SC.platform.supportsAcceleratedLayers) {
      var layout = this.get('layout'),
          animations = layout.animate,
          AUTO = SC.LAYOUT_AUTO,
          key;

      if (animations && (animations.top || animations.left)) {
        for (key in animations) {
          // If we're animating other transforms at different speeds, don't use acceleratedLayer
          if (
            SC.CSS_TRANSFORM_MAP[key] &&
            ((animations.top && animations.top.duration !== animations[key].duration) ||
             (animations.left && animations.left.duration !== animations[key].duration))
          ) {
            return NO;
          }
        }
      }

      // loose comparison used instead of (layout.X === null || layout.X === undefined)
      if (
        layout.left != null && !SC.isPercentage(layout.left) && layout.left !== AUTO &&
        layout.top != null && !SC.isPercentage(layout.top) && layout.top !== AUTO &&
        layout.width != null && !SC.isPercentage(layout.width) && layout.width !== AUTO &&
        layout.height != null && !SC.isPercentage(layout.height) && layout.height !== AUTO
      ) {
       return YES;
      }
    }
    return NO;
  }.property('wantsAcceleratedLayer').cacheable()
});
