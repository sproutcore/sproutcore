// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test equals context ok same */
var testRenderer, rendererView, renderView, replacingRenderView, renderSkipUpdateView, expected_theme, viewSettingsWithChildren;

module("SC.View#renderer", {
  setup: function() {
    testRenderer = SC.Renderer.extend({
      someRenderProperty: 123,
      render: function(context) {
        if (this.contentProvider) this.contentProvider.renderContent(context);
        
        this.didRender = YES;
        context.attr("alt", "test");
        context.push("<a class='test'>Hello</a>");
      },
      update: function() {
        this.didUpdate = YES;
        this.$().attr("title", "test");
        this.$(".test").text("Hi");
      },
      didAttachLayer: function(layer) {
        this.layerWasAttached = YES;
        this.layerAttached = layer;
      }
    }).create();
    expected_theme = SC.Theme.find("sc-test");
    
    rendererView = SC.View.extend({
      theme: "sc-test",

      // the create renderer test
      createRenderer: function(theme) {
        this.createRendererWasCalled = YES;
        equals(theme, expected_theme, "the correct theme was passed");

        this.rendererInstance = testRenderer();
        return this.rendererInstance;
      },

      updateRenderer: function(r) {
        this.updateRendererWasCalled = YES;
        equals(r, this.rendererInstance, "Renderer should be the one we created");
      }
    });
    
    renderView = SC.View.extend({
      render: function(context, firstTime) {
        if (firstTime) {
          context.push("<a class='test'>Hello</a>");
        } else {
          context.attr("title", "test");
          this.$(".test").text("Hi");
        }
      }
    });
    
    renderSkipUpdateView = SC.View.extend({
      render: function(context, firstTime) {
        if (firstTime) {
          context.push("<a class='test'>Hello</a>");
        }
      }
    });
    
    replacingRenderView = SC.View.extend({
      render: function(context, firstTime) {
        if (firstTime) {
          context.push("<a class='test'>Hello</a>");
        } else {
          context.push("<a class='test'>Hi</a>");
          context.attr("title", "test");
        }
      }
    });
    
    viewSettingsWithChildren = {
      childViews: "child1 child2 child3 child4".w(),
      child1: SC.View.extend({
        classNames: "test-child test-1".w()
      }),
      child2: SC.View.extend({
        classNames: "test-child test-2".w(),
        render: function(context, firstTime) {
          // this one will render a-special, but only on firstTime
          if (firstTime) {
            context.push("<a class='test-2-content'>content</a>");
          }
        }
      }),
      child3: SC.View.extend({
        classNames: "test-child test-3".w(),
        render: function(context, firstTime) {
          this.didReceiveRender = YES;
          this.didReceiveRenderFirstTime = firstTime;
          
          // this one will always render fully.
          if (firstTime) context.push("<a class='test-3-content'>content</a>");
          else context.push("<a class='test-3-content'>content-updated</a>")
        }
      }),

      child4: SC.View.extend({
        classNames: "test-child test-4".w(),
        render: function(context, firstTime) {
          this.didReceiveRender = YES;
          this.didReceiveRenderFirstTime = firstTime;
          if (firstTime) {
            context.push("<a class='test-4-content'>content</a>");
          } else {
            this.$(".test-4-content").text("content-updated");
          }
        }
      })
    };
  },
  
  teardown: function() {
    testRenderer = null; // avoid memory leaks
  }
});

// themes may not be loaded in foundation, but we still need to test
SC.Theme.register("sc-test", SC.BaseTheme.extend({}));

test("creating the view calls createRenderer and updateRenderer when createRenderer is present", function() {
  var view = rendererView.create();
  ok(view.createRendererWasCalled, "createRenderer was called.");
  ok(view.updateRendererWasCalled, "updateRenderer was called.");
});

test("check that even if renderFirst, createLayer/updateLayer are called.", function() {
  // a renderFirsView
  var renderFirstView = rendererView.extend({
    render: function(context, firstTime){
    }
  });
  
  var view = renderFirstView.create();
  view.createLayer();
  
  ok(view.createRendererWasCalled, "createRenderer was called.");
  ok(view.updateRendererWasCalled, "updateRenderer was called.");
});

