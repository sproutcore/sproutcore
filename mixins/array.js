// ==========================================================================
// SproutCore -- JavaScript Application Framework
// copyright 2006-2008, Sprout Systems, Inc. and contributors.
// ==========================================================================

require('mixins/enumerable') ;

SC.OUT_OF_RANGE_EXCEPTION = "Index out of range" ;

/**
  @namespace
  
  This module implements Observer-friendly Array-like behavior.  This mixin is 
  picked up by the Array class as well as other controllers, etc. that want to  
  appear to be arrays.
  
  Unlike SC.Enumerable, this mixin defines methods specifically for 
  collections that provide index-ordered access to their contents.  When you
  are designing code that needs to accept any kind of Array-like object, you
  should use these methods instead of Array primitives because these will 
  properly notify observers of changes to the array. 
  
  Although these methods are efficient, they do add a layer of indirection to
  your application so it is a good idea to use them only when you need the 
  flexibility of using both true JavaScript arrays and "virtual" arrays such
  as controllers and collections.
  
  You can use the methods defined in this module to access and modify array 
  contents in a KVO-friendly way.  You can also be notified whenever the 
  membership if an array changes by observing the "[]" property.

  To support SC.Array in your own class, you must override two
  primitives to use it: replace() and objectAt().  

  Note that the SC.Array mixin also incorporates the SC.Enumerable mixin.  All
  SC.Array-like objects are also enumerable.

  @extends SC.Enumerable
  @since SproutCore 0.9.0
*/
SC.Array = {

/**
  @field {Number} length
  
  Your array must support the length property.  your replace methods should
  set this property whenever it changes.
*/
  // length: 0,
  
/**
  This is one of the primitves you must implement to support SC.Array.  You 
  should replace amt objects started at idx with the objects in the passed 
  array.  You should also call this.enumerableContentDidChange() ;
  
  @param {Number} idx 
    Starting index in the array to replace.  If idx >= length, then append to 
    the end of the array.

  @param {Number} amt 
    Number of elements that should be removed from the array, starting at 
    *idx*.

  @param {Array} objects 
    An array of zero or more objects that should be inserted into the array at 
    *idx* 
*/
  replace: function(idx, amt, objects) {
    throw "replace() must be implemented to support SC.Array" ;
  },

/**
  This is one of the primitives you must implement to support SC.Array.  
  Returns the object at the named index.  If your object supports retrieving 
  the value of an array item using get() (i.e. myArray.get(0)), then you do
  not need to implement this method yourself.
  
  @param {Number} idx
    The index of the item to return.  If idx exceeds the current length, 
    return null.
*/
  objectAt: function(idx)
  {
    if (idx < 0) return undefined ;
    if (idx >= this.get('length')) return undefined;
    return this.get(idx);
  },
  
  /**
    @field []

    This is the handler for the special array content property.  If you get
    this property, it will return this.  If you set this property it a new 
    array, it will replace the current content.
    
    This property overrides the default property defined in SC.Enumerable.
  */
  '[]': function(key, value) {
    if (value !== undefined) {
      this.replace(0, this.get('length'), value) ;
    }  
    return this ;
  }.property(),
  
/**  
  This will use the primitive replace() method to insert an object at the 
  specified index.
  
  @param {Number} idx index of insert the object at.
  @param {Object} object object to insert
*/
  insertAt: function(idx, object) {
    if (idx > this.get('length')) throw SC.OUT_OF_RANGE_EXCEPTION ;
    this.replace(idx,0,[object]) ;
    return this ;
  },
  
  /**
    Remove an object at the specified index using the replace() primitive method.
  
    @param {Number} idx index of object to remove
  */
  removeAt: function(idx) {
    if ((idx < 0) || (idx >= this.get('length'))) throw SC.OUT_OF_RANGE_EXCEPTION;
    var ret = this.objectAt(idx) ;
    this.replace(idx,1,[]);
    return ret ;
  },
  
  /**
    Search the array of this object, removing any occurrences of it.
    @param {object} obj object to remove
  */
  removeObject: function(obj) {
    var loc = this.get('length') || 0;
    while(--loc >= 0) {
      var curObject = this.objectAt(loc) ;
      if (curObject == obj) this.removeAt(loc) ;
    }
    return this ;
  },
  
  /**
    Push the object onto the end of the array.  Works just like push() but it 
    is KVO-compliant.
  */
  pushObject: function(obj) {
    this.insertAt(this.get('length'), obj) ;
    return obj ;
  },
  
  /**
    Pop object from array or nil if none are left.  Works just like pop() but 
    it is KVO-compliant.
  */
  popObject: function() {
    var len = this.get('length') ;
    if (len == 0) return null ;
    
    var ret = this.objectAt(len-1) ;
    this.removeAt(len-1) ;
    return ret ;
  },
  
  /**
    Shift an object from start of array or nil if none are left.  Works just 
    like shift() but it is KVO-compliant.
  */
  shiftObject: function() {
    if (this.get('length') == 0) return null ;
    var ret = this.objectAt(0) ;
    this.removeAt(0) ;
    return ret ;
  },
  
  /**
    Unshift an object to start of array.  Works just like unshift() but it is 
    KVO-compliant.
  */
  unshiftObject: function(obj) {
    this.insertAt(0, obj) ;
    return obj ;
  },
  
  /**  
    Compares each item in the array.  Returns true if they are equal.
  */
  isEqual: function(ary) {
    if (!ary) return false ;
    if (ary == this) return true;
    
    var loc = ary.get('length') ;
    if (loc != this.get('length')) return false ;

    while(--loc >= 0) {
      if (!SC.isEqual(ary.objectAt(loc), this.objectAt(loc))) return false ;
    }
    return true ;
  }
    
} ;

