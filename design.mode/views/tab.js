// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('desktop.platform/views/tab');

SC.TabView.Designer = SC.ViewDesigner.extend({
  encodeChildViews: NO,
  
  designProperties: 'nowShowing items itemTitleKey itemValueKey itemIsEnabledKey itemIconKey itemWidthKey tabLocation userDefaultKey'.w()
  
});