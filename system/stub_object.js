// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('system/object');

/** @class
  
  A stub object represents a lazily-loaded module.  Whenever you define a 
  lazily loaded module in SproutCore using the sc_module() directive, a Stub
  object will be automatically created at the path you name in the module.
  
  You can work with this Stub object by calling the invokeLater() method.  
  
  @extends SC.Object
  @since SproutCore 1.0
*/
SC.StubObject = SC.Object.extend({
  
  /** walk like a duck */
  isDeferredObject: YES,
  
  /**
    The path of the module to load.  The module must be a JavaScript file 
    that can be eval'd.
  */
  moduleUrl: '',
  
  /**
    Before you access any property on an object that may be deferred, you
    should use this method.  If the object has not yet been loaded, it will
    be loaded before your callback method is invoked.  Otherwise, your 
    callback method will be invoked immediately.
  */
  invokeLater: function(propertyPath, target, method) {
    // Load this Object... once loaded, call invokeLater() on the loaded 
    // object...
  }

});