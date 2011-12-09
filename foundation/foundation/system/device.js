// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

require('system/ready');
require('system/root_responder');
require('system/platform');

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
    Sets the orientation for touch devices, either 'landscape' or 'portrait'. 
    Will be 'desktop' in the case of non-touch devices.
  
    @property {String}
    @default 'desktop'
  */
  orientation: 'desktop',
  
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
    if(SC.platform.touch) this.orientationchange();
    
    if(navigator && navigator.onLine===false) {
      this.set('isOffline', YES);
    }
    
    this.panes = SC.Set.create();
  },
  
  /**
    As soon as the DOM is up and running, make sure we attach necessary
    event handlers
  */
  setup: function() {
    var responder = SC.RootResponder.responder;
    responder.listenFor('orientationchange'.w(), window, this);
    responder.listenFor('online offline'.w(), document, this);
  },
  
  // ..........................................................
  // EVENT HANDLING
  //
  
  orientationchange: function(evt) {
    if(window.orientation===0 || window.orientation===180) {
      this.set('orientation', 'portrait');
    }
    else {
      this.set('orientation', 'landscape');
    }
  },
  
  orientationObserver: function(){
    var body = SC.$(document.body),
        or = this.get('orientation');
    if(or === "portrait") {
      body.setClass('portrait', YES);
      body.setClass('landscape', NO);
    }
    if( or === "landscape" ) {
      body.setClass('portrait', NO);
      body.setClass('landscape', YES);
    }
  }.observes('orientation'),
  
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