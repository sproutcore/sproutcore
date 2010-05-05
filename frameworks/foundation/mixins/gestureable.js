// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

SC.Gesturable = {
  concatenatedProperties: ["gestures"],
  gestures: [],
  
  initMixin: function() {
    this.createGestures();
  },
  
  createGestures: function() {
    var gestures = this.get("gestures"), idx, len = gestures.length, g, _g = [];

    // loop through all gestures
    for (idx = 0; idx < len; idx++) {
      // get the proper gesture
      if (SC.typeOf(gestures[idx]) === SC.T_STRING) {
        g = this.get(gestures[idx]);
      } else {
        g = gestures[idx];
      }
      
      // if it was not found, well, that's an error.
      if (!g) {
        throw "Could not find gesture named '" + gestures[idx] + "' on view.";
      }
      
      // if it is a class, instantiate (it really ought to be a class...)
      if (g.isClass) {
        g = g.create({
          view: this
        });
      }
      
      // and set the gesture instance and add it to the array.
      if (SC.typeOf(gestures[idx]) === SC.T_STRING) this[gestures[idx]] = g;
      _g.push(g);
    }
    
    this.set("gestures", _g);
  },
  
  /**
    Handles touch start. By default, merely passes it to gestureTouchStart.
    If you override, pass any touch you don't want to take to gestureTouchStart yourself.
    
    After letting gestureTouchStart handle a touch, you can check the "isInteresting" property
    of the touch to see if any gesture is interested.
    
    Usually, even if no gesture is interested (yet), you'll not want to release the touch just yet.
  */
  touchStart: function(touch) {
    this.gestureTouchStart(touch);
  },
  
  /**
    Handles touch drags, similarly to touch starts.
  */
  touchesDragged: function(evt, touches) {
    this.gestureTouchesDragged(evt, touches);
  },
  
  /**
    Passes touchEnd along to gestureTouchEnd.
  */
  touchEnd: function(touch) {
    this.gestureTouchEnd(touch);
  },
  
  /**
    Passes the touch to the gestures to 
  */
  gestureTouchStart: function(touch) {
    touch.isInteresting = 0;
    
    var gestures = this.get("gestures"), idx, len = gestures.length, g;
    for (idx = 0; idx < len; idx++) {
      g = gestures[idx];
      g.unassignedTouchDidStart(touch);
    }
  },
  
  /**
    Loops over touches and passes them to the gestures.
  */
  gestureTouchesDragged: function(evt, touches) {
    var gestures = this.get("gestures"), idx, len = gestures.length, g;
    for (idx = 0; idx < len; idx++) {
      g = gestures[idx];
      g.unassignedTouchesDidChange(evt, touches);
    }
  },
  
  gestureTouchEnd: function(touch) {
    var gestures = this.get("gestures"), idx, len = gestures.length, g;
    for (idx = 0; idx < len; idx++) {
      g = gestures[idx];
      g.unassignedTouchDidEnd(touch);
    }
  }
};