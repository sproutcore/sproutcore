// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/*global NodeList */

// These commands are used by the build tools to control load order.  On the
// client side these are a no-op.
var require = require || function require() { } ;
var sc_require = sc_require || require;
var sc_resource = sc_resource || function sc_resource() {};

sc_require('license') ;

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
  window.console = {} ;
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
      var copy = options[key] ;
      if (target===copy) continue ; // prevent never-ending loop
      if (copy !== undefined) target[key] = copy ;
    }
  }
  
  return target;
} ;

/**
  Adds properties to a target object.  Unlike SC.mixin, however, if the target
  already has a value for a property, it will not be overwritten.
  
  Takes the root object and adds the attributes for any additional 
  arguments passed.

  @param target {Object} the target object to extend
  @param properties {Object} one or more objects with properties to copy.
  @returns {Object} the target object.
  @static
*/
SC.supplement = function() {
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
      var src = target[key] ;
      var copy = options[key] ;
      if (target===copy) continue ; // prevent never-ending loop
      if (copy !== undefined  &&  src === undefined) target[key] = copy ;
    }
  }
  
  return target;
} ;

/** 
  Alternative to mixin.  Provided for compatibility with jQuery.
  @function 
*/
SC.extend = SC.mixin ;

// ..........................................................
// CORE FUNCTIONS
// 
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
  // TYPING & ARRAY MESSAGING
  //   

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
        ret = item.isClass ? SC.T_CLASS : SC.T_FUNCTION ;

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
    Returns YES if the passed value is null or undefined.  This avoids errors
    from JSLint complaining about use of ==, which can be technically 
    confusing.
    
    @param {Object} obj value to test
    @returns {Boolean}
  */
  none: function(obj) {
    return obj===null || obj===undefined;  
  },

  /**
    Verifies that a value is either null or an empty string.  Return false if
    the object is not a string.
    
    @param {Object} obj value to test
    @returns {Boolean}
  */
  empty: function(obj) {
    return obj===null || obj===undefined || obj==='';
  },
  
  /**
    Returns YES if the passed object is an array or array-like. Instances
    of the NodeList class return NO.

    Unlike SC.typeOf this method returns true even if the passed object is 
    not formally array but appears to be array-like (i.e. has a length 
    property, responds to .objectAt, etc.)

    @param obj {Object} the object to test
    @returns {Boolean} 
  */
  isArray: function(obj) {
    if (obj && obj.objectAt) return YES ; // fast path

    var len = (obj ? obj.length : null), type = SC.typeOf(obj);
    return !(SC.none(len) || (type === SC.T_FUNCTION) || (type === SC.T_STRING) || obj.setInterval) ;
  },

  /**
    Makes an object into an Array if it is not array or array-like already.
    Unlike SC.A(), this method will not clone the object if it is already
    an array.
    
    @param {Object} obj object to convert
    @returns {Array} Actual array
  */
  makeArray: function(obj) {
    return SC.isArray(obj) ? obj : SC.A(obj);
  },
  
  /**
    Converts the passed object to an Array.  If the object appears to be 
    array-like, a new array will be cloned from it.  Otherwise, a new array
    will be created with the item itself as the only item in the array.
    
    @param object {Object} any enumerable or array-like object.
    @returns {Array} Array of items
  */
  A: function(obj) {
    // null or undefined -- fast path
    if (SC.none(obj)) return [] ;
    
    // primitive -- fast path
    if (obj.slice instanceof Function) {
      // do we have a string?
      if (typeof(obj) === 'string') return [obj] ;
      else return obj.slice() ;
    }
    
    // enumerable -- fast path
    if (obj.toArray) return obj.toArray() ;
    
    // if not array-like, then just wrap in array.
    if (!SC.isArray(obj)) return [obj];
    
    // when all else fails, do a manual convert...
    var ret = [], len = obj.length;
    while(--len >= 0) ret[len] = obj[len];
    return ret ;
  },
  
  // ..........................................................
  // GUIDS & HASHES
  // 
  
  guidKey: "_sc_guid_" + new Date().getTime(),

  // Used for guid generation...
  _nextGUID: 0, _numberGuids: [], _stringGuids: {}, _keyCache: {},

  /**
    Returns a unique GUID for the object.  If the object does not yet have
    a guid, one will be assigned to it.  You can call this on any object,
    SC.Object-based or not, but be aware that it will add a _guid property.

    You can also use this method on DOM Element objects.

    @param obj {Object} any object, string, number, Element, or primitive
    @returns {String} the unique guid for this instance.
  */
  guidFor: function(obj) {
    
    // special cases where we don't want to add a key to object
    if (obj === undefined) return "(undefined)" ;
    if (obj === null) return '(null)' ;
    if (obj === Object) return '(Object)';
    if (obj === Array) return '(Array)';
    
    var guidKey = this.guidKey ;
    if (obj[guidKey]) return obj[guidKey] ;

    switch(typeof obj) {
      case SC.T_NUMBER:
        return (this._numberGuids[obj] = this._numberGuids[obj] || ("nu" + obj));
      case SC.T_STRING:
        return (this._stringGuids[obj] = this._stringGuids[obj] || ("st" + obj));
      case SC.T_BOOL:
        return (obj) ? "(true)" : "(false)" ;
      default:
        return SC.generateGuid(obj);
    }
  },

  /**
    Returns a key name that combines the named key + prefix.  This is more 
    efficient than simply combining strings because it uses a cache  
    internally for performance.
    
    @param {String} prefix the prefix to attach to the key
    @param {String} key key
    @returns {String} result 
  */
  keyFor: function(prefix, key) {
    var ret, pcache = this._keyCache[prefix];
    if (!pcache) pcache = this._keyCache[prefix] = {}; // get cache for prefix
    ret = pcache[key];
    if (!ret) ret = pcache[key] = prefix + '_' + key ;
    return ret ;
  },

  /**
    Generates a new guid, optionally saving the guid to the object that you
    pass in.  You will rarely need to use this method.  Instead you should
    call SC.guidFor(obj), which return an existing guid if available.

    @param {Object} obj the object to assign the guid to
    @returns {String} the guid
  */
  generateGuid: function(obj) { 
    var ret = ("sc" + (this._nextGUID++)); 
    if (obj) obj[this.guidKey] = ret ;
    return ret ;
  },

  /**
    Returns a unique hash code for the object.  If the object implements
    a hash() method, the value of that method will be returned.  Otherwise,
    this will return the same value as guidFor().  

    Unlike guidFor(), this method allows you to implement logic in your 
    code to cause two separate instances of the same object to be treated as
    if they were equal for comparisons and other functions.

    IMPORTANT:  If you implement a hash() method, it MUST NOT return a 
    number or a string that contains only a number.  Typically hash codes 
    are strings that begin with a "%".

    @param obj {Object} the object
    @returns {String} the hash code for this instance.
  */
  hashFor: function(obj) {
    return (obj && obj.hash && (typeof obj.hash === SC.T_FUNCTION)) ? obj.hash() : this.guidFor(obj) ;
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
    } else return this.hashFor(a) === this.hashFor(b) ;
  },
  
  
  /**
   This will compare two javascript values of possibly different types.
   It will tell you which one is greater than the other by returning
   -1 if the first is smaller than the second,
    0 if both are equal,
    1 if the first is greater than the second.
  
   The order is calculated based on SC.ORDER_DEFINITION , if types are different.
   In case they have the same type an appropriate comparison for this type is made.

   @param v {Object} first value to compare
   @param w {Object} the second value to compare
   @returns {NUMBER} -1 if v < w, 0 if v = w and 1 if v > w.

  */
  compare: function (v, w) {
    
    var type1 = SC.typeOf(v);
    var type2 = SC.typeOf(w);
    var type1Index = SC.ORDER_DEFINITION.indexOf(type1);
    var type2Index = SC.ORDER_DEFINITION.indexOf(type2);
    
    if (type1Index < type2Index) return -1;
    if (type1Index > type2Index) return 1;
    
    // ok - types are equal - so we have to check values now
    switch (type1) {
      case SC.T_BOOL:
      case SC.T_NUMBER:
        if (v<w) return -1;
        if (v>w) return 1;
        return 0;

      case SC.T_STRING:
        if (v.localeCompare(w)<0) return -1;
        if (v.localeCompare(w)>0) return 1;
        return 0;

      case SC.T_ARRAY:
        var l = Math.min(v.length,w.length);
        var r = 0;
        var i = 0;
        while (r===0 && i < l) {
          r = arguments.callee(v[i],w[i]);
          if ( r !== 0 ) return r;
          i++;
        }
      
        // all elements are equal now
        // shorter array should be ordered first
        if (v.length < w.length) return -1;
        if (v.length > w.length) return 1;
        // arrays are equal now
        return 0;
        
      case SC.T_OBJECT:
        if (v.constructor.isComparable === YES) return v.constructor.compare(v, w);
        return 0;

      default:
        return 0;
    }
  },
  
  // ..........................................................
  // OBJECT MANAGEMENT
  // 
  
  /** 
    Empty function.  Useful for some operations. 
    
    @returns {Object}
  */
  K: function() { return this; },

  /** 
    Empty array.  Useful for some optimizations.
  
    @property {Array}
  */
  EMPTY_ARRAY: [],

  /**
    Empty hash.  Useful for some optimizations.
  
    @property {Hash}
  */
  EMPTY_HASH: {},

  /**
    Empty range. Useful for some optimizations.
    
    @property {Range}
  */
  EMPTY_RANGE: {start: 0, length: 0},
  
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
    if (SC.none(obj)) return null ;
    var K = SC.K; K.prototype = obj ;
    var ret = new K();
    K.prototype = null ; // avoid leaks
    if (SC.typeOf(obj.didBeget) === SC.T_FUNCTION) ret = obj.didBeget(ret); 
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
  copy: function(object) {
    var ret = object ;
    
    // fast path
    if (object && object.isCopyable) return object.copy();
    
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
    Returns a new object combining the values of all passed hashes.

    @param object {Object} one or more objects
    @returns {Object} new Object
  */
  merge: function() {
    var ret = {}, len = arguments.length, idx;
    for(idx=0;idx<len;idx++) SC.mixin(ret, arguments[idx]);
    return ret ;
  },

  /**
    Returns all of the keys defined on an object or hash.  This is useful
    when inspecting objects for debugging.

    @param {Object} obj
    @returns {Array} array of keys
  */
  keys: function(obj) {
    var ret = [];
    for(var key in obj) ret.push(key);
    return ret;
  },

  /**
    Convenience method to inspect an object.  This method will attempt to 
    convert the object into a useful string description.
  */
  inspect: function(obj) {
    var v, ret = [] ;
    for(var key in obj) {
      v = obj[key] ;
      if (v === 'toString') continue ; // ignore useless items
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
    if (SC.typeOf(path) === SC.T_ARRAY) return path ;

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

    var loc, nextDotAt, key, max ;

    if (!root) root = window ;

    // faster method for strings
    if (SC.typeOf(path) === SC.T_STRING) {
      if (stopAt === undefined) stopAt = path.length ;
      loc = 0 ;
      while((root) && (loc < stopAt)) {
        nextDotAt = path.indexOf('.', loc) ;
        if ((nextDotAt < 0) || (nextDotAt > stopAt)) nextDotAt = stopAt;
        key = path.slice(loc, nextDotAt);
        root = root.get ? root.get(key) : root[key] ;
        loc = nextDotAt+1; 
      }
      if (loc < stopAt) root = undefined; // hit a dead end. :(

    // older method using an array
    } else {

      loc = 0; max = path.length; key = null;
      while((loc < max) && root) {
        key = path[loc++];
        if (key) root = (root.get) ? root.get(key) : root[key] ;
      }
      if (loc < max) root = undefined ;
    }

    return root ;
  },
  
  
  // ..........................................................
  // LOCALIZATION SUPPORT
  // 
  
  /**
    Known loc strings
    
    @property {Hash}
  */
  STRINGS: {},
  
  /**
    This is a simplified handler for installing a bunch of strings.  This
    ignores the language name and simply applies the passed strings hash.
    
    @param {String} lang the language the strings are for
    @param {Hash} strings hash of strings
    @returns {SC} receiver
  */
  stringsFor: function(lang, strings) {
    SC.mixin(SC.STRINGS, strings);
    return this ;
  }
  
  
}); // end mixin

