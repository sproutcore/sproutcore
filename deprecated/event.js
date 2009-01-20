// ========================================================================
// SproutCore -- JavaScript Application Framework
// Copyright ©2006-2008, Sprout Systems, Inc. and contributors.
// Portions copyright ©2008 Apple, Inc.  All rights reserved.
// ========================================================================

require('system/event') ;

// This file defines some basic extensions to the built-in Event object to
// provide some common utility functions.

SC.mixin(SC.Event, /** @scope SC.Event */ {

  /** @deprecated 
    Returns the character code for the passed event.  This is no longer needed
    as you can now use the .which property on the event itself.
  */
  getCharCode: function(e) {
    return (e.keyCode) ? e.keyCode : ((e.which)?e.which:0) ; 
  },
  
  /** @deprecated 
    Returns the pressed character as a string.  You should instead use the
    getCharString() method defined on the event itself.
  */
  getCharString: function(e) {
    return String.fromCharCode(Event.getCharCode(e)) ;
  },
  
  /** @deprecated 
    Returns the pointer location on the page for the passed event.  You should
    now use the pageX and pageY properties on the event instead.
  */
  pointerLocation: function(event) {
    var ret = {
      x: event.pageX || (event.clientX +
        (document.documentElement.scrollLeft || document.body.scrollLeft)),
      y: event.pageY || (event.clientY +
        (document.documentElement.scrollTop || document.body.scrollTop))
      
    };
    return ret ;
  },
  
  /** @deprecated
    Stops an event both from performing the default action and from bubbling.
    Instead all event.stop() directly on the event.
  */
  stop: function(event) { return event.stop() ;},
  
  ALT_KEY: '_ALT',
  CTRL_KEY: '_CTRL',
  SHIFT_KEY: '_SHIFT'
    
});

// These enhancements were once provided on the native Event class also.
"getCharCode getCharString pointerLocation ALT_KEY CTRL_KEY SHIFT_KEY".split(' ').forEach(function(key){
  Event[key] = SC.Event[key] ;
}) ;
