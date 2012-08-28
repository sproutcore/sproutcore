// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2011 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module, test, htmlbody, ok, equals, same, stop, start */


var view;

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

      layout: { centerX: 0, centerY: 0, height: 400, width: 200 },

      // ..........................................................
      // STUB: layoutForContentIndex
      //
      layoutForContentIndex: CoreTest.stub('layoutForContentIndex', SC.GridView.prototype.layoutForContentIndex),

    });

  },

  teardown: function() {
    view = null;
  }
});


/**
  GridView would adjust all of its item views every time that its clipping frame
  changed (which happens on scroll), which was very wasteful.  Instead, it was
  improved to only reposition the nowShowing item views, which improved the
  efficiency and also allowed the content to be sparse.  Finally, since the
  position of the item views is only effected by changes to the clippingFrame's
  width and not its x, y or height properties.  We can optimize it further to
  only adjust item views when the width is different.
*/
test("Optimized re-position of item views when the clipping frame changes.", function() {
  view.itemViewForContentIndex.expect(0);
  view.layoutForContentIndex.expect(0);

  SC.RunLoop.begin();
  view.notifyPropertyChange('clippingFrame');
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
