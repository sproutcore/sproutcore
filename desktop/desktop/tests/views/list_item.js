// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2009 Apple Inc.
// License:   Licensed under MIT license (see license.js)
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

  .add("full - sel", SC.ListItemView.design({ 
    content: SC.Object.create({ 
      icon: "sc-icon-folder-16",
      title: "List Item", 
      checkbox: YES,
      count: 23,
      branch: YES
    }),

    isSelected: YES,
        
    hasContentIcon:  YES,
    hasContentBranch: YES,

    contentValueKey: "title",
    contentLeftActionKey: 'checkbox',
    leftAction: 'checkbox',
    
    contentRightActionKey: 'isLoading',
    
    contentCheckboxKey: 'checkbox',
    contentIconKey:  "icon",
    contentUnreadCountKey: 'count',
    contentIsBranchKey: 'branch'

  }))
  
  .add("icon", SC.ListItemView.design({ 
    content: SC.Object.create({ 
      title: "List Item", 
      icon: "sc-icon-folder-16" 
    }),
    
    contentValueKey: "title",

    contentIconKey:  "icon",
    hasContentIcon:  YES

  }))

  .add("checkbox - YES", SC.ListItemView.design({ 
    content: SC.Object.create({ title: "List Item", checkbox: YES }),
    contentValueKey: "title",
    contentCheckboxKey:  "checkbox"
  }))

  .add("checkbox - NO", SC.ListItemView.design({ 
    content: SC.Object.create({ title: "List Item", checkbox: NO }),
    contentValueKey: "title",
    contentCheckboxKey:  "checkbox"
  }))

  .add("count - 0", SC.ListItemView.design({ 
    content: SC.Object.create({ title: "List Item", count: 0 }),
    contentValueKey: "title",
    contentUnreadCountKey:  "count"
  }))

  .add("count - 10", SC.ListItemView.design({ 
    content: SC.Object.create({ title: "List Item", count: 10 }),
    contentValueKey: "title",
    contentUnreadCountKey:  "count"
  }))
  
  .add("outline - 1", SC.ListItemView.design({ 
    content: SC.Object.create({ title: "List Item" }),
    contentValueKey: "title",
    contentUnreadCountKey:  "count",
    outlineLevel: 1
  }))
  
  .add("outline - 2", SC.ListItemView.design({ 
    content: SC.Object.create({ title: "List Item" }),
    contentValueKey: "title",
    contentUnreadCountKey:  "count",
    outlineLevel: 2
  })) ;

pane.show();

window.pane = pane ;

// ..........................................................
// DETECTORS
// 
// The functions below test the presence of a particular part of the view.  If
// you pass the second param then it expects the part to be in the view.  If
// you pass null, then it expects the part to NOT be in the view.

function basic(view, sel, disabled) {
  var cq = view.$();
  ok(cq.hasClass('sc-list-item-view'), 'should have sc-list-item-view class');
  
  equals(cq.hasClass('sel'), !!sel, 'expect sel class');
  equals(cq.hasClass('disabled'), !!disabled, 'expect disabled class');
  
  var idx = view.get('contentIndex');
  var evenOrOdd = (idx % 2 == 0) ? 'even' : 'odd';
  ok(cq.hasClass(evenOrOdd), 'should have an %@ class'.fmt(evenOrOdd));
}

function label(view, labelText) {
  if (labelText === null) {
    equals(view.$('label').size(), 0, 'should not have label');
  } else {
    equals(view.$('label').text(), labelText, 'should have label text');
  }
}

function icon(view, spriteName) {
  if (spriteName === null) {
    equals(view.$('img.icon').size(), 0, 'should not have image');
  } else {
    var cq = view.$('img.icon');
    equals(cq.size(), 1, 'should have icon');
    ok(cq.hasClass(spriteName), 'icon should have class name %@'.fmt(spriteName));
  }
}

