// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            portions copyright @2009 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test htmlbody ok equals same stop start */

htmlbody('<style> .sc-static-layout { border: 1px red dotted; } </style>');
(function() {
var pane = SC.ControlTestPane.design()

  .add("progress basic", SC.ProgressView, {
    layout: {top:0, bottom:0, left:0, width: 250},
    value: 25,
    minimum: 0,
    maximum: 100
  })
  .add("progress disabled", SC.ProgressView, {
    layout: {top:0, bottom:0, left:0, width: 250},
    value: 25,
    minimum: 0,
    maximum: 100,
    isEnabled: NO
  })
  .add("progress basic value 0", SC.ProgressView, {
    layout: {top:0, bottom:0, left:0, width: 250},
    value: 0,
    minimum: 0,
    maximum: 100
  })
  .add("progress basic value 100", SC.ProgressView, {
    layout: {top:0, bottom:0, left:0, width: 250},
    value: 100,
    minimum: 0,
    maximum: 100
  })
  .add("progress basic max 50", SC.ProgressView, {
    layout: {top:0, bottom:0, left:0, width: 250},
    value: 25,
    minimum: 0,
    maximum: 50
  })
  .add("progress aria-role", SC.ProgressView, {
    layout: {top:0, bottom:0, left:0, width: 250},
    value: 10,
    minimum: 0,
    maximum: 50
  })
  .add("progress aria-valuemax", SC.ProgressView, {
    layout: {top:0, bottom:0, left:0, width: 250},
    value: 40,
    minimum: 0,
    maximum: 100
  })
  .add("progress aria-valuemin", SC.ProgressView, {
    layout: {top:0, bottom:0, left:0, width: 250},
    value: 20,
    minimum: 0,
    maximum: 100
  })
  .add("progress aria-valuenow", SC.ProgressView, {
    layout: {top:0, bottom:0, left:0, width: 250},
    value: 40,
    minimum: 0,
    maximum: 100
  })
  .add("progress aria-valuetext", SC.ProgressView, {
    layout: {top:0, bottom:0, left:0, width: 250},
    value: 20,
    minimum: 0,
    maximum: 100
  })
  .add("progress aria-disabled", SC.ProgressView, {
    layout: {top:0, bottom:0, left:0, width: 250},
    value: 50,
    minimum: 0,
    maximum: 100,
    isEnabled: NO
  })
  
  // Slider View UI
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
  equals(view.$('.sc-inner')[0].style.width, "25%", 'width should be 25%');
  
  // browsers compute the width after % adjustment differently.  just be close
  var v = (SC.browser.msie || SC.browser.mozilla) ? 63 : 62;
  equals(view.$('.sc-inner').width(), v, 'pixel width ');
  
});

test("disabled", function() {
  
  var view = pane.view('progress disabled');
  
  ok(view.$().hasClass('disabled'), 'should have disabled class');
  ok(view.$('.sc-inner'), 'should have sc-inner class');
  equals(view.$('.sc-inner')[0].style.width, "0%", 'width should be 0%');
  equals(view.$('.sc-inner').width(), 0, 'pixel width ');
  
});

test("basic value 0", function() {
  
  var view = pane.view('progress basic value 0');
  
  ok(!view.$().hasClass('disabled'), 'should NOT have disabled class');
  ok(view.$('.sc-inner'), 'should have sc-inner class');
  equals(view.$('.sc-inner')[0].style.width, "0%", 'width should be 0%');
  equals(view.$('.sc-inner').width(), 0, 'pixel width ');
  
});

test("basic value 100", function() {
  
  var view = pane.view('progress basic value 100');
  
  ok(!view.$().hasClass('disabled'), 'should NOT have disabled class');
  ok(view.$('.sc-inner'), 'should have sc-inner class');
  equals(view.$('.sc-inner')[0].style.width, "100%", 'width should be 100%');
  equals(view.$('.sc-inner').width(), 250, 'pixel width ');
  
});

