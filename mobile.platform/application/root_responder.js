// ========================================================================
// SproutCore -- JavaScript Application Framework
// Copyright ©2006-2008, Sprout Systems, Inc. and contributors.
// Portions copyright ©2008 Apple, Inc.  All rights reserved.
// ========================================================================

require('application/root_responder');

// Swap in platform-specific subclass.  Class-cluster FTW!
SC.RootResponder = SC.RootResponder.extend({

  platform: 'mobile',
  
  // setup any event listeners on the window.  This can be customized per
  // platform.  For example, phones only deal w/ touch events.
  setupEventListeners: function() {
    var win = this.domWindow, doc = win.document;
    
    var wevents = 'resize';
    var devents = 'touch';
    
    wevents.w().forEach(function(key){
      SC.Event.add(win, key, this, this[key]);
    },this);

    devents.w().forEach(function(key){
      SC.Event.add(doc, key, this, this[key]);
    },this);
    
    delete win; delete doc; 
    return this ;
  }
  
}) ;
