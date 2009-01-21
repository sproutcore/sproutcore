// ========================================================================
// SproutCore -- JavaScript Application Framework
// Copyright ©2006-2008, Sprout Systems, Inc. and contributors.
// Portions copyright ©2008 Apple, Inc.  All rights reserved.
// ========================================================================

require('design.mode/views/designer');
require('desktop.platform/views/tab');

SC.TabView.Designer = SC.ViewDesigner.extend(
/** @scope SC.TabView.Designer.prototype */ {
  
  encodeChildViews: NO,
  
  designProperties: 'nowShowing items itemTitleKey itemValueKey itemIsEnabledKey itemIconKey itemWidthKey tabLocation userDefaultKey'.w()
  
});