// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
sc_require("system/gesture");

SC.SWIPE_HORIZONTAL = "X";
SC.SWIPE_VERTICAL = "Y";
SC.SWIPE_LEFT = "LEFT";
SC.SWIPE_RIGHT = "RIGHT";
SC.SWIPE_UP = "UP";
SC.SWIPE_DOWN = "DOWN";

SC.SwipeGesture = SC.Gesture.extend({
  name: "swipe",
  acceptsMultitouch: YES,
  
  direction: SC.SWIPE_HORIZONTAL,
  startDistance: 5,
  swipeDistance: 40,
  
  tolerance: 0.5, // we accept .5 the distance in the other direction as a swipe
  
  touchIsInGesture: function(touch, status) {
    // if we have not "flunked" the touch before, and it has moved 
    if (!status.flunked) {
      var d = this.get("direction"), 
          o = (d === SC.SWIPE_HORIZONTAL ? "Y" : "X"),
          delta = touch["page" + d] - touch["start" + d],
          oDelta = touch["page" + o] - touch["start" + o];
      
      if (
        Math.abs(delta) > this.get("startDistance") &&
        Math.abs(delta) * this.get("tolerance") > Math.abs(oDelta)
      ) {
        return YES;
      }
      
    }
    return NO;
  },
  
  touchStart: function(touch) {
    var d = this.get("direction"), 
        delta = touch["page" + d] - touch["start" + d],
        swipeDirection;
    
    if (delta < 0) swipeDirection = (d === SC.SWIPE_HORIZONTAL) ? SC.SWIPE_LEFT : SC.SWIPE_UP;
    else swipeDirection = (d === SC.SWIPE_HORIZONTAL) ? SC.SWIPE_RIGHT : SC.SWIPE_DOWN;
    
    this.start(touch, swipeDirection, delta);
    return YES;
  },
  
  touchesDragged: function(evt, touches) {
    var touch = touches.firstObject();
    var d = this.get("direction"), 
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
    } else {
      this.change(touch, swipeDirection, delta);
    }
  },
  
  touchEnd: function(touch) {
    var d = this.get("direction"), 
        o = (d === SC.SWIPE_HORIZONTAL ? "Y" : "X"),
        delta = touch["page" + d] - touch["start" + d],
        oDelta = touch["page" + o] - touch["start" + o],
        swipeDirection;
    
    // determine swipe direction
    if (delta < 0) swipeDirection = (d === SC.SWIPE_HORIZONTAL) ? SC.SWIPE_LEFT : SC.SWIPE_UP;
    else swipeDirection = (d === SC.SWIPE_HORIZONTAL) ? SC.SWIPE_RIGHT : SC.SWIPE_DOWN;

    this.end(touch, swipeDirection, delta);

    // trigger
    if (
      Math.abs(delta) > this.get("swipeDistance") ||
      Math.abs(delta) * this.get("tolerance") < Math.abs(oDelta)
    ) {
      this.trigger(touch, swipeDirection);
    }
    
    // and release all others
    var touches = touch.touchesForResponder(this);
    if (touches) {
      touches.forEach(function(touch){
        this.release(touch);
      }, this);
    }
  }
});