// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test equals context ok same Q$ */

module("SC.View#destroyLayer");

test("it if has no layer, does nothing", function() {
  var callCount = 0;
  var view = SC.View.create({ 
    willDestroyLayer: function() { callCount++; }
  });
  ok(!view.get('layer'), 'precond - does NOT have layer');
  
  view.destroyLayer();
  equals(callCount, 0, 'did not invoke callback');
});

test("if it has a layer, calls willDestroyLayer on receiver and child views then deletes the layer", function() {
  var callCount = 0;
  
  var view = SC.View.create({
    willDestroyLayer: function() { callCount++; },
    childViews: [SC.View.extend({
      // no willDestroyLayer here... make sure no errors are thrown
      childViews: [SC.View.extend({
        willDestroyLayer: function() { callCount++; }
      })]
    })]
  });
  view.createLayer();
  ok(view.get('layer'), 'precond - view has layer');
  
  view.destroyLayer();
  equals(callCount, 2, 'invoked destroy layer');  
  ok(!view.get('layer'), 'view no longer has layer');
});

test("if it has a layer, calls willDestroyLayerMixin on receiver and child views if defined (comes from mixins)", function() {
  var callCount = 0;

  // make sure this will call both mixins...
  var mixinA = {
    willDestroyLayerMixin: function() { callCount++; }
  };
  
  var mixinB = {
    willDestroyLayerMixin: function() { callCount++; }
  };
  
  var view = SC.View.create(mixinA, mixinB, {
    childViews: [SC.View.extend(mixinA, mixinB, {
      childViews: [SC.View.extend(mixinA)]
    })]
  });
  view.createLayer();
  view.destroyLayer();
  equals(callCount, 5, 'invoked willDestroyLayerMixin on all mixins');  
});

test("returns receiver", function() {
  var view = SC.View.create().createLayer();
  equals(view.destroyLayer(), view, 'returns receiver');
});

test("removes layer from parentNode if in DOM", function() {
  var view = SC.View.create();
  var layer = view.createLayer().get('layer');
  
  ok(layer, 'precond - has layer');
  document.body.appendChild(layer); // add to document body
  
  view.destroyLayer();

  if(layer.parentNode) equals(layer.parentNode.nodeType, 11, 'layer no longer in parent node');
  else equals(layer.parentNode, null, 'layer no longer in parent node');
  layer = null; // cleanup
});


