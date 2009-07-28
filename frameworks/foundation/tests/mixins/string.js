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

