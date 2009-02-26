// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================


/**
  A RangeObserver is used by Arrays to automatically observe all of the
  objects in a particular range on the array.  Whenever any property on one 
  of those objects changes, it will notify its delegate.  Likewise, whenever
  the contents of the array itself changes, it will notify its delegate and
  possibly update its own registration.

  This implementation uses only SC.Array methods.  It can be used on any 
  object that complies with SC.Array.  You may, however, choose to subclass
  this object in a way that is more optimized for your particular design.
*/
SC.RangeObserver = {
  
  create: function(source, start, length, target, method) {
    var ret = SC.beget(this);
    ret.source = source;
    ret.start  = start;
    ret.length = length;
    ret.target = target;
    ret.method = method;
    ret.observing = [];
    
    this.beginObserving();
    return ret ;
  },
  
  extend: function(attrs) {
    var ret = SC.beget(this), args = arguments, len = args.length, idx;
    for(idx=0;idx<len;idx++) SC.mixin(ret, args[idx]);
    return ret ;
  },
  
  destroy: function(source) { this.endObserving(); return this; },
  
  update: function(source, start, length) {
    this.start = start;
    this.length = length;
    this.rangeDidChange();
    return this;
  },
  
  /**
    Configures observing for each item in the current range.  Should update
    the observing array with the list of observed objects so they can be
    torn down later
  */
  beginObserving: function() {
    var observing = this.observing, idx = this.start, source = this.source;
    var lim = idx + this.length, meth = this.objectPropertyDidChange, obj;
    for(;idx<lim;idx++) {
      obj = source.objectAt(idx);
      if (obj && obj.addObserver) {
        observing.push(obj);
        obj.addObserver('*', this, meth);
      }
    }
    return this;
  },
  
  /**
    Remove observers for any objects currently begin observed.  This is 
    called whenever the observed range changes due to an array change or 
    due to destroying the observer.
  */
  endObserving: function() {
    var idx, observing = this.observing, meth = this.objectPropertyDidChange;
    var lim = observing.length, source = this.source;
    for(idx=0;idx<lim;idx++) {
      observing[idx].removeObserver('*', this, meth);
    }
    return this ;
  },
  
  /**
    Whenever the actual objects in the range changes, notify the delegate
    then begin observing again.
  */
  rangeDidChange: function() {
    this.endObserving(); // remove old observers
    this.method.call(this.target, this.source, null, '[]');
    this.beginObserving(); // setup new ones
  },

  /**
    Whenever an object changes, notify the delegate
  */
  objectPropertyDidChange: function(object, key) {
    this.method.call(this.target, this.source, object, key);
  }
  
};
