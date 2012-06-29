/** @class

      MyApp.PopupAnimation = SC.Animation.create({
        keyframes: {
          from: { scale: 0 },
          33:   { scale: 1.05 },
          66:   { scale: .95 },
          to:   { scale: 1 }
        }
      });

      SC.AlertPane.create()
                  .append()
                  .animate(MyApp.PopupAnimation, {
                    timing: 'ease-in-out',
                    duration: 0.5
                  });

  @extends SC.Object
 */
SC.Animation = SC.Object.extend(
  /** @scope SC.Animation.prototype */{

  init: function () {
    var ss = this.constructor.sharedStyleSheet(),
        keyframes = this.keyframes,
        keyframe, stop,
        rule = [],
        style,
        styles,
        value,
        idx,
        name = this.name || SC.guidFor(this),
        supportsCSSTransforms = SC.platform.supportsCSSTransforms,
        platformTransform = '-' + SC.platform.cssPrefix + '-transform',
        keyframeLookup = SC.IndexSet.create(),
        cssKeyframes = [];

    rule.push('@-' + SC.platform.cssPrefix + '-keyframes ' + name + '{');

    for (stop in keyframes) {
      if (keyframes.hasOwnProperty(stop)) {
        if (/^\d+$/.test(stop)) stop = parseInt(stop);

        // @if(debug)
        if ((SC.typeOf(stop) === SC.T_STRING &&
             (stop !== 'from' || stop !== 'to')) ||
            (SC.typeOf(stop) === SC.T_NUMBER &&
             (stop < 0 || stop > 100 ||
              parseInt(stop) !== stop))) {
          throw new Error(("<SC.Animation:%@> Only 'to' and 'from' or " +
                           "an integer between 0 and 100 (inclusive) " +
                           "are allowed for keyframe rules").fmt(name));
        }
        // @endif

        keyframe = keyframes[stop];

        if (stop === 'to' ||
            stop === 'from') {
          rule.push(stop);

          stop = stop === 'from' ? 0 : 100;
        } else {
          rule.push(stop + '%');
        }

        rule.push('{');

        styles = [];

        // Normalize SC-ish styles into normalized CSS styles
        for (style in keyframe) {
          if (keyframe.hasOwnProperty(style)) {
            value = keyframe[style];
            if (value == null) {
              throw new Error('<SC.Animation:%@> Can only animate %@ to an actual value!'
                              .fmt(name, style));
            }

            if (supportsCSSTransforms && SC.CSS_TRANSFORM_MAP[style]) {
              style = platformTransform;
              value = SC.CSS_TRANSFORM_MAP[style](value);
              if (styles[style]) {
                styles[style] += ' ' + value;
              } else {
                styles[style] = value;
              }
            } else {
              styles[style] = value;
            }
          }
        }

        keyframeLookup.add(stop);
        cssKeyframes[stop] = styles;

        for (style in styles) {
          if (styles.hasOwnProperty(style)) {
            rule.push(style.dasherize() + ':' + styles[style] + ';');
          }
        }
        rule.push('}');
      }
    }

    rule.push('}');

    idx = ss.insertRule(rule.join(''), ss.cssRules ? ss.cssRules.length : 0);
    this._ssIndex = idx;
    this.name = name;

    this._sca_keyframes = cssKeyframes;
    this._sca_keyframeLookup = keyframeLookup;

    return sc_super();
  },

  /** @private */
  _sca_keyframes: null,

  /** @private */
  _sca_keyframeLookup: null,

  /**
    The calculated CSS frame for the given percent.
   */
  frameFor: function (percent) {
    var lookup = this._sca_keyframeLookup,
        keyframes = this._sca_keyframes,
        beforeIndex = lookup.indexBefore(percent),
        afterIndex = lookup.indexAfter(percent),
        isKeyframe = lookup.contains(percent),
        frame;

    if (isKeyframe) {
      frame = keyframes[percent];
    } else {
      var beforeFrame = keyframes[beforeIndex],
          afterFrame = keyframes[afterIndex],
          style;

      for (style in beforeFrame) {
        if (beforeFrame.hasOwnProperty(style)) {
          
        }
      }
    }

    return frame;
  },

  _sca_: function (timing, styleName, beforeStyle, afterStyle) {
    var value = afterStyle - beforeStyle;

    switch (styleName) {
    case top:
    case left:
    case bottom:
    case right:
    case width:
    case height:
      if (value === SC.LAYOUT_AUTO) {
        value = SC.LAYOUT_AUTO;
      } else if (SC.isPercentage(value)) {
        value = (value * 100) + '%';
      } else {
        value = Math.floor(value);
      }
      break;
    case opacity:
      break;
    case scale:
      break;
    case rotate:
    case rotateX:
    case rotateY:
      break;
    case backgroundColor:
    case color:
      break;
    }
  },

  /**
    The name of the animation.
    @type String
    @default null
   */
  name: null,

  /**
    The keyframes 
   */
  keyframes: null,

  /** @private
    The index of the keyframes rule in the
    shared stylesheet.

    @type Number
   */
  _ssIndex: null,

  /** @private
    Removes this keyframes rule from the
    shared stylesheet.
   */
  destroy: function () {
    var ss = SC.Animation.sharedStyleSheet();
    ss.deleteRule(this._ssIndex);
    return sc_super();
  }

});

SC.mixin(SC.Animation, {

  sharedStyleSheet: function () {
    var head, ss = this._styleSheet;
    if (!ss) {
      // create the stylesheet object the hard way (works everywhere)
      ss = document.createElement('style');
      ss.type = 'text/css';
      head = document.getElementsByTagName('head')[0];
      if (!head) head = document.documentElement; // fix for Opera
      head.appendChild(ss);
    
      // get the actual stylesheet object, not the DOM element
      ss = document.styleSheets[document.styleSheets.length-1];
      this._styleSheet = ss;
    }
    return ss;
  }

});
