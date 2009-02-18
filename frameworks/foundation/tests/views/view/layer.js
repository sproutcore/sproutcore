// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Apple, Inc. and contributors.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/*global module test equals context ok same precondition */

// NOTE: it is very important to make sure that the layer is not created 
// until the view is actually visible in the window.

module("SC.View#layer");

test("returns null if the view has no layer and no parent view", function() {
  var view = SC.View.create() ;
  equals(view.get('parentView'), null, 'precond - has no parentView');
  equals(view.get('layer'), null, 'has no layer');
});

test("returns null if the view has no layer and parent view has no layer", function() {
  var parent = SC.View.create({
     childViews: [ SC.View.extend() ]
  });
  var view = parent.childViews[0];
  
  equals(view.get('parentView'), parent, 'precond - has parent view');
  equals(parent.get('layer'), null, 'parentView has no layer');
  equals(view.get('layer'), null, ' has no layer');
});

test("returns layer if you set the value", function() {
  var view = SC.View.create();
  equals(view.get('layer'), null, 'precond- has no layer');
  
  var dom = document.createElement('div');
  view.set('layer', dom);
  
  equals(view.get('layer'), dom, 'now has set layer');
  
  dom = null;
});

var parent, child, parentDom, childDom ;
module("SC.View#layer - autodiscovery", {
  setup: function() {

    parent = SC.View.create({
       childViews: [ SC.View.extend({
         // redefine this method in order to isolate testing of layer prop.
         // simple version just returns firstChild of parentLayer.
         findLayerInParentLayer: function(parentLayer) {
           return parentLayer.firstChild;
         }
       }) ]
    });
    child = parent.childViews[0];

    // setup parent/child dom
    parentDom = document.createElement('div');
    childDom = document.createElement('div');
    parentDom.appendChild(childDom);
    
    // set parent layer...
    parent.set('layer', parentDom);
  },
  
  teardown: function() {
    parent = child = parentDom = childDom = null ;
  }
});

test("discovers layer if has no layer but parent view does have layer", function() {  
  equals(parent.get('layer'), parentDom, 'precond - parent has layer');
  ok(!!parentDom.firstChild, 'precond - parentDom has first child');
  
  equals(child.get('layer'), childDom, 'view discovered child');
});

test("once its discovers layer, returns the same element, even if you remove it from the parent view", function() {  
  equals(child.get('layer'), childDom, 'precond - view discovered child');
  parentDom.removeChild(childDom) ;

  equals(child.get('layer'), childDom, 'view kept layer cached (i.e. did not do a discovery again)');
});

module("SC.View#layer - destroying");

test("returns null again if it has layer and layer is destroyed", function() {
  
});

test("returns null again if parent view's layer is destroyed", function() {
  
});
