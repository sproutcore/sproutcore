// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2009 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test htmlbody ok equals same stop start */


(function() {
  var iconURL= "http://www.freeiconsweb.com/Icons/16x16_people_icons/People_046.gif";

  var pane = SC.ControlTestPane.design()

    .add("tabView1", SC.TabView, {
      nowShowing: 'tab2',

      items: [
        { title: "tab1", value: "tab1" , icon: iconURL},
        { title: "tab2", value: "tab2" , icon: iconURL},
        { title: "tab3", value: "tab3" , icon: iconURL}
      ],

      itemTitleKey: 'title',
      itemValueKey: 'value',
      itemIconKey: 'icon',
      layout: { left:12, height: 200, right:12, top:12 }

  })

  .add("tabView2", SC.TabView, {
    nowShowing: 'tab3',

    items: [
      { title: "tab1", value: "tab1" },
      { title: "tab2", value: "tab2" },
      { title: "tab3", value: "tab3" }
    ],

    itemTitleKey: 'title',
    itemValueKey: 'value',
    layout: { left:12, height: 200, right:12, top:12 }

    })
    .add("tabView3", SC.TabView, {

      items: [
        { title: "tab1", value: "tab1" },
        { title: "tab2", value: "tab2" },
        { title: "tab3", value: "tab3" }
      ],

      itemTitleKey: 'title',
      itemValueKey: 'value',
      layout: { left:12, height: 200, right:12, top:12}
    });

  pane.show(); // add a test to show the test pane

  // ..........................................................
  // TEST VIEWS
  //
  module('SC.TabView ui', {
    setup: function(){
      htmlbody('<style> .sc-static-layout { border: 1px red dotted; } </style>');
      pane.standardSetup().setup();
    },
    teardown: function(){
      pane.standardSetup().teardown();
      clearHtmlbody();
    }
  });

  test("Check that all tabViews are visible", function() {
    ok(pane.view('tabView1').get('isVisibleInWindow'), 'tabView1.isVisibleInWindow should be YES');
    ok(pane.view('tabView2').get('isVisibleInWindow'), 'tabView2.isVisibleInWindow should be YES');
    ok(pane.view('tabView3').get('isVisibleInWindow'), 'tabView3.isVisibleInWindow should be YES');
   });


   test("Check that the tabView has the right classes set", function() {
     var view = pane.view('tabView1');
     var viewElem = view.$();
     ok(viewElem.hasClass('sc-view'), 'tabView1.hasClass(sc-view) should be YES');
     ok(viewElem.hasClass('sc-tab-view'), 'tabView1.hasClass(sc-tab-view) should be YES');
     ok(view.$('.sc-segmented-view').length, 'tabView1 should contain a segmented view');
     ok(view.$('.sc-container-view').length, 'tabView1 should contain a container view');
   });


})();
