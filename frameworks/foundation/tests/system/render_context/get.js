// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/*global module test equals context */

var context = null;

module("SC.RenderContext#get", {
  setup: function() {
    context = SC.RenderContext();
  },
  
  teardown: function() {
    context = null;
  }
});

test("it should return empty strings array if no params passed and no strings pushed yet", function() {
  isSet(context.get(), []);
});

test("it should return full strings array if no params passed and no strings pushed yet", function() {
  context.push("line1");
  isSet(context.get(), ["line1"]);
});

test("it should return individual string if index passed that is within current length", function() {
  context.push("line1");
  equals(context.get(0), "line1");
});

test("it should return undefined if index passed that is outside of current range", function() {
  context.push("line1");
  equals(context.get(2), undefined);
});

// test this special case since the internal strings array is created lazily.
test("it should return undefined if index passed and no strings set yet", function() {
  equals(context.get(1), undefined);
});
