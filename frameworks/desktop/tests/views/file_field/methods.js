/*global module test htmlbody ok equals same stop start */

var pane, view;
module("SC.FileFieldView Logic", {
  setup: function() {
    SC.RunLoop.begin();
    pane = SC.MainPane.create({
      childViews: [
      SC.FileFieldView.extend({
        layout: {
          right: 20,
          bottom: 20,
          width: 100,
          height: 24
        }
      })]
    });
    pane.append();
    SC.RunLoop.end();

    view = pane.childViews[0];
  },

  teardown: function() {
    pane.remove();
    pane = view = null;
  }
});

test("Test various mouse events for a default file field view",
function() {
  var i;
  var inputs = view._inputs;
  var buttons = view._buttons;
  equals(inputs.length, 1, 'There should only be one input by default');
  equals(buttons.length, 1, 'There should only be one button by default');
  for (i = inputs.length - 1; i >= 0; i--) {
    var input = inputs[i];
    var button = buttons[i];
    var inputLayer = input.$();
    var buttonLayer = button.$();
    
    equals(button.get('isActive'), NO, 'button.isActive should be NO by default');
    ok(!buttonLayer.hasClass('active'), 'buttonLayer.hasClass(active) should be NO');
    SC.Event.trigger(inputLayer[0], 'mousedown');
    equals(button.get('isActive'), YES, 'button.isActive should be YES on mousedown');
    ok(buttonLayer.hasClass('active'), 'buttonLayer.hasClass(active) should be YES');
    SC.Event.trigger(inputLayer[0], 'mouseup');
    equals(button.get('isActive'), NO, 'button.isActive should be NO on mouseup');
    ok(!buttonLayer.hasClass('active'), 'buttonLayer.hasClass(active) should be NO');
    SC.Event.trigger(inputLayer[0], 'mousedown');
    equals(button.get('isActive'), YES, 'button.isActive should be YES on mousedown');
    ok(buttonLayer.hasClass('active'), 'buttonLayer.hasClass(active) should be YES');
    SC.Event.trigger(inputLayer[0], 'mouseout');
    equals(button.get('isActive'), NO, 'button.isActive should be NO on mouseout');
    ok(!buttonLayer.hasClass('active'), 'buttonLayer.hasClass(active) should be NO');
  }
});

// test("Test various mouse events for a multiple non-progressive file field view", function() {
//   // Reconfigure the file field view
//   view.set('numberOfFiles', 3);
//   view.set('isProgressive', NO);
//   SC.RunLoop.begin().end();
//   
//   var viewLayer = view.$();
//   
//   var i;
//   
//   var inputs = view._inputs;
//   var buttons = view._buttons;
//   equals(inputs.length, 3, 'There should only be three inputs');
//   equals(buttons.length, 3, 'There should only be three buttons');
//   for (i = inputs.length - 1; i >= 0; i--) {
//     var input = inputs[i];
//         var button = buttons[i];
//   var inputLayer = input.$();
//           var buttonLayer = button.$();
// 
//       SC.Event.trigger(inputLayer[0], 'mousedown');
//       equals(button.get('isActive'), YES, 'button.isActive should be YES on mousedown');
//       SC.Event.trigger(inputLayer[0], 'mouseup');
//       equals(button.get('isActive'), NO, 'button.isActive should be NO on mouseup');
//   }
// });

