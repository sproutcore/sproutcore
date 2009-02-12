// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/*global module test equals context ok isSet */

var context = null;

// ..........................................................
// id()
// 
module("SC.RenderContext#id", {
  setup: function() {
    context = SC.RenderContext() ;
  }
});

test("id() sets id on currentTag", function() {
  context.begin().id("foo");
  equals("foo", context.currentTag.id) ;
});

test("id() does nothing if no currentTag", function() {
  context.id("foo");
  equals(null, context.currentTag);
}) ;

// ..........................................................
// classNames()
// 
module("SC.RenderContext#classNames", {
  setup: function() {
    context = SC.RenderContext() ;
  }
});

test("returns nothing if no currentTag", function() {
  equals(null, context.classNames()) ;
});

test("returns currentTag.classNames if set", function() {
  context.begin('div', { classNames: ['foo'] });
  equals(context.currentTag.classNames, context.classNames());
});

test("sets and returns currentTag.classNames to empty array if null", function() {
  context.begin();
  ok(!context.currentTag.classNames, "precondition: classNames should be null");
  
  var ret= context.classNames();
  ok(!!context.currentTag.classNames, "should no longer be null");
  equals(ret, context.currentTag.classNames);
});

test("creates identical clone of classNames if currentTag.cloneClassNames is set", function() {
  var initial = 'foo bar'.w() ;
  context.begin('div', { classNames: initial, cloneClassNames: YES });
  var ret = context.classNames();
  
  ok(!context.currentTag.cloneClassNames, "cloneClassNames should now be NO");
  ok(initial !== ret, "classNames should not be same instance as return value");

  ok(ret === context.currentTag.classNames, "returned value should be cloned array");
  isSet(context.currentTag.classNames, ret, "but arrays should be equivalent");
});

// ..........................................................
// hasClass()
// 
module("SC.RenderContext#hassClass", {
  setup: function() {
    context = SC.RenderContext() ;
  }
});

test("should return true if context classNames has class name", function() {
  context.begin('div', { classNames: 'foo bar'.w() });
  equals(YES, context.hasClass('foo'), 'should have foo');
});

test("should return false if context classNames does not have class name", function() {
  context.begin('div', { classNames: 'foo bar'.w() });
  equals(NO, context.hasClass('imaginary'), "should not have imaginary");
});

test("should return false if context has no classNames", function() {
  context.begin('div');
  ok(!context.currentTag.classNames, 'precondition - context has no classNames');
  equals(NO, context.hasClass('foo'), 'should not have foo');
});

test("should return false if context has no currentTag", function() {
  ok(!context.currentTag, "precondition - has no currentTag");
  equals(NO, context.hasClass('foo'), 'should not have foo');
});

// ..........................................................
// addClass()
//
module("SC.RenderContext#addClass", {
  setup: function() {
    context = SC.RenderContext() ;
  }
});

test("should create classNames array with class name on currentTag", function() {
  context.begin('div');
  ok(!context.currentTag.classNames, 'precondition - should not have classNames array');
  context.addClass('foo');
  isSet(context.currentTag.classNames, ['foo']);
});

test("shoudl return receiver", function() {
  equals(context.addClass('foo'), context, "receiver");
});

test("should add class name to existing classNames array on currentTag", function() {
  context.begin('div', { classNames: ['foo'] });
  ok(!!context.currentTag.classNames, 'precondition - has classNames array');
  
  context.addClass('bar');
  isSet(['foo', 'bar'], context.currentTag.classNames);
});

test("should do nothing if no currentTag", function() {
  context.addClass('foo');
  ok(!context.currentTag, 'no currentTag');
});

test("should only add class name once - does nothing if name already in array", function() {
  context.begin().addClass('foo').addClass('bar');
  isSet(['foo', 'bar'], context.currentTag.classNames, 'precondition');
  
  context.addClass('foo');
  isSet(['foo', 'bar'], context.currentTag.classNames, 'no change');
});

// ..........................................................
// removeClass()
// 
module("SC.RenderContext#removeClass", {
  setup: function() {
    context = SC.RenderContext() ;
  }
});

test("should remove class if already in classNames array", function() {
  context.begin().addClass('foo').addClass('bar');
  ok(context.currentTag.classNames.indexOf('foo')>=0, "has foo");
  
  context.removeClass('foo');
  ok(context.currentTag.classNames.indexOf('foo')<0, "does not have foo");
});

