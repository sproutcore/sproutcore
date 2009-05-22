// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

var content, controller;

module("SC.ObjectController - single case", {
  setup: function() {
    content = SC.Object.create({ foo: "foo1", bar: "bar1" });
    controller = SC.ObjectController.create({ content: content });
  },
  
  teardown: function() {
    controller.destroy();
  }
});

test("getting any unknown value should pass through to object", function() {
  equals(controller.get("foo"), "foo1", 'controller.get(foo)');
  equals(controller.get("bar"), "bar1", 'controller.get(bar)');
});

test("setting any unknown value should pass through", function() {
  equals(controller.set("foo", "EDIT"), controller, 'controller.set(foo, EDIT) should return self');  
  equals(controller.set("bar", "EDIT"), controller, 'controller.set(bar, EDIT) should return self');
  equals(controller.set("baz", "EDIT"), controller, 'controller.set(baz, EDIT) should return self');
  
  equals(content.get("foo"), "EDIT", 'controller.get(foo)');
  equals(controller.get("bar"), "EDIT", 'controller.get(bar)');
  equals(controller.get("baz"), "EDIT", 'controller.get(bar)');
});

test("changing a property on the content", function() {
  var callCount = 0;
  controller.addObserver("foo", function() { callCount++; });

  equals(controller.get("foo"), "foo1", "controller.get(foo) before edit should have original value");

  content.set("foo", "EDIT");
  equals(controller.get("foo"), "EDIT", "controller.get(foo) after edit should have updated value");
  equals(callCount, 1, 'observer on controller should have fired');
});

test("changing the content from one single to another", function() {
  var callCount = 0 ;
  var content2 = SC.Object.create({ foo: "foo2", bar: "bar2" });
  controller.addObserver("foo", function() { callCount++; });

  equals(controller.get("foo"), "foo1", "controller.get(foo) before edit should have original value");

  controller.set("content", content2);

  equals(controller.get("foo"), "foo2", "controller.get(foo) after content should contain new content");
  equals(callCount, 1, 'observer on controller should have fired');

  callCount = 0 ;
  content2.set("foo", "EDIT");
  equals(controller.get("foo"), "EDIT", "controller.get(foo) after edit should have updated value");
  equals(callCount, 1, 'observer on controller should have fired');
  
  callCount = 0;
  content.set("foo", "BAR");
  equals(controller.get("foo"), "EDIT", "controller.get(foo) after edit of non-content object should not change value");
  equals(callCount, 0, 'observer on controller should NOT have fired');
});

test("changing the content from one single to null and back", function() {
  var callCount = 0 ;
  controller.addObserver("foo", function() { callCount++; });

  equals(controller.get("foo"), "foo1", "controller.get(foo) before edit should have original value");

  controller.set("content", null);

  equals(controller.get("foo"), undefined, "controller.get(foo) after content change should be empty");
  equals(callCount, 1, 'observer on controller should have fired');

  callCount = 0;
  content.set("foo", "BAR");
  equals(controller.get("foo"), undefined, "controller.get(foo) after edit of non-content object should not change value");
  equals(callCount, 0, 'observer on controller should NOT have fired');

  callCount = 0 ;
    controller.set("content", content);
  equals(callCount, 1, 'observer on controller should have fired');

  callCount = 0 ;
  content.set("foo", "EDIT");
  equals(controller.get("foo"), "EDIT", "controller.get(foo) after edit should have updated value");
  equals(callCount, 1, 'observer on controller should have fired');
  
});

