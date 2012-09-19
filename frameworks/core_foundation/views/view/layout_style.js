
sc_require('ext/string');
sc_require('views/view');
sc_require('views/view/animation');

/**
  Map to CSS Transforms
*/

SC.CSS_TRANSFORM_MAP = {
  rotate: function(val){
    return null;
  },

  rotateX: function(val){
    if (SC.typeOf(val) === SC.T_NUMBER) val += 'deg';
    return 'rotateX('+val+')';
  },

  rotateY: function(val){
    if (SC.typeOf(val) === SC.T_NUMBER) val += 'deg';
    return 'rotateY('+val+')';
  },

  rotateZ: function(val){
    if (SC.typeOf(val) === SC.T_NUMBER) val += 'deg';
    return 'rotateZ('+val+')';
  },

  scale: function(val){
    if (SC.typeOf(val) === SC.T_ARRAY) val = val.join(', ');
    return 'scale('+val+')';
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
  layoutStyle: function() {
    var props = {
      layout:       this.get('layout'),
      turbo:        this.get('hasAcceleratedLayer'),
      staticLayout: this.get('useStaticLayout')
    };

    var calculator = this.get('layoutStyleCalculator');
    calculator.set(props);

    return calculator.calculate();
  }.property().cacheable()
});

SC.View.LayoutStyleCalculator = SC.Object.extend({

  _layoutDidUpdate: function(){
    var layout = this.get('layout');
    if (!layout) { return; }

    this.dims = SC._VIEW_DEFAULT_DIMS;
    this.loc = this.dims.length;

    // loose comparison used instead of (value === null || value === undefined)

    var right = (this.right = layout.right);
    this.hasRight = (right != null);

    var left = (this.left = layout.left);
    this.hasLeft = (left != null);

    var top = (this.top = layout.top);
    this.hasTop = (top != null);

    var bottom = (this.bottom = layout.bottom);
    this.hasBottom = (bottom != null);

    var width = (this.width = layout.width);
    this.hasWidth = (width != null);

    var height = (this.height = layout.height);
    this.hasHeight = (height != null);

    this.minWidth = ((layout.minWidth === undefined) ? null : layout.minWidth);

    var maxWidth = (this.maxWidth = (layout.maxWidth === undefined) ? null : layout.maxWidth);
    this.hasMaxWidth = (maxWidth != null);

    this.minHeight = (layout.minHeight === undefined) ? null : layout.minHeight;

    var maxHeight = (this.maxHeight = (layout.maxHeight === undefined) ? null : layout.maxHeight);
    this.hasMaxHeight = (maxHeight != null);

    var centerX = (this.centerX = layout.centerX);
    this.hasCenterX = (centerX != null);

    var centerY = (this.centerY = layout.centerY);
    this.hasCenterY = (centerY != null);

    var borderTop = (this.borderTop = ((layout.borderTop !== undefined) ? layout.borderTop : layout.border) || 0);
    var borderRight = (this.borderRight = ((layout.borderRight !== undefined) ? layout.borderRight : layout.border) || 0);
    var borderBottom = (this.borderBottom = ((layout.borderBottom !== undefined) ? layout.borderBottom : layout.border) || 0);
    var borderLeft = (this.borderLeft = ((layout.borderLeft !== undefined) ? layout.borderLeft : layout.border) || 0);

    // the toString here is to ensure that it doesn't get px added to it
    this.zIndex  = (layout.zIndex  != null) ? layout.zIndex.toString() : null;
    this.opacity = (layout.opacity != null) ? layout.opacity.toString() : null;

    this.backgroundPosition = (layout.backgroundPosition != null) ? layout.backgroundPosition : null;

    this.ret = {
      marginTop: null,
      marginLeft: null
    };

  }.observes('layout'),

  // handles the case where you do width:auto or height:auto and are not using "staticLayout"
  _invalidAutoValue: function(property){
    var error = SC.Error.desc("%@.layout() you cannot use %@:auto if staticLayout is disabled".fmt(
      this.get('view'), property), "%@".fmt(this.get('view')),-1);
    SC.Logger.error(error.toString());
    throw error ;
  },

  _handleMistakes: function() {
    var layout = this.get('layout');

    // handle invalid use of auto in absolute layouts
    if(!this.staticLayout) {
      if (this.width === SC.LAYOUT_AUTO) { this._invalidAutoValue("width"); }
      if (this.height === SC.LAYOUT_AUTO) { this._invalidAutoValue("height"); }
    }

    if (SC.platform.supportsCSSTransforms) {
      // Check to see if we're using transforms
      var animations = layout.animate,
          transformAnimationDuration,
          key;

      if (animations) {
        for(key in animations){
          if (SC.CSS_TRANSFORM_MAP[key]) {
            // To prevent:
            //   this.animate('scale', ...);
            //   this.animate('rotate', ...);
            // Use this instead
            //   this.animate({ scale: ..., rotate: ... }, ...);
            if (this._pendingAnimations && this._pendingAnimations['-'+SC.platform.cssPrefix+'-transform']) {
              throw "Animations of transforms must be executed simultaneously!";
            }

            // Because multiple transforms actually share one CSS property, we can't animate multiple transforms
            // at different speeds. So, to handle that case, we just force them to all have the same length.

            // First time around this will never be true, but we're concerned with subsequent runs.
            if (transformAnimationDuration && animations[key].duration !== transformAnimationDuration) {
              SC.Logger.warn("Can't animate transforms with different durations! Using first duration specified.");
              animations[key].duration = transformAnimationDuration;
            }

            transformAnimationDuration = animations[key].duration;
          }
        }
      }
    }
  },

  _calculatePosition: function(direction) {
    var translate = null, turbo = this.get('turbo'), ret = this.ret;

    var start, finish, size, maxSize, margin,
        hasStart, hasFinish, hasSize, hasMaxSize,
        startBorder, startBorderVal,
        finishBorder, finishBorderVal,
        sizeNum;

    if (direction === 'x') {
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

    startBorderVal = this._cssNumber(this[startBorder]);
    finishBorderVal = this._cssNumber(this[finishBorder]);
    ret[startBorder+'Width'] = startBorderVal || null;
    ret[finishBorder+'Width'] = finishBorderVal || null;

    sizeNum = this[size];
    // This is a normal number
    if (sizeNum >= 1) { sizeNum -= (startBorderVal + finishBorderVal); }
    ret[size] = this._cssNumber(sizeNum);


    if(hasStart) {
      if (turbo) {
        translate = ret[start];
        ret[start] = 0;
      }

      // top, bottom, height -> top, bottom
      if (hasFinish && hasSize)  { ret[finish] = null; }
    } else {
      // bottom aligned
      if(!hasFinish || (hasFinish && !hasSize && !hasMaxSize)) {
        // no top, no bottom
        ret[start] = 0;
      }
    }

    if (!hasSize && !hasFinish) { ret[finish] = 0; }

    return translate;
  },

  _calculateCenter: function(direction) {
    var ret = this.ret,
        size, center, start, finish, margin,
        startBorder, startBorderVal,
        finishBorder, finishBorderVal;

    if (direction === 'x') {
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

    startBorderVal = this._cssNumber(this[startBorder]);
    finishBorderVal = this._cssNumber(this[finishBorder]);
    ret[startBorder+'Width'] = startBorderVal || null;
    ret[finishBorder+'Width'] = finishBorderVal || null;


    var sizeValue   = this[size],
        centerValue = this[center],
        startValue  = this[start];

    var sizeIsPercent = SC.isPercentage(sizeValue), centerIsPercent = SC.isPercentage(centerValue, YES);

    // If > 1 then it should be a normal number value
    if (sizeValue > 1) { sizeValue -= (startBorderVal + finishBorderVal); }

    if((sizeIsPercent && centerIsPercent) || (!sizeIsPercent && !centerIsPercent)) {
      var value = centerValue - sizeValue/2;
      ret[margin] = (sizeIsPercent) ? Math.floor(value * 100) + "%" : Math.floor(value);
    } else {
      // This error message happens whenever height is not set.
      SC.Logger.warn("You have to set "+size+" and "+center+" using both percentages or pixels");
      ret[margin] = "50%";
    }

    ret[size] = this._cssNumber(sizeValue) || 0;
    ret[finish] = null;
  },

  _calculateTransforms: function(translateLeft, translateTop){
    if (SC.platform.supportsCSSTransforms) {
      // Handle transforms
      var layout = this.get('layout');
      var transformAttribute = SC.platform.domCSSPrefix+'Transform';
      var transforms = [];

      if (this.turbo) {
        // FIXME: Can we just set translateLeft / translateTop to 0 earlier?
        transforms.push('translateX('+(translateLeft || 0)+'px)', 'translateY('+(translateTop || 0)+'px)');

        // double check to make sure this is needed
        if (SC.platform.supportsCSS3DTransforms) { transforms.push('translateZ(0px)'); }
      }

      // normalizing transforms like rotateX: 5 to rotateX(5deg)
      var transformMap = SC.CSS_TRANSFORM_MAP;
      for(var transformName in transformMap) {
        var layoutTransform = layout[transformName];

        if(layoutTransform != null) {
          transforms.push(transformMap[transformName](layoutTransform));
        }
      }

      this.ret[transformAttribute] = transforms.length > 0 ? transforms.join(' ') : null;
    }
  },

  _calculateAnimations: function(translateLeft, translateTop){
    var layout = this.layout,
        animations = layout.animate,
        key;

    // we're checking to see if the layout update was triggered by a call to .animate
    if (!animations) { return; }

    // TODO: Deprecate SC.Animatable
    if(this.getPath('view.isAnimatable')) { return; }

    // Handle animations
    var transitions = [], animation;
    this._animatedTransforms = [];

    if (!this._pendingAnimations) { this._pendingAnimations = {}; }

    var platformTransform = "-" + SC.platform.cssPrefix + "-transform";


    // animate({ scale: 2, rotateX: 90 })
    // both scale and rotateX are transformProperties
    // so they both actually are animating the same CSS key, i.e. -webkit-transform

    if (SC.platform.supportsCSSTransitions) {
      for(key in animations) {
        // FIXME: If we want to allow it to be set as just a number for duration we need to add support here
        animation = animations[key];

        var isTransformProperty = SC.CSS_TRANSFORM_MAP[key];
        var isTurboProperty = (key === 'top' && translateTop != null) || (key === 'left' && translateLeft != null);

        if (SC.platform.supportsCSSTransforms && (isTurboProperty || isTransformProperty)) {
          this._animatedTransforms.push(key);
          key = platformTransform;
        }

        // We're actually storing the css for the animation on layout.animate[key].css
        animation.css = key + " " + animation.duration + "s " + animation.timing;

        // If there are multiple transform properties, we only need to set this key once.
        // We already checked before to make sure they have the same duration.
        if (!this._pendingAnimations[key]) {
          this._pendingAnimations[key] = animation;
          transitions.push(animation.css);
        }
      }

      this.ret[SC.platform.domCSSPrefix+"Transition"] = transitions.join(", ");

    } else {
      // TODO: Do it the JS way

      // For now we're just sticking them in so the callbacks can be run
      for(key in animations) {
        this._pendingAnimations[key] = animations[key];
      }
    }

    delete layout.animate;
  },

  // return "auto" for "auto", null for null, converts 0.XY into "XY%".
  // otherwise returns the original number, rounded down
  _cssNumber: function(val){
    if (val == null) { return null; }
    else if (val === SC.LAYOUT_AUTO) { return SC.LAYOUT_AUTO; }
    else if (SC.isPercentage(val)) { return (val*100)+"%"; }
    else { return Math.floor(val); }
  },

  calculate: function() {
    var layout = this.get('layout'), pdim = null,
        staticLayout = this.get('staticLayout'),
        translateTop = null,
        translateLeft = null,
        turbo = this.get('turbo'),
        ret = this.ret,
        dims = this.dims,
        loc = this.loc,
        view = this.get('view'),
        key, value;

    this._handleMistakes(layout);

    // If the developer sets useStaticLayout and doesn't provide a unique `layout` property, we
    // should not insert the styles "left: 0px; right: 0px; top: 0px; bottom: 0px" as they could
    // conflict with the developer's intention.  However, if they do provide a unique `layout`,
    // use it.
    if (staticLayout && layout === SC.View.prototype.layout) return {};

    // X DIRECTION

    if (this.hasLeft || this.hasRight || !this.hasCenterX) {
      translateLeft = this._calculatePosition("x");
    } else {
      this._calculateCenter("x");
    }


    // Y DIRECTION

    if (this.hasTop || this.hasBottom || !this.hasCenterY) {
      translateTop = this._calculatePosition("y");
    } else {
      this._calculateCenter("y");
    }


    // these properties pass through unaltered (after prior normalization)
    ret.minWidth   = this.minWidth;
    ret.maxWidth   = this.maxWidth;
    ret.minHeight  = this.minHeight;
    ret.maxHeight  = this.maxHeight;

    ret.zIndex     = this.zIndex;
    ret.opacity    = this.opacity;

    // for ie, we will NOT use alpha. It is just a source of pain.
    // a) it will not affect absolutely positioned child elements, and is therefore
    //    useless for most SC purposes.
    //
    // b) It completely breaks semitransparent background images (PNGs with opacity)
    //
    // If users want to use alpha, they should do it on their own.

    // if(!SC.none(this.opacity)) ret.filter = "alpha(opacity=%@)".fmt(this.opacity * 100);

    ret.backgroundPosition = this.backgroundPosition;

    this._calculateTransforms(translateLeft, translateTop);
    this._calculateAnimations(translateLeft, translateTop);


    // convert any numbers into a number + "px".
    for(key in ret) {
      value = ret[key];
      if (typeof value === SC.T_NUMBER) { ret[key] = (value + "px"); }
    }

    return ret ;
  },

  /** @private
   This method is called before the layout style is applied to the layer.  If
   animations have been defined for the view, they will be included in
   this._pendingAnimations.  This method will clear out any conflicts between
   pending and active animations.
   */
  willRenderAnimations: function() {
    if (SC.platform.supportsCSSTransitions) {
      var view = this.get('view'),
        layer = view.get('layer'),
        currentStyle = layer ? layer.style : null,
        newStyle = view.get('layoutStyle'),
        activeAnimations = this._activeAnimations, activeAnimation,
        pendingAnimations = this._pendingAnimations, pendingAnimation,
        animatedTransforms = this._animatedTransforms,
        transformsLength = animatedTransforms ? animatedTransforms.length : 0,
        key, keys = [], callback, idx, shouldCancel;

      if (pendingAnimations) {
        if (!activeAnimations) activeAnimations = {};

        for (key in pendingAnimations) {
          if (!pendingAnimations.hasOwnProperty(key)) continue;

          pendingAnimation = pendingAnimations[key];
          activeAnimation = activeAnimations[key];
          shouldCancel = NO;

          if (newStyle[key] !== (currentStyle ? currentStyle[key] : null)) shouldCancel = YES;

          // if we have a new animation (an animation property has changed), cancel current
          if (activeAnimation && (activeAnimation.duration !== pendingAnimation.duration || activeAnimation.timing !== pendingAnimation.timing)) {
            shouldCancel = YES;
          }

          if (shouldCancel && activeAnimation) {
            if (callback = activeAnimation.callback) {
              if (transformsLength > 0) {
                this.runAnimationCallback(callback, null, YES);
                this._animatedTransforms = null;
              } else {
                this.runAnimationCallback(callback, null, YES);
              }
            }

            this.removeAnimationFromLayout(key, YES);
          }

          activeAnimations[key] = pendingAnimation;
          keys.push(key);
        }

        if (!this._groupedAnimations) this._groupedAnimations = {};
        this._groupedAnimations[key] = keys;

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
  didRenderAnimations: function(){
    if (!SC.platform.supportsCSSTransitions) {
      var key, callback,
          called = {};

      // Transitions not supported
      for (key in this._pendingAnimations) {
        callback = this._pendingAnimations[key].callback;
        if (callback && !called[SC.guidFor(callback)]) {
          called[SC.guidFor(callback)] = YES;
          this.runAnimationCallback(callback, null, NO);
        }
        this.removeAnimationFromLayout(key, NO, YES);
      }

      // Reset the placeholder variables now that the layout style has been applied.
      this._activeAnimations = this._pendingAnimations = null;
    }
  },

  runAnimationCallback: function(callback, evt, cancelled) {
    var view = this.get('view');
    if (callback) {
      if (SC.typeOf(callback) !== SC.T_HASH) { callback = { action: callback }; }
      callback.source = view;
      if (!callback.target) { callback.target = this; }
    }
    SC.View.runCallback(callback, { event: evt, view: view, isCancelled: cancelled });
  },

  transitionDidEnd: function(evt) {
    var propertyName = evt.originalEvent.propertyName,
        propertyNames,
        animation, idx;

    animation = this._activeAnimations ? this._activeAnimations[propertyName] : null;

    if (animation) {
      if (animation.callback) {
        // Charles says this is a good idea
        SC.RunLoop.begin();
        // We're using invokeLater so we don't trigger any layout changes from the callbacks until the animations are done
        this.invokeLater('runAnimationCallback', 1, animation.callback, evt, NO);
        SC.RunLoop.end();
      }
      this.removeAnimationFromLayout(propertyName, YES);

      var key;
      propertyNames = this._groupedAnimations && this._groupedAnimations[propertyName];
      if (propertyNames) {
        for (var i = 0, len = propertyNames.length; i < len; i++) {
          key = propertyNames[i];
          delete this._activeAnimations[key];
        }

        delete this._groupedAnimations[propertyName];
      }
    }
  },

  removeAnimationFromLayout: function(propertyName, updateStyle, isPending) {
    if (updateStyle) {
      var layer = this.getPath('view.layer'),
          updatedCSS = [], key;
      for(key in this._activeAnimations) {
        if (key !== propertyName) { updatedCSS.push(this._activeAnimations[key].css); } //  && this._activeAnimations[key]
      }

      // FIXME: Not really sure this is the right way to do it, but we don't want to trigger a layout update
      if (layer) { layer.style[SC.platform.domCSSPrefix+"Transition"] = updatedCSS.join(', '); }
    }


    var layout = this.getPath('view.layout'),
        idx;

    if (propertyName === '-'+SC.platform.cssPrefix+'-transform' && this._animatedTransforms && this._animatedTransforms.length > 0) {
      for(idx=0; idx < this._animatedTransforms.length; idx++) {
        delete layout['animate' + SC.String.capitalize(this._animatedTransforms[idx])];
      }
      this._animatedTransforms = null;
    }
    delete layout['animate' + SC.String.capitalize(propertyName)];
  }

});

SC.CoreView.runCallback = function(callback)/** @scope SC.View.prototype */{
  var additionalArgs = SC.$A(arguments).slice(1),
      typeOfAction = SC.typeOf(callback.action);

  // if the action is a function, just try to call it.
  if (typeOfAction == SC.T_FUNCTION) {
    callback.action.apply(callback.target, additionalArgs);

  // otherwise, action should be a string.  If it has a period, treat it
  // like a property path.
  } else if (typeOfAction === SC.T_STRING) {
    if (callback.action.indexOf('.') >= 0) {
      var path = callback.action.split('.') ;
      var property = path.pop() ;

      var target = SC.objectForPropertyPath(path, window) ;
      var action = target.get ? target.get(property) : target[property];
      if (action && SC.typeOf(action) == SC.T_FUNCTION) {
        action.apply(target, additionalArgs);
      } else {
        throw 'SC.runCallback could not find a function at %@'.fmt(callback.action) ;
      }

    // otherwise, try to execute action direction on target or send down
    // responder chain.
    // FIXME: Add support for additionalArgs to this
    // } else {
    //  SC.RootResponder.responder.sendAction(callback.action, callback.target, callback.source, callback.source.get("pane"), null, callback.source);
    }
  }
};

SC.View.runCallback = SC.CoreView.runCallback;
