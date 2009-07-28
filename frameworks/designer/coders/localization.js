// ========================================================================
// SproutCore -- JavaScript Application Framework
// Copyright ©2006-2008, Sprout Systems, Inc. and contributors.
// Portions copyright ©2008 Apple Inc.  All rights reserved.
// ========================================================================

sc_require('coders/object');

/** @class

  A LocalizationCoder encodes specifically the localization for views.
  
  @extends SC.ObjectCoder
*/
SC.LocalizationCoder = SC.ObjectCoder.extend({
  extendMethodName: 'localization',
  encodeMethodName: 'encodeLoc'
});

/** 
  Patch SC.View to respond to encodeDesign().  This will proxy to the paired
  designer, if there is one.  If there is no paired designer, returns NO.
*/
SC.View.prototype.encodeLoc = function(coder) {
  return this.designer ? this.designer.encodeLoc(coder) : NO ;
};

