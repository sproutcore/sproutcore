// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test equals context ok same */

// NOTE: This file tests both updateLayer() and the related methods that 
// will trigger it.

// ..........................................................
// TEST: updateLayer()
// 
module("SC.View#updateLayer");

test("invokes updateViewSettings() and then updates layer element", function() {
  var layer = document.createElement('div');
  var view = SC.View.create({
    updateViewSettings: function() {
      this.$().addClass('did-update');
    }
  });
  view.createLayer();
  view.updateLayer();
  ok(view.$().attr('class').indexOf('did-update')>=0, 'has class name added by prepareContext()');
});

// ..........................................................
// TEST: updateLayerIfNeeded()
// 
var view, callCount ;
module("SC.View#updateLayerIfNeeded", {
  setup: function() {
    // setup a fake view class so that updateLayerIfNeeded() will call
    // updateLayer() if needed.  updateLayer() is faked to isolate test
    view = SC.View.create({
      isVisibleInWindow: YES,
      updateLayer: function() { callCount++; }
    });
    callCount = 0 ;
    
    view.createLayer();
    view.set("layerNeedsUpdate", YES);
  }
  
});

test("does not call updateLayer if layerNeedsUpdate is NO", function() {
  view.set('layerNeedsUpdate', NO);
  view.updateLayerIfNeeded();
  equals(callCount, 0, 'updateLayer did NOT run');
});

test("does not call updateLayer if isVisibleInWindow is NO", function() {
  view.set('isVisibleInWindow', NO);
  view.updateLayerIfNeeded();
  equals(callCount, 0, 'updateLayer did NOT run');
});

test("does call updateLayer() if isVisible & layerNeedsUpdate", function() {
  equals(view.get('isVisibleInWindow'), YES, 'precond - isVisibleInWindow');
  equals(view.get('layerNeedsUpdate'), YES, 'precond - layerNeedsUpdate');
  
  view.updateLayerIfNeeded();
  ok(callCount > 0, 'updateLayer() did run');
});

test("resets layerNeedsUpdate to NO if called", function() {
  equals(view.get('layerNeedsUpdate'), YES, 'precond - layerNeedsUpdate');
  view.updateLayerIfNeeded();
  equals(view.get('layerNeedsUpdate'), NO, 'layerNeedsUpdate reset to NO');
});

test("returns receiver", function() {
  equals(view.updateLayerIfNeeded(), view, 'returns receiver');
});

test("only runs updateLayer() once if called multiple times (since layerNeedsUpdate is set to NO)", function() {
  callCount = 0;
  view.updateLayerIfNeeded().updateLayerIfNeeded().updateLayerIfNeeded();
  equals(callCount, 1, 'updateLayer() called only once');
});

// ..........................................................
// TEST: layerNeedsUpdate auto-trigger
// 
module("SC.View#layerNeedsUpdate auto-triggers", {
  setup: function() {
    // use fake method to isolate call...
    view = SC.View.create({
      updateLayerIfNeeded: function() { callCount++; }
    });
    callCount = 0;
  }
});

test("setting layerNeedsUpdate calls updateLayerIfNeeded at end of runloop", function() {
  SC.RunLoop.begin();
  view.set('layerNeedsUpdate', YES);
  SC.RunLoop.end();
  
  equals(callCount, 1, 'updateLayerIfNeeded did run');  
});

test("setting & resetting only triggers updateLayerIfNeeded once per runloop", function() {
  SC.RunLoop.begin();
  view.set('layerNeedsUpdate', YES)
      .set('layerNeedsUpdate', NO)
      .set('layerNeedsUpdate', YES);
  SC.RunLoop.end();
  
  equals(callCount, 1, 'updateLayerIfNeeded did run');  
});

// ..........................................................
// INTEGRATION SCENARIOS
// 

module("SC.View#updateLayer - integration");

test("layerNeedsUpdate actually triggers updateLayer", function() {
  var callCount = 0 ;
  var layer = document.createElement('div');
  var view = SC.View.create({
    isVisibleInWindow: YES,
    updateLayer: function() { callCount++; }
  });
  view.createLayer();
  
  SC.RunLoop.begin();
  view.set('layerNeedsUpdate', YES);
  SC.RunLoop.end();
  
  equals(callCount, 1, 'updateLayer did run b/c layerNeedsUpdate is YES');
  callCount = 0 ;
  
  SC.RunLoop.begin();
  view.set('layerNeedsUpdate', YES);
  view.set('layerNeedsUpdate', NO);
  SC.RunLoop.end();
  
  equals(callCount, 0, 'updateLayer did NOT run b/c layerNeedsUpdate is NO');
});

