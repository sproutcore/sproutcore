// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2013 7x7 Software, Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module, test, equals, ok */

var view;

/** Test the SC.View states. */
module("SC.View:childViewLayout", {

  setup: function () {
    view = SC.View.create();
  },

  teardown: function () {
    view.destroy();
    view = null;
  }

});

test("basic VERTICAL_STACK", function () {
  SC.run(function() {
    view = SC.View.create({

      childViewLayout: SC.View.VERTICAL_STACK,

      childViewLayoutOptions: {
        paddingBefore: 10,
        paddingAfter: 20,
        spacing: 5
      },
      childViews: ['sectionA', 'sectionB', 'sectionC'],
      layout: { left: 10, right: 10, top: 20 },
      sectionA: SC.View.extend({
        layout: { height: 100 }
      }),

      sectionB: SC.View.extend({
        layout: { border: 1, height: 50 }
      }),

      sectionC: SC.View.extend({
        layout: { left: 10, right: 10, height: 120 }
      })

    });
  });

  equals(view.sectionA.layout.top, 10, "sectionA top should be 10");
  equals(view.sectionB.layout.top, 115, "sectionB top should be 115");
  equals(view.sectionC.layout.top, 170, "sectionC top should be 170");
  equals(view.layout.height, 310, "view height should be 310");

});

test("basic HORIZONTAL_STACK", function () {
  SC.run(function() {
    view = SC.View.create({
      childViewLayout: SC.View.HORIZONTAL_STACK,
      childViewLayoutOptions: {
        paddingBefore: 10,
        paddingAfter: 20,
        spacing: 5
      },
      childViews: ['sectionA', 'sectionB', 'sectionC'],
      layout: { left: 10, bottom: 20, top: 20 },

      sectionA: SC.View.extend({
        layout: { width: 100 }
      }),

      sectionB: SC.View.extend({
        layout: { border: 1, width: 50 }
      }),

      sectionC: SC.View.extend({
        layout: { top: 10, bottom: 10, width: 120 }
      })
    });
  });

  equals(view.sectionA.layout.left, 10, "sectionA left should be 10");
  equals(view.sectionB.layout.left, 115, "sectionB left should be 115");
  equals(view.sectionC.layout.left, 170, "sectionC left should be 170");
  equals(view.layout.width, 310, "view width should be 310");

});

test("basic FLEX_GRID", function () {
  SC.run(function() {
    view = SC.View.create({
      childViewLayout: SC.View.FLEX_GRID,
      childViewLayoutOptions: {
        rowSpace: 5,
        columnSpace: 10,
      },

      layout: { left: 10, top: 20 },

      childViews: ['cellA', 'cellB', 'cellC', 'cellD'],

      cellA: SC.View.extend({
        layout: { width: 100, height: 24 },
        gridProperties: { row: 0, column: 0 },
      }),

      cellB: SC.View.extend({
        layout: { width: 200 },
        gridProperties: { row: 0, column: 1 },
      }),

      cellC: SC.View.extend({
        layout: { height: 30 },
        gridProperties: { row: 1, column: 0, columnSpan: 2 },
      }),

      cellD: SC.View.extend({
        layout: { width: 120 },
        gridProperties: { row: 0, column: 2, rowSpan: 2, },
      })

    });
  });

  equals(view.cellA.layout.left, 0, "cellA left");
  equals(view.cellA.layout.top, 0, "cellA top");
  equals(view.cellA.layout.width, 100, "cellA width");
  equals(view.cellA.layout.height, 24, "cellA height");

  equals(view.cellB.layout.left, 110, "cellB left");
  equals(view.cellB.layout.top, 0, "cellB top");
  equals(view.cellB.layout.width, 200, "cellB width");
  equals(view.cellB.layout.height, 24, "cellB height");

  equals(view.cellC.layout.left, 0, "cellC left");
  equals(view.cellC.layout.top, 29, "cellC top");
  equals(view.cellC.layout.width, 310, "cellC width");
  equals(view.cellC.layout.height, 30, "cellC height");

  equals(view.cellD.layout.left, 320, "cellD left");
  equals(view.cellD.layout.top, 0, "cellD top");
  equals(view.cellD.layout.width, 120, "cellD width");
  equals(view.cellD.layout.height, 59, "cellD height");

  equals(view.layout.height, 59, "view height should be 59");
  equals(view.layout.width, 440, "view width should be 440");
});

