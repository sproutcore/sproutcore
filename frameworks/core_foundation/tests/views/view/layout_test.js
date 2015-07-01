// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module, test, equals, ok, same */

var view;

module("SC.View layout.js", {

  setup: function () {
    view = SC.View;
  },

  teardown: function () {
    if (view.destroy) { view.destroy(); }
    view = null;
  }
});

/* Properties */

test("Default Properties:", function () {
  view = view.create();
  equals(view.hasLayout, true, "The default value of hasLayout is");
  equals(view.backgroundColor, null, "The default value of backgroundColor is");
  equals(view.useStaticLayout, false, "The default value of useStaticLayout is");
  same(view.layout, { top: 0, left: 0, bottom: 0, right: 0 }, "The default value of layout is");
  equals(view.childViewsNeedLayout, false, "The default value of childViewsNeedLayout is");
  equals(view.childViewLayout, null, "The default value of childViewLayout is");
  equals(view.childViewLayoutOptions, null, "The default value of childViewLayoutOptions is");
  equals(view.isChildViewLayoutLive, true, "The default value of isChildViewLayoutLive is");
  equals(view.transitionAdjust, null, "The default value of transitionAdjust is");
  equals(view.transitionAdjustOptions, null, "The default value of transitionAdjustOptions is");
  same(view.get('borderFrame'), { x: 0, y: 0, width: 0, height: 0 }, "The default value of borderFrame is");
  same(view.get('explicitLayout'), { top: 0, left: 0, bottom: 0, right: 0 }, "The default value of explicitLayout is");
  equals(view.get('isFixedLayout'), false, "The default value of isFixedLayout is");
  equals(view.get('isFixedPosition'), true, "The default value of isFixedPosition is");
  equals(view.get('isFixedSize'), false, "The default value of isFixedSize is");
  equals(view.get('isFixedHeight'), false, "The default value of isFixedHeight is");
  equals(view.get('isFixedWidth'), false, "The default value of isFixedWidth is");
  equals(view.get('layoutView'), null, "The default value of layoutView is");
});

/* Methods */

