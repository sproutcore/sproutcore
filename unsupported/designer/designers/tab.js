// ========================================================================
// SproutCore -- JavaScript Application Framework
// Copyright ©2006-2011, Strobe Inc. and contributors.
// Portions copyright ©2008 Apple Inc.  All rights reserved.
// ========================================================================

sc_require('designers/view_designer');

SC.TabView.Designer = SC.ViewDesigner.extend(
/** @scope SC.TabView.Designer.prototype */ {
  
  encodeChildViews: NO,
  
  acceptRootDesigner: YES,
  
  designProperties: 'nowShowing items itemTitleKey itemValueKey itemIsEnabledKey itemIconKey itemWidthKey tabLocation userDefaultKey'.w()
  
});