// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module, test, equals, ok, same */

var view;

/** Test isFixedLayout via isFixedSize and isFixedPosition properties. */
module("SC.View.prototype.isFixedLayout", {

  setup: function () {
    // Create a basic view.
    view = SC.View.create({});
  },

  teardown: function () {
    // Clean up.
    view.destroy();
    view = null;
  }

});

test("Test isFixedHeight, isFixedWidth and isFixedSize for various layouts.", function () {
  ok(!view.get('isFixedSize'), "The default layout doesn't correspond to a fixed size.");

  SC.run(function () { view.set('layout', { width: 100 }); });
  ok(view.get('isFixedWidth'), "A width alone gives a fixed width.");
  ok(!view.get('isFixedHeight'), "A width alone doesn't give a fixed height.");
  ok(!view.get('isFixedSize'), "A width alone doesn't correspond to a fixed size.");

  SC.run(function () { view.set('layout', { height: 100 }); });
  ok(!view.get('isFixedWidth'), "A height alone doesn't give a fixed width.");
  ok(view.get('isFixedHeight'), "A height alone gives a fixed height.");
  ok(!view.get('isFixedSize'), "A height alone doesn't correspond to a fixed size.");

  SC.run(function () { view.set('layout', { width: 100, height: 100 }); });
  ok(view.get('isFixedWidth'), "A width & height give a fixed width.");
  ok(view.get('isFixedHeight'), "A width & height give a fixed height.");
  ok(view.get('isFixedSize'), "A width & height corresponds to a fixed size.");
});

test("Test isFixedPosition for various layouts.", function () {
  ok(view.get('isFixedPosition'), "The default layout corresponds to a fixed position.");

  SC.run(function () { view.set('layout', { left: 0 }); });
  ok(view.get('isFixedPosition'), "A left: 0 (implied top, bottom, right) corresponds to a fixed position.");

  SC.run(function () { view.set('layout', { top: 0 }); });
  ok(view.get('isFixedPosition'), "A top: 0 (implied left, bottom, right) corresponds to a fixed position.");

  SC.run(function () { view.set('layout', { left: 0, top: 0 }); });
  ok(view.get('isFixedPosition'), "A left: 0, top: 0 corresponds to a fixed position.");

  SC.run(function () { view.set('layout', { left: 50 }); });
  ok(view.get('isFixedPosition'), "A left: 50 corresponds to a fixed position.");

  SC.run(function () { view.set('layout', { top: 50 }); });
  ok(view.get('isFixedPosition'), "A top: 50 corresponds to a fixed position.");

  SC.run(function () { view.set('layout', { left: 50, top: 50 }); });
  ok(view.get('isFixedPosition'), "A left: 50, top: 50 corresponds to a fixed position.");

  SC.run(function () { view.set('layout', { right: 0 }); });
  ok(view.get('isFixedPosition'), "A right: 0 (implied left) corresponds to a fixed position.");

  SC.run(function () { view.set('layout', { bottom: 0 }); });
  ok(view.get('isFixedPosition'), "A bottom: 0 (implied top) corresponds to a fixed position.");

  SC.run(function () { view.set('layout', { right: 50 }); });
  ok(view.get('isFixedPosition'), "A right: 50 (implied left) corresponds to a fixed position.");

  SC.run(function () { view.set('layout', { bottom: 50 }); });
  ok(view.get('isFixedPosition'), "A bottom: 50 (implied top) corresponds to a fixed position.");

  SC.run(function () { view.set('layout', { width: 100 }); });
  ok(view.get('isFixedPosition'), "A width: 100 (implied left) corresponds to a fixed position.");

  SC.run(function () { view.set('layout', { height: 100 }); });
  ok(view.get('isFixedPosition'), "A height: 100 (implied top) corresponds to a fixed position.");

  SC.run(function () { view.set('layout', { right: 0, width: 100 }); });
  ok(!view.get('isFixedPosition'), "A right: 0, width: 100 (overridden left) doesn't correspond to a fixed position.");

  SC.run(function () { view.set('layout', { bottom: 0, height: 100 }); });
  ok(!view.get('isFixedPosition'), "A bottom: 0, height: 100 (overridden top) doesn't correspond to a fixed position.");

  SC.run(function () { view.set('layout', { centerX: 0, width: 100 }); });
  ok(!view.get('isFixedPosition'), "A centerX: 0, width: 100 (overridden left) doesn't correspond to a fixed position.");

  SC.run(function () { view.set('layout', { centerY: 0, height: 100 }); });
  ok(!view.get('isFixedPosition'), "A centerY: 0, height: 100 (overridden top) doesn't correspond to a fixed position.");

  SC.run(function () { view.set('layout', { left: 0.2 }); });
  ok(!view.get('isFixedPosition'), "A left: 0.2 (percentage left) doesn't correspond to a fixed position.");

  SC.run(function () { view.set('layout', { top: 0.2 }); });
  ok(!view.get('isFixedPosition'), "A top: 0.2 (percentage top) doesn't correspond to a fixed position.");

  SC.run(function () { view.set('layout', { left: SC.LAYOUT_AUTO }); });
  ok(!view.get('isFixedPosition'), "A left: SC.LAYOUT_AUTO (auto left) doesn't correspond to a fixed position.");

  SC.run(function () { view.set('layout', { top: SC.LAYOUT_AUTO }); });
  ok(!view.get('isFixedPosition'), "A top: SC.LAYOUT_AUTO (auto top) doesn't correspond to a fixed position.");
});

