// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Apple, Inc. and contributors.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/*global module test equals context ok same Q$ htmlbody */

htmlbody('<div id="appendtest"></div>');

// ..........................................................
// appendTo()
// 
module("SC.Pane#appendTo");

test("adding to document for first time", function() {
  var pane = SC.Pane.create();
  ok(!pane.get('layer'), 'precond - does not yet have layer');
  ok(!pane.get('isVisibleInWindow'), 'precond - isVisibleInWindow = NO');
  
  var elem = Q$('body').get(0);
  ok(elem, 'precond - found element to add to');
  
  // now add
  pane.appendTo(elem);
  var layer = pane.get('layer');
  ok(layer, 'should create layer');
  equals(layer.parentNode, elem, 'layer should belong to parent');
  ok(pane.get('isVisibleInWindow'), 'isVisibleInWindow should  = YES');
  ok(pane.rootResponder, 'should have rootResponder');
  
});

test("readding pane", function() {
  var pane = SC.Pane.create();
  var elem1 = Q$('body').get(0), elem2 = Q$('#appendtest').get(0);
  ok(elem1 && elem2, 'precond - has elem1 && elem2: elem1=%@ elem2=%@'.fmt(elem1, elem2));
  
  pane.appendTo(elem1);
  var layer = pane.get('layer');
  ok(layer, 'has layer');
  equals(layer.parentNode, elem1, 'layer belongs to parent');
  
  pane.appendTo(elem2);
  equals(layer.parentNode, elem2, 'layer moved to new parent');
  ok(pane.get('isVisibleInWindow'), 'isVisibleInWindow should  = YES');
  ok(pane.rootResponder, 'should have rootResponder');
});

test("adding/remove/adding pane", function() {
  var pane = SC.Pane.create();
  var elem1 = Q$('body').get(0), elem2 = Q$('#appendtest').get(0);
  ok(elem1 && elem2, 'precond - has elem1 && elem2');
  
  pane.appendTo(elem1);
  var layer = pane.get('layer');
  ok(layer, 'has layer');
  equals(layer.parentNode, elem1, 'layer belongs to parent');
  
  pane.remove();
  ok(!pane.get('isVisibleInWindow'), 'isVisibleInWindow is NO');
  
  pane.appendTo(elem2);
  layer = pane.get('layer');
  equals(layer.parentNode, elem2, 'layer moved to new parent');
  ok(pane.get('isVisibleInWindow'), 'isVisibleInWindow should  = YES');
  ok(pane.rootResponder, 'should have rootResponder');
});
  
// ..........................................................
// remove()
// 
module("SC.Pane#remove");

test("removes pane from DOM", function() {
  var pane = SC.Pane.create();
  var elem = Q$('body').get(0);
  var layer;

  pane.appendTo(elem);
  layer = pane.get('layer');
  ok(elem, 'precond - found element to add to');
  
  pane.remove();
  ok(layer.parentNode !== elem, 'layer no longer belongs to parent');
  ok(!pane.get('isVisibleInWindow'), 'isVisibleInWindow is NO');
});


