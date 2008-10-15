// ==========================================================================
// SproutCore
// Author: Charles Jolley
// copyright 2006-2008, Sprout Systems, Inc.
// ==========================================================================

// this is used by the JavascriptCompile class on the server side.  You can
// use this to automatically determine the order javascript files need to be
// included in.  On the client side, this is a NOP.
var require = require || function require() { } ;
require('license') ;

// ........................................
// GLOBAL CONSTANTS
// 
// Most global constants should be defined inside of the SC namespace.  
// However the following two are useful enough and generally benign enough
// to put into the global object.
var YES = true ; 
var NO = false ;

// prevent a console.log from blowing things up if we are on a browser that
// does not support it
if (typeof console === 'undefined') {
  var console = console || window.console || {} ;
  console.log = console.info = console.warn = console.error = function(){};
}

// ........................................
// BOOTSTRAP
// 
// The root namespace and some common utility methods are defined here. The
// rest of the methods go into the mixin defined below.

/**
  @namespace
  
  The SproutCore namespace.  All SproutCore methods and functions are defined
  inside of this namespace.  You generally should not add new properties to
  this namespace as it may be overwritten by future versions of SproutCore.
  
  You can also use the shorthand "SC" instead of "SproutCore".
  
  SproutCore-Base is a framework that provides core functions for SproutCore
  including cross-platform functions, support for property observing and
  objects.  It's focus is on small size and performance.  You can use this 
  in place of or along-side other cross-platform libraries such as jQuery or
  Prototype.
  
  The core Base framework is based on the jQuery API with a number of 
  performance optimizations.
*/
var SC = SC || {} ; 
var SproutCore = SproutCore || SC ;

/**
  Adds properties to a target object.
  
  Takes the root object and adds the attributes for any additional 
  arguments passed.

  @param target {Object} the target object to extend
  @param properties {Object} one or more objects with properties to copy.
  @returns {Object} the target object.
  @static
*/
SC.mixin = function() {
  // copy reference to target object
  var target = arguments[0] || {};
  var idx = 1;
  var length = arguments.length ;
  var options ;

  // Handle case where we have only one item...extend SC
  if (length === 1) {
    target = this || {};
    idx=0;
  }

  for ( ; idx < length; idx++ ) {
    if (!(options = arguments[idx])) continue ;
    for(var key in options) {
      if (!options.hasOwnProperty(key)) continue ;
      var src = target[key];
      var copy = options[key] ;
      if (target===copy) continue ; // prevent never-ending loop
      if (copy !== undefined) target[key] = copy ;
    }
  }
  
  return target;
} ;

/** 
  Alternative to mixin.  Provided for compatibility with jQuery.
  @function 
*/
SC.extend = SC.mixin ;


