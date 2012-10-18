// ==========================================================================
// Project:   SproutCore
// Copyright: @2012 7x7 Software, Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals R, CoreTest, module, test, equals*/


var pane, view1, view2, view3, view4, view5;


// Localized layout.
SC.metricsFor('English', {
  'Medium.left': 0.25,
  'Medium.right': 0.25,
});

var largeLayout = { centerX: 0, width: 100 },
  mediumLayout = "Medium".locLayout(),
  normalLayout = { top: 0, left: 0, bottom: 0, right: 0 },
  smallLayout = { left: 10, right: 10 };

var DesignModeTestView = SC.View.extend({

  designLayouts: {
    small: smallLayout,
    medium: mediumLayout,
    large: largeLayout
  },

  init: function() {
    sc_super();

    // Stub the set method.
    this.set = CoreTest.stub('setDesignMode', {
      action: SC.View.prototype.set,
      expect: function(callCount) {
        var i, setDesignModeCount = 0;

        for (i = this.history.length - 1; i >= 0; i--) {
          if (this.history[i][1] === 'designMode') {
            setDesignModeCount++;
          }
        }

        equals(setDesignModeCount, callCount, "set('designMode', ...) should have been called %@ times.".fmt(callCount));
      }
    });
  }
});

module("SC.View/SC.Pane Design Mode Support", {
  setup: function() {

    view4 = DesignModeTestView.create({});

    view3 = DesignModeTestView.create({
      childViews: [view4],

      // Override - no large design layout.
      designLayouts: {
        small: smallLayout,
        medium: "Medium".locLayout()
      }
    });

    view2 = DesignModeTestView.create({});

    view1 = DesignModeTestView.create({
      childViews: [view2, view3]
    });

    view5 = DesignModeTestView.create({});

    pane = SC.Pane.extend({
      childViews: [view1]
    });
  },

  teardown: function() {
    if (pane.remove) { pane.remove(); }

    pane = view1 = view2 = view3 = view4 = view5 = null;
  }

});


test("When you append a pane without designModes, it doesn't set designMode on itself or its childViews", function() {
  pane = pane.create();

  // designMode should not be set
  view1.set.expect(0);
  view2.set.expect(0);
  view3.set.expect(0);
  view4.set.expect(0);

  pane.append();

  // designMode should not be set
  view1.set.expect(0);
  view2.set.expect(0);
  view3.set.expect(0);
  view4.set.expect(0);

  equals(view1.get('designMode'), undefined, "designMode should be");
  equals(view2.get('designMode'), undefined, "designMode should be");
  equals(view3.get('designMode'), undefined, "designMode should be");
  equals(view4.get('designMode'), undefined, "designMode should be");

  same(view1.get('layout'), normalLayout, "layout should be");
  same(view2.get('layout'), normalLayout, "layout should be");
  same(view3.get('layout'), normalLayout, "layout should be");
  same(view4.get('layout'), normalLayout, "layout should be");

  same(view1.get('classNames'), ['sc-view'], "classNames should be");
  same(view2.get('classNames'), ['sc-view'], "classNames should be");
  same(view3.get('classNames'), ['sc-view'], "classNames should be");
  same(view4.get('classNames'), ['sc-view'], "classNames should be");
});

test("When windowSizeDidChange() is called on a pane without designModes, it doesn't set designMode on itself or its childViews.", function() {
  var oldSize = SC.RootResponder.responder.get('currentWindowSize'),
    newSize = oldSize;

  pane = pane.create().append();

  pane.windowSizeDidChange(oldSize, newSize);

  // designMode should not be set
  view1.set.expect(0);
  view2.set.expect(0);
  view3.set.expect(0);
  view4.set.expect(0);

  equals(view1.get('designMode'), undefined, "designMode should be");
  equals(view2.get('designMode'), undefined, "designMode should be");
  equals(view3.get('designMode'), undefined, "designMode should be");
  equals(view4.get('designMode'), undefined, "designMode should be");

  same(view1.get('layout'), normalLayout, "layout should be");
  same(view2.get('layout'), normalLayout, "layout should be");
  same(view3.get('layout'), normalLayout, "layout should be");
  same(view4.get('layout'), normalLayout, "layout should be");

  same(view1.get('classNames'), ['sc-view'], "classNames should be");
  same(view2.get('classNames'), ['sc-view'], "classNames should be");
  same(view3.get('classNames'), ['sc-view'], "classNames should be");
  same(view4.get('classNames'), ['sc-view'], "classNames should be");
});

