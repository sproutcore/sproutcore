// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Apple Inc. and contributors.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
/*global module test equals context ok same */

module('String.prototype.w()');

test("'one two three'.w() => ['one','two','three']", function() {
  same('one two three'.w(), ['one','two','three'], "should be equal");
});

test("'one    two    three'.w() with extra spaces between words => ['one','two','three']", function() {
  same('one    two    three'.w(), ['one','two','three'], "should be equal");
});

test("Trim ' spaces on both sides '", function() {
  same(' spaces on both sides '.trim(), 'spaces on both sides', "should be equal");
});

test("Trim ' spaces on both sides ' on left only", function() {
  same(' spaces on both sides '.trimLeft(), 'spaces on both sides ', "should be equal");
});

test("Trim ' spaces on both sides ' on right only", function() {
  same(' spaces on both sides '.trimRight(), ' spaces on both sides', "should be equal");
});