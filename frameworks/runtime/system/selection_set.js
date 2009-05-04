// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

sc_require('system/object');
sc_require('mixins/enumerable');

/** @class

  A SelectionSet is a set of objects refrenced by index against source 
  objects.  You can use a SelectionSet to keep track of items selected in 
  multiple source arrays.
  
  @extends SC.Object
  @extends SC.Enumerable
  @since SproutCore 1.0
*/
SC.SelectionSet = SC.Object.extend(SC.Enumerable, {
  
  isSelectionSet: YES,
  
  /**
    Total number of indexes in the selection set
    
    @property
    @type Number
  */
  length: 0,

  /**
    A set of all the source objects used in the selection set.  This 
    property changes automatically as you add or remove index sets.
    
    @property
    @type SC.Array
  */
  sources: function() {
    var ret  = [],
        sets = this._sets,
        len  = sets ? sets.length : 0,
        idx, set, source;
        
    for(idx=0;idx<len;idx++) {
      set = sets[idx];
      if (set && set.get('length')>0 && set.source) ret.push(set.source);
    }
    return ret ;
  }.property().cacheable(),
  
  /**
    Returns the index set for the passed source object.  If no index set 
    exists, one will be created unless canCreate is set to NO.
    
    @param {SC.Array} source the source object
    @param {Boolean} canCreate optional
    @returns {SC.IndexSet} index set or null
  */
  indexSetForSource: function(source, canCreate) {
    if (canCreate === undefined) canCreate = YES;

    var guid  = SC.guidFor(source),
        index = this[guid],
        sets  = this._sets,
        len   = sets ? sets.length : 0,
        ret   = null;
                
    if (index >= len) index = null;
    if (SC.none(index)) {
      if (canCreate) {
        if (!sets) sets = this._sets = [];
        ret = sets[len] = SC.IndexSet.create();
        ret.source = source ;
        this[guid] = len;
      }
      
    } else ret = sets ? sets[index] : null;
    return ret ;
  },
  
  /**
    Add the passed index, range of indexSet belonging to the passed source
    object to the selection set.
    
    The first parameter you pass must be the source array you are selecting
    from.  The following parameters may be one of a start/length pair, a 
    single index, a range object or an IndexSet.  If some or all of the range
    you are selecting is already in the set, it will not be selected again.
    
    You can also pass an SC.SelectionSet to this method and all the selected
    sets will be added from their instead.
    
    @param {SC.Array} source source object. must not be null
    @param {Number} start index, start of range, range or IndexSet
    @param {Number} length length if passing start/length pair.
    @returns {SC.SelectionSet} receiver
  */
  add: function(source, start, length) {
    
    var sets, len, idx, set, oldlen, newlen, setlen;
    
    // normalize
    if (start === undefined && length === undefined) {
      if (!source) throw "Must pass params to SC.SelectionSet.add()";
      if (source.isIndexSet) return this.add(source.source, source);
      if (source.isSelectionSet) {
        sets = source._sets;
        len  = sets ? sets.length : 0;

        this.beginPropertyChanges();
        for(idx=0;idx<len;idx++) {
          set = sets[idx];
          if (set && set.get('length')>0) this.add(set.source, set);
        }
        this.endPropertyChanges();
        return this ;
        
      }
    }

    set    = this.indexSetForSource(source);
    oldlen = this.get('length');
    setlen = set.get('length');
    newlen = oldlen - setlen;
        
    set.add(start, length);

    newlen += set.get('length');
    if (newlen !== oldlen) {
      this.set('length', newlen);
      this.enumerableContentDidChange();
      if (setlen === 0) this.notifyPropertyChange('sources')
    }
    return this ;
  },

  /**
    Removes the passed index, range of indexSet belonging to the passed source
    object from the selection set.
    
    The first parameter you pass must be the source array you are selecting
    from.  The following parameters may be one of a start/length pair, a 
    single index, a range object or an IndexSet.  If some or all of the range
    you are selecting is already in the set, it will not be selected again.
    
    @param {SC.Array} source source object. must not be null
    @param {Number} start index, start of range, range or IndexSet
    @param {Number} length length if passing start/length pair.
    @returns {SC.SelectionSet} receiver
  */
  remove: function(source, start, length) {
    
    var sets, len, idx, set, oldlen, newlen, setlen;
    
    // normalize
    if (start === undefined && length === undefined) {
      if (!source) throw "Must pass params to SC.SelectionSet.remove()";
      if (source.isIndexSet) return this.remove(source.source, source);
      if (source.isSelectionSet) {
        sets = source._sets;
        len  = sets ? sets.length : 0;
            
        this.beginPropertyChanges();
        for(idx=0;idx<len;idx++) {
          set = sets[idx];
          if (set && set.get('length')>0) this.remove(set.source, set);
        }
        this.endPropertyChanges();
        return this ;
      }
    }
    
    set    = this.indexSetForSource(source);
    oldlen = this.get('length');
    newlen = oldlen - set.get('length');
        
    set.remove(start, length);
    setlen = set.get('length');
    newlen += setlen;

    if (newlen !== oldlen) {
      this.set('length', newlen);
      this.enumerableContentDidChange();
      if (setlen === 0) this.notifyPropertyChange('sources')
    }
    return this ;
  },
  
  /**
    Returns YES if the passed index set or selection set contains the exact 
    same source objects and indexes as  the receiver.  If you pass any object 
    other than an IndexSet or SelectionSet, returns NO.
    
    @param {Object} obj another object.
    @returns {Boolean}
  */
  isEqual: function(obj) {
    if (!obj || !obj.isSelectionSet) return NO ;
    
    var my_sets  = this._sets,
        obj_sets = obj._sets,
        my_len   = my_sets ? my_sets.length : 0,
        idx, my_set, obj_set;
    
    if (my_sets === obj_sets) return YES;
    if (!obj_sets || (my_len !== obj_sets.length)) return NO ;
    
    for(idx=0;idx<my_len;idx++) {   
      my_set = my_sets[idx];
      obj_set = obj_set[idx];
      if (my_set || obj_set) {
        if (!my_set || !obj_set || !my_set.isEqual(obj_set)) return NO ;
      }
    }
    return YES ;
  },
  
  /**
    Returns YES if the selection contains the named index, range of indexes.
    
    @param {Object} source source object for range
    @param {Number} start index, start of range, range object, or indexSet
    @param {Number} length optional range length
    @returns {Boolean}
  */
  contains: function(source, start, length) {
    var set = this.indexSetForSource(source, NO);
    if (!set) return NO ;
    return set.contains(start, length);
  },

  /**
    Returns YES if the selection contains the passed object.  This will search
    selected ranges in all source objects.
    
    @param {Object} object the object to search for
    @returns {Boolean}
  */
  containsObject: function(object) {
    var sets = this._sets,
        len  = sets ? sets.length : 0,
        idx, set;
    for(idx=0;idx<len;idx++) {
      set = sets[idx];
      if (set && set.indexOf(object)>=0) return YES;
    }
    return NO ;
  },
  
  /**
    Returns YES if the index set contains any of the passed indexes.  You
    can pass a single index, a range or an index set.
    
    @param {Object} source source object for range
    @param {Number} start index, range, or IndexSet
    @param {Number} length optional range length
    @returns {Boolean}
  */
  intersects: function(source, start, length) {
    var set = this.indexSetForSource(source, NO);
    if (!set) return NO ;
    return set.intersects(start, length);
  },
  
  /**
    Clears the set.  Removes all IndexSets from the object
  */
  clear: function() {
    if (this._sets) this._sets.length = 0 ; // truncate
    this.set('length', 0);
    return this ;
  },
  
  /**
   Clones the set into a new set.  
  */
  clone: function() {
    var ret  = this.constructor.create(),
        sets = this._sets,
        len  = sets ? sets.length : 0 ,
        idx, set;
    
    if (sets && len>0) {
      sets = ret._sets = sets.slice();
      for(idx=0;idx<len;idx++) {
        if (!(set = sets[idx])) continue ;
        set = sets[idx] = set.clone();
        ret[SC.guidFor(set.source)] = idx;
      }
    }
    
    return ret ;
  },
  
  // ..........................................................
  // ITERATORS
  // 
  
  /**
    Implement primitive enumerable support.  Returns each object in the 
    selection.
  */
  nextObject: function(count, lastObject, context) { 

    var sets = this._sets,
        len  = sets ? sets.length : 0,
        loc  = context.sel_loc,
        set  = context.sel_set,
        cnt  = context.sel_cnt,
        last = context.sel_last,
        next = undefined, 
        ret ;
        
    if (len === 0) return undefined; // nothing to do
    
    // reset iteration
    if (count === 0) {
      loc = 0 ;
      set = sets[0] ;
      cnt = 0 ;
      last = null;
    }
    
    // loop forward until we find a set that can return something
    while ((!set || cnt < set.get('length')) && (loc<len)) {
      set = sets[++loc];
      cnt = 0 ;
      last = null ;
    }
    
    // get the next index.  If we have an index, then get the object
    if (set) next = set.nextObject(cnt++, last, context);
    ret = (SC.none(next) || !set.source) ? undefined : set.source.objectAt(next);
    last = next ; // save for later calls
    
    // clear out info if this is the end
    if (count+1 === this.get('length')) {
      loc = set = cnt = last = null ;
    }
    
    // save context info
    context.sel_loc = loc ;
    context.sel_set = set ;
    context.sel_cnt = cnt ;
    context.sel_last = last ;
    
    // done!
    return ret ;
  },
  
  /** 
    Iterates over the selection, invoking your callback with each __object__.
    This will actually find the object referenced by each index in the 
    selection, not just the index.

    The callback must have the following signature:
    
    {{{
      function callback(object, index, source, indexSet) { ... }
    }}}
    
    If you pass a target, it will be used when the callback is called.
    
    @param {Function} callback function to invoke.  
    @param {Object} target optional content. otherwise uses window
    @returns {SC.SelectionSet} receiver
  */
  forEach: function(callback, target) {
    var sets = this._sets,
        len = sets ? sets.length : 0,
        set, idx;
        
    for(idx=0;idx<len;idx++) {
      set = sets[idx];
      if (set) set.forEachObject(callback, target);
    }
    return this ;
  },

  /**
    Iterates over the selection, invoking your callback with each selected
    __index__.  This will not actually get the object referenced by the 
    selection, just the index.
    
    The callback must have the following signature:
    
    {{{
      function callback(index, callbackCount, indexSet, source) { ... }
    }}}

    The callbackCount will indicate the number of times the callback has 
    been invoked for this call.
    
    If you pass a target, it will be used when the callback is called.
    
    @param {Function} callback function to invoke.  
    @param {Object} target optional content. otherwise uses window
    @returns {SC.SelectionSet} receiver
  */
  forEachIndex: function(callback, target) {
    var sets = this._sets,
        len = sets ? sets.length : 0,
        set, idx;
        
    for(idx=0;idx<len;idx++) {
      set = sets[idx];
      if (set) set.forEach(callback, target);
    }
    return this ;
  },
  
  /** 
    Invoke the callback, passing each occuppied source object and range 
    instead of each index.  This can be a more efficient way to iterate in 
    some cases.  The callback should have the signature:
    
    {{{
      callback(start, length, indexSet, source) { ... }
    }}}

    @param {Function} callback the iterator callback
    @param {Object} target the target
    @returns {SC.IndexSet} receiver
  */
  forEachRange: function(callback, target) {
    var sets = this._sets,
        len = sets ? sets.length : 0,
        set, idx;
        
    for(idx=0;idx<len;idx++) {
      set = sets[idx];
      if (set) set.forEachRange(callback, target);
    }
    return this ;
  }
  
  
});