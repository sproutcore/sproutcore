// ========================================================================
// SproutCore -- JavaScript Application Framework
// Copyright ©2006-2008, Sprout Systems, Inc. and contributors.
// Portions copyright ©2008 Apple, Inc.  All rights reserved.
// ========================================================================

require('system/object') ;

SC.mixin(SC.Object, {

  tupleForPropertyPath: SC.tupleForPropertyPath,
  objectForPropertyPath: SC.objectForPropertyPath,
  createArray: SC.Object.createEach    
});

/** @deprecated
  outlet() now works just like get().  Use get() instead.
*/ 
SC.Object.prototype.outlet = SC.Object.prototype.get ;
