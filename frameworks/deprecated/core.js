// ========================================================================
// SproutCore -- JavaScript Application Framework
// Copyright ©2006-2008, Sprout Systems, Inc. and contributors.
// Portions copyright ©2008 Apple, Inc.  All rights reserved.
// ========================================================================

require('core');

/* Core additions to SC */

SC.mixin(/** @scope SC */ {
  
  /**  
    @deprecated
    
    Call this method during setup of your app to queue up methods to be 
    called once the entire document has finished loading.  If you call this
    method once the document has already loaded, then the function will be
    called immediately.
    
    Any function you register with this method will be called just before
    main.
    
    You should instead use ready(), which takes the same paramters.
    
    @param target {Object} optional target object.  Or just pass a method.
    @param method {Function} the method to call.
    @return {void}
  */
  callOnLoad: function(target, method) { 
    return SC.ready(target, method) ;
  },
  
  /** @deprecated  Use guidFor() instead. */
  getGUID: SC.guidFor
  
  
});

// Returns the passed item as an array.  If the item is already an array,
// it is returned as is.  If it is not an array, it is placed into one.  If
// it is null, an empty array is returned.
Array.from = SC.$A ;

// ........................................
// GLOBAL EXPORTS
//   
var $type, $I, $A ;
$type = SC.typeOf; 
$I = SC.inspect ;
$A = SC.$A ;

/**
  Makes the computed property as an outlet.  Outlets can be setup en-masse
  when the object is first instantiated by calling initOutlets(). (This
  method is defined in SC.Observable).
*/
Function.prototype.outlet = function(aFlag) {
  this.autoconfiguredOutlet = (aFlag === undefined) ? YES : aFlag;
  return this ;
} ;
