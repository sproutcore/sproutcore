// ==========================================================================
// SproutCore -- JavaScript Application Framework
// copyright 2006-2008, Sprout Systems, Inc. and contributors.
// ==========================================================================

// This file defines some basic extensions to the built-in Event object to
// provide some common utility functions.

SC.mixin(Event,{
  
  // get the character code for key pressed events.
  getCharCode: function(e) {
    return (e.keyCode) ? e.keyCode : ((e.which)?e.which:0) ; 
  },
  
  // get the pressed char as a string.
  getCharString: function(e) {
    return String.fromCharCode(Event.getCharCode(e)) ;
  },
  
  pointerLocation: function(event) {
    var ret = {
      x: event.pageX || (event.clientX +
        (document.documentElement.scrollLeft || document.body.scrollLeft)),
      y: event.pageY || (event.clientY +
        (document.documentElement.scrollTop || document.body.scrollTop))
      
    };
    return ret ;
  },
  
  ALT_KEY: '_ALT',
  CTRL_KEY: '_CTRL',
  SHIFT_KEY: '_SHIFT'
  
});
