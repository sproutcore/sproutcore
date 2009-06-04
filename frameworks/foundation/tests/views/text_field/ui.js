// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            portions copyright @2009 Apple, Inc.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/*global module test htmlbody ok equals same stop start */
(function() {
  var pane = SC.ControlTestPane.design()
  .add("empty", SC.TextFieldView, { 
    hint: "Full Name", 
    value: ''
  })
  
  .add("with value", SC.TextFieldView, { 
    hint: "Full Name", 
    value: 'John Doe'
  })
  
  .add("disabled - empty", SC.TextFieldView, { 
    hint: "Full Name", 
    value: null,
    isEnabled: NO
  })
  
  .add("disabled - with value", SC.TextFieldView, { 
    hint: "Full Name", 
    value: 'John Doe',
    isEnabled: NO
  });
    
pane.show(); // add a test to show the test pane

// ..........................................................
// VERIFY STANDARD STATES
// 
pane.verifyEmpty = function verifyEmpty(view, expectedHint) {
  var input = view.$('input');
  var layer = view.$();
  
  ok(!layer.hasClass('not-empty'), 'layer should not have not-empty class');
  equals(input.val(), '', 'input should have empty value');
  
  if (expectedHint) {
    var hint = view.$('.sc-hint');
    equals(hint.length, 1, 'should have a hint span');
    equals(hint.text(), expectedHint, 'hint span should have expected hint');
  }
};

pane.verifyNotEmpty = function verifyNotEmpty(view, expectedValue, expectedHint) {
  var input = view.$('input');
  var layer = view.$();
  
  ok(layer.hasClass('not-empty'), 'layer should have not-empty class');
  equals(input.val(), expectedValue, 'input should have value');
  
  if (expectedHint) {
    var hint = view.$('.sc-hint');
    equals(hint.length, 1, 'should have a hint span');
    equals(hint.text(), expectedHint, 'hint span should have expected hint');
  }
};

pane.verifyDisabled = function verifyDisabled(view, isDisabled) {
  var layer = view.$();
  var input = view.$('input');
  
  if (isDisabled) {
    ok(layer.hasClass('disabled'), 'layer should have disabled class');
    ok(input.attr('disabled'), 'input should have disabled attr');
  } else {
    ok(!layer.hasClass('disabled'), 'layer should not have disabled class');
    ok(!input.attr('disabled'), 'input should not have disabled attr');
  }
};


// ..........................................................
// TEST INITIAL STATES
// 

module('SC.TextFieldView ui', pane.standardSetup());

test("empty", function() {
   var view = pane.view('empty');
   pane.verifyEmpty(view, 'Full Name');
   pane.verifyDisabled(view, NO);
});

test("with value", function() {
  var view = pane.view('with value');
  pane.verifyNotEmpty(view, 'John Doe', 'Full Name');
  pane.verifyDisabled(view, NO);
});

test("disabled - empty", function() {
  var view = pane.view('disabled - empty');
  pane.verifyEmpty(view, 'Full Name');
  pane.verifyDisabled(view, YES);
});

test("disabled - with value", function() {
  var view = pane.view('disabled - with value');
  pane.verifyNotEmpty(view, 'John Doe', 'Full Name');
  pane.verifyDisabled(view, YES);
});

// ..........................................................
// TEST CHANGING VIEWS
// 

test("changing value from empty -> value", function() {
  var view = pane.view('empty');
  
  // test changing value updates like it should
  SC.RunLoop.begin();
  view.set('value', 'John Doe');
  SC.RunLoop.end();
  pane.verifyNotEmpty(view, 'John Doe', 'Full Name');
});

test("disabling view", function() {  
  var view = pane.view('empty');

  // test changing enabled state updates like it should
  SC.RunLoop.begin();
  view.set('isEnabled', NO);
  SC.RunLoop.end();
  pane.verifyDisabled(view, YES);
});

test("changing value to null", function() {
  var view = pane.view('with value');

  // test changing value updates like it should
  SC.RunLoop.begin();
  view.set('value', null);
  SC.RunLoop.end();
  equals(view.get('fieldValue'), null, 'should have empty fieldValue');
  pane.verifyEmpty(view, 'Full Name');
});

test("enabling disabled view", function() {
  var view = pane.view('disabled - empty');

  // test changing enabled state updates like it should
  SC.RunLoop.begin();
  view.set('isEnabled', YES);
  SC.RunLoop.end();
  pane.verifyDisabled(view, NO);
});


// ..........................................................
// TEST EVENTS
// 

test("focus and blurring text field", function() {
  var view = pane.view('empty');
  var input = view.$('input');
  
  // attempt to focus...
  SC.Event.trigger(input, 'focus');
  
  // verify editing state changed...
  ok(view.get('isEditing'), 'view.isEditing should be YES');
  ok(view.$().hasClass('focus'), 'view layer should have focus class');
  
  // simulate typing a letter
  SC.Event.trigger(input, 'keydown');
  SC.Event.trigger(input, 'keyup');
  input.val('f');
  SC.Event.trigger(input, 'change');
  
  // wait a little bit to let text field propograte changes
  stop();
  
  setTimeout(function() {
    start();
    
    equals(view.get('value'), 'f', 'view should have new value');
    ok(view.$().hasClass('not-empty'), 'should have not-empty class');

    // attempt to blur...
    SC.Event.trigger(input, 'blur');

    // verify editing state changed...
    ok(!view.get('isEditing'), 'view.isEditing should be NO');
    ok(!view.$().hasClass('focus'), 'view layer should NOT have focus class');
  }, 100);  
  
});
})();



