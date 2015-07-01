// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2010 Strobe Inc. All rights reserved.
// Author:    Peter Wagenet
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require("system/gesture");

/**
  ## What is a "tap"?

  A tap is a touch that starts and ends in a short amount of time without moving along either axis.
  A tap may consist of more than one touch, provided that the touches start and end together. The time
  allowed for touches to start and end together is defined by `touchUnityDelay`.
  Again, to be considered a tap, there should be very little movement of any touches on either axis
  while still touching. The amount of movement allowed is defined by `tapWiggle`.

  @class
  @extends SC.Gesture
*/
SC.TapGesture = SC.Gesture.extend(
/** @scope SC.TapGesture.prototype */{

  /** @private The time that the first touch started at. */
  _sc_firstTouchAddedAt: null,

  /** @private The time that the first touch ended at. */
  _sc_firstTouchEndedAt: null,

  /** @private A flag used to track when the touch was long enough to register tapStart (and tapEnd). */
  _sc_isTapping: false,

  /** @private The number of touches in the current tap. */
  _sc_numberOfTouches: 0,

  /** @private A timer started after the first touch starts. */
  _sc_tapStartTimer: null,

  /**
    @type String
    @default "tap"
    @readOnly
  */
  name: "tap",

  /**
    The amount of time in milliseconds between when the first touch starts and the last touch ends
    that should be considered a short enough time to constitute a tap.

    @type Number
    @default 250
  */
  tapLengthDelay: 250,

  /**
    The amount of time in milliseconds after the first touch starts at which, *if the tap hasn't
    ended in that time*, the `tapStart` event should trigger.

    Because taps may be very short or because movement of the touch may invalidate a tap gesture
    entirely, you generally won't want to update the state of the view immediately when a touch
    starts.

    @type Number
    @default 150
    */
  tapStartDelay: 150,

  /**
    The number of pixels that a touch may move before it will no longer be considered a tap. If any
    of the touches move more than this amount, the gesture will give up.

    @type Number
    @default 10
  */
  tapWiggle: 10,

  /**
    The number of milliseconds that touches must start and end together in in order to be considered a
    tap. If the touches start too far apart in time or end too far apart in time based on this
    value, the gesture will give up.

    @type Number
    @default 75
  */
  touchUnityDelay: 75,

  /** @private Calculates the distance a touch has moved. */
  _sc_calculateDragDistance: function (touch) {
    return Math.sqrt(Math.pow(touch.pageX - touch.startX, 2) + Math.pow(touch.pageY - touch.startY, 2));
  },

  /** @private Cleans up the touch session. */
  _sc_cleanUpTouchSession: function (wasCancelled) {
    if (this._sc_isTapping) {
      // Trigger the gesture, 'tapCancelled'.
      if (wasCancelled) {
        this.cancel();

      // Trigger the gesture, 'tapEnd'.
      } else {
        this.end();
      }

      this._sc_isTapping = false;
    }

    // Clean up.
    this._sc_tapStartTimer.invalidate();
    this._sc_numberOfTouches = 0;
    this._sc_tapStartTimer = this._sc_firstTouchAddedAt = this._sc_firstTouchEndedAt = null;
  },

  /** @private Triggers the tapStart event. Should *not* be reachable unless the tap is still valid. */
  _sc_triggerTapStart: function () {
      // Trigger the gesture, 'tapStart'.
    this.start();

    this._sc_isTapping = true;
  },

  /**
    The tap gesture only remains interested in a touch session as long as none of the touches have
    started too long after the first touch (value of `touchUnityDelay`). Once any touch has started
    too late, the tap gesture gives up for the entire touch session and won't attempt to re-engage
    (i.e. even if an extra touch "taps" cleanly in the same touch session, it won't trigger any
    further tap callbacks).

    @param {SC.Touch} touch The touch to be added to the session.
    @param {Array} touchesInSession The touches already in the session.
    @returns {Boolean} True as long as the new touch doesn't start too late after the first touch.
    @see SC.Gesture#touchAddedToSession
    */
  touchAddedToSession: function (touch, touchesInSession) {
    var stillInterestedInSession,
        delay;

    // If the new touch came in too late after the first touch was added.
    delay = Date.now() - this._sc_firstTouchAddedAt;
    stillInterestedInSession = delay < this.get('touchUnityDelay');

    return stillInterestedInSession;
  },

  /**
    If a touch cancels, the tap doesn't care and remains interested.

    @param {SC.Touch} touch The touch to be removed from the session.
    @param {Array} touchesInSession The touches in the session.
    @returns {Boolean} True
    @see SC.Gesture#touchCancelledInSession
    */
  touchCancelledInSession: function (touch, touchesInSession) {
    return true;
  },

  /**
    The tap gesture only remains interested in a touch session as long as none of the touches have
    ended too long after the first touch ends (value of `touchUnityDelay`). Once any touch has ended
    too late, the tap gesture gives up for the entire touch session and won't attempt to re-engage
    (i.e. even if an extra touch "taps" cleanly in the same touch session, it won't trigger any
    further tap callbacks).

    @param {SC.Touch} touch The touch to be removed from the session.
    @param {Array} touchesInSession The touches in the session.
    @returns {Boolean} True if it is the first touch to end or a subsequent touch that ends not too long after the first touch ended.
    @see SC.Gesture#touchEndedInSession
  */
  touchEndedInSession: function (touch, touchesInSession) {
    var stillInterestedInSession;

    // Increment the number of touches in the tap.
    this._sc_numberOfTouches += 1;

    // If it's the first touch to end, remain interested unless tapLengthDelay has passed.
    if (this._sc_firstTouchEndedAt === null) {
      this._sc_firstTouchEndedAt = Date.now();
      stillInterestedInSession = this._sc_firstTouchEndedAt - this._sc_firstTouchAddedAt < this.get('tapLengthDelay');

    // If the touch ended too late after the first touch ended, give up entirely.
    } else {
      stillInterestedInSession = Date.now() - this._sc_firstTouchEndedAt < this.get('touchUnityDelay');
    }

    return stillInterestedInSession;
  },

  /**
    The tap gesture only remains interested in a touch session as long as none of the touches have
    moved too far (value of `tapWiggle`). Once any touch has moved too far, the tap gesture gives
    up for the entire touch session and won't attempt to re-engage (i.e. even if an extra touch
    "taps" cleanly in the same touch session, it won't trigger any further tap callbacks).

    @param {Array} touchesInSession All touches in the session.
    @returns {Boolean} True as long as none of the touches have moved too far to be a clean tap.
    @see SC.Gesture#touchesMovedInSession
    */
  touchesMovedInSession: function (touchesInSession) {
    var stillInterestedInSession = true;

    for (var i = 0, len = touchesInSession.length; i < len; i++) {
      var touch = touchesInSession[i],
          movedTooFar = this._sc_calculateDragDistance(touch) > this.get('tapWiggle');

      // If any touch has gone too far, we don't want to consider any further tap actions for this
      // session. No need to continue.
      if (movedTooFar) {
        stillInterestedInSession = false;
        break;
      }
    }

    return stillInterestedInSession;
  },

  /**
    Cleans up all touch session variables.

    @returns {void}
    @see SC.Gesture#touchSessionCancelled
    */
  touchSessionCancelled: function () {
    // Clean up (will fire tapCancelled if _sc_isTapping is true).
    this._sc_cleanUpTouchSession(true);
  },

  /**
    Cleans up all touch session variables and triggers the gesture.

    @returns {void}
    @see SC.Gesture#touchSessionEnded
    */
  touchSessionEnded: function () {
    // Trigger the gesture, 'tap'.
    this.trigger(this._sc_numberOfTouches);

    // Clean up (will fire tapEnd if _sc_isTapping is true).
    this._sc_cleanUpTouchSession(false);
  },

  /**
    Registers when the first touch started.

    @param {SC.Touch} touch The touch that started the session.
    @returns {void}
    @see SC.Gesture#touchSessionStarted
    */
  touchSessionStarted: function (touch) {
    // Initialize.
    this._sc_firstTouchAddedAt = Date.now();

    this._sc_tapStartTimer = SC.Timer.schedule({
      target: this,
      action: this._sc_triggerTapStart,
      interval: this.get('tapStartDelay')
    });
  }

});
