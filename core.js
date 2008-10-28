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
  arguments passed.  This can also perform a deep copy if the first param
  is a bool that is YES.  This is generally not very safe though and not
  advised.

  @param deep {Boolean} optional parameter.  If true, triggers a deep copy.
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
  var deep = NO ;
  var options ;

  // Handle case where we have only one item...extend SC
  if (length === 1) {
    target = this || {};
    idx=0;
  
  // Handle a deep copy situation
  } else if ((target===YES) || (target===NO)) {
    deep = target;
    target = arguments[1] || {};
    idx = 2; // skip the boolean and the target
  }

  // Handle case when target is a string or something (possible in deep 
  // copy)
  if ( typeof target != "object" && typeof target != "function" ) {
    target = {};
  }

  // extend SC itself if only one argument is passed
  if ( length === idx ) {
    target = this;
    idx = idx-1;
  }

  for ( ; idx < length; idx++ ) {
    if (!(options = arguments[idx])) continue ;
    for(var key in options) {
      if (!options.hasOwnProperty(key)) continue ;
      
      var src = target[key];
      var copy = options[key] ;
      if (target===copy) continue ; // prevent never-ending loop
      
      // Recurse if we're merging object values
      if ( deep && copy && (typeof copy === "object") && !copy.nodeType ) {
        copy = SC.extend(deep, 
          src || (copy.length != null ? [ ] : { }), copy) ;
      }
      
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
    case T_ARRAY:
      if (object.clone && SC.typeOf(object.clone) === SC.T_FUNCTION) {
        ret = object.clone() ;
      } else ret = object.slice() ;
      break ;
    
    case T_HASH:
    case T_OBJECT:
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
      if (SC.typeOf(func) === T_FUNCTION) {
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
    if (item === undefined) return T_UNDEFINED ;
    if (item === null) return T_NULL ; 
    var ret = typeof(item) ;
    if (ret == "object") {
      if (item instanceof Array) {
        ret = T_ARRAY ;
      } else if (item instanceof Function) {
        ret = (item.isClass) ? T_CLASS : T_FUNCTION ;
        
      // NB: typeOf() may be called before SC.Error has had a chance to load
      // so this code checks for the presence of SC.Error first just to make
      // sure.  No error instance can exist before the class loads anyway so
      // this is safe.
      } else if (SC.Error && (item instanceof SC.Error)) {
        ret = T_ERROR ;        
      } else if (item.isObject === true) {
        ret = T_OBJECT ;
      } else ret = T_HASH ;
    } else if (ret === T_FUNCTION) ret = (item.isClass) ? T_CLASS : T_FUNCTION;
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
  isArray: function( obj )
  {
    return ($type(obj) === T_ARRAY) || (obj && ((obj.length!==undefined) || obj.objectAt));
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
    if (obj.length===undefined || $type(obj) === SC.T_FUNCTION) return [obj];

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
    
    @param obj {Object} any object, string, number or primitive
    @returns {String} the unique guid for this instance.
  */
  guidFor: function(obj) {
    if (obj === undefined) return "(undefined)" ;
    if (obj === null) return '(null)' ;
    if (obj._guid) return obj._guid ;
    
    switch($type(obj)) {
      case T_NUMBER:
        return this._numberGuids[obj] = this._numberGuids[obj] || ("#" + obj);
        break ;
      case T_STRING:
        return this._stringGuids[obj] = this._stringGuids[obj] || ("$" + obj);
        break ;
      case T_BOOL:
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
    return (obj && obj.hash && $type(obj.hash) === T_FUNCTION) ? obj.hash() : this.guidFor(obj) ;
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

  /**
    Convenience method to inspect an object by converting it to a hash.
  */
  inspect: function(obj) {
    return $H(obj).inspect() ;  
  },
  
  /** Browser and Platform info. */
  Platform: {
    
    /** The current IE version number or 0 if not IE. */
    IE: function() {
      if (Prototype.Browser.IE) {
        return (navigator.appVersion.match(/\bMSIE.*7\.\b/)) ? 7 : 6 ;
      } else return 0 ;
    }(),
    
    /** The current Safari major version number of 0 if not Safari */
    Safari: function() {
      if (Prototype.Browser.WebKit) {
        var vers = parseInt(navigator.appVersion.replace(/^.*?AppleWebKit\/(\d+).*?$/,'$1'),0) ;
        return (vers > 420) ? 3 : 2 ;
      } return 0 ;
    }(),
    
    /** The current Firefox major version number or 0 if not Firefox */
    Firefox: function() {
      var ret = 0;
      if (Prototype.Browser.Gecko) {
        if(navigator.userAgent.indexOf("Firefox") != -1)
        {
          ret = parseFloat((navigator.userAgent.match(/Firefox\/(.)/)[1]) || 0);
        }
        if (ret < 1) ret = 2; // default to version 2 if it is a Gecko browser.
      } 
      return ret ;
    }(),    
      
    isWindows: function() {
      return !!(navigator.appVersion.match(/(Windows)/)) ;
    }(),
    
    isMac: function() {
      if(Prototype.Browser.Gecko) {
        return !!(navigator.appVersion.match(/(Macintosh)/));
      } else {
        return !!(navigator.appVersion.match(/(Mac OS X)/)) ;    
      }
    }()
    
  },
  
  // DEPRECATED.  here for compatibility only.
  /** @private */
  isIE: function() { 
    return SC.Platform.IE > 0 ;
  },

  /** @private */
  isSafari: function() {
    return SC.Platform.Safari > 0 ;
  },
  
  /** @private */
  isSafari3: function() {
    return SC.Platform.Safari >= 3 ;
  },
  
  /** @private */
  isIE7: function() {
    return SC.Platform.IE >= 7 ;
  },

  /** @private */
  isIE6: function() {
    return (SC.Platform.IE >= 6) && (SC.Platform.IE < 7) ;
  },

  /** @private */
  isWindows: function() {
    return SC.Platform.isWindows;
  },

  /** @private */
  isMacOSX: function() {
    return SC.Platform.isMac ;
  },
  
  /** @private */
  isFireFox: function() {
    return SC.Platform.Firefox > 0 ;
  },
  
  /** @private */
  isFireFox2: function() {
    return SC.Platform.Firefox >= 2 ;
  }
  
});

/** Alias for SC.typeOf() */
SC.$type = SC.typeOf ;
  
/** @deprecated  Use guidFor() instead. */
SC.getGUID = SC.guidFor ;

// Save the Platform.Browser name.
SC.Platform.Browser = function() {
  if (SC.Platform.IE >0) {
    return 'IE';
  } else if (SC.Platform.Safari > 0) {
    return 'Safari';
  } else if (SC.Platform.Firefox >0) {
    return 'Firefox'; 
  }
}() ;

// Export the type variables into the global space.
var T_ERROR = SC.T_ERROR ;
var T_OBJECT = SC.T_OBJECT ;
var T_NULL = SC.T_NULL ;
var T_CLASS = SC.T_CLASS ;
var T_HASH = SC.T_HASH ;
var T_FUNCTION = SC.T_FUNCTION ;
var T_UNDEFINED = SC.T_UNDEFINED ;
var T_NUMBER = SC.T_NUMBER ;
var T_BOOL = SC.T_BOOL ;
var T_ARRAY = SC.T_ARRAY ;
var T_STRING = SC.T_STRING ;


// ........................................
// GLOBAL EXPORTS
//   
// Global exports will be made optional in the future so you can avoid 
// polluting the global namespace.

$type = SC.typeOf ;
$I = SC.inspect ;

// Legacy.  Will retire.
SC.mixin(Object,{

  // this will serialize a general JSON object into a URI.
  serialize: function(obj) {
    var ret = [] ;
    for(var key in obj) {
      var value = obj[key] ;
      if (typeof value == 'number') { value = '' + value ; }
      if (!(typeof value == 'string')) { value = value.join(','); }
      ret.push(encodeURIComponent(key) + "=" + encodeURIComponent(value)) ;
    }
    return ret.join('&') ;
  }
  
}) ;


// This will add or remove the class name based on the flag, allowing you to
// treat it like a bool setting.  Simplifies the common case where you need
// to make a class name match a bool.
Element.setClassName = function(element,className,flag) {
  if(SC.isIE())
  {
    if (flag) { 
      Element.addClassName(element,className); 
    } else {
      Element.removeClassName(element,className) ;
    }
  } 
  else
  {
    if (flag) { 
      element.addClassName(className); 
    } else {
      element.removeClassName(className) ;
    }
  } 
} ;

// ........................................
// EVENT EXTENSIONS
// 
Object.extend(Event,{
  // get the character code for key pressed events.
  getCharCode: function(e) {
    return (e.keyCode) ? e.keyCode : ((e.which)?e.which:0) ; 
  },
  
  // get the pressed char as a string.
  getCharString: function(e) {
    return String.fromCharCode(Event.getCharCode(e)) ;
  },
  
  pointerLocation: function(event) {
    var ret = {
      x: event.pageX || (event.clientX +
        (document.documentElement.scrollLeft || document.body.scrollLeft)),
      y: event.pageY || (event.clientY +
        (document.documentElement.scrollTop || document.body.scrollTop))
      
    };
    return ret ;
  },
  
  ALT_KEY: '_ALT',
  CTRL_KEY: '_CTRL',
  SHIFT_KEY: '_SHIFT'
  
});

