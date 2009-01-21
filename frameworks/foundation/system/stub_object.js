// ========================================================================
// SproutCore -- JavaScript Application Framework
// Copyright ©2006-2008, Sprout Systems, Inc. and contributors.
// Portions copyright ©2008 Apple, Inc.  All rights reserved.
// ========================================================================

require('system/object');
/*global Ajax */

/** @class
  
  A stub object represents a lazily-loaded module.  Whenever you define a 
  lazily loaded module in SproutCore using the sc_stub() directive, a Stub
  object will be automatically created at the path you name in the module.
  
  You can work with this Stub object by calling the invokeLater() method.  
  
  @extends SC.Object
  @since SproutCore 1.0
*/
SC.StubObject = SC.Object.extend({
  
  /** walk like a duck */
  isStubObject: YES,
  
  /**
    The property path this stub object is installed at.  Also used to
    determine the load path.
  */
  propertyPath: '',
  
  /**
    The moduleUrl.  The default version of this is usually the propertyPath
    name.
  */
  moduleUrl: function() {
    return this.get('propertyPath') + '.js';
  }.property('propertyPath').cacheable(),
  
  /**
    Before you access any property on an object that may be deferred, you
    should use this method.  If the object has not yet been loaded, it will
    be loaded before your callback method is invoked.  Otherwise, your 
    callback method will be invoked immediately.
  */
  invokeWith: function(propertyPath, target, method) {
    
    var objectPath = this.get('propertyPath');
    
    // Load this Object... once loaded, call invokeLater() on the loaded 
    var req = new Ajax.Request({ 
      url: this.get('moduleUrl'),
      onComplete: function() {
        // get loaded obj and invoke...
        var obj = SC.objectForPropertyPath(objectPath); 
        obj.invokeWith(propertyPath, target, method);
        obj = objectPath = propertyPath = target = method = null; //noleaks
      }
    });
    req= null;
  }

});