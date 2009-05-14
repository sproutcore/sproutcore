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
    
    @param {String} key the property to observe
    @param {SC.Object} target the object you want to observe the key on
    @returns {SC.Object} this
  */
  addStatechartObserver: function(key, target) {
    var fun = function(target, key, value, revision) {
      this.dispatch({
        sig: 'propertyChanged',
        target: target, key: key, revision: revision
      });
    }
    this.addObserver(key, target, fun);
    return fun ;
  },
  
  removeStatechartObserver: function(key, target, fun) {
    this.removeObserver(key, target, fun) ;
  }
  
});