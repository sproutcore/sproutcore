// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            portions copyright @2009 Apple Inc.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/*
  This test evaluates a plain list with no custom row heights, outlines, 
  group views or any other non-standard behavior.
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

var pane = SC.ControlTestPane.design()
  .add("Custom Row Heights", SC.ScrollView.design({
    layout: { left: 0, right: 0, top: 0, height: 200 },
    hasHorizontalScroller: NO,
    contentView: SC.ListView.design({
      content: ContentArray.create({ length: 100001 }),
      customRowHeightIndexes: SC.IndexSet.create(2,5).add(10000,100),
      
      // used for testing
      adjustableRows: SC.IndexSet.create(0,5),
      altRowHeight: 10,
      
      contentIndexRowHeight: function(view, content, index) {
        var ret =this.get('rowHeight');
        if (!this.customRowHeightIndexes.contains(index)) return ret;
        return this.adjustableRows.contains(index) ? this.get('altRowHeight') : ret*2;
      },
      
      contentValueKey: "title",
      contentCheckboxKey: "isDone",
      contentUnreadCountKey: "unread",
      rowHeight: 20

    })
  }));
  
pane.show(); // add a test to show the test pane
window.pane = pane ;

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

module("SC.ListView - ui_row_heights", pane.standardSetup());

// ..........................................................
// BASIC RENDER TESTS
// 

test("rendering only incremental portion", function() {
  var listView = pane.view("Custom Row Heights").contentView; 
  same(listView.get("nowShowing"), SC.IndexSet.create(0, 10), 'nowShowing should be smaller IndexSet');
  equals(listView.get('childViews').length, listView.get('nowShowing').get('length'), 'should have same number of childViews as nowShowing length');  
});

test("scrolling by small amount should update incremental rendering", function() {
  var scrollView = pane.view('Custom Row Heights'),
      listView   = scrollView.contentView,
      exp;
  
  same(listView.get('nowShowing'), SC.IndexSet.create(0,10), 'precond - nowShowing has incremental range');

  // SCROLL DOWN ONE LINE
  SC.run(function() {
    scrollView.scrollTo(0,61);
  });
  
  // top line should have scrolled out of view
  exp = SC.IndexSet.create(4,9);
  same(listView.get('nowShowing'), exp, 'nowShowing should change to reflect new clippingFrame');

  verifyChildViewsMatch(listView.childViews, exp);

  // SCROLL DOWN ANOTHER LINE
  SC.run(function() {
    scrollView.scrollTo(0,83);
  });
  
  // top line should have scrolled out of view
  exp = SC.IndexSet.create(6,8);
  same(listView.get('nowShowing'), exp, 'nowShowing should change to reflect new clippingFrame');

  verifyChildViewsMatch(listView.childViews, exp);


  // SCROLL UP ONE LINE
  SC.run(function() {
    scrollView.scrollTo(0,66);
  });
  
  // top line should have scrolled out of view
  exp = SC.IndexSet.create(4,9);
  same(listView.get('nowShowing'), exp, 'nowShowing should change to reflect new clippingFrame');

  verifyChildViewsMatch(listView.childViews, exp);
  
});

// ..........................................................
// CHANGING ROW HEIGHTS
// 

test("manually calling rowHeightDidChangeForIndexes()", function() {
  var scrollView = pane.view('Custom Row Heights'),
      listView   = scrollView.contentView,
      exp;
  
  same(listView.get('nowShowing'), SC.IndexSet.create(0,10), 'precond - nowShowing has incremental range');
  
  // adjust row height and then invalidate a portion range
  SC.run(function() {
    listView.set('altRowHeight', 80);
    listView.rowHeightDidChangeForIndexes(listView.adjustableRows);
  });

  // nowShowing should adjust
  same(listView.get('nowShowing'), SC.IndexSet.create(0,5), 'visible range should decrease since row heights for some rows doubled');
  
  // as well as offset and heights for rows - spot check
  var view = listView.itemViewForContentIndex(3);
  same(view.get('layout'), { top: 120, left: 0, right: 0, height: 80 });

});

