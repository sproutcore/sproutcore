// ========================================================================
// SproutCore -- JavaScript Application Framework
// Copyright ©2006-2008, Sprout Systems, Inc. and contributors.
// Portions copyright ©2008 Apple Inc.  All rights reserved.
// ========================================================================

/**
  Patch SC.Controller to respond to design
  
*/
SC.Controller.prototype.emitDesign = function(coder){
  var ret = SC.DesignCoder.encode(this);
  
  return ret ;
};

SC.Controller.prototype.encodeDesign = function(coder){
  coder.set('className', "SC.ObjectController");
  var val, proto = SC.ObjectController.prototype, prop;
  for(prop in this){
    if(this.hasOwnProperty(prop)){
      val = this[prop];
      if (val !== undefined && (val !== proto[prop])) {
        coder.encode(prop, val) ;
      }
    }
  }  
  
  return YES ;
};