function checkbox(view, state) {
  if (state === null) {
    equals(view.$('.sc-checkbox-view').size(), 0, 'should not have checkbox');
  } else {
    var cq =view.$('.sc-checkbox-view');
    equals(cq.size(), 1, 'should have checkbox element');
    equals(cq.hasClass('sel'), state === true, 'expects sel class');
    equals(cq.hasClass('mixed'), state === SC.MIXED_STATE, 'expects mixed class');
  }
}

function count(view, cnt) {
  if (cnt === null) {
    equals(view.$('.count').size(), 0, 'should not have count') ;
  } else {
    var cq = view.$('.count');
    equals(cq.size(), 1, 'should have count');
    equals(cq.text(), cnt.toString(), 'should have count');
  }
}

function branch(view, visible) {
  if (visible === null) {
    equals(view.$('.branch').size(), 0, 'should not have branch') ;
  } else {
    var cq = view.$('.branch');
    equals(cq.size(), 1, 'should have branch');
    equals(cq.hasClass('branch-visible'), visible, 'is visible');
  }
}

// ..........................................................
// Test Basic Setup
// 

module("SC.ListItemView UI", pane.standardSetup());

test("basic", function() {
  var view = pane.view('basic');

  basic(view, NO, NO);
  icon(view, null);
  label(view, 'List Item');
  checkbox(view, null);
  count(view, null);
  branch(view, null);
});

test("full", function() {
  var view = pane.view('full');
  basic(view, NO, NO);
  icon(view, 'sc-icon-folder-16');
  label(view, 'List Item');
  checkbox(view, YES);
  count(view, 23);
  branch(view, YES);
});

test("full - sel", function() {
  var view = pane.view('full - sel');
  basic(view, YES, NO);
  icon(view, 'sc-icon-folder-16');
  label(view, 'List Item');
  checkbox(view, YES);
  count(view, 23);
  branch(view, YES);
});

test("icon", function() {
  var view = pane.view('icon');
  icon(view, 'sc-icon-folder-16');
});

test('checkbox', function() {
  checkbox(pane.view('checkbox - YES'), YES);
  checkbox(pane.view('checkbox - NO'), NO);
});

test('count', function() {
  // no count should show when count = 0;
  count(pane.view('count - 0'), null); 
  count(pane.view('count - 10'), 10);
});

test("outline - 1", function() {
  var v = pane.view('outline - 1'),
      indent = v.get('outlineIndent');
  ok(indent>0, 'precond - outlineIndent property should be > 0 (actual: %@)'.fmt(indent));
  
  equals(v.$('.sc-outline').css('left'), indent*1+16 + "px", 'sc-outline div should be offset by outline ammount');
});

test("outline - 2", function() {
  var v = pane.view('outline - 2'),
      indent = v.get('outlineIndent');
  ok(indent>0, 'precond - outlineIndent property should be > 0 (actual: %@)'.fmt(indent));
  
  equals(v.$('.sc-outline').css('left'), indent*2+16 + "px", 'sc-outline div should be offset by outline ammount');
});

// ..........................................................
// EDITING CONTENT
// 

// gets the view content and adjusts the value inside of a runloop, ensuring
// the UI gets an update also.
function adjustContent(view, key, value) {
  var content = view.get('content');
  SC.RunLoop.begin();
  content.set(key, value);
  SC.RunLoop.end();
}

test("changing label should change display", function() {
  var view = pane.view('full');
  adjustContent(view, 'title', 'FOO');
  label(view, 'FOO'); // verify change
});

test("changing checkbox value should update display", function() {
  var view = pane.view('full');
  adjustContent(view, 'checkbox', NO);
  checkbox(view, NO); // verify change
});

test("changing count value should update display", function() {
  var view = pane.view('full');

  adjustContent(view, 'count', 100);
  count(view, 100); // verify change

  adjustContent(view, 'count', 0);
  count(view, null); // verify change
});

