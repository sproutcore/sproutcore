SC.CSSTransition = function (view, hash, options) {
  var styles = {},
      style, value,
      duration = options.duration || 0,
      delay = options.delay || 0,
      timing = options.timing || 'ease',
      transitions = [],
      supportsCSSTransforms = SC.platform.supportsCSSTransforms,
      platformTransform = '-' + SC.platform.cssPrefix + '-transform';

  if (SC.ANIMATION_TIMINGS[timing]) {
    timing = SC.ANIMATION_TIMINGS[timing];
  } else if (SC.isArray(timing) && timing.length === 4) {
    timing = 'cubic-bezier(' + timing[0] + ',' + timing[1] +
                               timing[2] + ',' + timing[3] + ')';
  // @if(debug)
  } else {
    throw new Error(('<SC.View#%@> %@ is an invalid timing.\n' +
                     'A timing must be one of the keys in SC.ANIMATION_TIMINGS ' +
                     'or an array of values for a bézier curve').fmt(view.get('layerId')));
  // @endif
  }

  for (style in hash) {
    if (hash.hasOwnProperty(style) && SC.ANIMATABLE_PROPERTIES[style]) {
      value = hash[style];
      if (value == null) {
        throw new Error('<SC.View#%@> Can only animate %@ to an actual value!'
                        .fmt(view.get('layerId'), style));
      }

      if (supportsCSSTransforms && SC.CSS_TRANSFORM_MAP[style]) {
        value = SC.CSS_TRANSFORM_MAP[style](value);
        style = platformTransform;
        if (styles[style]) {
          styles[style] += ' ' + value;
        } else {
          styles[style] = value;
        }
      } else {
        styles[style] = value;
      }

      transitions.push(style.dasherize() + ' ' + duration + 's ' + timing + ' ' + delay + 's');
    }
  }
  this.transitions = transitions;

  this.layer = view.get('layer');
  this.style = styles;
  this.callback = options.callback || SC.K;

  SC.RunLoop.currentRunLoop.invokeLast(this, 'run');
};

SC.CSSTransition.prototype = {

  /**
    The DOM event that will be fired when the
    transition has ended.
    @see https://developer.mozilla.org/en/CSS/CSS_transitions#Browser_compatibility
   */
  transitionEndName: (function () {
    var name;

    switch (SC.browser.engine) {
    case SC.ENGINE.webkit:
      name = 'webkitTransitionEnd';
      break;
    case SC.ENGINE.opera:
    case SC.ENGINE.presto:
      name = 'oTransitionEnd';
      break;
    case SC.ENGINE.trident:
      name = 'MsTransitionEnd';
      break;
    case SC.ENGINE.gecko:
    default:
      name = 'transitionend';
    }

    return name;
  }()),

  /**
    @type DOMElement
    @default null
   */
  layer: null,

  style: null,

  transitionName: SC.platform.cssPrefix + 'Transition',

  transitions: null,

  /**
    @type Function
    @default null
   */
  callback: null,

  run: function () {
    var layer = this.layer,
        willTransition = NO;

    SC.Event.add(layer, this.transitionEndName, this, this.transitionDidEnd);
    layer.style[this.transitionName] = this.transitions.join(', ');

    for (var style in this.style) {
      if (this.style.hasOwnProperty(style)) {
        if (layer.style[style] !== this.style[style]) {
          layer.style[style] = this.style[style];
          willTransition = YES;
        } else {
          delete this.style[style];
        }
      }
    }

    if (!willTransition) {
      this.stop();
    }
  },

  transitionDidEnd: function (evt) {
    var propertyName = evt.originalEvent.propertyName,
        camelizedPropertyName = propertyName.camelize(),
        style = evt.originalEvent.target.style;

    // Filter out all properties that weren't
    // explicitly transitioned
    if ((propertyName in style &&
         (style.cssText.indexOf(propertyName) !== -1)) ||
        (camelizedPropertyName in style &&
         style.cssText.indexOf(camelizedPropertyName) !== -1)) {
      delete this.style[evt.originalEvent.propertyName];
      this.stop(evt);
    }
  },

  stop: function (evt) {
    if (Object.keys(this.style).length === 0) {
      SC.Event.remove(this.layer, this.transitionEndName, this, this.transitionDidEnd);

      var styles = this.style,
          layerStyle = this.layer.style;

      layerStyle[this.transitionName] = null;

      console.error("DONE");
      if (this.callback) {
        this.callback(evt, this.layer);
      }
    }
  },

  destroy: function () {
    this.layer = null;
    this.callback = null;
  }
};