// This method returns true if the layout change results in a change in size. This is based on a
// cache of the previous layout.
test("Method: _sc_checkForResize", function () {
  view = view.create();

  ok(view._sc_checkForResize !== undefined, 'defined', 'defined', "The method is");

  // Fully flexible layout.
  var previousLayout = { bottom: 0, left: 0, right: 0, top: 0 };
  equals(view._sc_checkForResize(previousLayout, { bottom: 0, left: 0, right: 0, top: 0 }), false, "When same flexible layout is checked, the method returns");
  equals(view._sc_checkForResize(previousLayout, { bottom: 0, left: 0, right: 0, top: 5 }), true, "When top of flexible height layout changes, the method returns");
  equals(view._sc_checkForResize(previousLayout, { bottom: 5, left: 0, right: 0, top: 0 }), true, "When bottom of flexible height layout changes, the method returns");
  equals(view._sc_checkForResize(previousLayout, { bottom: 0, left: 5, right: 0, top: 0 }), true, "When left of flexible width layout changes, the method returns");
  equals(view._sc_checkForResize(previousLayout, { bottom: 0, left: 0, right: 5, top: 0 }), true, "When right of flexible width layout changes, the method returns");

  // Vertically flexible layout.
  previousLayout = { bottom: 0, left: 0, width: 100, top: 0 };
  equals(view._sc_checkForResize(previousLayout, { bottom: 0, left: 0, width: 100, top: 0 }), false, "When same vertically flexible layout is checked, the method returns");
  equals(view._sc_checkForResize(previousLayout, { bottom: 0, left: 0, width: 100, top: 5 }), true, "When top of vertically flexible height layout changes, the method returns");
  equals(view._sc_checkForResize(previousLayout, { bottom: 5, left: 0, width: 100, top: 0 }), true, "When bottom of vertically flexible height layout changes, the method returns");
  equals(view._sc_checkForResize(previousLayout, { bottom: 0, left: 5, width: 100, top: 0 }), false, "When left of vertically flexible width layout changes, the method returns");
  equals(view._sc_checkForResize(previousLayout, { bottom: 0, left: 0, width: 105, top: 0 }), true, "When width of vertically flexible width layout changes, the method returns");

  // Horizontally flexible layout.
  previousLayout = { height: 100, left: 0, right: 0, top: 0 };
  equals(view._sc_checkForResize(previousLayout, { height: 100, left: 0, right: 0, top: 0 }), false, "When same horizontally flexible layout is checked, the method returns");
  equals(view._sc_checkForResize(previousLayout, { height: 100, left: 0, right: 0, top: 5 }), false, "When top of horizontally flexible height layout changes, the method returns");
  equals(view._sc_checkForResize(previousLayout, { height: 105, left: 0, right: 0, top: 0 }), true, "When height of horizontally flexible height layout changes, the method returns");
  equals(view._sc_checkForResize(previousLayout, { height: 100, left: 5, right: 0, top: 0 }), true, "When left of horizontally flexible width layout changes, the method returns");
  equals(view._sc_checkForResize(previousLayout, { height: 100, left: 0, right: 5, top: 0 }), true, "When right of horizontally flexible width layout changes, the method returns");

  // Fully fixed top/left layout.
  previousLayout = { height: 100, left: 0, width: 100, top: 0 };
  equals(view._sc_checkForResize(previousLayout, { height: 100, left: 0, width: 100, top: 0 }), false, "When same fully fixed top/left layout is checked, the method returns");
  equals(view._sc_checkForResize(previousLayout, { height: 100, left: 0, width: 100, top: 5 }), false, "When top of fully fixed top/left height layout changes, the method returns");
  equals(view._sc_checkForResize(previousLayout, { height: 105, left: 0, width: 100, top: 0 }), true, "When height of fully fixed top/left height layout changes, the method returns");
  equals(view._sc_checkForResize(previousLayout, { height: 100, left: 5, width: 100, top: 0 }), false, "When left of fully fixed top/left width layout changes, the method returns");
  equals(view._sc_checkForResize(previousLayout, { height: 100, left: 0, width: 105, top: 0 }), true, "When width of fully fixed top/left width layout changes, the method returns");

  // Fully fixed bottom/right layout.
  previousLayout = { height: 100, right: 0, width: 100, bottom: 0 };
  equals(view._sc_checkForResize(previousLayout, { height: 100, right: 0, width: 100, bottom: 0 }), false, "When same fully fixed bottom/right layout is checked, the method returns");
  equals(view._sc_checkForResize(previousLayout, { height: 100, right: 0, width: 100, bottom: 5 }), false, "When bottom of fully fixed bottom/right height layout changes, the method returns");
  equals(view._sc_checkForResize(previousLayout, { height: 105, right: 0, width: 100, bottom: 0 }), true, "When height of fully fixed bottom/right height layout changes, the method returns");
  equals(view._sc_checkForResize(previousLayout, { height: 100, right: 5, width: 100, bottom: 0 }), false, "When right of fully fixed bottom/right width layout changes, the method returns");
  equals(view._sc_checkForResize(previousLayout, { height: 100, right: 0, width: 105, bottom: 0 }), true, "When width of fully fixed bottom/right width layout changes, the method returns");

  // Switch between flexible to fixed layout.
  previousLayout = { bottom: 10, left: 10, right: 10, top: 10 };
  equals(view._sc_checkForResize(previousLayout, { height: 100, left: 10, width: 100, top: 10 }), true, "When switching from fully flexible to fully fixed top/left layout, the method returns");

  previousLayout = { bottom: 10, left: 10, width: 100, top: 10 };
  equals(view._sc_checkForResize(previousLayout, { height: 100, left: 10, width: 100, top: 10 }), true, "When switching from vertically flexible to fully fixed top/left layout, the method returns");

  previousLayout = { height: 100, left: 10, right: 10, top: 10 };
  equals(view._sc_checkForResize(previousLayout, { height: 100, left: 10, width: 100, top: 10 }), true, "When switching from horizontally flexible to fully fixed top/left layout, the method returns");

  // Switch between fixed layout with different anchor.
  previousLayout = { height: 100, left: 10, width: 100, top: 10 };
  equals(view._sc_checkForResize(previousLayout, { height: 100, right: 10, width: 100, bottom: 10 }), false, "When switching from fully fixed top/left to fully fixed bottom/right layout, the method returns");
});

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


module("SC.View.prototype.layoutDidChange");

