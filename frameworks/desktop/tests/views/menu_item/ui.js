// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2011 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test htmlbody ok equals same stop start */
var pane, controller, menu,
    callCount = 0,
    testSender = null;

module("SC.MenuItemView", {
  setup: function() {
    pane = SC.MainPane.create({
      layout: { width: 100, height: 20, centerX: 0, centerY: 0 },
      childViews: 'button'.w(),

      button: SC.ButtonView.design({
        menuItemAction: function(sender) {
          callCount += 1;
          testSender = sender;
        }
      })
    }).append();

    pane.makeFirstResponder(pane.button);

    controller = SC.ObjectController.create({
      menuItemAction: function(sender) {
        callCount += 1;
        testSender = sender;
      }
    });

    menu = SC.MenuPane.create({
      items: [
        { title: 'Target / Action', target: 'controller', action: 'menuItemAction' },
        { title: 'Action with no Target', action: 'menuItemAction' }
      ]
    });

    menu.popup(pane.anchor);
  },

  teardown: function() {
    pane.remove();
    menu.remove();
    pane = menu = controller = null;
    callCount = 0;
    testSender = null;
  }
});

test('Sending an action with a target', function() {
  var itemView = menu.get('menuItemViews')[0];
  itemView.sendAction();
  equals(callCount, 1, 'Action should be called.');
  equals(testSender, itemView, 'Action method should get the itemView passed in as the first argument ("sender").');
});

test('Sending an action with no target', function() {
  var itemView = menu.get('menuItemViews')[1];
  itemView.sendAction();
  equals(callCount, 1, 'firstResponder of main pane should be called.');
  equals(testSender, itemView, 'Action method should get the itemView passed in as the first argument ("sender").');
});
