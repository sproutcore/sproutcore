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
      sectionA: SC.View.design({
        layout: { height: 100 }
      }),

      sectionB: SC.View.design({
        layout: { border: 1, height: 50 }
      }),

      sectionC: SC.View.design({
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

      sectionA: SC.View.design({
        layout: { width: 100 }
      }),

      sectionB: SC.View.design({
        layout: { border: 1, width: 50 }
      }),

      sectionC: SC.View.design({
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

      childViews: ['cellA', 'cellB', 'cellC', 'cellD'],

      layout: { left: 10, top: 20 }, 

      cellA: SC.View.design({
        layout: { width: 100, height: 24 },
        gridProperties: { row: 0, column: 0 }, 
      }),

      cellB: SC.View.design({
        // Actual layout will become { left: 110, width: 200, top: 0, height: 24 }
        layout: { width: 200 }, 
        gridProperties: { row: 0, column: 1 },  
      }),

      cellC: SC.View.design({
        // Actual layout will become { left: 0, width: 300, top: 29, height: 30 }
        layout: { height: 30 } ,
        gridProperties: { row: 1, column: 0, columnSpan: 2 }, 
      }),

      cellD: SC.View.design({
        // Actual layout will become { left: 320, width: 120, top: 0, height: 54 }
        layout: { width: 120 },
        gridProperties: { column: 2, rowSpan: 2, }, 
      })

    });
  });

  equals(view.cellA.layout.left, 0, "cellA left should be 0");
  equals(view.cellA.layout.top, 0, "cellA top should be 0");
  equals(view.cellA.layout.width, 100, "cellA width should be 100");
  equals(view.cellA.layout.height, 24, "cellA height should be 24");

  equals(view.cellB.layout.left, 110, "cellB left should be 110");
  equals(view.cellB.layout.top, 0, "cellB top should be 0");
  equals(view.cellB.layout.width, 200, "cellB width should be 200");
  equals(view.cellB.layout.height, 24, "cellB height should be 24");

  equals(view.cellC.layout.left, 0, "cellC left should be 0");
  equals(view.cellC.layout.top, 29, "cellC top should be 29");
  equals(view.cellC.layout.width, 300, "cellC width should be 300");
  equals(view.cellC.layout.height, 30, "cellC height should be 30");

  equals(view.cellD.layout.left, 320, "cellD left should be 320");
  equals(view.cellD.layout.top, 0, "cellD top should be 0");
  equals(view.cellD.layout.width, 120, "cellD width should be 120");
  equals(view.cellD.layout.height, 54, "cellD height should be 54");

  equals(view.layout.height, 59, "view height should be 59");
  equals(view.layout.width, 440, "view width should be 440");

});