/** @private Aliasn for SC.clone() */
SC.clone = SC.copy ;

/** @private Alias for SC.A() */
SC.$A = SC.A;

/** @private Provided for compatibility with old HTML templates. */
SC.didLoad = SC.K ;

/** @private Used by SC.compare */
SC.ORDER_DEFINITION = [ SC.T_ERROR,
                        SC.T_UNDEFINED,
                        SC.T_NULL,
                        SC.T_BOOL,
                        SC.T_NUMBER,
                        SC.T_STRING,
                        SC.T_ARRAY,
                        SC.T_HASH,
                        SC.T_OBJECT,
                        SC.T_FUNCTION,
                        SC.T_CLASS ];


// ........................................
// FUNCTION ENHANCEMENTS
//

SC.mixin(Function.prototype, 
/** @lends Function.prototype */ {
  
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
    
    h2. Why Use The Same Method for Getters and Setters?
    
    Most property-based frameworks expect you to write two methods for each
    property but SproutCore only uses one. We do this because most of the time
    when you write a setter is is basically a getter plus some extra work.
    There is little added benefit in writing both methods when you can
    conditionally exclude part of it. This helps to keep your code more
    compact and easier to maintain.
    
    @param dependentKeys {String...} optional set of dependent keys
    @returns {Function} the declared function instance
  */
  property: function() {
    this.dependentKeys = SC.$A(arguments) ;
    var guid = SC.guidFor(this) ;
    this.cacheKey = "__cache__" + guid ;
    this.lastSetValueKey = "__lastValue__" + guid ;
    this.isProperty = YES ;
    return this ;
  },
  
  /**
    You can call this method on a computed property to indicate that the 
    property is cacheable (or not cacheable).  By default all computed 
    properties are not cached.  Enabling this feature will allow SproutCore
    to cache the return value of your computed property and to use that
    value until one of your dependent properties changes or until you 
    invoke propertyDidChange() and name the computed property itself.
    
    If you do not specify this option, computed properties are assumed to be
    not cacheable.
    
    @param {Boolean} aFlag optionally indicate cacheable or no, default YES
    @returns {Function} reciever
  */
  cacheable: function(aFlag) {
    this.isProperty = YES ;  // also make a property just in case
    if (!this.dependentKeys) this.dependentKeys = [] ;
    this.isCacheable = (aFlag === undefined) ? YES : aFlag ;
    return this ;
  },
  
  /**
    Indicates that the computed property is volatile.  Normally SproutCore 
    assumes that your computed property is idempotent.  That is, calling 
    set() on your property more than once with the same value has the same
    effect as calling it only once.  
    
    All non-computed properties are idempotent and normally you should make
    your computed properties behave the same way.  However, if you need to
    make your property change its return value everytime your method is
    called, you may chain this to your property to make it volatile.
    
    If you do not specify this option, properties are assumed to be 
    non-volatile. 
    
    @param {Boolean} aFlag optionally indicate state, default to YES
    @returns {Function} receiver
  */
  idempotent: function(aFlag) {
    this.isProperty = YES;  // also make a property just in case
    if (!this.dependentKeys) this.dependentKeys = [] ;
    this.isVolatile = (aFlag === undefined) ? YES : aFlag ;
    return this ;
  },
  
  /**
    Declare that a function should observe an object at the named path.  Note
    that the path is used only to construct the observation one time.
    
    @returns {Function} receiver
  */
  observes: function(propertyPaths) { 
    // sort property paths into local paths (i.e just a property name) and
    // full paths (i.e. those with a . or * in them)
    var loc = arguments.length, local = null, paths = null ;
    while(--loc >= 0) {
      var path = arguments[loc] ;
      // local
      if ((path.indexOf('.')<0) && (path.indexOf('*')<0)) {
        if (!local) local = this.localPropertyPaths = [] ;
        local.push(path);
        
      // regular
      } else {
        if (!paths) paths = this.propertyPaths = [] ;
        paths.push(path) ;
      }
    }
    return this ;
  }
  
});

