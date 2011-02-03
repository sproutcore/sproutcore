// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test equals context ok same */

var view ;
module("SC.View#parentViewDidChange", {
  setup: function() {
    view = SC.View.create();
  }
});

test("invokes updateLayerLocationIfNeeded at end of runloop if has layer", function() {

  view.createLayer();
  ok(view.get('layer'), 'precond - has layer');

  var runCount = 0;
  view.updateLayerLocationIfNeeded = function() { runCount++; };

  SC.RunLoop.begin();
  view.parentViewDidChange();
  SC.RunLoop.end();

  equals(runCount, 1, 'did invoke');

});

test("invokes updateLayerLocationIfNeeded only once no matter how many times it is run", function() {

  view.createLayer();
  ok(view.get('layer'), 'precond - has layer');

  var runCount = 0;
  view.updateLayerLocationIfNeeded = function() { runCount++; };

  SC.RunLoop.begin();
  view.parentViewDidChange();
  view.parentViewDidChange();
  view.parentViewDidChange();
  SC.RunLoop.end();

  equals(runCount, 1, 'did invoke once');

});

test("calls recomputeIsVisibleInWindow each time it is called", function() {

  var runCount = 0;
  view.recomputeIsVisibleInWindow = function() { runCount++; };

  SC.RunLoop.begin();
  view.parentViewDidChange();
  view.parentViewDidChange();
  view.parentViewDidChange();
  SC.RunLoop.end();

  equals(runCount, 3, 'did invoke each time');
});

test("returns receiver", function() {
  equals(view.parentViewDidChange(), view, 'receiver');
});

