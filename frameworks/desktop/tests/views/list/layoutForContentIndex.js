// ==========================================================================
// Project:   SproutCore
// Copyright: ©2014 7x7 Software, Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*global module, test, same, ok, equals*/


var content, view;

module("SC.ListView.layoutForContentIndex", {
  setup: function () {
    content = "1 2 3 4 5 6 7 8 9 0".w().map(function (x) {
      return SC.Object.create({ value: x });
    }, this);

    view = SC.ListView.create({
      content: content,
      rowSize: 50
    });
  },

  teardown: function () {
    view.destroy();
    content = view = null;
  }
});

test("Expected layout objects for each content index in vertical mode.", function () {
  for (var i = 0, len = content.length; i < len; i++) {
    same(view.layoutForContentIndex(i), { left: 0, right: 0, height: 50, top: i * 50 }, "The layout object at index %@ should be".fmt(i));
  }
});

test("Expected layout objects for each content index in horizontal mode.", function () {
  view.set('layoutDirection', SC.LAYOUT_HORIZONTAL);

  for (var i = 0, len = content.length; i < len; i++) {
    same(view.layoutForContentIndex(i), { top: 0, bottom: 0, width: 50, left: i * 50 }, "The layout object at index %@ should be".fmt(i));
  }
});
