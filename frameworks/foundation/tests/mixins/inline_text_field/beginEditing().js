// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            portions copyright @2009 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*global module test htmlbody ok equals same stop start Q$ */

var pane, optionsForLabel1, optionsForLabel2, delegate;

pane = SC.ControlTestPane.design().add("label1", SC.LabelView, {
  value: 'Some Text',
  notifiedWillBegin: NO,
  notifiedDidBegin: NO,

  inlineEditorShouldBeginEditing: function(inlineEditor) {
    return YES;
  },

  inlineEditorWillBeginEditing: function(inlineEditor) {
    this.set('notifiedWillBegin', YES);

    // The inline editor is the last view appended to the pane
    var length = pane._showPane.childViews.length,
    editor = pane._showPane.childViews[length - 1];

    ok(!editor.get('isFirstResponder'), "should not be first responder yet");
  },

  inlineEditorDidBeginEditing: function(inlineEditor) {
    this.set('notifiedDidBegin', YES);

    // The inline editor is the last view appended to the pane
    var length = pane._showPane.childViews.length,
    editor = pane._showPane.childViews[length - 1];

    ok(editor.get('isFirstResponder'), "should be first responder now");
  }
}).add("label2", SC.LabelView, {
  value: 'Can\'t Touch This',

  inlineEditorShouldBeginEditing: function(inlineEditor) {
    return NO;
  }
});

pane.show();

pane.resetView = function(view) {
  view.set('notifiedWillBegin', NO);
  view.set('notifiedDidBegin', NO);
};

/**
  
*/
module("Test the beginEditing() function of SC.InlineTextFieldView", {
  setup: function() {

    var view1 = pane.view('label1'),
    view2 = pane.view("label2");

    // Reset view1 delegate functions
    pane.resetView(view1);

    var el = view1.$(),
    f = SC.viewportOffset(el[0]),
    frameTemp = view1.convertFrameFromView(view1.get('frame'), null);

    f.width = frameTemp.width;
    f.height = frameTemp.height;

    optionsForLabel1 = {
      frame: f,
      delegate: view1,
      exampleElement: view1.$(),
      value: view1.get('value'),
      multiline: view1.get('isInlineEditorMultiline'),
      isCollection: NO,
      validator: view1.get('validator'),
      exampleInlineTextFieldView: view1.get('exampleInlineTextFieldView')
    };

    el = view2.$();
    f = SC.viewportOffset(el[0]);
    frameTemp = view2.convertFrameFromView(view2.get('frame'), null);

    f.width = frameTemp.width;
    f.height = frameTemp.height;

    optionsForLabel2 = {
      frame: f,
      delegate: view2,
      exampleElement: view2.$(),
      value: view2.get('value'),
      multiline: view2.get('isInlineEditorMultiline'),
      isCollection: NO,
      validator: view2.get('validator'),
      exampleInlineTextFieldView: view2.get('exampleInlineTextFieldView')
    };
  },

  teardown: function() {
    optionsForLabel1 = optionsForLabel2 = null;
    SC.InlineTextFieldView.discardEditing();
  }
});

test("fails when options missing",
function() {

  try {
    SC.InlineTextFieldView.beginEditing();
    ok(NO, "should fail if parameters missing");
  } catch(e) {
    ok(YES, "should fail if parameters missing");
  }
});

test("fails when required options are missing",
function() {
  try {
    optionsForLabel1["frame"] = null;
    SC.InlineTextFieldView.beginEditing(optionsForLabel1);
    ok(NO, "should fail if frame missing");
  } catch(e1) {
    ok(YES, "should fail if frame missing: %@".fmt(e1));
  }

  try {
    optionsForLabel1["delegate"] = null;
    SC.InlineTextFieldView.beginEditing(optionsForLabel1);
    ok(NO, "should fail if delegate missing");
  } catch(e2) {
    ok(YES, "should fail if delegate missing: %@".fmt(e2));
  }

  try {
    optionsForLabel1["exampleElement"] = null;
    SC.InlineTextFieldView.beginEditing(optionsForLabel1);
    ok(NO, "should fail if exampleElement missing");
  } catch(e3) {
    ok(YES, "should fail if exampleElement missing: %@".fmt(e3));
  }
});

test("value of inline editor same as label",
function() {
  SC.RunLoop.begin();
  SC.InlineTextFieldView.beginEditing(optionsForLabel1);
  SC.RunLoop.end();

  // The inline editor is the last view appended to the pane
  var length = pane._showPane.childViews.length,
  editor = pane._showPane.childViews[length - 1],
  view = pane.view('label1');

  equals(editor.get('value'), view.get('value'), "editor should have the same initial value as its label");
});

test("use input element when options.multiline is set to NO",
function() {
  SC.RunLoop.begin();
  SC.InlineTextFieldView.beginEditing(optionsForLabel1);
  SC.RunLoop.end();

  // The inline editor is the last view appended to the pane
  var length = pane._showPane.childViews.length,
  editor = pane._showPane.childViews[length - 1];

  ok(editor.$("input").length > 0, "should be using an input element");
});

test("use textarea element when options.multiline is set to YES",
function() {
  optionsForLabel1["multiline"] = YES;

  SC.RunLoop.begin();
  SC.InlineTextFieldView.beginEditing(optionsForLabel1);
  SC.RunLoop.end();

  // The inline editor is the last view appended to the pane
  var length = pane._showPane.childViews.length,
  editor = pane._showPane.childViews[length - 1];

  ok(editor.$("textarea").length > 0, "should be using a textarea element");
});

test("inline editor aborts if delegate returns NO to inlineEditorShouldBeginEditing()",
function() {
  SC.InlineTextFieldView.beginEditing(optionsForLabel2);

  // The inline editor is the last view appended to the pane
  var length = pane._showPane.childViews.length,
  editor = pane._showPane.childViews[length - 1];

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
