// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            portions copyright @2009 Apple, Inc.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/*global module test htmlbody ok equals same stop start */

var pane = SC.ControlTestPane.design({ height: 32 })
  .add("basic", SC.ListItemView.design({ 
    content: "List Item"
  }))

  .add("full", SC.ListItemView.design({ 
    content: SC.Object.create({ 
      icon: "sc-icon-folder-16",
      title: "List Item", 
      checkbox: YES,
      count: 23,
      branch: YES 
    }),
    
    hasContentIcon:  YES,
    hasContentBranch: YES,

    contentValueKey: "title",
    contentCheckboxKey: 'checkbox',
    contentIconKey:  "icon",
    contentUnreadCountKey: 'count',
    contentIsBranchKey: 'branch'

  }))
  
  .add("icon", SC.ListItemView.design({ 
    content: { title: "List Item", icon: "sc-icon-folder-16" },
    contentValueKey: "title",

    contentIconKey:  "icon",
    hasContentIcon:  YES

  }))

  .add("checkbox - YES", SC.ListItemView.design({ 
    content: { title: "List Item", checkbox: YES },
    contentValueKey: "title",
    contentCheckboxKey:  "checkbox"
  })) ;

pane.show();

// ..........................................................
// Test Basic Setup
// 

module("SC.ListItemView UI");

test("foo", function() {
  ok(true, "hello");
});

