// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2011 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module, test, htmlbody, ok, equals, same, stop, start */


var scrollView, view;

module("SC.GridView", {
  setup: function() {

    view = SC.GridView.create({
      content: "a b c d e f".w().map(function(x) {
        return SC.Object.create({ title: x });
      }),

      // ..........................................................
      // STUB: itemViewForContentIndex
      //
      itemViewForContentIndex: CoreTest.stub('itemViewForContentIndex', SC.GridView.prototype.itemViewForContentIndex),

      layout: { centerX: 0, height: 400, minWidth: 200 },

      // ..........................................................
      // STUB: layoutForContentIndex
      //
      layoutForContentIndex: CoreTest.stub('layoutForContentIndex', SC.GridView.prototype.layoutForContentIndex)

    });

    scrollView = SC.ScrollView.create({
      contentView: view,

      layout: { centerX: 0, centerY: 0, height: 400, width: 200 }
    })

  },

  teardown: function() {
    view = scrollView = null;
  }
});


/**
  GridView used to position items according to its clippingFrame, which meant
  that a GridView could not specify a frame width in order to scroll
  horizontally.  This also manifested in a bug where itemsPerRow was based on
  frame but clippingFrame would change first so that GridView's would not
  update properly when clippingFrame changed and frame did not change.  For
  example during a rotation on an iPad.
*/
test("GridView items should be positioned according to frame", function() {
  var columnWidth,
    itemsPerRow = view.get('itemsPerRow'),
    layout,
    expectedLayout;

  columnWidth = Math.floor(200/itemsPerRow);

  layout = view.layoutForContentIndex(0);
  expectedLayout = { left: 0, top: 0, height: 48, width: columnWidth };
  same(layout, expectedLayout, "Layout of first item should be");

  layout = view.layoutForContentIndex(2);
  expectedLayout = { left: 132, top: 0, height: 48, width: columnWidth };
  same(layout, expectedLayout, "Layout of third item should be");

  layout = view.layoutForContentIndex(3);
  expectedLayout = { left: 0, top: 48, height: 48, width: columnWidth };
  same(layout, expectedLayout, "Layout of fourth item should be");

  console.log(SC.stringFromRect(view.get('clippingFrame')));
  SC.RunLoop.begin();
  scrollView.adjust('width', 100);
  // view.set('clippingFrame', { x: 0, y: 0, width: 100, height: 400 });
  SC.RunLoop.end();

  console.log(SC.stringFromRect(view.get('clippingFrame')));
  layout = view.layoutForContentIndex(0);
  expectedLayout = { left: 0, top: 0, height: 48, width: columnWidth };
  same(layout, expectedLayout, "Layout of first item should be");

  layout = view.layoutForContentIndex(2);
  expectedLayout = { left: 132, top: 0, height: 48, width: columnWidth };
  same(layout, expectedLayout, "Layout of third item should be");

  layout = view.layoutForContentIndex(3);
  expectedLayout = { left: 0, top: 48, height: 48, width: columnWidth };
  same(layout, expectedLayout, "Layout of fourth item should be");
});


/**
  GridView would adjust all of its item views every time that its frame
  changed (which happens on scroll), which was very wasteful.  Instead, it was
  improved to only reposition the nowShowing item views, which improved the
  efficiency and also allowed the content to be sparse.  Finally, since the
  position of the item views is only effected by changes to the frame's
  width and not its x, y or height properties.  We can optimize it further to
  only adjust item views when the width is different.
*/
test("Optimized re-position of item views when the frame changes.", function() {
  view.itemViewForContentIndex.expect(0);
  view.layoutForContentIndex.expect(0);

  SC.RunLoop.begin();
  view.notifyPropertyChange('frame');
  SC.RunLoop.end();

  view.itemViewForContentIndex.expect(0);
  view.layoutForContentIndex.expect(0);

  SC.RunLoop.begin();
  view.adjust('height', 500);
  SC.RunLoop.end();

  view.itemViewForContentIndex.expect(0);
  view.layoutForContentIndex.expect(0);

  SC.RunLoop.begin();
  view.adjust('width', 400);
  SC.RunLoop.end();

  // Six item requests, twelve layout requests
  view.itemViewForContentIndex.expect(6);
  view.layoutForContentIndex.expect(12);
});
