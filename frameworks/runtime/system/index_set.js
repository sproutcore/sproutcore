// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

require('mixins/enumerable') ;
require('mixins/observable') ;

/**
  @class 

  A collection of ranges.  You can use an IndexSet to keep track of non-
  continuous ranges of items in a parent array.  IndexSet's are used for 
  selection, for managing invalidation ranges and other data-propogation.

  h2. Examples
  
  {{{
    var set = SC.IndexSet.create(ranges) ;
    set.contains(index);
    set.add(index, length);
    set.remove(index, length);
    
    // uses a backing SC.Array object to return each index
    set.forEach(function(object) { .. })
    
    // returns the index
    set.forEachIndex(function(index) { ... });
    
    // returns ranges
    set.forEachRange(function(start, length) { .. });
  }}}

  h2. Implementation Notes

  IndexSet has two arrays.  One array contains range information.  The other
  contains hints for every 1024 indexes telling us where the range starts.

  @extends Object
  @extends SC.Enumerable 
  @extends SC.Observable
  @since SproutCore 1.0
*/
SC.IndexSet = function(ranges) {
  this.initObservable();
  this._indexes = [] ; // need array
  this._hints = null ;
  this._start   = 0 ;
  if (ranges && ranges.get('length') > 0) ranges.forEach(this.addRange, this);
  return this ;
} ;

SC.IndexSet.prototype = {

  /**
    Total number of indexes contained in the set

    @type number
  */
  length: 0,

  /**
    Clears the set 
  */
  clear: function() { this.length = 0; },

  /**
    Given an index, returns the starting index of the range that contains 
    the index.
  */
  rangeStartForIndex: function(index) {
    var hints   = this._hints,
        indexes = this._indexes, 
        start;  
            
    // determine the nearest starting point 
  },
  
  /**
    Quicky determine if the specified index is part of the set.
  */
  contains: function(index) {
    
  },

  /**
    Call this method to add an object. performs a basic add.

    If the object is already in the set it will not be added again.

    @param {Number} start the starting index
    @param {Number} length optional length. defaults to 1
    @returns {SC.IndexSet} receiver
  */
  add: function(start, length) {
    if (length === 0) return this ; // nothing to do
    if (!length) length = 1; // assume default

    
    return this ;
  },

  /**
    Add all the items in the passed array.
  */
  addEach: function(objects) {
    var idx = objects.get('length') ;
    if (objects.objectAt) {
      while(--idx >= 0) this.add(objects.objectAt(idx)) ;
    } else {
      while(--idx >= 0) this.add(objects[idx]) ;
    }
    return this ;
  },  

  /**
    Removes the object from the set if it is found.

    If the object is not in the set, nothing will be changed.

    @param obj {Object} the object to remove
    @returns {this} this
  */  
  remove: function(obj) {

    if (SC.none(obj)) return this ;
    var guid = SC.hashFor(obj);
    var idx = this[guid] ;
    var len = this.length;

    if (SC.none(idx) || (idx >= len)) return this; // not in set.

    // clear the guid key
    delete this[guid] ;

    // to clear the index, we will swap the object stored in the last index.
    // if this is the last object, just reduce the length.
    if (idx < (len-1)) {
      obj = this[idx] = this[len-1];
      this[SC.hashFor(obj)] = idx ;
    }

    // reduce the length
    this.length = len-1;
    return this ;
  },

  /**
    Removes an arbitrary object from the set and returns it.

    @returns {Object} an object from the set or null
  */
  pop: function() {
    var obj = (this.length > 0) ? this[this.length-1] : null ;
    if (obj) this.remove(obj) ;
    return obj ;
  },

  /**
    Removes all the items in the passed array.
  */
  removeEach: function(objects) {
    var idx = objects.get('length') ;
    if (objects.objectAt) {
      while(--idx >= 0) this.remove(objects.objectAt(idx)) ;
    } else {
      while(--idx >= 0) this.remove(objects[idx]) ;
    }
    return this ;
  },  

  /**
   Clones the set into a new set.  
  */
  clone: function() {
    return SC.Set.create(this);    
  },

  // .......................................
  // PRIVATE 
  //
  _each: function(iterator) {
    var len = this.length ;
    for(var idx=0;idx<len;idx++) iterator(this[idx]) ;
  },

  toString: function() {
    return "SC.Set<%@>".fmt(SC.$A(this)) ;
  }  

} ;

SC.Set.prototype.slice = SC.Set.prototype.clone ;

// Make this enumerable and observable
SC.mixin(SC.Set.prototype, SC.Enumerable, SC.Observable) ;

SC.Set.prototype.push = SC.Set.prototype.unshift = SC.Set.prototype.add ;
SC.Set.prototype.shift = SC.Set.prototype.pop ;


/**
  To create a set, pass an array of items instead of a hash.
*/
SC.IndexSet.create = function(items) { return new SC.IndexSet(items); };
