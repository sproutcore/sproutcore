// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/*global module test equals context ok */

var context = null, elem = null;

module("SC.RenderContext#update", {
  setup: function() {
    elem = document.createElement('div');
    context = SC.RenderContext(elem) ;
  },
  
  teardown: function() {
    elem = context = null; // avoid memory leaks
  }
});

test("should replace innerHTML of DIV if strings were pushed", function() {
  elem.innerHTML = "initial";
  context.push("changed").update();
  equals(elem.innerHTML, "changed", "innerHTML did change");
});

test("should NOT replace innerHTML of DIV if no strings were pushed", function() {
  elem.innerHTML = "initial";
  context.update();
  equals(elem.innerHTML, "initial", "innerHTML did NOT change");
});

test("returns receiver if no prevObject", function() {
  equals(context.update(), context, "return value");
});

test("returns previous context if there is one", function() {
  var c2 = context.begin(elem);
  equals(c2.update(), context, "returns prev context");
});

test("clears internal _elem to avoid memory leaks on update", function() {
  ok(!!context._elem, 'precondition - has element')  ;
  context.update();
  ok(!context._elem, "no longer an element");
});

// ..........................................................
// Attribute Editing
// 
module("SC.RenderContext#update - attrs", {
  setup: function() {
    elem = document.createElement('div');
    SC.$(elem).attr("foo", "initial");
    context = SC.RenderContext(elem);
  },
  
  teardown: function() {
    elem = context = null ;
  }
});

test("does not change attributes if attrs were not actually changed", function() {
  context.update();
  equals(elem.getAttribute("foo"), "initial", "attribute");
});

test("updates attribute if attrs changed", function() {
  context.attr('foo', 'changed');
  context.update();
  equals(elem.getAttribute("foo"), "changed", "attribute");
});

test("adds attribute if new", function() {
  context.attr('bar', 'baz');
  context.update();
  equals(elem.getAttribute("bar"), "baz", "attribute");
});

test("removes attribute if value is null", function() {
  context.attr('foo', null);
  context.update();
  equals(elem.getAttribute("foo"), null, "attribute");
});

// ..........................................................
// ID
// 
module("SC.RenderContext#update - id", {
  setup: function() {
    elem = document.createElement('div');
    SC.$(elem).attr("id", "foo");
    context = SC.RenderContext(elem);
  },
  
  teardown: function() {
    elem = context = null ;
  }
});

test("does not change id if retrieved but not edited", function() {
  context.id();
  context.update();
  equals(elem.getAttribute("id"), "foo", "id");
});

test("replaces id if edited", function() {
  context.id('bar');
  context.update();
  equals(elem.getAttribute("id"), "bar", "id");
});

test("set id overrides attr", function() {
  context.attr("id", "bar");
  context.id('baz');
  context.update();
  equals(elem.getAttribute("id"), "baz", "should use id");
});

// ..........................................................
// Class Name Editing
// 
module("SC.RenderContext#update - className", {
  setup: function() {
    elem = document.createElement('div');
    SC.$(elem).attr("class", "foo bar");
    context = SC.RenderContext(elem);
  },
  
  teardown: function() {
    elem = context = null ;
  }
});

test("does not change class names if retrieved but not edited", function() {
  context.classNames();
  context.update();
  equals(elem.getAttribute("class"), "foo bar", "class");
});

test("replaces class name if classNames edited", function() {
  context.classNames('bar baz'.w());
  context.update();
  equals(elem.getAttribute("class"), "bar baz", "attribute");
});

test("set class names override class attr", function() {
  context.attr("class", "bar");
  context.classNames('baz'.w());
  context.update();
  equals(elem.getAttribute("class"), "baz", "should use classNames");
});

// ..........................................................
// Style Editing
// 
module("SC.RenderContext#update - style", {
  setup: function() {
    elem = document.createElement('div');
    SC.$(elem).attr("style", "color: red;");
    context = SC.RenderContext(elem);
  },
  
  teardown: function() {
    elem = context = null ;
  }
});

test("does not change styles if retrieved but not edited", function() {
  context.styles();
  context.update();
  var style = SC.$(elem).attr("style");
  if (!style.match(/;$/)) style += ';' ;
  
  equals(style.toLowerCase(), "color: red;", "style");
});

test("replaces style name if styles edited", function() {
  context.styles({ color: "black" });
  context.update();
  
  // Browsers return single attribute styles differently, sometimes with a trailing ';'
  // sometimes, without one. Normalize it here.
  var style = SC.$(elem).attr("style");
  if (!style.match(/;$/)) style += ';' ;
  
  equals(style.toLowerCase(), "color: black;", "attribute");
});


test("set styles override style attr", function() {
  context.attr("style", "color: green");
  context.styles({ color: "black" });
  context.update();
  
  // Browsers return single attribute styles differently, sometimes with a trailing ';'
  // sometimes, without one. Normalize it here.
  var style = SC.$(elem).attr("style");
  if (!style.match(/;$/)) style += ';' ;
  
  equals(style.toLowerCase(), "color: black;", "attribute");
});

