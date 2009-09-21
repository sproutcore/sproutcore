// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

// note: SC.Observable also enhances array.  make sure we are called after
// SC.Observable so our version of unknownProperty wins.
sc_require('mixins/observable');
sc_require('mixins/enumerable');
sc_require('system/range_observer');

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
  membership if an array changes by changing the syntax of the property to
  .observes('*myProperty.[]') .
  
  To support SC.Array in your own class, you must override two
  primitives to use it: replace() and objectAt().  
  
  Note that the SC.Array mixin also incorporates the SC.Enumerable mixin.  All
  SC.Array-like objects are also enumerable.
  
  @extends SC.Enumerable
  @since SproutCore 0.9.0
*/
SC.Array = {
  
  /**
    Walk like a duck - use isSCArray to avoid conflicts
  */
  isSCArray: YES,
  
  /**
    @field {Number} length
    
    Your array must support the length property.  Your replace methods should
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
  objectAt: function(idx) {
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
    Remove an object at the specified index using the replace() primitive 
    method.  You can pass either a single index, a start and a length or an
    index set.
    
    If you pass a single index or a start and length that is beyond the 
    length this method will throw an SC.OUT_OF_RANGE_EXCEPTION
    
    @param {Number|SC.IndexSet} start index, start of range, or index set
    @param {Number} length length of passing range
    @returns {Object} receiver
  */
  removeAt: function(start, length) {
    
    var delta = 0, // used to shift range
        empty = [];
    
    if (typeof start === SC.T_NUMBER) {
      
      if ((start < 0) || (start >= this.get('length'))) {
        throw SC.OUT_OF_RANGE_EXCEPTION;
      }
      
      // fast case
      if (length === undefined) {
        this.replace(start,1,empty);
        return this ;
      } else {
        start = SC.IndexSet.create(start, length);
      }
    }
    
    this.beginPropertyChanges();
    start.forEachRange(function(start, length) {
      start -= delta ;
      delta += length ;
      this.replace(start, length, empty); // remove!
    }, this);
    this.endPropertyChanges();
    
    return this ;
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
    Search the array for the passed set of objects and remove any occurrences
    of the. 
    
    @param {SC.Enumerable} objects the objects to remove
    @returns {SC.Array} receiver
  */
  removeObjects: function(objects) {
    this.beginPropertyChanges();
    objects.forEach(function(obj) { this.removeObject(obj); }, this);
    this.endPropertyChanges();
    return this;
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
    Add the objects in the passed numerable to the end of the array.  Defers
    notifying observers of the change until all objects are added.
    
    @param {SC.Enumerable} objects the objects to add
    @returns {SC.Array} receiver
  */
  pushObjects: function(objects) {
    this.beginPropertyChanges();
    objects.forEach(function(obj) { this.pushObject(obj); }, this);
    this.endPropertyChanges();
    return this;
  },

  /**
    Pop object from array or nil if none are left.  Works just like pop() but 
    it is KVO-compliant.
  */
  popObject: function() {
    var len = this.get('length') ;
    if (len === 0) return null ;
    
    var ret = this.objectAt(len-1) ;
    this.removeAt(len-1) ;
    return ret ;
  },
  
  /**
    Shift an object from start of array or nil if none are left.  Works just 
    like shift() but it is KVO-compliant.
  */
  shiftObject: function() {
    if (this.get('length') === 0) return null ;
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
    Adds the named objects to the beginning of the array.  Defers notifying
    observers until all objects have been added.
    
    @param {SC.Enumerable} objects the objects to add
    @returns {SC.Array} receiver
  */
  unshiftObjects: function(objects) {
    this.beginPropertyChanges();
    objects.forEach(function(obj) { this.unshiftObject(obj); }, this);
    this.endPropertyChanges();
    return this;
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
  },
  
  /**
    Generates a new array with the contents of the old array, sans any null
    values.
    
    @returns {Array}
  */
  compact: function() { return this.without(null); },
  
  /**
    Generates a new array with the contents of the old array, sans the passed
    value.
    
    @param {Object} value
    @returns {Array}
  */
  without: function(value) {
    if (this.indexOf(value)<0) return this; // value not present.
    var ret = [] ;
    this.forEach(function(k) { 
      if (k !== value) ret[ret.length] = k; 
    }) ;
    return ret ;
  },

  /**
    Generates a new array with only unique values from the contents of the
    old array.
    
    @returns {Array}
  */
  uniq: function() {
    var ret = [] ;
    this.forEach(function(k){
      if (ret.indexOf(k)<0) ret[ret.length] = k;
    });
    return ret ;
  },
  
  rangeObserverClass: SC.RangeObserver,
  
  /**
    Creates a new range observer on the receiver.  The target/method callback
    you provide will be invoked anytime any property on the objects in the 
    specified range changes.  It will also be invoked if the objects in the
    range itself changes also.
    
    The callback for a range observer should have the signature:
    
    {{{
      function rangePropertyDidChange(array, objects, key, indexes, conext)
    }}}
    
    If the passed key is '[]' it means that the object itself changed.
    
    The return value from this method is an opaque reference to the 
    range observer object.  You can use this reference to destroy the 
    range observer when you are done with it or to update its range.
    
    @param {SC.IndexSet} indexes indexes to observe
    @param {Object} target object to invoke on change
    @param {String|Function} method the method to invoke
    @param {Object} context optional context
    @returns {SC.RangeObserver} range observer
  */
  addRangeObserver: function(indexes, target, method, context) {
    var rangeob = this._array_rangeObservers;
    if (!rangeob) rangeob = this._array_rangeObservers = SC.CoreSet.create() ;
    
    var C = this.rangeObserverClass ;
    var isDeep = NO; //disable this feature for now
    var ret = C.create(this, indexes, target, method, context, isDeep) ;
    rangeob.add(ret);
    
    // first time a range observer is added, begin observing the [] property
    if (!this._array_isNotifyingRangeObservers) {
      this._array_isNotifyingRangeObservers = YES ;
      this.addObserver('[]', this, this._array_notifyRangeObservers);
    }
    
    return ret ;
  },
  
  /**
    Moves a range observer so that it observes a new range of objects on the 
    array.  You must have an existing range observer object from a call to
    addRangeObserver().
    
    The return value should replace the old range observer object that you
    pass in.
    
    @param {SC.RangeObserver} rangeObserver the range observer
    @param {SC.IndexSet} indexes new indexes to observe
    @returns {SC.RangeObserver} the range observer (or a new one)
  */
  updateRangeObserver: function(rangeObserver, indexes) {
    return rangeObserver.update(this, indexes);
  },

  /**
    Removes a range observer from the receiver.  The range observer must
    already be active on the array.
    
    The return value should replace the old range observer object.  It will
    usually be null.
    
    @param {SC.RangeObserver} rangeObserver the range observer
    @returns {SC.RangeObserver} updated range observer or null
  */
  removeRangeObserver: function(rangeObserver) {
    var ret = rangeObserver.destroy(this);
    var rangeob = this._array_rangeObservers;
    if (rangeob) rangeob.remove(rangeObserver) ; // clear
    return ret ;
  },
  
  /**
    Updates observers with content change.  To support range observers, 
    you must pass three change parameters to this method.  Otherwise this
    method will assume the entire range has changed.
    
    This also assumes you have already updated the length property.
    @param {Number} start the starting index of the change
    @param {Number} amt the final range of objects changed
    @param {Number} delta if you added or removed objects, the delta change
    @returns {SC.Array} receiver
  */
  enumerableContentDidChange: function(start, amt, delta) {
    var rangeob = this._array_rangeObservers, 
        oldlen  = this._array_oldLength,
        newlen, length, changes ;

    this.beginPropertyChanges();    
    this.notifyPropertyChange('length'); // flush caches

    // schedule info for range observers
    if (rangeob && rangeob.length>0) {

      // if no oldLength has been cached, just assume 0
      if (oldlen === undefined) oldlen = 0;    
      this._array_oldLength = newlen = this.get('length');
      
      // normalize input parameters
      // if delta was not passed, assume it is the different between the 
      // new and old length.
      if (start === undefined) start = 0;
      if (delta === undefined) delta = newlen - oldlen ;
      if (delta !== 0 || amt === undefined) {
        length = newlen - start ;
        if (delta<0) length -= delta; // cover removed range as well
      } else {
        length = amt ;
      }
      
      changes = this._array_rangeChanges;
      if (!changes) changes = this._array_rangeChanges = SC.IndexSet.create();
      changes.add(start, length);
    }
    
    this.notifyPropertyChange('[]') ;
    this.endPropertyChanges();
    
    return this ;
  },
  
  /**  @private
    Observer fires whenever the '[]' property changes.  If there are 
    range observers, will notify observers of change.
  */
  _array_notifyRangeObservers: function() {
    var rangeob = this._array_rangeObservers,
        changes = this._array_rangeChanges,
        len     = rangeob ? rangeob.length : 0, 
        idx, cur;
        
    if (len > 0 && changes && changes.length > 0) {
      for(idx=0;idx<len;idx++) rangeob[idx].rangeDidChange(changes);
      changes.clear(); // reset for later notifications
    }
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
  if (SC.none(beginIndex)) beginIndex = 0 ;
  if (SC.none(endIndex) || (endIndex > length)) endIndex = length ;
  while(beginIndex < endIndex) ret[ret.length] = this.objectAt(beginIndex++) ;
  return ret ;
}  ;

/**
  Returns the index for a particular object in the index.
  
  @param {Object} object the item to search for
  @param {NUmber} startAt optional starting location to search, default 0
  @returns {Number} index of -1 if not found
*/
SC.Array.indexOf = function(object, startAt) {
  var idx, len = this.get('length');
  
  if (startAt === undefined) startAt = 0;
  else startAt = (startAt < 0) ? Math.ceil(startAt) : Math.floor(startAt);
  if (startAt < 0) startAt += len;
  
  for(idx=startAt;idx<len;idx++) {
    if (this.objectAt(idx) === object) return idx ;
  }
  return -1;
};

// Some browsers do not support indexOf natively.  Patch if needed
if (!Array.prototype.indexOf) Array.prototype.indexOf = SC.Array.indexOf;

/**
  Returns the last index for a particular object in the index.
  
  @param {Object} object the item to search for
  @param {NUmber} startAt optional starting location to search, default 0
  @returns {Number} index of -1 if not found
*/
SC.Array.lastIndexOf = function(object, startAt) {
  var idx, len = this.get('length');
  
  if (startAt === undefined) startAt = len-1;
  else startAt = (startAt < 0) ? Math.ceil(startAt) : Math.floor(startAt);
  if (startAt < 0) startAt += len;
  
  for(idx=startAt;idx>=0;idx--) {
    if (this.objectAt(idx) === object) return idx ;
  }
  return -1;
};

// Some browsers do not support lastIndexOf natively.  Patch if needed
if (!Array.prototype.lastIndexOf) {
  Array.prototype.lastIndexOf = SC.Array.lastIndexOf;
}

// ......................................................
// ARRAY SUPPORT
//
// Implement the same enhancements on Array.  We use specialized methods
// because working with arrays are so common.
(function() {
  SC.mixin(Array.prototype, {
    
    // primitive for array support.
    replace: function(idx, amt, objects) {
      if (this.isFrozen) throw SC.FROZEN_ERROR ;
      if (!objects || objects.length === 0) {
        this.splice(idx, amt) ;
      } else {
        var args = [idx, amt].concat(objects) ;
        this.splice.apply(this,args) ;
      }
      
      // if we replaced exactly the same number of items, then pass only the
      // replaced range.  Otherwise, pass the full remaining array length 
      // since everything has shifted
      var len = objects ? (objects.get ? objects.get('length') : objects.length) : 0;
      this.enumerableContentDidChange(idx, amt, len - amt) ;
      return this ;
    },
    
    // If you ask for an unknown property, then try to collect the value
    // from member items.
    unknownProperty: function(key, value) {
      var ret = this.reducedProperty(key, value) ;
      if ((value !== undefined) && ret === undefined) {
        ret = this[key] = value;
      }
      return ret ;
    }
    
  });
    
  // If browser did not implement indexOf natively, then override with
  // specialized version
  var indexOf = Array.prototype.indexOf;
  if (!indexOf || (indexOf === SC.Array.indexOf)) {
    Array.prototype.indexOf = function(object, startAt) {
      var idx, len = this.length;
      
      if (startAt === undefined) startAt = 0;
      else startAt = (startAt < 0) ? Math.ceil(startAt) : Math.floor(startAt);
      if (startAt < 0) startAt += len;
      
      for(idx=startAt;idx<len;idx++) {
        if (this[idx] === object) return idx ;
      }
      return -1;
    } ; 
  }
  
  var lastIndexOf = Array.prototype.lastIndexOf ;
  if (!lastIndexOf || (lastIndexOf === SC.Array.lastIndexOf)) {
    Array.prototype.lastIndexOf = function(object, startAt) {
      var idx, len = this.length;
      
      if (startAt === undefined) startAt = len-1;
      else startAt = (startAt < 0) ? Math.ceil(startAt) : Math.floor(startAt);
      if (startAt < 0) startAt += len;
      
      for(idx=startAt;idx>=0;idx--) {
        if (this[idx] === object) return idx ;
      }
      return -1;
    };
  }
  
})();
