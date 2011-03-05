// ========================================================================
// SproutCore -- JavaScript Application Framework
// Copyright ©2006-2011, Strobe Inc. and contributors.
// Portions copyright ©2008 Apple Inc.  All rights reserved.
// ========================================================================

/**
  Patch SC.Object to respond to design
  
*/
SC.Object.prototype.emitDesign = function() {
  
  // get design...
  var ret = SC.ObjectCoder.encode(this);
  
  return ret ;
};


/** 
  Patch SC.Object to respond to encodeDesign().  This will proxy to the paired
  designer, if there is one.  If there is no paired designer, returns NO.
*/
SC.Object.prototype.encodeDesign = function(coder) {
  return this.designer ? this.designer.encodeDesign(coder) : NO ;
};
