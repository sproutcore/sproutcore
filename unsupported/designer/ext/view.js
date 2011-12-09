// ========================================================================
// SproutCore -- JavaScript Application Framework
// Copyright ©2006-2011, Strobe Inc. and contributors.
// Portions copyright ©2008 Apple Inc.  All rights reserved.
// ========================================================================

/*jslint evil:true */

/** 
  Extend SC.View with emitDesign() which will encode the view and all of its
  subviews then computes an empty element to attach to the design.
*/
SC.View.prototype.emitDesign = function() {
  
  // get design...
  var ret = SC.DesignCoder.encode(this);
  
  return ret ;
};

/**
  Extend SC.View to emit the localization for the current configuration of the
  view and all of its subviews.
*/
SC.View.prototype.emitLocalization = function(design) {
  var ret = SC.LocalizationCoder.encode(this);
  
  // prepare rootElement HTML.  Get the design, apply loc and generate the
  // emptyElement HTML...
  if (!design) design = this.emitDesign();
  var views = eval(design).loc(eval(ret)).create() ;
  var emptyElement = views.computeEmptyElement().replace(/\'/g,"\'");
  views.destroy();
  
  // now insert as extra param at end...
  ret = ret.replace(/\)$/, ", '%@')".fmt(emptyElement)) ;
  return ret ;
} ;

/** 
  Patch SC.View to respond to encodeDesign().  This will proxy to the paired
  designer, if there is one.  If there is no paired designer, returns NO.
*/
SC.View.prototype.encodeDesign = function(coder) {
  return this.designer ? this.designer.encodeDesign(coder) : NO ;
};

/** 
  Patch SC.View to respond to encodeDesign().  This will proxy to the paired
  designer, if there is one.  If there is no paired designer, returns NO.
*/
SC.View.prototype.encodeLoc = function(coder) {
  return this.designer ? this.designer.encodeLoc(coder) : NO ;
};