var button;

module("SC.Button", {
  setup: function() {
    button = SC.Button.create();

    pane = SC.MainPane.create({
      childViews: [button]
    });
    pane.append();
  },

  teardown: function() {
    pane.remove();
  }
});

function synthesizeEvent(type, view) {
  var event = new SC.Event({
    type: type,
    target: view.get('layer')
  });
  SC.RootResponder.responder[type](event);
}

test("should trigger an action when clicked", function() {
  var wasClicked = false;

  var actionObject = SC.Object.create({
    myAction: function() {
      wasClicked = true;
    }
  });

  button.target = actionObject;
  button.action = 'myAction';

  synthesizeEvent('mousedown', button);
  synthesizeEvent('mouseup', button);

  ok(wasClicked);
});

test("should not trigger action if mouse leaves area before mouseup", function() {
  var wasClicked = false;

  var actionObject = SC.Object.create({
    myAction: function() {
      wasClicked = true;
    }
  });

  var otherButton = SC.Button.create();
  pane.appendChild(otherButton);

  button.target = actionObject;
  button.action = 'myAction';

  synthesizeEvent('mousedown', button);
  synthesizeEvent('mousemove', button);
  ok(button.get('isActive'), "becomes active when hovered");
  synthesizeEvent('mousemove', otherButton);
  ok(!button.get('isActive'), "loses active state if mouse exits");
  synthesizeEvent('mouseup', button);

  ok(!wasClicked);

  wasClicked = false;

  synthesizeEvent('mousedown', button);
  synthesizeEvent('mousemove', button);
  synthesizeEvent('mousemove', otherButton);
  synthesizeEvent('mousemove', button);
  synthesizeEvent('mouseup', button);

  ok(wasClicked);
});

