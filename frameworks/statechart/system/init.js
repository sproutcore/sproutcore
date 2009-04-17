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
    var initial, substate, handlerKey, superstateKey, res, idx, ixd2 ;
    
    // debugger ;
    
    initial = this[stateKey] = this[initialStateKey] ;
    if (!initial) return this ; // fast path -- this object does not use HSMs
    
    // okay, does the initial state have superstates? If so, we need to
    // enter them first...
    superstateKey = this[initial].superstateKey ;
    if (superstateKey !== undefined) {
      idx = 0 ;
      while (superstateKey) {
        path[++idx] = superstateKey ;
        superstateKey = this[superstateKey].superstateKey ;
      }
    }
    
    do {
      // this[path[idx]](SC.EVT_ENTER) ;
      this._sc_statechart_enter(path[idx]) ;
    } while ((--idx) > 0)
    
    // now enter the initial state
    // this[this[stateKey]](SC.EVT_ENTER) ;
    this._sc_statechart_enter(this[stateKey]) ;
    
    // debugger;
    
    // initialize the initial states's substates
    // while (this[this[stateKey]](SC.EVT_INIT) === SC.EVT_TRANSITION_RES) {
      while (this._sc_statechart_init(this[stateKey]) === SC.EVT_TRANSITION_RES) {
      substate = this[stateKey] ;
      
      // enter the target of the transition (a substate)
      idx = 0 ;
      
      // walk the state hierarchy until we find our target state, storing
      // state keys along the way
      while (initial !== substate) {
        superstateKey = this[substate].superstateKey ;
        if (superstateKey === undefined) break ;
        else {
          substate = path[++idx]= superstateKey ;
        }
      }
      
      // don't re-enter the initial state
      --idx ;
      
      // now enter the target's substates in top-down order...
      do {
        // this[path[idx]](SC.EVT_ENTER) ;
        this._sc_statechart_enter(path[idx]) ;
      } while ((--idx) > 0)
      
      // and finally enter the target itself
      // if (idx === 0) this[this[stateKey]](SC.EVT_ENTER) ;
      if (idx === 0) this._sc_statechart_enter(this[stateKey]) ;
      
      // the loop continues to apply any default transitions as substates
      // are entered...
    }
    
    return this ;
  }
  
});