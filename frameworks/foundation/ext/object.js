// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

// Extensions to the core SC.Object class
SC.mixin(SC.Object.prototype, /** @scope SC.Object.prototype */ {
  
  /**
    Invokes the named method after the specified period of time.
    
    This is a convenience method that will create a single run timer to
    invoke a method after a period of time.  The method should have the
    signature:
    
    {{{
      methodName: function(timer)
    }}}
    
    If you would prefer to pass your own parameters instead, you can instead
    call invokeLater() directly on the function object itself.
    
    @param methodName {String} method name to perform.
    @param interval {Number} period from current time to schedule.
    @returns {SC.Timer} scheduled timer.
  */
  invokeLater: function(methodName, interval) {
    if (interval === undefined) interval = 1 ;
    var f = methodName, args, func;
    
    // if extra arguments were passed - build a function binding.
    if (arguments.length > 2) {
      args = SC.$A(arguments).slice(2);
      if (SC.typeOf(f) === SC.T_STRING) f = this[methodName] ;
      func = f ;
      f = function() { return func.apply(this, args); } ;
    }

    // schedule the timer
    return SC.Timer.schedule({ target: this, action: f, interval: interval });
  },
  
  /**
    Lookup the named property path and then invoke the passed function, 
    passing the resulting value to the function.
    
    This method is a useful way to handle deferred loading of properties.  
    If you want to defer loading a property, you can override this method.
    When the method is called, passing a deferred property, you can load the
    property before invoking the callback method.
    
    You can even swap out the receiver object.  
    
    The callback method should have the signature:
    
    function callback(objectAtPath, sourceObject) { ... }
    
    You may pass either a function itself or a target/method pair.
    
    @param {String} pathName
    @param {Object} target target or method
    @param {Function|String} method
    @returns {SC.Object} receiver
  */
  invokeWith: function(pathName, target, method) {
    // normalize target/method
    if (method === undefined) {
      method = target; target = this;
    }
    if (!target) target = this ;
    if (SC.typeOf(method) === SC.T_STRING) method = target[method];
    
    // get value
    var v = this.getPath(pathName);
    
    // invoke method
    method.call(target, v, this);
    return this ;
  }
  
});