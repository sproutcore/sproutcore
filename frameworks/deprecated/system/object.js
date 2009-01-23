// ========================================================================
// SproutCore -- JavaScript Application Framework
// Copyright ©2006-2008, Sprout Systems, Inc. and contributors.
// Portions copyright ©2008 Apple, Inc.  All rights reserved.
// ========================================================================

require('system/object') ;

SC.mixin(SC.Object, {

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

