// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*global module test equals context ok same */

(function() {
  var target, pane, sendActionSpy, view;

  module("SC.ActionSupport", {
    setup: function() {
      target = SC.Object.create({
        mainAction: function() {},
        someAction: function() {}
      });

      var rootResponder = {sendAction: function(){} };
      sendActionSpy = CoreTest.spyOn(rootResponder, 'sendAction');

      pane = SC.Object.create({
        rootResponder: rootResponder
      });

      view = SC.View.create(SC.ActionSupport, {
        pane: pane
      });
    },

    teardown: function() {
      target = pane = sendActionSpy = view = null;
    }
  });


  // ..........................................................
  // No Arguments
  //

  test("no arguments - only action set", function() {
    var expectedAction = 'someAction';

    view.set('action', expectedAction);
    view.fireAction();

    ok(sendActionSpy.wasCalledWith(expectedAction, null, view, pane, null, view), 'triggers the action');
  });

  test("no arguments - action and target set", function() {
    var expectedAction = 'someAction';

    view.set('action', expectedAction);
    view.set('target', target);
    view.fireAction();

    ok(sendActionSpy.wasCalledWith(expectedAction, target, view, pane, null, view), 'triggers the action');
  });


  // ..........................................................
  // Arguments
  //

  test("context argument", function() {
    var expectedAction = 'someAction';
    var context = { zomg: "context" };

    view.set('action', expectedAction);
    view.fireAction(context);

    ok(sendActionSpy.wasCalledWith(expectedAction, null, view, pane, context, view), 'triggers the action');
  });


  // ..........................................................
  // Backwards-compatibility
  //

  test("backwards-compatibility actionContext property", function() {
    var expectedAction = 'someAction';
    var context = { zomg: "context" };

    view.set('action', expectedAction);
    view.set('actionContext', context);
    view.fireAction();

    ok(sendActionSpy.wasCalledWith(expectedAction, null, view, pane, context, view), 'triggers the action');
  });

  test("backwards-compatibility action argument", function() {
    var expectedAction = 'someAction';
    var context = { zomg: "context" };

    view.fireAction(expectedAction);

    ok(sendActionSpy.wasCalledWith(expectedAction, null, view, pane, null, view), 'triggers the action');
  });

  test("backwards-compatibility String context argument", function() {
    var expectedAction = 'someAction';
    var context = "context";

    view.set('action', expectedAction);
    view.fireAction(context);

    ok(sendActionSpy.wasCalledWith(expectedAction, null, view, pane, context, view), 'triggers the action');
  });

})();
