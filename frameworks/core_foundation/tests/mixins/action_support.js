// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*global module test equals context ok same */

(function() {
  var target, pane, noneView, actionView, eventView, bothView,
      paneActionSpy, paneSomeActionSpy,
      targetActionSpy, targetSomeActionSpy;

  module("SC.ActionSupport", {
    setup: function() {
      target = SC.Object.create({
        mainAction: function() {},
        someAction: function() {}
      });

      pane = SC.Pane.create({
        childViews: ['noneView', 'actionView', 'eventView', 'bothView'],

        mainAction: function() {},
        someAction: function() {},

        noneView: SC.View.design(SC.ActionSupport, {
          action: 'mainAction',

          mouseDown: function() {
            this.fireAction();
          }
        }),

        actionView: SC.View.design(SC.ActionSupport, {
          otherAction: 'someAction',

          mouseDown: function() {
            this.fireAction(this.get('otherAction'));
          }
        }),

        eventView: SC.View.design(SC.ActionSupport, {
          action: 'mainAction',

          mouseDown: function(evt) {
            this.fireAction(evt);
          }
        }),

        bothView: SC.View.design(SC.ActionSupport, {
          differentAction: 'someAction',

          mouseDown: function(evt) {
            this.fireAction(this.get('differentAction'), evt);
          }
        })
      });
      pane.append();

      noneView = pane.get('noneView');
      actionView = pane.get('actionView');
      eventView = pane.get('eventView');
      bothView = pane.get('bothView');

      paneActionSpy = CoreTest.spyOn(pane, 'mainAction');
      paneSomeActionSpy = CoreTest.spyOn(pane, 'someAction');

      targetActionSpy = CoreTest.spyOn(target, 'mainAction');
      targetSomeActionSpy = CoreTest.spyOn(target, 'someAction');
    },
    teardown: function() {
      pane.remove().destroy();
      pane = noneView = actionView = eventView = bothView = null;
    }
  });


  // ..........................................................
  // No Parameters
  // 

  test("no paramaters - Invoking actions without setting target fires along responder chain", function() {
    noneView.mouseDown();

    ok(paneActionSpy.wasCalled, "pane mainAction was called by fireAction");
    ok(!paneSomeActionSpy.wasCalled, "pane someAction was not called by fireAction");
    ok(!targetActionSpy.wasCalled, "target mainAction was not called by fireAction");
    ok(!targetSomeActionSpy.wasCalled, "target someAction was not called by fireAction");
  });

  test("no paramaters - Invoking actions with target set calls on target", function() {
    noneView.set('target', target);
    noneView.mouseDown();

    ok(!paneActionSpy.wasCalled, "pane mainAction was not called by fireAction");
    ok(!paneSomeActionSpy.wasCalled, "pane someAction was not called by fireAction");
    ok(targetActionSpy.wasCalled, "target mainAction was called by fireAction");
    ok(!targetSomeActionSpy.wasCalled, "target someAction was not called by fireAction");
  });


  // ..........................................................
  // Actions Parameter
  // 

  test("action parameter - Invoking actions without setting target fires along responder chain", function() {
    actionView.mouseDown();

    ok(!paneActionSpy.wasCalled, "pane mainAction was not called by fireAction");
    ok(paneSomeActionSpy.wasCalled, "pane someAction was called by fireAction");
    ok(!targetActionSpy.wasCalled, "target mainAction was not called by fireAction");
    ok(!targetSomeActionSpy.wasCalled, "target someAction was not called by fireAction");
  });

  test("action parameter - Invoking actions with target set calls on target", function() {
    actionView.set('target', target);
    actionView.mouseDown();

    ok(!paneActionSpy.wasCalled, "pane mainAction was not called by fireAction");
    ok(!paneSomeActionSpy.wasCalled, "pane someAction was not called by fireAction");
    ok(!targetActionSpy.wasCalled, "target mainAction was not called by fireAction");
    ok(targetSomeActionSpy.wasCalled, "target someAction was called by fireAction");
  });


  // ..........................................................
  // Event Parameter
  // 

  test("event parameter - Invoking actions without setting target fires along responder chain", function() {
    eventView.mouseDown({});

    ok(paneActionSpy.wasCalled, "pane mainAction was called by fireAction");
    ok(!paneSomeActionSpy.wasCalled, "pane someAction was not called by fireAction");
    ok(!targetActionSpy.wasCalled, "target mainAction was not called by fireAction");
    ok(!targetSomeActionSpy.wasCalled, "target someAction was not called by fireAction");
  });

  test("event parameter - Invoking actions with target set calls on target", function() {
    eventView.set('target', target);
    eventView.mouseDown();

    ok(!paneActionSpy.wasCalled, "pane mainAction was not called by fireAction");
    ok(!paneSomeActionSpy.wasCalled, "pane someAction was not called by fireAction");
    ok(targetActionSpy.wasCalled, "target mainAction was called by fireAction");
    ok(!targetSomeActionSpy.wasCalled, "target someAction was not called by fireAction");
  });


  // ..........................................................
  // Both Parameters
  // 

  test("both parameters - Invoking actions without setting target fires along responder chain", function() {
    bothView.mouseDown({});

    ok(!paneActionSpy.wasCalled, "pane mainAction was not called by fireAction");
    ok(paneSomeActionSpy.wasCalled, "pane someAction was called by fireAction");
    ok(!targetActionSpy.wasCalled, "target mainAction was not called by fireAction");
    ok(!targetSomeActionSpy.wasCalled, "target someAction was not called by fireAction");
  });

  test("both parameters - Invoking actions with target set calls on target", function() {
    bothView.set('target', target);
    bothView.mouseDown();

    ok(!paneActionSpy.wasCalled, "pane mainAction was not called by fireAction");
    ok(!paneSomeActionSpy.wasCalled, "pane someAction was not called by fireAction");
    ok(!targetActionSpy.wasCalled, "target mainAction was not called by fireAction");
    ok(targetSomeActionSpy.wasCalled, "target someAction was called by fireAction");
  });

})();