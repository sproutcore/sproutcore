// ==========================================================================
// SproutCore -- JavaScript Application Framework
// copyright 2006-2008, Sprout Systems, Inc. and contributors.
// ==========================================================================

require('mixins/array') ;

/**
  @class An unordered collection for keeping objects.
  
  A Set works a bit like an array except that its items are not ordered.  
  You can create a set to efficiently test for membership for an object.

  You can iterate through a set just like an array, even accessing objects
  by index, however there is no gaurantee as to their order.
  
  @extends SC.Object
  @since  SproutCore.10
*/
SC.Set = SC.Object.extend(SC.Array, 
/** @scope SC.Set.prototype */ {
    
  /**
    This property will change as the number of objects in the set changes.

    @type number
  */
  length: 0,
  
  /**
    Call this method to test for membership.
  */
  contains: function(obj) {
    
    // because of the way a set is "reset", the guid for an object may 
    // still be stored as a key, but points to an index that is beyond the
    // length.  Therefore the found idx must both be defined and less than
    // the current length.
    if (obj === null) return NO ;
    var idx = this[SC.guidFor(obj)] ;
    return ((idx != null) && (idx < this.length)) ;
  },
  
  /**
    Call this method to add an object. performs a basic add.
    
    If the object is already in the set it will not be added again.
    
    @param obj {Object} the object to add
    @returns {Object} the receiver
  */
  add: function(obj) {
    if (obj == null) return this; // cannot add null to a set.
    
    var guid = SC.guidFor(obj) ;
    if (this[guid] == null) {
      var len = this.length ;
      this[len] = obj ;
      this[SC.guidFor(obj)] = len ;
      this.set('length', len+1) ;
    }
    this.arrayContentDidChange() ;
    return this ;
  },
  
  /**
    Removes the object from the set if it is found.
    
    If the object is not in the set, nothing will be changed.
    
    @param obj {Object} the object to remove
    @returns {Boolean} YES if the object was removed.
  */  
  remove: function(obj) {
    
    // if no obj param is passed, remove the last item in the array...
    if ((obj === undefined) && this.length>0) obj = this[this.length-1];
     
    if (obj == null) return this ;
    var guid = SC.guidFor(obj);
    var idx = this[guid] ;
    var len = this.length;
    
    if ((idx == null) || (idx >= len)) return this; // not in set.

    // clear the guid key
    delete this[guid] ;
    
    // to clear the index, we will swap the object stored in the last index.
    // if this is the last object, just reduce the length.
    if (idx < (len-1)) {
      var obj = this[idx] = this[len-1];
      this[SC.guidFor(obj)] = idx ;
    }
    
    // reduce the length
    this.set('length', len-1) ;
    this.arrayContentDidChange() ;
    return this ;
  },
  
  // .......................................
  // PRIVATE 
  _each: function(iterator) {
    var len = this.get('length') ;
    for(var idx=0;idx<len;idx++) iterator(this[idx]) ;
  }
  
}) ;

SC.Set.prototype.push = SC.Set.prototype.unshift = SC.Set.prototype.add;
SC.Set.prototype.pop = SC.Set.prototype.shift = SC.Set.prototype.remove;

SC.Set._create = SC.Set.create ;

/**
  To create a set, pass an array of items instead of a hash.
*/
SC.Set.create = function(items) {
  if (!items) items = [] ;
  var hash = {}, loc = items.length ;
  while(--loc >= 0) {
    var item = items[loc];
    if (item == null) continue ;
    hash[SC.guidFor(item)] = item ;
  }
  hash.length = items.length ;
  return SC.Set._create(hash) ;
} ;