test("When you add a view to a pane without designModes, it doesn't set designMode on the childView.", function() {
  pane = pane.create();
  pane.append();
  pane.appendChild(view5);

  // adjustDesign() shouldn't be called
  view5.set.expect(0);

  equals(view5.get('designMode'), undefined, "designMode should be");

  same(view5.get('layout'), normalLayout, "layout should be");

  same(view5.get('classNames'), ['sc-view'], "classNames should be");
});

test("When you append a pane with designModes, it sets designMode on itself and its childViews", function() {
  var oldSize = SC.RootResponder.responder.get('currentWindowSize');

  pane = pane.create({
    designModes: { small: oldSize.width - 10, large: Infinity }
  });

  // designMode should not be set
  view1.set.expect(0);
  view2.set.expect(0);
  view3.set.expect(0);
  view4.set.expect(0);

  pane.append();

  // designMode should be set (for initialization)
  view1.set.expect(1);
  view2.set.expect(1);
  view3.set.expect(1);
  view4.set.expect(1);

  equals(view1.get('designMode'), 'large', "designMode should be");
  equals(view2.get('designMode'), 'large', "designMode should be");
  equals(view3.get('designMode'), 'large', "designMode should be");
  equals(view4.get('designMode'), 'large', "designMode should be");

  same(view1.get('layout'), largeLayout, "layout should be");
  same(view2.get('layout'), largeLayout, "layout should be");
  same(view3.get('layout'), normalLayout, "layout should be");
  same(view4.get('layout'), largeLayout, "layout should be");

  same(view1.get('classNames'), ['sc-view', 'large'], "classNames should be");
  same(view2.get('classNames'), ['sc-view', 'large'], "classNames should be");
  same(view3.get('classNames'), ['sc-view', 'large'], "classNames should be");
  same(view4.get('classNames'), ['sc-view', 'large'], "classNames should be");
});

test("When windowSizeDidChange() is called on a pane with designModes, it sets designMode properly on itself and its childViews.", function() {
  var oldSize = SC.RootResponder.responder.get('currentWindowSize'),
    newSize = oldSize;

  pane = pane.create({
    designModes: { small: oldSize.width - 10, large: Infinity }
  });

  pane = pane.append();

  // designMode should be set (for initialization)
  view1.set.expect(1);
  view2.set.expect(1);
  view3.set.expect(1);
  view4.set.expect(1);

  equals(view1.get('designMode'), 'large', "designMode should be");
  equals(view2.get('designMode'), 'large', "designMode should be");
  equals(view3.get('designMode'), 'large', "designMode should be");
  equals(view4.get('designMode'), 'large', "designMode should be");

  same(view1.get('layout'), largeLayout, "layout should be");
  same(view2.get('layout'), largeLayout, "layout should be");
  same(view3.get('layout'), normalLayout, "layout should be");
  same(view4.get('layout'), largeLayout, "layout should be");

  same(view1.get('classNames'), ['sc-view', 'large'], "classNames should be");
  same(view2.get('classNames'), ['sc-view', 'large'], "classNames should be");
  same(view3.get('classNames'), ['sc-view', 'large'], "classNames should be");
  same(view4.get('classNames'), ['sc-view', 'large'], "classNames should be");

  newSize.width -= 5;
  pane.windowSizeDidChange(oldSize, newSize);
  oldSize = newSize;

  // designMode shouldn't be set again (didn't cross threshold)
  view1.set.expect(1);
  view2.set.expect(1);
  view3.set.expect(1);
  view4.set.expect(1);

  newSize.width -= 6;
  pane.windowSizeDidChange(oldSize, newSize);

  // designMode should be set (crossed threshold)
  view1.set.expect(2);
  view2.set.expect(2);
  view3.set.expect(2);
  view4.set.expect(2);

  equals(view1.get('designMode'), 'small', "designMode should be");
  equals(view2.get('designMode'), 'small', "designMode should be");
  equals(view3.get('designMode'), 'small', "designMode should be");
  equals(view4.get('designMode'), 'small', "designMode should be");

  same(view1.get('layout'), smallLayout, "layout should be");
  same(view2.get('layout'), smallLayout, "layout should be");
  same(view3.get('layout'), smallLayout, "layout should be");
  same(view4.get('layout'), smallLayout, "layout should be");

  same(view1.get('classNames'), ['sc-view', 'small'], "classNames should be");
  same(view2.get('classNames'), ['sc-view', 'small'], "classNames should be");
  same(view3.get('classNames'), ['sc-view', 'small'], "classNames should be");
  same(view4.get('classNames'), ['sc-view', 'small'], "classNames should be");
});

