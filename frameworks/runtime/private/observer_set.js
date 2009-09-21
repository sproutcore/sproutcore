// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

// ........................................................................
// ObserverSet
//

/**
  @namespace

  This private class is used to store information about obversers on a 
  particular key.  Note that this object is not observable.  You create new
  instances by calling SC.beget(SC.ObserverSet) ;

  @since SproutCore 1.0
*/
SC.ObserverSet = {

  /**
    the number of targets in the set.
  */
  targets: 0,
  
  _membersCacheIsValid: NO,
  
  /**
    adds the named target/method observer to the set.  The method must be
    a function, not a string..
  */
  add: function(target, method, context) {
    var targetGuid = (target) ? SC.guidFor(target) : "__this__";
    
    // get the set of methods
    var methods = this[targetGuid] ;
    if (!methods) {
      methods = this[targetGuid] = SC.CoreSet.create() ;
      methods.target = target ;
      methods.isTargetSet = YES ; // used for getMembers().
      this.targets++ ;
    }
    methods.add(method) ;
    
    // context is really useful sometimes but not used that often so this
    // implementation is intentionally lazy.
    if (context !== undefined) {
      var contexts = methods.contexts ;
      if (!context) contexts = {};
      contexts[SC.guidFor(method)] = context ;
    }
    
    this._membersCacheIsValid = NO ;
  },
  
  /**
    removes the named target/method observer from the set.  If this is the
    last method for the named target, then the number of targets will also
    be reduced.
  
    returns YES if the items was removed, NO if it was not found.
  */
  remove: function(target, method) {
    var targetGuid = (target) ? SC.guidFor(target) : "__this__";
    
    // get the set of methods
    var methods = this[targetGuid] ;    
    if (!methods) return NO ;
    
    methods.remove(method) ;
    if (methods.length <= 0) {
      methods.target = null;
      methods.isTargetSet = NO ;
      methods.contexts = null ;
      delete this[targetGuid] ;
      this.targets-- ;
      
    } else if (methods.contexts) {
      delete methods.contexts[SC.guidFor(method)];
    }

    this._membersCacheIsValid = NO;
    
    return YES ;
  },
  
  /**
    Invokes the target/method pairs in the receiver.  Used by SC.RunLoop
    Note: does not support context
  */
  invokeMethods: function() {
    // iterate through the set, look for sets.
    for(var key in this) {
      if (!this.hasOwnProperty(key)) continue ;
      var value = this[key] ;
      if (value && value.isTargetSet) {
        var idx = value.length;
        var target = value.target ;
        while(--idx>=0) value[idx].call(target);
      }
    }
  },
  
  /**
    Returns an array of target/method pairs.  This is cached.
  */
  getMembers: function() {
    if (this._membersCacheIsValid) return this._members ;
    
    // need to recache, reset the array...
    if (!this._members) {
      this._members = [] ;
    } else this._members.length = 0 ; // reset
    var ret = this._members ;

    // iterate through the set, look for sets.
    for(var key in this) {
      if (!this.hasOwnProperty(key)) continue ;
      var value = this[key] ;
      if (value && value.isTargetSet) {
        var idx = value.length;
        var target = value.target ;
        
        // slightly slower - only do if we have contexts
        var contexts = value.contexts ;
        if (contexts) {
          while(--idx>=0) {
            var method = value[idx] ;
            ret.push([target, method, contexts[SC.guidFor(method)]]) ;
          }
        } else {
          while(--idx>=0) ret.push([target, value[idx]]);
        }
      }
    }

    this._membersCacheIsValid = YES ;
    return ret ;
  },
  
  /**
    Returns a new instance of the set with the contents cloned.
  */
  clone: function() {
    var oldSet, newSet, key, ret = SC.ObserverSet.create() ;
    for(key in this) {
      if (!this.hasOwnProperty(key)) continue ;
      oldSet = this[key];
      if (oldSet && oldSet.isTargetSet) {
        newSet = oldSet.clone();
        newSet.target = oldSet.target ;
        if (oldSet.contexts) newSet.contexts = SC.clone(oldSet.contexts);
        ret[key] = newSet ;
      }
    }
    ret.targets = this.targets ;
    ret._membersCacheIsValid = NO ;
    return ret ;
  },
  
  /**
    Creates a new instance of the observer set.
  */
  create: function() { return SC.beget(this); }
  
} ;

SC.ObserverSet.slice = SC.ObserverSet.clone ;


