
sc_require('ext/string');
sc_require('views/view');
sc_require('views/view/animation');

/**
  Map to CSS Transforms
*/

// The scale transform must be last in order to decompose the transformation matrix.
SC.CSS_TRANSFORM_NAMES = ['rotateX', 'rotateY', 'rotateZ', 'scale'];

SC.CSS_TRANSFORM_MAP = {

  rotate: function (val) {
    if (SC.typeOf(val) === SC.T_NUMBER) { val += 'deg'; }
    return 'rotate(' + val + ')';
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


/** @private */
SC.View.LayoutStyleCalculator = {

  /** @private Shared object used to avoid continually initializing/destroying objects. */
  _SC_STATE_MAP: null,

  /** @private Shared object used to avoid continually initializing/destroying objects. */
  _SC_TRANSFORMS_ARRAY: null,

  /** @private Shared object used to avoid continually initializing/destroying objects. */
  _SC_TRANSITIONS_ARRAY: null,

  /** @private If the value is undefined, make it null. */
  _valueOrNull: function (value) {
    return value === undefined ? null : value;
  },

  /** @private */
  _prepareStyle: function (style, layout) {
    /*jshint eqnull:true */
    // It's important to provide null defaults to reset any previous style when
    // this is applied.
    var commonBorder = this._valueOrNull(layout.border);

    // Reset properties that might not be set from style to style.
    style.marginLeft = null;
    style.marginTop = null;

    // Position and size.
    style.bottom = layout.bottom;
    style.right = layout.right;
    style.left = layout.left;
    style.top = layout.top;
    style.centerX = layout.centerX;
    style.centerY = layout.centerY;
    style.height = layout.height;
    style.width = layout.width;

    // Borders.
    style.borderTopWidth = layout.borderTop !== undefined ? layout.borderTop : commonBorder;
    style.borderRightWidth = layout.borderRight !== undefined ? layout.borderRight : commonBorder;
    style.borderBottomWidth = layout.borderBottom !== undefined ? layout.borderBottom : commonBorder;
    style.borderLeftWidth = layout.borderLeft !== undefined ? layout.borderLeft : commonBorder;

    // Minimum and maximum size.
    style.maxHeight = this._valueOrNull(layout.maxHeight);
    style.maxWidth = this._valueOrNull(layout.maxWidth);
    style.minWidth = this._valueOrNull(layout.minWidth);
    style.minHeight = this._valueOrNull(layout.minHeight);

    // the toString here is to ensure that it doesn't get px added to it
    style.zIndex  = (layout.zIndex != null) ? layout.zIndex.toString() : null;
    style.opacity = (layout.opacity != null) ? layout.opacity.toString() : null;

    style.backgroundPosition = this._valueOrNull(layout.backgroundPosition);

    // Handle transforms (including reset).
    if (SC.platform.supportsCSSTransforms) {
      var transformAttribute = SC.browser.experimentalStyleNameFor('transform'),
        transforms = this._SC_TRANSFORMS_ARRAY, // Shared object used to avoid continually initializing/destroying objects.
        transformMap = SC.CSS_TRANSFORM_MAP;

      // Create the array once. Note: This is a shared array; it must be set to 0 length each time.
      if (!transforms) { transforms = this._SC_TRANSFORMS_ARRAY = []; }

      // The order of the transforms is important so that we can decompose them
      // from the transformation matrix later if necessary.
      for (var i = 0, len = SC.CSS_TRANSFORM_NAMES.length; i < len; i++) {
        var transformName = SC.CSS_TRANSFORM_NAMES[i],
          layoutTransform = layout[transformName];

        if (layoutTransform != null) {
          // normalizing transforms like rotateX: 5 to rotateX(5deg)
          transforms.push(transformMap[transformName](layoutTransform));
        }
      }

      // Set or reset the transform style.
      style[transformAttribute] = transforms.length > 0 ? transforms.join(' ') : null;

      // Transform origin.
      var transformOriginAttribute = SC.browser.experimentalStyleNameFor('transformOrigin'),
        originX = layout.transformOriginX,
        originY = layout.transformOriginY;
      if (originX == null && originY == null) {
        style[transformOriginAttribute] = null;
      } else {
        if (originX == null) originX = 0.5;
        if (originY == null) originY = 0.5;
        style[transformOriginAttribute] = (originX * 100) + '% ' + (originY * 100) + '%';
      }
    }

    // Reset any transitions.
    if (SC.platform.supportsCSSTransitions) {
      style[SC.browser.experimentalStyleNameFor('transition')] = null;
    }

    // Reset shared object!
    this._SC_TRANSFORMS_ARRAY.length = 0;
  },

  /** @private */
  _prepareState: function (state, style) {
    /*jshint eqnull:true */
    state.hasBottom = (style.bottom != null);
    state.hasRight = (style.right != null);
    state.hasLeft = (style.left != null);
    state.hasTop = (style.top != null);
    state.hasCenterX = (style.centerX != null);
    state.hasCenterY = (style.centerY != null);
    state.hasHeight = (style.height != null);
    state.hasWidth = (style.width != null);
    state.hasMaxWidth = (style.maxWidth != null);
    state.hasMaxHeight = (style.maxHeight != null);
  },


  // handles the case where you do width:auto or height:auto and are not using "staticLayout"
  _invalidAutoValue: function (view, property) {
    SC.throw("%@.layout() you cannot use %@:auto if staticLayout is disabled".fmt(view, property), "%@".fmt(view), -1);
  },

  /** @private */
  _calculatePosition: function (style, state, direction) {
    var start, finish, size,
      hasStart, hasFinish, hasSize, hasMaxSize,
      startBorder,
      finishBorder;

    if (direction === 'X') {
      start      = 'left';
      finish     = 'right';
      size       = 'width';
      startBorder  = 'borderLeftWidth';
      finishBorder = 'borderRightWidth';
      hasStart   = state.hasLeft;
      hasFinish  = state.hasRight;
      hasSize    = state.hasWidth;
      hasMaxSize = state.hasMaxWidth;
    } else {
      start      = 'top';
      finish     = 'bottom';
      size       = 'height';
      startBorder  = 'borderTopWidth';
      finishBorder = 'borderBottomWidth';
      hasStart   = state.hasTop;
      hasFinish  = state.hasBottom;
      hasSize    = state.hasHeight;
      hasMaxSize = state.hasMaxHeight;
    }

    style[start]  = this._cssNumber(style[start]);
    style[finish] = this._cssNumber(style[finish]);

    var startBorderVal = this._cssNumber(style[startBorder]),
      finishBorderVal = this._cssNumber(style[finishBorder]),
      sizeNum = style[size];

    style[startBorder] = startBorderVal;
    style[finishBorder] = finishBorderVal;

    // This is a normal number
    if (sizeNum >= 1) { sizeNum -= (startBorderVal + finishBorderVal); }
    style[size] = this._cssNumber(sizeNum);

    if (hasStart) {
      // top, bottom, height -> top, bottom
      if (hasFinish && hasSize)  { style[finish] = null; }
    } else {
      // bottom aligned
      if (!hasFinish || (hasFinish && !hasSize && !hasMaxSize)) {
        // no top, no bottom
        style[start] = 0;
      }
    }

    if (!hasSize && !hasFinish) { style[finish] = 0; }
  },


  /** @private */
  _calculateCenter: function (style, direction) {
    var size, center, start, finish, margin,
        startBorder,
        finishBorder;

    if (direction === 'X') {
      size   = 'width';
      center = 'centerX';
      start  = 'left';
      finish = 'right';
      margin = 'marginLeft';
      startBorder  = 'borderLeftWidth';
      finishBorder = 'borderRightWidth';
    } else {
      size   = 'height';
      center = 'centerY';
      start  = 'top';
      finish = 'bottom';
      margin = 'marginTop';
      startBorder  = 'borderTopWidth';
      finishBorder = 'borderBottomWidth';
    }

    style[start] = "50%";

    var startBorderVal = this._cssNumber(style[startBorder]),
      finishBorderVal = this._cssNumber(style[finishBorder]),
      sizeValue   = style[size],
      centerValue = style[center],
      sizeIsPercent = SC.isPercentage(sizeValue),
      value;

    style[startBorder] = startBorderVal;
    style[finishBorder] = finishBorderVal;

    // Calculate the margin offset used to center the value along this axis.
    if (SC.none(sizeValue)) {
      // Invalid!
      style[margin] = "50%";
    } else {
      value = centerValue - sizeValue / 2;
      style[margin] = (sizeIsPercent) ? Math.floor(value * 100) + "%" : Math.floor(value);
    }

    // If > 1 then it's a pixel value, in which case we shrink it to accommodate the borders.
    if (sizeValue > 1) { sizeValue -= (startBorderVal + finishBorderVal); }

    style[size] = this._cssNumber(sizeValue) || 0;
    style[finish] = style[center] = null;
  },

  /** @private */
  // return "auto" for "auto", null for null, converts 0.X into "X%".
  // otherwise returns the original number, rounded down
  _cssNumber: function (val) {
    /*jshint eqnull:true*/
    if (val == null) { return null; }
    else if (val === SC.LAYOUT_AUTO) { return SC.LAYOUT_AUTO; }
    else if (SC.isPercentage(val)) { return (val * 100) + "%"; }
    else { return Math.floor(val); }
  },

  /** @private
    Calculate the layout style for the given view, making adjustments to allow
    for flexible positioning, animation and accelerated transforms.

    @return {Object} Layout style hash.
  */
  calculate: function (view, style) {
    var layout = view.get('layout'),
      animations = view._activeAnimations,
      state = this._SC_STATE_MAP, // Shared object used to avoid continually initializing/destroying objects.
      useStaticLayout = view.get('useStaticLayout');

    // Fast path!
    // If the developer sets useStaticLayout and doesn't provide a unique `layout` property, we
    // should not insert the styles "left: 0px; right: 0px; top: 0px; bottom: 0px" as they could
    // conflict with the developer's intention.  However, if they do provide a unique `layout`,
    // use it.
    if (useStaticLayout && layout === SC.View.prototype.layout) { return {}; }

    // Reset and prep the style object.
    this._prepareStyle(style, layout);

    // Create the object once. Note: This is a shared object; all properties must be overwritten each time.
    if (!state) { state = this._SC_STATE_MAP = {}; }

    // Reset and prep the state object.
    this._prepareState(state, style);

    // handle invalid use of auto in absolute layouts
    if (!useStaticLayout) {
      if (style.width === SC.LAYOUT_AUTO) { this._invalidAutoValue(view, "width"); }
      if (style.height === SC.LAYOUT_AUTO) { this._invalidAutoValue(view, "height"); }
    }

    // X DIRECTION
    if (state.hasLeft || state.hasRight || !state.hasCenterX) {
      this._calculatePosition(style, state, "X");
    } else {
      this._calculateCenter(style, "X");
    }

    // Y DIRECTION
    if (state.hasTop || state.hasBottom || !state.hasCenterY) {
      this._calculatePosition(style, state, "Y");
    } else {
      this._calculateCenter(style, "Y");
    }

    this._calculateAnimations(style, animations, view.get('hasAcceleratedLayer'));

    // convert any numbers into a number + "px".
    for (var key in style) {
      var value = style[key];
      if (typeof value === SC.T_NUMBER) { style[key] = (value + "px"); }
    }

    return style;
  },

  /** @private Calculates animation styles. */
  _calculateAnimations: function (style, animations, hasAcceleratedLayer) {
    /*jshint eqnull:true*/
    var key,
      shouldTranslate;

    // Handle transforms
    if (hasAcceleratedLayer) {
      shouldTranslate = YES;

      // If we're animating other transforms at different speeds, don't use acceleratedLayer
      if (animations && (animations.top || animations.left)) {
        for (key in animations) {
          if (SC.CSS_TRANSFORM_MAP[key] &&
              ((animations.top &&
                animations.top.duration !== animations[key].duration) ||
               (animations.left &&
                animations.left.duration !== animations[key].duration))) {
            shouldTranslate = NO;
          }
        }
      }

      if (shouldTranslate) {
        var transformAttribute = SC.browser.experimentalStyleNameFor('transform'),
          curValue = style[transformAttribute],
          newValue;

        newValue = 'translateX(' + style.left + 'px) translateY(' + style.top + 'px)';

        // double check to make sure this is needed
        if (SC.platform.supportsCSS3DTransforms) { newValue += ' translateZ(0px)'; }

        // Append any current transforms.
        // NOTE: The order of transforms is important. If we scale before translate, our translations
        // will be scaled and incorrect.
        if (curValue) { newValue += ' ' + curValue; }
        style[transformAttribute] = newValue;

        // Set the absolute left & top style to 0,0 (will be translated from there).
        style.left = 0;
        style.top = 0;
      }
    }

    // Handle animations
    if (animations) {
      if (SC.platform.supportsCSSTransitions) {
        var transitions = this._SC_TRANSITIONS_ARRAY; // Shared object used to avoid continually initializing/destroying objects.

        // Create the array once. Note: This is a shared array; it must be set to 0 length each time.
        if (!transitions) { transitions = this._SC_TRANSITIONS_ARRAY = []; }

        for (key in animations) {
          var animation = animations[key],
            isTransformProperty = !!SC.CSS_TRANSFORM_MAP[key],
            isTurboProperty = shouldTranslate && (key === 'top' || key === 'left');

          if (SC.platform.supportsCSSTransforms && (isTurboProperty || isTransformProperty)) {
            // Untrack the un-transformed property name.
            delete animations[key];

            // The key will be either 'transform' or one of '-webkit-transform', '-ms-transform', '-moz-transform', '-o-transform'
            key = SC.browser.experimentalCSSNameFor('transform');

            var curTransformAnimation = animations[key];

            // Because multiple transforms actually share one CSS property, we can't animate multiple transforms
            // at different speeds. So, to handle that case, we just force them to all have the same length.
            if (curTransformAnimation) {
              //@if(debug)
              if (curTransformAnimation.duration !== animation.duration || curTransformAnimation.timing !== animation.timing || curTransformAnimation.delay !== animation.delay) {
                SC.Logger.warn("Developer Warning: Can't animate transforms with different durations, timings or delays! Using the first options specified.");
              }
              //@endif
              animation = curTransformAnimation;
            } else {
              // Track the transformed property name.
              animations[key] = animation;
            }
          }

          // Fix up the centerX & centerY properties.
          if (key === 'centerX') { key = 'margin-left'; }
          if (key === 'centerY') { key = 'margin-top'; }

          // We're actually storing the css for the animation on layout.animate[key].css
          animation.css = key + " " + animation.duration + "s " + animation.timing + " " + animation.delay + "s";

          // If there are multiple transform properties, we only need to set this key once.
          // We already checked before to make sure they have the same duration.
          // if (!pendingAnimations[key]) {
          if (transitions.indexOf(animation.css) < 0) {
            transitions.push(animation.css);
          }
        }

        style[SC.browser.experimentalStyleNameFor('transition')] = transitions.join(", ");

        // Reset shared object!
        this._SC_TRANSITIONS_ARRAY.length = 0;
      } else {
        // TODO: Do it the JS way
      }
    }
  }

};



SC.View.reopen(
  /** @scope SC.View.prototype */ {

  /** @private Shared object used to avoid continually initializing/destroying objects. */
  _SC_STYLE_MAP: null,

  /**
    layoutStyle describes the current styles to be written to your element
    based on the layout you defined.  Both layoutStyle and frame reset when
    you edit the layout property.  Both are read only.

    Computes the layout style settings needed for the current anchor.

    @type Object
    @readOnly
  */
  layoutStyle: function () {
    var style = this._SC_STYLE_MAP; // Shared object used to avoid continually initializing/destroying objects.

    // Create the object once. Note: This is a shared object; all properties must be overwritten each time.
    if (!style) { style = this._SC_STYLE_MAP = {}; }

    return SC.View.LayoutStyleCalculator.calculate(this, style);

  // 'hasAcceleratedLayer' is dependent on 'layout' so we don't need 'layout' to be a dependency here
  }.property('hasAcceleratedLayer', 'useStaticLayout').cacheable()

});
