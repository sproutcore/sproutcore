module("SC.ScrollView integration");

test("should work with SC.TemplateView", function() {
  var pane = SC.MainPane.create({
    childViews: ['scrollView'],

    scrollView: SC.ScrollView.design({
      layout: { width: 400, height: 600 },

      contentView: SC.TemplateView.create({
        template: SC.Handlebars.compile("foo bar baz")
      })
    })
  });

  pane.append();
  var exceptionThrown = false;
  try {
    SC.RunLoop.begin().end();
  } catch (e) {
    exceptionThrown = true;
  }
  ok(!exceptionThrown, "Does not throw an exception at the end of the run loop.");
  pane.remove();
});

test("should work with views that have static layout applied", function() {
  var pane;
  try {
    pane = SC.MainPane.create({
      childViews: ['scrollView'],

      scrollView: SC.ScrollView.design({
        layout: { width: 400, height: 600 },

        contentView: SC.View.design({
          useStaticLayout: YES
        })
      })
    });

    pane.append();
    SC.RunLoop.begin().end();

    ok(true, "displays scroll view without throwing an exception");
  } finally {
    if (pane) { pane.remove(); }
  }
});

