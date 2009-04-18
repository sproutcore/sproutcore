// ==========================================================================
// Project:   SproutCore Statechart - Hierarchical State Machine Library
// Copyright: ©2009 Sprout Systems, Inc. and contributors.
//            Portions ©2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

sc_require('system/dispatch') ;

SC.mixin(SC.Object.prototype,
/** SC.Object.prototype */ {
  
  /** @private
    Enters a given state. This method is overriden in debug mode to implement
    state tracing.
    
    @param {String} state a local property containing a state handler
    @returns {SC.EVT_HANDLED_RES or undefined}
  */
  _sc_statechart_enter: function(state) {
    var depth = this._sc_state_depth++ ;
    
    var pre = '' ;
    while (--depth >= 0) pre = pre + '  ' ;
    
    console.log(pre + "-> entering \"" + state + '"') ;
    return this[state](SC.EVT_ENTER) ;
  },
  
  /** @private
    Exits a given state. This method is overriden in debug mode to implement
    state tracing.
    
    @param {String} state a local property containing a state handler
    @returns {SC.EVT_HANDLED_RES or undefined}
  */
  _sc_statechart_exit: function(state) {
    var depth = this._sc_state_depth-- ;
    
    var pre = '' ;
    while (--depth > 0) pre = pre + '  ' ;
    
    console.log(pre + "<- leaving  \"" + state + '"') ;
    return this[state](SC.EVT_EXIT) ;
  },
  
  /** @private
    Inits a given state. This method is overriden in debug mode to implement
    state tracing.
    
    @param {String} state a local property containing a state handler
    @returns {SC.EVT_TRANSITION_RES or undefined}
  */
  _sc_statechart_init: function(state) {
    var depth = this._sc_state_depth ;
    
    var pre = '' ;
    while (--depth > 0) pre = pre + '  ' ;
    
    var res = this[state](SC.EVT_INIT), stateKey = this.get('stateKey') ;
    if (res === SC.EVT_TRANSITION_RES) console.log(pre + "  (taking default transition to \"" + this[stateKey] + '")') ;
    return res ;
  },
  
  /** @private
    Sends an event to the given state. This method is overriden in debug mode 
    to implement state tracing.
    
    @param {String} state a local property containing a state handler
    @returns {SC.EVT_HANDLED_RES, SC.EVT_TRANSITION_RES, or undefined}
  */
  _sc_statechart_event: function(state, evt, depth) {
    var pre = '' ;
    while (--depth > 0) pre = pre + '  ' ;
    
    var res = this[state](evt), stateKey = this.get('stateKey') ;
    if (res) {
      if (res === SC.EVT_HANDLED_RES) {
        console.log(pre + '"' + state + '" handled event \'' + evt.sig + '\' (no transition)') ;
      } else if (res === SC.EVT_TRANSITION_RES) {
        console.log(pre + '"' + state + '" handled event \'' + evt.sig + '\' with a transition to \"' + this[stateKey] + '"') ;
      }
    } else console.log(pre + '"' + state + '" ignored event \'' + evt.sig + "'") ;
    return res ;
  }
  
});
