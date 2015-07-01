// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require("system/gesture");


/**
  @static
  @type String
  @constant
*/
SC.SWIPE_HORIZONTAL = [0, 180];

/**
  @static
  @type String
  @constant
*/
SC.SWIPE_VERTICAL = [90, -90];

/**
  @static
  @type String
  @constant
*/
SC.SWIPE_ANY = null;

/**
  @static
  @type String
  @constant
*/
SC.SWIPE_LEFT = [180];

/**
  @static
  @type String
  @constant
*/
SC.SWIPE_RIGHT = [0];

/**
  @static
  @type String
  @constant
*/
SC.SWIPE_UP = [-90];

/**
  @static
  @type String
  @constant
*/
SC.SWIPE_DOWN = [90];

/**
  ## What is a "swipe"?

  A swipe is one or more quick unidirectionally moving touches that end abruptly. By this, it is
  meant that at some point the touches begin to move quickly, `swipeVelocity` in a single direction,
  `angles`, and cover a fair amount of distance, `swipeDistance`, before ending.

  The single direction that the touches move in, must follow one of the angles specified in the
  `angles` array. However, the touches do not need to precisely match an angle and may vary by
  an amount above or below the angle as defined by the `tolerance` property.

  Because the swipe is the last moment of the touch session, the swipe gesture is always interested
  in a touch session. As long as the last distance traveled is great enough and at an
  approved angle, then a swipe will trigger.

  @class
  @extends SC.Gesture
*/
SC.SwipeGesture = SC.Gesture.extend(
/** @scope SC.SwipeGesture.prototype */ {

  //
  // - Properties --------------------------------------------------------------------
  //

  /** @private The last approved angle. Is set as long as a swipe appears valid. */
  _sc_lastAngle: null,

  /** @private The last computed distance. Is set as long as a swipe appears valid. */
  _sc_lastDistance: null,

  /** @private The number of touches in the current swipe. */
  _sc_numberOfTouches: 0,

  /** @private The initial point where a swipe appears to begin. */
  _sc_swipeAnchorX: null,

  /** @private The initial point where a swipe appears to begin. */
  _sc_swipeAnchorY: null,

  /** @private The last time a movement in a swipe was recorded. */
  _sc_swipeLastMovedAt: null,

  /**
    The angles that the swipe will accept, between 0° and ±180°. The angles start from the right
    side (0°) and end at the left side (±180°). With the positive angles passing through *down*
    (+90°) and the negative angles passing through *up* (-90°). The following ASCII art shows the
    directions of the angles,


                        -90° (up)
                          |
                          |
        (left) ± 180° --------- 0° (right)
                          |
                          |
                 (down) +90°

    To make this easier, there are several predefined angles arrays that you can use,

    * SC.SWIPE_HORIZONTAL ([180, 0]), i.e. left or right
    * SC.SWIPE_VERTICAL ([-90, 90]), i.e. up or down
    * SC.SWIPE_ANY (null), i.e. 0° to up, down, left or right
    * SC.SWIPE_LEFT ([180]), i.e. left only
    * SC.SWIPE_RIGHT ([0]), i.e. right only
    * SC.SWIPE_UP ([-90]), i.e. up only
    * SC.SWIPE_DOWN ([90]), down only

    However, you can provide any combination of angles that you want. For example, to support
    45° angled swipes to the right and straight swipes to the left, we would use,

       angles: [180, -45, 45] // 180° straight left, -45° up & right, 45° down & right

    ## How to use the angles.

    When the `swipe` event fires, the angle of the swipe is passed to your view allowing you to
    recognize which of the supported angles matched the swipe.

    Note, there is one special case, as defined by `SC.SWIPE_ANY`, which is to set angles to `null`
    in order to support swipes in *any* direction. The code will look for a swipe (unidirectional
    fast motion) in any direction and pass the observed angle to the `swipe` handler.

    @type Array
    @default 24
  */
  // This is a computed property in order to provide backwards compatibility for direction.
  // When direction is removed completely, this can become a simple `SC.SWIPE_HORIZONTAL` value.
  angles: function (key, value) {
    var direction = this.get('direction'),
      ret = SC.SWIPE_HORIZONTAL;

    // Backwards compatibility support
    if (!SC.none(direction)) {
      //@if(debug)
      SC.warn('Developer Warning: The direction property of SC.SwipeGesture has been renamed to angles.');
      //@endif

      return direction;
    }

    if (!SC.none(value)) { ret = value; }

    return ret;
  }.property('direction').cacheable(),


  /** @deprecated Version 1.11. Please use the `angles` property instead.
    @type Array
    @default SC.SWIPE_HORIZONTAL
  */
  direction: SC.SWIPE_HORIZONTAL,

  /**
    @type String
    @default "swipe"
    @readOnly
  */
  name: "swipe",

  /**
    The distance in pixels that touches must move in a single direction to be far enough in order to
    be considered a swipe. If the touches don't move `swipeDistance` amount of pixels, then the
    gesture will not trigger.

    @type Number
    @default 40
  */
  swipeDistance: 40,

  /**
    The velocity in pixels per millisecond that touches must be traveling to begin a swipe motion.
    If the touches are moving slower than the velocity, the swipe start point won't be set.

    @type Number
    @default 0.5
  */
  swipeVelocity: 0.5,

  /**
    Amount of degrees that a touch is allowed to vary off of the target angle(s).

    @type Number
    @default 15
  */
  tolerance: 15,

  //
  // - Methods --------------------------------------------------------------------
  //

  /** @private Cleans up the touch session. */
  _sc_cleanUpTouchSession: function (wasCancelled) {
    // Clean up.
    this._sc_numberOfTouches = 0;
    this._sc_lastDistance = null;
    this._sc_swipeStartedAt = null;
    this._sc_lastAngle = null;
    this._sc_swipeAnchorX = null;
    this._sc_swipeAnchorY = null;
  },

  /** @private Timer used to tell if swipe was too slow. */
  _sc_swipeTooSlow: function () {
    // The session took to long to finish from when a swipe appeared to start. Reset.
    this._sc_cleanUpTouchSession();
  },

  /**
    The swipe gesture is always interested in a touch session, because it is only concerned in how
    the session ends. If it ends with a fast unidirectional sliding movement, then it is a swipe.

    Note, that for multiple touches, touches are expected to start while other touches are already
    moving. When touches are added we update the swipe start position. This means that inadvertent
    taps that occur while swiping could break a swipe recognition by making the swipe too short to
    register.

    @param {SC.Touch} touch The touch to be added to the session.
    @param {Array} touchesInSession The touches already in the session.
    @returns {Boolean} True as long as the new touch doesn't start too late after the first touch.
    @see SC.Gesture#touchAddedToSession
    */
  // TODO: What about first touch starts moving, second touch taps, first touch finishes?
  // TODO: What about first touch starts tap, second touch starts moving, first touch finishes tap, second touch finishes?
  touchAddedToSession: function (touch, touchesInSession) {
    // Get the averaged touches for the the view. Because pinch is always interested in every touch
    // the touchesInSession will equal the touches for the view.
    var avgTouch = touch.averagedTouchesForView(this.view, true);

    this._sc_swipeAnchorX = avgTouch.x;
    this._sc_swipeAnchorY = avgTouch.y;

    return true;
  },

  /**
    The swipe gesture is always interested in a touch session, because it is only concerned in how
    the session ends. If it ends with a fast unidirectional sliding movement, then it is a swipe.

    Note, that a touch may cancel while swiping (went off screen inadvertently). Because of this we
    don't immediately reduce the number of touches in the swipe, because if the rest of the touches
    end right away in a swipe, it's best to consider the cancelled touch as part of the group.

    @param {SC.Touch} touch The touch to be removed from the session.
    @param {Array} touchesInSession The touches in the session.
    @returns {Boolean} True
    @see SC.Gesture#touchCancelledInSession
    */
  touchCancelledInSession: function (touch, touchesInSession) {
    return true;
  },

  /**
    The swipe gesture is always interested in a touch session, because it is only concerned in how
    the session ends. If it ends with a fast unidirectional sliding movement, then it is a swipe.

    Note, that touches are expected to end while swiping. Because of this we don't immediately
    reduce the number of touches in the swipe, because if the rest of the touches also end right
    away in a swiping motion, it's best to consider this ended touch as part of the group.

    @param {SC.Touch} touch The touch to be removed from the session.
    @param {Array} touchesInSession The touches in the session.
    @returns {Boolean} True if it is the first touch to end or a subsequent touch that ends not too long after the first touch ended.
    @see SC.Gesture#touchEndedInSession
  */
  touchEndedInSession: function (touch, touchesInSession) {
    return true;
  },

  /** @private Test the given angle against an approved angle. */
  _sc_testAngle: function (absoluteCurrentAngle, currentIsPositive, approvedAngle, tolerance) {
    var angleIsPositive = approvedAngle >= 0,
        absoluteAngle = !angleIsPositive ? Math.abs(approvedAngle) : approvedAngle,
        upperBound = absoluteAngle + tolerance,
        lowerBound = absoluteAngle - tolerance,
        ret = false;

    if (lowerBound <= absoluteCurrentAngle && absoluteCurrentAngle <= upperBound) {
      // Special case: ex. Don't confuse -45° with 45° or vice versa.
      var upperBoundIsPositive = upperBound >= 0 && upperBound <= 180,
          lowerBoundIsPositive = lowerBound >= 0;

      ret = upperBoundIsPositive === lowerBoundIsPositive ? currentIsPositive === angleIsPositive : true;
    }

    return ret;
  },

  /**
    The swipe gesture is always interested in a touch session, because it is only concerned in how
    the session ends. If it ends with a fast unidirectional sliding movement, then it is a swipe.

    @param {Array} touchesInSession All touches in the session.
    @returns {Boolean} True as long as none of the touches have moved too far off-axis to be a clean swipe.
    @see SC.Gesture#touchesMovedInSession
    */
  touchesMovedInSession: function (touchesInSession) {
    // Get the averaged touches for the the view. Because swipe is always interested in every touch
    // (or none) the touchesInSession will equal the touches for the view.
    var angles = this.get('direction'),
        avgTouch = touchesInSession[0].averagedTouchesForView(this.view),
        xDiff = avgTouch.x - this._sc_swipeAnchorX,
        yDiff = avgTouch.y - this._sc_swipeAnchorY,
        currentAngle = Math.atan2(yDiff, xDiff) * (180 / Math.PI),
        absoluteCurrentAngle = Math.abs(currentAngle),
        currentIsPositive = currentAngle >= 0,
        tolerance = this.get('tolerance'),
        approvedAngle = null,
        angle;

    // There is one special case, when angles is null, allow all angles.
    if (angles === null) {
      // Use the last angle against itself.
      angle = this._sc_lastAngle;

      if (angle !== null) {
        var withinLastAngle = this._sc_testAngle(absoluteCurrentAngle, currentIsPositive, angle, tolerance);

        // If still within the start angle, leave it going.
        if (withinLastAngle) {
          approvedAngle = angle;
        } else {
          approvedAngle = currentAngle;
        }
      } else {
        approvedAngle = currentAngle;
      }

    // Check against approved angles.
    } else {
      for (var i = 0, len = angles.length; i < len; i++) {
        angle = angles[i];

        // If the current angle is within the tolerance of the given angle, it's a match.
        if (this._sc_testAngle(absoluteCurrentAngle, currentIsPositive, angle, tolerance)) {
          approvedAngle = angle;

          break; // No need to continue.
        }
      }
    }

    // Got angle.
    if (approvedAngle !== null) {
      // Same angle. Ensure we're traveling fast enough to keep the angle.
      if (this._sc_lastAngle === approvedAngle) {
        // Get distance between the anchor and current average point.
        var dx = Math.abs(xDiff),
            dy = Math.abs(yDiff),
            now = Date.now(),
            distance,
            velocity;

        distance = Math.pow(dx * dx + dy * dy, 0.5);
        velocity = distance / (now - this._sc_swipeStartedAt);

        // If velocity is too slow, lost swipe.
        var minimumVelocity = this.get('swipeVelocity');
        if (velocity < minimumVelocity) {
          this._sc_lastAngle = null;
          this._sc_swipeAnchorX = avgTouch.x;
          this._sc_swipeAnchorY = avgTouch.y;
          this._sc_lastDistance = 0;
          this._sc_swipeStartedAt = null;
        } else {
          // Track how far we've gone in this approved direction.
          this._sc_lastDistance = distance;
          this._sc_swipeLastMovedAt = Date.now();
        }

      // This is the first matched angle or a new direction. Track its values for future comparison.
      } else {
        // Track the current approved angle and when we started going on it.
        this._sc_lastAngle = approvedAngle;
        this._sc_swipeStartedAt = Date.now();

        // Use the current number of touches as the number in the session. Some may get cancelled.
        this._sc_numberOfTouches = touchesInSession.length;
      }

    // No angle or lost the angle.
    } else {
      this._sc_lastAngle = null;
      this._sc_swipeAnchorX = avgTouch.x;
      this._sc_swipeAnchorY = avgTouch.y;
      this._sc_lastDistance = 0;
      this._sc_swipeStartedAt = null;
    }

    return true;
  },

  /**
    Cleans up all touch session variables.

    @returns {void}
    @see SC.Gesture#touchSessionCancelled
    */
  touchSessionCancelled: function () {
    // Clean up.
    this._sc_cleanUpTouchSession(true);
  },

  /**
    Cleans up all touch session variables and triggers the gesture.

    @returns {void}
    @see SC.Gesture#touchSessionEnded
    */
  touchSessionEnded: function () {
    // Watch out for touches that move far and fast, but then hesitate too long before ending.
    var notTooLongSinceLastMove = (Date.now() - this._sc_swipeLastMovedAt) < 200;

    // If an approved angle remained set, the distance was far enough and it wasn't too long since
    // the last movement, trigger the gesture, 'swipe'.
    if (this._sc_lastAngle !== null &&
      this._sc_lastDistance > this.get('swipeDistance') &&
      notTooLongSinceLastMove) {
      this.trigger(this._sc_lastAngle, this._sc_numberOfTouches);
    }

    // Clean up (will fire tapEnd if _sc_isTapping is true).
    this._sc_cleanUpTouchSession(false);
  },

  touchSessionStarted: function (touch) {
    this._sc_swipeAnchorX = touch.pageX;
    this._sc_swipeAnchorY = touch.pageY;
  }

});
