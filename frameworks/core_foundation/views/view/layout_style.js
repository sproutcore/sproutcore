
sc_require('ext/string');
sc_require('views/view');
sc_require('views/view/animation');

/**
  Map to CSS Transforms
*/

SC.CSS_TRANSFORM_MAP = {
  rotate: function () {
    return null;
  },

  rotateX: function (val) {
    if (SC.typeOf(val) === SC.T_NUMBER) { val += 'deg'; }
    return 'rotateX(' + val + ')';
  },

  rotateY: function (val) {
    if (SC.typeOf(val) === SC.T_NUMBER) { val += 'deg'; }
    return 'rotateY(' + val + ')';
  },

  rotateZ: function (val) {
    if (SC.typeOf(val) === SC.T_NUMBER) { val += 'deg'; }
    return 'rotateZ(' + val + ')';
  },

  scale: function (val) {
    if (SC.typeOf(val) === SC.T_ARRAY) { val = val.join(', '); }
    return 'scale(' + val + ')';
  }
};

SC.View.reopen(
  /** @scope SC.View.prototype */ {

  layoutStyleCalculator: null,

  /**
    layoutStyle describes the current styles to be written to your element
    based on the layout you defined.  Both layoutStyle and frame reset when
    you edit the layout property.  Both are read only.

    Computes the layout style settings needed for the current anchor.

    @property {Hash}
    @readOnly
  */
  layoutStyle: function () {
    var calculator = this.get('layoutStyleCalculator'),
      props = {
        layout: this.get('layout'),
        hasAcceleratedLayer: this.get('hasAcceleratedLayer'),
        staticLayout: this.get('useStaticLayout')
      };

    calculator.set(props);

    return calculator.calculate();
    // 'hasAcceleratedLayer' is dependent on 'layout' so we don't need 'layout' to be a dependency here
  }.property('hasAcceleratedLayer', 'useStaticLayout').cacheable()
});