test("calling createLayer and updateLayer on renderFirst views trigger render and renderer in proper order.", function() {
  // a renderFirsView
  var renderFirstView = rendererView.extend({
    render: function(context, firstTime){
      if (firstTime) {
        this.renderFirstTimeWasCalled = YES;
        ok(!this.rendererInstance.didRender, "Did not use renderer to render yet.");
        ok(!this.rendererInstance.didUpdate, "Definitely did not update using renderer yet.");
        sc_super();
        ok(this.rendererInstance.didRender, "Now, should have rendered...");
        ok(!this.rendererInstance.didUpdate, "But, should not have updated.");
      } else {
        this.renderNotFirstTimeWasCalled = YES;
        ok(this.rendererInstance.didRender, "Should have used renderer to render...");
        ok(!this.rendererInstance.didUpdate, "... but not to update.");
        sc_super();
        ok(this.rendererInstance.didUpdate, "By now it should have updated..");
      }
    }
  });
  
  var view = renderFirstView.create();
  view.createLayer();
  
  // check that it was render first time, not the other way
  ok(view.renderFirstTimeWasCalled, "Called firstTime.");
  ok(!view.renderNotFirstTimeWasCalled, "Did not called non-firstTime.");
  
  // update
  view.updateLayer();
  
  // check that it was render first time, not the other way
  ok(view.renderNotFirstTimeWasCalled, "Did not called non-firstTime.");
});

test("calling createLayer and updateLayer on renderer-based views buffer, render, and update properly.", function() {
  var view = rendererView.create();
  view.createLayer();
  ok(view.$(".test").length > 0, "Created test element");
  equals(view.$(".test").text(), "Hello", "Test element text is");
  
  view.updateLayer();
  ok(view.$(".test").length > 0, "Test element is still present");
  equals(view.$(".test").text(), "Hello", "Test element text has not changed due to buffering ");
  equals(view.$().attr("title"), "", "Test element still has no title");
  
  SC.$.Buffer.flush();
  ok(view.$(".test").length > 0, "Test element is still present");
  equals(view.$(".test").text(), "Hi", "Test element text has changed to ");
  
  equals(view.$().attr("title"), "test", "Test element has a title of ");
});

test("calling createLayer and updateLayer on render-only views render and update properly.", function() {
  var view = renderView.create();
  view.createLayer();
  ok(view.$(".test").length > 0, "Created test element");
  equals(view.$(".test").text(), "Hello", "Test element text is");
  
  view.updateLayer();
  ok(view.$(".test").length > 0, "Test element is still present");
  equals(view.$(".test").text(), "Hi", "Test element text has changed to ");
  equals(view.$().attr("title"), "test", "Test element has a title of ");
});

test("calling createLayer and updateLayer on render-only views that replace content render and update properly.", function() {
  var view = replacingRenderView.create();
  view.createLayer();
  ok(view.$(".test").length > 0, "Created test element");
  equals(view.$(".test").text(), "Hello", "Test element text is");
  
  view.updateLayer();
  ok(view.$(".test").length > 0, "Test element is still present");
  equals(view.$(".test").text(), "Hi", "Test element text has changed to ");
  equals(view.$().attr("title"), "test", "Test element has a title of ");
});

test("calling createLayer and updateLayer on render-only views that ONLY do anything on firstTime works.", function() {
  var view = renderSkipUpdateView.create();
  view.createLayer();
  ok(view.$(".test").length > 0, "Created test element");
  equals(view.$(".test").text(), "Hello", "Test element text is");
  
  var oldHTML = view.get("layer").innerHTML;
  view.updateLayer();
  equals(view.get("layer").innerHTML, oldHTML, "HTML is still");
});

test("calling createLayer and displayDidChange on render-only views that ONLY do anything on firstTime works.", function() {
  var view = renderSkipUpdateView.create();
  view.createLayer();
  ok(view.$(".test").length > 0, "Created test element");
  equals(view.$(".test").text(), "Hello", "Test element text is");
  
  var oldHTML = view.get("layer").innerHTML;
  view.displayDidChange();
  equals(view.get("layer").innerHTML, oldHTML, "HTML is still");
});

