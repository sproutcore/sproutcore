// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2011 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/* globals module, test, equals, ok */
var content, delegate;

var Delegate = SC.Object.extend(SC.CollectionRowDelegate, {
  rowSize: 40,
  customRowSizeIndexes: SC.IndexSet.create(3).add(5,2),
  contentIndexRowSize: function(view, content, index) {
    return this.get('customRowSizeIndexes').contains(index) ? view.get('customRowSize') : this.get('rowSize');
  },

  expected: function(view) {
    var ret = [],
        content = view.get('content'),
        loc = view.get('length');

    while(--loc>=0) {
      ret[loc] = this.contentIndexRowSize(view,content,loc);
    }

    return ret ;
  }
});

module("SC.ListView.rowSizeForContentIndex", {
  setup: function() {
    content = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map(function(x) {
      return SC.Object.create({ value: x });
    }, this);

    // set this delegate if you want custom row heights
    delegate = Delegate.create();

  }
});

function verifyRowHeights(view, rowSize, expected) {
  var loc = view.get('length'), actual, totalExpected = 0,
    rowSpacing = view.get('rowSpacing') || 0;

  ok(loc>0, 'content should have some length');
  equals(view.rowSizeForContentIndex(loc+1), rowSize, 'content.rowSizeForContentIndex(length+1) should be rowSize');

  while(--loc>=0) {
    actual = view.rowSizeForContentIndex(loc);
    if (expected) {
      totalExpected += expected[loc];
      equals(actual, expected[loc], "content.rowSizeForContentIndex(%@) should be custom row height".fmt(loc));
    } else {
      totalExpected += rowSize;
      equals(actual, rowSize, 'content.rowSizeForContentIndex(%@) should be rowSize'.fmt(loc));
    }

    totalExpected += rowSpacing;
  }

  // Don't include spacing after the last item.
  equals(totalExpected - rowSpacing, view.get('layout').height, "The height of the list should match the total height of the rows including row spacing.");
}

// ..........................................................
// BASIC TESTS
//

test("constant row heights", function() {
  var view;
  SC.run(function() {
    view = SC.ListView.create({ content: content, rowSize: 40, customRowSizeIndexes: null });
  });
  verifyRowHeights(view, 40);
});

test("constant row heights with rowSpacing", function() {
  var view;
  SC.run(function() {
    view = SC.ListView.create({ content: content, rowSize: 40, rowSpacing: 2, customRowSizeIndexes: null });
  });
  verifyRowHeights(view, 40);
});

test("custom row heights", function() {
  var view;
  SC.run(function() {
    view = SC.ListView.create({
      content: content,
      customRowSize: 50,
      delegate: delegate
    });
  });

  verifyRowHeights(view, 40, delegate.expected(view));
});

test("adding delegate should update calculation", function() {
  var view;
  SC.run(function() {
    view = SC.ListView.create({
      content: content,
      rowSize: 30,
      customRowSize: 50
    });
  });

  verifyRowHeights(view, 30);

  SC.run(function() {
    view.set('delegate', delegate);
  });
  verifyRowHeights(view, 40, delegate.expected(view));
});

test("changing delegate from custom to not custom should update", function() {
  var view;
  SC.run(function() {
    view = SC.ListView.create({
      content: content,
      rowSize: 30,
      customRowSize: 50,
      delegate: delegate
    });
  });
  verifyRowHeights(view, 40, delegate.expected(view));

  SC.run(function() {
    delegate.set('customRowSizeIndexes', null);
  });
  verifyRowHeights(view, 40);
});

// ..........................................................
// SPECIAL CASES
//

test("computed custom row size indexes", function() {

  delegate = Delegate.create({
    indexes: Delegate.prototype.customRowSizeIndexes,
    useIndexes: NO,

    customRowSizeIndexes: function() {
      return this.get('useIndexes') ? this.get('indexes') : null;
    }.property('useIndexes').cacheable()
  });

  var view;
  SC.run(function() {
    view = SC.ListView.create({
      content: content,
      rowSize: 15,
      customRowSize: 50,
      delegate: delegate
    });
  });
  verifyRowHeights(view, 40);


  SC.run(function() {
    delegate.set('useIndexes', YES);
  });
  verifyRowHeights(view, 40, delegate.expected(view));
});