// Enough with the bootstrap code.  Let's define some core functions
SC.mixin(/** @scope SC */ {
  
  // ........................................
  // GLOBAL CONSTANTS
  // 
  T_ERROR:     'error',
  T_OBJECT:    'object',
  T_NULL:      'null',
  T_CLASS:     'class',
  T_HASH:      'hash',
  T_FUNCTION:  'function',
  T_UNDEFINED: 'undefined',
  T_NUMBER:    'number',
  T_BOOL:      'boolean',
  T_ARRAY:     'array',
  T_STRING:    'string',

  // ........................................
  // CORE HELPER METHODS
  //   


  /**  
    Call this method during setup of your app to queue up methods to be 
    called once the entire document has finished loading.  If you call this
    method once the document has already loaded, then the function will be
    called immediately.
    
    Any function you register with this method will be called just before
    main.
    
    @param target {Object} optional target object.  Or just pass a method.
    @param method {Function} the method to call.
    @return {void}
  */
  callOnLoad: function(target, method) { 
    
    // normalize parameters
    if (method === undefined) { method = target; target = null; }
    if (typeof(method) === 'string') {
      if (target) {
        method = target[method] ;
      } else {
        throw "You must pass a function to callOnLoad() (got: "+method+")";
      }
    }

    // invoke the method if the queue is flushed.
    if (SC._onloadQueueFlushed) method.apply(target || window.document) ;
    var queue = SC._onloadQueue = (SC._onloadQueue || []) ;
    queue.push([target, method]) ;
  },

  // To flush the callOnLoad queue, you need to set window.onload=SC.didLoad
  didLoad: function() { 
    SC.app = SC.Application.create();
    SC.app.run();
    
    // set the current language
    var b = $tag('body');
    Element.addClassName(b, String.currentLanguage().toLowerCase()) ;

    // call the onloadQueue.
    var queue ;
    SC.runLoop.beginRunLoop() ;
    if (window.callOnLoad) {
      if (window.callOnLoad instanceof Array) {
        queue = window.callOnLoad ;
      } else if (window.callOnLoad instanceof Function) {
        queue = [window, window.callOnLoad] ;
      }
    } else queue = [] ;
    queue = queue.concat(SC._onloadQueue) ;
    var func = null ;
    while(func = queue.shift()) {
      if (SC.typeOf(func) === SC.T_FUNCTION) {
        func.call(document) ;
      } else func[1].call(func[0] || document) ;
    }
      
    SC._onloadQueueFlushed = true ;
        
    // start the app; call main.
    if (window.main && (main instanceof Function)) main() ; // start app.
    
    // finally handle any routes if any.
    if (typeof Routes != 'undefined') {
      Routes.doRoutes() ; // old style.
    } else if (typeof SC.Routes != 'undefined') {
      SC.Routes.ping() ; // handle routes, if modules is installed.
    }
    
    SC.runLoop.endRunLoop();
    
		//remove possible IE7 leak
		b = null;
		queue = null;
		func = null;
  },
  
  /**
    Returns a consistant type for the passed item.
    
    Use this instead of the built-in typeOf() to get the type of an item. 
    It will return the same result across all browsers and includes a bit 
    more detail.  Here is what will be returned:
    
    | Return Value Constant | Meaning |
    | SC.T_STRING | String primitive |
    | SC.T_NUMBER | Number primitive |
    | SC.T_BOOLEAN | Boolean primitive |
    | SC.T_NULL | Null value |
    | SC.T_UNDEFINED | Undefined value |
    | SC.T_FUNCTION | A function |
    | SC.T_ARRAY | An instance of Array |
    | SC.T_CLASS | A SproutCore class (created using SC.Object.extend()) |
    | SC.T_OBJECT | A SproutCore object instance |
    | SC.T_HASH | A JavaScript object not inheriting from SC.Object |
    
    @param item {Object} the item to check
    @returns {String} the type
  */  
  typeOf: function(item) {
    if (item === undefined) return SC.T_UNDEFINED ;
    if (item === null) return SC.T_NULL ; 
    var ret = typeof(item) ;
    if (ret == "object") {
      if (item instanceof Array) {
        ret = SC.T_ARRAY ;
      } else if (item instanceof Function) {
        ret = (item.isClass) ? SC.T_CLASS : SC.T_FUNCTION ;
        
      // NB: typeOf() may be called before SC.Error has had a chance to load
      // so this code checks for the presence of SC.Error first just to make
      // sure.  No error instance can exist before the class loads anyway so
      // this is safe.
      } else if (SC.Error && (item instanceof SC.Error)) {
        ret = SC.T_ERROR ;        
      } else if (item.isObject === true) {
        ret = SC.T_OBJECT ;
      } else ret = SC.T_HASH ;
    } else if (ret === SC.T_FUNCTION) ret = (item.isClass) ? SC.T_CLASS : SC.T_FUNCTION;
    return ret ;
  },
  
  /**
    Returns YES if the passed object is an array or array-like.
    
    Unlike SC.$type this method returns true even if the passed object is 
    not formally array but appears to be array-like (i.e. has a length 
    property, responds to .objectAt, etc.)
    
    @param obj {Object} the object to test
    @returns {Boolean} 
  */
  isArray: function(obj) {
    var t = SC.$type(obj);
    return (t === SC.T_ARRAY) || ((t !== SC.T_STRING) && obj && ((obj.length !== undefined) || obj.objectAt)) ;
  },
  
  /**
    Converts the passed object to an Array.  If the object appears to be 
    array-like, a new array will be cloned from it.  Otherwise, a new array
    will be created with the item itself as the only item in the array.
    
    This is an alias for Array.from() as well.
    
    @param object {Object} any enumerable or array-like object.
    @returns {Array} Array of items
  */
  $A: function(obj) {
    
    // null or undefined
    if (obj == null) return [] ;
    
    // primitive
    if (obj.slice instanceof Function) return obj.slice() ; 
    
    // enumerable
    if (obj.toArray) return obj.toArray() ;
    
    // not array-like
    if (obj.length===undefined || SC.$type(obj) === SC.T_FUNCTION) return [obj];

    // when all else fails, do a manual convert...
    var len = obj.length;
    var ret = [] ;
    for(var idx=0;idx<len;idx++) ret[idx] = obj[idx];
    return ret ;
  },

  /**
    Returns a unique GUID for the object.  If the object does not yet have
    a guid, one will be assigned to it.  You can call this on any object,
    SC.Object-based or not, but be aware that it will add a _guid property.
    
    You can also use this method on DOM Element objects.
    
    @param obj {Object} any object, string, number, Element, or primitive
    @returns {String} the unique guid for this instance.
  */
  guidFor: function(obj) {
    if (obj === undefined) return "(undefined)" ;
    if (obj === null) return '(null)' ;
    if (obj._guid) return obj._guid ;
    
    switch(SC.$type(obj)) {
      case SC.T_NUMBER:
        return this._numberGuids[obj] = this._numberGuids[obj] || ("#" + obj);
        break ;
      case SC.T_STRING:
        return this._stringGuids[obj] = this._stringGuids[obj] || ("$" + obj);
        break ;
      case SC.T_BOOL:
        return (obj) ? "(true)" : "(false)" ;
        break;
      default:
        return obj._guid = SC.generateGuid();
    }
  },
  
  generateGuid: function() { return ("@" + (SC._nextGUID++)); },
  _nextGUID: 0, _numberGuids: [], _stringGuids: {},

  /**
    Returns a unique hash code for the object.  If the object implements
    a hash() method, the value of that method will be returned.  Otherwise,
    this will return the same value as guidFor().  
    
    Unlike guidFor(), this method allows you to implement logic in your 
    code to cause two separate instances of the same object to be treated as
    if they were equal for comparisons and other functions.
    
    IMPORTANT:  If you implement a hash() method, it MUST NOT return a number
    or a string that contains only a number.  Typically hash codes are strings
    that begin with a "%".
    
    @param obj {Object} the object
    @returns {String} the hash code for this instance.
  */
  hashFor: function(obj) {
    return (obj && obj.hash && SC.$type(obj.hash) === SC.T_FUNCTION) ? obj.hash() : this.guidFor(obj) ;
  },

  /**
    This will compare the two object values using their hash codes.
    
    @param a {Object} first value to compare
    @param b {Object} the second value to compare
    @returns {Boolean} YES if the two have equal hash code values.
    
  */
  isEqual: function(a,b) {
    // shortcut a few places.
    if (a === null) {
      return b === null ;
    } else if (a === undefined) {
      return b === undefined ;
    
    // finally, check their hash-codes
    } else return SC.hashFor(a) === SC.hashFor(b) ;
  },

  _numberGuids: [],
  
  _stringGuids: {},
  
  /** 
    Empty function.  Useful for some operations. 
  */
  K: function() { return this; },
  
  /**
    Creates a new object with the passed object as its prototype.
    
    This method uses JavaScript's native inheritence method to create a new 
    object.    
    
    You cannot use beget() to create new SC.Object-based objects, but you
    can use it to beget Arrays, Hashes, Sets and objects you build yourself.
    Note that when you beget() a new object, this method will also call the
    didBeget() method on the object you passed in if it is defined.  You can
    use this method to perform any other setup needed.
    
    In general, you will not use beget() often as SC.Object is much more 
    useful, but for certain rare algorithms, this method can be very useful.
    
    For more information on using beget(), see the section on beget() in 
    Crockford's JavaScript: The Good Parts.
    
    @param obj {Object} the object to beget
    @returns {Object} the new object.
  */
  beget: function(obj) {
    if (obj == null) return null ;
    var k = SC.K; k.prototype = obj ;
    var ret = new k();
    k.prototype = null ; // avoid leaks
    if (SC.$type(obj.didBeget) === SC.T_FUNCTION) ret = obj.didBeget(ret); 
    return ret ;
  },
  
  /**
    Creates a clone of the passed object.  This function can take just about
    any type of object and create a clone of it, including primitive values
    (which are not actually cloned because they are immutable).
    
    If the passed object implements the clone() method, then this function
    will simply call that method and return the result.
    
    @param object {Object} the object to clone
    @returns {Object} the cloned object
  */
  clone: function(object) {
    var ret = object ;
    switch (SC.typeOf(object)) {
    case SC.T_ARRAY:
      if (object.clone && SC.typeOf(object.clone) === SC.T_FUNCTION) {
        ret = object.clone() ;
      } else ret = object.slice() ;
      break ;
    
    case SC.T_HASH:
    case SC.T_OBJECT:
      if (object.clone && SC.typeOf(object.clone) === SC.T_FUNCTION) {
        ret = object.clone() ;
      } else {
        ret = {} ;
        for(var key in object) ret[key] = object[key] ;
      }
    }
    
    return ret ;
  },
  
  /**
    Convenience method to inspect an object.  This method will attempt to 
    convert the object into a useful string description.
  */
  inspect: function(obj) {
    var ret = [] ;
    for(var key in obj) {
      if (v === 'toString') continue ; // ignore useless items
      var v = obj[key] ;
      if (SC.typeOf(v) === SC.T_FUNCTION) v = "function() { ... }" ;
      ret.push(key + ": " + v) ;
    }
    return "{" + ret.join(" , ") + "}" ;
  },

  /**
    Returns a tuple containing the object and key for the specified property 
    path.  If no object could be found to match the property path, then 
    returns null.
    
    This is the standard method used throughout SproutCore to resolve property
    paths.
    
    @param path {String} the property path
    @param root {Object} optional parameter specifying the place to start
    @returns {Array} array with [object, property] if found or null
  */
  tupleForPropertyPath: function(path, root) {
    
    // if the passed path is itself a tuple, return it
    if (SC.$type(path) === SC.T_ARRAY) return path ;

    // find the key.  It is the last . or first *
    var key ;
    var stopAt = path.indexOf('*') ;
    if (stopAt < 0) stopAt = path.lastIndexOf('.') ;
    key = (stopAt >= 0) ? path.slice(stopAt+1) : path ;
    
    // convert path to object.
    var obj = this.objectForPropertyPath(path, root, stopAt) ;
    return (obj && key) ? [obj,key] : null ;
  },

  /** 
    Finds the object for the passed path or array of path components.  This is 
    the standard method used in SproutCore to traverse object paths.
    
    @param path {String} the path
    @param root {Object} optional root object.  window is used otherwise
    @param stopAt {Integer} optional point to stop searching the path.
    @returns {Object} the found object or undefined.
  */
  objectForPropertyPath: function(path, root, stopAt) {

    if (!root) root = window ;
    
    // faster method for strings
    if (SC.$type(path) === SC.T_STRING) {
      if (stopAt === undefined) stopAt = path.length ;
      var loc = 0 ;
      while((root) && (loc < stopAt)) {
        var nextDotAt = path.indexOf('.', loc) ;
        if ((nextDotAt < 0) || (nextDotAt > stopAt)) nextDotAt = stopAt;
        var key = path.slice(loc, nextDotAt);
        root = (root.get) ? root.get(key) : root[key] ;
        loc = nextDotAt+1; 
      }
      if (loc < stopAt) root = undefined; // hit a dead end. :(
        
    // older method using an array
    } else {

      var loc = 0, max = path.length, key = null;
      while((loc < max) && root) {
        key = path[loc++];
        if (key) root = (root.get) ? root.get(key) : root[key] ;
      }
      if (loc < max) root = undefined ;
    }
    
    return root ;
  },
  
  /**
    This function will restore the few global functions defined by SproutCore
    to their original values.  You can call this method if the globals 
    defined by SproutCore conflict with another library you are using.  The
    current global methods restored by this method are:
    
    - $type()
    - $I()
    
    @returns {SC} SproutCore namespace
  */
  noConflict: function() {
    $type = SC._originalGlobals.$type ;
    $I = SC._originalGlobals.$I ;
    $A = SC._originalGlobals.$A ;
  },
  
  /**
    Reads or writes data from a global cache.  This is used throughout the
    framework to avoid creating memory leaks.
    
    To read data, simply pass in the reference element (used as a key) and
    the name of the value to read.  To write, also include the data.
    
    You can also just pass an object to retrieve the entire cache.
    
    @param elem {Object} An object or Element to use as scope
    @param name {String} Optional name of the value to read/write
    @param data {Object} Optional data.  If passed, write.
    @returns {Object} Read or written data.
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
  
});

/** Alias for SC.typeOf() */
SC.$type = SC.typeOf ;
  
// ........................................
// GLOBAL EXPORTS
//   
// These can be restored using SC.restoreGlobals();
var $type, $I, $A ;
SC._originalGlobals = { $type: $type,  $I: $I, $A: $A } ;
$type = SC.typeOf; 
$I = SC.inspect ;
$A = SC.$A ;

// ........................................
// FUNCTION ENHANCEMENTS
//
// Enhance function.
SC.mixin(Function.prototype,
/** @scope Function.prototype */ {
  
  /**
    Indicates that the function should be treated as a computed property.
    
    Computed properties are methods that you want to treat as if they were
    static properties.  When you use get() or set() on a computed property,
    the object will call the property method and return its value instead of 
    returning the method itself.  This makes it easy to create "virtual 
    properties" that are computed dynamically from other properties.
    
    Consider the following example:
    
    {{{
      contact = SC.Object.create({

        firstName: "Charles",
        lastName: "Jolley",
        
        // This is a computed property!
        fullName: function() {
          return this.getEach('firstName','lastName').compact().join(' ') ;
        }.property('firstName', 'lastName'),
        
        // this is not
        getFullName: function() {
          return this.getEach('firstName','lastName').compact().join(' ') ;
        }
      });

      contact.get('firstName') ;
      --> "Charles"
      
      contact.get('fullName') ;
      --> "Charles Jolley"
      
      contact.get('getFullName') ;
      --> function()
    }}}
    
    Note that when you get the fullName property, SproutCore will call the
    fullName() function and return its value whereas when you get() a property
    that contains a regular method (such as getFullName above), then the 
    function itself will be returned instead.
    
    h2. Using Dependent Keys

    Computed properties are often computed dynamically from other member 
    properties.  Whenever those properties change, you need to notify any
    object that is observing the computed property that the computed property
    has changed also.  We call these properties the computed property is based
    upon "dependent keys".
    
    For example, in the contact object above, the fullName property depends on
    the firstName and lastName property.  If either property value changes,
    any observer watching the fullName property will need to be notified as 
    well.
    
    You inform SproutCore of these dependent keys by passing the key names
    as parameters to the property() function.  Whenever the value of any key
    you name here changes, the computed property will be marked as changed
    also.
    
    You should always register dependent keys for computed properties to 
    ensure they update.
    
    h2. Using Computed Properties as Setters
    
    Computed properties can be used to modify the state of an object as well
    as to return a value.  Unlike many other key-value system, you use the 
    same method to both get and set values on a computed property.  To 
    write a setter, simply declare two extra parameters: key and value.
    
    Whenever your property function is called as a setter, the value 
    parameter will be set.  Whenever your property is called as a getter the
    value parameter will be undefined.
    
    For example, the following object will split any full name that you set
    into a first name and last name components and save them.
    
    {{{
      contact = SC.Object.create({
        
        fullName: function(key, value) {
          if (value !== undefined) {
            var parts = value.split(' ') ;
            this.beginPropertyChanges()
              .set('firstName', parts[0])
              .set('lastName', parts[1])
            .endPropertyChanges() ;
          }
          return this.getEach('firstName', 'lastName').compact().join(' ');
        }.property('firstName','lastName')
        
      }) ;
      
    }}}
    
    bq. *Why Use The Same Method for Getters and Setters?*  Most property-
    based frameworks expect you to write two methods for each property but
    SproutCore only uses one.  We do this because most of the time when
    you write a setter is is basically a getter plus some extra work.  There 
    is little added benefit in writing both methods when you can conditionally
    exclude part of it.  This helps to keep your code more compact and easier
    to maintain.
    
    @param dependentKeys {String...} optional set of dependent keys
    @returns {Function} the declared function instance
  */
  property: function() {
    this.dependentKeys = SC.$A(arguments) ; 
    this.isProperty = true; return this; 
  },
  
  /**  
    Declare that a function should observe an object at the named path.  Note
    that the path is used only to construct the observation one time.
  */
  observes: function(propertyPaths) { 
    this.propertyPaths = SC.$A(arguments); 
    return this;
  },
  
  typeConverter: function() {
    this.isTypeConverter = true; return this ;
  },
  
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
      f = f.bind.apply(f, args) ;
    }
    return SC.Timer.schedule({ target: target, action: f, interval: interval });
  }    
  
}) ;
