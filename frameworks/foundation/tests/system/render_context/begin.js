// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/*global module test equals context ok */

var context = null;

module("SC.RenderContext#begin", {
  setup: function() {
    context = SC.RenderContext();
  }
});

test("should create context.currentTag with div tagName and no other opts if no params are passed", function() {
  context.begin();
  ok(!!context.currentTag, "has currentTag");
  equals(context.currentTag.tagName, "div", "div tag name");
  equals(context.currentTag.className, null, "no className");
});

test("should return receiver", function() {
  equals(context.begin(), context, "returns receiver");
});

test("should use tagName if passed in first param", function() {
  context.begin("span");
  ok(!!context.currentTag, "has currentTag");
  equals(context.currentTag.tagName, 'span', 'span tag name') ;
});

test("should convert tagName to lowercase if passed", function() {
  context.begin("SPAN");
  equals(context.currentTag.tagName, 'span', 'lowercase tag name');
});

test("should use opts hash as tag description if passed", function() {
  var opts = { foobar: true } ;
  
  context.begin("span", opts);
  equals(context.currentTag, opts, "is SAME hash exactly") ;
  equals(context.currentTag.foobar, true, "has custom property");
});

test("should set selfClosing=NO if tagName is script", function() {
  context.begin("script");
  equals(context.currentTag.selfClosing, false, "is false");
});

test("should NOT set selfClosing if tagName is not script", function() {
  context.begin("foo");
  equals(context.currentTag.selfClosing, undefined, "selfClosing");
});

test("should save the tag's starting index and push a null value into that location", function() {
  context.push('line1');
  context.begin();
  equals(context.currentTag.tagIndex, 1, "tagIndex");
  equals(context.length, 2, "context length");
  ok(context.get(1) === null, "item 1 should be null") ;
});

test("nesting multiple tags should cause currentTag to link to previous tag", function() {
  context.begin();
  var tag = context.currentTag ;
  
  context.begin();
  var newTag = context.currentTag ;
  ok(tag !== newTag, "new tag should not be old tag") ;
  equals(newTag.parentTag, tag, "parentTag");
});