test('should return receiver', function() {
  equals(context.removeClass('foo'), context, 'receiver');
});

test("should do nothing if class name not in array", function() {
  context.begin().addClass('foo').addClass('bar');
  
  context.removeClass('imaginary');
  isSet('foo bar'.w(), context.currentTag.classNames, 'did not change');
});

test("should do nothing if no currentTag", function() {
  // make sure no error occurs.
  context.removeClass('foo');
  ok(!context.currentTag, 'no currentTag');
});

// ..........................................................
// setClass
// 
module("SC.RenderContext#setClass", {
  setup: function() {
    context = SC.RenderContext().begin().addClass('foo') ;
  }
});

test("should add named class if shouldAdd is YES", function() {
  ok(!context.hasClass("bar"), "precondition - does not have class bar");
  context.setClass("bar", YES);
  ok(context.hasClass("bar"), "now has bar");
});

test("should remove named class if shouldAdd is NO", function() {
  ok(context.hasClass("foo"), "precondition - has class foo");
  context.setClass("foo", NO);
  ok(!context.hasClass("foo"), "should not have foo ");
});

test("should return receiver", function() {
  equals(context, context.setClass("bar", YES), "returns receiver");
});

test("should add/remove all classes if a hash of class names is passed", function() {
  ok(context.hasClass("foo"), "precondition - has class foo");
  ok(!context.hasClass("bar"), "precondition - does not have class bar");

  context.setClass({ foo: NO, bar: YES });

  ok(context.hasClass("bar"), "now has bar");
  ok(!context.hasClass("foo"), "should not have foo ");
});

// ..........................................................
// css
// 
module("SC.RenderContext#css", {
  setup: function() {
    context = SC.RenderContext().begin('div', { styles: { foo: 'foo' }}) ;
  }
});

test("should add passed style name to value in currentTag styles", function() {
  context.css('bar', 'bar');
  equals('bar', context.currentTag.styles.bar, 'verify style name');
});

test("should replace passed style name  value in currentTag styles", function() {
  context.css('foo', 'bar');
  equals('bar', context.currentTag.styles.foo, 'verify style name');
});

test("should return receiver", function() {
  equals(context, context.css('foo', 'bar'));
});

test("should create styles hash if needed", function() {
  context = SC.RenderContext().begin();
  equals(null, context.currentTag.styles, 'precondition - has no styles');
  
  context.css('foo', 'bar');
  equals('bar', context.currentTag.styles.foo, 'has styles');
});

test("should assign all styles if a hash is passed", function() {
  context.css({ foo: 'bar', bar: 'bar' });
  equals('bar', context.currentTag.styles.bar, 'has styles.bar');
  equals('bar', context.currentTag.styles.foo, 'has styles.foo');
});

test("should return current style value if style name passed with no value", function() {
  equals("foo", context.css("foo"), "should get styles.foo");
});

// ..........................................................
// attr
// 
module("SC.RenderContext#attr", {
  setup: function() {
    context = SC.RenderContext().begin('div', { attrs: { foo: 'foo' }}) ;
  }
});

test("should add passed name to value in currentTag attrs", function() {
  context.attr('bar', 'bar');
  equals('bar', context.currentTag.attrs.bar, 'verify attr name');
});

test("should replace passed name  value in currentTag attrs", function() {
  context.attr('foo', 'bar');
  equals('bar', context.currentTag.attrs.foo, 'verify attr name');
});

test("should return receiver", function() {
  equals(context, context.attr('foo', 'bar'));
});

test("should create attrs hash if needed", function() {
  context = SC.RenderContext().begin();
  equals(null, context.currentTag.attrs, 'precondition - has no attrs');
  
  context.attr('foo', 'bar');
  equals('bar', context.currentTag.attrs.foo, 'has styles');
});

test("should assign all attrs if a hash is passed", function() {
  context.attr({ foo: 'bar', bar: 'bar' });
  equals('bar', context.currentTag.attrs.bar, 'has styles.bar');
  equals('bar', context.currentTag.attrs.foo, 'has styles.foo');
});
 
test("should return current attr value if  name passed with no value", function() {
  equals(context.attr("foo"), "foo", "should get attrs.foo");
});

