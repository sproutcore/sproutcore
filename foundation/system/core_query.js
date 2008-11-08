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

  // implement core methods here from jQuery that we want available all the
  // time.  Use this area to implement jQuery-compatible methods ONLY.
  // New methods should be added at the bottom of the file, where they will
  // be installed as plugins on CoreQuery or jQuery. 
  CoreQuery.fn = CoreQuery.protoype = /** @scope SC.CoreQuery.prototype */ {

    /** 
      Take an array of elements and push it onto the stack (making it the
      new matched set.)  The receiver will be saved so it can be popped later.
    */
    pushStack: function( elems ) {
      // Build a new jQuery matched element set
      var ret = CoreQuery(elems);

      // Add the old object onto the stack (as a reference)
      ret.prevObject = this;

      // Return the newly-formed element set
      return ret;
    },
    
    
    /** 
      Executes the passed function on every element in the CoreQuery object.
      Returns an array with the return values.  Note that null values will
      be omitted from the resulting set.  This differs from SC.Enumerable and
      the JavaScript standard. 
      
      The callback must have the signature:
      
      {{{
        function(currentElement, currentIndex) { return mappedValue; }
      }}}
      
      Note that "this" on the function will also be the currentElement.
      
      @param {Function} callback
      @returns {CoreQuery} results
    */
  	map: function( callback ) {
  		return this.pushStack( CoreQuery.map(this, function(elem, i){
  			return callback.call( elem, i, elem );
  		}));
  	}

  } ;
  
  // add useful helper methods to CoreQuery
  SC.mixin(CoreQuery, /** @scope SC.CoreQuery */ {
    
    nodeName: function( elem, name ) {
      return elem.nodeName && elem.nodeName.toUpperCase() == name.toUpperCase();
    },
    
    /**
      Execute the passed callback on the elems array, returning an array with
      the mapped values.  Note that null return values are left out of the
      resulting mapping array.  This differs from the standard map() function
      defined by SC.Enumerable and the JavaScript standard.
      
      The callback must have the signature:
      
      {{{
        function(currentElement, currentIndex) { return mappedValue; }
      }}}
      
      Note that "this" on the function will also be the currentElement.
      
      @param {Array} elems
      @param {Function} callback
      @returns {Array} mapped elements
    */
  	map: function( elems, callback ) {
  		var ret = [];

  		// Go through the array, translating each of the items to their
  		// new value (or values).
  		for ( var i = 0, length = elems.length; i < length; i++ ) {
  			var value = callback( elems[ i ], i );

  			if ( value != null )
  				ret[ ret.length ] = value;
  		}
  		
  		return ret ;
  	}
    
        
  }) ;
  
  return CoreQuery ;
}()) ;

// Install CoreQuery or jQuery, depending on what is available, as SC.$().
SC.$ = (typeof jQuery == "undefined") ? SC.CoreQuery : jQuery ;

// Add some plugins to CoreQuery.  If jQuery is installed, it will get these
// also.
SC.mixin(SC.$.fn, /** @scope SC.CoreQuery.prototype */ {
  
  /** 
    Attempts to find the views managing the passed DOM elements and returns
    them.
  */
  view: function() {
    return this.map(function() { 
      var guid = this[SC.guidKey] ;
      return (guid) ? SC.View.views[guid] : null ;  
    });
  }
});