SC.View.LayoutStyleCalculator = SC.Object.extend({

  _prepHelperVariables: function () {
    /*jshint eqnull:true */
    var layout = this.get('layout');
    if (!layout) { return; }

    this.dims = SC._VIEW_DEFAULT_DIMS;
    this.loc = this.dims.length;

    var bottom = (this.bottom = layout.bottom),
      centerX = (this.centerX = layout.centerX),
      centerY = (this.centerY = layout.centerY),
      height = (this.height = layout.height),
      right = (this.right = layout.right),
      left = (this.left = layout.left),
      maxHeight = (this.maxHeight = (layout.maxHeight === undefined) ? null : layout.maxHeight),
      maxWidth = (this.maxWidth = (layout.maxWidth === undefined) ? null : layout.maxWidth),
      top = (this.top = layout.top),
      width = (this.width = layout.width);

    this.borderTop = ((layout.borderTop !== undefined) ? layout.borderTop : layout.border) || 0;
    this.borderRight = ((layout.borderRight !== undefined) ? layout.borderRight : layout.border) || 0;
    this.borderBottom = ((layout.borderBottom !== undefined) ? layout.borderBottom : layout.border) || 0;
    this.borderLeft = ((layout.borderLeft !== undefined) ? layout.borderLeft : layout.border) || 0;

    // loose comparison used instead of (value === null || value === undefined)
    this.hasBottom = (bottom != null);
    this.hasRight = (right != null);
    this.hasLeft = (left != null);
    this.hasTop = (top != null);
    this.hasWidth = (width != null);
    this.hasHeight = (height != null);

    this.minWidth = ((layout.minWidth === undefined) ? null : layout.minWidth);
    this.hasMaxWidth = (maxWidth != null);
    this.minHeight = (layout.minHeight === undefined) ? null : layout.minHeight;
    this.hasMaxHeight = (maxHeight != null);

    this.hasCenterX = (centerX != null);
    this.hasCenterY = (centerY != null);

    // the toString here is to ensure that it doesn't get px added to it
    this.zIndex  = (layout.zIndex  != null) ? layout.zIndex.toString() : null;
    this.opacity = (layout.opacity != null) ? layout.opacity.toString() : null;

    this.backgroundPosition = (layout.backgroundPosition != null) ? layout.backgroundPosition : null;
  },

  // handles the case where you do width:auto or height:auto and are not using "staticLayout"
  _invalidAutoValue: function (property) {
    var error = SC.Error.desc("%@.layout() you cannot use %@:auto if staticLayout is disabled".fmt(
      this.get('view'), property), "%@".fmt(this.get('view')), -1);
    SC.Logger.error(error.toString());
    throw error;
  },

  _handleMistakes: function () {
    var key,
      transformAnimationDuration;

    // handle invalid use of auto in absolute layouts
    if (!this.staticLayout) {
      if (this.width === SC.LAYOUT_AUTO) { this._invalidAutoValue("width"); }
      if (this.height === SC.LAYOUT_AUTO) { this._invalidAutoValue("height"); }
    }

    if (SC.platform.supportsCSSTransforms) {
      // Check to see if we're using transforms
      var layout = this.get('layout'),
        animations = layout.animate,
        platformTransform = SC.browser.experimentalStyleNameFor('transform');

      if (animations) {
        for (key in animations) {
          if (SC.CSS_TRANSFORM_MAP[key]) {
            // To prevent:
            //   this.animate('scale', ...);
            //   this.animate('rotate', ...);
            // Use this instead
            //   this.animate({ scale: ..., rotate: ... }, ...);
            if (this._pendingAnimations && this._pendingAnimations[platformTransform]) {
              throw "Animations of transforms (i.e. rotate, scale or skew) must be executed simultaneously!";
            }

            // Because multiple transforms actually share one CSS property, we can't animate multiple transforms
            // at different speeds. So, to handle that case, we just force them to all have the same length.

            // First time around this will never be true, but we're concerned with subsequent runs.
            if (transformAnimationDuration && animations[key].duration !== transformAnimationDuration) {
              //@if(debug)
              SC.Logger.warn("Developer Warning: Can't animate transforms with different durations! Using first duration specified.");
              //@endif
              animations[key].duration = transformAnimationDuration;
            }

            transformAnimationDuration = animations[key].duration;
          }
        }
      }
    }
  },

  _calculatePosition: function (ret, direction) {
    var translate = null,
      hasAcceleratedLayer = this.get('hasAcceleratedLayer'),
      start, finish, size, maxSize, margin,
      hasStart, hasFinish, hasSize, hasMaxSize,
      startBorder,
      finishBorder;

    if (direction === 'X') {
      start      = 'left';
      finish     = 'right';
      size       = 'width';
      maxSize    = 'maxWidth';
      margin     = 'marginLeft';
      startBorder  = 'borderLeft';
      finishBorder = 'borderRight';
      hasStart   = this.hasLeft;
      hasFinish  = this.hasRight;
      hasSize    = this.hasWidth;
      hasMaxSize = this.hasMaxWidth;
    } else {
      start      = 'top';
      finish     = 'bottom';
      size       = 'height';
      maxSize    = 'maxHeight';
      margin     = 'marginTop';
      startBorder  = 'borderTop';
      finishBorder = 'borderBottom';
      hasStart   = this.hasTop;
      hasFinish  = this.hasBottom;
      hasSize    = this.hasHeight;
      hasMaxSize = this.hasMaxHeight;
    }

    ret[start]  = this._cssNumber(this[start]);
    ret[finish] = this._cssNumber(this[finish]);

    var startBorderVal = this._cssNumber(this[startBorder]),
      finishBorderVal = this._cssNumber(this[finishBorder]),
      sizeNum = this[size];

    ret[startBorder + 'Width'] = startBorderVal || null;
    ret[finishBorder + 'Width'] = finishBorderVal || null;

    // This is a normal number
    if (sizeNum >= 1) { sizeNum -= (startBorderVal + finishBorderVal); }
    ret[size] = this._cssNumber(sizeNum);


    if (hasStart) {
      // top, bottom, height -> top, bottom
      if (hasFinish && hasSize)  { ret[finish] = null; }
    } else {
      // bottom aligned
      if (!hasFinish || (hasFinish && !hasSize && !hasMaxSize)) {
        // no top, no bottom
        ret[start] = 0;
      }
    }

    if (!hasSize && !hasFinish) { ret[finish] = 0; }

    return ret;
  },

  _calculateCenter: function (ret, direction) {
    var size, center, start, finish, margin,
        startBorder,
        finishBorder;

    if (direction === 'X') {
      size   = 'width';
      center = 'centerX';
      start  = 'left';
      finish = 'right';
      margin = 'marginLeft';
      startBorder  = 'borderLeft';
      finishBorder = 'borderRight';
    } else {
      size   = 'height';
      center = 'centerY';
      start  = 'top';
      finish = 'bottom';
      margin = 'marginTop';
      startBorder  = 'borderTop';
      finishBorder = 'borderBottom';
    }

    ret[start] = "50%";

    var startBorderVal = this._cssNumber(this[startBorder]),
      finishBorderVal = this._cssNumber(this[finishBorder]),
      sizeValue   = this[size],
      centerValue = this[center],
      sizeIsPercent = SC.isPercentage(sizeValue),
      value;

    ret[startBorder + 'Width'] = startBorderVal || null;
    ret[finishBorder + 'Width'] = finishBorderVal || null;

    // If > 1 then it should be a normal number value
    if (sizeValue > 1) { sizeValue -= (startBorderVal + finishBorderVal); }

    if (SC.none(sizeValue)) {
      //@if(debug)
      // This error message happens whenever width or height is not set.
      SC.warn("Developer Warning: When setting '" + center + "' in the layout, you must also set '" + size + "'.");
      //@endif
      ret[margin] = "50%";
    } else {
      value = centerValue - sizeValue / 2;
      ret[margin] = (sizeIsPercent) ? Math.floor(value * 100) + "%" : Math.floor(value);
    }

    ret[size] = this._cssNumber(sizeValue) || 0;
    ret[finish] = null;

    return ret;
  },

  /** @private Calculates animation styles. */
  _calculateAnimations: function (ret) {
    /*jshint eqnull:true*/
    var layout = this.layout,
      animations = layout.animate,
      key;

    // we're checking to see if the layout update was triggered by a call to .animate
    if (!animations) { return ret; }

    // Handle animations
    this._animatedTransforms = [];

    if (!this._pendingAnimations) { this._pendingAnimations = {}; }

    var platformTransform = SC.browser.experimentalStyleNameFor('transform'),
      transitions = [];

    // animate({ scale: 2, rotateX: 90 })
    // both scale and rotateX are transformProperties
    // so they both actually are animating the same CSS key, i.e. -webkit-transform

    if (SC.platform.supportsCSSTransitions) {
      for (key in animations) {
        var animation = animations[key],
          isTransformProperty = !!SC.CSS_TRANSFORM_MAP[key],
          isTurboProperty = (key === 'top' && !!ret.translateY) || (key === 'left' && !!ret.translateX);

        if (SC.platform.supportsCSSTransforms && (isTurboProperty || isTransformProperty)) {
          this._animatedTransforms.push(key);
          // The key will be either 'transform' or one of '-webkit-transform', '-ms-transform', '-moz-transform', '-o-transform'
          key = SC.browser.experimentalCSSNameFor('transform');
        }

        // We're actually storing the css for the animation on layout.animate[key].css
        animation.css = key + " " + animation.duration + "s " + animation.timing + " " + animation.delay + "s";

        // If there are multiple transform properties, we only need to set this key once.
        // We already checked before to make sure they have the same duration.
        if (!this._pendingAnimations[key]) {
          this._pendingAnimations[key] = animation;
          transitions.push(animation.css);
        }
      }

      ret[SC.browser.experimentalStyleNameFor('transition')] = transitions.join(", ");
    } else {
      // TODO: Do it the JS way

      // For now we're just sticking them in so the callbacks can be run
      for (key in animations) {
        this._pendingAnimations[key] = animations[key];
      }
    }

    delete layout.animate;

    return ret;
  },

  /** @private Calculates transform styles. */
  _calculateTransforms: function (ret) {
    /*jshint eqnull:true*/
    if (SC.platform.supportsCSSTransforms) {
      // Handle transforms
      var layout = this.get('layout'),
        transformAttribute = SC.browser.experimentalStyleNameFor('transform'),
        transforms = [],
        transformMap = SC.CSS_TRANSFORM_MAP,
        animations = layout.animate,
        shouldTranslate;

      if (this.get('hasAcceleratedLayer') && animations && (animations.top || animations.left)) {
        shouldTranslate = YES;
        for (var key in animations) {
          // If we're animating other transforms at different speeds, don't use acceleratedLayer
          if (SC.CSS_TRANSFORM_MAP[key] &&
              ((animations.top &&
                animations.top.duration !== animations[key].duration) ||
               (animations.left &&
                animations.left.duration !== animations[key].duration))) {
            shouldTranslate = NO;
          }
        }


        if (shouldTranslate) {
          ret.translateX = ret.left;
          ret.translateY = ret.top;
          transforms.push('translateX(' + ret.translateX + 'px)', 'translateY(' + ret.translateY + 'px)');
          ret.left = 0;
          ret.top = 0;

          // double check to make sure this is needed
          if (SC.platform.supportsCSS3DTransforms) { transforms.push('translateZ(0px)'); }
        }
      }

      // normalizing transforms like rotateX: 5 to rotateX(5deg)
      for (var transformName in transformMap) {
        var layoutTransform = layout[transformName];

        if (layoutTransform != null) {
          transforms.push(transformMap[transformName](layoutTransform));
        }
      }

      ret[transformAttribute] = transforms.length > 0 ? transforms.join(' ') : null;
    }

    return ret;
  },

  // return "auto" for "auto", null for null, converts 0.XY into "XY%".
  // otherwise returns the original number, rounded down
  _cssNumber: function (val) {
    /*jshint eqnull:true*/
    if (val == null) { return null; }
    else if (val === SC.LAYOUT_AUTO) { return SC.LAYOUT_AUTO; }
    else if (SC.isPercentage(val)) { return (val * 100) + "%"; }
    else { return Math.floor(val); }
  },

  calculate: function () {
    this._prepHelperVariables();

    var layout = this.get('layout'),
      staticLayout = this.get('staticLayout'),
      ret = {
        marginTop: null,
        marginLeft: null
      };

    this._handleMistakes(layout);

    // If the developer sets useStaticLayout and doesn't provide a unique `layout` property, we
    // should not insert the styles "left: 0px; right: 0px; top: 0px; bottom: 0px" as they could
    // conflict with the developer's intention.  However, if they do provide a unique `layout`,
    // use it.
    if (staticLayout && layout === SC.View.prototype.layout) { return {}; }

    // X DIRECTION
    if (this.hasLeft || this.hasRight || !this.hasCenterX) {
      ret = this._calculatePosition(ret, "X");
    } else {
      ret = this._calculateCenter(ret, "X");
    }

    // Y DIRECTION
    if (this.hasTop || this.hasBottom || !this.hasCenterY) {
      ret = this._calculatePosition(ret, "Y");
    } else {
      ret = this._calculateCenter(ret, "Y");
    }

    // these properties pass through unaltered (after prior normalization)
    ret.minWidth = this.minWidth;
    ret.maxWidth = this.maxWidth;
    ret.minHeight = this.minHeight;
    ret.maxHeight = this.maxHeight;

    ret.zIndex = this.zIndex;
    ret.opacity = this.opacity;

    // for ie, we will NOT use alpha. It is just a source of pain.
    // a) it will not affect absolutely positioned child elements, and is therefore
    //    useless for most SC purposes.
    //
    // b) It completely breaks semitransparent background images (PNGs with opacity)
    //
    // If users want to use alpha, they should do it on their own.

    // if(!SC.none(this.opacity)) ret.filter = "alpha(opacity=%@)".fmt(this.opacity * 100);

    ret.backgroundPosition = this.backgroundPosition;

    ret = this._calculateTransforms(ret);
    ret = this._calculateAnimations(ret);

    // convert any numbers into a number + "px".
    for (var key in ret) {
      var value = ret[key];
      if (typeof value === SC.T_NUMBER) { ret[key] = (value + "px"); }
    }

    return ret;
  },

  /** @private Cancels all animations. */
  cancelAnimation: function () {
    var activeAnimations = this._activeAnimations,
      didCancel = NO;

    // Fast path!
    if (!activeAnimations) { return didCancel; }

    for (var key in activeAnimations) {
      didCancel = YES;

      // Run the callback.
      this.runAnimationCallback(activeAnimations[key], null, YES);

      // Remove the animation style without triggering a layout change.
      this.removeAnimationFromLayout(key, YES);

      // Update the animation hash.
      delete activeAnimations[key];
    }

    // Clean up the animation hash.
    delete this._activeAnimations;

    return didCancel;
  },

  /** @private
   This method is called before the layout style is applied to the layer.  If
   animations have been defined for the view, they will be included in
   this._pendingAnimations.  This method will clear out any conflicts between
   pending and active animations.
   */
  willRenderAnimations: function (newStyle) {
    if (SC.platform.supportsCSSTransitions) {
      var pendingAnimations = this._pendingAnimations;

      if (pendingAnimations) {
        var activeAnimations = this._activeAnimations,
          animatedTransforms = this._animatedTransforms,
          transformsLength = animatedTransforms ? animatedTransforms.length : 0,
          view = this.get('view'),
          layer = view.get('layer'),
          currentStyle = layer ? layer.style : null;

        if (!activeAnimations) { activeAnimations = { length: 0 }; }

        for (var key in pendingAnimations) {
          if (!pendingAnimations.hasOwnProperty(key)) { continue; }

          var activeAnimation = activeAnimations[key],
            pendingAnimation = pendingAnimations[key],
            hasConflict = NO;

          // If we have a new animation (an animation property has changed),
          // while an animation is in progress there may be a conflict.  This
          // code cancels any current conflicts.
          if (newStyle[key] !== (currentStyle ? currentStyle[key] : null)) {
            hasConflict = YES;
          } else if (activeAnimation && (activeAnimation.duration !== pendingAnimation.duration ||
              activeAnimation.timing !== pendingAnimation.timing ||
              activeAnimation.delay !== pendingAnimation.delay)) {
            hasConflict = YES;
          }

          if (hasConflict && activeAnimation) {
            this.runAnimationCallback(activeAnimation, null, YES);

            if (transformsLength > 0) {
              this._animatedTransforms = null;
            }
          }

          activeAnimations[key] = pendingAnimation;
          activeAnimations.length += 1;
        }

        this._activeAnimations = activeAnimations;
        this._pendingAnimations = null;
      }
    }
  },

  /** @private
    This method is called after the layout style is applied to the layer.  If
    the platform didn't support CSS transitions, the callbacks will be fired
    immediately and the animations removed from the queue.
  */
  didRenderAnimations: function () {

    // Transitions not supported
    if (!SC.platform.supportsCSSTransitions) {

      for (var key in this._pendingAnimations) {
        this.runAnimationCallback(this._pendingAnimations[key], null, NO);
        this.removeAnimationFromLayout(key, NO);
      }

      // Reset the placeholder variables now that the layout style has been applied.
      this._activeAnimations = this._pendingAnimations = null;
    }
  },

  /** @private */
  runAnimationCallback: function (animation, evt, cancelled) {
    var method = animation.method,
      target = animation.target;

    if (method) {
      // We're using invokeNext so we don't trigger any layout changes from
      // the callback until the current layout is updated.
      this.invokeNext(function () {
        method.call(target, { event: evt, view: this.get('view'), isCancelled: cancelled });
      }, this);

      // Always clear the method from the hash (to prevent it being called multiple times).
      delete animation.method;
      delete animation.target;
    }
  },

  /** @private */
  transitionDidEnd: function (evt) {
    var propertyName = evt.originalEvent.propertyName,
      animation = this._activeAnimations ? this._activeAnimations[propertyName] : null;

    if (animation) {
      // Run the callback.
      this.runAnimationCallback(animation, evt, NO);

      // Remove the animation style without triggering a layout change.
      this.removeAnimationFromLayout(propertyName, YES);

      // Update the animation hash.
      delete this._activeAnimations[propertyName];

      // Clean up the internal hash.
      this._activeAnimations.length -= 1;
      if (this._activeAnimations.length === 0) { delete this._activeAnimations; }
    }
  },

  /** @private Removes the animation CSS from the layer style. */
  removeAnimationFromLayout: function (propertyName, updateStyle) {
    if (updateStyle) {
      var layer = this.getPath('view.layer'),
          updatedCSS = [];

      for (var key in this._activeAnimations) {
        if (key !== propertyName) {
          updatedCSS.push(this._activeAnimations[key].css);
        }
      }

      if (layer) {
        layer.style[SC.browser.experimentalStyleNameFor('transition')] = updatedCSS.join(', ');
      }
    }

    var layout = this.getPath('view.layout'),
      transformKey = SC.browser.experimentalCSSNameFor('transform');

    // If the animation used transforms, we could either re-set the layout to
    // adjust left & top to their non-accelerated positions and remove the
    // transform, but that would trigger another layout change.  Instead,
    // manually clean it up here.
    if (propertyName === transformKey) {
      layer.style[SC.browser.experimentalStyleNameFor('transform')] = '';
      layer.style.left = layout.left + 'px';
      layer.style.top = layout.top + 'px';
    }
  }

});
