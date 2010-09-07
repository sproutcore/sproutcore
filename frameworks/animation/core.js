// ==========================================================================
// Project:   SproutCore Animation
// Copyright: ©2010 TPSi
// Copyright: ©2010 Alex Iskander
// Portions © Apple Inc under BSD License:
//	See: http://trac.webkit.org/browser/trunk/WebCore/platform/graphics/UnitBezier.h
// ==========================================================================
/*globals */

/** @namespace
A simple mixin called Animatable is provided. What does it do?
It makes CSS transitions for you, and if they aren't available,
implements them in JavaScript.

Animatable things:
- layout. You can animate any layout property, even centerX and centerY
- opacity.
- display, in a way. All animating display does is delay setting display:none
  until <em>after</em> the transition duration has passed. This allows you
  to set display:none after fading out. If mixing with CSS transitions, you will
  need to set the delay a tad longer to accomodate any delays in beginning the
  transition.

@class SC.Animatable
@example Example Usage:
{{{
aView: SC.LabelView.design(SC.Animatable, {
  transitions: {
    left: {duration: .25},
    top: .25, // only possible during design; otherwise you must use long form.
    width: {duration: .25, timing: SC.Animatable.TRANSITION_EASE_IN_OUT }
  }
})
}}}
@extends SC.Object
*/
SC.Animatable = {
  /** @scope SC.Animatable.prototype */
  
  /**
  Walks like a duck.
  */
  isAnimatable: YES,
  
  transitions: {},
  concatenatedProperties: ["transitions"],

  /**
  The style properties. Works somewhat similarly to layout properties, though
  is a tad bit simpler, as it does not involve parent views at all.
  */
  style: { },

  // collections of CSS transitions we have available
  _cssTransitionFor: {
    "left": "left", "top": "top", 
    "right": "right", "bottom": "bottom",
    "width": "width", "height": "height",
    "opacity": "opacity",
    "transform": (SC.platform.supportsCSSTransforms ? '-'+SC.platform.cssPrefix+'-transform' : "transform")
  },

  // properties that adjust should relay to style
  _styleProperties: [ "display", "transform" ],
  _layoutStyles: 'width height top bottom marginLeft marginTop left right zIndex minWidth maxWidth minHeight maxHeight centerX centerY opacity'.w(),

  // we cache this dictionary so we don't generate a new one each time we make
  // a new animation. It is used so we can start the animations in order—
  // for instance, centerX and centerY need to be animated _after_ width and height.
  _animationsToStart: {},

  // and, said animation order
  _animationOrder: ["top", "left", "bottom", "right", "width", "height", "centerX", "centerY", "opacity", "display", "transform"],


  initMixin: function()
  {
    this._animatable_original_didCreateLayer = this.didCreateLayer || function(){};
    this.didCreateLayer = this._animatable_didCreateLayer;

    this._animatable_original_willDestroyLayer = this.willDestroyLayer || function(){};
    this.willDestroyLayer = this._animatable_willDestroyLayer;
    
    this._animatable_original_willRemoveFromParent = this.willRemoveFromParent || function(){};
    this.willRemoveFromParent = this._animatable_will_remove_from_parent;

    this._animatable_original_hasAcceleratedLayer = this.hasAcceleratedLayer || function(){};
    this.hasAcceleratedLayer = this._animatable_hasAcceleratedLayer;

    this._animatable_original_animate = this.animate || function(){};
    this.animate = this._animatable_animate;

    // auto observers do not work when mixed in live, so make sure we do a manual observer
    this.addObserver("style", this, "styleDidChange");

    // for debugging
    this._animateTickPixel.displayName = "animate-tick";

    // if transitions was concatenated...
    var i;
    if (SC.isArray(this.transitions))
    {
      var tl = {}; // prepare a new one mixed in
      for (i = 0; i < this.transitions.length; i++)
      {
        SC.mixin(tl, this.transitions[i]);
      }
      this.transitions = tl;
    }

    // go through transitions and make duration-only ones follow normal pattern
    for (i in this.transitions)
    {
      if (typeof this.transitions[i] == "number")
      {
        this.transitions[i] = { duration: this.transitions[i] };
      }
    }

    // live animators
    this._animatableCurrentStyle = null;
    this._animators = {}; // keyAnimated => object describing it.
    this._animatableSetCSS = "";
    this._last_transition_css = ""; // to keep from re-setting unnecessarily
    // Setting this conditionally allows us to disableAnimation in the init method, before initMixin gets called
    if (this._disableAnimation === undefined) this._disableAnimation = 0; // calls to disableAnimation add one; enableAnimation remove one.
    this._transitionCallbacks = {}; // define callback set
    
    // alert if layer already created
    if (!SC.none(this.get("layer"))) {
      var o = this._animatable_original_didCreateLayer;
      this._animatable_original_didCreateLayer = function(){};
      this.didCreateLayer();
      this._animatable_original_didCreateLayer = o;
      
    }
  },

  _animatable_didCreateLayer: function(){
    this.resetAnimation();
    SC.Event.add(this.get('layer'), SC.platform.cssPrefix+"TransitionEnd", this, this.transitionEnd);
    SC.Event.add(this.get('layer'), "transitionEnd", this, this.transitionEnd);
    return this._animatable_original_didCreateLayer();
  },

  _animatable_willDestroyLayer: function(){
    SC.Event.remove(this.get('layer'), SC.platform.cssPrefix+"TransitionEnd", this, this.transitionEnd);
    SC.Event.remove(this.get('layer'), "transitionEnd", this, this.transitionEnd);
    return this._animatable_original_willDestroyLayer();
  },
  
  /**
  Stops all animations on the layer when this occurs by calling resetAnimation.
  */
  _animatable_will_remove_from_parent: function() {
    this.resetAnimation();
  },
  
  /**
  Disables animation.
  
  It is like parenthesis. Each "disable" must be matched by an "enable".
  If you call disable twice, you need two enables to start it. Three times, you need
  three enables.
  */
  disableAnimation: function() {
    // This fallback is necessary if disableAnimation is called in the init method before initMixin is called
    if (this._disableAnimation === undefined) this._disableAnimation = 0;
    this._disableAnimation++;
  },
  
  /**
  Enables animation if it was disabled (or moves towards that direction, at least).
  */
  enableAnimation: function() {
    this._disableAnimation--; 
    if (this._disableAnimation < 0) this._disableAnimation = 0;
  },

  /**
  Adds support for some style properties to adjust.

  These added properties are currently:
  - opacity.
  - display.

  This is a complete rewrite of adjust. Its performance can probably be boosted. Do it!
  */
  adjust: function(dictionary, value)
  {
    if (!SC.none(value)) {
      var key = dictionary;
      dictionary = { };
      dictionary[key] = value;
    }
    else {
      dictionary = SC.clone(dictionary);
    }

    var style = SC.clone(this.get("style")), didChangeStyle = NO, layout = SC.clone(this.get("layout")), didChangeLayout = NO;
    var sprops = this._styleProperties;
    for (var i in dictionary)
    {
      var didChange = NO;

      var current = (sprops.indexOf(i) >= 0) ? style : layout;
      var cval = current[i], nval = dictionary[i];

      if (nval !== undefined && cval !== nval)
      {
        if (nval === null)
        {
          if (cval !== undefined) didChange = YES;
          delete current[i];
        }
        else
        {
          current[i] = nval;
          didChange = YES;
        }
      }

      if (didChange) {
        if (current === style) didChangeStyle = YES; else didChangeLayout = YES;
      }
    }

    if (didChangeStyle) this.set("style", style);
    if (didChangeLayout) this.set("layout", layout);

    // call base with whatever is leftover
    return this;
  },

  /**
    Don't interfere with the built-in animate method.
  */
  _animatable_animate: function(){
    this.disableAnimation();
    var ret = this._animatable_original_animate.apply(this, arguments);
    this.enableAnimation();
    return ret;
  },

  transitionEnd: function(evt){
    SC.run(function() {
      var propertyName = evt.originalEvent.propertyName,
          callback = this._transitionCallbacks[propertyName];

      // only callback is animation is not disabled; assume if anim was 
      // disabled we already invoked the callback..
      if(callback && this._disableAnimation<=0) {
        SC.Animatable.runCallback(callback);
      }
    }, this);
  },


  /**
  Returns the current set of styles and layout according to JavaScript transitions.
  
  That is, for transitions managed by JavaScript (rather than CSS), the current position
  (even mid-transition) will be returned. For CSS-based transitions, the target position
  will be returned. This function is mostly useful for testing.
  
  It will return null if there is no such style.
  */
  getCurrentJavaScriptStyles: function() {
    return this._animatableCurrentStyle;
  },

  /**
  Resets animation, stopping all existing animations.
  */
  resetAnimation: function() {
    this._animatableCurrentStyle = null;
    this._stopJavaScriptAnimations();
    this.disableAnimation();
    this.updateStyle();
    this.enableAnimation();
    this.updateStyle();
  },
  
  /**
    Stops all JavaScript animations on the object. In their tracks. Hah hah.
    @private
  */
  _stopJavaScriptAnimations: function() {
    for (var i in this._animators) {
      if (this._animators[i] && this._animators[i].isQueued) {
         SC.Animatable.removeTimer(this._animators[i]);
      }
    }
  },

  _getStartStyleHash: function(start, target)
  {
    // temporarily set layout to "start", in the fastest way possible;
    // note that start is an entire style structure—get("frame") doesn't care! HAH!
    var original_layout = this.layout;
    this.layout = start;

    // get our frame and parent's frame
    var p = this.computeParentDimensions();
    var f = this.computeFrameWithParentFrame(p);

    // set back to target
    this.layout = original_layout;

    // prepare a new style set, empty.
    var l = {};

    // loop through properties in target
    for (var i in target)
    {
      if (f)
      {
        if (i == "left") { l[i] = f.x; continue; }
        else if (i == "top") { l[i] = f.y; continue; }
        else if (i == "right") { l[i] = p.width - f.x - f.width; continue; }
        else if (i == "bottom") { l[i] = p.height - f.y - f.height; continue; }
        else if (i == "width") { l[i] = f.width; continue; }
        else if (i == "height") { l[i] = f.height; continue; }
        else if (i == "centerX") { l[i] = f.x + (f.width / 2) - (p.width / 2); continue; }
        else if (i == "centerY") { l[i] = f.y + (f.height / 2) - (p.height / 2); continue; }
      }
      
      if (SC.none(l[i])) {
        if (!SC.none(start[i])) l[i] = start[i];
        else l[i] = target[i];
      }
    }
    return l;
  },

  _TMP_CSS_TRANSITIONS: [],
  
  /**
  @private
  Returns a string with CSS for the timing portion of a transition.
  */
  cssTimingStringFor: function(transition) {
    var timing_function = "linear";
    if (transition.timing || SC.Animatable.defaultTimingFunction) {
      var timing = transition.timing || SC.Animatable.defaultTimingFunction;
      if (SC.typeOf(timing) != SC.T_STRING) {
        timing_function = "cubic-bezier(" + timing[0] + ", " + timing[1] + ", " + timing[2] + ", " + timing[3] + ")";
      } else {
        timing_function = timing;
      }
    }
    return timing_function;
  },
  
  /**
  @private
    Triggers updateStyle at end of run loop.
  */
  styleDidChange: function() {
    this.invokeLast("updateStyle");
  }, // observer set up manually in initMixin to allow live mixins


  /**
    Since transforms can only be animated singly, we don't accelerate the layer unless
    top and left transitions have the same duration.
    Not cacheable since transitions may be updated without using a setter.
  */
  _animatable_hasAcceleratedLayer: function(){
    var leftDuration = this.transitions['left'] && this.transitions['left'].duration,
        topDuration = this.transitions['top'] && this.transitions['top'].duration;

    if (leftDuration !== topDuration) {
      return NO;
    } else if ((topDuration || leftDuration) && !SC.platform.supportsCSSTransitions) {
      return NO;
    } else {
      return this._animatable_original_hasAcceleratedLayer();
    }
  }.property('wantsAcceleratedLayer', 'transitions'),

  /**
  Immediately applies styles to elements, and starts any needed transitions.
  
  Called automatically when style changes, but if you need styles to be adjusted
  immediately (for instance, if you have temporarily disabled animation to set a
  start state), you may want to call manually too.
  */
  updateStyle: function()
  {
    // get the layer. We need it for a great many things.
    var layer = this.get("layer");

    // cont. with other stuff
    var newStyle = this.get("style");

    /* SPECIAL CASES (done now because they need to happen whether or not animation will take place) */
    ////**SPECIAL TRANSFORM CASE**////
    var specialTransform = NO, specialTransformValue = "";
    if (this.get('hasAcceleratedLayer')) {

      var nT = newStyle['top'],
          nB = newStyle['bottom'],
          nH = newStyle['height'],
          nL = newStyle['left'],
          nR = newStyle['right'],
          nW = newStyle['width'];

      // NOTE: This needs to match exactly the conditions in layoutStyles
      if (
        (SC.empty(nT) || (!SC.isPercentage(nT) && !SC.empty(nH))) &&
        (SC.empty(nL) || (!SC.isPercentage(nL) && !SC.empty(nW)))
      ) {
        specialTransform = YES;
        this._useSpecialCaseTransform = YES;
      } else {
        this._useSpecialCaseTransform = NO;
      }
    }
    ////**/SPECIAL TRANSFORM CASE**////

    // make sure there _is_ a previous style to animate from. Otherwise,
    // we don't animate—and this is sometimes used to temporarily disable animation.
    var i;
    if (!this._animatableCurrentStyle || this._disableAnimation > 0 || !layer)
    {
      // clone it to be a nice starting point next time.
      this._animatableSetCSS = "";
      this._animatableCurrentStyle = {};
      for (i in newStyle)
      {
        if (i[0] != "_") this._animatableCurrentStyle[i] = newStyle[i];
      }

      if (layer) this._animatableApplyStyles(layer, newStyle);
      return this;
    }

    // no use doing anything else if no layer.
    if (!layer) return;

    // compare new style to old style. Manually, to skip guid stuff that can
    // mess things up a bit.
    var equal = true;
    for (i in newStyle)
    {
      if (i[0] == "_") continue;
      if (newStyle[i] != this._animatableCurrentStyle[i])
      {
        equal = false;
        break;
      }
    }
    if (equal) return this;

    // get a normalized starting point based off of our style
    var startingPoint = this._getStartStyleHash(this._animatableCurrentStyle, newStyle);
    var endingPoint = {};
    
    // prepare stuff for timing function calc
    var timing;
    
    // also prepare an array of CSS transitions to set up. Do this always so we get (and keep) all transitions.
    var cssTransitions = this._TMP_CSS_TRANSITIONS;
    if (SC.platform.supportsCSSTransitions) {
      // first, handle special cases
      var timing_function;
      
      ////**SPECIAL TRANSFORM CASE**////
      // this is a VERY special case. If right or bottom are supplied, can't do it. If left+top need
      // animation at different speeds: can't do it.
      if (specialTransform) {
        var transitionForTiming = this.transitions['left'] || this.transitions['top'];
        timing_function = this.cssTimingStringFor(transitionForTiming);
        cssTransitions.push("-"+SC.platform.cssPrefix+"-transform " + transitionForTiming.duration + "s " + timing_function);
      }
      ////**END SPECIAL TRANSFORM CASE**////
      
      // loop
      for (i in this.transitions) {
        if (!this._cssTransitionFor[i]) continue;

        ////**SPECIAL TRANSFORM CASE**////        
        if (specialTransform && (i == "left" || i == "top")) {
          if (this.transitions["left"].action){
            this._transitionCallbacks["-"+SC.platform.cssPrefix+"-transform"] = {
              source: this,
              target: (this.transitions["left"].target || this),
              action: this.transitions["left"].action
            };
          }

          if (this.transitions["top"].action){
            this._transitionCallbacks["-"+SC.platform.cssPrefix+"-transform"] = {
              source: this,
              target: (this.transitions["top"].target || this),
              action: this.transitions["top"].action
            };
          }
          continue;
        }
        ////**END SPECIAL TRANSFORM CASE**////

        // get timing function
        timing_function = this.cssTimingStringFor(this.transitions[i]);
        
        // sanitize name
        cssTransitions.push(this._cssTransitionFor[i] + " " + this.transitions[i].duration + "s " + timing_function);		
      }
    }

    for (i in newStyle)
    {
      if (i[0] == "_") continue; // guid (or something else we can't deal with anyway)
      
      
      // if it needs to be set right away since it is not animatable, _getStartStyleHash
      // will have done that. But if we aren't supposed to animate it, we need to know, now.
      var shouldSetImmediately = !this.transitions[i] || newStyle[i] == startingPoint[i];
      if (i == "display" && newStyle[i] != "none") shouldSetImmediately = true;

      if (shouldSetImmediately)
      {
        // set
        startingPoint[i] = newStyle[i];

        // you can't easily stop the animator. So just set its endpoint and make it end soon.
        var animator = this._animators[i];
        if (animator)
        {
          animator.endValue = newStyle[i];
          animator.end = 0;
        }
        continue;
      }

      // If there is an available CSS transition, use that.
      if (SC.platform.supportsCSSTransitions && this._cssTransitionFor[i])
      {
        // the transition is already set up.
        // we can just set it as part of the starting point
        endingPoint[i] = newStyle[i];

        if (this.transitions[i].action){
          this._transitionCallbacks[this._cssTransitionFor[i]] = {
            source: this,
            target: (this.transitions[i].target || this),
            action: this.transitions[i].action
          };
        }

        continue;
      }

      // well well well... looks like we need to animate. Prepare an animation structure.
      // (WHY ARE WE ALWAYS PREPARING?)
      var applier = this._animateTickPixel, 
      property = i, 
      startValue = startingPoint[i], 
      endValue = newStyle[i];

      // special property stuff
      if (property == "centerX" || property == "centerY")
      {
        // uh... need a special applier; it needs to update currentlayout differently than actual
        // layout, since one gets "layout," and the other gets styles.
        applier = this._animateTickCenter;
      }
      else if (property == "opacity")
      {
        applier = this._animateTickNumber;
      }
      else if (property == "display")
      {
        applier = this._animateTickDisplay;
      }

      // cache animator objects, not for memory, but so we can modify them.
      if (!this._animators[i]) this._animators[i] = {};

      // used to mixin a struct. But I think that would create a new struct.
      // also, why waste cycles on a SC.mixin()? So I go the direct approach.
      var a = this._animators[i];

      // set settings...
      // start: Date.now(), // you could put this here. But it is better to wait. The animation is smoother
      // if its beginning time is whenever the first frame fires.
      // otherwise, if there is a big delay before the first frame (perhaps we are animating other elements)
      // the items will "jump" unattractively
      a.start = null;
      a.duration = Math.floor(this.transitions[i].duration * 1000);
      a.startValue = startValue;
      a.endValue = endValue;
      a.layer = layer;
      a.property = property;
      a.action = applier;
      a.style = layer.style;
      a.holder = this;

      if (this.transitions[i].action){
        a.callback = {
          source: this,
          target: (this.transitions[i].target || this),
          action: this.transitions[i].action
        };
      }

      timing = this.transitions[i].timing || SC.Animatable.defaultTimingFunction;
      if (timing && SC.typeOf(timing) != SC.T_STRING) a.timingFunction = timing;

      // add timer
      if (!a.going) this._animationsToStart[i] = a;
    }

    // start animations, in order
    var ao = this._animationOrder, l = this._animationOrder.length;
    for (i = 0; i < l; i++)
    {
      var nextAnimation = ao[i];
      if (this._animationsToStart[nextAnimation])
      {
        SC.Animatable.addTimer(this._animationsToStart[nextAnimation]);
        delete this._animationsToStart[nextAnimation];
      }
    }

    // and update layout to the normalized start.
    var css = cssTransitions.join(",");
    cssTransitions.length = "";
    this._animatableSetCSS = css;

    // apply starting styles directly to layer
    this._animatableApplyStyles(layer, startingPoint, endingPoint);

    // all our timers are scheduled, we should be good to go. YAY.
    return this;

  },

  /**
  @private
  Adjusts display and queues a change for the other properties.
  
  layer: the layer to modify
  styles: the styles to set
  delayed: styles to set after a brief delay (if any)
  */
  _animatableApplyStyles: function(layer, styles, delayed)
  {	
    if (!layer) return;
    
    // handle a specific style first: display. There is a special case because it disrupts transitions.
    var needsRender = NO;
    if (styles["display"] && layer.style["display"] !== styles["display"]) {
      layer.style["display"] = styles["display"];
      needsRender = YES;
    }

    // set CSS transitions very first thing
    if (this._animatableSetCSS != this._last_transition_css) {
      layer.style[SC.platform.domCSSPrefix+"Transition"] = this._animatableSetCSS;
      this._last_transition_css = this._animatableSetCSS;
      needsRender = YES;
    }

    if (!this._animators["display-styles"]) this._animators["display-styles"] = {};

    // get timer
    var timer = this._animators["display-styles"];
    
    // set settings
    timer.holder = this;
    timer.action = this._animatableApplyNonDisplayStylesFromTimer;
    timer.inLoopAction = this._animatableApplyNonDisplayStyles;
    timer.layer = layer;
    timer.styles = styles;
    timer.delayed = delayed;
    this._animatableCurrentStyle = styles;
    
    // schedule.
    if (this._disableAnimation > 0) {
      timer.inLoopAction();
    } else {
      // after setting transition or display, we must wait a moment;
      // otherwise, no animation will happen.
      SC.Animatable.addTimer(timer);
    }
  },
  
  _animatableApplyNonDisplayStylesFromTimer: function() {
    SC.run(function() {
      this.inLoopAction();
    }, this);
  },

  _animatableApplyNonDisplayStyles: function(){
    var layer = this.layer, styles = this.holder._animatableCurrentStyle; // this == timer
    var styleHelpers = {
      // more to be added here...
    };

    var newLayout = {}, updateLayout = NO, style = layer.style;

    // we extract the layout portion so SproutCore can do its own thing...
    var transform = "";
    for (var i in styles)
    {
      if (i == "display") continue;
      if (this.holder._layoutStyles.indexOf(i) >= 0)
      {
        // otherwise, normal layout
        newLayout[i] = styles[i];
        updateLayout = YES;
        continue;
      }
      else if (i == "transform") transform += " " + styles[i];
      else if (styleHelpers[i]) styleHelpers[i](style, i, styles);
      else style[i] = styles[i];
    }

    // apply transform
    if (!SC.empty(transform)) style[SC.platform.cssPrefix+"Transform"] = transform;

    // don't want to set because we don't want updateLayout... again.
    if (updateLayout) {
      var prev = this.holder.layout;
      this.holder.layout = newLayout;

      // set layout
      this.holder.notifyPropertyChange("layoutStyle");

      // apply the styles (but we have to mix it in, because we still have transitions, etc. that we set)
      var ls = this.holder.get("layoutStyle");
      for (var key in ls) {
        if (SC.none(ls[key])) style[key] = ""; // because IE is stupid and can't handle delete or null
        else if (style[key] != ls[key]) style[key] = ls[key];
      }

      // go back to previous
      this.holder.layout = prev;
    }
    
    // queue up any delayed styles
    if (this.delayed) {
      // set settings
      SC.mixin(this.holder._animatableCurrentStyle, this.delayed);
      this.styles = this.delayed;
      this.delayed = undefined;

      // schedule.
      if (this._disableAnimation > 0) {
        this.inLoopAction();
      } else {
        // after setting transition or display, we must wait a moment;
        // otherwise, no animation will happen.
        SC.Animatable.addTimer(this);
      }
    }
  },

  /**
  Overriden to support animation.

  Works by copying the styles to the object's "style" property.
  */
  updateLayout: function(context, firstTime)
  {
    var style = SC.clone(this.get("style"));
    var newLayout = this.get("layout");
    var i = 0, ls = this._layoutStyles, lsl = ls.length, didChange = NO;
    for (i = 0; i < lsl; i++)
    {
      var key = ls[i];
      if (style[key] !== newLayout[key])
      {
        if (SC.none(newLayout[key])) style[key] = undefined; // because IE is stupid and can't handle delete or debug.
        else style[key] = newLayout[key];
        didChange = YES;
      }
    }

    if (didChange) {
      this.style = style;
      this.updateStyle(); // updateLayout is already called late, so why delay longer?
    }

    return this;
  },

  /**
  @private
  Solves cubic bezier curves. Basically, returns the Y for the supplied X.

  I have only a vague idea of how this works. But I do have a vague idea. It is originally
  from WebKit's source code:
  http://trac.webkit.org/browser/trunk/WebCore/platform/graphics/UnitBezier.h?rev=31808
  */
  _solveBezierForT: function(ax, ay, bx, by, cx, cy, x, duration) {
    // determines accuracy. Which means animation is slower for longer duration animations.
    // that seems ironic, for some reason, but I don't know why.

    // SOME OPTIMIZATIONS COULD BE DONE, LIKE MOVING THIS INTO ITS OWN BIT AT BEGINNING OF ANIMATION.
    var epsilon = 1.0 / (200.0 * duration);

    // a method I have NO idea about... Newton's method
    var t0, t1, t2, x2, d2, i;
    for (t2 = x, i = 0; i < 8; i++) {
      x2 = ((ax * t2 + bx) * t2 + cx) * t2 - x; // sample curve x for t2, - x
      if (Math.abs(x2) < epsilon) return t2; // obviously, this is determining the accuracy
      d2 = (3.0 * ax * t2 + 2.0 * bx) * t2 + cx;
      if (Math.abs(d2) < Math.pow(10, -6)) break;
      t2 = t2 - x2 / d2;
    }

    // fall back to bisection
    t0 = 0.0;
    t1 = 1.0;
    t2 = x;
    if (t2 < t0) return t0;
    if (t2 > t1) return t1;
    while (t0 < t1) {
      x2 = ((ax * t2 + bx) * t2 + cx) * t2;
      if (Math.abs(x2 - x) < epsilon) return t2;

      if (x > x2) t0 = t2;
      else t1 = t2;

      t2 = (t1 - t0) * 0.5 + t0;
    }

    return t2; // on failure
  },

  _solveBezier: function(p1x, p1y, p2x, p2y, x, duration) {
    // calculate coefficients
    var cx = 3.0 * p1x;
    var bx = 3.0 * (p2x - p1x) - cx;
    var ax = 1.0 - cx - bx;

    var cy = 3.0 * p1y;
    var by = 3.0 * (p2y - p1y) - cy;
    var ay = 1.0 - cy - by;

    var t = this._solveBezierForT(ax, ay, bx, by, cx, cy, x, duration);

    // now calculate Y
    return ((ay * t + by) * t + cy) * t;
  },

  /**
  @private
  Manages a single step in a single animation.
  NOTE: this=>an animator hash
  */
  _animateTickPixel: function(t)
  {
    // prepare timing stuff
    // first, setup this.start if needed (it is lazy, after all)
    if (SC.none(this.start))
    {
      this.start = t;
      this.end = this.start + this.duration;
    }

    // the differences
    var s = this.start, e = this.end;
    var sv = this.startValue, ev = this.endValue;
    var d = e - s;
    var dv = ev - sv;

    // get current percent of animation completed
    var c = t - s;
    var percent = Math.min(c / d, 1);

    // call interpolator (if any)
    if (this.timingFunction) {
      // this may be slow, but...
      var timing = this.timingFunction;
      percent = this.holder._solveBezier(timing[0], timing[1], timing[2], timing[3], percent, d);
    }

    // calculate new position			
    var value = Math.floor(sv + (dv * percent));
    this.holder._animatableCurrentStyle[this.property] = value;

    // note: the following tested faster than directly setting this.layer.style.cssText
    this.style[this.property] = value + "px";

    if (t < e) SC.Animatable.addTimer(this);
    else {
      this.going = false;
      if(this.callback) SC.Animatable.runCallback(this.callback);
      this.styles = null;
      this.layer = null;
    }
  },

  _animateTickDisplay: function(t)
  {
    // prepare timing stuff
    // first, setup this.start if needed (it is lazy, after all)
    if (SC.none(this.start))
    {
      this.start = t;
      this.end = this.start + this.duration;
    }

    // check if we should keep going (we only set display none, and only at end)
    var e = this.end;
    if (t < e) 
    {
      SC.Animatable.addTimer(this);
      return;
    }

    this.holder._animatableCurrentStyle[this.property] = this.endValue;
    this.style[this.property] = this.endValue;

    this.going = false;
    if(this.callback) SC.Animatable.runCallback(this.callback);
    this.styles = null;
    this.layer = null;
  },

  /**
  @private
  Manages a single step in a single animation.
  NOTE: this=>an animator hash
  */
  _animateTickNumber: function(t)
  {
    // prepare timing stuff
    // first, setup this.start if needed (it is lazy, after all)
    if (SC.none(this.start))
    {
      this.start = t;
      this.end = this.start + this.duration;
    }

    // the differences
    var s = this.start, e = this.end;
    var sv = this.startValue, ev = this.endValue;
    var d = e - s;
    var dv = ev - sv;

    // get current percent of animation completed
    var c = t - s;
    var percent = Math.min(c / d, 1);

    // call interpolator (if any)
    if (this.timingFunction) {
      // this may be slow, but...
      var timing = this.timingFunction;
      percent = this.holder._solveBezier(timing[0], timing[1], timing[2], timing[3], percent, d);
    }

    // calculate new position			
    var value = Math.round((sv + (dv * percent)) * 100) / 100;
    this.holder._animatableCurrentStyle[this.property] = value;

    // note: the following tested faster than directly setting this.layer.style.cssText
    this.style[this.property] = value;
    if (this.property == "opacity")
    {
      this.style["zoom"] = 1;
    }

    if (t < e) SC.Animatable.addTimer(this);
    else {
      this.going = false;
      if(this.callback) SC.Animatable.runCallback(this.callback);
      this.styles = null;
      this.layer = null;
    }
  },

  // NOTE: I tested this with two separate functions (one for each X and Y)
  // 		 no definite performance difference on Safari, at least.
  _animateTickCenter: function(t)
  {
    // prepare timing stuff
    // first, setup this.start if needed (it is lazy, after all)
    if (SC.none(this.start))
    {
      this.start = t;
      this.end = this.start + this.duration;
    }

    // the differences
    var s = this.start, e = this.end;
    var sv = this.startValue, ev = this.endValue;
    var d = e - s;
    var dv = ev - sv;

    // get current percent of animation completed
    var c = t - s;
    var percent = Math.min(c / d, 1);

    // call interpolator (if any)
    if (this.timingFunction) {
      // this may be slow, but...
      var timing = this.timingFunction;
      percent = this.holder._solveBezier(timing[0], timing[1], timing[2], timing[3], percent, d);
    }

    // calculate new position			
    var value = sv + (dv * percent);
    this.holder._animatableCurrentStyle[this.property] = value;

    // calculate style, which needs to subtract half of width/height
    var widthOrHeight, style;
    if (this.property == "centerX")
    {
      widthOrHeight = "width"; style = "marginLeft";
    }
    else
    {
      widthOrHeight = "height"; style = "marginTop";
    }

    this.style[style] = Math.round(value - (this.holder._animatableCurrentStyle[widthOrHeight] / 2)) + "px";
    
    if (t < e) SC.Animatable.addTimer(this);
    else {
      this.going = false;
      if(this.callback) SC.Animatable.runCallback(this.callback);
      this.styles = null;
      this.layer = null;
    }
  }
};

