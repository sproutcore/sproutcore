// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals TestControls Forms*/
TestControls.tabPage = SC.View.design({
  childViews: "tabs".w(),
  tabs: SC.TabView.design({
    layout: { left: 100, top: 100, right: 100, bottom: 100 },
    items: ["Item 1", "Item 2", "Item 3"]
  })
});