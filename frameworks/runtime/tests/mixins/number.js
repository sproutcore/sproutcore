// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Apple Inc. and contributors.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
/*global module test equals context ok same */

module('Number.prototype');

test("0.12 rounded default decimal place", function() {
  equals((0.12).round(), 0);
});

test("1.23456789 rounded into decimals", function() {
  equals((1.23456789).round(), 1, "0 decimal places");
  equals((1.23456789).round(1), 1.2, "1 decimal place");
  equals((1.23456789).round(2), 1.23, "2 decimal places");
  equals((1.23456789).round(3), 1.235, "3 decimal places");
  equals((1.23456789).round(4), 1.2346, "4 decimal places");
  equals((1.23456789).round(7), 1.2345679, "7 decimal places");
});

test("123456.7890 rounded into wholes", function() {
  equals((123456.7890).round(), 123457, "0 decimal places");
  equals((123456.7890).round(-1), 123460, "1 decimal place");
  equals((123456.7890).round(-2), 123500, "2 decimal places");
  equals((123456.7890).round(-3), 123000, "3 decimal places");
  equals((123456.7890).round(-4), 120000, "4 decimal places");
});

test("near", function() {
  ok((1).near(1), "Equal numbers should be considered near -- obviously");
  ok(!(2).near(1), "Unequal whole numbers should not be near");
  ok((1.00000001).near(1), "Numbers inside lambda range should be considered near");
});

test("near - custom lambda", function() {
  ok((2).near(1,1), "Lambda should define an inclusive range -- ie. 2 with lambda 1 is considered near 1");
});
