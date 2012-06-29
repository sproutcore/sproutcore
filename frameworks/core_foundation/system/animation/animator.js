sc_require('system/platform');

/**
  Properties that can be animated
  (Hash for faster lookup)
  Should be based off of:
  @see http://oli.jp/2010/css-animatable-properties/
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
  rotateZ: YES,

  // Colors
  color:           NO,
  backgroundColor: NO
};

SC.Animator = function (view, keyframes, options) {
  var duration = options.duration || 0,
      delay = options.delay || 0,
      timing = options.timing || 'ease',
      direction = options.direction || 'normal',
      iterationCount = options.iterationCount;

  if (iterationCount == null) {
    iterationCount = 1;
  }

  // @if(debug)
  if (iterationCount < 0 || isNaN(iterationCount)) {
    throw new Error(('<SC.View#%@> %@ is an invalid iteration count.\n' +
                     'The iteration count must be 0 or greater.').fmt(view.get('layerId')));
  }
  // @end

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

  if (SC.instanceOf(keyframes) === SC.KeyframesRule) {
    this.keyframesRule = keyframes;

  } else {
    this.keyframesRule = SC.KeyframeRule.create({
      keyframes: keyframes
    });
    this.isAnonymous = YES;
  }

  this.layer = view.get('layer');
  this.animation = animation;
  this.callback = options.callback || SC.K;
};


// Handle browsers that support CSS3 animations
if (SC.platform.supportsCSSAnimations) {

SC.Animator.prototype = {

  /**
    The DOM event that will be fired when the
    animation has ended.
    @see https://developer.mozilla.org/en/CSS/CSS_animations
   */
  animationEndName: (function () {
    var name;

    switch (SC.browser.engine) {
    case SC.ENGINE.webkit:
      name = 'webkitAnimationEnd';
      break;
    case SC.ENGINE.opera:
    case SC.ENGINE.presto:
      name = 'oAnimationEnd';
      break;
    case SC.ENGINE.trident:
      name = 'MsAnimationEnd';
      break;
    case SC.ENGINE.gecko:
    default:
      name = 'animationend';
    }

    return name;
  }()),

  /**
    @type DOMElement
    @default null
   */
  layer: null,

  /**
    @type Function
    @default null
   */
  callback: null,

  animationName: SC.platform.cssPrefix + 'Animation',

  run: function () {
    var layer = this.layer;

    SC.Event.add(layer, this.animationEndName, this, this.animationDidEnd);
    layer.style[this.animationName] = this.animation;
  },

  animationDidEnd: function (evt) {
    var propertyName = evt.originalEvent.propertyName,
        camelizedPropertyName = propertyName.camelize(),
        style = evt.originalEvent.target.style;

    // Filter out all properties that weren't
    // explicitly animated
    if ((propertyName in style &&
         (style.cssText.indexOf(propertyName) !== -1)) ||
        (camelizedPropertyName in style &&
         style.cssText.indexOf(camelizedPropertyName) !== -1)) {
      this.stop(evt);
    }
  },

  stop: function (evt) {
    SC.Event.remove(layer, this.animationEndName, this, this.animationDidEnd);
    this.layer.style[this.animationName] = null;

    if (this.isAnonymous) {
      this.keyframesRule.destroy();
    }

    if (this.callback) {
      this.callback(evt);
    }
  },

  destroy: function () {
    this.layer = null;
    this.callback = null;
  }
};

} else {

// We need to create tweening functions for
// the following units (supported by SC.View#layout):
//
//   px, %, ints, floats *and* centerX / centerY


/**
  The options hash allows the following:

     `duration`: The duration of the animation.
     `timing`:   The timing function to use.
     `delay`:    How long the animation should be
                 delayed before starting.
     `callback`: The function to be called when the
                 animation is completed.
     `framerate`: The framerate of the animation if
                  *not* using native animations.

  iterationCount: Infinity or >=0
  direction: 'normal', 'reverse', 'alternate', or 'alternate-reverse'
  playState: 'running', 'paused'

  If the animation is named, then the frames will
  be cached for each sucesssive run. Otherwise,
  the animation will be run anonymously and the
  animation frames will be calculated every time.

  @param {SC.View} view The view to animate.
  @see http://www.w3.org/TR/css3-animations/
 */
SC.Animator = function (view, keyframes, options) {
  options = options || {};

  var start = {},
      keys = [],
      delta = {},
      units = {},
      key, style,
      timing = options.timing || "ease",
      isBezier = NO,
      $layer = view.$();

  if (options.framerate) {
    this.framerate = options.framerate;
  }

  if (typeof timing === "string") {
    if (SC.ANIMATION_TIMINGS.hasOwnProperty(timing)) {
      timing = SC.Animation.TIMINGS[timing];
    }

    if (SC.Animation.PARSE_CUBIC_BEZIER.test(timing)) {
      var match = timing.match(SC.Animation.PARSE_CUBIC_BEZIER);
      isBezier = YES;
      timing = SC.Animation.createCubicBezier(parseFloat(match[1]),
                                              parseFloat(match[2]),
                                              parseFloat(match[3]),
                                              parseFloat(match[4]));
    }
  }

  this.callback = options.callback;
  if (options.duration) {
    this.duration = options.duration;
  }

  for (key in end) {
    if (end.hasOwnProperty(key)) {
      keys.push(key);
      style = $layer.css(key);
      start[key] = SC.Color.from(style) ||
                   parseInt(style);

      if (SC.instanceOf(start[key], SC.Color)) {
        units[key] = 'color';
        end[key] = SC.Color.from(end[key]);
        delta[key] = end[key].sub(start[key]);
      } else {
        delta[key] = end[key] - start[key];
      }
    }
  }

  // Create a plan of all of the points that
  // we should hit between the start and end
  // for this animation.
  var duration = this.duration,
      framerate = this.framerate,
      nFrames = (framerate * duration),
      frames = new Array(nFrames),
      i, j, kLen = keys.length, frame,
      percent;

  if (isBezier) nFrames++;

  for (i = 0; i <= nFrames; i++) {
    frames[i] = frame = {};
    percent = i / nFrames;

    for (j = 0; j < kLen; j++) {
      key = keys[j];
      // Bezier curve
      if (isBezier) {
        frame[key] = keyframes.frameFor(percent, timing);
        if (units[key] === 'color') {
          frame[key] = start[key].add(delta[key].mult(timing(percent))).get('cssText');
        } else {
          frame[key] = start[key] + delta[key] * timing(percent);
        }
      }
    }
  }

  this.frames = frames;
  this.lastFrame = frames.length;
  this.timeBetweenFrames = 1 / framerate * 1000;
  this.layer = view.get('layer');

  SC.Animation.RunLoop.schedule(this);
};

SC.Animator.prototype = {

  layer: null,

  duration: 0,

  framerate: 60,

  lastFrame: 0,

  frame: 0,

  lastRuntime: 0,

  callback: null,

  frames: null,

  timeBetweenFrames: 1,

  run: function (now) {
    var frame = this.frame,
        lastRuntime = this.lastRuntime;

    if (lastRuntime) {
      frame += Math.floor((now - lastRuntime) / this.timeBetweenFrames);
      if (frame === this.frame) {
        return; // NOOP
      }
    }

    if (frame >= this.lastFrame) {
      this.stop();
    } else {
      SC.mixin(this.layer.style, this.frames[frame]);
      this.frame = frame;
      this.lastRuntime = now;
    }
  },

  stop: function () {
    if (this.callback) {
      this.callback(this.layer);
    }

    SC.Animation.RunLoop.stop(this);
  },

  destroy: function () {
    this.frames = null;
    this.layer = null;
    this.callback = null;
  }
};

SC.mixin(SC.Animation, {

  PARSE_CUBIC_BEZIER: /cubic-bezier\(([.\d]+),\s*([.\d]+),\s*([.\d]+),\s*([.\d]+)\)/,

  createCubicBezier: function (X1, Y1, X2, Y2) {
    var X0 = 0,
        Y0 = 0,
        X3 = 1,
        Y3 = 0,

        A = X3 - 3 * X2 + 3 * X1 - X0,
        B = 3 * X2 - 6 * X1 + 3 * X0,
        C = 3 * X1 - 3 * X0,
        D = X0,
        E = Y3 - 3 * Y2 + 3 * Y1 - Y0,
        F = 3 * Y2 - 6 * Y1 + 3 * Y0,
        G = 3 * Y1 - 3 * Y0,
        H = Y0;

    return function (t, start, delta) {
      return ((((A * t) + B) * t + C) * t + D);
    };
  }

});

SC.Animation.RunLoop = {

  tasks: {},

  completed: [],

  running: 0,

  requestRunLoop: (function () {
    return window.requestAnimationFrame       ||
           window.webkitRequestAnimationFrame ||
           window.mozRequestAnimationFrame    ||
           window.oRequestAnimationFrame      ||
           window.msRequestAnimationFrame     ||
           function (callback) {
             window.setTimeout(callback, 1000 / 60);
           };
  }()),

  schedule: function (task) {
    this.tasks[SC.guidFor(task)] = task;
    this.running++;

    var self = this;
    this.requestRunLoop.call(window, function () {
      self.run();
    });
  },

  run: function () {
    var tasks = this.tasks,
        start = new Date().getTime(),
        self = this,
        key;

    for (key in tasks) {
      if (tasks.hasOwnProperty(key)) {
        tasks[key].run(start);
      }
    }

    this.flush();

    if (this.running) {
      this.requestRunLoop.call(window, function () {
        self.run();
      });
    }
  },

  flush: function () {
    var completed = this.completed,
        len = completed.length,
        tasks = this.tasks,
        task,
        guid, i;

    for (i = 0; i < len; i++) {
      task = completed[i];
      guid = SC.guidFor(task);

      // GC
      delete tasks[guid];
      task.destroy();
    }

    this.completed = [];
    this.running -= len;
  },

  stop: function (task) {
    this.completed.push(task);
  }

};

}
