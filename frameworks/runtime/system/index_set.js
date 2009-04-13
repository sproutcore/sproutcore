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

  An IndexSet stores indices on the object.  A positive value great than the
  index tells you the end of an occupied range.  A negative values tells you
  the end of an empty range.  A value less than the index is a search 
  accelerator.  It tells you the start of the nearest range.

  @extends Object
  @extends SC.Enumerable 
  @extends SC.Observable
  @since SproutCore 1.0
*/
SC.IndexSet = SC.mixin({}, SC.Enumerable, SC.Observable,
/** @scope SC.IndexSet.prototype */ {

  /**
    To create a set, pass an array of items instead of a hash.
  */
  create: function(ranges) { 
    var ret = SC.beget(this);
    ret.initObservable();
    if (ranges && ranges.isIndexSet) {
      ret._content = ret._content.slice();
    } else {
      ret._content = [0];
      if (ranges) ret.addEach(ranges);
    }
    return ret ;
  },

  isIndexSet: YES,
  
  HINT_SIZE: 256,
  
  /**
    Total number of indexes contained in the set

    @type number
  */
  length: 0,

  /** 
    Returns the starting index of the nearest range for the specified 
    index.
    
    @param {Number} index
    @returns {Number} starting index
  */
  rangeStartForIndex: function(index) {    
    var content = this._content,
        ret, next, accel;
    
    // fast cases
    if (index >= this._last) return this._last ;
    if (Math.abs(content[index]) > index) return index ; // we hit a border
    
    // use accelerator to find nearest content range
    accel = index - (index % SC.IndexSet.HINT_SIZE);
    ret = content[accel];
    if (ret<0 || ret>index) ret = accel;
    next = Math.abs(content[ret]);

    // now step forward through ranges until we find one that includes the
    // index.
    while (next < index) {
      ret = next ;
      next = Math.abs(content[ret]);
    }
    return ret ;
  },
    
  /**
    Returns YES if the index set contains the named index
    
    @param {Number} start index or range
    @param {Number} length optional range length
    @returns {Boolean}
  */
  contains: function(start, length) {
    var content, cur, next, rstart, rnext;
    
    // normalize input
    if (length === undefined) { 
      if (typeof start === SC.T_NUMBER) {
        length = 1 ;
        
      // if passed an index set, check each receiver range
      } else if (start && start.isIndexSet) {
        content = start._content ;
        cur = 0 ;
        next = content[cur];
        while (next !== 0) {
          if ((next>0) && !this.contains(cur, next-cur)) return NO ;
          cur = Math.abs(next);
          next = content[cur];
        }
        return YES ;
        
      } else {
        length = start.length; 
        start = start.start;
      }
    }
    
    rstart = this.rangeStartForIndex(start);
    rnext  = this._content[rstart];
    
    return (rnext>0) && (rstart <= start) && (rnext >= (start+length));
  },
  
  /**
    Adds the specified range of indexes to the set.  You can also pass another
    IndexSet to union the contents of the index set with the receiver.
    
    @param {Number} start index, Range, or another IndexSet
    @param {Number} length optional length of range. 
    @returns {SC.IndexSet} receiver
  */
  add: function(start, length) {
    
    // normalize input
    if (length === undefined) { 
      if (typeof start === SC.T_NUMBER) {
        length = 1 ;
        
      // if passed an index set, just add each range in the index set.
      } else if (start && start.isIndexSet) {
        start.forEachRange(this.add, this);
        return this;
        
      } else {
        length = start.length; 
        start = start.start;
      }
    }

    // special case - appending to end of set
    var last    = this._last,
        content = this._content,
        cur, next, delta, value ;
        
    if (start >= last) {
      content[last] = 0-start; // empty!
      content[start] = start+length ;
      content[start+length] = 0; // set end
      this._last = start + length ;
      this.set('length', this.length + length) ;
      
      // affected range goes from starting range to end of content.
      start = last ;
      length = this._last - start;
      
    // otherwise, merge into existing range
    } else {

      // find nearest starting range.  split or join that range
      cur   = this.rangeStartForIndex(start);
      next  = content[cur];
      last  = start + length ;
      delta = 0 ;
      
      // previous range is not in set.  splice it here
      if (next < 0) { 
        content[cur] = 0-start ;
        
        // if previous range extends beyond this range, splice afterwards also
        if (Math.abs(next) > last) {
          content[start] = 0-last;
          content[last] = next ;
        } else content[start] = next;
        
      // previous range is in set.  merge the ranges
      } else {
        start = cur ;
        if (next > last) {
          delta -= next - last ;
          last = next ;
        }
      }
      
      // at this point there should be clean starting point for the range.
      // just walk the ranges, adding up the length delta and then removing
      // the range until we find a range that passes last
      cur = start;
      while (cur < last) {
        // get next boundary.  splice if needed - if value is 0, we are at end
        // just skip to last
        value = content[cur];
        if (value === 0) {
          content[last] = 0;
          next = last ;
          delta += last - cur ;
        } else {
          next  = Math.abs(value);
          if (next > last) {
            content[last] = value ;
            next = last ;
          }

          // ok, cur range is entirely inside top range.  
          // add to delta if needed
          if (value < 0) delta += next - cur ;
        }

        delete content[cur] ; // and remove range
        cur = next;
      }
      
      // cur should always === last now.  if the following range is in set,
      // merge in also - don't adjust delta because these aren't new indexes
      if ((cur = content[last]) > 0) {
        delete content[last];     
        last = cur ;
      }

      // finally set my own range.
      content[start] = last ;
      if (last > this._last) this._last = last ;

      // adjust length
      this.set('length', this.length + delta);
      
      // compute hint range
      length = last - start ;
    }
    
    this._hint(start, length);
    if (delta !== 0) this.enumerableContentDidChange();
    return this;
  },

  /**
    Removes the specified range of indexes from the set
    
    @param {Number} start index or Range
    @param {Number} length optional length of range. 
    @returns {SC.IndexSet} receiver
  */
  remove: function(start, length) {
    
    // normalize input
    if (length === undefined) { 
      if (typeof start === SC.T_NUMBER) {
        length = 1 ;
      } else {
        length = start.length; 
        start = start.start;
      }
    }

    // special case - appending to end of set
    var last    = this._last,
        content = this._content,
        cur, next, delta, value ;

    // if we're past the end, do nothing.
    if (start >= last) return this;

    // find nearest starting range.  split or join that range
    cur   = this.rangeStartForIndex(start);
    next  = content[cur];
    last  = start + length ;
    delta = 0 ;
    
    // previous range is in set.  splice it here
    if (next > 0) { 
      content[cur] = start ;
      
      // if previous range extends beyond this range, splice afterwards also
      if (next > last) {
        content[start] = last;
        content[last] = next ;
      } else content[start] = next;
      
    // previous range is not in set.  merge the ranges
    } else {
      start = cur ;
      next  = Math.abs(next);
      if (next > last) {
        delta -= next - last ;
        last = next ;
      }
    }
    
    // at this point there should be clean starting point for the range.
    // just walk the ranges, adding up the length delta and then removing
    // the range until we find a range that passes last
    cur = start;
    while (cur < last) {
      // get next boundary.  splice if needed - if value is 0, we are at end
      // just skip to last
      value = content[cur];
      if (value === 0) {
        content[last] = 0;
        next = last ;

      } else {
        next  = Math.abs(value);
        if (next > last) {
          content[last] = value ;
          next = last ;
        }

        // ok, cur range is entirely inside top range.  
        // add to delta if needed
        if (value > 0) delta += next - cur ;
      }

      delete content[cur] ; // and remove range
      cur = next;
    }
    
    // cur should always === last now.  if the following range is not in set,
    // merge in also - don't adjust delta because these aren't new indexes
    if ((cur = content[last]) < 0) {
      delete content[last];     
      last = Math.abs(cur) ;
    }

    // finally set my own range.
    content[start] = 0-last ;
    if (last > this._last) this._last = last ;

    // adjust length
    this.set('length', this.length - delta);
    
    // compute hint range
    length = last - start ;
    
    this._hint(start, length);
    if (delta !== 0) this.enumerableContentDidChange();
    return this;
  },
    
  /** @private 
    iterates through a named range, setting hints every HINT_SIZE indexes 
    pointing to the nearest range start.  The passed range must start on a
    range boundary.  It can end anywhere.
  */
  _hint: function(start, length) {
    var content = this._content,
        skip    = SC.IndexSet.HINT_SIZE,
        next    = Math.abs(content[start]), // start of next range
        loc     = start - (start % skip) + skip, // next hint loc
        lim     = start + length ; // max
        
    while (loc < lim) {
      // make sure we are in current rnage
      while (next <= loc) {
        start = next ; 
        next  = Math.abs(content[start]) ;
      }
      
      // do not change if on actual boundary
      if (loc !== start) content[loc] = start ; 
      loc += skip;
    }
  },

  /**
    Clears the set 
  */
  clear: function() {
    var oldlen = this.length;
    this._content.length=1;
    this._content[0] = 0;
    this.set('length', 0);
    if (oldlen > 0) this.enumerableContentDidChange();
  },
  
  /**
    Add all the ranges in the passed array.
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
    Removes all the ranges in the passed array.
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
    return SC.IndexSet.create(this);    
  },
  
  /**
    Returns a string describing the internal range structure.  Useful for
    debugging.
    
    @returns {String}
  */
  inspect: function() {
    var content = this._content,
        len     = content.length,
        idx     = 0,
        ret     = [],
        item;
    
    for(idx=0;idx<len;idx++) {
      item = content[idx];
      if (item !== undefined) ret.push("%@:%@".fmt(idx,item));      
    }
    return "SC.IndexSet<%@>".fmt(ret.join(' , '));
  },
  
  /** 
    Invoke the callback, passing each occuppied range instead of each 
    index.  This can be a more efficient way to iterate in some cases.  The
    callback should have the signature:
    
    {{{
      callback(start, length, indexSet) { ... }
    }}}
    
    If you pass a target as a second option, the callback will be called in
    the target context.
    
    @param {Function} callback the iterator callback
    @param {Object} target the target
    @returns {SC.IndexSet} receiver
  */
  forEachRange: function(callback, target) {
    var content = this._content,
        cur     = 0,
        next    = content[cur];

    if (target === undefined) target = null ;
    while (next !== 0) {
      if (next > 0) callback.call(target, cur, next - cur, this);
      cur  = Math.abs(next);
      next = content[cur];
    }
    
    return this ;
  },
  
  // .......................................
  // PRIVATE 
  //

  /** @private - optimized call to forEach() */
  forEach: function(callback, target) {
    var content = this._content,
        cur     = 0,
        idx     = 0,
        next    = content[cur];

    if (target === undefined) target = null ;
    while (next !== 0) {
      while(cur < next) { callback.call(target, cur++, idx++, this); }
      cur  = Math.abs(next);
      next = content[cur];
    }
    return this ;
  },
  
  /** @private - support iterators */
  nextObject: function(ignore, idx, context) {
    var content = this._content,
        next    = context.next; // next boundary
    
    // seed.
    if (idx === null) {
      idx = next = 0 ;

    } else if (idx >= this._last) {
      return null ; // nothing left to do

    } else idx++; // look on next index
    
    // look for next non-empty range if needed.
    if (idx === next) {
      do { 
        idx = Math.abs(next);
        next = content[idx];
      } while(next < 0);
      context.next = next;
    }
    
    return idx;
  },
  
  toString: function() {
    var str = [];
    this.forEachRange(function(start, length) {
      str.push(length === 1 ? start : "%@..%@".fmt(start, start + length - 1));
    }, this);
    return "SC.IndexSet<%@>".fmt(str.join(',')) ;
  },
  
  _last: 0

}) ;

SC.IndexSet.slice = SC.IndexSet.clone ;
