module("SC.Pane - childViews");

test("SC.Pane should not attempt to recompute visibility on child views that do not have visibility support", function() {
  var pane = SC.Pane.create({
    childViews: ['noVisibility'],

    noVisibility: SC.CoreView
  });

  // tomdale insists on slowing down the tests with extra scope chain traversals
  var errored = NO;

  try {
    pane.append();
  } catch(e) {
    errored = YES;
  }

  ok(!errored, "appending a pane with child views without visibility does not result in an error");
});
