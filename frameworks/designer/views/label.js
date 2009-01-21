// ========================================================================
// SproutCore -- JavaScript Application Framework
// Copyright ©2006-2008, Sprout Systems, Inc. and contributors.
// Portions copyright ©2008 Apple, Inc.  All rights reserved.
// ========================================================================

require('design.mode/views/designer');
require('views/controls/label');

SC.LabelView.Designer = SC.ViewDesigner.extend(
/** @scope SC.LabelView.Designer.prototype */ {
  
  encodeChildViews: NO,
  
  designProperties: 'value escapeHTML'.w()
  
});