(function() {
  var textFieldView, pane;

  module("Text Field Support", {
    setup: function() {
      textFieldView = SC.TemplateView.create(SC.TextFieldSupport, {
        template: SC.Handlebars.compile('<input type="text">')
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
    textFieldView.$('input').val('foo bar');

    equals(textFieldView.get('value'), 'foo bar', "gets value property from DOM");

    textFieldView.set('value', "afterlife");
    equals(textFieldView.$('input').val(), "afterlife", "sets value of DOM to value property");
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
    equals(blurCalled, 1, "blur alled after field blurs");
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
