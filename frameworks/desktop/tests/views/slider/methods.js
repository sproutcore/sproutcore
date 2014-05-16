// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2011 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*global module test htmlbody ok equals same stop start */


module("SC.SliderView Methods", {
  setup: function() {
    // SC.RunLoop.begin();
    pane = SC.MainPane.create({
      layout: { width: 500 },
      childViews: [
        SC.SliderView.extend({
          value: 50,
          minimum: 0,
          maximum: 100,
          step: 25
        })]
    });
    pane.append(); // make sure there is a layer...
    // SC.RunLoop.end();

    view = pane.childViews[0];
  },

  teardown: function() {
    pane.remove();
    pane = view = null ;
  }
});

test("changing value of the slider will change its left position", function() {
  equals(view.get('value'), 50, 'precond - value should be 50');
  equals(parseFloat(view.$('.sc-handle').css('left')), 250, 'left of sc-handle should be 50%');

  var elem = view.get('layer');

  SC.RunLoop.begin();
  view.set('value', 100);
  SC.RunLoop.end();

  equals(view.get('value'), 100, 'value should now be 100');
  equals(parseFloat(view.$('.sc-handle').css('left')), 500, 'left of sc-handle should be 100%');

});

test("going over maximum slider limit", function() {
  equals(view.get('value'), 50, 'precond - value should be 50');

  var elem = view.get('layer');

  SC.RunLoop.begin();
  view.set('value', 150);
  SC.RunLoop.end();

  // TODO: should we allow setting value higher then maximum?
  // Yes I think so: the value (e.g. from a record) should not be constrained by the view layer just because its value was
  // bound to an unused slider. - DCP
  equals(view.get('value'), 150, 'value should now be 150');
  equals(parseFloat(view.$('.sc-handle').css('left')), 500, 'left of sc-handle should be 100%');
});

test("going below minimum slider limit", function() {
  equals(view.get('value'), 50, 'precond - value should be 50');

  var elem = view.get('layer');

  SC.RunLoop.begin();
  view.set('value', -10);
  SC.RunLoop.end();

  // TODO: should we allow setting value lower then minimum?
  // Yes I think so: the value (e.g. from a record) should not be constrained by the view layer just because its value was
  // bound to an unused slider. - DCP
  equals(view.get('value'), -10, 'value should now be -10');
  equals(parseFloat(view.$('.sc-handle').css('left')), 0, 'left of sc-handle should be 0%');
});

test("steps and stepPositions give the correct values.", function() {
  // This test is of course sensitive to the view's min, max and step.
  var steps = view.get('steps'),
    positions = view.get('stepPositions');
  ok(steps.length === 5 && steps[0] === 0 && steps[1] === 25 && steps[2] === 50 && steps[3] === 75 && steps[4] === 100,
    "The view's steps property returns [0, 25, 50, 75, 100].");
  ok(positions.length === 5 && positions[0] === 0 && positions[1] === 0.25 && positions[2] === 0.5 && positions[3] === 0.75 && positions[4] === 1,
    "The view's stepPositions property returns [0, 0.25, 0.5, 0.75, 1].");
})
