// ========================================================================
// SproutCore
// copyright 2006-2007 Sprout Systems, Inc.
// ========================================================================

require('Core') ;

// RunLoop is used to manage deferred runs.  It's lighter weight than setting
// lots of timeouts.
SC.runLoop = SC.Object.create({
  
  schedule: function() {
    var args = $A(arguments) ; 
    var obj = args.shift() ; 
    var method = obj[args.shift()];
    var delay = args.pop() ;
    var func = function() { method.apply(obj, args); }
    return setTimeout(func, delay) ;  
  }
  
}) ;