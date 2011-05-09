var button, wasTriggered, actionObject, rootResponder, pane, expectedAction;
var calledAction, calledTarget, calledSender, calledPane, calledContext, calledFirstResponder;

module("SC.Button", {
  setup: function() {
    expectedAction = 'myAction';
    targetObject = SC.Object.create({
      myAction: function() {
      }
    });

    //This is ugly because we don't bundle a mocking framework
    pane = SC.Object.create({
      rootResponder: {
        sendAction: function(action, target, sender, pane, context, firstResponder) {
          calledAction         = action;
          calledTarget         = target;
          calledSender         = sender;
          calledPane           = pane;
          calledContext        = context;
          calledFirstResponder = firstResponder;
          wasTriggered = true;
        }
      }
    });

    button = SC.Button.create({
      target: targetObject,
      action: 'myAction',
      pane: pane
    });

    wasTriggered = false;
    calledAction = calledTarget = calledSender = calledContext = calledFirstResponder = undefined;
  }
});

test("#mouseUp - triggers the action when mouse is over the button", function() {
  button.set('isActive', true);

  button.mouseUp();

  ok(wasTriggered, 'should trigger the action');
  //this is ugly because we don't bundle a mocking framework
  equals(calledAction,   expectedAction, 'root responder should be called with the expected action');
  equals(calledTarget,   targetObject,   'root responder should be called with the expected target');
  equals(calledSender,   button,         'root responder should be called with the button as the sender');
  equals(calledPane,     pane,           'root responder should be called with the button\'s pane as the pane');
  equals(calledContext,  null,           'root responder should be called with null for the context');
});

test("#mouseUp - does not trigger action if mouse is not over the button", function() {
  button.set('isActive', false);

  button.mouseUp();
  ok(!wasTriggered, 'should not trigger the action');
});

test('#mouseUp - makes the button no longer active', function () {
  button.set('isActive', true);
  button.mouseUp();

  equals(button.get('isActive'), false, 'should set the button to not be active');
});

test('#mouseDown - makes the button active', function() {
  button.set('isActive', false);
  button.mouseDown();

  equals(button.get('isActive'), true, 'should set the button to be active');
});

test('#mouseExited - makes but button no longer active', function() {
  button.set('isActive', false);
  button.mouseExited();

  equals(button.get('isActive'), false, 'should set the button to no longer be active');
});
