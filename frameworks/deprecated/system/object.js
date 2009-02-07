// ========================================================================
// SproutCore -- JavaScript Application Framework
// Copyright ©2006-2008, Sprout Systems, Inc. and contributors.
// Portions copyright ©2008 Apple, Inc.  All rights reserved.
// ========================================================================

require('system/object') ;

SC.mixin(SC.Object, {

  /**  @deprecated
    This method will listen for the observed value to change one time and 
    then will remove itself.  You can also set an optional timeout that
    will cause the function to be triggered (and the observer removed) after
    a set amount of time even if the value never changes.  The function
    can expect an extra parameter, 'didTimeout', set to true.
  
    The returned value is the function actually set as the observer. You
    can manually remove this observer by calling the cancel() method on it.
  */
  observeOnce: function(key, target, method, timeout) {
    
    // fixup the params
    var targetType = SC.typeOf(target) ;
    if (targetType === SC.T_FUNCTION) {
      if ((SC.typeOf(method) === SC.T_NUMBER) && (timeout === undefined)) {
        timeout = method ;
      }
      method = target ;
      target = this ;
    }
    
    // convert the method to a function if needed...
    if (SC.typeOf(method) === SC.T_STRING) method = target[method] ;
    if (!method) throw "You must pass a valid method to observeOnce()";

    var timeoutObject = null ;

    // define a custom observer that will call the target method and remove
    // itself as an observer.
    var handler = function(observer, target, property, value, rev, didTimeout) {
      // invoke method...
      method.call(this, observer, target, property, value, rev, didTimeout);
      
      // remove observer...
      target.removeObserver(key, this, handler) ;
      
      // if there is a timeout, invalidate it.
      if (timeoutObject) { timeoutObject.invalidate();}
      
      // avoid memory leaks
      handler = target = method = timeoutObject = null;
    } ;

    // now add observer
    target.addObserver(key, target, handler) ;
    if (timeout) {
      timeoutObject = function() {
        handler(null, target, key, target.get(key), target.propertyRevision, true) ;
        handler = target = method = timeoutObject = null;
      }.invokeLater(this, timeout) ;
    }

    handler.cancel = function() { 
      target.removeObserver(key, target, handler); 
      handler = target = method = timeoutObject = null;
    } ;

    return handler ;
  },
  
  /** @deprecated
    Takes an array of hashes and returns newly created instances.
    
    This convenience method will take an array of properties and simply
    instantiates objects from them.
    
    @params {Array} array Array of hashes with properties to assigned to each object.
    @returns {Array} instantiated objects.
  */
  createEach: function(array) {
    return array.map(function(props) { return this.create(props); }, this);
  },

  /** @deprecated
    Adding this function to the end of a view declaration will define the 
    class as an outlet that can be constructed using the outlet() method 
    (instead of get()).
    
    @returns {Outlet} a specially constructed function that will be used to
     build the outlet later.
  */
  outlet: function() {
    var obj = this ;
    return function() {
      var ret = obj.create() ; ret.owner = this ; return ret ;
    }.property().cacheable().outlet() ;
  },

  /** @deprecated
    Returns all the keys defined on this object, excluding any defined in
    parent classes unless you pass all.
    
    @param {Boolean} all OPTIONAL: if YES return all keys, NO return only keys belonging to object itself.  Defaults to NO.
    @returns {Array} keys
  */
  keys: function(all) {
    var ret = []; 
    for(var key in this) { 
      if (all || ret.hasOwnProperty(key)) ret.push(key); 
    } 
    return ret ;  
  },

  tupleForPropertyPath: SC.tupleForPropertyPath,
  objectForPropertyPath: SC.objectForPropertyPath,
  createArray: SC.Object.createEach    
});

/** @deprecated
  outlet() now works just like get().  Use get() instead.
*/ 
SC.Object.prototype.outlet = SC.Object.prototype.get ;

