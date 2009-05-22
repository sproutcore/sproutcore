// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

var content, controller;

module("SC.ObjectController - empty case", {
  setup: function() {
    content = null;
    controller = SC.ObjectController.create({ content: content });
  },
  
  teardown: function() {
    controller.destroy();
  }
});

test("getting any value should return undefined", function() {
  equals(controller.get("foo"), undefined, 'controller.get(foo)');
  equals(controller.get("bar"), undefined, 'controller.get(bar)');
});

test("setting any unknown value should have no effect", function() {
  equals(controller.set("foo", "FOO"), controller, 'controller.set(foo, FOO) should return self');  
  equals(controller.set("bar", "BAR"), controller, 'controller.set(bar, BAR) should return self');
  equals(controller.get("foo"), undefined, 'controller.get(foo)');
  equals(controller.get("bar"), undefined, 'controller.get(bar)');
});