test("Test explicitLayout for various valid layouts.", function () {
  same(view.get('explicitLayout'), { top: 0, right: 0, bottom: 0, left: 0 }, "No layout is implied as");

  SC.run(function () { view.set('layout', { left: 5 }); });
  same(view.get('explicitLayout'), { top: 0, right: 0, bottom: 0, left: 5 }, "{ left: 5 } is implied as");

  SC.run(function () { view.set('layout', { top: 5 }); });
  same(view.get('explicitLayout'), { top: 5, right: 0, bottom: 0, left: 0 }, "{ top: 5 } is implied as");

  SC.run(function () { view.set('layout', { bottom: 5 }); });
  same(view.get('explicitLayout'), { top: 0, right: 0, bottom: 5, left: 0 }, "{ bottom: 5 } is implied as");

  SC.run(function () { view.set('layout', { right: 5 }); });
  same(view.get('explicitLayout'), { top: 0, right: 5, bottom: 0, left: 0 }, "{ right: 5 } is implied as");

  SC.run(function () { view.set('layout', { bottom: 5, left: 5 }); });
  same(view.get('explicitLayout'), { top: 0, right: 0, bottom: 5, left: 5 }, "{ bottom: 5, left: 5 } is implied as");

  SC.run(function () { view.set('layout', { right: 5, bottom: 5, left: 5 }); });
  same(view.get('explicitLayout'), { top: 0, right: 5, bottom: 5, left: 5 }, "{ right: 5, bottom: 5, left: 5 } is implied as");

  SC.run(function () { view.set('layout', { top: 5, right: 5, bottom: 5, left: 5 }); });
  same(view.get('explicitLayout'), { top: 5, right: 5, bottom: 5, left: 5 }, "{ top: 5, right: 5, bottom: 5, left: 5 } is implied as");

  SC.run(function () { view.set('layout', { top: 5, right: 5, bottom: 5 }); });
  same(view.get('explicitLayout'), { top: 5, right: 5, bottom: 5, left: 0 }, "{ top: 5, right: 5, bottom: 5 } is implied as");

  SC.run(function () { view.set('layout', { top: 5, right: 5 }); });
  same(view.get('explicitLayout'), { top: 5, right: 5, bottom: 0, left: 0 }, "{ top: 5, right: 5 } is implied as");

  SC.run(function () { view.set('layout', { width: 100 }); });
  same(view.get('explicitLayout'), { top: 0, width: 100, bottom: 0, left: 0 }, "{ width: 100 } is implied as");

  SC.run(function () { view.set('layout', { width: 100, right: 5 }); });
  same(view.get('explicitLayout'), { top: 0, width: 100, bottom: 0, right: 5 }, "{ width: 100, right: 5 } is implied as");

  SC.run(function () { view.set('layout', { height: 100 }); });
  same(view.get('explicitLayout'), { top: 0, height: 100, right: 0, left: 0 }, "{ height: 100 } is implied as");

  SC.run(function () { view.set('layout', { height: 100, bottom: 5 }); });
  same(view.get('explicitLayout'), { right: 0, height: 100, bottom: 5, left: 0 }, "{ height: 100, bottom: 5 } is implied as");

  // MIN/MAX

  SC.run(function () { view.set('layout', { minWidth: 100, maxHeight: 100 }); });
  same(view.get('explicitLayout'), { top: 0, right: 0, bottom: 0, left: 0, minWidth: 100, maxHeight: 100 }, "{ minWidth: 100, maxHeight: 100 } is implied as");

  SC.run(function () { view.set('layout', { maxWidth: 100, minHeight: 100 }); });
  same(view.get('explicitLayout'), { top: 0, right: 0, bottom: 0, left: 0, maxWidth: 100, minHeight: 100 }, "{ maxWidth: 100, minHeight: 100 } is implied as");

  // CENTERS

  SC.run(function () { view.set('layout', { centerX: 0, width: 100 }); });
  same(view.get('explicitLayout'), { top: 0, centerX: 0, width: 100, bottom: 0 }, "{ centerX: 0, width: 100 } is implied as");

  SC.run(function () { view.set('layout', { centerY: 0, height: 100 }); });
  same(view.get('explicitLayout'), { right: 0, centerY: 0, height: 100, left: 0 }, "{ centerY: 0, height: 100 } is implied as");

  // OPACITY

  SC.run(function () { view.set('layout', { opacity: 0.25 }); });
  same(view.get('explicitLayout'), { top: 0, right: 0, bottom: 0, left: 0, opacity: 0.25 }, "{ opacity: 0.25 } is implied as");

  // TRANSFORMS

  SC.run(function () { view.set('layout', { scale: 0.25 }); });
  same(view.get('explicitLayout'), { top: 0, right: 0, bottom: 0, left: 0, scale: 0.25 }, "{ scale: 0.25 } is implied as");

  SC.run(function () { view.set('layout', { transformOriginX: 0, transformOriginY: 1 }); });
  same(view.get('explicitLayout'), { top: 0, right: 0, bottom: 0, left: 0, transformOriginX: 0, transformOriginY: 1 }, "{ transformOriginX: 0, transformOriginY: 1 } is implied as");

  // BORDERS

  SC.run(function () { view.set('layout', { border: 1 }); });
  same(view.get('explicitLayout'), { top: 0, right: 0, bottom: 0, left: 0, borderTop: 1, borderRight: 1, borderBottom: 1, borderLeft: 1 }, "{ border: 1 } is implied as");

  SC.run(function () { view.set('layout', { border: 1, borderTop: 2 }); });
  same(view.get('explicitLayout'), { top: 0, right: 0, bottom: 0, left: 0, borderTop: 2, borderRight: 1, borderBottom: 1, borderLeft: 1 }, "{ border: 1, borderTop: 2 } is implied as");

  SC.run(function () { view.set('layout', { borderBottom: 1, borderTop: 2 }); });
  same(view.get('explicitLayout'), { top: 0, right: 0, bottom: 0, left: 0, borderTop: 2, borderBottom: 1 }, "{ borderBottom: 1, borderTop: 2 } is implied as");
});

test("Test explicitLayout for various invalid layouts.", function () {
  // Centered without a size dimension.
  SC.run(function () { view.set('layout', { centerX: 0 }); });
  same(view.get('explicitLayout'), { top: 0, centerX: 0, bottom: 0 }, "{ centerX: 0 } is implied as");

  // Centered without a size dimension.
  SC.run(function () { view.set('layout', { centerY: 0 }); });
  same(view.get('explicitLayout'), { left: 0, centerY: 0, right: 0 }, "{ centerY: 0 } is implied as");

  // Left, right & width
  SC.run(function () { view.set('layout', { left: 5, width: 100, right: 5 }); });
  same(view.get('explicitLayout'), { top: 0, left: 5, bottom: 0, width: 100 }, "{ left: 5, width: 100, right: 5 } is implied as");

  // Top, bottom & height
  SC.run(function () { view.set('layout', { top: 5, height: 100, bottom: 5 }); });
  same(view.get('explicitLayout'), { left: 0, top: 5, right: 0, height: 100 }, "{ top: 5, height: 100, bottom: 5 } is implied as");
});