test("FLEX_GRID - with columnCount", function () {
  SC.run(function() {
    view = SC.View.create({
      childViewLayout: SC.View.FLEX_GRID,

      childViewLayoutOptions: {
        columnCount: 1,
        rowSpace: 5
      },
      childViews: ['sectionA', 'sectionB', 'sectionC'],
      layout: { left: 10, right: 10, top: 20 },
      sectionA: SC.View.extend({
        layout: { height: 100 }
      }),

      sectionB: SC.View.extend({
        layout: { border: 1, height: 50 }
      }),

      sectionC: SC.View.extend({
        layout: { left: 10, right: 10, height: 120 }
      })

    });
  });

  equals(view.sectionA.layout.top, 0, "sectionA top");
  equals(view.sectionB.layout.top, 105, "sectionB top");
  equals(view.sectionC.layout.top, 160, "sectionC");
  equals(view.layout.height, 280, "view height");

});

test("FLEX_GRID - with span", function () {
  SC.run(function() {
    view = SC.View.create({
      layout: { width: 100, height: 200 },
      childViewLayout: SC.View.FLEX_GRID,

      childViewLayoutOptions: {
        columnCount: 3,
        rowSpace: 10,
        columnSpace: 5,
        resizeToFit: false
      },
      childViews: ['spanTop', 'spanRight', 'spanLeft', 'cellCenter', 'spanBottom'],

      spanTop: SC.View.extend({
        gridProperties: { columnSpan: 2 }
      }),

      spanRight: SC.View.extend({
        gridProperties: { rowSpan: 2 }
      }),

      cellCenter: SC.View,

      spanLeft: SC.View.extend({
        gridProperties: { rowSpan: 2 }
      }),

      spanBottom: SC.View.extend({
        gridProperties: { columnSpan: 2 }
      }),
    });
  });

  equals(view.spanTop.layout.top, 0, "spanTop top");
  equals(view.spanTop.layout.left, 0, "spanTop left");
  equals(view.spanTop.layout.height, 60, "spanTop height");
  equals(view.spanTop.layout.width, 65, "spanTop width");
  equals(view.spanRight.layout.top, 0, "spanRight top");
  equals(view.spanRight.layout.left, 70, "spanRight left");
  equals(view.spanRight.layout.height, 130, "spanRight height");
  equals(view.spanRight.layout.width, 30, "spanRight width");
  equals(view.spanLeft.layout.top, 70, "spanLeft top");
  equals(view.spanLeft.layout.left, 0, "spanLeft left");
  equals(view.spanLeft.layout.height, 130, "spanLeft height");
  equals(view.spanLeft.layout.width, 30, "spanLeft width");
  equals(view.cellCenter.layout.top, 70, "cellCenter top");
  equals(view.cellCenter.layout.left, 35, "cellCenter left");
  equals(view.cellCenter.layout.height, 60, "cellCenter height");
  equals(view.cellCenter.layout.width, 30, "cellCenter width");
  equals(view.spanBottom.layout.top, 140, "spanBottom top");
  equals(view.spanBottom.layout.left, 35, "spanBottom left");
  equals(view.spanBottom.layout.height, 60, "spanBottom height");
  equals(view.spanBottom.layout.width, 65, "spanBottom width");
  equals(view.layout.width, 100, "view width");
  equals(view.layout.height, 200, "view height");
});