test("When you add a view to a pane with designModes, it sets designMode on the childView.", function() {
  var oldSize = SC.RootResponder.responder.get('currentWindowSize');

  pane = pane.create({
    designModes: { small: oldSize.width - 10, large: Infinity }
  });
  pane.append();
  pane.appendChild(view5);

  // designMode should be set
  view5.set.expect(1);
  equals(view5.get('designMode'), 'large', "designMode should be");

  same(view5.get('classNames'), ['sc-view', 'large'], "classNames should be");
});

test("When you set designModes on a pane without designModes, it sets designMode on the pane and its childViews.", function() {
  var oldSize = SC.RootResponder.responder.get('currentWindowSize');

  pane = pane.create();
  pane.append();

  // designMode should not be set
  view1.set.expect(0);
  view2.set.expect(0);
  view3.set.expect(0);
  view4.set.expect(0);

  SC.run(function() {
    pane.set('designModes', { small: oldSize.width - 10, large: Infinity });
  });

  // designMode should be set (for initialization)
  view1.set.expect(1);
  view2.set.expect(1);
  view3.set.expect(1);
  view4.set.expect(1);

  equals(view1.get('designMode'), 'large', "designMode should be");
  equals(view2.get('designMode'), 'large', "designMode should be");
  equals(view3.get('designMode'), 'large', "designMode should be");
  equals(view4.get('designMode'), 'large', "designMode should be");

  same(view1.get('layout'), largeLayout, "layout should be");
  same(view2.get('layout'), largeLayout, "layout should be");
  same(view3.get('layout'), normalLayout, "layout should be");
  same(view4.get('layout'), largeLayout, "layout should be");

  same(view1.get('classNames'), ['sc-view', 'large'], "classNames should be");
  same(view2.get('classNames'), ['sc-view', 'large'], "classNames should be");
  same(view3.get('classNames'), ['sc-view', 'large'], "classNames should be");
  same(view4.get('classNames'), ['sc-view', 'large'], "classNames should be");
});

