// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2011 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals module, test, ok */

module("SC.TabView", {
  setup: function() {
    SC.run(function() {
      window.globalPage = SC.Page.create({
        view1: SC.View.create(),
        view2: SC.View.create()
      });
    });
  },

  teardown: function() {
    window.globalPage.destroy();
    delete window.globalPage;
  }
});

test("Tabs referencing global views.", function() {
  var pane, view;
  SC.run(function() {
    pane = SC.MainPane.create({
      childViews: ['tabView'],
      tabView: SC.TabView.extend({
        nowShowing: 'globalPage.view1',

        items: [
          { title: "tab1", value: "globalPage.view1" },
          { title: "tab2", value: "globalPage.view2" }
        ]
      })
    }).append();
    view = pane.tabView;
  });

  ok(view.getPath('containerView.contentView') === window.globalPage.get('view1'), "The tab view should now be showing globalPage.view1.");

  SC.run(function() {
    view.set('nowShowing', 'globalPage.view2');
  });

  ok(view.getPath('containerView.contentView') === window.globalPage.get('view2'), "The tab view should now be showing globalPage.view2.");

  // Clean up.
  SC.run(function() {
    pane.destroy();
  });
});

test("Tabs referencing local views.", function() {
  var pane, view;
  SC.run(function() {
    pane = SC.MainPane.create({
      childViews: ['tabView'],
      tabView: SC.TabView.extend({
        nowShowing: 'view1',

        items: [
          { title: "tab1", value: "view1" },
          { title: "tab2", value: "view2" }
        ],

        view1: SC.View.create(),
        view2: SC.View.create()
      })
    }).append();
    view = pane.tabView;
  });

  ok(view.getPath('containerView.contentView') === view.get('view1'), "The tab view's local view1 should now be showing.");

  SC.run(function() {
    view.set('nowShowing', 'view2');
  });

  ok(view.getPath('containerView.contentView') === view.get('view2'), "The tab view's local view2 should now be showing.");

  // Clean up.
  SC.run(function() {
    pane.destroy();
  });
});

test("Tabs referencing deep local views.", function() {
  var pane, view;
  SC.run(function() {
    pane = SC.MainPane.create({
      childViews: ['tabView'],
      tabView: SC.TabView.extend({
        nowShowing: '.localPage.view1',

        items: [
          { title: "tab1", value: ".localPage.view1" },
          { title: "tab2", value: ".localPage.view2" }
        ],
        localPage: SC.Page.create({
          view1: SC.View.create(),
          view2: SC.View.create()
        })
      })
    }).append();
    view = pane.tabView;
  });

  ok(view.getPath('containerView.contentView') === view.getPath('localPage.view1'), "The tab view's local view1 should now be showing.");

  SC.run(function() {
    view.set('nowShowing', '.localPage.view2');
  });

  ok(view.getPath('containerView.contentView') === view.getPath('localPage.view2'), "The tab view's local view2 should now be showing.");

  // Clean up.
  SC.run(function() {
    pane.destroy();
  });
});
