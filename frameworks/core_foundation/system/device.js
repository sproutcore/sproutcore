// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

require('system/core_query');
require('system/ready');
require('system/root_responder');
require('system/platform');

SC.PORTRAIT_ORIENTATION = 'portrait';
SC.LANDSCAPE_ORIENTATION = 'landscape';
SC.NO_ORIENTATION = 'desktop'; // value 'desktop' for backwards compatibility

/**
  The device object allows you to check device specific properties such as 
  orientation and if the device is offline, as well as observe when they change 
  state.
  
  h1. Orientation
  When a touch device changes orientation, the orientation property will be
  set accordingly which you can observe
  
  h1. Offline support
  In order to build a good offline-capable web application, you need to know 
  when your app has gone offline so you can for instance queue your server 
  requests for a later time or provide a specific UI/message.
  
  Similarly, you also need to know when your application has returned to an 
  'online' state again, so that you can re-synchronize with the server or do 
  anything else that might be needed.
  
  By observing the 'isOffline' property you can be notified when this state
  changes. Note that this property is only connected to the navigator.onLine
  property, which is available on most modern browsers.
  
*/
SC.device = SC.Object.create({
  
  /**
    Sets the orientation for touch devices, either SC.LANDSCAPE_ORIENTATION
    or SC.PORTRAIT_ORIENTATION. Will be SC.NO_ORIENTATION in the case of
    non-touch devices that are also not simulating touch events.
  
    @property {String}
    @default SC.NO_ORIENTATION
  */
  orientation: SC.NO_ORIENTATION,
  
  /**
    Indicates whether the device is currently online or offline. For browsers
    that do not support this feature, the default value is NO.
    
    Is currently inverse of the navigator.onLine property. Most modern browsers
    will update this property when switching to or from the browser's Offline 
    mode, and when losing/regaining network connectivity.
    
    @property {Boolean}
    @default NO
  */
  isOffline: NO,

  /**
    Returns a Point containing the last known X and Y coordinates of the
    mouse, if present.

    @property {Point}
  */
  mouseLocation: function() {
    var responder = SC.RootResponder.responder,
        lastX = responder._lastMoveX,
        lastY = responder._lastMoveY;

    if (SC.empty(lastX) || SC.empty(lastY)) {
      return null;
    }

    return { x: lastX, y: lastY };
  }.property(),

  /**
    Initialize the object with some properties up front
  */
  init: function() {
    sc_super();
    
    if (navigator && navigator.onLine === false) {
      this.set('isOffline', YES);
    }
  },
  
  /**
    As soon as the DOM is up and running, make sure we attach necessary
    event handlers
  */
  setup: function() {
    var responder = SC.RootResponder.responder;
    responder.listenFor('online offline'.w(), document, this);
    
    this.orientationHandlingShouldChange();
  },
  
  // ..........................................................
  // ORIENTATION HANDLING
  //
  
  /**
    Determines which method to use for orientation changes.
    Either detects orientation changes via the current size
    of the window, or by the window.onorientationchange event.
  */
  orientationHandlingShouldChange: function() {
    if (SC.platform.windowSizeDeterminesOrientation) {
      SC.Event.remove(window, 'orientationchange', this, this.orientationchange);
      this.windowSizeDidChange(SC.RootResponder.responder.get('currentWindowSize'));
    } else if (SC.platform.supportsOrientationChange) {
      SC.Event.add(window, 'orientationchange', this, this.orientationchange);
      this.orientationchange();
    }
  },
  
  /**
    @param {Hash} newSize The new size of the window
    @returns YES if the method altered the orientation, NO otherwise
  */
  windowSizeDidChange: function(newSize) {
    if (SC.platform.windowSizeDeterminesOrientation) {
      if (!SC.browser.iOS) {
        // in any browser other than iOS, use height vs. width test
        SC.run(function() {
          if (SC.platform.touch) {
            if (newSize.height >= newSize.width) {
              SC.device.set('orientation', SC.PORTRAIT_ORIENTATION);
            } else {
              SC.device.set('orientation', SC.LANDSCAPE_ORIENTATION);
            }
          } else {
            SC.device.set('orientation', SC.NO_ORIENTATION);
          }
        });
      } else {
        // in mobile safari, because some of its chrome can make the
        // above match landscape falsely, we compare to screen.width
        SC.run(function() {
          if (newSize.width === window.screen.width) {
            SC.device.set('orientation', SC.PORTRAIT_ORIENTATION);
          } else {
            SC.device.set('orientation', SC.LANDSCAPE_ORIENTATION);
          }
        });
      }
      return YES;
    }
    return NO;
  },
  
  /**
    Called when the window.onorientationchange event is fired.
  */
  orientationchange: function(evt) {
    SC.run(function() {
      if (window.orientation === 0 || window.orientation === 180) {
        SC.device.set('orientation', SC.PORTRAIT_ORIENTATION);
      } else {
        SC.device.set('orientation', SC.LANDSCAPE_ORIENTATION);
      }
    });
  },
  
  orientationObserver: function(){
    var body = SC.$(document.body),
        orientation = this.get('orientation');
    
    if (orientation === SC.PORTRAIT_ORIENTATION) {
      body.addClass('portrait');
    } else {
      body.removeClass('portrait');
    }
    
    if (orientation === SC.LANDSCAPE_ORIENTATION) {
      body.addClass('landscape');
    } else {
      body.removeClass('landscape');
    }
  }.observes('orientation'),
  
  
  // ..........................................................
  // CONNECTION HANDLING
  // 
  
  online: function(evt) {
    this.set('isOffline', NO);
  },
  
  offline: function(evt) {
    this.set('isOffline', YES);
  }

});

/*
  Invoked when the document is ready, but before main is called.  Creates
  an instance and sets up event listeners as needed.
*/
SC.ready(function() {
  SC.device.setup() ;
});