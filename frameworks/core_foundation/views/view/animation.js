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

/** @const
  Positions that the view's layout can be set to if it's animation is cancelled.
*/
SC.ANIMATION_POSITION = {
  /** @const
    The previous layout of the view before calling animate.

    For example,

        myView.set('layout', { left: 0, top: 0, width: 100, bottom: 0 });
        myView.animate('left', 300, { duration: 1.5 });

        // later..
        myView.cancelAnimation(SC.ANIMATION_POSITION.start);

        myView.get('layout'); // => { left: 0, top: 0, width: 100, bottom: 0 }
  */
  start: 1,

  /** @const
    The current layout of the view while it is animating.

    For example,

        myView.set('layout', { left: 0, top: 0, width: 100, bottom: 0 });
        myView.animate('left', 300, { duration: 1.5 });

        // later..
        myView.cancelAnimation(SC.ANIMATION_POSITION.current);
        myView.get('layout'); // => { left: 150, top: 0, width: 100, bottom: 0 }
  */
  current: 2,

  /** @const
    The final layout of the view if the animation completed.

    For example,

        myView.set('layout', { left: 0, top: 0, width: 100, bottom: 0 });
        myView.animate('left', 300, { duration: 1.5 });

        // later..
        myView.cancelAnimation(SC.ANIMATION_POSITION.end);
        myView.get('layout'); // => { left: 300, top: 0, width: 100, bottom: 0 }
  */
  end: 3
};

