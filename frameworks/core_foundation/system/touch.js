// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/** @class SC.Touch
  Represents a touch. Single touch objects are passed to `touchStart`, `touchEnd` and `touchCancelled` event handlers;
  a specialized multitouch event object is sent to `touchesDragged`, which include access to all in-flight touches
  (see "The touchesDragged Multitouch Event Object" below).

  SC.Touch exposes a number of properties, including pageX/Y, clientX/Y, screenX/Y, and startX/Y (the values that
  pageX/Y had when the touch began, useful for calculating how far the touch has moved). It also exposes the touch's
  target element at `target`, its target SC.View at `targetView`, and the touch's unique identifier at `identifier`,
  which may be relied upon to identify a particular touch for the duration of its lifecycle.

  A touch object exists for the duration of the touch – literally for as long as your finger is on the screen – and
  is sent to a number of touch events on your views. Touch events are sent to the touch's current responder, set initially
  by checking the responder chain for views which implement `touchStart` (or `captureTouch`, see "Touch Events" below),
  and can be passed to other views as needed (see "Touch Responders" below).

  Touch Events
  -----
  You can use the following methods on your views to capture and handle touch events:

  - `captureTouch` -- Sometimes, a touch responder part way up the chain may need to capture the touch and prevent it
    from being made available to its childViews. The canonical use case for this behavior is SC.ScrollView, which by
    default captures touches and holds onto them for 150ms to see if the user is scrolling, only passing them on to
    children if not. (See SC.ScrollView#delaysContentTouches for more.) In order to support this use case, `captureTouch`
    bubbles the opposite way as usual: beginning with the target's pane and bubbling *down* towards the target itself.
    `captureTouch` is passed a single instance of `SC.Touch`, and must return YES if it wishes to capture the touch and
    become its responder. (If your view doesn't want to immediately capture the touch, but instead wants to suggest itself
    as a fallback handler in case the child view resigns respondership, it can do so by passing itself to the touch's
    `stackCandidateTouchResponder` method.)
  - `touchStart` -- When a touch begins, or when a new view responder is first given access to it (see "Touch Responders"
    below), the touch is passed to this method.
  - `touchesDragged` -- Whenever any touches move, the `touchesDragged` method is called on the current view responder
    for any touches that have changed. The method is provided two arguments: a special multitouch event object (see "The
    touchesDragged Multitouch Event Object" below), and an array containing all of the touches on that view. (This is
    the same as calling `touch.touchesForView(this)`.)
  - `touchEnd` -- When a touch is complete, its current responder's `touchEnd` handler is invoked, if present, and passed
    the touch object which is ending.
  - `touchCancelled` -- This method is generally only called if you have changed the touch's responder. See "Touch
    Responders" below; in brief, if you pass the touch to another responder via `makeTouchResponder`, fully resigning
    your touch respondership, you will receive a `touchCancelled` call for the next event; if you pass the touch to another
    responder via `stackNextTouchResponder`, and never receive it back, you will receive a `touchCancelled` call when the
    touch finishes. (Note that because RootResponder must call touchStart to determine if a view will accept respondership,
    touchStart is called on a new responder before touchCancelled is called on the outgoing one.)

  The touchesDragged Multitouch Event Object
  -----
  The specialized event object sent to `touchesDragged` includes access to all touches currently in flight. You can
  access the touches for a specific view from the `touchesForView` method, or get an average position of the touches
  on a view from the convenient `averagedTouchesForView` method. For your convenience when dealing with the common
  single-touch view, the `touchesDragged` event object also exposes the positional page, client, screen and start X/Y
  values from the *first touch*. If you are interested in handling more than one touch, or in handling an average of
  in-flight touches, you should ignore these values. (Note that this event object exposes an array of touch events at
  `touches`. These are the browser's raw touch events, and should be avoided or used with care.)

  Touch Responders: Passing Touches Around
  -----
  The touch responder is the view which is currently handling events for that touch. A touch may only have one responder
  at a time, though a view with `acceptsMultitouch: YES` may respond to more than one touch at a time.

  A view becomes a touch responder by implementing touchStart (and not returning NO). (Out-of-order views can capture
  touch responder status by implementing captureTouch and returning YES.) Once a view is a touch responder, only that
  view will receive subsequent `touchesDragged` and `touchEnd` events; these events do not bubble like mouse events, and
  they do *not* automatically switch to other views if the touch moves outside of its initial responder.

  In some situations, you will want to pass control on to another view during the course of a touch, for example if
  it goes over another view. To permanently pass respondership to another view:

      if (shouldPassTouch) {
        touch.makeTouchResponder(nextView);
      }

  This will trigger `touchStart` on the new responder, and `touchCancel` on the outgoing one. The new responder will begin
  receiving `touchesDragged` events in place of the outgoing one.

  If you want to pass respondership to another view, but are likely to want it back – for example, when a ScrollView
  passes respondership to a child view but expects that the child view will pass it back if it moves more than a certain
  amount:

    if (shouldTemporarlyPassTouch) {
      touch.stackNextTouchResponder(nextView);
    }

  This will trigger `touchStart` on the new responder, and it will start receiving `touchesDragged` and `touchEnd` events.
  Note that the previous responder will not receive `touchCancelled` immediately, since the touch may return to it before
  the end; instead, it will only receive `touchCancelled` when the touch is ended.

  (If you would like to add a view as a fallback responder without triggering unnecessary calls to its `touchStart` and
  `touchCancelled` events, for example as an alternative to returning YES from `captureTouch`, you can call
  `stackCandidateTouchResponder` instead.)

  When the child view decides that the touch has moved enough to be a scroll, it should pass touch respondership back
  to the scroll view with:

    if (Math.abs(touch.pageX - touch.startX) > 4) {
      touch.restoreLastTouchResponder();
    }

  This will trigger `touchCancelled` on the second responder, and the first one will begin receiving `touchDragged` events
  again.
*/
SC.Touch = function(touch, touchContext) {
  // get the raw target view (we'll refine later)
  this.touchContext = touchContext;
  // Get the touch's unique ID.
  this.identifier = touch.identifier;

  var target = touch.target, targetView;

  // Special-case handling for TextFieldView's touch intercept overlays.
  if (target && SC.$(target).hasClass("touch-intercept")) {
    touch.target.style[SC.browser.experimentalStyleNameFor('transform')] = "translate3d(0px,-5000px,0px)";
    target = document.elementFromPoint(touch.pageX, touch.pageY);
    if (target) targetView = SC.viewFor(target);

    this.hidesTouchIntercept = NO;
    if (target.tagName === "INPUT") {
      this.hidesTouchIntercept = touch.target;
    } else {
      touch.target.style[SC.browser.experimentalStyleNameFor('transform')] = "translate3d(0px,0px,0px)";
    }
  } else {
    targetView = touch.target ? SC.viewFor(touch.target) : null;
  }

  this.targetView = targetView;
  this.target = target;
  this.type = touch.type;

  this.touchResponders = [];

  this.startX = this.pageX = touch.pageX;
  this.startY = this.pageY = touch.pageY;
  this.clientX = touch.clientX;
  this.clientY = touch.clientY;
  this.screenX = touch.screenX;
  this.screenY = touch.screenY;
};

SC.Touch.prototype = {
  /**@scope SC.Touch.prototype*/

  /** @private
    The responder that's responsible for the creation and management of this touch. Usually this will be
    your app's root responder. You must pass this on create, and should not change it afterwards.

    @type {SC.RootResponder}
  */
  touchContext: null,

  /**
    This touch's unique identifier. Provided by the browser and used to track touches through their lifetime.
    You will not usually need to use this, as SproutCore's touch objects themselves persist throughout the
    lifetime of a touch.

    @type {Number}
  */
  identifier: null,

  /**
    The touch's initial target element.

    @type: {Element}
  */
  target: null,

  /**
    The view for the touch's initial target element.

    @type {SC.View}
  */
  targetView: null,

  /**
    The touch's current view. (Usually this is the same as the current touchResponder.)

    @type {SC.View}
  */
  view: null,

  /**
    The touch's current responder, i.e. the view that is currently receiving events for this touch.

    You can use the following methods to pass respondership for this touch between views as needed:
    `makeTouchResponder`, `stackNextTouchResponder`, `restoreLastTouchResponder`, and `stackCandidateTouchResponder`.
    See each method's documentation, and "Touch Responders: Passing Touches Around" above, for more.

    @type {SC.Responder}
  */
  touchResponder: null,

  /**
    Whether the touch has ended yet. If you are caching touches outside of the RootResponder, it is your
    responsibility to check this property and handle ended touches appropriately.

    @type {Boolean}
  */
  hasEnded: NO,

  /**
    The touch's latest browser event's type, for example 'touchstart', 'touchmove', or 'touchend'.

    Note that SproutCore's event model differs from that of the browser, so it is not recommended that
    you use this property unless you know what you're doing.

    @type {String}
  */
  type: null,

  /** @private
    A faked mouse event property used to prevent unexpected behavior when proxying touch events to mouse
    event handlers.
  */
  clickCount: 1,

  /**
    The timestamp of the touch's most recent event. This is the time as of when all of the touch's
    positional values are accurate.

    @type {Number}
  */
  timeStamp: null,

  /**
    The touch's latest clientX position (relative to the viewport).

    @type {Number}
  */
  clientX: null,

  /**
    The touch's latest clientY position (relative to the viewport).

    @type {Number}
  */
  clientY: null,

  /**
    The touch's latest screenX position (relative to the screen).

    @type {Number}
  */
  screenX: null,

  /**
    The touch's latest screenY position (relative to the screen).

    @type {Number}
  */
  screenY: null,

  /**
    The touch's latest pageX position (relative to the document).

    @type {Number}
  */
  pageX: null,

  /**
    The touch's latest pageY position (relative to the document).

    @type {Number}
  */
  pageY: null,

  /**
    The touch's initial pageX value. Useful for tracking a touch's total relative movement.

    @type {Number}
  */
  startX: null,

  /**
    The touch's initial pageY value.

    @type {Number}
  */
  startY: null,

  /**
    The touch's horizontal velocity, in pixels per millisecond, at the time of its last event. (Positive
    velocities indicate movement leftward, negative velocities indicate movement rightward.)

    @type {Number}
  */
  velocityX: 0,

  /**
    The touch's vertical velocity, in pixels per millisecond, at the time of its last event. (Positive
    velocities indicate movement downward, negative velocities indicate movement upward.)

    @type {Number}
  */
  velocityY: 0,  

  /** @private */
  unhideTouchIntercept: function() {
    var intercept = this.hidesTouchIntercept;
    if (intercept) {
      setTimeout(function() { intercept.style[SC.browser.experimentalStyleNameFor('transform')] = "translate3d(0px,0px,0px)"; }, 500);
    }
  },

  /**
    Indicates that you want to allow the normal default behavior.  Sets
    the hasCustomEventHandling property to YES but does not cancel the event.
  */
  allowDefault: function() {
    if (this.event) this.event.hasCustomEventHandling = YES ;
  },

  /**
    If the touch is associated with an event, prevents default action on the event. This is the
    default behavior in SproutCore, which handles events through the RootResponder instead of
    allowing native handling.
  */
  preventDefault: function() {
    if (this.event) this.event.preventDefault();
  },

  /**
    Calls the native event's stopPropagation method, which prevents the method from continuing to
    bubble. Usually, SproutCore will be handling the event via delegation at the `document` level,
    so this method will have no effect.
  */
  stopPropagation: function() {
    if (this.event) this.event.stopPropagation();
  },

  stop: function() {
    if (this.event) this.event.stop();
  },

  /**
    Removes from and calls touchEnd on the touch responder.
  */
  end: function() {
    this.touchContext.endTouch(this);
  },

  /** @private
    This property, contrary to its name, stores the last touch responder for possible use later in the touch's
    lifecycle. You will usually not use this property directly, instead calling `stackNextTouchResponder` to pass
    the touch to a different view, and `restoreLastTouchResponder` to pass it back to the previous one.

    @type {SC.Responder}
  */
  nextTouchResponder: null,

  /** @private
    An array of previous touch responders.

    @type {Array}
  */
  touchResponders: null,

  /** @private
    A lazily-created array of candidate touch responders. Use `stackCandidateTouchResponder` to add candidates;
    candidates are used as a fallback if the touch is out of previous touch responders.

    @type {?Array}
  */
  candidateTouchResponders: null,

  /**
    A convenience method for making the passed view the touch's new responder, retaining the
    current responder for possible use later in the touch's lifecycle.

    For example, if the touch moves over a childView which implements its own touch handling,
    you may pass the touch to it with:

      touchesDragged: function(evt, viewTouches) {
        if ([touches should be passed to childView]) {
          this.viewTouches.forEach(function(touch) {
            touch.stackNextTouchResponder(this.someChildView);
          }, this);
        }
      }

    The child view may easily pass the touch back to this view with `touch.restoreLastTouchResponder`. In the
    mean time, this view will no longer receive `touchesDragged` events; if the touch is not returned to this
    view before ending, it will receive a `touchCancelled` event rather than `touchEnd`.

    @param {SC.Responder} view The view which should become this touch's new responder.
    @param {Boolean} upChain Whether or not a fallback responder should be sought up the responder chain if responder doesn't capture or handle the touch.
  */
  stackNextTouchResponder: function(view, upStack) {
    this.makeTouchResponder(view, YES, upStack);
  },

  /**
    A convenience method for returning touch respondership to the previous touch responder.

    For example, if your view is in a ScrollView and has captured the touch from it, your view
    will prevent scrolling until you return control of the touch to the ScrollView with:

        touchesDragged: function(evt, viewTouches) {
          if (Math.abs(evt.pageY - evt.startY) > this.MAX_SWIPE) {
            viewTouches.invoke('restoreLastTouchResponder');
          }
        }
  */
  restoreLastTouchResponder: function() {
    // If we have a previous touch responder, go back to it.
    if (this.nextTouchResponder) {
      this.makeTouchResponder(this.nextTouchResponder);
    }
    // Otherwise, check if we have a candidate responder queued up.
    else {
      var candidates = this.candidateTouchResponders,
          candidate = candidates ? candidates.pop() : null;
      if (candidate) {
        this.makeTouchResponder(candidate);
      }
    }
  },

  /**
    Changes the touch responder for the touch. If shouldStack is YES,
    the current responder will be saved so that the next responder may
    return to it.

    You will generally not call this method yourself, instead exposing on
    your view either a `touchStart` event handler method, or a `captureTouch`
    method which is passed a touch object and returns YES. This method
    is used in situations where touches need to be juggled between views,
    such as when being handled by a descendent of a ScrollView.

    When returning control of a touch to a previous handler, you should call
    `restoreLastTouchResponder` instead.

    @param {SC.Responder} responder The view which should become responder.
    @param {Boolean} shouldStack Whether the previous touch responder should be retained for possible use later in the touch's lifecycle.
    @param {Boolean} upChain Whether or not a fallback responder should be sought up the responder chain if responder doesn't capture or handle the touch.
  */
  makeTouchResponder: function(responder, shouldStack, upViewChain) {
    this.touchContext.makeTouchResponder(this, responder, shouldStack, upViewChain);
  },

  /**
    You may want your view to insert itself into the responder chain as a fallback, but without
    having touchStart etc. called if it doesn't end up coming into play. For example, SC.ScrollView
    adds itself as a candidate responder (when delaysTouchResponder is NO) so that views can easily
    give it control, but without receiving unnecessary events if not.
  */
  stackCandidateTouchResponder: function(responder) {
    // Fast path: if we're the first one it's easy.
    if (!this.candidateTouchResponders) {
      this.candidateTouchResponders = [responder];
    }
    // Just make sure it's not at the top of the stack. There may be a weird case where a
    // view wants to be in a couple of spots in the stack, but it shouldn't want to be twice
    // in a row.
    else if (responder !== this.candidateTouchResponders[this.candidateTouchResponders.length - 1]) {
      this.candidateTouchResponders.push(responder);
    }
  },

  /**
    Captures, or recaptures, the touch. This works from the touch's raw target view
    up to the startingPoint, and finds either a view that returns YES to captureTouch() or
    touchStart().

    You will generally not call this method yourself, instead exposing on
    your view either a `touchStart` event handler method, or a `captureTouch`
    method which is passed a touch object and returns YES. This method
    is used in situations where touches need to be juggled between views,
    such as when being handled by a descendent of a ScrollView.

    @param {?SC.Responder} startingPoint The view whose children should be given an opportunity
      to capture the event. (The starting point itself is not asked.)
    @param {Boolean} shouldStack Whether any capturing responder should stack with (YES) or replace
      (NO) existing responders.
  */
  captureTouch: function(startingPoint, shouldStack) {
    this.touchContext.captureTouch(this, startingPoint, shouldStack);
  },

  /**
    Returns all touches for a specified view. Put as a convenience on the touch itself;
    this method is also available on the event.

    For example, to retrieve the list of touches impacting the current event handler:

        touchesDragged: function(evt) {
          var myTouches = evt.touchesForView(this);
        }

    @param {SC.Responder} view
  */
  touchesForView: function(view) {
    return this.touchContext.touchesForView(view);
  },

  /**
    A synonym for SC.Touch#touchesForView.
  */
  touchesForResponder: function(responder) {
    return this.touchContext.touchesForView(responder);
  },

  /**
    Returns average data--x, y, and d (distance)--for the touches owned by the supplied view.

    See notes on the addSelf argument for an important consideration when calling from `touchStart`.

    @param {SC.Responder} view
    @param {Boolean} addSelf Includes the receiver in calculations. Pass YES for this if calling
        from touchStart, as the touch will not yet be included by default.
  */
  averagedTouchesForView: function(view, addSelf) {
    return this.touchContext.averagedTouchesForView(view, (addSelf ? this : null));
  }
};

SC.mixin(SC.Touch, {
  create: function(touch, touchContext) {
    return new SC.Touch(touch, touchContext);
  }
});