test("calling createLayer and updateLayer on renderFirst views render and update properly.", function() {
  var renderFirstView = rendererView.extend({
    render: function(context, firstTime){
      context.attr("alt", "fromRender"); // will get overriden by renderer...
      sc_super();
      if (firstTime) {
        context.push("<a class='render'>original</a>");
      } else {
        context.attr("title", "renderOverride");
        this.$(".render").text("new");
      }
    }
  });
  
  var view = renderFirstView.create();
  view.createLayer();
  
  // check that the properties are all fine
  ok(view.$(".render").length > 0, "Render created its element");
  ok(view.$(".test").length > 0, "Renderer created its element");
  equals(view.$(".render").text(), "original", "Render set text to");
  
  // we should have "alt" from renderer: test
  equals(view.$().attr("alt"), "test", "alt should have been overridden by renderer");
  
  // update
  view.updateLayer();
  
  // and check again
  ok(view.$(".render").length > 0, "Render created its element");
  ok(view.$(".test").length > 0, "Renderer created its element");
  equals(view.$(".render").text(), "new", "Render changed its text to");
  
  // title should now be from render
  equals(view.$().attr("title"), "renderOverride", "title should now be");
});

test("rendering and updating a view with various kinds of non-renderer children works, without updating children.", function() {
  /* 
  We test 4 kinds of children:
  plain
  render function that pushes to context on firstTime
  render function that pushes to context no matter what
  render function that pushes on firstTime and updates otherwise.
  
  Note: We are, in fact, testing that updates do NOT happen.
  */
  var childViewsView = SC.View.extend(viewSettingsWithChildren);
  
  var view = childViewsView.create();
  view.createLayer();
  
  // check if rendering happened
  equals(view.$(".test-child").length, 4, "number of child views rendered should be");
  
  // now, check if the children themselves can access their layer
  ok(view.child1.$().hasClass("test-1"), "child view gets its layer and has class name");
  equals(view.child2.$(".test-2-content").text(), "content", "child view 2 has content");
  equals(view.child3.$(".test-3-content").text(), "content", "child view 3 has content");
  equals(view.child4.$(".test-4-content").text(), "content", "child view 4 has content");
  
  // now, update and try again
  view.updateLayer();
  
  // make sure we're still fine
  equals(view.$(".test-child").length, 4, "number of child views after updating should be");
  
  // now, check if the children themselves can access their layer
  // and note: they should NOT have updated (they get to do that themselves)
  ok(view.child1.$().hasClass("test-1"), "after updating child view gets its layer and has class name");
  equals(view.child2.$(".test-2-content").text(), "content", "child view 2 has content");
  equals(view.child3.$(".test-3-content").text(), "content", "child view 3 has NON-updated content");
  equals(view.child4.$(".test-4-content").text(), "content", "child view 4 has NOT updated content");
});

test("rendering and updating a view with a renderer-based parent.", function() {
  /* 
  We test 4 kinds of children:
  plain
  render function that pushes to context on firstTime
  render function that pushes to context no matter what
  render function that pushes on firstTime and updates otherwise.
  
  Note: We are, in fact, testing that updates do NOT happen.
  */
  var childViewsView = rendererView.extend(viewSettingsWithChildren);

  var view = childViewsView.create();
  view.createLayer();
  
  // check if rendering happened
  equals(view.$(".test-child").length, 4, "number of child views rendered should be");
  
  // now, check if the children themselves can access their layer
  ok(view.child1.$().hasClass("test-1"), "child view gets its layer and has class name");
  equals(view.child2.$(".test-2-content").text(), "content", "child view 2 has content");
  equals(view.child3.$(".test-3-content").text(), "content", "child view 3 has content");
  equals(view.child4.$(".test-4-content").text(), "content", "child view 4 has content");
  
  // now, update and try again
  view.updateLayer();
  
  // make sure we're still fine
  equals(view.$(".test-child").length, 4, "number of child views after updating should be");
  
  // now, check if the children themselves can access their layer
  // and note: they should NOT have updated (they get to do that themselves)
  ok(view.child1.$().hasClass("test-1"), "after updating child view gets its layer and has class name");
  equals(view.child2.$(".test-2-content").text(), "content", "child view 2 has content");
  equals(view.child3.$(".test-3-content").text(), "content", "child view 3 has NON-updated content");
  equals(view.child4.$(".test-4-content").text(), "content", "child view 4 has NOT updated content");
});

