// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2011 Apple Inc.
// License:   Licensed under MIT license (see license.js)
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

  .add("password", SC.TextFieldView, {
    type: "password",
    value: "I'm so secret"
  })

  .add("password-hint", SC.TextFieldView, {
    hint: "Passwerd",
    type: "password",
    value: "I'm so secret"
  })

  .add("disabled - empty", SC.TextFieldView, {
    hint: "Full Name",
    value: null,
    isEnabled: NO,
    isEditable: NO
  })

  .add("disabled - with value", SC.TextFieldView, {
    hint: "Full Name",
    value: 'John Doe',
    isEnabled: NO,
    isEditable: NO
  })

  .add("enabled - not editable - with value", SC.TextFieldView, {
    hint: "Full Name",
    value: 'John Doe',
    isEnabled: YES,
    isEditable: NO
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
  })


  .add("aria-readonly", SC.TextFieldView, {
    hint: "Full Name",
    value: 'John Doe',
    isTextArea: YES,
    isEnabled: YES,
    isEditable: NO
  });


pane.show(); // add a test to show the test pane

// ..........................................................
// VERIFY STANDARD STATES
//
pane.verifyEmpty = function verifyEmpty(view, expectedHint) {
  var input = view.$('input');
  var layer = view.$();

  ok(!layer.hasClass('not-empty'), 'layer should not have not-empty class');
  if(SC.browser.isWebkit || (SC.browser.isMozilla &&
      SC.browser.compare(SC.browser.engineVersion, '2.0') >= 0)) equals(input.val(), '', 'input should have empty value');
  else equals(input.val(), expectedHint, 'input should have expected hint as value');
  if (expectedHint) {
    var hint = view.$('.hint');
    if (hint.length===1) {
    hint = hint.text();
  } else {
    hint = view.$('input');
    hint = hint.attr('placeholder');
  }
  equals(hint, expectedHint, 'hint span should have expected hint');  }

};

