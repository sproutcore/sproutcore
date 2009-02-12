// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/*global module test equals context ok */

var context = null;

module("SC.RenderContext#end", {
  setup: function() {
    context = SC.RenderContext();
  }
});

test("does nothing if not matched with a prior begin()", function() {
  context.push("line1");
  var len = context.length;
  
  context.end();
  equals(context.length, len, "context length should not increase");
});

test("should replace opening tag with string and add closing tag, leaving middle content in place", function() {
  context.begin("div").push("line1").end();
  equals(context.get(0), "<div>", "opening tag");
  equals(context.get(1), "line1", "opening tag");
  equals(context.get(2), "</div>", "closing tag");
});

test("should emit any CSS class names included in the tag opts.classNames array", function() {
  context.begin("div", { classNames: "foo bar".w() }).end();
  ok(context.get(0).match(/class=\"foo bar\"/), '<div> has class attr') ;
});

test("should emit id in tag opts.id", function() {
  context.begin("div", { id: "foo" }).end();
  ok(context.get(0).match(/id=\"foo\"/), "<div> has id attr");
});

test("should emit style in tag if opts.styles is defined", function() {
  context.begin("div", { styles: { alpha: "beta", foo: "bar" }}).end();
  ok(context.get(0).match(/style=\"alpha: beta; foo: bar\"/), '<div> has style="alpha: beta; foo: bar"');
});


test("should write arbitrary attrs has in opts", function() {
  context.begin("div", { attrs: { foo: "bar", bar: "baz" } }).end();
  ok(context.get(0).match(/foo=\"bar\"/), 'has foo="bar"');
  ok(context.get(0).match(/bar=\"baz\"/), 'has bar="baz"');
});

test("opts.classNames should override opts.attrs.class", function() {
  context.begin("div", {
    classNames: "foo".w(),
    attrs: { "class": "bar" }
  }).end();
  ok(context.get(0).match(/class=\"foo\"/), 'has class="foo"');
});

test("opts.id should override opts.attrs.id", function() {
  context.begin("div", {
    id: "foo",
    attrs: { id: "bar" }
  }).end();
  ok(context.get(0).match(/id=\"foo\"/), 'has id="foo"');
});

test("opts.styles should override opts.attrs.style", function() {
  context.begin("div", {
    styles: { foo: "foo" },
    attrs: { style: "bar: bar" }
  }).end();
  ok(context.get(0).match(/style=\"foo: foo\"/), 'has style="foo: foo"');
});

test("after end, currentTag should be parentTag, if parentTag was not null", function() {
  context.begin() ;
  var oldTag = context.currentTag;
  
  context.begin();
  var newTag = context.currentTag ;
  
  context.end();
  equals(context.currentTag, oldTag, "oldTag");
});

test("after end, currentTag should be null if last parentTag", function() {
  context.begin();
  ok(!!context.currentTag, "precondition: currentTag != null");
  
  context.end();
  ok(!context.currentTag, "currentTag should be null");
});

test("emits self closing tag if tag has no content and opts.selfClosing !== NO", function() {
  context.begin().end();
  equals(context.get(0), "<div />");
});

test("emits two tags even if tag has no content if opts.selfClosing == NO", function() {
  context.begin("div", { selfClosing: NO }).end();
  equals(context.length, 2, "has two lines");
  equals(context.get(0), "<div>", "has opening tag");
  equals(context.get(1), "</div>", "has closing tag");
});

test("does NOT emit self closing tag if it has content, even if opts.selfClosing == YES (because that would yield invalid HTML)", function() {
  context.begin("div", { selfClosing: YES }).push("line").end();
  equals(context.length, 3, "has 3 lines");
  equals(context.get(2), "</div>", "has closing tag");
});

test("it should make sure to clear reused temporary attributes object", function() {
  
  // generate one tag...
  context.begin("div", { id: "foo", styles: { foo: "bar" }, classNames: "foo bar".w() }).push("line").end(); 
  
  // generate second tag...will reuse internal temporary attrs object.
  context.begin('div', { id: "bar" }).end();
  var str = context.get(context.length-1);
  equals("<div id=\"bar\"  />", str);
});

