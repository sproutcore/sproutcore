// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/*global module test equals context */

var context = null;

module("SC.RenderContext#push", {
  setup: function() {
    context = SC.RenderContext();
  },
  
  teardown: function() {
    context = null;
  }
});

test("it should add the line to the strings and increase the length", function() {
  equals(context.length, 0, "precondition - length=0");

  context.push("sample line");
  equals(context.length, 1, "length should increase");
  equals(context.get(0), "sample line", "line should be in strings array");
});

test("it should accept multiple parameters, pushing each one into strings", function() {

  equals(context.length, 0, "precondition - length = 0");
  
  context.push("line1", "line2", "line3");
  equals(context.length, 3, "should add 3 lines to strings");
  equals(context.get(0), "line1", "1st item");
  equals(context.get(1), "line2", "2nd item");
  equals(context.get(2), "line3", "3rd item");
});

test("it should return receiver", function() {
  equals(context.push("line1"), context, "return value");
});