pane.verifyNotEmpty = function verifyNotEmpty(view, expectedValue, expectedHint) {
  var input = view.$('input');
  var layer = view.$();

  ok(layer.hasClass('not-empty'), 'layer should have not-empty class');
  equals(input.val(), expectedValue, 'input should have value');

  if (expectedHint) {
    var hint = view.$('.hint');
    if (hint.length===1) {
    hint = hint.text();
  } else {
    hint = view.$('input');
    hint = hint.attr('placeholder');
  }
  equals(hint, expectedHint, 'hint span should have expected hint');  }

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

pane.verifyReadOnly = function verifyReadonly(view, isReadOnly) {
  var input = view.$('input');

  if(isReadOnly) {
    ok(input.attr('readOnly'), 'input should have readOnly attr');
  } else {
    ok(!input.attr('readOnly'), 'input should not have readOnly attr');
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

test("password", function() {
  var view = pane.view('password');
  pane.verifyNotEmpty(view, 'I\'m so secret');
  pane.verifyDisabled(view, NO);
});

test("password with hint", function() {
  var view = pane.view('password-hint');
  pane.verifyNotEmpty(view, 'I\'m so secret', 'Passwerd');
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

test("enabled - not editable - with value", function() {
  var view = pane.view('enabled - not editable - with value');
  pane.verifyNotEmpty(view, 'John Doe', 'Full Name');
  pane.verifyReadOnly(view, YES);
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

test("changing isEditable", function() {
  var view = pane.view('enabled - not editable - with value');

  // test changing isEditable state updates like it should
  SC.RunLoop.begin();
  view.set('isEditable', YES);
  SC.RunLoop.end();
  pane.verifyReadOnly(view, NO);

  // test changing isEditable state updates like it should
  SC.RunLoop.begin();
  view.set('isEditable', NO);
  SC.RunLoop.end();
  pane.verifyReadOnly(view, YES);
});

test("changing value from not a textarea to a textarea", function() {
  // test the the SC.Event for 'change' gets wired up properly to the DOM element when it changes from input to textarea
  var view = pane.view('empty');
  SC.RunLoop.begin();
  view.set('value', 'Original');
  view.set('isTextArea', YES);
  SC.RunLoop.end();

  var $textarea = view.$('textarea');

  SC.Event.trigger($textarea, 'focus');

  // simulate typing a letter
  SC.Event.trigger($textarea, 'keydown');
  $textarea.val("My New Value");
  SC.Event.trigger($textarea, 'keyup');
  SC.Event.trigger($textarea, 'change');
  view.fieldValueDidChange();

  // wait a little bit to let text field propogate changes
  stop();

  setTimeout(function() {
    start();
    equals(view.get("value"), "My New Value", "SC.Event for change should get wired up properly");
  }, 100);

  SC.RunLoop.begin();
  SC.RunLoop.end();
});


if (!SC.browser.isIE && !SC.platform.input.placeholder) {
  test("Changing value to null -- password field", function() {
    var view = pane.view('password-hint'),
        input = view.$('input');

    SC.run(function() {
      view.set('value', null);
    });

    equals(input.attr('type'), 'text', "When nulled out, field was converted to type text");
    equals(input.val(), view.get('hint'), "When nulled out, field was given value equal to hint");
  });
}

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
  fieldElement.focus();
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
  var paddingElement = view.$('.padding')[0];
  ok(paddingElement.style.left === '18px', 'padding element should get 18px left');

  // Test removing the accessory view.
  SC.RunLoop.begin();
  view.set('leftAccessoryView', null);
  SC.RunLoop.end();
  ok(view.get('childViews').length === 0, 'after removing the left accessory view there should be no child views left');
  ok(!paddingElement.style.left, 'after removing the left accessory view the padding element should have no left style');
});

test("Adding left accessory view changes style -- using design()", function() {
  var view = pane.view('with value');

  // test adding accessory view adds the view like it should
  SC.RunLoop.begin();
  var accessoryView = SC.View.design({
    layout:  { top:1, left:2, width:16, height:16 }
  });
  view.set('leftAccessoryView', accessoryView);
  SC.RunLoop.end();

  // The hint and padding elements should automatically have their 'left'
  // values set to the accessory view's offset + width
  // (18 = 2 left offset + 16 width)
  var paddingElement = view.$('.padding')[0];
  ok(paddingElement.style.left === '18px', 'padding element should get 18px left');

  // Test removing the accessory view.
  SC.RunLoop.begin();
  view.set('leftAccessoryView', null);
  SC.RunLoop.end();
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
  var paddingElement = view.$('.padding')[0];
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
  ok(!paddingElement.style.right, 'after removing the right accessory view the padding element should have no right style');
});

test("Adding right accessory view changes style -- using design()", function() {
  var view = pane.view('with value');

  // test adding accessory view adds the view like it should
  SC.RunLoop.begin();
  var accessoryView = SC.View.design({
    layout:  { top:1, right:3, width:17, height:16 }
  });
  view.set('rightAccessoryView', accessoryView);
  SC.RunLoop.end();

  // The hint and padding elements should automatically have their 'right'
  // values set to the accessory view's offset + width
  // (20 = 3 right offset + 17 width)
  var paddingElement = view.$('.padding')[0];
  ok(paddingElement.style.right === '20px', 'padding element should get 20px right');

  // Test removing the accessory view.
  SC.RunLoop.begin();
  view.set('rightAccessoryView', null);
  SC.RunLoop.end();
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
  var paddingElement = view.$('.padding')[0];
  ok(paddingElement.style.left === '18px', 'padding element should get 18px left');
  ok(paddingElement.style.right === '20px', 'padding element should get 20px right');


  // Test removing the accessory views.
  SC.RunLoop.begin();
  view.set('rightAccessoryView', null);
  SC.RunLoop.end();
  ok(view.get('childViews').length === 1, 'after removing the right accessory view there should be one child view left (the left accessory view)');
  ok(!paddingElement.style.right, 'after removing the right accessory view the padding element should have no right style');
  SC.RunLoop.begin();
  view.set('leftAccessoryView', null);
  SC.RunLoop.end();
  ok(view.get('childViews').length === 0, 'after removing both accessory views there should be no child views left');
  ok(!paddingElement.style.left, 'after removing the left accessory view the padding element should have no left style');
});

test("Adding both left and right accessory views changes style -- using design()", function() {
  var view = pane.view('with value');

  // test adding accessory view adds the view like it should
  SC.RunLoop.begin();
  var leftAccessoryView = SC.View.design({
    layout:  { top:1, left:2, width:16, height:16 }
  });
  view.set('leftAccessoryView', leftAccessoryView);
  var rightAccessoryView = SC.View.design({
    layout:  { top:1, right:3, width:17, height:16 }
  });
  view.set('rightAccessoryView', rightAccessoryView);
  SC.RunLoop.end();

  // The hint and padding elements should automatically have their 'left' and
  // 'right' values set to the accessory views' offset + width
  //   *  left:   18 = 2 left offset + 16 width)
  //   *  right:  20 = 3 left offset + 17 width)
  var paddingElement = view.$('.padding')[0];
  ok(paddingElement.style.left === '18px', 'padding element should get 18px left');
  ok(paddingElement.style.right === '20px', 'padding element should get 20px right');


  // Test removing the accessory views.
  SC.RunLoop.begin();
  view.set('rightAccessoryView', null);
  SC.RunLoop.end();
  ok(!paddingElement.style.right, 'after removing the right accessory view the padding element should have no right style');
  SC.RunLoop.begin();
  view.set('leftAccessoryView', null);
  SC.RunLoop.end();
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

  // wait a little bit to let text field propagate changes
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

test("focus and blur an empty text field", function() {
  var view = pane.view('empty');
  var input = view.$('input');

  // verify the field is empty and the hint is properly set
  pane.verifyEmpty(view, 'Full Name');

  // focus and blur the text field
  SC.Event.trigger(input, 'focus');
  SC.Event.trigger(input, 'blur');

  // field should still be still be empty with hint properly set
  pane.verifyEmpty(view, 'Full Name');
});

test("loosing first responder should blur", function() {
  var view = pane.view('empty');
  var input = view.$('input');
  var testResponder = SC.Responder.create(SC.ResponderContext, {});

  // preliminary setup
  view.get('pane').becomeKeyPane();
  SC.Event.trigger(input, 'focus');

  // verify it did receive focus
  ok(view.get('focused'), 'view should have focus');

  // tell the pane to make our test responder the first responder
  view.get('pane').makeFirstResponder(testResponder);

  // verify it no longer has focus
  ok(!view.get('focused'), 'view should no longer have focus');
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
