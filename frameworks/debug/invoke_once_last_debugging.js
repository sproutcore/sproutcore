// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

// When in debug mode, it’s useful for our observer sets (which are used by
// invokeOnce and invokeLast) to record which code scheduled the
// `invokeOnce`/`invokeLast` targets/methods.

window.SC = window.SC || {};


// Declaring the variable will make it easier for people who want to enter it
// inside consoles that auto-complete.
if (!SC.LOG_RUNLOOP_INVOCATIONS) SC.LOG_RUNLOOP_INVOCATIONS = false;


SC.addInvokeOnceLastDebuggingInfo = function() {
  return;
  
  SC.ObserverSet.add = function(target, method, context, originatingTarget, originatingMethod, originatingStack) {
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
      var contexts = methods.contexts || (methods.contexts = {}) ;
      contexts[SC.guidFor(method)] = context ;
    }
    
    // THIS IS THE PORTION THAT DIFFERS FROM THE STANDARD IMPLEMENTATION
    
    // Recording the calling object/function can be a useful debugging tool.
    // Since multiple object/functions can schedule the same target/method,
    // this value could either be a single value or an array.  (We won't
    // always use an array because that adds a certain debugging burden to the
    // "only one scheduled it" case.)
    if (originatingMethod !== undefined) {
      var originatingTargets = methods.originatingTargets;
      var originatingMethods = methods.originatingMethods;
      var originatingStacks  = methods.originatingStacks;
      if (!originatingTargets) originatingTargets = methods.originatingTargets = {};
      if (!originatingMethods) originatingMethods = methods.originatingMethods = {};
      if (!originatingStacks)  originatingStacks  = methods.originatingStacks  = {};
      
      var key = SC.guidFor(method);
      
      var existingMethod = originatingMethods[key];
      if (existingMethod  &&  SC.typeOf(existingMethod) !== SC.T_ARRAY) {
        // We previously had one entry and now we have two.  We need to
        // convert to an array!
        var existingTarget = originatingTargets[key];
        var existingStack  = originatingStacks[key];
        originatingTargets[key] = [existingTarget, originatingTarget];
        originatingMethods[key] = [existingMethod, originatingMethod];
        originatingStacks[key]  = [existingStack, originatingStack];
      }
      else {
        // We didn't previously have a value?  Then no need to use an
        // enclosing array.
        originatingTargets[key] = originatingTarget;
        originatingMethods[key] = originatingMethod;
        originatingStacks[key]  = originatingStack;
      }
    }
  };
  
  
  SC.ObserverSet.invokeMethods = function() {
    // iterate through the set, look for sets.
    for(var key in this) {
      if (!this.hasOwnProperty(key)) continue ;
      var value = this[key] ;
      if (value && value.isTargetSet) {
        var idx = value.length;
        var target = value.target ;
        
        // THIS IS THE PORTION THAT DIFFERS FROM THE STANDARD IMPLEMENTATION
        var m, log = SC.LOG_RUNLOOP_INVOCATIONS;
        while(--idx>=0) {
          m = value[idx];
          if (log) {
            var mName = m.displayName || m;
            
            var originatingKey     = SC.guidFor(m),
                originatingTargets = value.originatingTargets;
            if (!originatingTargets) {
              // If we didn't capture information for this invocation, just
              // report what we can.  (We assume we'll always have all three
              // hashes or none.)
              SC.Logger.log("Invoking runloop-scheduled method %@ on %@, but we didn’t capture information about who scheduled it…".fmt(mName, target));
            }
            else {
              originatingTargets = originatingTargets[originatingKey];             // Could be one target or an array of them
              var originatingMethods = value.originatingMethods[originatingKey];   // ditto
              var originatingStacks  = value.originatingStacks[originatingKey];    // ditto

              // Were there multiple originating target/method pairs that
              // scheduled this target/method?  If so, display them all nicely.
              // Otherwise, optimize our output for only one.
              if (originatingMethods  &&  SC.typeOf(originatingMethods) === SC.T_ARRAY) {
                SC.Logger.log("Invoking runloop-scheduled method %@ on %@, which was scheduled by multiple target/method pairs:".fmt(mName, target));
              
                var i, len,
                  originatingTarget,
                  originatingMethod,
                  originatingStack;
                for (i = 0, len = originatingMethods.length;  i < len;  ++i) {
                  originatingTarget = originatingTargets[i];
                  originatingMethod = originatingMethods[i];
                  originatingMethod = originatingMethod.displayName || originatingMethod;
                  originatingStack  = originatingStacks[i];
  
                  SC.Logger.log("[%@]  originated by target %@,  method %@,  stack:".fmt(i, originatingTarget, originatingMethod), originatingStack);
                }
              }
              else {
                var originatingMethodName = originatingMethods.displayName || originatingMethods;

                SC.Logger.log("Invoking runloop-scheduled method %@ on %@.  Originated by target %@,  method %@,  stack: ".fmt(mName, target, originatingTargets, originatingMethodName), originatingStacks);
              }
            }
          }
          m.call(target);
        }
        // THIS IS THE PORTION THAT DIFFERS FROM THE STANDARD IMPLEMENTATION
      }
    }
  };
  
  
  SC.Object.prototype.invokeOnce = function(method) {
    var originatingTarget = this ;
    if (SC.LOG_RUNLOOP_INVOCATIONS) {
      originatingStack  = SC.getRecentStack();
      originatingMethod = originatingStack[0];
    }
    else {
      originatingStack  = null;
      originatingMethod = arguments.callee.caller;
    }    SC.RunLoop.currentRunLoop.invokeOnce(this, method, originatingTarget, originatingMethod, originatingStack) ;
    return this ;
  };
  
  
  SC.Object.prototype.invokeLast = function(method) {
    var originatingTarget = this ;
    var originatingStack, originatingMethod;
    if (SC.LOG_RUNLOOP_INVOCATIONS) {
      originatingStack  = SC.getRecentStack();
      originatingMethod = originatingStack[0];
    }
    else {
      originatingStack  = null;
      originatingMethod = arguments.callee.caller;
    }
    SC.RunLoop.currentRunLoop.invokeLast(this, method, originatingTarget, originatingMethod, originatingStack) ;
    return this ;
  };
  
  
  SC.RunLoop.prototype.invokeOnce = function(target, method, originatingTarget, originatingMethod, originatingStack) {
    // THIS IS THE PORTION THAT DIFFERS FROM THE STANDARD IMPLEMENTATION
    
    // For debugging convenience, record the originating function if it was
    // not provided for us.
    if (!originatingTarget) originatingTarget = null;   // More obvious when debugging
    if (!originatingMethod) {
      if (SC.LOG_RUNLOOP_INVOCATIONS) {
        originatingStack  = SC.getRecentStack();
        originatingMethod = originatingStack[0];
      }
      else {
        originatingStack  = null;
        originatingMethod = arguments.callee.caller;
      }
    }
    // THIS IS THE PORTION THAT DIFFERS FROM THE STANDARD IMPLEMENTATION
    
    
    // normalize
    if (method === undefined) { 
      method = target; target = this ;
    }
    if (SC.typeOf(method) === SC.T_STRING) method = target[method];
    if (!this._invokeQueue) this._invokeQueue = SC.ObserverSet.create();
    this._invokeQueue.add(target, method, null, originatingTarget, originatingMethod, originatingStack);  // differs from standard implementation
    return this ;
  };
  
  
  SC.RunLoop.prototype.invokeLast = function(target, method, originatingTarget, originatingMethod, originatingStack) {
    // THIS IS THE PORTION THAT DIFFERS FROM THE STANDARD IMPLEMENTATION
    
    // For debugging convenience, record the originating function if it was
    // not provided for us.
    if (!originatingTarget) originatingTarget = null;   // More obvious when debugging
    if (!originatingMethod) {
      if (SC.LOG_RUNLOOP_INVOCATIONS) {
        originatingStack  = SC.getRecentStack();
        originatingMethod = originatingStack[0];
      }
      else {
        originatingStack  = null;
        originatingMethod = arguments.callee.caller;
      }
    }    
    // THIS IS THE PORTION THAT DIFFERS FROM THE STANDARD IMPLEMENTATION
    
    
    // normalize
    if (method === undefined) { 
      method = target; target = this ;
    }
    if (SC.typeOf(method) === SC.T_STRING) method = target[method];
    if (!this._invokeLastQueue) this._invokeLastQueue = SC.ObserverSet.create();
    this._invokeLastQueue.add(target, method, null, originatingTarget, originatingMethod, originatingStack);  // differs from standard implementation
    return this ;
  };
  
  
  // Will return the recent stack as a hash with numerical keys, for nice
  // output in some browser's debuggers.  The “recent” stack is capped at 6
  // entries.
  SC.getRecentStack = function() {
    var currentFunction = arguments.callee.caller,
        i = 0,
        stack = {},
        first = YES,
        functionName;

    while (currentFunction  &&  i < 6) {
      // Skip ourselves!
      if (first) {
        first = NO;
      }
      else {
        functionName = currentFunction.displayName || currentFunction.toString();
        stack[i++] = functionName;
      }
      currentFunction = currentFunction.caller;
    }
    
    return stack;
  };
  
};
