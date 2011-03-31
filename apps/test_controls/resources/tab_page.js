// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions Â©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals TestControls Forms*/
TestControls.tabPage = SC.View.design({
  childViews: "form".w(),
  form: SC.FormView.design({
    layout: { left: 20, top: 40, right: 20, bottom: 40 },
    childViews: "header top topToolbar bottom overflow".w(),
    
    header: SC.LabelView.design({
      layout: {width:300, height:24},
      classNames: "header".w(),
      value: "Tab Views",
      fillWidth: YES
    }),
    
    top: SC.FormView.row(SC.TabView.design({
      layout: { width: 300, height: 100, centerY: 0 },
      items: ["Item 1", "Item 2", "Item 3"],
      tabLocation: SC.TOP_LOCATION
    })),
    
    topToolbar: SC.FormView.row(SC.TabView.design({
      layout: { width: 300, height: 100, centerY: 0 },
      items: ["Item 1", "Item 2", "Item 3"],
      tabLocation: SC.TOP_TOOLBAR_LOCATION
    })),
    
    bottom: SC.FormView.row(SC.TabView.design({
      layout: { width: 300, height: 100, centerY: 0 },
      items: ["Item 1", "Item 2", "Item 3"],
      tabLocation: SC.BOTTOM_LOCATION
    })),
    
    overflow: SC.FormView.row(SC.TabView.design({
      layout: { width: 300, height: 100, centerY: 0 },
      items: ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5", "Item 6", "Item 7"]
    }))
  })
});