test("notifies layoutStyle & frame change", function () {

  var view = SC.View.create();
  var layoutStyleCallCount = 0, frameCallCount = 0;

  view.addObserver('layoutStyle', function () { layoutStyleCallCount++; });
  view.addObserver('frame', function () { frameCallCount++; });

  SC.run(function () {
    // Manually indicate a layout change.
    view.layoutDidChange();
  });

  equals(frameCallCount, 1, 'should trigger observer for frame');
  equals(layoutStyleCallCount, 0, 'should not trigger observers for layoutStyle');

  // Attach to the document.
  var parent = SC.Pane.create();
  parent.append();
  parent.appendChild(view);

  equals(frameCallCount, 2, 'should trigger observers for frame when adopted');
  equals(layoutStyleCallCount, 0, 'should still not trigger observers for layoutStyle');

  SC.run(function () {
    view.adjust('top', 20);
  });

  equals(frameCallCount, 3, 'should trigger observers for frame when adjusted');
  equals(layoutStyleCallCount, 1, 'should trigger observers for layoutStyle when adjusted');

  // Clean up.
  view.destroy();
  parent.destroy();
});

test("invokes layoutDidChangeFor() on layoutView each time it is called", function () {

  var callCount = 0;
  var layoutView = SC.View.create({
    layoutDidChangeFor: function (changedView) {
      equals(this.get('childViewsNeedLayout'), YES, 'should set childViewsNeedLayout to YES before calling layoutDidChangeFor()');

      equals(view, changedView, 'should pass view');
      callCount++;

      // Original
      var set = this._needLayoutViews;
      if (!set) set = this._needLayoutViews = SC.CoreSet.create();
      set.add(changedView);
    }
  });

  var view = SC.View.create({ layoutView: layoutView });

  SC.run(function () {
    view.layoutDidChange();
    view.layoutDidChange();
    view.layoutDidChange();
  });

  equals(callCount, 3, 'should call layoutView.layoutDidChangeFor each time');

  // Clean up.
  layoutView.destroy();
  view.destroy();
});

test("invokes layoutChildViewsIfNeeded() on layoutView once per runloop", function () {

  var callCount = 0;
  var layoutView = SC.View.create({
    layoutChildViewsIfNeeded: function () {
      callCount++;
    }
  });

  var view = SC.View.create({ layoutView: layoutView });

  SC.run(function () {
    view.layoutDidChange();
    view.layoutDidChange();
    view.layoutDidChange();
  });

  equals(callCount, 1, 'should call layoutView.layoutChildViewsIfNeeded one time');

  // Clean up.
  layoutView.destroy();
  view.destroy();
});

test("should not invoke layoutChildViewsIfNeeded() if layoutDidChangeFor() sets childViewsNeedLayout to NO each time", function () {

  var callCount = 0;
  var layoutView = SC.View.create({
    layoutDidChangeFor: function () {
      this.set('childViewsNeedLayout', NO);
    },

    layoutChildViewsIfNeeded: function () {
      callCount++;
    }
  });

  var view = SC.View.create({ layoutView: layoutView });

  SC.run(function () {
    view.layoutDidChange();
    view.layoutDidChange();
    view.layoutDidChange();
  });

  equals(callCount, 0, 'should not call layoutView.layoutChildViewsIfNeeded');

  // Clean up.
  layoutView.destroy();
  view.destroy();
});

test('returns receiver', function () {
  var view = SC.View.create();

  SC.run(function () {
    equals(view.layoutDidChange(), view, 'should return receiver');
  });

  // Clean up.
  view.destroy();
});

test("is invoked whenever layout property changes", function () {

  var callCount = 0;
  var layoutView = SC.View.create({
    layoutDidChangeFor: function (changedView) {
      callCount++;

      // Original
      var set = this._needLayoutViews;
      if (!set) set = this._needLayoutViews = SC.CoreSet.create();
      set.add(changedView);
    }
  });

  var view = SC.View.create({ layoutView: layoutView });

  SC.run(function () {
    view.set('layout', { top: 0, left: 10 });
  });
  equals(callCount, 1, 'should call layoutDidChangeFor when setting layout of child view');

  // Clean up.
  layoutView.destroy();
  view.destroy();
});

