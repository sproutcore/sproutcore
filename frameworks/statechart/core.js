// ==========================================================================
// Project:   SproutCore Statechart - Hierarchical State Machine Library
// Copyright: ©2009 Sprout Systems, Inc. and contributors.
//            Portions ©2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

// ........................................
// FUNCTION ENHANCEMENTS
//
SC.mixin(Function.prototype, 
/** @scope Function.prototype */ {
  
  /**
    Indicates that the function should be treated as a hierachical state 
    handler.
    
    @param parentStateKey {String} optional key of parent state
    @returns {Function} the declared function instance
  */
  state: function(superstateKey) {
    this.superstateKey = superstateKey ;
    this.isState = YES ;
    return this ;
  },
  
});