test("FLEX_GRID - with span layout horizontal", function () {
  SC.run(function() {
    view = SC.View.create({
      layout: { width: 100, height: 200 },
      childViewLayout: SC.View.FLEX_GRID,

      childViewLayoutOptions: {
        rowCount: 3,
        rowSpace: 10,
        columnSpace: 5,
        resizeToFit: false,
        layoutDirection: SC.LAYOUT_HORIZONTAL
      },
      childViews: ['spanTop', 'spanLeft', 'cellCenter', 'spanRight', 'spanBottom'],

      spanTop: SC.View.extend({
        gridProperties: { columnSpan: 2 }
      }),

      spanLeft: SC.View.extend({
        gridProperties: { rowSpan: 2 }
      }),

      cellCenter: SC.View,

      spanRight: SC.View.extend({
        gridProperties: { rowSpan: 2 }
      }),

      spanBottom: SC.View.extend({
        gridProperties: { columnSpan: 2 }
      }),
    });
  });

  equals(view.spanTop.layout.top, 0, "spanTop top");
  equals(view.spanTop.layout.left, 0, "spanTop left");
  equals(view.spanTop.layout.height, 60, "spanTop height");
  equals(view.spanTop.layout.width, 65, "spanTop width");
  equals(view.spanRight.layout.top, 0, "spanRight top");
  equals(view.spanRight.layout.left, 70, "spanRight left");
  equals(view.spanRight.layout.height, 130, "spanRight height");
  equals(view.spanRight.layout.width, 30, "spanRight width");
  equals(view.spanLeft.layout.top, 70, "spanLeft top");
  equals(view.spanLeft.layout.left, 0, "spanLeft left");
  equals(view.spanLeft.layout.height, 130, "spanLeft height");
  equals(view.spanLeft.layout.width, 30, "spanLeft width");
  equals(view.cellCenter.layout.top, 70, "cellCenter top");
  equals(view.cellCenter.layout.left, 35, "cellCenter left");
  equals(view.cellCenter.layout.height, 60, "cellCenter height");
  equals(view.cellCenter.layout.width, 30, "cellCenter width");
  equals(view.spanBottom.layout.top, 140, "spanBottom top");
  equals(view.spanBottom.layout.left, 35, "spanBottom left");
  equals(view.spanBottom.layout.height, 60, "spanBottom height");
  equals(view.spanBottom.layout.width, 65, "spanBottom width");
  equals(view.layout.width, 100, "view width");
  equals(view.layout.height, 200, "view height");
});

test("FLEX_GRID - resizeToFit and defaultRowHeight", function () {
  SC.run(function() {
    view = SC.View.create({
      layout: { width: 100 },
      childViewLayout: SC.View.FLEX_GRID,

      childViewLayoutOptions: {
        columnCount: 2,
        rowSpace: 8,
        columnSpace: 4,
        defaultRowHeight: 50
      },
      childViews: ['c1', 'c2', 'c3'],

      c1: SC.View.extend({
        gridProperties: { rowSpan: 2 },
        layout: { height: 100 }
      }),

      c2: SC.View.extend({
      }),

      c3: SC.View.extend({
        gridProperties: { columnSpan: 2 }
      }),
    });
  });

  equals(view.c1.layout.top, 0, "c1 top");
  equals(view.c1.layout.left, 0, "c1 left");
  equals(view.c1.layout.height, 100, "c1 height");
  equals(view.c1.layout.width, 48, "c1 width");
  equals(view.c2.layout.top, 0, "c2 top");
  equals(view.c2.layout.left, 52, "c2 left");
  equals(view.c2.layout.height, 46, "c2 height");
  equals(view.c2.layout.width, 48, "c2 width");
  equals(view.c3.layout.top, 108, "c3 top");
  equals(view.c3.layout.left, 0, "c3 left");
  equals(view.c3.layout.height, 50, "c3 height");
  equals(view.c3.layout.width, 100, "c3 width");
  equals(view.layout.width, 100, "view width");
  equals(view.layout.height, 158, "view height");
});