test("is invoked on parentView if no layoutView whenever layout property changes", function () {

  var callCount = 0;
  var parentView = SC.View.create({
    layoutDidChangeFor: function (changedView) {
      callCount++;

      // Original
      var set = this._needLayoutViews;
      if (!set) set = this._needLayoutViews = SC.CoreSet.create();
      set.add(changedView);
    }
  });

  var view = SC.View.create({});
  view.set('parentView', parentView);

  SC.run(function () {
    view.set('layout', { top: 0, left: 10 });
  });
  equals(callCount, 1, 'should call layoutDidChangeFor when setting layout of child view');

  // Clean up.
  parentView.destroy();
  view.destroy();
});

test("proxies rotate to rotateZ when 3D transforms are supported", function () {
  // Retain CSS support information so we can return to it.
  var actualSupport = SC.platform.get('supportsCSS3DTransforms'),
      view;

  // YES SUPPORT
  SC.platform.set('supportsCSS3DTransforms', YES);
  view = SC.View.create();
  SC.run(function () {
    view.set('layout', { rotate: 45 });
  });
  equals(view.get('layout').rotate, undefined, "should clear rotate");
  equals(view.get('layout').rotateZ, 45, "should set rotateZ");
  // Clean up.
  view.destroy();

  // NO SUPPORT
  SC.platform.set('supportsCSS3DTransforms', NO);
  view = SC.View.create();
  SC.run(function () {
    view.set('layout', { rotate: 45 });
  });
  equals(view.get('layout').rotate, 45, "should retain rotate");
  equals(view.get('layout').rotateZ, undefined, "should not set rotateZ");
  // Clean up.
  view.destroy();

  // Clean up bigger picture.
  SC.platform.set('supportsCSS3DTransforms', actualSupport);
});

test("rotateZ and rotate together", function () {
  var view = SC.View.create({});

  SC.run(function () {
    view.set('layout', { rotate: 45, rotateZ: 90 });
  });

  equals(view.get('layout').rotate, 45, "if both rotate and rotateZ values are present, both should be retained; rotate is");

  equals(view.get('layout').rotateZ, 90, "if both rotate and rotateZ values are present, both should be retained; rotateZ is");

  // Clean up.
  view.destroy();
});

// The default implementation for viewDidResize calls internal layout-related
// methods on child views. This test confirms that child views that do not
// support layout do not cause this process to explode.
test("Calling viewDidResize on a view notifies its child views", function () {
  var regularViewCounter = 0, coreViewCounter = 0;

  var view = SC.View.create({
    childViews: ['regular', 'core'],

    regular: SC.View.extend({
      viewDidResize: function () {
        regularViewCounter++;
        // Make sure we call the default implementation to
        // ensure potential blow-uppy behavior is invoked
        sc_super();
      }
    }),

    core: SC.CoreView.extend({
      viewDidResize: function () {
        coreViewCounter++;
        sc_super();
      }
    })
  });

  view.viewDidResize();

  equals(regularViewCounter, 1, "regular view's viewDidResize gets called");
  equals(coreViewCounter, 1, "core view's viewDidResize gets called");

  // Clean up.
  view.destroy();
});


/**
  When a view's layout changes, _sc_checkForResize determines whether the size has changed using a comparison of the previously
  cached layout and the new (current) layout. If it seems that the view has resized, it calls `viewDidResize`. Previously
  it would call viewDidResize and then update the _sc_previousLayout cache afterward. This meant that any adjustments that
  were triggered by viewDidResize (which would in turn call _sc_checkForResize) would compare the new layout against the
  previous previous layout, instead of just the previous layout.

  Long story short, to ensure that _sc_checkForResize is checking the current layout against the *last* layout, it's important
  that the last layout, _sc_previousLayout, is updated *before* continuing on.
*/
test("SC.View.prototype.layoutDidChange() updates the _sc_previousLayout cache before calling viewDidResize", function () {
  var view1 = SC.View.create({
      layout: { width: 200, height: 200 },
      viewDidResize: function () {
        ok(this._sc_previousLayout !== originalPreviousLayout, "The previous layout should not be the same anymore.");
      }
    }),
    originalPreviousLayout;

  originalPreviousLayout = view1.get('layout');
  SC.run(function () { view1.adjust({ width: 100 }); });
});