/*
Add Singleton Portion
*/
SC.mixin(SC.Animatable, {
  /** @scope SC.Animatable */
  NAMESPACE: 'SC.Animatable',
  VERSION: '0.1.0',

  /** Linear transition **/
  TRANSITION_NONE: "linear",
  
  /** 'ease' transition if using CSS transitions; otherwise linear. **/
  TRANSITION_CSS_EASE: "ease",
  
  /** 'ease-in' transition if using CSS transitions; otherwise linear. **/
  TRANSITION_CSS_EASE_IN: "ease-in",
  
  /** 'ease-out' transition if using CSS transitions; otherwise linear. **/
  TRANSITION_CSS_EASE_OUT: "ease-out",
  
  /** 'ease-in-out' transition if using CSS transitions; otherwise linear. **/
  TRANSITION_CSS_EASE_IN_OUT: "ease-in-out",

  /** 'ease' transition. **/
  TRANSITION_EASE: [0.25, 0.1, 0.25, 1.0],
  
  TRANSITION_LINEAR: [0.0, 0.0, 1.0, 1.0],
  
  /** 'ease-in' transition. **/
  TRANSITION_EASE_IN: [0.42, 0.0, 1.0, 1.0],
  
  /** 'ease-out' transition. **/
  TRANSITION_EASE_OUT: [0, 0, 0.58, 1.0],
  
  /** 'ease-in-out' transition if using CSS transitions; otherwise linear. **/
  TRANSITION_EASE_IN_OUT: [0.42, 0, 0.58, 1.0],

  /**
    The timing function which all SC.Animatables should default to.
  */
  defaultTimingFunction: null, // you can change to TRANSITION_EASE, etc., but that may impact performance.

  // For performance, use a custom linked-list timer
  baseTimer: {
    next: null
  },
  
  // keep track of whether the timer is running
  going: false,
  
  // ticks and tocs
  _ticks: 0,
  _timer_start_time: null,
  
  // the global tiemr interval
  interval: 10,
  
  // the current time (a placeholder, really)
  currentTime: new Date().getTime(),

  /**
    A hash of stats for any currently running animations. Currently has property
    lastFPS, which is the FPS for the last JavaScript-based animation.
  */
  stats: SC.Object.create({
    lastFPS: 0
  }),
  
  /**
    Adds a timer.
    @private
  */
  addTimer: function(animator) {
    if (animator.isQueued) return;
    animator.prev = SC.Animatable.baseTimer;
    animator.next = SC.Animatable.baseTimer.next;
    if (SC.Animatable.baseTimer.next) SC.Animatable.baseTimer.next.prev = animator; // adjust next prev.
    SC.Animatable.baseTimer.next = animator; // switcheroo.
    animator.isQueued = true;
    if (!SC.Animatable.going) SC.Animatable.start();
  },
  
  /**
    Removes a timer.
    @private
  */
  removeTimer: function(animator) {
    if (!animator.isQueued) return;
    if (animator.next) animator.next.prev = animator.prev; // splice ;)
    animator.prev.next = animator.next; // it should always have a prev.
    animator.isQueued = false;
  },

  start: function()
  {
    SC.Animatable._ticks = 0;
    SC.Animatable._timer_start_time = new Date().getTime();
    SC.Animatable.going = true;

    // set a timeout so tick only runs AFTER any pending animation timers are set.
    setTimeout(function(){ SC.Animatable.timeout(); }, SC.Animatable.interval);
  },

  timeout: function()
  {	
    SC.Animatable.currentTime = new Date().getTime();
    var start = SC.Animatable.currentTime;

    var next = SC.Animatable.baseTimer.next;
    SC.Animatable.baseTimer.next = null;
    var i = 0;
    while (next)
    {
      var t = next.next;
      next.isQueued = false;
      next.next = null;
      next.prev = null;
      next.action.call(next, start);
      next = t;
      i++;
    }

    // built-in FPS counter, so that FPS is only counted DURING animation.
    // is there a way to make the minifier get rid of this? Because that would be lovely.
    // still, only called once per frame, so should _very_ minimally impact performance and memory.
    if (SC.Animatable._ticks < 1000000) SC.Animatable._ticks++; // okay, put _some_ limit on it

    // now see about doing next bit...	
    var end = new Date().getTime();
    var elapsed = end - start;
    if (SC.Animatable.baseTimer.next)
    {
      setTimeout(function(){ SC.Animatable.timeout(); }, Math.max(0, SC.Animatable.interval - elapsed));
    }
    else
    {
      // we're done... so calculate FPS
      SC.Animatable.going = false;

      // get diff
      var time_diff = end - SC.Animatable._timer_start_time;
      SC.run(function() {
        SC.Animatable.stats.set("lastFPS", SC.Animatable._ticks / (time_diff / 1000));
      });
    }
  },

  runCallback: function(callback){
    var typeOfAction = SC.typeOf(callback.action);

    // if the action is a function, just try to call it.
    if (typeOfAction == SC.T_FUNCTION) {
      callback.action.call(callback.target, callback.source);

    // otherwise, action should be a string.  If it has a period, treat it
    // like a property path.
    } else if (typeOfAction === SC.T_STRING) {
      if (callback.action.indexOf('.') >= 0) {
        var path = callback.action.split('.') ;
        var property = path.pop() ;

        var target = SC.objectForPropertyPath(path, window) ;
        var action = target.get ? target.get(property) : target[property];
        if (action && SC.typeOf(action) == SC.T_FUNCTION) {
          action.call(target, callback.source);
        } else {
          throw 'SC.Animator could not find a function at %@'.fmt(callback.action) ;
        }

      // otherwise, try to execute action direction on target or send down
      // responder chain.
      } else {
        SC.RootResponder.responder.sendAction(callback.action, callback.target, callback.source, callback.source.get("pane"), null, callback.source);
      }
    }
  }

});
