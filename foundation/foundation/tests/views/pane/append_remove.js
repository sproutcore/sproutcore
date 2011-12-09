// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
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

test("adding a pane twice should have no effect", function() {
  var cnt = 0;
  var pane = SC.Pane.create();
  pane._tmp_paneDidAttach = pane.paneDidAttach;
  pane.paneDidAttach = function() {
    cnt++;
    return this._tmp_paneDidAttach.apply(this, arguments);
  };
  
  pane.append();
  pane.append();
  equals(cnt, 1, 'should only append once');
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
  ok(pane.get('isVisibleInWindow'), 'isVisibleInWindow is YES before remove');
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


// ..........................................................
// SPECIAL CASES
// 

test("updates frame and clippingFrame when loading MainPane", function() {
  
  // needs a fixed layout size to make sure the sizes stay constant
  var pane = SC.MainPane.create(); 
  var w = SC.RootResponder.responder.computeWindowSize().width;
  
  // add the pane to the main window.  should resize the frames
  SC.run(function() {
    pane.append();
  });

  // should equal window size
  equals(pane.get('frame').width, w, 'frame width should have changed');
  equals(pane.get('clippingFrame').width, w, 'clippingFrame width should have changed');
  
});