test("FLEX_GRID - resizeToFit and defaultRowHeight layout horizontal", function () {
  SC.run(function() {
    view = SC.View.create({
      layout: { height: 100 },
      childViewLayout: SC.View.FLEX_GRID,

      childViewLayoutOptions: {
        rowCount: 2,
        columnSpace: 8,
        rowSpace: 4,
        defaultColumnWidth: 50,
        layoutDirection: SC.LAYOUT_HORIZONTAL
      },
      childViews: ['c1', 'c2', 'c3'],

      c1: SC.View.extend({
        gridProperties: { columnSpan: 2 },
        layout: { width: 100 }
      }),

      c2: SC.View.extend({
      }),

      c3: SC.View.extend({
        gridProperties: { rowSpan: 2 }
      }),
    });
  });

  equals(view.c1.layout.top, 0, "c1 top");
  equals(view.c1.layout.left, 0, "c1 left");
  equals(view.c1.layout.height, 48, "c1 height");
  equals(view.c1.layout.width, 100, "c1 width");
  equals(view.c2.layout.top, 52, "c2 top");
  equals(view.c2.layout.left, 0, "c2 left");
  equals(view.c2.layout.height, 48, "c2 height");
  equals(view.c2.layout.width, 46, "c2 width");
  equals(view.c3.layout.top, 0, "c3 top");
  equals(view.c3.layout.left, 108, "c3 left");
  equals(view.c3.layout.height, 100, "c3 height");
  equals(view.c3.layout.width, 50, "c3 width");
  equals(view.layout.width, 158, "view width");
  equals(view.layout.height, 100, "view height");
});


test("FLEX_GRID - isVisible", function () {
  SC.run(function() {
    view = SC.View.create({
      childViewLayout: SC.View.FLEX_GRID,

      childViewLayoutOptions: {
        rowCount: 2,
        columnSpace: 8,
        rowSpace: 4,
        defaultRowHeight: 25,
        defaultColumnWidth: 50,
      },
      childViews: ['c1', 'c2', 'c3'],

      c1: SC.View,

      c2: SC.View.extend({
        isVisible: false
      }),

      c3: SC.View,
    });
  });

  equals(view.c1.layout.top, 0, "c1 top");
  equals(view.c1.layout.left, 0, "c1 left");
  equals(view.c1.layout.height, 25, "c1 height");
  equals(view.c1.layout.width, 50, "c1 width");
  equals(view.c3.layout.top, 0, "c3 top");
  equals(view.c3.layout.left, 58, "c3 left");
  equals(view.c3.layout.height, 25, "c3 height");
  equals(view.c3.layout.width, 50, "c3 width");
  equals(view.layout.width, 108, "view width");
  equals(view.layout.height, 25, "view height");
});

test("basic HORIZONTAL_STACK", function () {
  SC.run(function() {
    view = SC.View.create({
      childViewLayout: SC.View.HORIZONTAL_STACK,
      childViewLayoutOptions: {
        paddingBefore: 10,
        paddingAfter: 20,
        spacing: 5
      },
      childViews: ['sectionA', 'sectionB', 'sectionC'],
      layout: { left: 10, bottom: 20, top: 20 },

      sectionA: SC.View.extend({
        layout: { width: 100 }
      }),

      sectionB: SC.View.extend({
        layout: { border: 1, width: 50 }
      }),

      sectionC: SC.View.extend({
        layout: { top: 10, bottom: 10, width: 120 }
      })
    });
  });

  equals(view.sectionA.layout.left, 10, "sectionA left should be 10");
  equals(view.sectionB.layout.left, 115, "sectionB left should be 115");
  equals(view.sectionC.layout.left, 170, "sectionC left should be 170");
  equals(view.layout.width, 310, "view width should be 310");

});

