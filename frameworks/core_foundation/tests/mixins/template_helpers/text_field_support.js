// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
(function() {
  var textFieldView, pane, controller;

  module("Text Field Support", {
    setup: function() {
      textFieldView = SC.TemplateView.create(SC.TextFieldSupport, {
        template: SC.Handlebars.compile('<input type="text">')
      });

      controller = SC.Object.create({
        value: null
      });

      pane = SC.MainPane.create({
        childViews: [textFieldView]
      });
      pane.append();
    },

    teardown: function() {
      pane.remove();
    }
  });

  test("value property mirrors input value", function() {
    var ev,
        elem;

    elem = textFieldView.$('input')[0];

    // Change it first time
    textFieldView.$('input').val('foo bar');
    equals(textFieldView.get('value'), 'foo bar', "gets value property from DOM on first get");

    textFieldView.set('value', "afterlife");
    equals(textFieldView.$('input').val(), "afterlife", "sets value of DOM to value property");

    // Change it again
    textFieldView.$('input').val('foo bar');
    equals(textFieldView.get('value'), 'foo bar', "gets value property from DOM on repeated get");

    controller.bind('value', textFieldView, 'value');
    SC.RunLoop.begin().end();
    equals(controller.get('value'), 'foo bar', "binding value is correct after bind");

    textFieldView.set('value', "afterlife");
    SC.RunLoop.begin().end();
    equals(controller.get('value'), 'afterlife', "binding value is correct after value changes");

    textFieldView.$('input').val('foo bar');
    pane.sendEvent('keyUp', {}, textFieldView);
    SC.RunLoop.begin().end();
    equals(controller.get('value'), 'foo bar', "binding value is correct after DOM value changes with keyUp");

    textFieldView.$('input')[0].value = 'afterlife';
    SC.RunLoop.begin().end();
    equals(controller.get('value'), 'foo bar', "binding value is incorrect after value of DOM changes directly");

    textFieldView.$('input').val('afterlife');
    SC.RunLoop.begin().end();
    equals(controller.get('value'), 'foo bar', "binding value is incorrect after value of DOM changes directly through jQuery");

    // This test relies on directly setting the value triggering a binding update FAILING. If we are able to
    // notify the value change on direct setting of the value, then this test will pass incorrectly.
    textFieldView.$('input').val('afterlife');
    ev = SC.Event.simulateEvent(elem, 'paste');
    SC.Event.trigger(elem, 'paste', [ev]);
    SC.RunLoop.begin().end();
    equals(controller.get('value'), 'afterlife', "binding value is correct after DOM value changes with paste");

    // This test relies on directly setting the value triggering a binding update FAILING. If we are able to
    // notify the value change on direct setting of the value, then this test will pass incorrectly.
    textFieldView.$('input').val('after');
    ev = SC.Event.simulateEvent(elem, 'cut');
    SC.Event.trigger(elem, 'cut', [ev]);
    SC.RunLoop.begin().end();
    equals(controller.get('value'), 'after', "binding value is correct after DOM value changes with cut");
  });

  test("listens for focus and blur events", function() {
    var focusCalled = 0;
    var blurCalled = 0;

    textFieldView.focus = function() {
      focusCalled++;
    };
    textFieldView.blur = function() {
      blurCalled++;
    };

    equals(focusCalled+blurCalled, 0, "precond - no callbacks called yet");

    textFieldView.$('input').focus();
    equals(focusCalled, 1, "focus called after field receives focus");

    textFieldView.$('input').blur();
    equals(blurCalled, 1, "blur called after field blurs");
  });

  test("calls correct method for key events", function() {
    var insertNewlineCalled = 0;
    var cancelCalled = 0;

    textFieldView.insertNewline = function() {
      insertNewlineCalled++;
      return YES;
    };
    textFieldView.cancel = function() {
      cancelCalled++;
      return YES;
    };

    textFieldView.$('input').focus();
    equals(insertNewlineCalled+cancelCalled, 0, "precond - no callbacks called yet");

    SC.RootResponder.responder.keyup(new SC.Event({ type: 'keyup', keyCode: 13 }));
    equals(insertNewlineCalled, 1, "calls insertNewline after hitting return");

    SC.RootResponder.responder.keyup(new SC.Event({ type: 'keyup', keyCode: 27 }));
    equals(cancelCalled, 1, "calls cancel after pressing escape key");

  });
})();
