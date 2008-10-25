// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

// ........................................................................
// ObserverSet
//
// This private class is used to store information about obversers on a 
// particular key.  Note that this object is not observable.  You create new
// instances by calling SC.beget(SC._ObserverSet) ;
//
SC._ObserverSet = {

  // the number of targets in the set.
  targets: 0,
  
  _membersCacheIsValid: NO,
  
  // adds the named target/method observer to the set.  The method must be
  // a function, not a string.
  add: function(target, method) {
    var targetGuid = SC.guidFor(target) ;
    
    // get the set of methods
    var methods = this[targetGuid] ;
    if (!methods) {
      methods = this[targetGuid] = SC.Set.create() ;
      methods.target = target ;
      methods.isTargetSet = YES ; // used for getMembers().
      this.targets++ ;
    }
    
    methods.add(method) ;
    this._membersCacheIsValid = NO ;
  },
  
  // removes the named target/method observer from the set.  If this is the
  // last method for the named target, then the number of targets will also
  // be reduced.
  //
  // returns YES if the items was removed, NO if it was not found.
  remove: function(target, method) {
    var targetGuid = SC.guidFor(target) ;
    
    // get the set of methods
    var methods = this[targetGuid] ;    
    if (!methods) return NO ;
    
    methods.remove(method) ;
    if (methods.length <= 0) {
      methods.target = null;
      methods.isTargetSet = NO ;
      delete this[targetGuid] ;
      this.targets-- ;
    }
    
    this._membersCacheIsValid = NO;
    
    return YES ;
  },
  
  // Returns an array of target/method pairs.  This is cached.
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
        while(--idx>=0) ret.push([target, value[idx]]) ;
      }
    }

    this._membersCacheIsValid = YES ;
    return ret ;
  }
  
} ;

