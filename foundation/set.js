// ==========================================================================
// SproutCore -- JavaScript Application Framework
// copyright 2006-2008, Sprout Systems, Inc. and contributors.
// ==========================================================================

require('mixins/array') ;

/**
  @class An unordered collection for keeping objects.
  
  A Set works a bit like an array except that its items are not ordered.  
  You can create a set to efficiently test for membership for an object.

  @extends SC.Object

*/
SC.Set = SC.Object.extend(SC.Array, 
  /** @scope SC.Set.prototype */
  {
  
/**
    This property will change as the number of objects in the set changes.

    @type number
*/
  length: 0,
  
  /**
    Changes each time an object is updated or removed. Observe this to be notified of changes to the set.
  
    @type number
  */
  revision: 0,
  
  /**
    Call this method to test for membership.
  */
  contains: function(obj) {
    if (obj == null) return false ;
    return [this._guidFor(obj)] == obj ;
  },
  
  /**
    Call this method to add an object. performs a basic add.
  */
  add: function(obj) {
    if (obj == null) return; // cannot add null to a set.
    this[this._guidFor(obj)] = obj ;
    this.incrementProperty('length') ;
    this.incrementProperty('revision') ;
  },
  
  /**
    Performs a basic remove
  */  
  remove: function(obj) {
    if (obj == null) return ;
    delete this[this._guidFor(obj)] ; 
    this.decrementProperty('length') ;
    this.incrementProperty('revision') ;
  },
  
  // .......................................
  // PRIVATE 
  _guidFor: function(obj) {
    return '@' + SC.getGUID(obj);
  },
  
  _each: function(iterator) {
    for (var key in this) {
      if (!this.hasOwnProperty(key)) continue ;
      if (key.match(/^@/)) iterator(this[key]) ;
    }
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
    hash[SC.Set.prototype._guidFor(item)] = item ;
  }
  hash.length = items.length ;
  return SC.Set._create(hash) ;
} ;