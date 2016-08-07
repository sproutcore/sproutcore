/*global module test htmlbody ok equals same stop start */

/**
  SC.FileFieldView consists of a wrapper div which contains one or more SC.ButtonViews, SC.LabelViews and a hidden form field containing one or more file inputs.  Before the form is submitted (automatically by default) a hidden iframe is created and set as the target of the form.  An onload listener for the iframe is used to get the results of the file upload and relay them back to its delegate.
  
  Because we can't actually test selecting or submitting a file, some testing will have to be manually performed.
  
  Important UI things to test: 
    - the button should be able to be disabled, made default, have its title changed (state dependent), have its style changed
    - the label (displays info or current selected file) should be able to have its value changed (state dependent, but untestable through JS alone), to be hidden
    - the form should always be hidden and should always exist
  
  **/
htmlbody('<style> .sc-static-layout { border: 1px red dotted; } </style>');

//control test pane
var pane = SC.ControlTestPane.design().add("Default", SC.FileFieldView, {
  // default
}).add("Disabled", SC.FileFieldView, {
  isEnabled: NO
}).add("NotVisible", SC.FileFieldView, {
  isVisible: NO
}).add("CustomButtonTheme", SC.FileFieldView, {
  buttonTheme: "square"
}).add("CustomButtonTitle", SC.FileFieldView, {
  buttonTitle: "Select an Image"
}).add("CustomEmptyText", SC.FileFieldView, {
  emptyText: "none"
}).add("ProgressiveMultipleInputs", SC.FileFieldView, {
  numberOfFiles: 3
}).add("MultipleInputs", SC.FileFieldView, {
  numberOfFiles: 3,
  isProgressive: NO
});

pane.show();

// ..........................................................
// TEST VIEWS
//
module('SC.FileFieldView ui', pane.standardSetup());

