// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @namespace

  You can mix in SC.Gesturable to your views to add some support for recognizing gestures.

  SproutCore views have built-in touch events. However, sometimes you may want
  to recognize gestures like tap, pinch, swipe, etc. This becomes tedious if you
  need to do this often, and more so if you need to check for multiple possible
  gestures on the same view.

  SC.Gesturable allows you to define a collection of gestures (SC.Gesture objects)
  that your view should recognize. When a gesture is recognized, methods will be
  called on the view:

    - [gestureName](gesture, args...): called when the gesture has occurred. This is
      useful for event-style gestures, where you aren't interested in when it starts or
      ends, but just that it has occurred. SC.SwipeGesture triggers this after the
      swipe has moved a minimum amount—40px by default.
    - [gestureName]Start(gesture, args...): called when the gesture is first recognized.
      For instance, a swipe gesture may be recognized after the finger has moved a
      minimum distance in a horizontal.
    - [gestureName]Changed(gesture, args...): called when some property of the gesture
      has changed. For instance, this may be called continuously as the user swipes as
      the swipe's distance changes.
    - [gestureName]Cancelled(gesture, args...): called when a gesture, for one reason
      or another, is no longer recognized. For instance, a horizontal swipe gesture
      could cancel if the user moves too far in a vertical direction.
    - [gestureName]End(gesture, args...): called when a gesture ends. A swipe would end
      when the user lifts their finger.

  Each of these methods is passed the gesture instance, in addition to any arguments
  the gesture sends for your convenience. The default swipe gesture sends an SC.Touch
  instance, the swipe direction, and the distance the swipe has moved in that direction.

  Using SC.Gesturable
  -------------------

  To make your view recognize gestures, mix in Gesturable and add items to the 'gestures'
  property:

      SC.View.extend(SC.Gesturable, {
        gestures: [SC.PinchGesture, 'mySwipeGesture'],

        // specifying as a string allows you to configure it:
        mySwipeGesture: SC.SwipeGesture.extend({
          direction: SC.SWIPE_VERTICAL,
          startDistance: 3,
          swipeDistance: 20
        }),

        // handle the swipe action
        swipe: function(touch, direction) {
          console.error("Swiped! In direction: " + direction);
        },

        swipeStart: function(touch, direction, delta) {
          console.error("Swipe started in direction: " + direction + "; dist: " + delta);
        },

        swipeChanged: function(touch, direction, delta) {
          console.error("Swipe continued in direction: " + direction + "; dist: " + delta);
        },

        swipeEnd: function(touch, direction, delta) {
          console.error("Completed swipe in direction: " + direction + "; dist: " + delta);
        }

      })

  @extends SC.ObjectMixinProtocol
  @extends SC.ResponderProtocol
