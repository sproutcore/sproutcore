// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Apple, Inc. and contributors.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/*global module test equals context ok same */

module("SC.View#createLayer");

test("returns the receiver", function() {
  var v= SC.View.create();
  equals(v.createLayer(), v, 'returns receiver');
});

test("calls prepareContext() and sets layer to resulting element", function() {
  var v= SC.View.create({
    tagName: 'span',
    
    prepareContext: function(context, firstTime) {
      context.push("foo");
    }
  });
  
  equals(v.get('layer'), null, 'precondition - has no layer');
  v.createLayer();
  
  var elem = v.get('layer');
  ok(!!elem, 'has element now');
  equals(elem.innerHTML, 'foo', 'has innerHTML from context');
  equals(elem.tagName.toString().toLowerCase(), 'span', 'has tagName from view');
  elem = null ;
});

test("invokes didCreateLayer() on receiver and all child views", function() {
  var callCount = 0, mixinCount = 0;
  var v= SC.View.create({
    
    didCreateLayer: function() { callCount++; },
    didCreateLayerMixin: function() { mixinCount++; },
    
    childViews: [SC.View.extend({
      didCreateLayer: function() { callCount++; },
      childViews: [SC.View.extend({
        didCreateLayer: function() { callCount++; },
        didCreateLayerMixin: function() { mixinCount++; }
      }), SC.View.extend({ /* no didCreateLayer */ })]
    })]
  });
  
  // verify setup...
  ok(v.didCreateLayer, 'precondition - has root');
  ok(v.childViews[0].didCreateLayer, 'precondition - has firstChild');
  ok(v.childViews[0].childViews[0].didCreateLayer, 'precondition - has nested child');
  ok(!v.get('layer'), 'has no layer');

  v.createLayer();
  equals(callCount, 3, 'did invoke all methods');
  equals(mixinCount, 2, 'did invoke all mixin methods');
});

