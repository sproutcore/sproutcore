// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

function matches(c, r, g, b, a, msg) {
  equals(c.r, r, msg + " (R != R)");
  equals(c.g, g, msg + " (G != G)");
  equals(c.b, b, msg + " (B != B)");
  equals(c.a, a, msg + " (A != A)");
};

test("SC.Color.from(rgb)", function () {
  matches(SC.Color.from("rgb(212, 15, 2)"),
                             212, 15, 2, 1,
                        "rgb() colors should be parseable");
  matches(SC.Color.from("rgb(10000, 20, 256)"),
                             255, 20, 255, 1,
                        "Colors should be clamped to the device gamut");

  ok(!SC.Color.from("rgb(260, -10, 5)"),
     "Invalid colors should return 'NO'");
});

test("SC.Color.from(rgba)", function () {
  matches(SC.Color.from("rgba(212, 15, 2, .2)"),
                              212, 15, 2, .2,
                        "rgba() colors should be parseable");
  matches(SC.Color.from("rgba(260, 255, 20, 1.5)"),
                              255, 255, 20, 1,
                        "Alpha should be clamped to 1");

  ok(!SC.Color.from("rgba(255, 255, 255, -.2)"),
     "Invalid alpha should make the SC.Color.from return 'NO'");
});

test("SC.Color.from() with invalid rgb colors", function () {
  // Too many arguments
  ok(!SC.Color.from("rgb(0, 0, 0, 0)"));

  // Too few arguments
  ok(!SC.Color.from("rgba(0, 0, 0)"));
  ok(!SC.Color.from("rgb(0, 0)"));

  // No floats!
  ok(!SC.Color.from("rgb(0.0, 0.0, 0.0)"));

  // Missing parenthesis
  ok(!SC.Color.from("rgb(0, 0, 0"));
});

test("SC.Color.from(#rgb)", function () {
  matches(SC.Color.from("#21a"),
          34, 17, 170, 1,
          "#rgb colors should be parseable");

  ok(SC.Color.from("#ABC").isEqualTo(
     SC.Color.from("#abc")),
     "Character casing should not matter with hex colors");
});

test("SC.Color.from(#rrggbb)", function () {
  matches(SC.Color.from("#ABCDEF"),
          171, 205, 239, 1,
          "#rrggbb colors should be parseable");

  ok(SC.Color.from("#ABCDEF").isEqualTo(
     SC.Color.from("#abcdef")),
     "Character casing should not matter with hex colors");
});

test("SC.Color.from() with invalid hex colors", function () {
  // Invalid character
  ok(!SC.Color.from("#GAB"));

  // Invalid length
  ok(!SC.Color.from("#0000"));
  ok(!SC.Color.from("#00000"));
  ok(!SC.Color.from("#0000000"));
});

test("SC.Color.from(hsl)", function () {
  matches(SC.Color.from("hsl(330, 60%, 54%)"),
          208, 67, 138, 1,
          "hsl() colors should be parseable");

  matches(SC.Color.from("hsl(-90, 50%, 44%)"),
          112, 56, 168, 1,
          "negative hues should be allowed");
});

test("SC.Color.from(hsla)", function () {
  matches(SC.Color.from("hsla(210, 87%, 55%, 0.4)"),
          40, 140, 240, .4,
          "hsla() colors should be parseable");
});

test("SC.Color.from(transparent)", function () {
  matches(SC.Color.from("transparent"),
          0, 0, 0, 0,
          "transparent should be black with an alpha of 0");
});

