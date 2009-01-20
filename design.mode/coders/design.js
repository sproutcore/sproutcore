// ========================================================================
// SproutCore -- JavaScript Application Framework
// Copyright ©2006-2008, Sprout Systems, Inc. and contributors.
// Portions copyright ©2008 Apple, Inc.  All rights reserved.
// ========================================================================

/* evil:true */

require('design.mode/coders/object');
require('views/view');

/** @class

  A DesignCoder encodes specifically the design for a set of views.
  
  @extends SC.ObjectCoder
*/
SC.DesignCoder = SC.ObjectCoder.extend({
  extendMethodName: 'design',
  encodeMethodName: 'encodeDesign'  
});

/** 
  Patch SC.View to respond to encodeDesign().  This will proxy to the paired
  designer, if there is one.  If there is no paired designer, returns NO.
*/
SC.View.prototype.encodeDesign = function(coder) {
  return this.designer ? this.designer.encodeDesign(coder) : NO ;
};