test("basic max 50", function() {
  
  var view = pane.view('progress basic max 50');
  
  ok(!view.$().hasClass('disabled'), 'should NOT have disabled class');
  ok(view.$('.sc-inner'), 'should have sc-inner class');
  equals(view.$('.sc-inner')[0].style.width, "50%", 'width should be 50%');
  equals(view.$('.sc-inner').width(), 125, 'pixel width ');
  
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
  equals(view.$('.sc-inner')[0].style.width, "50%", 'width should be 50%');
  
  var assertions = function(){
    equals(view.$('.sc-inner').width(), 125, 'pixel width ');
    start();
  };

  stop();
  setTimeout(assertions, 200);
});

test("changing value from full -> empty", function() {
  var view = pane.view('progress basic value 100');
  
  equals(view.$('.sc-inner').width(), 250, 'precon - pixel width should be 316');
  SC.RunLoop.begin();
  view.set('value', 0);
  SC.RunLoop.end();
  equals(view.$('.sc-inner')[0].style.width, "0%", 'width should be 0%');
  var assertions = function(){
    equals(view.$('.sc-inner').width(), 0, 'pixel width ');
    start();
  };

  stop();
  setTimeout(assertions, 200);
  
  
});


test("changing value from full -> negative number", function() {
  var view = pane.view('progress basic value 100');
	
  SC.RunLoop.begin();
  view.set('value', 100);
  SC.RunLoop.end();
  
  SC.RunLoop.begin();
  view.set('value', -10);
  SC.RunLoop.end();
  equals(view.$('.sc-inner')[0].style.width, "0%", 'width should be 0%');
  var assertions = function(){
    equals(view.$('.sc-inner').width(), 0, 'pixel width ');
    start();
  };

  stop();
  setTimeout(assertions, 200);

});

test("changing value to over maximum", function() {
  var view = pane.view('progress basic');
  
  // browsers compute the width after % adjustment differently.  just be close
  var v = (SC.browser.msie || SC.browser.mozilla) ? 63 : 62;
  equals(view.$('.sc-inner').width(), v, 'precon - pixel width should be fixed');
  SC.RunLoop.begin();
  view.set('value', 110);
  SC.RunLoop.end();
  equals(view.$('.sc-inner')[0].style.width, "100%", 'width should be 100%');
  var assertions = function(){
    equals(view.$('.sc-inner').width(), 250, 'pixel width ');
    start();
  };

  stop();
  setTimeout(assertions, 200);
});

test("changing value to a string", function() {
  var view = pane.view('progress basic');
  
  SC.RunLoop.begin();
  view.set('value', 25);
  SC.RunLoop.end();

  SC.RunLoop.begin();
  view.set('value', 'aString');
  SC.RunLoop.end();
  equals(view.$('.sc-inner')[0].style.width, "0%", 'width should be 0%');
  var assertions = function(){
    equals(view.$('.sc-inner').width(), 0, 'pixel width ');
    start();
  };

  stop();
  setTimeout(assertions, 200);
});

test("Check if aria role is set to progress view", function() {
  var viewElem = pane.view('progress aria-role').$();
  ok(viewElem.attr('role') === 'progressbar', 'aria-role is set to the progress view');
});

test("Check if attribute aria-valuemax is set correctly", function() {
  var viewElem = pane.view('progress aria-valuemax').$();
  equals(viewElem.attr('aria-valuemax'), 100, 'aria-valuemax should be 100');
});

test("Check if attribute aria-valuemin is set correctly", function() {
  var viewElem = pane.view('progress aria-valuemin').$();
  equals(viewElem.attr('aria-valuemin'), 0, 'aria-valuemin should be 0');
});

test("Check if attribute aria-valuenow is set correctly", function() {
  var viewElem = pane.view('progress aria-valuenow').$();
  equals(viewElem.attr('aria-valuenow'), 0.4, 'aria-valuenow should be 0.4');
});

test("Check if attribute aria-valuetext is set correctly", function() {
  var viewElem = pane.view('progress aria-valuetext').$();
  equals(viewElem.attr('aria-valuetext'), 0.2, 'aria-valuetext should be 0.2');
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

test("Check if attribute aria-valuetext is set correctly", function() {
  var viewElem = pane.view('slider aria-valuetext').$();
  equals(viewElem.attr('aria-valuetext'), 20, 'aria-valuetext should be 20');
});

test("Check if attribute aria-orientation is set correctly", function() {
  var viewElem = pane.view('slider aria-orientation').$();
  equals(viewElem.attr('aria-orientation'), "horizontal", 'aria-orientation should be horizontal');
});
})();