*/
SC.Gesturable = {

  /** @private An array of all gestures currently interested in the touch session.

    @type Array
    @default null
  */
  _sc_interestedGestures: null,

  /** @private An array of the touches that are currently active in a touch session.

    @type Array
    @default null
  */
  _sc_touchesInSession: null,

  /**
    Gestures need to understand multiple touches.

    @type Boolean
    @default true
    @see SC.View#acceptsMultitouch
  */
  acceptsMultitouch: true,

  /**
    @type Array
    @default ['gestures']
    @see SC.Object#concatenatedProperties
  */
  concatenatedProperties: ['gestures'],

  /**
    The gestures that the view will support. This property must be set on the consumer of
    `SC.Gesturable` before it is initialized.

    These gestures should be objects that extend the `SC.Gesture` class. You can use SproutCore's
    pre-built gestures or create your own. If you create your own, you can use a property name
    in the list of gestures to refer to the actual gesture class, similar to how the childViews
    array works. For example,

        gestures: [SC.PinchGesture, 'mySwipeGesture'],

        // Specifying the Gesture by property name allows you to configure it.
        mySwipeGesture: SC.SwipeGesture.extend({
          direction: SC.SWIPE_VERTICAL,
          startDistance: 3,
          swipeDistance: 20
        }),

    Note that `gestures` is a *concatenated property*, which means that it will not be overwritten
    by subclasses. So for example, if the base class lists gestures as `[SC.PinchGesture]` and its
    subclass lists gestures as `[SC.TapGesture]`, the actual gestures supported by the subclass will
    be `[SC.PinchGesture, SC.TapGesture]`.

    @type Array
    @default null
  */
  gestures: null,

  /** @private Shared method for finishing a touch.

    @param {SC.Touch} touch The touch that ended or cancelled.
    @param {Boolean} wasCancelled Whether the touch was cancelled or not (i.e. ended normally).
  */
  _sc_gestureTouchFinish: function (touch, wasCancelled) {
    var touchesInSession = this._sc_touchesInSession,
        touchIndexInSession = touchesInSession.indexOf(touch);

    // Decrement our list of touches that are being acted upon.
    touchesInSession.replace(touchIndexInSession, 1);

    var gestures = this._sc_interestedGestures,
        idx,
        gesture;

    // Loop through the gestures in reverse, as the list may be mutated.
    for (idx = gestures.length - 1; idx >= 0; idx--) {
      var isInterested;

      gesture = gestures[idx];

      if (wasCancelled) {
        isInterested = gesture.touchCancelledInSession(touch, touchesInSession);
      } else {
        isInterested = gesture.touchEndedInSession(touch, touchesInSession);
      }

      // If the gesture is no longer interested in *any* touches for this session, remove it.
      if (!isInterested) {
        // Tell the gesture that the touch session has ended for it.
        gesture.touchSessionCancelled();

        gestures.replace(idx, 1);
      }
    }

    // Once there are no more touches in the session, reset the interested gestures.
    if (touchesInSession.length === 0) {
      // Notify all remaining interested gestures that the touch session has finished cleanly.
      var len;

      for (idx = 0, len = gestures.length; idx < len; idx++) {
        gesture = gestures[idx];

        gesture.touchSessionEnded();
      }

      // Clear out the current cache of interested gestures for the session.
      this._sc_interestedGestures.length = 0;
    }
  },

  /**
    When SC.Gesturable initializes, any gestures named on the view are instantiated.

    @see SC.ObjectMixinProtocol#initMixin
  */
  initMixin: function() {
    //@if(debug)
    if (SC.none(this.gestures)) {
      SC.error("Developer Error: When mixing in SC.Gesturable, you must define a list of gestures to use.");
    }
    //@endif
    this.createGestures();
  },

  /** @private  Instantiates the gestures. */
  createGestures: function() {
    var gestures = this.get("gestures"),
        len = gestures.length,
        instantiatedGestures = [],
        idx;

    // loop through all gestures
    for (idx = 0; idx < len; idx++) {
      var gesture;

      // get the proper gesture
      if (SC.typeOf(gestures[idx]) === SC.T_STRING) {
        gesture = this.get(gestures[idx]);
      } else {
        gesture = gestures[idx];
      }

      // if it was not found, well, that's an error.
      if (!gesture) {
        throw new Error("Developer Error: Could not find gesture named '" + gestures[idx] + "' on view.");
      }

      // if it is a class, instantiate (it really ought to be a class...)
      if (gesture.isClass) {
        gesture = gesture.create({
          view: this
        });
      }

      // and set the gesture instance and add it to the array.
      if (SC.typeOf(gestures[idx]) === SC.T_STRING) this[gestures[idx]] = gesture;
      instantiatedGestures.push(gesture);
    }

    this.set("gestures", instantiatedGestures);
  },

  /**
    Handles touch start by handing it to the gesture recognizing code.

    If you override touchStart, you will need to call gestureTouchStart to
    give the gesture system control of the touch. You will continue to get
    events until if and when a gesture decides to take "possession" of a touch—
    at this point, you will get a [gestureName]Start event.

    You do not have to call gestureTouchStart immediately; you can call it
    at any time. This allows you to avoid passing control until _after_ you
    have determined your own touchStart, touchesDragged, and touchEnd methods
    are not going to handle it.

    @param {SC.Touch} touch The touch that started.
    @returns {Boolean} Whether the touch should be claimed by the view or not.
    @see SC.ResponderProtocol#touchStart
  */
  touchStart: function(touch) {
    return this.gestureTouchStart(touch);
  },

  /**
    Tells the gesture recognizing code about touches moving.

    If you override touchesDragged, you will need to call gestureTouchesDragged
    (at least for any touches you called gestureTouchStart for in touchStart) to
    allow the gesture system to update.

    @see SC.ResponderProtocol#touchesDragged
  */
  touchesDragged: function(evt, touches) {
    this.gestureTouchesDragged(evt, touches);
  },

  /**
    Tells the gesture recognizing code about a touch ending.

    If you override touchEnd, you will need to call gestureTouchEnd
    for any touches you called gestureTouchStart for in touchStart (if overridden).

    @param {SC.Touch} touch The touch that ended.
    @see SC.ResponderProtocol#touchEnd
  */
  touchEnd: function(touch) {
    this.gestureTouchEnd(touch);
  },

  /**
    Tells the gesture recognizing code about a touch cancelling.

    If you override touchCancelled, you will need to call gestureTouchCancelled
    for any touches you called gestureTouchStart for in touchStart (if overridden).

    @param {SC.Touch} touch The touch that cancelled.
    @see SC.ResponderProtocol#touchCancelled
  */
  touchCancelled: function (touch) {
    this.gestureTouchCancelled(touch);
  },

  /**
    Called by a gesture that has lost interest in the entire touch session, likely due to too much
    time having passed since `gestureTouchStart` or `gestureTouchesDragged` having been called.

    Simply removes the gesture from the list of interested gestures and calls
    `touchSessionCancelled` on the gesture.
  */
  gestureLostInterest: function (gesture) {
    var gestures = this._sc_interestedGestures,
        gestureIndex = gestures.indexOf(gesture);

    // Remove the gesture.
    if (gestureIndex >= 0) {
      gesture.touchSessionCancelled();

      gestures.replace(gestureIndex, 1);
    }
  },

  /**
    Tells the gesture recognizing system about a new touch. This notifies all gestures of a new
    touch session starting (if there were no previous touches) or notifies all interested gestures
    that a touch has been added.

    As touches are added beyond the first touch, gestures may "lose interest" in the touch session.
    For example, a gesture may explicitly want only a single touch and if a second touch appears,
    the gesture may not want any further updates on this touch session (even if the second touch
    ends again).

    @param {SC.Touch} touch The touch that started.
    @returns {Boolean} Whether any gesture is interested in the touch or not.
  */
  gestureTouchStart: function (touch) {
    var interestedGestures = this._sc_interestedGestures,
        touchesInSession = this._sc_touchesInSession,
        claimedTouch = false,
        idx;

    // Instantiate once.
    if (touchesInSession === null) {
      touchesInSession = this._sc_touchesInSession = [];
      interestedGestures = this._sc_interestedGestures = [];
    }

    // When there are no touches in the session, check all gestures.
    if (touchesInSession.length === 0) {
      var gestures = this.get("gestures"),
          len;

      for (idx = 0, len = gestures.length; idx < len; idx++) {
        var gesture = gestures[idx];

        gesture.touchSessionStarted(touch);
        interestedGestures.push(gesture);
      }

      // Keep this touch.
      claimedTouch = true;

    // Only check gestures that are interested.
    } else {
      // Loop through the gestures in reverse, as the list may be mutated.
      for (idx = interestedGestures.length - 1; idx >= 0; idx--) {
        var interestedGesture = interestedGestures[idx],
            isInterested;

        // Keep only the gestures still interested in the touch.
        isInterested = interestedGesture.touchAddedToSession(touch, touchesInSession);

        if (isInterested) {
          // Keep this touch.
          claimedTouch = true;
        } else {
          // Tell the gesture that the touch session has ended for it.
          interestedGesture.touchSessionCancelled();

          interestedGestures.replace(idx, 1);
        }
      }
    }

    // If any gesture is interested in the new touch. Add it to the list of touches in the session.
    if (claimedTouch) {
      touchesInSession.push(touch);
    }

    return claimedTouch;
  },

  /**
    Tells the gesture recognition system that touches have moved.

    @param {SC.Event} evt The touch event.
    @param {Array} touches The touches previously claimed by this view.
    @returns {void}
  */
  gestureTouchesDragged: function (evt, touches) {
    var gestures = this._sc_interestedGestures,
        touchesInSession = this._sc_touchesInSession;

    // Loop through the gestures in reverse, as the list may be mutated.
    for (var i = gestures.length - 1; i >= 0; i--) {
      var gesture = gestures[i],
          isInterested = gesture.touchesMovedInSession(touchesInSession);

      // If the gesture is no longer interested in *any* touches for this session, remove it.
      if (!isInterested) {
        // Tell the gesture that the touch session has ended for it.
        gesture.touchSessionCancelled();

        gestures.replace(i, 1);

        // TODO: When there are no more interested gestures? Do what with the touches? Anything?
      }
    }
  },

  /**
    Tells the gesture recognition system that an unassigned touch has ended.

    This informs all of the gestures that the touch ended. The touch is
    an unassigned touch as, if it were assigned to a gesture, it would have
    been sent directly to the gesture, bypassing this view.
  */
  gestureTouchEnd: function(touch) {
    this._sc_gestureTouchFinish(touch, false);
  },

  /**
    Tells the gesture recognition system that an unassigned touch has cancelled.

    This informs all of the gestures that the touch cancelled. The touch is
    an unassigned touch as, if it were assigned to a gesture, it would have
    been sent directly to the gesture, bypassing this view.
  */
  gestureTouchCancelled: function(touch) {
    this._sc_gestureTouchFinish(touch, true);
  }
};
