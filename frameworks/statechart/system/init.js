// ==========================================================================
// Project:   SproutCore Statechart - Hierarchical State Machine Library
// Copyright: ©2009 Sprout Systems, Inc. and contributors.
//            Portions ©2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

SC.mixin(SC.Object.prototype,
/** SC.Object.prototype */ {
  
  /**
    Specifies which object property stores the intial state of the 
    hierachical state machine.
    
    @type String
  */
  initialStateKey: 'initial',
  
  /** @private
    Initializes an object's hierarchical state machine.
    
    @returns {SC.Object} the initialized object
  */
  initStatechart: function() {
    var initialStateKey = this.get('initialStateKey') ;
    var stateKey = this.get('stateKey') ;
    var path = SC._DISPATCH_PATH ;
    var current, target, handlerKey, superstateKey, res, idx, ixd2 ;
    
    current = this[stateKey] = this[initialStateKey] ;
    if (!current) return this ; // fast path -- this object does not use HSMs
    
    // okay, does the initial state have superstates? If so, we need to
    // enter them first...
    superstateKey = current.superstateKey ;
    if (superstateKey !== undefined) {
      idx = 0 ;
      while (superstateKey) {
        path[++idx] = superstateKey ;
        superstateKey = this[superstateKey].superstateKey ;
      }
    }
    
    // enter the initial state' superstates in order
    do {
      this[path[idx]](SC.EVT_ENTER) ;
    } while ((--idx) > 0)
    
    // now enter the initial state
    this[stateKey](SC.EVT_ENTER) ;
    
    // initialize the initial states's substates
    while (this[stateKey](SC.EVT_INIT) === SC.EVT_TRANSITION_RES) {
      // enter the target of the transition (a substate)
      idx = 0 ;
      
      // get the superstate of the target of the transition...
      superstateKey = path[++idx] = current.superstateKey ;
      current = this[superstateKey] ;
      
      // walk the state hierarchy until we find our target state, storing
      // state keys along the way
      while (current !== target) {
        superstateKey = path[++idx] = current.superstateKey ;
        current = this[superstateKey] ;
      }
      
      // now enter the target's substates in reverse order...
      do {
        this[path[idx]](SC.EVT_ENTER) ;
      } while ((--idx) > 0)
      
      // and finally enter the target's substate itself
      if (idx === 0) this[stateKey](SC.EVT_ENTER) ;
      
      // the loop continues to apply any default transitions as substates
      // are entered...
    }
    
    return this ;
  }
  
});