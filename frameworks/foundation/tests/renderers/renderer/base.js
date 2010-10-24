// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test equals context ok */

var context = null, elem = null, testRenderer = null;

module("SC.Renderer", {
  setup: function() {
    elem = document.createElement('div');
    context = SC.RenderContext(elem) ;
    testRenderer = SC.Renderer.extend({
      name: 'test',
      sizes: [
        { 'name': 'small', height: 16 },
        { 'name': 'regular', height: 24 },
        { 'name': 'large', height: 32 }
      ],
      render: function(context) {
        this.renderClassNames(context);
        context.push("<a class='test'>Hello</a>");
      },
      update: function(cq) {
        this.updateClassNames(cq);
        cq.find(".test").text("Hi");
      }
    });
  },
  
  teardown: function() {
    testRenderer = elem = context = null; // avoid memory leaks
  }
});

// makes sure two collections of class names match
// collections may be space-delimited string, array, or set
var sameClassNames = function(a, b, message) {
  if (typeof a === "string") a = a.trim().split(' ');
  if (typeof b === "string") b = b.trim().split(' ');
  
  same(SC.Set.create(a), SC.Set.create(b), message);
};

// validates a collection of class names matches with
// the collection on elem.
var validateClassNames = function(classNames, message) {
  sameClassNames(classNames, $(elem).attr('class'), message);
};

test("setting properties in general works", function(){
  var renderer = testRenderer.create();
  renderer.attr("foo", "bar");
  equals(renderer.foo, "bar", "foo=bar now that we've set it.");
  
  renderer.attr({
    "test": "abc",
    "test2": "def"
  });
  
  equals(renderer.test, "abc", "test=abc");
  equals(renderer.test2, "def", "test2=def");
});

test("didChange and resetChanges work as expected", function() {
  var renderer = testRenderer.create();
  
  // foo should not have changed yet
  ok(!renderer.didChange("foo"), "foo can't have changed yet--it has never been set.");
  
  // let us change it
  renderer.attr("foo", "test");
  
  // check that it has now been marked as changed
  ok(renderer.didChange("foo"), "foo should be marked as having changed.");
  
  // reset, and check again
  renderer.resetChanges();
  ok(!renderer.didChange("foo"), "foo should not be marked as changed anymore.");
  
  // change to the same value. that should not count.
  renderer.attr("foo", "test");
  ok(!renderer.didChange("foo"), "we didn't really change it, did we?");
  
  // change again, and test again (just in case reset did something weird)
  renderer.attr("foo", "test2");
  ok(renderer.didChange("foo"), "we now really did change it.");
});

test("Basic Rendering and Updating", function() {
  var renderer = testRenderer.create();

  // test normal rendering to context
  renderer.render(context);
  context.update();
  equals(SC.$(elem).text(), "Hello", "Initial render worked.");

  // test updating with CoreQuery.
  renderer.update(SC.$(elem));
  equals(SC.$(elem).text(), "Hi", "Secondary render worked.");
});

test("Class names setting", function() {
  var renderer = testRenderer.create();

  // we are going to test each way of setting class names.

  renderer.attr({
    classNames: "a b c"
  });

  sameClassNames(renderer.classNames, "a b c", "Class names match (set with space delimited string).");

  renderer.attr('classNames', ["albert", "einstein"]);
  sameClassNames(renderer.classNames, ["a", "b", "c", "albert", "einstein"], "Class names match (modified with an array)");

  renderer.attr('classNames', { 'a': NO, 'b': NO, 'c': NO });
  sameClassNames(renderer.classNames, ["albert", "einstein"], "class='albert einstein'");
});

test("Class name updating", function() {
  SC.RunLoop.begin();

  // configure
  var renderer = testRenderer.create();
  renderer.attr('classNames', "luna lovegood");

  // render (note that some buffers won't flush until end of run loop)
  renderer.render(context);
  context.update();
  SC.RunLoop.end();

  validateClassNames(["luna", "lovegood", "test"], "class='luna lovegood test'");

  renderer.attr('classNames', { 'luna': NO, 'xenophilius': YES });

  SC.RunLoop.begin();
  renderer.update($.buffer(elem));
  SC.RunLoop.end();

  validateClassNames(["xenophilius", "lovegood", "test"], "class='xenophilius lovegood test'");
  
});

test("add/remove/setClass", function() {
  SC.RunLoop.begin();
  
  var renderer = testRenderer.create();
  renderer.attr('classNames', "luna lovegood");
  renderer.render(context);
  context.update();
  SC.RunLoop.end();
  
  validateClassNames(["luna", "lovegood", "test"], "correct initial classes: class='luna lovegood test'");
  
  SC.RunLoop.begin();
  renderer.addClass("xenophilius mcgonnagal");
  renderer.update($.buffer(elem));
  SC.RunLoop.end();
  
  validateClassNames("luna lovegood xenophilius mcgonnagal test", "correct adjusted classes: class='luna lovegood test xenophilius mcgonnagal'");

  SC.RunLoop.begin();  
  renderer.removeClass("mcgonnagal");
  renderer.update($.buffer(elem));
  SC.RunLoop.end();
  
  validateClassNames("luna lovegood xenophilius test", "correctly removed class: class='luna lovegood test xenophilius'");
  
  SC.RunLoop.begin();  
  renderer.setClass("xenophilius", NO);
  renderer.update($.buffer(elem));
  SC.RunLoop.end();
  
  validateClassNames("luna lovegood test", "correctly removed class: class='luna lovegood test'");
  
  SC.RunLoop.begin();  
  renderer.setClass({ 'luna': NO, 'lovegood': NO });
  renderer.update($.buffer(elem));
  SC.RunLoop.end();
  
  validateClassNames("test", "correctly removed class: class='test'");
});

test("Sizes", function() {
  var renderer = testRenderer.create();

  SC.RunLoop.begin();
  renderer.attr('size', 'SET_TO_STRING');
  renderer.render(context);
  context.update();
  SC.RunLoop.end();

  same(SC.Set.create($.buffer(elem).attr('class').split(' ')), SC.Set.create(["test", "SET_TO_STRING"]), "class='test SET_TO_STRING");

  SC.RunLoop.begin();
  renderer.attr('size', 'another_string');
  renderer.update($.buffer(elem));
  SC.RunLoop.end();

  same(SC.Set.create($.buffer(elem).attr('class').split(' ')), SC.Set.create(["test", "another_string"]), "class='test another_string");

  SC.RunLoop.begin();
  renderer.attr('size', { height: 16 });
  renderer.update($.buffer(elem));
  SC.RunLoop.end();

  same(SC.Set.create($.buffer(elem).attr('class').split(' ')), SC.Set.create(["test", "small"]), "class='test small'");

  SC.RunLoop.begin();
  renderer.attr('size', { height: 18 });
  renderer.update($.buffer(elem));
  SC.RunLoop.end();

  same(SC.Set.create($.buffer(elem).attr('class').split(' ')), SC.Set.create(["test", "small"]), "class='test small'");


  SC.RunLoop.begin();
  renderer.attr('size', { height: 24 });
  renderer.update($.buffer(elem));
  SC.RunLoop.end();

  same(SC.Set.create($.buffer(elem).attr('class').split(' ')), SC.Set.create(["test", "regular"]), "class='test regular'");

});
