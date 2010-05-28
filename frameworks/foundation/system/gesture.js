// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================


/**
  SC.Gesture is a simple object which can easily be extended, and which determines
  if a touch or multiple touches match any given gesture.
  
  Gestures have names. These names can be customized at any point; they are merely
  prefixes for the methods that will be called on the Gesturable view: 
  
  - [gesture]Start
  - [gesture]Changed
  - [gesture]End
  - [gesture]

  
  When an SC.Gesturable talks with SC.Gesture, it will call touchStartHasPotential first.
  
  When a touch is moving, the Gesturable will call unassignedTouchesDidChange with the set of touches.
  By default, this method calls touchIsInGesture(touch) for the touch.
  
  A gesture has two choices if it wants to take complete control of a touch. It can do so
  in a one-off way--that is, the touch will then be ignored if anything further happens with it.
  Or, it may take possession of the touch. The former will trigger [gestureName](gesture, args) on the view,
  the latter will trigger [gestureName]Start(gesture). The gesture may then trigger, at any time,
  change(arguments here) and end(arguments here).
  
  To trigger a one-off, you call trigger(touch). Otherwise, from touchIsInGesture you can return YES, or,
  if not in touchIsInGesture, call take(touch) (returning YES calls take(touch) for you). 
  
  Gestures actually become the touch responder for a touch when they take posession of it. This means that
  to release a touch, you must call touch.makeTouchResponder or touch.captureTouch(this.view) to release
  the touch. Mostly, however, gestures themselves do not need to release touches. Still, just in case, there
  is a convenience release(touch) function.
  
  Good places to call start() and end() (which call [gestureName]Start and [gestureName]End) from are
  touchStart and touchEnd, respectively.
  
  Finally, if you have ANY interest in a touch, and don't want a view to relay it to some other view just
  yet, you should call interestedInTouch(touch); if the touch is no longer interesting, call uninterestedInTouch(touch);
  
  Gestures are created by SC.Gesturable views as-needed, but last the lifetime of the view.
*/
SC.Gesture = SC.Object.extend({
  /**
    The gesture name
  */
  name: "gesture",

  /**
    Return YES to take the touch, starting the gesture if it is not already started, or
    trigger() to trigger the one-off gesture and call discardTouch(touch) to get rid of the touch.
  */
  touchIsInGesture: function(touch, status) {
    return NO;
  },
  
  /**
    Called when a touch has started in the gesture (due to "take" being called).
  */
  touchStart: function(touch) {
    
  },
  
  /**
    Called when touches have moved in the gesture.
  */
  touchesDragged: function(evt, touches) {
    
  },
  
  /**
    Called whn a touch has ended in the gesture.
  */
  touchEnd: function(touch) {
    
  },
  
  /**
    Starts the gesture, if it is not already started, 
  */
  start: function() {
    if (!this.get("isActive")) {
      this.set("isActive", YES);
      
      var args = SC.$A(arguments);
      args.unshift(this);
      
      var act = this.name + "Start";
      if (this.view[act]) this.view[act].apply(this.view, args);
    }
  },
  
  /**
    Ends the gesture, if it is active.
  */
  end: function() {
    if (this.get("isActive")) {
      this.set("isActive", NO);

      var args = SC.$A(arguments);
      args.unshift(this);
      
      var act = this.name + "End";
      if (this.view[act]) this.view[act].apply(this.view, args);
    }
  },
  
  /**
    Alert that the gesture has changed.
  */
  change: function() {
    if (this.get('isActive')) {
      var args = SC.$A(arguments);
      args.unshift(this);

      var act = this.name + "Changed";
      if (this.view[act]) this.view[act].apply(this.view, args);
    }
  },

  /**
    Cancel the gesture.
  */
  cancel: function(){
    if (this.get('isActive')) {
      this.set('isActive', NO);

      var args = SC.$A(arguments);
      args.unshift(this);

      var act = this.name + "Cancelled";
      if (this.view[act]) this.view[act].apply(this.view, args);

      if (this.didCancel) this.didCancel.apply(this, arguments);
    }
  },

  /**
    Takes possession of a touch. This does not take effect immediately; it takes effect after
    the run loop finishes to prevent it from being called during another makeTouchResponder.
  */
  take: function(touch) {
    this.invokeLater("_take", 0, touch);
  },
  
  _take: function(touch) {
    touch.isTaken = YES; // because even changing responder won't prevent it from being used this cycle.
    if (touch.touchResponder && touch.touchResponder !== this) touch.makeTouchResponder(this, YES);
  },
  
  /**
    Releases a touch. This takes effect immediately, because you would usually call this from
    touchesDragged or such.
  */
  release: function(touch) {
    touch.isTaken = NO;
    touch.makeTouchResponder(touch.nextTouchResponder);
  },
  
  /**
    Triggers the gesture.
  */
  trigger: function() {
    var args = SC.$A(arguments);
    args.unshift(this);
    
    var act = this.name;
    if (this.view[act]) this.view[act].apply(this.view, args);
  },
  
  /**
    Discards a touch, making its responder null.
  */
  discardTouch: function(touch) {
    touch.isTaken = YES; // because even changing responder won't prevent it from being used this cycle.
    touch.makeTouchResponder(null);
  },
  
  /**
    Returns a status hash (which gestures may and should modify) for a given touch, for tracking
    whether it is a potential match, etc.
  */
  statusForTouch: function(touch) {
    var key = SC.guidFor(touch.view) + this.name;
    var status = touch[key];
    if (!status) status = touch[key] = {};
    return status;
  },
  
  /**
    Called when an unassigned touch has started. By default, this calls touchIsInGesture.
  */
  unassignedTouchDidStart: function(touch) {
    if (touch.isTaken) return;
    if (this.touchIsInGesture(touch, this.statusForTouch(touch))) {
      this.take(touch);
    }
  },
  
  /**
    This is called when the unassigned touches (touches not in a gesture) change or move
    in some way. By default, this calls touchIsInGesture(touch, status) for each touch.
  */
  unassignedTouchesDidChange: function(evt, touches) {
    touches.forEach(function(touch) {
      if (touch.isTaken) return;
      if (this.touchIsInGesture(touch, this.statusForTouch(touch))) {
        this.take(touch);
      }
    }, this);
  },
  
  /**
    This is called when the unassigned touches (touches not in the gesture) have ended.
    Default does nothing. Many gestures will want to implement this even if they don't implement
    unassignedTouchesDidChange.
  */
  unassignedTouchDidEnd: function(touch) {
    
  },
  
  /**
    Marks the touch as "interesting" to this gesture.
  */
  interestedInTouch: function(touch) {
    var status = this.statusForTouch(touch);
    if (status.isInterested) return;
    status.isInterested = YES;
    touch.isInteresting++;
  },
  
  /**
    Marks the touch as "uninteresting" to this gesture.
  */
  uninterestedInTouch: function(touch) {
    var status = this.statusForTouch(touch);
    if (!status.isInterested) return;
    status.isInterested = NO;
    touch.isInteresting--;
  }
});