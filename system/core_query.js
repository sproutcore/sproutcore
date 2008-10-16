// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('core');

/**
  CoreQuery is a simplified DOM manipulation library used internally by 
  SproutCore to find and edit DOM elements.  Outside of SproutCore, you 
  should generally use a more full-featured DOM library such as Prototype
  or jQuery.
  
  CoreQuery itself is a subset of jQuery with some additional plugins.  If
  you have jQuery already loaded when SproutCore loads, in fact, it will 
  replace CoreQuery with the full jQuery library and install CoreQuery
  plugins.
  
  Much of this code is adapted from jQuery 1.2.6, which is available under an
  MIT license just like SproutCore.

  @class
*/
SC.CoreQuery = (function() {
  // Define CoreQuery inside of its own scope to support some jQuery idioms.
  
  var CoreQuery = function( selector, context ) {
    // The CoreQuery object is actually just the init constructor 'enhanced'
    return new SC.CoreQuery.fn.init( selector, context );
  };

  // A simple way to check for HTML strings or ID strings
  // (both of which we optimize for)
  var quickExpr = /^[^<]*(<(.|\s)+>)[^>]*$|^#([\w-]+)$/,
  // Is it a simple selector
  isSimple = /^.[^:#\[\.]*$/,
  undefined ;

  CoreQuery.fn = CoreQuery.protoype = /** @scope SC.CoreQuery.prototype */ {
    
  } ;
  
  // add useful helper methods to CoreQuery
  SC.mixin(SC.CoreQuery, /** @scope SC.CoreQuery */ {
    
    nodeName: function( elem, name ) {
      return elem.nodeName && elem.nodeName.toUpperCase() == name.toUpperCase();
    }
        
  }) ;
  
  return CoreQuery ;
}()) ;

// Install CoreQuery or jQuery, depending on what is available, as SC.$().
SC.$ = (typeof jQuery == "undefined") ? SC.CoreQuery : jQuery ;
