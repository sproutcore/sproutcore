// ==========================================================================
// Project:   SproutCore Statechart - Hierarchical State Machine Library
// Copyright: ©2009 Sprout Systems, Inc. and contributors.
//            Portions ©2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

SC.EVT_ENTER_SIG = 'enter' ;
SC.EVT_EXIT_SIG  = 'exit' ;
SC.EVT_INIT_SIG  = 'defaultTransition' ;

SC.EVT_ENTER = { sig: SC.EVT_ENTER_SIG } ;
SC.EVT_EXIT  = { sig: SC.EVT_EXIT_SIG } ;
SC.EVT_INIT  = { sig: SC.EVT_INIT_SIG } ;

SC.EVT_IGNORED_RES    = 'sc-evt-ignored-res' ;
SC.EVT_HANDLED_RES    = 'sc-evt-handled-res' ;
SC.EVT_TRANSITION_RES = 'sc-evt-transition-res' ;
SC.EVT_TERMINATE_RES  = 'sc-evt-terminate-res' ;

sc_handled   = function() { return SC.EVT_HANDLED_RES; };
sc_terminate = function() { return SC.EVT_TERMINATE_RES; };

var StatechartDebugger = null ;

// ........................................
// FUNCTION ENHANCEMENTS
//
SC.mixin(Function.prototype, 
/** @scope Function.prototype */ {
  
  /**
    Indicates that the function should be treated as a hierachical state 
    handler.
    
    @param {String} superstateKey optional property key for superstate
    @returns {Function} the declared function instance
  */
  state: function(superstateKey) {
    this.superstateKey = superstateKey ;
    this.isState = YES ;
    return this ;
  }
  
});
