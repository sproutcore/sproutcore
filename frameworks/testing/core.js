// ==========================================================================
// Project:   SproutCore Unit Testing Library
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
/*globals CoreTest */

// these compiler directives are normally defined in runtime's core.  But
// since the testing framework needs to be totally independent, we redefine
// them here also.
var require = require || function sc_require() {};
var sc_require = sc_require || require;
var sc_resource = sc_resource || function sc_resource() {};

/** @namespace

  CoreTest is the unit testing library for SproutCore.  It includes a test 
  runner based on QUnit with some useful extensions for testing SproutCore-
  based applications.
  
  You can use CoreTest just like you would use QUnit in your tests directory.
*/
CoreTest = {
  
  /** 
    Empty function.  Useful for some operations. 
  */
  K: function() { return this; },

  /**
    Copied from SproutCore Runtime Core.  Included here to avoid dependencies.

    @param obj {Object} the object to beget
    @returns {Object} the new object.
  */
  beget: function(obj) {
    if (!obj) return null ;
    var K = CoreTest.K; K.prototype = obj ;
    var ret = new K();
    K.prototype = null ; // avoid leaks
    return ret ;
  },
  
  /**
    Copied from SproutCore Runtime Core.  Included here to avoid dependencies.

    @param target {Object} the target object to extend
    @param properties {Object} one or more objects with properties to copy.
    @returns {Object} the target object.
    @static
  */
  mixin: function() {
    // copy reference to target object
    var target = arguments[0] || {};
    var idx = 1;
    var length = arguments.length ;
    var options ;

    // Handle case where we have only one item...extend CoreTest
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
  },
  
  
  /** Borrowed from SproutCore Runtime Core */
  fmt: function(str) {
    // first, replace any ORDERED replacements.
    var args = arguments;
    var idx  = 1; // the current index for non-numerical replacements
    return str.replace(/%@([0-9]+)?/g, function(s, argIndex) {
      argIndex = (argIndex) ? parseInt(argIndex,0) : idx++ ;
      s =args[argIndex];
      return ((s===null) ? '(null)' : (s===undefined) ? '' : s).toString(); 
    }) ;
  },
  
  /** Test is OK */
  OK: 'passed',
  
  /** Test failed */
  FAIL: 'failed',
  
  /** Test raised exception */
  ERROR: 'errors',
  
  /** Test raised warning */
  WARN: 'warnings',
  
  showUI : false
  
  
  
};
