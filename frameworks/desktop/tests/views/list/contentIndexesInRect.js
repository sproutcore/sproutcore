// ==========================================================================
// Project:   SproutCore
// Copyright: ©2014 7x7 Software, Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*global module, test, same, ok, equals*/


var content, view;

module("SC.ListView.contentIndexesInRect", {
  setup: function () {
    content = "1 2 3 4 5 6 7 8 9 0".w().map(function (x) {
      return SC.Object.create({ value: x });
    }, this);

    SC.run(function() {
      view = SC.ListView.create({
        content: content,
        rowSize: 50
      });
    });
  },

  teardown: function () {
    view.destroy();
    content = view = null;
  }
});

test("contentIndexesInRect: rowSize of 50; no custom row sizes; no rowSpacing", function () {

  var rect = { x: 0, y: 0, height: 60, width: 100 },
      indexes = view.contentIndexesInRect(rect),
      expectedIndexes = SC.IndexSet.create(0, 2);

  ok(indexes.isEqual(expectedIndexes), "Content indexes [0, 1] are within { y: 0, height: 60 }.");

  rect = { x: 0, y: 0, height: 110, width: 100 };
  indexes = view.contentIndexesInRect(rect);
  expectedIndexes = SC.IndexSet.create(0, 3);

  ok(indexes.isEqual(expectedIndexes), "Content indexes [0, 1, 2] are within { y: 0, height: 110 }.");

  rect = { x: 0, y: 60, height: 60, width: 100 };
  indexes = view.contentIndexesInRect(rect);
  expectedIndexes = SC.IndexSet.create(1, 2);

  ok(indexes.isEqual(expectedIndexes), "Content indexes [1, 2] are within { y: 60, height: 60 }.");

});

test("contentIndexesInRect: rowSize of 50; no custom row sizes; rowSpacing: 50", function () {

  view.set('rowSpacing', 50);

  var rect = { x: 0, y: 0, height: 60, width: 100 },
      indexes = view.contentIndexesInRect(rect),
      expectedIndexes = SC.IndexSet.create(0, 1);

  ok(indexes.isEqual(expectedIndexes), "Content indexes [0] is within { y: 0, height: 60 }.");

  rect = { x: 0, y: 0, height: 110, width: 100 };
  indexes = view.contentIndexesInRect(rect);
  expectedIndexes = SC.IndexSet.create(0, 2);

  ok(indexes.isEqual(expectedIndexes), "Content indexes [0, 1] are within { y: 0, height: 110 }.");

  rect = { x: 0, y: 60, height: 60, width: 100 };
  indexes = view.contentIndexesInRect(rect);
  expectedIndexes = SC.IndexSet.create(1, 1);

  ok(indexes.isEqual(expectedIndexes), "Content indexes [1] is within { y: 60, height: 60 }.");

});

test("TODO contentIndexesInRect: custom row sizes");
