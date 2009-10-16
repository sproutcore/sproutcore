// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            portions copyright @2009 Apple Inc.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/*global module test htmlbody ok equals same stop start */

htmlbody('<style> .sc-static-layout { border: 1px red dotted; } </style>');
(function() {
var pane = SC.ControlTestPane.design()

  .add("progress basic", SC.ProgressView, {
    value: 25,
    minimum: 0,
    maximum: 100
  })
  .add("progress disabled", SC.ProgressView, {
    value: 25,
    minimum: 0,
    maximum: 100,
    isEnabled: NO
  })
  .add("progress basic value 0", SC.ProgressView, {
    value: 0,
    minimum: 0,
    maximum: 100
  })
  .add("progress basic value 100", SC.ProgressView, {
    value: 100,
    minimum: 0,
    maximum: 100
  })
  .add("progress basic max 50", SC.ProgressView, {
    value: 25,
    minimum: 0,
    maximum: 50
  })
  
  // Slider View UI
  .add("slider basic", SC.SliderView, {
    value: 50, 
    minimum: 0, 
    maximum: 100
  })
  .add("slider disabled", SC.SliderView, {
    value: 50, 
    minimum: 0, 
    maximum: 100,
    isEnabled: NO
  })
  .add("slider value 100", SC.SliderView, {
    value: 100, 
    minimum: 0, 
    maximum: 100
  })
  .add("slider basic step 20", SC.SliderView, {
    value: 50, 
    minimum: 0, 
    maximum: 100,
    step: 20
  });

pane.show(); // add a test to show the test pane

// ..........................................................
// TEST VIEWS
// 
module("SC.ProgressView UI");

test("basic", function() {
  
  var view = pane.view('progress basic');
  
  ok(!view.$().hasClass('disabled'), 'should NOT have disabled class');
  ok(view.$('.sc-inner'), 'should have sc-inner class');
  ok(view.$('.sc-outer-head'), 'should have sc-outer-head class');
  ok(view.$('.sc-outer-tail'), 'should have sc-outer-tail class');
  ok(view.$('.sc-inner-head'), 'should have sc-inner-head class');
  ok(view.$('.sc-inner-tail'), 'should have sc-inner-tail class');
  equals(view.$('.sc-inner').css("width"), "25%", 'width should be 25%');
  
  // browsers compute the width after % adjustment differently.  just be close
  var v = (SC.browser.msie || SC.browser.mozilla) ? 85 : 84;
  equals(view.$('.sc-inner').width(), v, 'pixel width ');
  
});

test("disabled", function() {
  
  var view = pane.view('progress disabled');
  
  ok(view.$().hasClass('disabled'), 'should have disabled class');
  ok(view.$('.sc-inner'), 'should have sc-inner class');
  equals(view.$('.sc-inner').css("width"), "0%", 'width should be 0%');
  equals(view.$('.sc-inner').width(), 0, 'pixel width ');
  
});

test("basic value 0", function() {
  
  var view = pane.view('progress basic value 0');
  
  ok(!view.$().hasClass('disabled'), 'should NOT have disabled class');
  ok(view.$('.sc-inner'), 'should have sc-inner class');
  equals(view.$('.sc-inner').css("width"), "0%", 'width should be 0%');
  equals(view.$('.sc-inner').width(), 0, 'pixel width ');
  
});

test("basic value 100", function() {
  
  var view = pane.view('progress basic value 100');
  
  ok(!view.$().hasClass('disabled'), 'should NOT have disabled class');
  ok(view.$('.sc-inner'), 'should have sc-inner class');
  equals(view.$('.sc-inner').css("width"), "100%", 'width should be 100%');
  equals(view.$('.sc-inner').width(), 338, 'pixel width ');
  
});

test("basic max 50", function() {
  
  var view = pane.view('progress basic max 50');
  
  ok(!view.$().hasClass('disabled'), 'should NOT have disabled class');
  ok(view.$('.sc-inner'), 'should have sc-inner class');
  equals(view.$('.sc-inner').css("width"), "50%", 'width should be 50%');
  equals(view.$('.sc-inner').width(), 169, 'pixel width ');
  
});

// ..........................................................
// TEST CHANGING PROGRESS BARS
//

test("changing value from empty -> value", function() {
  var view = pane.view('progress basic value 0');
  
  equals(view.$('.sc-inner').width(), 0, 'precon - pixel width should be 0');
  SC.RunLoop.begin();
  view.set('value', 50);
  SC.RunLoop.end();
  equals(view.$('.sc-inner').css("width"), "50%", 'width should be 50%');
  equals(view.$('.sc-inner').width(), 169, 'pixel width ');
});

test("changing value from full -> empty", function() {
  var view = pane.view('progress basic value 100');
  
  equals(view.$('.sc-inner').width(), 338, 'precon - pixel width should be 316');
  SC.RunLoop.begin();
  view.set('value', 0);
  SC.RunLoop.end();
  equals(view.$('.sc-inner').css("width"), "0%", 'width should be 0%');
  equals(view.$('.sc-inner').width(), 0, 'pixel width ');
});


test("changing value from full -> negative number", function() {
  var view = pane.view('progress basic value 100');
	
  SC.RunLoop.begin();
  view.set('value', 100);
  SC.RunLoop.end();
  
  equals(view.$('.sc-inner').width(), 338, 'precon - pixel width should be 338');
  SC.RunLoop.begin();
  view.set('value', -10);
  SC.RunLoop.end();
  equals(view.$('.sc-inner').css("width"), "0%", 'width should be 0%');
  equals(view.$('.sc-inner').width(), 0, 'pixel width ');
});

test("changing value to over maximum", function() {
  var view = pane.view('progress basic');
  
  // browsers compute the width after % adjustment differently.  just be close
  var v = (SC.browser.msie || SC.browser.mozilla) ? 85 : 84;
  equals(view.$('.sc-inner').width(), v, 'precon - pixel width should be fixed');
  SC.RunLoop.begin();
  view.set('value', 110);
  SC.RunLoop.end();
  equals(view.$('.sc-inner').css("width"), "100%", 'width should be 100%');
  equals(view.$('.sc-inner').width(), 338, 'pixel width ');
});

test("changing value to a string", function() {
  var view = pane.view('progress basic');
  
  SC.RunLoop.begin();
  view.set('value', 25);
  SC.RunLoop.end();

  var v = (SC.browser.msie || SC.browser.mozilla) ? 85 : 84;
  equals(view.$('.sc-inner').width(), v, 'precon - pixel width should be fixed');
  SC.RunLoop.begin();
  view.set('value', 'aString');
  SC.RunLoop.end();
  equals(view.$('.sc-inner').css("width"), "0%", 'width should be 0%');
  equals(view.$('.sc-inner').width(), 0, 'pixel width ');
});


// ..........................................................
// SC.SliderView
//

module("SC.SliderView UI");

test("basic", function() {
  var view = pane.view('slider basic');
  
  ok(!view.$().hasClass('disabled'), 'should NOT have disabled class');
  ok(view.$('.sc-inner'), 'should have sc-inner class');
  ok(view.$('.sc-handle'), 'should have sc-handle class');
  equals(view.$('.sc-handle').css('left'), '50%', 'left of sc-handle should be 50%');
});

test("disabled", function() {
  var view = pane.view('slider disabled');
  
  ok(view.$().hasClass('disabled'), 'should have disabled class');
  ok(view.$('.sc-inner'), 'should have sc-inner class');
  ok(view.$('.sc-handle'), 'should have sc-handle class');
  equals(view.$('.sc-handle').css('left'), '50%', 'left of sc-handle should be 50%');
});

test("basic value 100", function() {
  var view = pane.view('slider value 100');
  
  ok(!view.$().hasClass('disabled'), 'should have disabled class');
  ok(view.$('.sc-inner'), 'should have sc-inner class');
  ok(view.$('.sc-handle'), 'should have sc-handle class');
  equals(view.$('.sc-handle').css('left'), '100%', 'left of sc-handle should be 100%');
});

test("basic step 20", function() {
  var view = pane.view('slider basic step 20');
  
  ok(!view.$().hasClass('disabled'), 'should have disabled class');
  ok(view.$('.sc-inner'), 'should have sc-inner class');
  ok(view.$('.sc-handle'), 'should have sc-handle class');
  equals(view.$('.sc-handle').css('left'), '60%', 'left of sc-handle should be 60%');
});
})();
