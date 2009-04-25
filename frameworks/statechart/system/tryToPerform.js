// ==========================================================================
// Project:   SproutCore Statechart - Hierarchical State Machine Library
// Copyright: ©2009 Sprout Systems, Inc. and contributors.
//            Portions ©2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

SC.mixin(SC.Object.prototype,
/** SC.Object.prototype */ {
  
  /**
    Attempts to dispatch the event to the object's statechart, if present. 
    Otherwise, has same behavior as default SC.Object implementation.
    
    @param {String} methodName
    @param {Object} arg1
    @param {Object} arg2
    @returns {Boolean} YES if handled, NO if not handled
  */
  tryToPerform: function(methodName, arg1, arg2) {
    var ret ;
    
    if (this.hasStatechart) {
      // are we trying to perform an event?
      if (arg1 && arg1 instanceof SC.Event) {
        arg1.sig = methodName ;
        ret = this.dispatch(arg1) ;
        
      // no, we're trying to performn an action...
      } else {
        ret = this.dispatch({
          sig: methodName,
          arg1: arg1,
          arg2: arg2
        })
      }
    }
    
    if (!ret && this.respondsTo(methodName)) {
      ret = this[methodName](arg1, arg2) !== NO ;
    }
    
    return ret ;
  }
  
});
