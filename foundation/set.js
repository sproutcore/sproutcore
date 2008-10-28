// ==========================================================================
// SproutCore -- JavaScript Application Framework
// copyright 2006-2008, Sprout Systems, Inc. and contributors.
// ==========================================================================

require('mixins/enumerable') ;
require('mixins/observable') ;

/**
  @class 
  
  An unordered collection of objects.
  
  A Set works a bit like an array except that its items are not ordered.  
  You can create a set to efficiently test for membership for an object. You 
  can also iterate through a set just like an array, even accessing objects
  by index, however there is no gaurantee as to their order.
  
  Note that SC.Set is a primitive object, like an array.  It does implement
  limited key-value observing support but it does not extend from SC.Object
  so you should not subclass it.
  
  h1. Creating a Set
  
  You can create a set like you would most objects using SC.Set.create() or
  new SC.Set().  Most new sets you create will be empty, but you can also
  initialize the set with some content by passing an array or other enumerable
  of objects to the constructor.
  
  Finally, you can pass in an existing set and the set will be copied.  You
  can also create a copy of a set by calling SC.Set#clone().
  
  {{{
    // creates a new empty set
    var foundNames = SC.Set.create();
    
    // creates a set with four names in it.
    var names = SC.Set.create(["Charles", "Peter", "Chris", "Erich"]) ;

    // creates a copy of the names set.
    var namesCopy = SC.Set.create(names);
    
    // same as above.
    var anotherNamesCopy = names.clone();
  }}}
  
  h1. Adding/Removing Objects
  
  You generally add or removed objects from a set using add() or remove().
  You can add any type of object including primitives such as numbers,
  strings, and booleans.
  
  Note that objects can only exist one time in a set.  If you call add() on
  a set with the same object multiple times, the object will only be added 
  once.  Likewise, calling remove() with the same object multiple times will
  remove the object the first time and have no effect on future calls until 
  you add the object to the set again.
  
  Note that you cannot add/remove null or undefined to a set.  Any attempt to
  do so will be ignored.  
  
  In addition to add/remove you can also call push()/pop().  Push behaves just
  like add() but pop(), unlike remove() will pick an arbitrary object, remove
  it and return it.  This is a good way to use a set as a job queue when you
  don't care which order the jobs are executed in.
  
  h1. Testing for an Object
  
  To test for an object's presence in a set you simply call SC.Set#contains().
  This method tests for the object's hash, which is generally the same as the
  object's _guid but if you implement the hash() method on the object, it will
  use the return value from that method instead.
  
  @extends Object
  @extends SC.Enumerable 
  @since SproutCore 0.9.15
*/
SC.Set = function(items) {
  if (items && items.length > 0) {
    var idx = (items.get) ? items.get('length') : items.length ;
    if (items.objectAt) {
      while(--idx >= 0) this.add(items.objectAt(idx)) ;
    } else {
      while(--idx >= 0) this.add(items[idx]) ;
    }
  }
  return this ;
} ;

SC.Set.prototype = {
    
  /**
    This property will change as the number of objects in the set changes.

    @type number
  */
  length: 0,
  
  /**
    Clears the set 
  */
  clear: function() { this.length = 0; },
  
  /**
    Call this method to test for membership.
  */
  contains: function(obj) {
    
    // because of the way a set is "reset", the guid for an object may 
    // still be stored as a key, but points to an index that is beyond the
    // length.  Therefore the found idx must both be defined and less than
    // the current length.
    if (obj === null) return NO ;
    var idx = this[SC.hashFor(obj)] ;
    return ((idx != null) && (idx < this.length)) ;
  },
  
  /**
    Call this method to add an object. performs a basic add.
    
    If the object is already in the set it will not be added again.
    
    @param obj {Object} the object to add
    @returns {Object} this
  */
  add: function(obj) {
    if (obj == null) return this; // cannot add null to a set.
    
    var guid = SC.hashFor(obj) ;
    var idx = this[guid] ;
    var len = this.length ;
    if ((idx == null) || (idx >= len)) {
      this[len] = obj ;
      this[guid] = len ;
      this.length = len+1;
    }
    return this ;
  },
  
  /**
    Add all the items in the passed array.
  */
  addEach: function(objects) {
    var idx = objects.length ;
    while(--idx >= 0) this.add(objects[idx]) ;
  },  
  
  /**
    Removes the object from the set if it is found.
    
    If the object is not in the set, nothing will be changed.
    
    @param obj {Object} the object to remove
    @returns {this} this
  */  
  remove: function(obj) {
    
    if (obj == null) return this ;
    var guid = SC.hashFor(obj);
    var idx = this[guid] ;
    var len = this.length;
    
    if ((idx == null) || (idx >= len)) return this; // not in set.

    // clear the guid key
    delete this[guid] ;
    
    // to clear the index, we will swap the object stored in the last index.
    // if this is the last object, just reduce the length.
    if (idx < (len-1)) {
      var obj = this[idx] = this[len-1];
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
    var idx = objects.length ;
    while(--idx >= 0) this.remove(objects[idx]) ;
  },  

  // .......................................
  // PRIVATE 
  _each: function(iterator) {
    var len = this.length ;
    for(var idx=0;idx<len;idx++) iterator(this[idx]) ;
  },
  
  toString: function() {
    return "SC.Set<%@>".fmt(SC.SC.$A(this)) ;
  }
  
} ;

// Make this enumerable and observable
SC.mixin(SC.Set.prototype, SC.Enumerable, SC.Observable) ;

SC.Set.prototype.push = SC.Set.prototype.unshift = SC.Set.prototype.add ;
SC.Set.prototype.shift = SC.Set.prototype.pop ;


/**
  To create a set, pass an array of items instead of a hash.
*/
SC.Set.create = function(items) { return new SC.Set(items); };