test("test that updateContents using a context works properly.", function() {
  var childViewsView = SC.View.extend(viewSettingsWithChildren);

  var view = childViewsView.create();
  view.createLayer();
  
  // now, update contents
  var context = SC.RenderContext(view.get("layer"));
  
  // reset settings that we'll check again
  view.child3.didReceiveRender = NO;
  view.child3.didReceiveRenderFirstTime = null;
  view.child4.didReceiveRender = NO;
  view.child4.didReceiveRenderFirstTime = null;
  
  // update
  view.renderChildViews(context, YES);
  context.update();
  
  // make sure we're still fine
  equals(view.$(".test-child").length, 4, "number of child views after updating should be");
  
  // ensure render was called on 3 and 4 (the trickiest of the bunch)
  ok(view.child3.didReceiveRender, "Child 3 was rendered.");
  ok(view.child4.didReceiveRender, "Child 4 was rendered.");
  ok(view.child3.didReceiveRenderFirstTime, "Child 3 should be first time.");
  ok(view.child4.didReceiveRenderFirstTime, "Child 4 should be first time.");
  
  // now, check if the children themselves can access their layer
  // and note: they should NOT have updated--we rendered firstTime (any other way will fail)
  ok(view.child1.$().hasClass("test-1"), "after updating child view gets its layer and has class name");
  equals(view.child2.$(".test-2-content").text(), "content", "child view 2 has content");
  equals(view.child3.$(".test-3-content").text(), "content", "child view 3 should not have updated content");
  equals(view.child4.$(".test-4-content").text(), "content", "child view 4 should not have updated content");
});

test("test that updateContents with a context but without firstTime works properly--updating children..", function() {
  var childViewsView = SC.View.extend(viewSettingsWithChildren);

  var view = childViewsView.create();
  view.createLayer();
  
  // now, update contents
  var context = SC.RenderContext(view.get("layer"));
  
  // reset settings that we'll check again
  view.child3.didReceiveRender = NO;
  view.child3.didReceiveRenderFirstTime = null;
  view.child4.didReceiveRender = NO;
  view.child4.didReceiveRenderFirstTime = null;
  
  // update
  view.renderChildViews(context, NO);
  context.update();
  
  // make sure we're still fine
  equals(view.$(".test-child").length, 4, "number of child views after updating should be");
  
  // ensure render was called on 3 and 4 (the trickiest of the bunch)
  ok(view.child3.didReceiveRender, "Child 3 was rendered.");
  ok(view.child4.didReceiveRender, "Child 4 was rendered.");
  ok(!view.child3.didReceiveRenderFirstTime, "Child 3 should not be first time.");
  ok(!view.child4.didReceiveRenderFirstTime, "Child 4 should not be first time.");
  
  // now, check if the children themselves can access their layer
  // and note: they should NOT have updated--we rendered firstTime (any other way will fail)
  ok(view.child1.$().hasClass("test-1"), "after updating child view gets its layer and has class name");
  equals(view.child2.$(".test-2-content").length, 0, "child view 2 should NOT have content (only renders on firstTime)");
  equals(view.child3.$(".test-3-content").text(), "content-updated", "child view 3 should have updated content");
  equals(view.child4.$(".test-4-content").text(), "content-updated", "child view 4 should have updated content");
});

test("Grab values from renderer.", function() {
  
  var view = rendererView.create(), view_ft = rendererView.create({
    someRenderProperty: SC.FROM_THEME
  }), 
  view_def = rendererView.create({
    someRenderProperty: SC.FROM_THEME,
    someRenderPropertyDefault: "abc"
  });
  
  view_def.renderer = null;
  
  equals(view.themed("someRenderProperty"), undefined, "The property should not be defined for this view");
  equals(view_ft.themed("someRenderProperty"), 123, "This should have fetched from renderer");
  equals(view_def.themed("someRenderProperty"), "abc", "This should have fetched from default value");
});