// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

require('system/builder') ;

// Alias jQuery as SC.$ and SC.CoreQuery for compatibility
SC.$ = SC.CoreQuery = jQuery ;

// Add some plugins to SC.$. jQuery will get these also. -- test in system/core_query/additions
SC.mixin(SC.$.fn, /** @scope SC.$.prototype */ {
  
  isCoreQuery: YES, // walk like a duck
  
  /** @private - better loggin */
  toString: function() {
    var values = [],
        len = this.length, idx=0;
    for(idx=0;idx<len;idx++) {
      values[idx] = '%@: %@'.fmt(idx, this[idx] ? this[idx].toString() : '(null)');
    }
    return "<$:%@>(%@)".fmt(SC.guidFor(this),values.join(' , '));  
  },
  
  /** 
    Returns YES if all member elements are visible.  This is provided as a
    common test since CoreQuery does not support filtering by 
    psuedo-selector.
  */
  isVisible: function() {
    return Array.prototype.every.call(this, function(elem){
      return SC.$.isVisible(elem);
    });
  },
    
  /** Returns a new CQ object with only the first item in the object. */
  first: function() {
    return this.pushStack([this[0]]);
  },
  
  /** Returns a new CQ object with only the last item in the set. */
  last: function() {
    return this.pushStack([this[this.length-1]]);
  },
  
  /** 
    Attempts to find the views managing the passed DOM elements and returns
    them.   This will start with the matched element and walk up the DOM until
    it finds an element managed by a view.
    
    @returns {Array} array of views or null.
  */
  view: function() {
    return this.map(function() { 
      var ret=null, guidKey = SC.viewKey, dom = this, value;
      while(!ret && dom && (dom !== document)) {
        if (dom.nodeType===1 && (value = dom.getAttribute('id'))) ret = SC.View.views[value] ;
        dom = dom.parentNode;
      }
      dom = null;
      return ret ;
    });
  },
  
  /**
    You can either pass a single class name and a boolean indicating whether
    the value should be added or removed, or you can pass a hash with all
    the class names you want to add or remove with a boolean indicating 
    whether they should be there or not.
    
    This is far more efficient than using addClass/removeClass.
    
    @param {String|Hash} className class name or hash of classNames + bools
    @param {Boolean} shouldAdd for class name if a string was passed
    @returns {SC.CoreQuery} receiver
  */
  setClass: function(className, shouldAdd) {
    if (SC.none(className)) return this; //nothing to do
    var isHash = SC.typeOf(className) !== SC.T_STRING,
        fix = this._fixupClass, key;
    this.each(function() {
      if (this.nodeType !== 1) return; // nothing to do
      
      // collect the class name from the element and build an array
      var classNames = this.className.split(/\s+/), didChange = NO;
      
      // loop through hash or just fix single className
      if (isHash) {
        for(var key in className) {
          if (!className.hasOwnProperty(key)) continue ;
          didChange = fix(classNames, key, className[key]) || didChange;
        } 
      } else didChange = fix(classNames, className, shouldAdd);

      // if classNames were changed, join them and set...
      if (didChange) this.className = classNames.join(' ');
    });
    return this ;
  },

  /** @private used by setClass */
  _fixupClass: function(classNames, name, shouldAdd) {
    var indexOf = classNames.indexOf(name);
    // if should add, add class...
    if (shouldAdd) {
      if (indexOf < 0) { classNames.push(name); return YES ; }
      
    // otherwise, null out class name (this will leave some extra spaces)
    } else if (indexOf >= 0) { classNames[indexOf]=null; return YES; }
    return NO ;
  },
  
  /**
    Returns YES if any of the matched elements have the passed element or CQ object as a child element.
  */
  within: function(el) {
    el = SC.$(el); // make into CQ object
    var ret, elCur, myCur, idx, len = el.length,
        loc = this.length;
    while(!ret && (--loc >= 0)) {
      myCur = this[loc];
      for(idx=0; !ret && (idx<len); idx++) {
        elCur = el[idx];
        while(elCur && (elCur !== myCur)) elCur = elCur.parentNode;
        ret = elCur === myCur ;
      }
    }
    myCur = elCur = null ; // clear memory
    return ret ;
  }
  
});

/** 
  Make CoreQuery enumerable.  Since some methods need to be disambiguated,
  we will implement some wrapper functions here. 
  
  Note that SC.Enumerable is implemented on SC.Builder, which means the
  CoreQuery object inherits this automatically.  jQuery does not extend from
  SC.Builder though, so we reapply SC.Enumerable just to be safe.
*/
(function() {
  var original = {},
      wrappers = {
    
    // if you call find with a selector, then use the jQuery way.  If you 
    // call with a function/target, use Enumerable way
    find: function(callback,target) {
      return (target !== undefined) ? SC.Enumerable.find.call(this, callback, target) : original.find.call(this, callback) ;
    },

    // ditto for filter - execute SC.Enumerable style if a target is passed.
    filter: function(callback,target) {
      return (target !== undefined) ? 
        this.pushStack(SC.Enumerable.filter.call(this, callback, target)) : 
        original.filter.call(this, callback) ;
    },
    
    // filterProperty is an SC.Enumerable thing, but it needs to be wrapped
    // in a CoreQuery object.
    filterProperty: function(key, value) {
      return this.pushStack(
        SC.Enumerable.filterProperty.call(this,key,value));
    },
    
    // indexOf() is best implemented using the jQuery index()
    indexOf: SC.$.index,
    
    // map() is a little tricky because jQuery is non-standard.  If you pass
    // a context object, we will treat it like SC.Enumerable.  Otherwise use
    // jQuery.
    map: function(callback, target) {
      return (target !== undefined) ?  
        SC.Enumerable.map.call(this, callback, target) : 
        original.map.call(this, callback);
    }
  };

  // loop through an update some enumerable methods.
  var fn = SC.$.fn,
      enumerable = SC.Enumerable ,
      value;
  for(var key in enumerable) {
    if (!enumerable.hasOwnProperty(key)) continue ;
    value = enumerable[key];
    if (key in wrappers) {
      original[key] = fn[key]; value = wrappers[key];
    }
    fn[key] = value;
  }
})();

// Add some global helper methods.
SC.mixin(SC.$, {
  
  /** @private helper method to determine if an element is visible.  Exposed
   for use in testing. */
  isVisible: function(elem) {
    var CQ = SC.$;
    return ("hidden"!=elem.type) && (CQ.css(elem,"display")!="none") && (CQ.css(elem,"visibility")!="hidden");
  }
  
}) ;


