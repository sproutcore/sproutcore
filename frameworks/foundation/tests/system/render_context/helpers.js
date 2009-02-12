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

