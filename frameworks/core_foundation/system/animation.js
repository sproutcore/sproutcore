SC.Animation = function (view, end, options) {
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
    if (SC.Animation.TIMINGS.hasOwnProperty(timing)) {
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

SC.Animation.prototype = {

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

  TIMINGS: {
    "linear":      "cubic-bezier(0.250, 0.250, 0.750, 0.750)",
    "ease":        "cubic-bezier(0.250, 0.100, 0.250, 1.000)",
    "ease-in":     "cubic-bezier(0.420, 0.000, 1.000, 1.000)",
    "ease-out":    "cubic-bezier(0.000, 0.000, 0.580, 1.000)",
    "ease-in-out": "cubic-bezier(0.420, 0.000, 0.580, 1.000)"
  },

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