test("HORIZONTAL_STACK - with fillRatio", function () {
  var view = null;
  SC.run(function() {
    view = SC.View.create({
      layout: { height: 10, width: 200 },
      childViewLayout: SC.View.HORIZONTAL_STACK,
      childViewLayoutOptions: {
        resizeToFit: NO,
        paddingBefore: 10,
        paddingAfter: 20,
        spacing: 10
      },
      childViews: [ "c1", "c2", "c3", "c4", "c5" ],

      c1: SC.View.extend({
        layout: { height: 10, width: 10 },
      }),
      c2: SC.View.extend({
        layout: { height: 10 },
        fillRatio: 1
      }),
      c3: SC.View.extend({
        layout: { height: 10, width: 10 },
      }),
      c4: SC.View.extend({
        layout: { height: 10 },
        fillRatio: 2
      }),
      c5: SC.View.extend({
        layout: { height: 10 },
        border: 1,
        isVisible: NO
      }),
    });
  });

  equals(view.c1.layout.left, 10, "c1 left should be 10");
  equals(view.c2.layout.left, 30, "c2 left should be 10");
  equals(view.c2.get( "borderFrame" ).width, 40, "c2 width should be 40");
  equals(view.c3.layout.left, 80, "c3 left should be 10");
  equals(view.c4.layout.left, 100, "c4 left should be 10");
  equals(view.c4.get( "borderFrame" ).width, 80, "c4 width should be 80");

  SC.run(function() {
    view.c2.set( "isVisible", NO );
    view.c4.set( "isVisible", NO );
    view.c5.set( "isVisible", YES );
  });

  equals(view.c1.layout.left, 10, "c1 left should be 10");
  equals(view.c3.layout.left, 30, "c3 left should be 30");
  equals(view.c5.layout.left, 50, "c5 left should be 50");
  equals(view.c5.get( "borderFrame" ).width, 130, "being the last child, c5 will extend to fill the available space, width should be 130");
});


test("VERTICAL_STACK - with fillRatio", function () {
  var view = null;
  SC.run(function() {
    view = SC.View.create({
      layout: { width: 10, height: 200 },
      childViewLayout: SC.View.VERTICAL_STACK,
      childViewLayoutOptions: {
        resizeToFit: NO,
        paddingBefore: 10,
        paddingAfter: 20,
        spacing: 10
      },
      childViews: [ "c1", "c2", "c3", "c4", "c5" ],

      c1: SC.View.extend({
        layout: { width: 10, height: 10 },
      }),
      c2: SC.View.extend({
        layout: { width: 10 },
        fillRatio: 1
      }),
      c3: SC.View.extend({
        layout: { width: 10, height: 10 },
      }),
      c4: SC.View.extend({
        layout: { width: 10 },
        fillRatio: 2
      }),
      c5: SC.View.extend({
        layout: { width: 10 },
        border: 1,
        isVisible: NO
      }),
    });
  });

  equals(view.c1.layout.top, 10, "c1 top should be 10");
  equals(view.c2.layout.top, 30, "c2 top should be 10");
  equals(view.c2.get( "borderFrame" ).height, 40, "c2 height should be 40");
  equals(view.c3.layout.top, 80, "c3 top should be 10");
  equals(view.c4.layout.top, 100, "c4 top should be 10");
  equals(view.c4.get( "borderFrame" ).height, 80, "c4 height should be 80");

  SC.run(function() {
    view.c2.set( "isVisible", NO );
    view.c4.set( "isVisible", NO );
    view.c5.set( "isVisible", YES );
  });

  equals(view.c1.layout.top, 10, "c1 top should be 10");
  equals(view.c3.layout.top, 30, "c3 top should be 30");
  equals(view.c5.layout.top, 50, "c5 top should be 50");
  equals(view.c5.get( "borderFrame" ).height, 130, "being the last child, c5 will extend to fill the available space, height should be 130");
});
