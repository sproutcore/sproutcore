// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            portions copyright @2009 Apple, Inc.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/*global module test htmlbody ok equals same stop start */

htmlbody('<style> .sc-static-layout { border: 1px red dotted; } </style>');

var pane = SC.ControlTestPane.design()

  .add("basic", SC.ProgressView, {
    value: 25,
    minimum: 0,
    maximum: 100
  })
  .add("disabled", SC.ProgressView, {
    value: 25,
    minimum: 0,
    maximum: 100,
    isEnabled: NO
  })
  .add("basic value 0", SC.ProgressView, {
    value: 0,
    minimum: 0,
    maximum: 100
  })
  .add("basic value 100", SC.ProgressView, {
    value: 100,
    minimum: 0,
    maximum: 100
  })
  .add("basic max 50", SC.ProgressView, {
    value: 25,
    minimum: 0,
    maximum: 50
  });

pane.show(); // add a test to show the test pane

// ..........................................................
// TEST VIEWS
// 
module("SC.ProgressView UI", pane.standardSetup());

test("basic", function() {
  
  var view = pane.view('basic');
  
  ok(!view.$().hasClass('disabled'), 'should NOT have disabled class');
  ok(view.$('.sc-inner'), 'should have sc-inner class');
  ok(view.$('.sc-outer-head'), 'should have sc-outer-head class');
  ok(view.$('.sc-outer-tail'), 'should have sc-outer-tail class');
  ok(view.$('.sc-inner-head'), 'should have sc-inner-head class');
  ok(view.$('.sc-inner-tail'), 'should have sc-inner-tail class');
  equals(view.$('.sc-inner').width(), 79, 'pixel width should be 79');
  
});

test("disabled", function() {
  
  var view = pane.view('disabled');
  
  ok(view.$().hasClass('disabled'), 'should have disabled class');
  ok(view.$('.sc-inner'), 'should have sc-inner class');
  equals(view.$('.sc-inner').width(), 0, 'pixel width should be 0');
  
});

test("basic value 0", function() {
  
  var view = pane.view('basic value 0');
  
  ok(!view.$().hasClass('disabled'), 'should NOT have disabled class');
  ok(view.$('.sc-inner'), 'should have sc-inner class');
  equals(view.$('.sc-inner').width(), 0, 'pixel width should be 0');
  
});

test("basic value 100", function() {
  
  var view = pane.view('basic value 100');
  
  ok(!view.$().hasClass('disabled'), 'should NOT have disabled class');
  ok(view.$('.sc-inner'), 'should have sc-inner class');
  equals(view.$('.sc-inner').width(), 316, 'pixel width should be 316');
  
});

test("basic max 50", function() {
  
  var view = pane.view('basic max 50');
  
  ok(!view.$().hasClass('disabled'), 'should NOT have disabled class');
  ok(view.$('.sc-inner'), 'should have sc-inner class');
  equals(view.$('.sc-inner').width(), 158, 'pixel width should be 158');
  
});

// ..........................................................
// TEST CHANGING PROGRESS BARS
//

test("changing value from empty -> value", function() {
  var view = pane.view('basic value 0');
  
  equals(view.$('.sc-inner').width(), 0, 'precon - pixel width should be 0');
  SC.RunLoop.begin();
  view.set('value', 50);
  SC.RunLoop.end();
  equals(view.$('.sc-inner').width(), 158, 'pixel width should be 158');
});

test("changing value from full -> empty", function() {
  var view = pane.view('basic value 100');
  
  equals(view.$('.sc-inner').width(), 316, 'precon - pixel width should be 316');
  SC.RunLoop.begin();
  view.set('value', 0);
  SC.RunLoop.end();
  equals(view.$('.sc-inner').width(), 0, 'pixel width should be 0');
});


test("changing value from full -> negative number", function() {
  var view = pane.view('basic value 100');
  
  equals(view.$('.sc-inner').width(), 316, 'precon - pixel width should be 316');
  SC.RunLoop.begin();
  view.set('value', -10);
  SC.RunLoop.end();
  equals(view.$('.sc-inner').width(), 0, 'pixel width should be 0');
});

test("changing value to over maximum", function() {
  var view = pane.view('basic');
  
  equals(view.$('.sc-inner').width(), 79, 'precon - pixel width should be 79');
  SC.RunLoop.begin();
  view.set('value', 110);
  SC.RunLoop.end();
  equals(view.$('.sc-inner').width(), 316, 'pixel width should be 316');
});

test("changing value to a string", function() {
  var view = pane.view('basic');
  
  equals(view.$('.sc-inner').width(), 79, 'precon - pixel width should be 79');
  SC.RunLoop.begin();
  view.set('value', 'aString');
  SC.RunLoop.end();
  equals(view.$('.sc-inner').width(), 0, 'pixel width should be 0');
});


// ..........................................................
// SC.SliderView
//

module("SC.SliderView UI");

