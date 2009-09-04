// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            portions copyright @2009 Apple Inc.
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
  })
  
  .add("textarea - empty", SC.TextFieldView, { 
    hint: "Full Name", 
    value: '',
    isTextArea: YES
  })
  
  .add("textarea - with value", SC.TextFieldView, { 
    hint: "Full Name", 
    value: 'John Doe',
    isTextArea: YES
  })
  
  .add("textarea - disabled - empty", SC.TextFieldView, { 
    hint: "Full Name", 
    value: '',
    isTextArea: YES,
    isEnabled: NO
  })
  
  .add("textarea - disabled - with value", SC.TextFieldView, { 
    hint: "Full Name", 
    value: 'John Doe',
    isTextArea: YES,
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

test("textarea - empty", function() {
   var view = pane.view('empty');
   pane.verifyEmpty(view, 'Full Name');
   pane.verifyDisabled(view, NO);
});

test("textarea - with value", function() {
  var view = pane.view('with value');
  pane.verifyNotEmpty(view, 'John Doe', 'Full Name');
  pane.verifyDisabled(view, NO);
});

test("textarea - disabled - empty", function() {
  var view = pane.view('disabled - empty');
  pane.verifyEmpty(view, 'Full Name');
  pane.verifyDisabled(view, YES);
});

test("textarea - disabled - with value", function() {
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
// TEST SELECTION SUPPORT
// 

test("Setting the selection to a null value should fail", function() {  
  var view = pane.view('with value');
  var fieldElement = view.$input()[0];
  fieldElement.size = 10;     // Avoid Firefox 3.5 issue
  
  var thrownException = null;
  try {
    view.set('selection', null);
  }
  catch(e) {
    thrownException = e;
  }
  ok(thrownException.indexOf !== undefined, 'an exception should have been thrown');
  if (thrownException.indexOf !== undefined) {
    ok(thrownException.indexOf('must specify an SC.TextSelection instance') !== -1, 'the exception should be about not specifying an SC.TextSelection instance');
  }
});

test("Setting the selection to a non-SC.TextSelection value should fail", function() {  
  var view = pane.view('with value');
  var fieldElement = view.$input()[0];
  fieldElement.size = 10;     // Avoid Firefox 3.5 issue
  
  var thrownException = null;
  try {
    view.set('selection', {start: 0, end: 0});
  }
  catch(e) {
    thrownException = e;
  }
  ok(thrownException.indexOf !== undefined, 'an exception should have been thrown');
  if (thrownException.indexOf !== undefined) {
    ok(thrownException.indexOf('must specify an SC.TextSelection instance') !== -1, 'the exception should be about not specifying an SC.TextSelection instance');
  }
});

test("Setting and then getting back the selection", function() {  
  var view = pane.view('with value');
  var fieldElement = view.$input()[0];
  fieldElement.size = 10;     // Avoid Firefox 3.5 issue
  
  var newSelection = SC.TextSelection.create({start:2, end:5});
  view.set('selection', newSelection);
  
  var fetchedSelection = view.get('selection');
  ok(fetchedSelection.get('start') === 2, 'the selection should start at index 2');
  ok(fetchedSelection.get('end') === 5, 'the selection should end at index 4');
  ok(fetchedSelection.get('length') === 3, 'the selection should have length 3');
});

// ..........................................................
// TEST ACCESSORY VIEWS
// 

test("Adding left accessory view", function() {  
  var view = pane.view('with value');
  
  // test adding accessory view adds the view like it should
  SC.RunLoop.begin();
  var accessoryView = SC.View.create({
    layout:  { top:1, left:2, width:16, height:16 }
  });
  view.set('leftAccessoryView', accessoryView);
  SC.RunLoop.end();

  ok(view.get('leftAccessoryView') === accessoryView, 'left accessory view should be set to ' + accessoryView.toString());
  ok(view.get('childViews').length === 1, 'there should only be one child view');
  ok(view.get('childViews')[0] === accessoryView, 'first child view should be set to ' + accessoryView.toString());
  
  
  // The hint and padding elements should automatically have their 'left'
  // values set to the accessory view's offset + width
  // (18 = 2 left offset + 16 width)
  var hintElement  = view.$('.sc-hint')[0];
  var paddingElement = view.$('.padding')[0];
  ok(hintElement.style.left  === '18px', 'hint element should get 18px left');
  ok(paddingElement.style.left === '18px', 'padding element should get 18px left');
  
  // Test removing the accessory view.
  SC.RunLoop.begin();
  view.set('leftAccessoryView', null);
  SC.RunLoop.end();
  ok(view.get('childViews').length === 0, 'after removing the left accessory view there should be no child views left');
  ok(!hintElement.style.left, 'after removing the left accessory view the hint element should have no left style');
  ok(!paddingElement.style.left, 'after removing the left accessory view the padding element should have no left style');
});

test("Adding right accessory view", function() {  
  var view = pane.view('with value');
  
  // test adding accessory view adds the view like it should
  SC.RunLoop.begin();
  var accessoryView = SC.View.create({
    layout:  { top:1, right:3, width:17, height:16 }
  });
  view.set('rightAccessoryView', accessoryView);
  SC.RunLoop.end();

  ok(view.get('rightAccessoryView') === accessoryView, 'right accessory view should be set to ' + accessoryView.toString());
  ok(view.get('childViews').length === 1, 'there should only be one child view');
  ok(view.get('childViews')[0] === accessoryView, 'first child view should be set to ' + accessoryView.toString());
  
  
  // The hint and padding elements should automatically have their 'right'
  // values set to the accessory view's offset + width
  // (20 = 3 right offset + 17 width)
  var hintElement  = view.$('.sc-hint')[0];
  var paddingElement = view.$('.padding')[0];
  ok(hintElement.style.right  === '20px', 'hint element should get 20px right');
  ok(paddingElement.style.right === '20px', 'padding element should get 20px right');
  
  
  // If a right accessory view is set with only 'left' (and not 'right')
  // defined in its layout, 'left' should be cleared out and 'right' should
  // be set to 0.
  SC.RunLoop.begin();
  accessoryView = SC.View.create({
    layout:  { top:1, left:2, width:16, height:16 }
  });
  view.set('rightAccessoryView', accessoryView);
  SC.RunLoop.end();
  
  ok(view.get('rightAccessoryView').get('layout').left === null, "right accessory view created with 'left' rather than 'right' in layout should have layout.left set to null");
  ok(view.get('rightAccessoryView').get('layout').right === 0, "right accessory view created with 'left' rather than 'right' in layout should have layout.right set to 0");
  
  
  // Test removing the accessory view.
  SC.RunLoop.begin();
  view.set('rightAccessoryView', null);
  SC.RunLoop.end();
  ok(view.get('childViews').length === 0, 'after removing the right accessory view there should be no child views left');
  ok(!hintElement.style.right, 'after removing the right accessory view the hint element should have no right style');
  ok(!paddingElement.style.right, 'after removing the right accessory view the padding element should have no right style');
});

test("Adding both left and right accessory views", function() {  
  var view = pane.view('with value');
  
  // test adding accessory view adds the view like it should
  SC.RunLoop.begin();
  var leftAccessoryView = SC.View.create({
    layout:  { top:1, left:2, width:16, height:16 }
  });
  view.set('leftAccessoryView', leftAccessoryView);
  var rightAccessoryView = SC.View.create({
    layout:  { top:1, right:3, width:17, height:16 }
  });
  view.set('rightAccessoryView', rightAccessoryView);
  SC.RunLoop.end();

  ok(view.get('childViews').length === 2, 'we should have two child views since we added both a left and a right accessory view');
  
  
  // The hint and padding elements should automatically have their 'left' and
  // 'right' values set to the accessory views' offset + width
  //   *  left:   18 = 2 left offset + 16 width)
  //   *  right:  20 = 3 left offset + 17 width)
  var hintElement  = view.$('.sc-hint')[0];
  var paddingElement = view.$('.padding')[0];
  ok(hintElement.style.left  === '18px', 'hint element should get 18px left');
  ok(paddingElement.style.left === '18px', 'padding element should get 18px left');
  ok(hintElement.style.right  === '20px', 'hint element should get 20px right');
  ok(paddingElement.style.right === '20px', 'padding element should get 20px right');
  
  
  // Test removing the accessory views.
  SC.RunLoop.begin();
  view.set('rightAccessoryView', null);
  SC.RunLoop.end();
  ok(view.get('childViews').length === 1, 'after removing the right accessory view there should be one child view left (the left accessory view)');
  ok(!hintElement.style.right, 'after removing the right accessory view the hint element should have no right style');
  ok(!paddingElement.style.right, 'after removing the right accessory view the padding element should have no right style');
  SC.RunLoop.begin();
  view.set('leftAccessoryView', null);
  SC.RunLoop.end();
  ok(view.get('childViews').length === 0, 'after removing both accessory views there should be no child views left');
  ok(!hintElement.style.left, 'after removing the left accessory view the hint element should have no left style');
  ok(!paddingElement.style.left, 'after removing the left accessory view the padding element should have no left style');
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

test("editing a field should not change the cursor position", function() {
  var textField = pane.view('empty');
  var input = textField.$('input');
  input.val('John Doe');
  textField.set('selection', SC.TextSelection.create({start:2, end:3}));
  SC.Event.trigger(input, 'change');

  ok(input.val() === 'John Doe', 'input value should be \'John Doe\'');
  var selection = textField.get('selection');
  console.log("Selection:  %@".fmt(selection));
  ok(selection.get('start') == 2 && selection.get('end') == 3, 'cursor position should be unchanged');
});

})();
