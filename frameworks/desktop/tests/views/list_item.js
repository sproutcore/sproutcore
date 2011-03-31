// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2011 Apple Inc.
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
    contentIsBranchKey: 'branch',
    
    disclosureState: SC.BRANCH_OPEN

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
    contentIsBranchKey: 'branch',
    
    disclosureState: SC.BRANCH_OPEN

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
  
  .add("icon - contentandview", SC.ListItemView.design({
    content: SC.Object.create({
      title: "List Item",
      icon: "sc-icon-folder-16"
    }),

    icon: "sc-icon-info-16",

    contentValueKey: "title",

    contentIconKey:  "icon",
    hasContentIcon:  YES

  }))
  
  .add("icon - view", SC.ListItemView.design({
    content: SC.Object.create({
      title: "List Item"
    }),

    icon: "sc-icon-info-16",

    contentValueKey: "title"
  }))
  
  .add("disclosure - YES", SC.ListItemView.design({ 
    content: SC.Object.create({ title: "List Item" }),
    contentValueKey: "title",
    disclosureState: SC.BRANCH_OPEN
  }))

  .add("disclosure - NO", SC.ListItemView.design({ 
    content: SC.Object.create({ title: "List Item" }),
    contentValueKey: "title",
    disclosureState: SC.BRANCH_CLOSED
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
  var evenOrOdd = (idx % 2 === 0) ? 'even' : 'odd';
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
  var cq = view.$(), iconCQ = cq.find('img.icon');
  if (spriteName === null) {
    ok(!cq.hasClass('has-icon'), "should not have has-icon class");
    equals(iconCQ.size(), 0, 'should not have image');
  } else {
    ok(cq.hasClass('has-icon'), "should have has-icon class");
    equals(iconCQ.size(), 1, 'should have icon');
    ok(iconCQ.hasClass(spriteName), 'icon should have class name %@'.fmt(spriteName));
  }
}

function disclosure(view, state) {
  var cq = view.$(), disclosureCQ = cq.find('.sc-disclosure-view');
  if (state === null) {
    ok(!cq.hasClass('has-disclosure'), "should not have has-disclosure class");
    equals(disclosureCQ.size(), 0, "should not have disclosure");
  } else {
    ok(cq.hasClass('has-disclosure'), "should have has-disclosure class");
    equals(disclosureCQ.size(), 1, "should have disclosure element");
    equals(disclosureCQ.hasClass('sel'), state === true, "disclosure expects sel class");
  }
}

function checkbox(view, state) {
  var cq = view.$(), checkboxCQ = cq.find('.sc-checkbox-view');
  if (state === null) {
    ok(!cq.hasClass('has-checkbox'), "should not have has-checkbox class");
    equals(checkboxCQ.size(), 0, 'should not have checkbox');
  } else {
    ok(cq.hasClass('has-checkbox'), "should have has-checkbox class");
    equals(checkboxCQ.size(), 1, 'should have checkbox element');
    equals(checkboxCQ.hasClass('sel'), state === true, 'expects sel class');
    equals(checkboxCQ.hasClass('mixed'), state === SC.MIXED_STATE, 'expects mixed class');
  }
}

function count(view, cnt) {
  var cq = view.$(), countCQ = cq.find('.count');
  if (cnt === null) {
    ok(!cq.hasClass('has-count'), "should not have has-count class");
    equals(countCQ.size(), 0, 'should not have count') ;
  } else {
    ok(cq.hasClass('has-count'), "should have has-count class");
    equals(countCQ.size(), 1, 'should have count');
    equals(countCQ.text(), cnt.toString(), 'should have count text');
  }
}

function branch(view, visible) {
  var cq = view.$(), branchCQ = cq.find('.branch');
  if (visible === null) {
    ok(!cq.hasClass('has-branch'), "should not have has-branch class");
    equals(branchCQ.size(), 0, 'should not have branch') ;
  } else {
    ok(cq.hasClass('has-branch'), "should have has-branch class");
    equals(branchCQ.size(), 1, 'should have branch');
    equals(branchCQ.hasClass('branch-visible'), visible, 'is visible');
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
  disclosure(view, null);
  checkbox(view, null);
  count(view, null);
  branch(view, null);
});

test("full", function() {
  var view = pane.view('full');
  basic(view, NO, NO);
  icon(view, 'sc-icon-folder-16');
  label(view, 'List Item');
  disclosure(view, YES);
  checkbox(view, YES);
  count(view, 23);
  branch(view, YES);
});

test("full - sel", function() {
  var view = pane.view('full - sel');
  basic(view, YES, NO);
  icon(view, 'sc-icon-folder-16');
  label(view, 'List Item');
  disclosure(view, YES);
  checkbox(view, YES);
  count(view, 23);
  branch(view, YES);
});

test("icon", function() {
  var view = pane.view('icon');
  icon(view, 'sc-icon-folder-16');
});

test("icon defined in view and in content", function() {
  var view = pane.view('icon - contentandview');
  icon(view, 'sc-icon-folder-16');
});

test("icon defined only in view", function() {
  var view = pane.view('icon - view');
  icon(view, 'sc-icon-info-16');
});

test('disclosure', function() {
  disclosure(pane.view('disclosure - YES'), YES);
  disclosure(pane.view('disclosure - NO'), NO);
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

function adjustView(view, key, value) {
  SC.RunLoop.begin();
  view.set(key, value);
  SC.RunLoop.end();
}

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


test("changing disclosure value should update display", function() {
  var view = pane.view('full');
  adjustView(view, 'disclosureState', SC.BRANCH_CLOSED);
  disclosure(view, NO);
  
  // changing to leaf node should remove disclosure view
  adjustView(view, 'disclosureState', SC.LEAF_NODE);
  disclosure(view, null);
  
  // changing back to open/closed should add the disclosure back
  adjustView(view, 'disclosureState', SC.BRANCH_OPEN);
  disclosure(view, YES);
});

test("changing checkbox value should update display", function() {
  var view = pane.view('full');
  adjustContent(view, 'checkbox', NO);
  checkbox(view, NO); // verify change
  
  // changing to null should remove checkbox view
  adjustContent(view, 'checkbox', null);
  checkbox(view, null);

  // changing back to YES should add the checkbox back
  adjustContent(view, 'checkbox', YES);
  checkbox(view, YES);
});

test("changing count value should update display", function() {
  var view = pane.view('full');

  adjustContent(view, 'count', 100);
  count(view, 100); // verify change

  adjustContent(view, 'count', 0);
  count(view, null); // verify change
});

