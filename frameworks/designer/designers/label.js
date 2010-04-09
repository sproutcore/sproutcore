// ========================================================================
// SproutCore -- JavaScript Application Framework
// Copyright ©2006-2008, Sprout Systems, Inc. and contributors.
// Portions copyright ©2008 Apple Inc.  All rights reserved.
// ========================================================================

sc_require('views/designer');

SC.LabelView.Designer = SC.ViewDesigner.extend(
/** @scope SC.LabelView.Designer.prototype */ {
  
  encodeChildViews: NO,
  
  designProperties: 'value escapeHTML'.w()
  
});