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