test("When you change designModes on a pane with designModes, it sets designMode on the pane and its childViews if the design mode has changed.", function() {
  var oldSize = SC.RootResponder.responder.get('currentWindowSize');

  pane = pane.create({
    designModes: { small: oldSize.width - 10, large: Infinity }
  });
  pane.append();

  // designMode should be set (for initialization)
  view1.set.expect(1);
  view2.set.expect(1);
  view3.set.expect(1);
  view4.set.expect(1);

  equals(view1.get('designMode'), 'large', "designMode should be");
  equals(view2.get('designMode'), 'large', "designMode should be");
  equals(view3.get('designMode'), 'large', "designMode should be");
  equals(view4.get('designMode'), 'large', "designMode should be");

  same(view1.get('layout'), largeLayout, "layout should be");
  same(view2.get('layout'), largeLayout, "layout should be");
  same(view3.get('layout'), normalLayout, "layout should be");
  same(view4.get('layout'), largeLayout, "layout should be");

  same(view1.get('classNames'), ['sc-view', 'large'], "classNames should be");
  same(view2.get('classNames'), ['sc-view', 'large'], "classNames should be");
  same(view3.get('classNames'), ['sc-view', 'large'], "classNames should be");
  same(view4.get('classNames'), ['sc-view', 'large'], "classNames should be");

  // Change the small threshold
  SC.run(function() {
    pane.set('designModes', { small: oldSize.width + 10, large: Infinity });
  });

  // designMode should be set
  view1.set.expect(2);
  view2.set.expect(2);
  view3.set.expect(2);
  view4.set.expect(2);

  equals(view1.get('designMode'), 'small', "designMode should be");
  equals(view2.get('designMode'), 'small', "designMode should be");
  equals(view3.get('designMode'), 'small', "designMode should be");
  equals(view4.get('designMode'), 'small', "designMode should be");

  same(view1.get('layout'), smallLayout, "layout should be");
  same(view2.get('layout'), smallLayout, "layout should be");
  same(view3.get('layout'), smallLayout, "layout should be");
  same(view4.get('layout'), smallLayout, "layout should be");

  same(view1.get('classNames'), ['sc-view', 'small'], "classNames should be");
  same(view2.get('classNames'), ['sc-view', 'small'], "classNames should be");
  same(view3.get('classNames'), ['sc-view', 'small'], "classNames should be");
  same(view4.get('classNames'), ['sc-view', 'small'], "classNames should be");

  SC.run(function() {
    pane.set('designModes', { small: oldSize.width - 10, medium: oldSize.width + 10, large: Infinity });
  });

  // designMode should be set
  view1.set.expect(3);
  view2.set.expect(3);
  view3.set.expect(3);
  view4.set.expect(3);

  equals(view1.get('designMode'), 'medium', "designMode should be");
  equals(view2.get('designMode'), 'medium', "designMode should be");
  equals(view3.get('designMode'), 'medium', "designMode should be");
  equals(view4.get('designMode'), 'medium', "designMode should be");

  same(view1.get('layout'), mediumLayout, "layout should be");
  same(view2.get('layout'), mediumLayout, "layout should be");
  same(view3.get('layout'), mediumLayout, "layout should be");
  same(view4.get('layout'), mediumLayout, "layout should be");

  same(view1.get('classNames'), ['sc-view', 'medium'], "classNames should be");
  same(view2.get('classNames'), ['sc-view', 'medium'], "classNames should be");
  same(view3.get('classNames'), ['sc-view', 'medium'], "classNames should be");
  same(view4.get('classNames'), ['sc-view', 'medium'], "classNames should be");
});

test("When you unset designModes on a pane with designModes, it clears designMode on the pane and its childViews.", function() {
  var oldSize = SC.RootResponder.responder.get('currentWindowSize');

  pane = pane.create({
    designModes: { small: oldSize.width - 10, large: Infinity }
  });
  pane.append();

  // designMode should be set (for initialization)
  view1.set.expect(1);
  view2.set.expect(1);
  view3.set.expect(1);
  view4.set.expect(1);

  equals(view1.get('designMode'), 'large', "designMode should be");
  equals(view2.get('designMode'), 'large', "designMode should be");
  equals(view3.get('designMode'), 'large', "designMode should be");
  equals(view4.get('designMode'), 'large', "designMode should be");

  same(view1.get('layout'), largeLayout, "layout should be");
  same(view2.get('layout'), largeLayout, "layout should be");
  same(view3.get('layout'), normalLayout, "layout should be");
  same(view4.get('layout'), largeLayout, "layout should be");

  same(view1.get('classNames'), ['sc-view', 'large'], "classNames should be");
  same(view2.get('classNames'), ['sc-view', 'large'], "classNames should be");
  same(view3.get('classNames'), ['sc-view', 'large'], "classNames should be");
  same(view4.get('classNames'), ['sc-view', 'large'], "classNames should be");

  // Unset designModes
  SC.run(function() {
    pane.set('designModes', null);
  });

  // designMode should be set
  view1.set.expect(2);
  view2.set.expect(2);
  view3.set.expect(2);
  view4.set.expect(2);

  equals(view1.get('designMode'), null, "designMode should be");
  equals(view2.get('designMode'), null, "designMode should be");
  equals(view3.get('designMode'), null, "designMode should be");
  equals(view4.get('designMode'), null, "designMode should be");

  same(view1.get('layout'), largeLayout, "layout should be");
  same(view2.get('layout'), largeLayout, "layout should be");
  same(view3.get('layout'), normalLayout, "layout should be");
  same(view4.get('layout'), largeLayout, "layout should be");

  same(view1.get('classNames'), ['sc-view'], "classNames should be");
  same(view2.get('classNames'), ['sc-view'], "classNames should be");
  same(view3.get('classNames'), ['sc-view'], "classNames should be");
  same(view4.get('classNames'), ['sc-view'], "classNames should be");
});