// Test the default file field view
test("Test the default file field display",
function() {
  var view = pane.view('Default');
  var viewLayer = view.$();
  /** SC.FileFieldView defaults **/
  equals(view.get('buttonTitle'), 'Choose File', 'Default.buttonTitle should equal \'Choose File\'');
  equals(view.get('buttonTheme'), 'capsule', 'Default.buttonTheme should equal \'capsule\'');
  equals(view.get('buttonTitleWithSelection'), 'Change', 'Default.buttonTitleWithSelection should equal \'Change\'');
  equals(view.get('emptyText'), 'no file selected', 'Default.emptyText should equal \'no file selected\'');
  equals(view.get('displaysSelectedFilename'), YES, 'Default.displaysSelectedFilename should be YES');
  equals(view.get('formAction'), '', 'Default.formAction should equal \'\'');
  equals(view.get('inputName'), 'files[]', 'Default.inputName should equal \'files[]\'');
  equals(view.get('autoSubmit'), YES, 'Default.autoSubmit should be YES');
  equals(view.get('numberOfFiles'), 1, 'Default.numberOfFiles should be 1');
  equals(view.get('isProgressive'), YES, 'Default.isProgressive should be YES');

  /** SC.View defaults **/
  equals(view.get('isEnabled'), YES, 'Default.isEnabled should be YES');
  equals(view.get('isVisible'), YES, 'Default.isVisible should be YES');

  ok(view.get('isVisibleInWindow'), 'Default.isVisibleInWindow should be YES');
  ok(viewLayer.hasClass('sc-view'), 'viewLayer.hasClass(sc-view) should be YES');
  ok(viewLayer.hasClass('sc-file-field-view'), 'viewLayer.hasClass(sc-file-field-view) should be YES');
  ok(!viewLayer.hasClass('sel'), 'viewLayer.hasClass(sel) should be NO');
  ok(!viewLayer.hasClass('disabled'), 'viewLayer.hasClass(disabled) should be NO');
  ok(!viewLayer.hasClass('def'), 'viewLayer.hasClass(def) should be NO');

  var i;
  var buttons = view._buttons;
  equals(buttons.length, 1, 'There should only be one button by default');
  for (i = buttons.length - 1; i >= 0; i--) {
    var button = buttons[i];
    var buttonLayer = button.$();
    equals(button.get('title'), 'Choose File', 'button.title should equal \'Choose File\'');
    ok(buttonLayer.hasClass('sc-view'), 'buttonLayer.hasClass(sc-view) should be YES');
    ok(buttonLayer.hasClass('sc-button-view'), 'buttonLayer.hasClass(sc-button-view) should be YES');
    ok(buttonLayer.hasClass('sc-regular-size'), 'buttonLayer.hasClass(sc-regular-size) should be YES');
    ok(buttonLayer.hasClass('sc-file-field-button-view'), 'buttonLayer.hasClass(sc-file-field-button-view) should be YES');
    ok(buttonLayer.hasClass('capsule'), 'buttonLayer.hasClass(capsule) should be YES');
    ok(!buttonLayer.hasClass('icon'), 'buttonLayer.hasClass(icon) should be NO');
  }

  var labels = view._labels;
  equals(labels.length, 1, 'There should only be one label by default');
  for (i = labels.length - 1; i >= 0; i--) {
    var label = labels[i];
    var labelLayer = label.$();
    equals(label.get('value'), 'no file selected', 'label.title should equal \'no file selected\'');
    ok(labelLayer.hasClass('sc-view'), 'labelLayer.hasClass(sc-view) should be YES');
    ok(labelLayer.hasClass('sc-label-view'), 'labelLayer.hasClass(sc-button-view) should be YES');
    ok(labelLayer.hasClass('sc-regular-size'), 'labelLayer.hasClass(sc-regular-size) should be YES');
    ok(labelLayer.hasClass('sc-file-field-label-view'), 'labelLayer.hasClass(sc-file-field-label-view) should be YES');
  }

  var form = view._form;
  var formLayer = form.$();
  equals(form.get('tagName'), 'form', 'form.tagName should equal \'form\'');
  equals(form.get('action'), '', 'form.action should equal \'\'');
  equals(form.get('target'), '', 'form.target should equal \'\'');
  ok(formLayer.hasClass('sc-view'), 'formLayer.hasClass(sc-view) should be YES');
  ok(formLayer.hasClass('sc-file-field-form'), 'formLayer.hasClass(sc-file-field-form) should be YES');
  equals(formLayer[0].action, "?X-Progress-ID=", 'formLayer.action should equal \'?X-Progress-ID=\'');
  
  var inputs = view._inputs;
  equals(inputs.length, 1, 'There should only be one input by default');
  for (i = inputs.length - 1; i >= 0; i--) {
    var input = inputs[i];
    var inputLayer = input.$();
    equals(input.get('tagName'), 'input', 'input.tagName should equal \'input\'');
    equals(input.get('name'), 'files[]', 'input.title should equal \'files[]\'');
    ok(inputLayer.hasClass('sc-view'), 'inputLayer.hasClass(sc-view) should be YES');
    ok(inputLayer.hasClass('sc-file-field-input-view'), 'inputLayer.hasClass(sc-file-field-input-view) should be YES');
    equals(inputLayer[0].type, 'file', 'inputLayer.type should equal \'file\'');
    equals(inputLayer[0].name, 'files[]', 'inputLayer.name should equal \'files[]\'');
    equals(inputLayer[0].style.opacity,  0, 'inputLayer.opacity should equal 0');
  }
});

// Test the disabled default file field view
test("Test a disabled default file field display",
function() {
  var view = pane.view('Disabled');
  var viewLayer = view.$();
  equals(view.get('isEnabled'), NO, 'Disabled.isEnabled should be NO');
  ok(viewLayer.hasClass('disabled'), 'viewLayer.hasClass(disabled) should be YES');
});

// Test the not visible default file field view
test("Test a not visible default file field display",
function() {
  var view = pane.view('NotVisible');
  var viewLayer = view.$();
  equals(view.get('isVisible'), NO, 'NotVisible.isVisible should be NO');
  equals(view.get('isVisibleInWindow'), NO, 'NotVisible.isVisibleInWindow should be NO');
  ok(viewLayer.hasClass('hidden'), 'viewLayer.hasClass(hidden) should be YES');
});

