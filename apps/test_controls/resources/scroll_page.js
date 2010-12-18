// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals TestControls Forms*/
TestControls.scrollPage = SC.View.design({
  childViews: "scroll".w(),
  scroll: SC.ScrollView.design({
    contentView: SC.FormView.design({
      flowPadding: { top: 0, bottom: 100, right: 0, left: 0},
      classNames: ["sample_controls"],
      layout: { left: 20, top: 40, right: 20, bottom: 40 },
      childViews: "header list incrementalList imageList".w(),
      header: SC.LabelView.design({
        fillWidth: YES,
        layout: { width: 300, height: 24 },
        classNames: "header".w(),
        value: "Scroll Views"
      }),
      list: SC.FormView.row(SC.ScrollView.design({
        backgroundColor: "white",
        layout: { width: 320, height: 460 },
        contentView: SC.ListView.design({
          computeNowShowing: function() {
            return this.get('allContentIndexes');
          },
          classNames: ['big-list'],
          rowHeight: 44,
          content: function() {
            var idx = 0, ret = [];
            for (idx = 0; idx < 100; idx++) {
              ret.push(SC.Object.create({"title": "Item " + idx}));
            }
            return ret;
          }.property().cacheable(),
          contentValueKey: "title"
        })
      })),
      incrementalList: SC.FormView.row(SC.ScrollView.design({
        backgroundColor: "white",
        layout: { width: 320, height: 460 },
        contentView: SC.ListView.design({
          classNames: ['big-list'],
          rowHeight: 44,
          content: function() {
            var idx = 0, ret = [];
            for (idx = 0; idx < 1000; idx++) {
              ret.push(SC.Object.create({"title": "Item " + idx}));
            }
            return ret;
          }.property().cacheable(),
          contentValueKey: "title"
        })
      })),
      imageList: SC.FormView.row(SC.ScrollView.design({
        backgroundColor: "gray",
        canScale: YES,
        layout: { width: 320, height: 460 },
        contentView: SC.ListView.design({
          classNames: ['big-list'],
          rowHeight: 44,
          content: function() {
            var idx = 0, ret = [];
            for (idx = 0; idx < 1000; idx++) {
              ret.push(SC.Object.create({"title": "Item " + idx}));
            }
            return ret;
          }.property().cacheable(),
          contentValueKey: "title"
        })
      }))
    })
  })
});