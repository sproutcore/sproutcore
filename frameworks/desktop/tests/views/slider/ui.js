// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2011 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test htmlbody ok equals same stop start */

(function() {
var pane = SC.ControlTestPane.design()
  .add("slider basic", SC.SliderView, {
    layout: {top:0, bottom:0, left:0, width: 250},
    value: 50,
    minimum: 0,
    maximum: 100
  })
  .add("slider disabled", SC.SliderView, {
    layout: {top:0, bottom:0, left:0, width: 250},
    value: 50,
    minimum: 0,
    maximum: 100,
    isEnabled: NO
  })
  .add("slider no-scroll", SC.SliderView, {
    layout: {top:0, bottom:0, left:0, width: 250},
    value: 50,
    minimum: 0,
    maximum: 100,
    updateOnScroll: false
  })
  .add("slider value 100", SC.SliderView, {
    layout: {top:0, bottom:0, left:0, width: 250},
    value: 100,
    minimum: 0,
    maximum: 100
  })
  .add("slider basic step 20", SC.SliderView, {
    layout: {top:0, bottom:0, left:0, width: 250},
    value: 50,
    minimum: 0,
    maximum: 100,
    step: 20
  })
  .add("slider aria-role", SC.SliderView, {
    layout: {top:0, bottom:0, left:0, width: 250},
    value: 10,
    minimum: 0,
    maximum: 50
  })
  .add("slider aria-valuemax", SC.SliderView, {
    layout: {top:0, bottom:0, left:0, width: 250},
    value: 40,
    minimum: 0,
    maximum: 100
  })
  .add("slider aria-valuemin", SC.SliderView, {
    layout: {top:0, bottom:0, left:0, width: 250},
    value: 20,
    minimum: 0,
    maximum: 100
  })
  .add("slider aria-valuenow", SC.SliderView, {
    layout: {top:0, bottom:0, left:0, width: 250},
    value: 40,
    minimum: 0,
    maximum: 100
  })
  .add("slider aria-valuetext", SC.SliderView, {
    layout: {top:0, bottom:0, left:0, width: 250},
    value: 20,
    minimum: 0,
    maximum: 100
  })
  .add("slider aria-orientation", SC.SliderView, {
    layout: {top:0, bottom:0, left:0, width: 250},
    value: 50,
    minimum: 0,
    maximum: 100
  })
  .add("slider markSteps", SC.SliderView, {
    layout: { top:0, bottom:0, left:0, width: 250 },
    value: 20,
    minimum: 0,
    maximum: 100,
    step: 20,
    markSteps: true
  });

// ..........................................................
// TEST VIEWS
//

module("SC.SliderView UI", pane.standardSetup());

test("basic", function() {
  var view = pane.view('slider basic');

  ok(!view.$().hasClass('disabled'), 'should NOT have disabled class');
  ok(view.$('.track').length > 0, 'should have track classed element');
  ok(view.$('.sc-handle').length > 0, 'should have sc-handle classed element');
  equals(view.$('.sc-handle')[0].style.left, '50%', 'left of sc-handle should be 50%');
});

test("disabled", function() {
  var view = pane.view('slider disabled');

  ok(view.$().hasClass('disabled'), 'should have disabled class');
  ok(view.$('.track').length > 0, 'should have track classed element');
  ok(view.$('.sc-handle').length > 0, 'should have sc-handle classed element');
  equals(view.$('.sc-handle')[0].style.left, '50%', 'left of sc-handle should be 50%');
});

test("no scroll", function() {
  var view = pane.view('slider no-scroll');

  ok(!view.mouseWheel({}), "A slider view with updateOnScroll set to false should return NO from the mouseWheel event handler.");
});

test("basic value 100", function() {
  var view = pane.view('slider value 100');

  ok(!view.$().hasClass('disabled'), 'should have disabled class');
  ok(view.$('.track').length > 0, 'should have track classed element');
  ok(view.$('.sc-handle').length > 0, 'should have sc-handle classed element');
  equals(view.$('.sc-handle')[0].style.left, '100%', 'left of sc-handle should be 100%');
});

test("basic step 20", function() {
  var view = pane.view('slider basic step 20');

  ok(!view.$().hasClass('disabled'), 'should have disabled class');
  ok(view.$('.track').length > 0, 'should have track classed element');
  ok(view.$('.sc-handle').length > 0, 'should have sc-handle classed element');
  equals(view.$('.sc-handle')[0].style.left, '60%', 'left of sc-handle should be 60%');
});

test("Check if aria role is set to slider view", function() {
  var viewElem = pane.view('slider aria-role').$();
  ok(viewElem.attr('role') === 'slider', 'aria-role is set to the slider  view');
});

test("Check if attribute aria-valuemax is set correctly", function() {
  var viewElem = pane.view('slider aria-valuemax').$();
  equals(viewElem.attr('aria-valuemax'), 100, 'aria-valuemax should be 100');
});

test("Check if attribute aria-valuemin is set correctly", function() {
  var viewElem = pane.view('slider aria-valuemin').$();
  equals(viewElem.attr('aria-valuemin'), 0, 'aria-valuemin should be 0');
});

test("Check if attribute aria-valuenow is set correctly", function() {
  var viewElem = pane.view('slider aria-valuenow').$();
  equals(viewElem.attr('aria-valuenow'), 40, 'aria-valuenow should be 40');
});

test("Check if attribute aria-orientation is set correctly", function() {
  var viewElem = pane.view('slider aria-orientation').$();
  equals(viewElem.attr('aria-orientation'), "horizontal", 'aria-orientation should be horizontal');
});

// markSteps

test("markStep", function() {
  var view = pane.view('slider markSteps'),
      marks, expectedCount;

  // Initial.
  marks = view.$().find('.sc-slider-step-mark');
  expectedCount = Math.floor((view.get('maximum') - view.get('minimum')) / view.get('step')) + 1; // yeah yeah math.floor + 1 is math.ciel
  equals(marks.length, expectedCount, "A view with markSteps set to true contains the correct number of marks");
  ok(marks.eq(2).hasClass('sc-slider-step-mark-2'), "The nth mark has sc-slider-step-mark-n class.");
  ok(view.$().find('.sc-slider-step-mark-first').length === 1, "Only one mark is labeled as the first.");
  ok(view.$().find('.sc-slider-step-mark-last').length === 1, "Only one mark is labeled as the last.");

  // Change.
  SC.run(function() { view.set('maximum', 200); });
  marks = view.$().find('.sc-slider-step-mark');
  expectedCount = Math.floor((view.get('maximum') - view.get('minimum')) / view.get('step')) + 1; // yeah yeah math.floor + 1 is math.ciel
  equals(marks.length, expectedCount, "Changing maximum correctly updates the number of marks");
  ok(view.$().find('.sc-slider-step-mark-first').length === 1, "Only one mark is labeled as the first.");
  ok(view.$().find('.sc-slider-step-mark-last').length === 1, "Only one mark is labeled as the last.");

  // Test mark at value = 0. (See https://github.com/sproutcore/sproutcore/issues/1229)
  SC.run(function() {
    view.set('minimum', -1).set('maximum', 4).set('step', 1);
  });
  
  marks = view.$('.sc-slider-step-mark');
  equals(marks[1].style.left, "20%", "The mark representing value zero is positioned correctly when minimum is less than zero");

});

})();
