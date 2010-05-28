// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
sc_require("system/gesture");

SC.SWIPE_HORIZONTAL = "X";
SC.SWIPE_VERTICAL = "Y";
SC.SWIPE_ANY = "XY";
SC.SWIPE_LEFT = "LEFT";
SC.SWIPE_RIGHT = "RIGHT";
SC.SWIPE_UP = "UP";
SC.SWIPE_DOWN = "DOWN";

SC.SwipeGesture = SC.Gesture.extend({
  name: "swipe",
  acceptsMultitouch: YES,
  
  direction: SC.SWIPE_HORIZONTAL,

  /**
    Will be populated with the current direction of the swipe once
    one has been determined.
  */
  currentDirection: null,

  startDistance: 5,
  swipeDistance: 40,
  
  tolerance: 0.5, // we accept .5 the distance in the other direction as a swipe
  
  touchIsInGesture: function(touch, status) {
    // if we have not "flunked" the touch before, and it has moved 
    if (!status.flunked) {
      var d = this.get('direction'),
          cd = this.get('currentDirection'),
          startDistance = this.get('startDistance'),
          deltaX = touch.pageX - touch.startX,
          deltaY = touch.pageY - touch.startY;

      if (Math.abs(deltaX) > startDistance || Math.abs(deltaY) > startDistance) {

        if (!cd) {
          if (d == SC.SWIPE_ANY) {
            if      (deltaX > deltaY) cd = SC.SWIPE_HORIZONTAL;
            else if (deltaY > deltaX) cd = SC.SWIPE_VERTICAL;
            else                      return NO; // We can't determine a direction yet
          } else {
            cd = d;
          }
          this.set('currentDirection', cd);
        }

        var delta  = (cd == SC.SWIPE_HORIZONTAL) ? deltaX : deltaY,
            oDelta = (cd == SC.SWIPE_HORIZONTAL) ? deltaY : deltaX;

        if (Math.abs(delta) * this.get("tolerance") > Math.abs(oDelta)) {
          return YES;
        }

      }
    }
    return NO;
  },
  
  touchStart: function(touch) {
    var d = this.get("currentDirection"), 
        delta = touch["page" + d] - touch["start" + d],
        swipeDirection;
    
    if (delta < 0) swipeDirection = (d === SC.SWIPE_HORIZONTAL) ? SC.SWIPE_LEFT : SC.SWIPE_UP;
    else swipeDirection = (d === SC.SWIPE_HORIZONTAL) ? SC.SWIPE_RIGHT : SC.SWIPE_DOWN;
    
    this.start(touch, swipeDirection, delta);
    return YES;
  },
  
  touchesDragged: function(evt, touches) {
    var touch = touches.firstObject();
    var d = this.get("currentDirection"), 
        o = (d === SC.SWIPE_HORIZONTAL ? "Y" : "X"),
        delta = touch["page" + d] - touch["start" + d],
        oDelta = touch["page" + o] - touch["start" + o],
        swipeDirection;
    
    if (delta < 0) swipeDirection = (d === SC.SWIPE_HORIZONTAL) ? SC.SWIPE_LEFT : SC.SWIPE_UP;
    else swipeDirection = (d === SC.SWIPE_HORIZONTAL) ? SC.SWIPE_RIGHT : SC.SWIPE_DOWN;
    
    if (
      Math.abs(delta) < this.get("startDistance") ||
      Math.abs(delta) * this.get("tolerance") < Math.abs(oDelta)
    ) {
      // does not qualify anymore
      this.release(touch);

      var allTouches = touch.touchesForResponder(this);
      if (!allTouches || allTouches.length == 0) this.end(touch, swipeDirection, delta);
    } else {
      this.change(touch, swipeDirection, delta);
    }
  },
  
  touchEnd: function(touch) {
    var d = this.get("currentDirection"), 
        o = (d === SC.SWIPE_HORIZONTAL ? "Y" : "X"),
        delta = touch["page" + d] - touch["start" + d],
        oDelta = touch["page" + o] - touch["start" + o],
        swipeDirection;
    
    // determine swipe direction
    if (delta < 0) swipeDirection = (d === SC.SWIPE_HORIZONTAL) ? SC.SWIPE_LEFT : SC.SWIPE_UP;
    else swipeDirection = (d === SC.SWIPE_HORIZONTAL) ? SC.SWIPE_RIGHT : SC.SWIPE_DOWN;

    // trigger
    if (
      Math.abs(delta) > this.get("swipeDistance") ||
      Math.abs(delta) * this.get("tolerance") < Math.abs(oDelta)
    ) {
      this.trigger(touch, swipeDirection);
    }

    this.end(touch, swipeDirection, delta);

    this.set('currentDirection', null);

    // and release all others
    var touches = touch.touchesForResponder(this);
    if (touches) {
      touches.forEach(function(touch){
        this.release(touch);
      }, this);
    }
  }
});