// ..........................................................
// STRING ENHANCEMENT
// 

// Interpolate string. looks for %@ or %@1; to control the order of params.
/**
  Apply formatting options to the string.  This will look for occurrences
  of %@ in your string and substitute them with the arguments you pass into
  this method.  If you want to control the specific order of replacement, 
  you can add a number after the key as well to indicate which argument 
  you want to insert.  

  Ordered insertions are most useful when building loc strings where values
  you need to insert may appear in different orders.

  h3. Examples
  
  {{{
    "Hello %@ %@".fmt('John', 'Doe') => "Hello John Doe"
    "Hello %@2, %@1".fmt('John', 'Doe') => "Hello Doe, John"
  }}}
  
  @param args {Object...} optional arguments
  @returns {String} formatted string
*/
String.prototype.fmt = function() {
  // first, replace any ORDERED replacements.
  var args = arguments;
  var idx  = 0; // the current index for non-numerical replacements
  return this.replace(/%@([0-9]+)?/g, function(s, argIndex) {
    argIndex = (argIndex) ? parseInt(argIndex,0)-1 : idx++ ;
    s =args[argIndex];
    return ((s===null) ? '(null)' : (s===undefined) ? '' : s).toString(); 
  }) ;
};

/**
  Localizes the string.  This will look up the reciever string as a key 
  in the current Strings hash.  If the key matches, the loc'd value will be
  used.  The resulting string will also be passed through fmt() to insert
  any variables.
  
  @param args {Object...} optional arguments to interpolate also
  @returns {String} the localized and formatted string.
*/
String.prototype.loc = function() {
  var str = SC.STRINGS[this] || this;
  return str.fmt.apply(str,arguments) ;
};


  
/**
  Splits the string into words, separated by spaces. Empty strings are
  removed from the results.
  
  @returns {Array} an array of non-empty strings
*/
String.prototype.w = function() { 
  var ary = [], ary2 = this.split(' '), len = ary2.length ;
  for (var idx=0; idx<len; ++idx) {
    var str = ary2[idx] ;
    if (str.length !== 0) ary.push(str) ; // skip empty strings
  }
  return ary ;
};


