// ==========================================================================
// Project:   SproutCore Statechart - Hierarchical State Machine Library
// Copyright: ©2009 Sprout Systems, Inc. and contributors.
//            Portions ©2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

SC.mixin(SC.Object.prototype,
/** SC.Object.prototype */ {
  
  /**
    Adds an observer that dispatches a "propertyChanged" event to the object's
    statechart.
    
    @param {String} key the property to observe
    @param {SC.Object} target the object you want to observe the key on
    @returns {Function} the actual observer (need to remove later)
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
  
  /**
    Adds an observer that dispatches a "propertyChanged" event to the object's
    statechart.
    
    @param {String} key the property to observe
    @param {SC.Object} target the object you were observing the key on
    @param {Function} the function object returned from addStatechartObserver
    @returns {SC.Object} receiver
  */
  removeStatechartObserver: function(key, target, fun) {
    this.removeObserver(key, target, fun) ;
    return this ;
  }
  
});