// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require("system/gesture");

/*
  TODO Document this class
*/

/**
  @class
  @extends SC.Gesture
*/
SC.PinchGesture = SC.Gesture.extend(
/** @scope SC.PinchGesture.prototype */{

  /** @private Whether we have started pinching or not.

    @type Boolean
    @default false
  */
  _sc_isPinching: false,

  /** @private The previous distance between touches.

    @type Number
    @default null
  */
  _sc_pinchAnchorD: null,

  /** @private The initial scale of the view before pinching.

    @type Number
    @default null
  */
  _sc_pinchAnchorScale: null,

  /**
    @type String
    @default "pinch"
  */
  name: "pinch",

  /**
    The amount of time in milliseconds that touches should stop moving before a `pinchEnd` event
    will fire. When a pinch gesture begins, the `pinchStart` event is fired and as long as the
    touches continue to change distance, multiple `pinch` events will fire. If the touches remain
    active but don't change distance any longer, then after `pinchDelay` milliseconds the `pinchEnd`
    event will fire.

    @type Number
    @default 500
    */
  pinchDelay: 500,

  /**
    The number of pixels that multiple touches need to expand or contract in order to trigger the
    beginning of a pinch.

    @type Number
    @default 3
    */
  // pinchStartThreshold: 3,

  /** @private Cleans up the touch session. */
  _sc_cleanUpTouchSession: function () {
    // If we were pinching before, end the pinch immediately.
    if (this._sc_isPinching) {
      this._sc_pinchingTimer.invalidate();
      this._sc_pinchingTimer = null;
      this._sc_lastPinchTime = null;
      this._sc_isPinching = false;

      // Trigger the gesture, 'pinchEnd'.
      this.end();
    }

    // Clean up.
    this._sc_pinchAnchorD = null;
  },

  /** @private Shared function for when a touch ends or cancels. */
  _sc_touchFinishedInSession: function (touch, touchesInSession) {
    // If there are more than two touches, keep monitoring for pinches by updating _sc_pinchAnchorD.
    if (touchesInSession.length > 1) {
      // Get the averaged touches for the the view. Because pinch is always interested in every touch
      // the touchesInSession will equal the touches for the view.
      var avgTouch = touch.averagedTouchesForView(this.view);

      this._sc_pinchAnchorD = avgTouch.d;

    // Disregard incoming touches by clearing out _sc_pinchAnchorD and end an active pinch immediately.
    } else {
      this._sc_cleanUpTouchSession();
    }
  },

  /** @private Triggers pinchEnd and resets _sc_isPinching if enough time has passed. */
  _sc_triggerPinchEnd: function () {
    // If a pinch came in since the time the timer was registered, set up a new timer for the
    // remaining time.
    if (this._sc_lastPinchTime) {
      var timePassed = Date.now() - this._sc_lastPinchTime,
          pinchDelay = this.get('pinchDelay');

      // Prepare to send 'pinchEnd' again.
      this._sc_pinchingTimer = SC.Timer.schedule({
        target: this,
        action: this._sc_triggerPinchEnd,
        interval: pinchDelay - timePassed // Trigger the timer the amount of time left since the last pinch
      });

      // Clear out the last pinch time.
      this._sc_lastPinchTime = null;

    // No additional pinches appeared in the amount of time.
    } else {
      // Trigger the gesture, 'pinchEnd'.
      this.end();

      // Clear out the pinching session.
      this._sc_isPinching = false;
      this._sc_pinchingTimer = null;
    }
  },

  /**
    The pinch gesture is always interested in the touch session. When a new touch is added, the
    distance between all of the touches is registered in order to check for distance changes
    equating to a pinch gesture.

    @param {SC.Touch} touch The touch to be added to the session.
    @param {Array} touchesInSession The touches already in the session.
    @returns {Boolean} True.
    @see SC.Gesture#touchAddedToSession
    */
  touchAddedToSession: function (touch, touchesInSession) {
    // Get the averaged touches for the the view. Because pinch is always interested in every touch
    // the touchesInSession will equal the touches for the view.
    var avgTouch = touch.averagedTouchesForView(this.view, true);

    this._sc_pinchAnchorD = avgTouch.d;

    return true;
  },

  /**
    If a touch cancels, the pinch remains interested (even if there's only one touch left, because a
    second touch may appear again), but updates its internal variable for tracking for pinch
    movements.

    @param {SC.Touch} touch The touch to be removed from the session.
    @param {Array} touchesInSession The touches in the session.
    @returns {Boolean} True
    @see SC.Gesture#touchCancelledInSession
    */
  touchCancelledInSession: function (touch, touchesInSession) {
    this._sc_touchFinishedInSession(touch, touchesInSession);

    return true;
  },

  /**
    If a touch ends, the pinch remains interested (even if there's only one touch left, because a
    second touch may appear again), but updates its internal variable for tracking for pinch
    movements.

    @param {SC.Touch} touch The touch to be removed from the session.
    @param {Array} touchesInSession The touches in the session.
    @returns {Boolean} True
    @see SC.Gesture#touchEndedInSession
    */
  touchEndedInSession: function (touch, touchesInSession) {
    this._sc_touchFinishedInSession(touch, touchesInSession);

    return true;
  },

  /**
    The pinch is only interested in more than one touch moving. If there are multiple touches
    moving and the distance between the touches has changed then a `pinchStart` event will fire.
    If the touches keep expanding or contracting, the `pinch` event will repeatedly fire. Finally,
    if the touch distance stops changing and enough time passes (value of `pinchDelay`), the
    `pinchEnd` event will fire.

    Therefore, it's possible for a pinch gesture to start and end more than once in a single touch
    session. For example, a person may touch two fingers down, expand them to zoom in (`pinchStart`
    and multiple `pinch` events fire) and then if they stop or move their fingers in one direction
    in tandem to scroll content (`pinchEnd` event fires after `pinchDelay` exceeded). If the person
    then starts expanding their fingers again without lifting them, a new set of pinch events will
    fire.

    @param {Array} touchesInSession All touches in the session.
    @returns {Boolean} True.
    @see SC.Gesture#touchesMovedInSession
    */
  touchesMovedInSession: function (touchesInSession) {
    // console.log('touchesMovedInSession: %@'.fmt(touchesInSession.length));
    // We should pay attention to the movement.
    if (touchesInSession.length > 1) {
      // Get the averaged touches for the the view. Because pinch is always interested in every touch
      // the touchesInSession will equal the touches for the view.
      var avgTouch = SC.Touch.averagedTouch(touchesInSession); // touchesInSession[0].averagedTouchesForView(this.view);

      var touchDeltaD = this._sc_pinchAnchorD - avgTouch.d,
          absDeltaD = Math.abs(touchDeltaD);

      // console.log('  this._sc_pinchAnchorD, %@ - avgTouch.d, %@ = touchDeltaD, %@'.fmt(this._sc_pinchAnchorD, avgTouch.d, touchDeltaD));
      if (absDeltaD > 0) {
        // Trigger the gesture, 'pinchStart', once.
        if (!this._sc_isPinching) {
          this.start();

          // Prepare to send 'pinchEnd'.
          this._sc_pinchingTimer = SC.Timer.schedule({
            target: this,
            action: this._sc_triggerPinchEnd,
            interval: this.get('pinchDelay')
          });

          // Track that we are pinching.
          this._sc_isPinching = true;

        // Update the last pinch time so that when the timer expires, it doesn't fire pinchEnd.
        // This is faster than invalidating and creating a new timer each time this method is called.
        } else {
          this._sc_lastPinchTime = Date.now();
        }

        // The percentage difference in touch distance.
        var scalePercentChange = avgTouch.d / this._sc_pinchAnchorD,
            scale = this._sc_pinchAnchorScale * scalePercentChange;

        // Trigger the gesture, 'pinch'.
        this.trigger(scale, touchesInSession.length);

        // Reset the anchor.
        this._sc_pinchAnchorD = avgTouch.d;
        this._sc_pinchAnchorScale = scale;
      }
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
    this._sc_cleanUpTouchSession();
  },

  /**
    Cleans up all touch session variables and triggers the gesture.

    @returns {void}
    @see SC.Gesture#touchSessionEnded
    */
  touchSessionEnded: function () {
    // Clean up.
    this._sc_cleanUpTouchSession();
  },

  /**
    Registers the scale of the view when it starts.

    @param {SC.Touch} touch The touch that started the session.
    @returns {void}
    @see SC.Gesture#touchSessionStarted
    */
  touchSessionStarted: function (touch) {
    var viewLayout = this.view.get('layout');

    /*jshint eqnull:true*/
    this._sc_pinchAnchorScale = viewLayout.scale == null ? 1 : viewLayout.scale;
  }

});
