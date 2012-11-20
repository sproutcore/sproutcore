// ==========================================================================
// Project:   SproutCore
// Copyright: @2012 7x7 Software, Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module, test, ok, equals*/


var containerView,
  pane,
  view1, view2;

module("SC.ContainerView Transitions", {
  setup: function () {
    SC.run(function () {
      view1 = SC.View.create({
        toString: function () { return 'View 1'; }
      });

      view2 = SC.View.create({
        toString: function () { return 'View 2'; }
      });

      containerView = SC.ContainerView.create({
        nowShowing: view1
      });

      pane = SC.Pane.create({
       layout: { width: 200, height: 200, left: 0, top: 0 },
       childViews: [containerView]
      }).append();
    });

    containerView.awake();
  },

  teardown: function () {
    pane.remove();
    containerView = pane = view1 = view2 = null;
  }
});


test("Test assumptions on the initial state of the container and views.", function () {
  ok(!containerView.get('isTransitioning'), "Container view should not indicate that it is transitioning.");
  ok(containerView.get('childViews').contains(view1), "View 1 should be a child view of container.");
  ok(!containerView.get('childViews').contains(view2), "View 2 should not be a child view of container.");
});


test("Test that the default transition (null) simply swaps the views.", function () {
  containerView.set('nowShowing', view2);

  equals(containerView.get('contentView'), view2, "Container's contentView should be");
  ok(!containerView.get('childViews').contains(view1), "View 1 should no longer be a child view of container.");
});

test("Test that the isTransitioning property of container view updates accordingly.", function () {
  // Pause the test execution.
  window.stop(2000);

  containerView.set('transition', SC.ContainerView.PUSH);
  containerView.set('nowShowing', view2);

  ok(containerView.get('isTransitioning'), "Container view should indicate that it is transitioning.");

  SC.run(function() {
    setTimeout(function() {
      SC.run(function() {
        ok(!containerView.get('isTransitioning'), "Container view should not indicate that it is transitioning.");
      });

      window.start();
    }, 1000);
  });
});

test("Test that the container view calls the proper transition plugin methods.", function () {
  var cancelCalled = 0,
    setupCalled = 0,
    teardownCalled = 0,
    runCalled = 0,
    plugin;

  // Pause the test execution.
  window.stop(2000);

  plugin = {
    cancel: function () { cancelCalled++; },
    setup: function () { setupCalled++; },
    teardown: function () { teardownCalled++; },
    run: function (a, b, c, d, onComplete) {
      runCalled++;

      setTimeout(function() {
        onComplete();
      }, 200);
    }
  };

  containerView.set('transition', plugin);
  containerView.set('nowShowing', view2);
  equals(cancelCalled, 0, "cancel() should have been called this many times");
  equals(setupCalled, 1, "setup() should have been called this many times");
  equals(runCalled, 0, "run() should have been called this many times");
  equals(teardownCalled, 0, "teardown() should have been called this many times");

  SC.run(function() {
    setTimeout(function() {
      equals(cancelCalled, 0, "cancel() should have been called this many times");
      equals(setupCalled, 1, "setup() should have been called this many times");
      equals(runCalled, 1, "run() should have been called this many times");
      equals(teardownCalled, 0, "teardown() should have been called this many times");
    }, 50);
  });

  setTimeout(function() {
    equals(cancelCalled, 0, "cancel() should have been called this many times");
    equals(setupCalled, 1, "setup() should have been called this many times");
    equals(runCalled, 1, "run() should have been called this many times");
    equals(teardownCalled, 1, "teardown() should have been called this many times");

    window.start();
  }, 250);
});
