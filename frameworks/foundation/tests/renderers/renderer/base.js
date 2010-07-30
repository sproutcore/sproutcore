// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test equals context ok */

var context = null, elem = null, testRenderer = null;

module("SC.Renderer", {
  setup: function() {
    elem = document.createElement('div');
    context = SC.RenderContext(elem) ;
    testRenderer = SC.Renderer.extend({
      render: function(context) {
        context.push("<a class='test'>Hello</a>");
      },
      update: function() {
        this.$(".test").text("Hi");
      },
      didAttachLayer: function(layer) {
        this.layerWasAttached = YES;
        this.layerAttached = layer;
      }
    }).create();
  },
  
  teardown: function() {
    testRenderer = elem = context = null; // avoid memory leaks
  }
});

test("calling layer() with no layer attached should return null.", function(){
  var renderer = testRenderer();
  equals(renderer.layer(), null, "there should be no layer yet");
});

test("calling layer() with an attached layer should return the layer.", function(){
  var renderer = testRenderer();
  renderer.attachLayer(elem);
  equals(renderer.layer(), elem, "layer should be the layer we attached.");
});

test("calling layer() with an attached layer provider should return the layer.", function(){
  var renderer = testRenderer();
  var layerProvider = {
    isLayerProvider: YES,
    getLayer: function() { return elem; }
  };
  
  renderer.attachLayer(layerProvider);
  equals(renderer.layerAttached, layerProvider, "make sure that we did indeed send the provider.");
  equals(renderer.layer(), elem, "layer should be the layer we attached via provider");
});

test("attaching a layer to a renderer causes didAttachLayer to be called with a layer.", function() {
  var renderer = testRenderer();
  ok(!renderer.renderWasCalled, "render should not be called");
  ok(!renderer.updateWasCalled, "update should not be called");
  ok(!renderer.layerWasAttached, "there should be no layer yet");
  renderer.attachLayer(elem);
  ok(!renderer.renderWasCalled, "render still should not be called");
  ok(!renderer.updateWasCalled, "update still should not be called");
  ok(renderer.layerWasAttached, "there should be now be a layer");
  equals(renderer.layerAttached, elem, "the attached layer ought to be our element");
});

test("attaching a layer provider to a renderer causes didAttachLayer to be called with the layer provider.", function() {
  var renderer = testRenderer();
  var layerProvider = {
    isLayerProvider: YES,
    getLayer: function() { return elem; }
  };
  
  ok(!renderer.renderWasCalled, "render should not be called");
  ok(!renderer.updateWasCalled, "update should not be called");
  ok(!renderer.layerWasAttached, "there should be no layer yet");
  renderer.attachLayer(layerProvider);
  ok(!renderer.renderWasCalled, "render still should not be called");
  ok(!renderer.updateWasCalled, "update still should not be called");
  ok(renderer.layerWasAttached, "there should be now be a layer");
  equals(renderer.layerAttached, layerProvider, "the attached layer ought to be our layer provider");
});

test("rendering to a context, attaching the layer, and then updating, updates the layer.", function() {
  // first, render
  var renderer = testRenderer();
  renderer.render(context);
  context.update();
  
  // now, get the render output
  var initialHTML = elem.innerHTML;
  
  // check that it cannot update without attaching layer (definitely should not be possible)
  renderer.update();
  equals(elem.innerHTML, initialHTML, "check that it can't update without attaching layer (should be impossible)");  
  
  // update
  renderer.attachLayer(elem);
  renderer.update();
  
  // check that buffering in jQuery prevented any adjustments
  equals(elem.innerHTML, initialHTML, "check that it can't update without flushing buffer");  
  
  // flush buffer
  SC.$.Buffer.flush();
  
  // and check again
  ok(elem.innerHTML != initialHTML, "it should now have updated.");
});

test("provide() provides a good layer provider.", function() {
  var renderer = testRenderer();
  
  // make sure that trying to get the layer before rendering returns null
  var provider = renderer.provide(".test");
  equals(provider.getLayer(), null, "Check that trying to get layer before rendering returns null.");
  
  // okay, render
  renderer.render(context);
  context.update();
  
  // the layer provider should NOT work yet, as we have not attached anything
  equals(provider.getLayer(), null, "provider still should not work--nothing attached.");
  
  // attach
  renderer.attachLayer(elem);
  
  // oddly, the same provider should work
  equals(provider.getLayer(), elem.childNodes[0], "previously non-functional provider should now work.");
  
  // now get new provider
  provider = renderer.provide(".test");
  equals(provider.getLayer(), elem.childNodes[0], "new provider should also work.");
});

test("setting properties in general works", function(){
  var renderer = testRenderer();
  renderer.attr("foo", "bar");
  equals(renderer.foo, "bar", "foo=bar now that we've set it.");
  
  renderer.attr({
    "test": "abc",
    "test2": "def"
  });
  
  equals(renderer.test, "abc", "test=abc");
  equals(renderer.test2, "def", "test2=def");
});

test("didChange and resetChanges work as expected", function() {
  var renderer = testRenderer();
  
  // foo should not have changed yet
  ok(!renderer.didChange("foo"), "foo can't have changed yet--it has never been set.");
  
  // let us change it
  renderer.attr("foo", "test");
  
  // check that it has now been marked as changed
  ok(renderer.didChange("foo"), "foo should be marked as having changed.");
  
  // reset, and check again
  renderer.resetChanges();
  ok(!renderer.didChange("foo"), "foo should not be marked as changed anymore.");
  
  // change to the same value. that should not count.
  renderer.attr("foo", "test");
  ok(!renderer.didChange("foo"), "we didn't really change it, did we?");
  
  // change again, and test again (just in case reset did something weird)
  renderer.attr("foo", "test2");
  ok(renderer.didChange("foo"), "we now really did change it.");
});