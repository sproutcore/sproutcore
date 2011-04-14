// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals TestControls Forms*/
TestControls.listPage = SC.View.design({
  childViews: "scroll".w(),
  scroll: SC.ScrollView.design({
    backgroundColor: "white",
    contentView: SC.ListView.design({
      hasContentIcon: YES,
      hasContentRightIcon: YES,
      contentIconKey: "icon",
      contentRightIconKey: "rightIcon",
      contentCheckboxKey: "isChecked",
      contentUnreadCountKey: "unread",
      
      
      classNames: ['big-list'],
      rowHeight: 44,
      content: function() {
        var idx = 0, ret = [];
        for (idx = 0; idx < 1000; idx++) {
          ret.push(SC.Object.create({
            "title": "Item " + idx,
            "icon": "sc-icon-document-16",
            "unread": idx,
            rightIcon: "sc-icon-info-16",
            isChecked: YES
          }));
        }
        return ret;
      }.property().cacheable(),
      contentValueKey: "title"
    })
  })
});