SC.View.reopen(
  /** @scope SC.View.prototype */ {

  /**
    Animate a group of layout properties using CSS animations.

    On supported platforms, this will apply the proper CSS transition style
    in order to animate the view to the new layout.  The properties object
    should contain the names of the layout properties to animate with the new
    layout values as values.

    To control the transition, you must provide an options object that contains
    at least the duration property and optionally the timing and delay
    properties.  The options properties are as follows:

    duration:
      The duration of the transition in seconds.

    timing:
      The transition timing function.  This may be a predefined CSS timing
      function (e.g. 'linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out') or
      it may be an array of values to make a cubic bezier (e.g. [0, 0, 0.58, 1.0]).

    delay:
      The transition delay in seconds.

    For example,

        var myView = SC.View.create({
          layout: { top: 10, left: 10, width: 200, height: 400 }
        });

        MyApp.mainPane.appendChild(myView);

        // The view will animate to the new top & left values.
        myView.animate(
          { top: 200, left: 200 },  // properties
          { duration: 0.75, timing: 'ease-out', delay: 0.5 } // options
        );

    To execute code when the transition completes, you may provide an optional
    target and/or method.  When the given group of transitions completes,
    the callback function will be called once and passed a data object with
    properties containing the event, the view and a boolean isCancelled which
    indicates if the animation had been cancelled or not.  The format of the
    target and method follows the standard SproutCore format, where if the
    target is not given then the view itself will be the target.  The
    method can be a function or a property path to look up on the target.

    For example,

        // Passing a function for method.
        myView.animate(
          { top: 200, left: 200 },  // properties
          { duration: 0.75 }, // options
          function (data) {  // method
            // `this` will be myView
          }
        );

        // Passing a target and method.
        myView.animate(
          { scale: 0, opacity: 0 },  // properties
          { duration: 1.5 }, // options
          MyApp.statechart, // target
          'myViewDidShrink' // method
        );

    The animate functions are intelligent in how they apply animations and
    calling animate in a manner that would effect an ongoing animation (i.e.
    animating left again while it is still in transition) will result in
    the ongoing animation callback firing immediately with isCancelled set to
    YES and adjusting the transition to accomodate the new settings.

    # A note about Hardware Acceleration.

    If a view has a fixed layout (i.e. view.get('isFixedLayout') == YES) then
    it will be eligible for hardware accelerated position transitions. Having a
    fixed layout, simply means that the view has a fixed size (width and height)
    and a fixed position (left and top).  If the view is eligible for hardware
    acceleration, it must also set wantsAcceleratedLayer to YES for animate to
    use hardware accelerated transitions when animating its position.

    Occassionally, you may wish to animate a view with a non-fixed layout.  To
    do so with hardware acceleration, you should convert the view to a fixed
    layout temporarily and then set it back to a flexible layout after the
    transition is complete.

    For example,

        // Flexible layout.
        myView.set('layout', { left: 0, top: 10, right: 0, bottom: 10 });

        // Prepare to animate by converting to a fixed layout.
        frame = myView.get('frame');
        height = frame.height;
        width = frame.width;
        myView.adjust({ right: null, bottom: null, height: height, width: width });

        // Animate (will be hardware accelerated if myView.get('wantsAcceleratedLayout') is YES).
        myView.animate('left', width, { duration: 1 }, function () {
          // Revert back to flexible layout.
          myView.adjust({ right: -width, bottom: 10 });
        });

    Note: This may not work if you are not using SproutCore for view layout,
    which means you should not use it if the view has useStaticLayout set to YES.

    @param {Object} properties Hash of property names with final layout values.
    @param {Object} options Hash of transition options.
    @param {Object} [target] The target for the method.  If not provided, the target will be the view itself.
    @params {Function|String} [method] The method to run when the transition completes.  May be a function or a property path.
    @returns {SC.View} receiver
  */
  animate: function () {
    // Overloaded function.  This exists to make the documentation clearer.
  },

  /**
    Animate a given property using CSS animations.

    @param {String} key The layout property name.
    @param {Number} value The new layout property value.
    @param {Object} options Hash of transition options.
    @param {Object} [target] The target for the method.  If not provided, the target will be the view itself.
    @params {Function|String} [method] The method to run when the transition completes.  May be a function or a property path.
    @returns {SC.View} receiver
  */
  animate: function (key, value, options, target, method) {
    var cur, curAnim,
      valueDidChange = NO,
      optionsDidChange = NO,
      hash, layout,
      optionsType,
      pendingAnimations = this._pendingAnimations,
      timing;

    //@if(debug)
    // Provide a little developer support if they are doing something that should be considered wrong.
    if (this.get('useStaticLayout')) {
      SC.warn("Developer Warning: SC.View:animate() was called on a view with useStaticLayout and may not work.  If you are using CSS to layout the view (i.e. useStaticLayout: YES), then you should manage the animation manually.");
    }
    //@endif

    // Normalize arguments
    if (typeof key === SC.T_STRING) {
      hash = {};
      hash[key] = value;
    } else {
      method = target;
      target = options;
      options = value;
      hash = key;
    }

    optionsType = SC.typeOf(options);
    if (optionsType === SC.T_NUMBER) {
      // This support should be deprecated at some point.  Too much argument overloading.
      options = { duration: options };
    } else if (optionsType !== SC.T_HASH) {
      throw "Must provide options hash or duration!";
    }

    // Callback.  We need to keep the callback for each group of animations separate.
    if (method === undefined) {
      method = target;
      target = this;
    }

    // Support `null` being passed in for the target, rather than dropping the argument.
    if (!target) target = this;

    if (method) {
      if (typeof method === "string") method = target[method];
      options.target = target;
      options.method = method;
    }

    // In the case of zero duration, just adjust and call the callback.
    if (options.duration === 0) {
      //@if(debug)
      // Provide a little developer support if they are doing something that should be considered wrong.
      SC.warn("Developer Warning: SC.View:animate() was called with a duration of 0 seconds.  The view will be adjusted and the callback will fire immediately in the next run loop.");
      //@endif
      this.adjust(hash);
      this.runAnimationCallback(options, null, NO);
      return this;
    }

    // Timing function
    timing = options.timing;
    if (timing) {
      if (typeof timing !== SC.T_STRING) {
        options.timing = "cubic-bezier(" + timing[0] + ", " + timing[1] + ", " +
                                         timing[2] + ", " + timing[3] + ")";
      } // else leave as is (assume proper CSS timing String)
    } else {
      options.timing = 'ease';
    }

    // Delay
    if (SC.none(options.delay)) { options.delay = 0; }

    // Get the layout (may be a previous layout already animating).
    if (!this._prevLayout) {
      this._prevLayout = SC.clone(this.get('layout'));
    }

    if (!pendingAnimations) { pendingAnimations = this._pendingAnimations = {}; }

    // Get the layout (may be a partially adjusted one already queued up).
    layout = this._animateLayout || SC.clone(this.get('layout'));

    // Handle old style rotation.
    if (!SC.none(hash.rotate)) {
      //@if(debug)
      SC.Logger.warn('Developer Warning: Please animate rotateX instead of rotate.');
      //@endif
      if (SC.none(hash.rotateX)) {
        hash.rotateX = hash.rotate;
      }
      delete hash.rotate;
    }

    // Go through the new animated properties and check for conflicts with
    // previous calls to animate and changes to the current layout.
    for (var property in hash) {
      // Fast path.
      if (!hash.hasOwnProperty(property) || !SC.ANIMATABLE_PROPERTIES[property]) {

        //@if(debug)
        if (!SC.ANIMATABLE_PROPERTIES[property]) {
          SC.warn("Developer Warning: The property `%@` is not animatable using SC.View:animate().".fmt(property));
        }
        //@endif
        continue;
      }

      value = hash[property];
      cur = layout[property];
      curAnim = pendingAnimations[property];

      if (SC.none(value)) { throw "Can only animate to an actual value!"; }

      // If the new adjustment changes the previous adjustment's options before
      // it has rendered, overwrite the previous adjustment.
      if (curAnim && (curAnim.duration !== options.duration ||
          curAnim.timing !== options.timing ||
          curAnim.delay !== options.delay)) {
        optionsDidChange = YES;
        this.runAnimationCallback(curAnim, null, YES);
      }

      if (cur !== value) {
        valueDidChange = YES;
        layout[property] = value;
      }

      // Always update the animate hash to the newest options which may have been altered before this was applied.
      pendingAnimations[property] = options;
    }

    // Only animate to new values.
    if (valueDidChange) {
      this._animateLayout = layout;

      // Always run the animation asynchronously so that the original layout is guaranteed to be applied to the DOM.
      this.invokeNext('_animate');
    } else if (!optionsDidChange) {
      this.runAnimationCallback(options, null, NO);
    }

    return this;
  },

  /** @private */
  _animate: function () {
    this.willRenderAnimations();

    // Apply the animation layout.
    this.set('layout', this._animateLayout);

    // Clear the layout cache value.
    delete this._animateLayout;
  },

  /**
    Cancels the animation, adjusting the view's layout to one of three positions
    depending on the value of the finalPosition parameter of either the start,
    current or end layout.  For details @see SC.ANIMATION_POSITION.

    Note: The animation callbacks will still be called with the data object's
    isCancelled property set to YES.

    @param [finalPosition] {SC.ANIMATION_POSITION} The layout to immediately adjust the view to.  SC.ANIMATION_POSITION.end by default.
    @returns this
  */
  cancelAnimation: function (finalPosition) {
    var activeAnimations = this._activeAnimations,
      layout,
      didCancel = NO;

    // Fast path!
    if (!activeAnimations) { return didCancel; }

    switch (finalPosition) {
    case SC.ANIMATION_POSITION.start:
      // Revert back to the start layout.
      layout = this._prevLayout;
      break;
    case SC.ANIMATION_POSITION.current:
      // Stop at the current layout.
      layout = this.get('liveAdjustments');
      break;
    default:
    }

    // Immediately remove the animation styles while calling the callbacks.
    for (var key in activeAnimations) {
      var animation = activeAnimations[key];
      didCancel = YES;

      // Update the animation hash.  Do this first, so callbacks can check for active animations.
      delete activeAnimations[key];

      // Remove the animation style without triggering a layout change.
      this.removeAnimationFromLayout(key, YES);

      // Run the callback.
      this.runAnimationCallback(animation, null, YES);
    }

    // Adjust to final position.
    if (didCancel && !!layout) {
      this.adjust(layout);
    }

    // Clean up.
    delete this._prevLayout;
    delete this._activeAnimations;

    return this;
  },

  /** @private
    This method is called after the layout style is applied to the layer.  If
    the platform didn't support CSS transitions, the callbacks will be fired
    immediately and the animations removed from the queue.
  */
  didRenderAnimations: function () {

    // Transitions not supported
    if (!SC.platform.supportsCSSTransitions) {
      var pendingAnimations = this._pendingAnimations;

      for (var key in pendingAnimations) {
        this.removeAnimationFromLayout(key, NO);
        this.runAnimationCallback(pendingAnimations[key], null, NO);
      }

      // Reset the placeholder variables now that the layout style has been applied.
      this._activeAnimations = this._pendingAnimations = null;
    }
  },

  /** @private
    Returns the live values of the properties being animated on a view while it
    is animating.  Getting the layout of the view after a call to animate will
    include the final values, some of which will not be the same as what they
    are while the animation is in progress.

    Depending on the property being animated, determining the actual value can
    be quite difficult.  For instance, accelerated views will animate certain
    properties using a browser specific CSS transition on a CSS transform and
    the current value may be a CSSMatrix that needs to be mapped back to a
    regular layout format.

    This property is used by cancelAnimation() to stop the animation in its
    current place.

    PRIVATE - because we may want to rename this function and change its output

    @returns {Object}
  */
  liveAdjustments: function () {
    var activeAnimations = this._activeAnimations,
      jqueryEl = this.$(),
      ret = {},
      transformKey = SC.browser.experimentalCSSNameFor('transform');

    if (activeAnimations) {
      for (var key in activeAnimations) {
        if (key === transformKey) {
          var matrix = jqueryEl.css(key),
            CSSMatrixClass = SC.browser.experimentalNameFor(window, 'CSSMatrix');

          if (CSSMatrixClass !== SC.UNSUPPORTED) {
            matrix = new window[CSSMatrixClass](matrix);
            ret.left = parseInt(matrix.m41, 10);
            ret.top = parseInt(matrix.m42, 10);
          } else {
            matrix = matrix.match(/^matrix\((.*)\)$/)[1].split(/,\s*/);
            if (matrix) {
              ret.left = parseInt(matrix[4], 10);
              ret.top = parseInt(matrix[5], 10);
            }
          }
        } else {
          ret[key] = parseInt(jqueryEl.css(key), 10);
        }
      }
    }

    return ret;
  }.property(),

  /** @private Removes the animation CSS from the layer style. */
  removeAnimationFromLayout: function (propertyName, updateStyle) {
    var activeAnimations = this._activeAnimations,
      layer = this.get('layer');

    if (!!layer && updateStyle) {
      var updatedCSS = [];

      // Calculate the transition CSS that should remain.
      for (var key in activeAnimations) {
        if (key !== propertyName) {
          updatedCSS.push(activeAnimations[key].css);
        }
      }

      layer.style[SC.browser.experimentalStyleNameFor('transition')] = updatedCSS.join(', ');
    }
  },

  /** @deprecated
    Resets animation, stopping all existing animations.
  */
  resetAnimation: function () {
    //@if(debug)
    // Reset gives the connotation that the animation would go back to the start layout, but that is not the case.
    SC.warn('Developer Warning: resetAnimation() has been renamed to cancelAnimation().  Please rename all calls to resetAnimation() with cancelAnimation().');
    //@endif

    return this.cancelAnimation();
  },

  /** @private */
  runAnimationCallback: function (animation, evt, cancelled) {
    var method = animation.method,
      target = animation.target;

    if (method) {
      // We're using invokeNext so we don't trigger any layout changes from
      // the callback until the current layout is updated.
      this.invokeNext(function () {
        method.call(target, { event: evt, view: this, isCancelled: cancelled });
      }, this);

      // Always clear the method from the hash to prevent it being called
      // multiple times for animations in the group.
      delete animation.method;
      delete animation.target;
    }
  },

  /** @private
    Called when animation ends, should not usually be called manually
  */
  transitionDidEnd: function (evt) {
    var propertyName = evt.originalEvent.propertyName,
      activeAnimations = this._activeAnimations,
      animation = activeAnimations ? activeAnimations[propertyName] : null;

    if (animation) {
      // Update the animation hash.  Do this first, so callbacks can check for active animations.
      delete activeAnimations[propertyName];

      // Remove the animation style without triggering a layout change.
      this.removeAnimationFromLayout(propertyName, YES);

      // Run the callback.
      this.runAnimationCallback(animation, evt, NO);

      // Clean up the internal hash.
      this._activeAnimationsLength -= 1;
      if (this._activeAnimationsLength === 0) {
        delete this._activeAnimations;
        delete this._prevLayout;
      }
    }
  },

  /** @private
   This method is called before the layout style is applied to the layer.  If
   animations have been defined for the view, they will be included in
   this._pendingAnimations.  This method will clear out any conflicts between
   pending and active animations.
   */
  willRenderAnimations: function () {
    if (SC.platform.supportsCSSTransitions) {
      var pendingAnimations = this._pendingAnimations;

      if (pendingAnimations) {
        var activeAnimations = this._activeAnimations;

        if (!activeAnimations) {
          this._activeAnimationsLength = 0;
          activeAnimations = {};
        }

        for (var key in pendingAnimations) {
          if (!pendingAnimations.hasOwnProperty(key)) { continue; }

          var activeAnimation = activeAnimations[key],
            pendingAnimation = pendingAnimations[key];

          if (activeAnimation) {
            this.runAnimationCallback(activeAnimation, null, YES);
          }

          activeAnimations[key] = pendingAnimation;
          this._activeAnimationsLength += 1;
        }

        this._activeAnimations = activeAnimations;
        this._pendingAnimations = null;
      }
    }
  }

});
