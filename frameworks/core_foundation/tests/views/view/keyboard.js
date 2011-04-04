// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
module("SC.View - Keyboard support");

test("Views only attempt to call performKeyEquivalent on child views that support it", function() {
  var performKeyEquivalentCalled = 0;

  var view = SC.View.design({
    childViews: ['unsupported', 'supported'],

    unsupported: SC.CoreView,
    supported: SC.View.design({
      performKeyEquivalent: function(str) {
        performKeyEquivalentCalled++;
        return NO;
      }
    })
  });

  view = view.create();
  view.performKeyEquivalent("ctrl_r");
  
  ok(performKeyEquivalentCalled > 0, "performKeyEquivalent is called on the view that supports it");
});

test("nextValidKeyView is receiver if it is the only view that acceptsFirstResponder", function() {
  var testView = SC.View.extend({acceptsFirstResponder: YES}),
  pane = SC.Pane.create({
    childViews: ['view1', 'view2'],

    view1: SC.View.extend({
      childViews: ['view3', 'view4'],

      view3: SC.View,

      view4: testView
    }),

    view2: SC.View.extend({
      childViews: ['view5', 'view6'],

      view5: SC.View,

      view6: SC.View
    })
  });

  // fake the pane being attached
  pane.set('isPaneAttached', YES);
  pane.recomputeIsVisibleInWindow();

  equals(pane.view1.view4.get('nextValidKeyView'), pane.view1.view4, "nextValidKeyView is receiver");
});

test("nextValidKeyView is null if no views have acceptsFirstResponder === YES", function() {
  var testView = SC.View.extend({acceptsFirstResponder: YES}),
  pane = SC.Pane.create({
    childViews: ['view1', 'view2'],

    view1: SC.View.extend({
      childViews: ['view3', 'view4'],

      view3: SC.View,

      view4: SC.View
    }),

    view2: SC.View.extend({
      childViews: ['view5', 'view6'],

      view5: SC.View,

      view6: SC.View
    })
  });

  // fake the pane being attached
  pane.set('isPaneAttached', YES);
  pane.recomputeIsVisibleInWindow();

  ok(SC.none(pane.view1.view4.get('nextValidKeyView')), "nextValidKeyView is null");
});

test("firstKeyView and nextKeyView of parents are respected", function() {
  var testView = SC.View.extend({acceptsFirstResponder: YES}),
  pane = SC.Pane.create({
    childViews: ['view1', 'view2', 'view7'],

    view1: SC.View.extend({
      childViews: ['view3', 'view4'],

      view3: testView,

      view4: testView
    }),

    view2: SC.View.extend({
      childViews: ['view5', 'view6'],

      view5: testView,

      view6: testView
    }),

    view7: SC.View.extend({
      childViews: ['view8', 'view9'],

      view8: testView,

      view9: testView
    })
  });

  // fake the pane being attached
  pane.set('isPaneAttached', YES);
  pane.recomputeIsVisibleInWindow();

  equals(pane.view2.view6.get('nextValidKeyView'), pane.view7.view8, "order is correct when first and next not set");

  pane.set('firstKeyView', pane.view2);
  pane.view2.set('nextKeyView', pane.view1);
  pane.view1.set('nextKeyView', pane.view7);

  equals(pane.view2.view6.get('nextValidKeyView'), pane.view1.view3, "order is respected when first and next are set");
});

test("nextValidKeyView is chosen correctly when nextKeyView is not a sibling", function() {
  var testView = SC.View.extend({acceptsFirstResponder: YES}),
  pane = SC.Pane.create({
    childViews: ['view1', 'view2'],

    view1: SC.View.extend({
      childViews: ['view3', 'view4'],

      view3: SC.View,

      view4: testView
    }),

    view2: SC.View.extend({
      childViews: ['view5', 'view6'],

      view5: testView,

      view6: SC.View
    })
  });

  // fake the pane being attached
  pane.set('isPaneAttached', YES);
  pane.recomputeIsVisibleInWindow();

  pane.view1.view4.set('nextKeyView', pane.view2.view5);
  pane.view2.view5.set('nextKeyView', pane.view1.view4);

  equals(pane.view1.view4.get('nextValidKeyView'), pane.view2.view5, "nextValidKeyView is correct");
  equals(pane.view2.view5.get('nextValidKeyView'), pane.view1.view4, "nextValidKeyView is correct");
});

test("nextValidKeyView is chosen correctly when child of parent's previous sibling has nextKeyView set", function() {
  var testView = SC.View.extend({acceptsFirstResponder: YES}),
  pane = SC.Pane.create({
    childViews: ['view1', 'view2'],

    view1: SC.View.extend({
      childViews: ['view3', 'view4'],

      view3: testView,

      view4: testView
    }),

    view2: SC.View.extend({
      childViews: ['view5', 'view6'],

      view5: testView,

      view6: testView
    })
  });

  pane.view1.view3.set('nextKeyView', pane.view1.view4);

  // fake the pane being attached
  pane.set('isPaneAttached', YES);
  pane.recomputeIsVisibleInWindow();

  equals(pane.view2.view5.get('nextValidKeyView'), pane.view2.view6, "nextValidKeyView chosen is next sibling");
});

test("nextValidKeyView checks for acceptsFirstResponder", function() {
  var pane = SC.Pane.create({
    childViews: ['view1', 'view2'],

    view1: SC.View.extend({
      acceptsFirstResponder: YES
    }),

    view2: SC.View.extend({
      acceptsFirstResponder: NO
    })
  });

  pane.view1.set('nextKeyView', pane.view2);

  // fake the pane being attached
  pane.set('isPaneAttached', YES);
  pane.recomputeIsVisibleInWindow();

  ok(pane.view1.get('nextValidKeyView') !== pane.view2, "nextValidKeyView is not nextKeyView because nextKeyView acceptsFirstResponder === NO");
});

test("nextValidKeyView prioritizes parent's lastKeyView even if nextKeyView is set", function() {
  var testView = SC.View.extend({acceptsFirstResponder: YES}),
  pane = SC.Pane.create({
    childViews: ['view1', 'view2'],

    view1: SC.View.extend({
      childViews: ['view3', 'view4'],

      lastKeyView: function() {
        return this.view3;
      }.property(),

      view3: testView,

      view4: testView
    }),

    view2: SC.View.extend({
      childViews: ['view5', 'view6'],

      view5: testView,

      view6: testView
    })
  });

  pane.view1.view3.set('nextKeyView', pane.view1.view4);

  // fake the pane being attached
  pane.set('isPaneAttached', YES);
  pane.recomputeIsVisibleInWindow();

  equals(pane.view1.view3.get('nextValidKeyView'), pane.view2.view5, "lastKeyView was respected; views after lastKeyView were skipped");
});

