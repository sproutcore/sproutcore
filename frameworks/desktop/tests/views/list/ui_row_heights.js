// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2011 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module, test, ok, same, equals */

/*
  These tests evaluate progressive rendering within the clippingFrame on a list with
  custom row heights, outlines, group views or any other non-standard behavior.
*/

// create a fake content array.  Generates a list with whatever length you
// want of objects with a title based on the index.  Cannot mutate.
var ContentArray = SC.Object.extend(SC.Array, {

  length: 0,

  objectAt: function(idx) {
    if (idx >= this.get('length')) return undefined;

    var content = this._content, ret ;
    if (!content) content = this._content = [];

    ret = content[idx];
    if (!ret) {
      ret = content[idx] = SC.Object.create({
        title: "ContentItem %@".fmt(idx),
        isDone: (idx % 3)===0,
        unread: (Math.random() > 0.5) ? Math.floor(Math.random() * 100) : 0
      });
    }

    return ret ;
  }
});

var pane = SC.ControlTestPane.design();
pane.add("Custom Row Heights", SC.ListView.design({
  // To avoid turning this into a SC.ScrollView integration test, our strategy is to override clippingFrame to allow
  // us to control it directly, focusing our tests on the "progressive rendering within a given clipping frame" unit.
  clippingFrame: function(key, value) {
    return value || { x: 0, y: 0, width: 100, height: 200 };
  }.property('frame', 'parentView').cacheable(),

  content: ContentArray.create({ length: 100001 }),
  customRowSizeIndexes: SC.IndexSet.create(2,5).add(10000,100),

  // used for testing
  adjustableRows: SC.IndexSet.create(0,5),
  altRowHeight: 10,

  contentIndexRowHeight: function(view, content, index) {
    var ret = this.get('rowHeight');
    if (!this.customRowSizeIndexes.contains(index)) return ret;
    else return this.adjustableRows.contains(index) ? this.get('altRowHeight') : ret * 2;
  },

  contentValueKey: "title",
  contentCheckboxKey: "isDone",
  contentUnreadCountKey: "unread",
  rowHeight: 20
}));
pane.add("Custom Row Heights 2", SC.ListView.design({
  // To avoid turning this into a SC.ScrollView integration test, our strategy is to override clippingFrame to allow
  // us to control it directly, focusing our tests on the "progressive rendering within a given clipping frame" unit.
  clippingFrame: function(key, value) {
    return value || { x: 0, y: 0, width: 100, height: 200 };
  }.property('frame', 'parentView').cacheable(),

  content: ContentArray.create({ length: 100 }),
  customRowSizeIndexes: SC.IndexSet.create(0,1000),

  contentIndexRowHeight: function(view, content, index) {
    if (index % 2 === 0) {
      return 17;
    }
    else {
      return 48;
    }
  },

  contentValueKey: "title",
  contentCheckboxKey: "isDone",
  contentUnreadCountKey: "unread",
  rowHeight: 48

}));

function verifyChildViewsMatch(views, set) {
  var indexes = set.clone();
  views.forEach(function(view) {
    var idx = view.contentIndex ;
    if (indexes.contains(idx)) {
      ok(YES, "should find childView for contentIndex %@ (nowShowing=%@)".fmt(idx, set));
    } else {
      ok(NO, "should NOT find childView for contentIndex %@ (nowShowing=%@)".fmt(idx, set));
    }
    indexes.remove(idx);
  }, this);

  if (indexes.get('length') === 0) {
    ok(YES, "all nowShowing indexes should have matching child views");
  } else {
    ok(NO, "all nowShowing indexes should have matching child views (indexes not found: %@)".fmt(indexes));
  }
}

module("SC.ListView - ui_row_heights", {
  setup: function () {
    pane.standardSetup().setup();
  },

  teardown: function () {
    pane.standardSetup().teardown();
  }
});

// ..........................................................
// BASIC RENDER TESTS
//

test("rendering only incremental portion", function() {
  var listView = pane.view("Custom Row Heights");
  same(listView.get("nowShowing"), SC.IndexSet.create(0, 10), 'nowShowing should be smaller IndexSet');
  equals(listView.get('childViews').length, listView.get('nowShowing').get('length'), 'should have same number of childViews as nowShowing length');
});

test("changing clippingFrame should update incremental rendering", function() {
  var listView = pane.view('Custom Row Heights'),
      exp;

  same(listView.get('nowShowing'), SC.IndexSet.create(0,10), 'precond - nowShowing has incremental range');

  // MOVE CLIPPING FRAME DOWN ONE LINE
  SC.run(function() {
    listView.set('clippingFrame', { x: 0, y: 61, width: 100, height: 200 });
  });

  // top line should now be clipped out of view
  exp = SC.IndexSet.create(4,9);
  same(listView.get('nowShowing'), exp, 'nowShowing should change to reflect new clippingFrame');

  verifyChildViewsMatch(listView.childViews, exp);

  // MOVE CLIPPING FRAME DOWN ANOTHER LINE
  SC.run(function() {
    listView.set('clippingFrame', { x: 0, y: 83, width: 100, height: 200 });
  });

  // next line should be clipped out of view
  exp = SC.IndexSet.create(5,9);
  same(listView.get('nowShowing'), exp, 'nowShowing should change to reflect new clippingFrame');

  verifyChildViewsMatch(listView.childViews, exp);


  // SCROLL UP ONE LINE
  SC.run(function() {
    listView.set('clippingFrame', { x: 0, y: 66, width: 100, height: 200 });
  });

  // top line should no longer be clipped
  exp = SC.IndexSet.create(4,9);
  same(listView.get('nowShowing'), exp, 'nowShowing should change to reflect new clippingFrame');

  verifyChildViewsMatch(listView.childViews, exp);

});

test("the 'nowShowing' property should be correct when scrolling", function() {
  var listView = pane.view('Custom Row Heights 2'),
      correctSet = SC.IndexSet.create(1, 7);

  // Clip down to point 36 to demonstrate a problem with the older list view
  // contentIndexesInRect code.
  SC.run(function() {
    listView.set('clippingFrame', { x: 0, y: 36, width: 100, height: 200 });
  });
  same(listView.get("nowShowing"), correctSet, 'nowShowing should %@'.fmt(correctSet));
});

// ..........................................................
// CHANGING ROW HEIGHTS
//

test("manually calling rowSizeDidChangeForIndexes()", function() {
  var listView = pane.view('Custom Row Heights');

  same(listView.get('nowShowing'), SC.IndexSet.create(0,10), 'precond - nowShowing has incremental range');

  // adjust row height and then invalidate a portion range
  SC.run(function() {
    listView.set('altRowHeight', 80);
    listView.rowSizeDidChangeForIndexes(listView.adjustableRows);
  });

  // nowShowing should adjust
  same(listView.get('nowShowing'), SC.IndexSet.create(0,4), 'visible range should decrease since row heights for some rows doubled');

  // as well as offset and heights for rows - spot check
  var view = listView.itemViewForContentIndex(3);
  same(view.get('layout'), { top: 120, left: 0, right: 0, height: 80 });

});

