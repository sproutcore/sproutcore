// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2009 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test htmlbody ok equals same stop start */
/*
module("SC.ProgressView Methods", {
  setup: function() {
    SC.RunLoop.begin();
    pane = SC.MainPane.create({
      childViews: [
        SC.ProgressView.extend({
          value: 25,
          minimum: 0,
          maximum: 100
        })]
    });
    pane.append(); // make sure there is a layer...
    SC.RunLoop.end();
    
    view = pane.childViews[0];
  }, 
  
  teardown: function() {
    pane.remove();
    pane = view = null ;
  }
});

test("changing a progress view value to maximum", function() {
  equals(view.get('value'), 25, 'precon - value should be 25');
  equals(view.get('isIndeterminate'), NO, 'precon - value should be NO');
  equals(view.get('isRunning'), NO, 'precon - value should be NO');
  equals(view.get('isEnabled'), YES, 'precon - value should be YES');
  
  SC.RunLoop.begin();
  view.set('value', 100);
  SC.RunLoop.end();
  
  equals(view.get('value'), 100, 'should be 100');
});

test("changing value of a disabled progress view", function() {
  equals(view.get('value'), 25, 'precon - value should be 25');
  equals(view.get('isEnabled'), YES, 'precon - value should be YES');
  
  SC.RunLoop.begin();
  view.set('isEnabled', NO);
  view.set('value', 100);
  SC.RunLoop.end();
  
  // changing while disabled is allowed
  equals(view.get('value'), 100, 'should be 100');
});

// ..........................................................
// SC.SliderView
//

module("SC.SliderView Methods", {
  setup: function() {
    SC.RunLoop.begin();
    pane = SC.MainPane.create({
      childViews: [
        SC.SliderView.extend({
          value: 50, 
          minimum: 0, 
          maximum: 100
        })]
    });
    pane.append(); // make sure there is a layer...
    SC.RunLoop.end();
    
    view = pane.childViews[0];
  }, 
  
  teardown: function() {
    pane.remove();
    pane = view = null ;
  }
});

test("changing value of the slider will change its left position", function() {
  equals(view.get('value'), 50, 'precond - value should be 50');
  equals(view.$('.sc-handle').css('left'), '50%', 'left of sc-handle should be 50%');
  
  var elem = view.get('layer');
  
  SC.RunLoop.begin();
  view.set('value', 100);
  SC.RunLoop.end();
  
  equals(view.get('value'), 100, 'value should now be 100');
  equals(view.$('.sc-handle').css('left'), '100%', 'left of sc-handle should be 100%');
  
});

test("going over maximum slider limit", function() {
  equals(view.get('value'), 50, 'precond - value should be 50');
  
  var elem = view.get('layer');
  
  SC.RunLoop.begin();
  view.set('value', 150);
  SC.RunLoop.end();
  
  // TODO: should we allow setting value higher then maximum?
  equals(view.get('value'), 150, 'value should now be 150');
  equals(view.$('.sc-handle').css('left'), '100%', 'left of sc-handle should be 100%');
});

test("going below minimum slider limit", function() {
  equals(view.get('value'), 50, 'precond - value should be 50');
  
  var elem = view.get('layer');
  
  SC.RunLoop.begin();
  view.set('value', -10);
  SC.RunLoop.end();
  
  // TODO: should we allow setting value lower then minimum?
  equals(view.get('value'), -10, 'value should now be -10');
  equals(view.$('.sc-handle').css('left'), '0%', 'left of sc-handle should be 0%');
});
*/
