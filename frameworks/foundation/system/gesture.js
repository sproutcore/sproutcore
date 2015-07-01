// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================


/**
  @class

  An SC.Gesture analyzes SC.Touch objects and determines if they are part
  of a gesture. If they are, SC.Gestures keep the views that own them up-to-date
  as that gesture progresses, informing it when it starts, when some aspect of
  it changes, when it ends, and—for convenience—when it is considered to have
  been "triggered".

  Gestures can call the following methods on their views:

  - [gestureName](args...): called when the gesture has occurred. This is
    useful for event-style gestures, where you aren't interested in when it starts or
    ends, but just that it has occurred. SC.SwipeGesture triggers this after the
    swipe has moved a minimum amount—40px by default.

  - [gestureName]Start(args...): called when the gesture is first recognized.
    For instance, a swipe gesture may be recognized after the finger has moved a
    minimum distance in a horizontal.

  - [gestureName]Changed(args...): called when some property of the gesture
    has changed. For instance, this may be called continuously as the user swipes as
    the swipe's distance changes.

  - [gestureName]Cancelled(args...): called when a gesture, for one reason
    or another, is no longer recognized. For instance, a horizontal swipe gesture
    could cancel if the user moves too far in a vertical direction.

  - [gestureName]End(args...): called when a gesture ends. A swipe would end
    when the user lifts their finger.

  Gesture Lifecycle
  ------------------------
  Gestures start receiving events when their view—usually mixing in SC.Gesturable—tells it
  about activities with "unassigned" touches. "Unassigned" touches are touches that have
  not _yet_ been assigned to a gesture.

  The touch becomes "assigned" when the gesture's touchIsInGesture method returns YES.
  When a touch is assigned to a gesture, the gesture becomes the touch's touch responder;
  this means that it will receive a touchStart event (to which it must return YES), and
  then, all further touch events will be sent _directly_ to the gesture—the gesture's view
  will not receive them at all.

  At any point, the gesture may tell the view that it has started, ended, or changed. In
  addition, the gesture may tell the view it has been "triggered." A gesture is not
  necessarily "triggered" when it starts and ends; for instance, a swipe gesture might
  only be triggered if the swipe moves more than a specified amount. The ability to track
  when the gesture has been triggered allows views to easily handle the gesture as its own
  event, rather than as the individual events that are part of it.

  If, at some point, the gesture must release the touch back (perhaps the gesture had _thought_
  the touch was a part of it, but turned out to be incorrect), the release(touch) method releases
  it back to the view.

  Exclusivity
  ---------------------------------
  The concept described above gives the gestures a way to be either exclusive or inclusive as-needed:
  they can choose to take exclusive control of a touch if they think it is theirs, but if they are
  not sure, they can wait and see.

  Status Object
  ---------------------------------
  It is a common need to track some data related to the touch, but without modifying the touch itself.
  SC.Gesture is able to keep track of simple hashes for you, mapping them to the SC.Touch object,
  so that you can maintain some state related to the touch.

  For instance, you could set status.failed in touchesDragged, if a touch that you previously
  thought may have been part of the gesture turned out not to be, and then check for
  status.failed in touchIsInGesture, returning NO if present. This would cause the touch
  to never be considered for your gesture again.

  touchIsInGesture is called with the status hash provided in the second argument. You may look
  up the status hash for a touch at any time by calling this.statusForTouch(touch).


  Implementing a Gesture
  ---------------------------------
  To write a gesture, you would generally implement the following methods:

  - touchIsInGesture: Return YES when the touch is—or is likely enough to be that you
    want your gesture to have exclusive control over the touch. You usually do not
    perform much gesture logic here—instead, you save it for touchStart, which will
    get called after you return YES from this method.

  - touchStart: Return YES to accept control of the touch. If you do not return YES,
    your gesture will not receive touchesDragged nor touchEnd events. At this point,
    you may (or may not) wish to tell the view that the gesture has started by using the
    start(args...) method.

  - touchesDragged: Use this as you would use it in an SC.View to track the touches
    assigned to the gesture. At this point, you might want to tell the view that the
    gesture has updated by using the change(args...) method.

  - touchEnd: Again, use this like you would in an SC.View to track when touches
    assigned to the gesture have ended. This is also a potential time to alert the view
    that the gesture has ended, by using the end(args...) method. Further, this may
    also be the time to "trigger" the gesture.

*/
SC.Gesture = SC.Object.extend({

  /** @private Tracks when the gesture is active or not. */
  _sc_isActive: false,

  /**
    Whether to receive touch events for each distinct touch (rather than only the first touch start
    and last touch end).

    @type Boolean
    @default false
    @see SC.View#acceptsMultitouch
  */
  acceptsMultitouch: false,

  /**
    The gesture's name. When calling events on the owning SC.View, this name will
    be prefixed to the methods. For instance, if the method to be called is
    'Start', and the gesture's name is 'swipe', SC.Gesture will call 'swipeStart'.

    @type String
    @default "gesture"
  */
  name: "gesture",

  /**
    Return YES to take exclusive control over the touch. In addition to the
    SC.Touch object you may take control of, you are also provided a "status"
    hash, which is unique for both the gesture instance and the touch instance,
    which you may use for your own purposes.

    @param {SC.Touch} touch The touch.
    @param {Object} status A unique status hash for the given touch.
    @returns {Boolean} true if the gesture should claim the touch; false to leave it unclaimed.
  */
  touchIsInGesture: function(touch, status) {
    return NO;
  },

  /**
    After you return YES from touchIsInGesture (or otherwise 'take' a touch, perhaps
    using the 'take' method), touchStart will be called.

    This is where you do any logic needed now that the touch is part of the gesture.
    For instance, you could inform the view that the gesture has started by calling
    this.start().

    NOTE: SC.Gesture is just like SC.View in that it has an acceptsMultitouch property.
    If NO (the default), the gesture will only receive touchStart for the first touch
    assigned to it, and only receive touchEnd for the last touch that ends.

    @param {SC.Touch} touch The touch that started.
    @returns {Boolean} true if the gesture should respond to the touch; false otherwise (this should always return true)
    @see SC.ResponderProtocol#touchStart
  */
  touchStart: function(touch) {
    return true;
  },

  /**
    Called when a touch assigned to the gesture ends.

    If there are no remaining touches on the gesture, you may want to call end() to
    notify the view that the gesture has ended (if you haven't ended the gesture
    already).

    NOTE: SC.Gesture is just like SC.View in that it has an acceptsMultitouch property.
    If NO (the default), the gesture will only receive touchStart for the first touch
    assigned to it, and only receive touchEnd for the last touch that ends.

    @name touchEnd
    @function
    @param {SC.Touch} touch The touch that ended.
  */

  /**
    Starts the gesture (marking it as "active"), and notifies the view.

    You can pass any number of arguments to start. They will, along with
    the gesture instance itself, will be passed to the appropriate gesture
    event on the SC.View.
  */
  start: function() {
    if (!this._sc_isActive) {
      this._sc_isActive = true;

      // var argumentsLength = arguments.length,
      //     args = new Array(argumentsLength + 1);

      // // Unshift this to the front of arguments.
      // args[0] = this;
      // for (var i = 0, len = argumentsLength; i < len; i++) { args[i + 1] = arguments[i]; }

      // var act = this.name + "Start";
      // if (this.view[act]) this.view[act].apply(this.view, args);

      // Fast arguments access. Don't materialize the `arguments` object, it is costly.
      var argumentsLength = arguments.length,
          args = new Array(argumentsLength);

      for (var i = 0, len = argumentsLength; i < len; i++) { args[i] = arguments[i]; }

      var act = this.name + "Start";
      if (this.view[act]) this.view[act].apply(this.view, args);
    }
  },

  /**
    Ends the gesture, if it is active (marking it as not active), and notifies
    the view.

    You may pass any number of arguments to end(). They, along with your gesture
    instance itself, will be passed to the appropriate gesture event on the SC.View.
  */
  end: function() {
    if (this._sc_isActive) {
      this._sc_isActive = false;

      // var argumentsLength = arguments.length,
      //     args = new Array(argumentsLength + 1);

      // // Unshift this to the front of arguments.
      // args[0] = this;
      // for (var i = 0, len = argumentsLength; i < len; i++) { args[i + 1] = arguments[i]; }

      // var act = this.name + "End";
      // if (this.view[act]) this.view[act].apply(this.view, args);

      // Fast arguments access. Don't materialize the `arguments` object, it is costly.
      var argumentsLength = arguments.length,
          args = new Array(argumentsLength);

      for (var i = 0, len = argumentsLength; i < len; i++) { args[i] = arguments[i]; }

      var act = this.name + "End";
      if (this.view[act]) this.view[act].apply(this.view, args);
    }
  },

  /**
    If the gesture is active, notifies the view that the gesture has
    changed.

    The gesture, along with any arguments to change(), will be passed to
    the appropriate method on the SC.View.
  */
  change: function() {
    if (this._sc_isActive) {
      // var argumentsLength = arguments.length,
      //     args = new Array(argumentsLength + 1);

      // // Unshift this to the front of arguments.
      // args[0] = this;
      // for (var i = 0, len = argumentsLength; i < len; i++) { args[i + 1] = arguments[i]; }

      // var act = this.name + "Changed";
      // if (this.view[act]) this.view[act].apply(this.view, args);

      // Fast arguments access. Don't materialize the `arguments` object, it is costly.
      var argumentsLength = arguments.length,
          args = new Array(argumentsLength);

      for (var i = 0, len = argumentsLength; i < len; i++) { args[i] = arguments[i]; }

      var act = this.name + "Changed";
      if (this.view[act]) this.view[act].apply(this.view, args);
    }
  },

  /**
    Cancels the gesture, if it is active, and notifies the view that the
    gesture has been cancelled.

    Gestures are cancelled when they have ended, but any action that would
    normally be appropriate due to their ending should not be performed.

    The gesture, along with any arguments to cancel(), will be passed to the
    appropriate method on the SC.View.
  */
  cancel: function(){
    if (this._sc_isActive) {
      this._sc_isActive = false;

      // var argumentsLength = arguments.length,
      //     args = new Array(argumentsLength + 1);

      // // Unshift this to the front of arguments.
      // args[0] = this;
      // for (var i = 0, len = argumentsLength; i < len; i++) { args[i + 1] = arguments[i]; }

      // var act = this.name + "Cancelled";
      // if (this.view[act]) this.view[act].apply(this.view, args);

      // Fast arguments access. Don't materialize the `arguments` object, it is costly.
      var argumentsLength = arguments.length,
          args = new Array(argumentsLength);

      for (var i = 0, len = argumentsLength; i < len; i++) { args[i] = arguments[i]; }

      var act = this.name + "Cancelled";
      if (this.view[act]) this.view[act].apply(this.view, args);
    }
  },

  /**
    Triggers the gesture, notifying the view that the gesture has happened.

    You should trigger a gesture where it would be natural to say it has "happened";
    for instance, if a touch moves a couple of pixels, you probably wouldn't say
    a swipe has occurred—though you might say it has "begun." And you wouldn't necessarily
    wait until the touch has ended either. Once the touch has moved a certain amount,
    there has definitely been a swipe. By calling trigger() at this point, you will
    tell the view that it has occurred.

    For SC.SwipeGesture, this allows a view to implement only swipe(), and then be
    automatically notified whenever any swipe has occurred.
  */
  trigger: function() {
    // Fast arguments access. Don't materialize the `arguments` object, it is costly.
    var argumentsLength = arguments.length,
        // args = new Array(argumentsLength + 1);
        args = new Array(argumentsLength);

    // // Unshift this to the front of arguments.
    // args[0] = this;
    // for (var i = 0, len = argumentsLength; i < len; i++) { args[i + 1] = arguments[i]; }

    for (var i = 0, len = argumentsLength; i < len; i++) { args[i] = arguments[i]; }

    var act = this.name;
    if (this.view[act]) this.view[act].apply(this.view, args);
  },

  /**
    Takes possession of a touch.

    This is called automatically when you return YES from touchIsInGesture.
  */
  // take: function(touch) {
  //   if (!touch.isTaken) {
  //     touch.isTaken = YES; // because even changing responder won't prevent it from being used this cycle.
  //     if (SC.none(touch.touchResponder) || touch.touchResponder !== this) touch.makeTouchResponder(this, YES);
  //   }
  //   //@if(debug)
  //   else {
  //     SC.warn("Developer Warning: A gesture tried to take a touch that was already taken: %@".fmt(this));
  //   }
  //   //@endif
  // },

  /**
    Releases a touch back to its previous owner, which is usually the view. This allows
    you to give back control of a touch that it turns out is not part of the gesture.

    This takes effect immediately, because you would usually call this from
    touchesDragged or such.
  */
  // release: function(touch) {
  //   if (touch.isTaken) {
  //     touch.isTaken = NO;
  //     if (touch.nextTouchResponder) touch.makeTouchResponder(touch.nextTouchResponder);
  //   }
  //   //@if(debug)
  //   else {
  //     SC.warn("Developer Warning: A gesture tried to release a touch that was not taken: %@".fmt(this));
  //   }
  //   //@endif
  // },

  /**
    Discards a touch, making its responder null. This makes the touch go away and never
    come back—not to this gesture, nor to any other, nor to the view, nor to any other
    view.
  */
  // discardTouch: function(touch) {
  //   touch.isTaken = YES; // because even changing responder won't prevent it from being used this cycle.
  //   touch.makeTouchResponder(null);
  // },

  /**
    Called by the view when a touch session has begun.

    You should override this method in your custom SC.Gesturable subclasses to set up any touch
    session state. For example, you may want to track the initial touch start time in order to
    decide how to react when or if additional touches start later.

    @param {SC.Touch} touch The touch that started the session.
    @returns {void}
    */
  touchSessionStarted: function (touch) {
  },

  /**
    Called by the view when the touch session has ended.

    This will occur because all touches in the session have finished.

    You should override this method in your custom SC.Gesturable subclasses to clean up any state
    variables used in the touch session.

    @returns {void}
   */
  touchSessionEnded: function () {
  },

  /**
    Called by the view when the touch session was cancelled.

    This will occur because this gesture returned `false` in any of `touchAddedToSession`,
    `touchesMovedInSession`, `touchEndedInSession`, `touchCancelledInSession` to indicate that the
    gesture is no longer interested in the session or because another gesture claimed the touch
    session for itself, forcing all other gestures out (rare).

    You should override this method in your custom SC.Gesturable subclasses to clean up any state
    variables used in the touch session.

    @returns {void}
   */
  touchSessionCancelled: function () {
  },

  /**
    @param {SC.Touch} touch The touch to be added to the session.
    @param {Array} touchesInSession The touches already in the session.
    @returns {Boolean} True if the gesture is still interested in the touch session; false to stop getting notified for any further touch changes in the touch session.
    */
  touchAddedToSession: function (touch, touchesInSession) {
    return true; // Most gestures should theoretically be interested in a new touch session.
  },

  /**
    @param {SC.Touch} touch The touch to be removed from the session.
    @param {Array} touchesInSession The touches still remaining in the session.
    @returns {Boolean} True if the gesture is still interested in the touch session; false to stop getting notified for any further touch changes in the touch session.
    */
  touchCancelledInSession: function (touch, touchesInSession) {
    return true;
  },

  /**
    @param {SC.Touch} touch The touch to be removed from the session.
    @param {Array} touchesInSession The touches still remaining in the session.
    @returns {Boolean} True if the gesture is still interested in the touch session; false to stop getting notified for any further touch changes in the touch session.
    */
  touchEndedInSession: function (touch, touchesInSession) {
    return true;
  },

  /**
    @param {Array} touchesInSession The touches in the session.
    @returns {Boolean} True if the gesture is still interested in the touch session; false to stop getting notified for any further touch changes in the touch session.
    */
  touchesMovedInSession: function (touchesInSession) {
    return true;
  }

});