test("Test a custom button themed default file field display",
function() {
  var view = pane.view('CustomButtonTheme');
  var viewLayer = view.$();
  equals(view.get('buttonTheme'), 'square', 'CustomButtonTitle.buttonTheme should equal \'square\'');

  var i;
  var buttons = view._buttons;
  equals(buttons.length, 1, 'There should only be one button by default');
  for (i = buttons.length - 1; i >= 0; i--) {
    var button = buttons[i];
    var buttonLayer = button.$();
    ok(buttonLayer.hasClass('square'), 'buttonLayer.hasClass(square) should be YES');
    ok(!buttonLayer.hasClass('capsule'), 'buttonLayer.hasClass(capsule) should be NO');
  }
});

test("Test a custom button titled default file field display",
function() {
  var view = pane.view('CustomButtonTitle');
  var viewLayer = view.$();
  equals(view.get('buttonTitle'), 'Select an Image', 'CustomButtonTitle.buttonTitle should equal \'Select an Image\'');

  var i;
  var buttons = view._buttons;
  equals(buttons.length, 1, 'There should only be one button by default');
  for (i = buttons.length - 1; i >= 0; i--) {
    var button = buttons[i];
    var buttonLayer = button.$();
    equals(button.get('title'), 'Select an Image', 'button.title should equal \'Select an Image\'');
  }
});

test("Test a custom labeled default file field display",
function() {
  var view = pane.view('CustomEmptyText');
  var viewLayer = view.$();
  equals(view.get('emptyText'), 'none', 'CustomEmptyText.emptyText should equal \'none\'');

  var i;
  var labels = view._labels;
  equals(labels.length, 1, 'There should only be one label by default');
  for (i = labels.length - 1; i >= 0; i--) {
    var label = labels[i];
    var labelLayer = label.$();
    equals(label.get('value'), 'none', 'label.title should equal \'none\'');
  }
});

test("Test multiple file upload for a default file field display (actually only shows 1, but grows)",
function() {
  var view = pane.view('ProgressiveMultipleInputs');
  var viewLayer = view.$();

  var i;
  var buttons = view._buttons;
  equals(view.get('numberOfFiles'), 3, 'ProgressiveMultipleInputs.numberOfFiles should be 3');
  equals(buttons.length, 1, 'There should only be one button by default');
  for (i = buttons.length - 1; i >= 0; i--) {
    var button = buttons[i];
    var buttonLayer = button.$();
  }

  var labels = view._labels;
  equals(labels.length, 1, 'There should only be one label by default');
  for (i = labels.length - 1; i >= 0; i--) {
    var label = labels[i];
    var labelLayer = label.$();
  }
  
  var inputs = view._inputs;
  equals(inputs.length, 1, 'There should only be one input by default');
  for (i = inputs.length - 1; i >= 0; i--) {
    var input = inputs[i];
    var inputLayer = input.$();
  }
});

test("Test multiple file upload with isProgressive off",
function() {
  var view = pane.view('MultipleInputs');
  var viewLayer = view.$();
  equals(view.get('numberOfFiles'), 3, 'MultipleInputs.numberOfFiles should be 3');

  var i;
  var buttons = view._buttons;
  equals(buttons.length, 3, 'There should be three buttons');
  for (i = buttons.length - 1; i >= 0; i--) {
    var button = buttons[i];
    var buttonLayer = button.$();
  }

  var labels = view._labels;
  equals(labels.length, 3, 'There should be three labels');
  for (i = labels.length - 1; i >= 0; i--) {
    var label = labels[i];
    var labelLayer = label.$();
  }
  
  var inputs = view._inputs;
  equals(inputs.length, 3, 'There should be three inputs');
  for (i = inputs.length - 1; i >= 0; i--) {
    var input = inputs[i];
    var inputLayer = input.$();
    equals(input.get('name'), 'files[]', 'input.title should equal \'files[]\'');
    equals(inputLayer[0].name, 'files[]', 'inputLayer.name should equal \'files[]\'');
  }
});
