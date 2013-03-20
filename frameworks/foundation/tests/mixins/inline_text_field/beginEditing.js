// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2011 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*global module test htmlbody ok equals same stop start Q$ */

var pane, optionsForLabel1, optionsForLabel2, delegate, optionsForLabelFromView;

pane = SC.ControlTestPane.design().add("label1", SC.LabelView, {
  value: 'Some Text',
  notifiedWillBegin: NO,
  notifiedDidBegin: NO,

  inlineEditorShouldBeginEditing: function(inlineEditor) {
    return YES;
  },

  inlineEditorWillBeginEditing: function(inlineEditor) {
    this.set('notifiedWillBegin', YES);

    // The inline editor is the last view appended to the parent
    var parentView = this.get('parentView'),
      length = parentView.childViews.length,
      editor = parentView.childViews[length - 1];

    ok(!editor.get('isFirstResponder'), "should not be first responder yet");

    sc_super();
  },

  inlineEditorDidBeginEditing: function(inlineEditor) {
    this.set('notifiedDidBegin', YES);

    // The inline editor is the last view appended to the parent
    var parentView = this.get('parentView'),
      length = parentView.childViews.length,
      editor = parentView.childViews[length - 1];

    ok(editor.get('isFirstResponder'), "should be first responder now");

    sc_super();
  }
}).add("label2", SC.LabelView, {
  value: 'Can\'t Touch This',

  inlineEditorShouldBeginEditing: function(inlineEditor) {
    return NO;
  }
});

pane.resetView = function(view) {
  view.set('notifiedWillBegin', NO);
  view.set('notifiedDidBegin', NO);
};


optionsForLabelFromView = function(view) {
  var el = view.$(),
  f = SC.offset(el[0]),
  frameTemp = view.convertFrameFromView(view.get('frame'), null);

  f.width = frameTemp.width;
  f.height = frameTemp.height;

  var optionsForLabel = {
    frame: f,
    delegate: view,
    exampleElement: view.$(),
    value: view.get('value'),
    multiline: view.get('isInlineEditorMultiline'),
    validator: view.get('validator'),
    exampleInlineTextFieldView: view.get('exampleInlineTextFieldView')
  };

  return optionsForLabel;
};


/**

*/
module("Test the beginEditing() function of SC.InlineTextFieldView", {
  setup: function() {

    pane.standardSetup().setup();

    var view1 = pane.view('label1'),
    view2 = pane.view("label2");

    // Reset view1 delegate functions
    pane.resetView(view1);

    optionsForLabel1 = optionsForLabelFromView(view1);
    optionsForLabel2 = optionsForLabelFromView(view2);
  },

  teardown: function() {
    optionsForLabel1 = optionsForLabel2 = null;
    SC.InlineTextFieldView.discardEditing();
    pane.standardSetup().teardown();

  }
});

test("fails when required options are missing",
function() {
  try {
    optionsForLabel1["frame"] = null;
    ok(SC.InlineTextFieldView.beginEditing(optionsForLabel1) === NO, "should fail if frame missing");
  } catch(e1) {
    ok(YES, "should fail if frame missing: %@".fmt(e1));
  }

  try {
    optionsForLabel1["delegate"] = null;
    ok(SC.InlineTextFieldView.beginEditing(optionsForLabel1) === NO, "should fail if delegate missing");
  } catch(e2) {
    ok(YES, "should fail if delegate missing: %@".fmt(e2));
  }

  try {
    optionsForLabel1["exampleElement"] = null;
    ok(SC.InlineTextFieldView.beginEditing(optionsForLabel1) === NO, "should fail if exampleElement missing");
  } catch(e3) {
    ok(YES, "should fail if exampleElement missing: %@".fmt(e3));
  }
});

test("value of inline editor same as label",
function() {

  SC.RunLoop.begin();
  SC.InlineTextFieldView.beginEditing(optionsForLabel1);
  SC.RunLoop.end();

  // The inline editor is the last view appended to the parent
  var view = pane.view('label1'),
    parentView = view.get('parentView'),
    length = parentView.childViews.length,
    editor = parentView.childViews[length - 1];

  equals(editor.get('value'), view.get('value'), "editor should have the same initial value as its label");
});

test("use input element when options.multiline is set to NO",
function() {
  SC.RunLoop.begin();
  SC.InlineTextFieldView.beginEditing(optionsForLabel1);
  SC.RunLoop.end();

  // The inline editor is the last view appended to the parent
  var view = pane.view('label1'),
    parentView = view.get('parentView'),
    length = parentView.childViews.length,
    editor = parentView.childViews[length - 1];

  ok(editor.$("input").length > 0, "should be using an input element");
});

test("use textarea element when options.multiline is set to YES",
function() {
  optionsForLabel1["multiline"] = YES;

  SC.RunLoop.begin();
  SC.InlineTextFieldView.beginEditing(optionsForLabel1);
  SC.RunLoop.end();

  // The inline editor is the last view appended to the parent
  var view = pane.view('label1'),
    parentView = view.get('parentView'),
    length = parentView.childViews.length,
    editor = parentView.childViews[length - 1];

  ok(editor.$("textarea").length > 0, "should be using a textarea element");
});
/* TODO: move these to inlineEditorDelegate tests
test("inline editor aborts if delegate returns NO to inlineEditorShouldBeginEditing()",
function() {
  SC.InlineTextFieldView.beginEditing(optionsForLabel2);

  // The inline editor is the last view appended to the pane
  var length = pane._pane.childViews.length,
  editor = pane._pane.childViews[length - 1];

  ok(!editor.get('isEditing'), "editor should have isEditing set to NO");
});

test("inline editor notifies delegate with inlineEditorWillBeginEditing() before becoming responder",
function() {
  var view1 = pane.view('label1');

  SC.RunLoop.begin();
  ok(!view1.get('notifiedWillBegin'), "the delegate should not have been notified of begin editing at this point");
  SC.InlineTextFieldView.beginEditing(optionsForLabel1);
  ok(view1.get('notifiedWillBegin'), "the delegate should have been notified of begin editing at this point");
  SC.RunLoop.end();
});
*/
test("inline editor notifies delegate with inlineEditorDidBeginEditing() after becoming responder",
function() {
  var view1 = pane.view('label1');

  // Start a run loop because the notification isn't invoked until the beginning of the next run loop
  SC.RunLoop.begin();

  ok(!view1.get('notifiedDidBegin'), "the delegate should not have been notified of begin editing at this point");
  SC.InlineTextFieldView.beginEditing(optionsForLabel1);
  SC.RunLoop.end();

  ok(view1.get('notifiedDidBegin'), "the delegate should have been notified of begin editing at this point");
});

test("inline editor does not display the defaultValue if the label's value is the number 0",
function() {
  var view1 = pane.view('label1');
  view1.set('value', 0);
  optionsForLabel1 = optionsForLabelFromView(view1);

  SC.RunLoop.begin();
  SC.InlineTextFieldView.beginEditing(optionsForLabel1);
  SC.RunLoop.end();

  // The inline editor is the last view appended to the parent
  var view = pane.view('label1'),
    parentView = view.get('parentView'),
    length = parentView.childViews.length,
    editor = parentView.childViews[length - 1];

  same(editor.get('value'), 0, "editor should have number 0 as value");
  editor.blurEditor();

  same(view1.get('value'), 0, "view should still have number 0 as value");
});
