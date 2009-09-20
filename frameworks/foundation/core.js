// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/**
  Indicates that the collection view expects to accept a drop ON the specified
  item.
  
  @property {Number}
*/
SC.DROP_ON = 0x01 ;

/**
  Indicates that the collection view expects to accept a drop BEFORE the 
  specified item.
  
  @property {Number}
*/
SC.DROP_BEFORE = 0x02 ;

/**
  Indicates that the collection view expects to accept a drop AFTER the
  specified item.  This is treated just like SC.DROP_BEFORE is most views
  except for tree lists.
  
  @property {Number}
*/
SC.DROP_AFTER = 0x04 ;

/**
  Indicates that the collection view want's to know which operations would 
  be allowed for either drop operation.
  
  @property {Number}
*/
SC.DROP_ANY = 0x07 ;

SC.mixin(/** @lends SC */ {
  
  /**
    Reads or writes data from a global cache.  You can use this facility to
    store information about an object without actually adding properties to
    the object itself.  This is needed especially when working with DOM,
    which can leak easily in IE.
    
    To read data, simply pass in the reference element (used as a key) and
    the name of the value to read.  To write, also include the data.
    
    You can also just pass an object to retrieve the entire cache.
    
    @param elem {Object} An object or Element to use as scope
    @param name {String} Optional name of the value to read/write
    @param data {Object} Optional data.  If passed, write.
    @returns {Object} the value of the named data
  */
  data: function(elem, name, data) {
    elem = (elem === window) ? "@window" : elem ;
    var hash = SC.hashFor(elem) ; // get the hash key
    
    // Generate the data cache if needed
    var cache = SC._data_cache ;
    if (!cache) SC._data_cache = cache = {} ;
    
    // Now get cache for element
    var elemCache = cache[hash] ;
    if (name && !elemCache) cache[hash] = elemCache = {} ;
    
    // Write data if provided 
    if (elemCache && (data !== undefined)) elemCache[name] = data ;
    
    return (name) ? elemCache[name] : elemCache ;
  },
  
  /**
    Removes data from the global cache.  This is used throughout the
    framework to hold data without creating memory leaks.
    
    You can remove either a single item on the cache or all of the cached 
    data for an object.
    
    @param elem {Object} An object or Element to use as scope
    @param name {String} optional name to remove. 
    @returns {Object} the value or cache that was removed
  */
  removeData: function(elem, name) {
    elem = (elem === window) ? "@window" : elem ;
    var hash = SC.hashFor(elem) ;
    
    // return undefined if no cache is defined
    var cache = SC._data_cache ;
    if (!cache) return undefined ;
    
    // return undefined if the elem cache is undefined
    var elemCache = cache[hash] ;
    if (!elemCache) return undefined;
    
    // get the return value
    var ret = (name) ? elemCache[name] : elemCache ;
    
    // and delete as appropriate
    if (name) {
      delete elemCache[name] ;
    } else {
      delete cache[hash] ;
    }
    
    return ret ;
  }
}) ;

SC.mixin(Function.prototype, /** @scope Function.prototype */ {
  /**
    Creates a timer that will execute the function after a specified 
    period of time.
    
    If you pass an optional set of arguments, the arguments will be passed
    to the function as well.  Otherwise the function should have the 
    signature:
    
    {{{
      function functionName(timer)
    }}}

    @param target {Object} optional target object to use as this
    @param interval {Number} the time to wait, in msec
    @returns {SC.Timer} scheduled timer
  */
  invokeLater: function(target, interval) {
    if (interval === undefined) interval = 1 ;
    var f = this;
    if (arguments.length > 2) {
      var args = SC.$A(arguments).slice(2,arguments.length);
      args.unshift(target);
      // f = f.bind.apply(f, args) ;
      var that = this, func = f ;
      f = function() { return func.apply(that, args.slice(1)); } ;
    }
    return SC.Timer.schedule({ target: target, action: f, interval: interval });
  }    

});