// Add SC.Array to the built-in array before we add SC.Enumerable to SC.Array
// since built-in Array's are already enumerable.
SC.mixin(Array.prototype, SC.Array) ; 
SC.Array = SC.mixin({}, SC.Enumerable, SC.Array) ;

// Add any extra methods to SC.Array that are native to the built-in Array.
/**
  Returns a new array that is a slice of the receiver.  This implementation
  uses the observable array methods to retrieve the objects for the new 
  slice.
  
  @param beginIndex {Integer} (Optional) index to begin slicing from.     
  @param endIndex {Integer} (Optional) index to end the slice at.
  @returns {Array} New array with specified slice
*/
SC.Array.slice = function(beginIndex, endIndex) {
  var ret = []; 
  var length = this.get('length') ;
  if (beginIndex == null) beginIndex = 0 ;
  if ((endIndex == null) || (endIndex > length)) endIndex = length ;
  while(beginIndex < endIndex) ret[ret.length] = this.objectAt(beginIndex++) ;
  return ret ;
}  ;


// ......................................................
// ARRAY SUPPORT
//
// Implement the same enhancements on Array.  We use specialized methods
// because working with arrays are so common.
(function() {
  SC.mixin(Array.prototype, {

    // primitive for array support.
    replace: function(idx, amt, objects) {
      if (!objects || objects.length == 0) {
        this.splice(idx, amt) ;
      } else {
        var args = [idx, amt].concat(objects) ;
        this.splice.apply(this,args) ;
      }
      this.enumerableContentDidChange() ;
      return this ;
    },
  
    // If you ask for an unknown property, then try to collect the value
    // from member items.
    unknownProperty: function(key, value) {
      var ret = this.reducedProperty(key, value) ;
      if (ret === undefined) {
        ret = (value === undefined) ? this.invoke('get', key) : null ;
      }
      return ret ;
    }
    
  }) ;
  
})() ;

// Returns the passed item as an array.  If the item is already an array,
// it is returned as is.  If it is not an array, it is placed into one.  If
// it is null, an empty array is returned.
Array.from = SC.$A ;
