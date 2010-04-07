// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test equals context ok same */
var testRenderer, rendererView, renderView, expected_theme;

module("SC.View#renderer", {
  setup: function() {
    testRenderer = SC.Renderer.extend({
      render: function(context) {
        this.didRender = YES;
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
  },
  
  teardown: function() {
    testRenderer = null; // avoid memory leaks
  }
});

// themes may not be loaded in foundation, but we still need to test
SC.Theme.register("sc-test", SC.Theme.extend({}));

test("calling createLayer calls createRenderer and updateRenderer when createRenderer is present", function() {
  var view = rendererView.create();
  view.createLayer();
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

test("calling createLayer and updateLayer on renderer-based views render and update properly.", function() {
  var view = rendererView.create();
  view.createLayer();
  ok(view.$(".test").length > 0, "Created test element");
  equals(view.$(".test").text(), "Hello", "Test element text is");
  
  view.updateLayer();
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
