// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module, test, start, stop, expect, ok, equals*/

var defaultLocale;
module("Number#ordinal", {
  setup: function () {
    // Cache the current locale.
    defaultLocale = SC.Locale.currentLocale;
  },

  teardown: function () {
    // Return the current locale.
    SC.Locale.currentLocale = defaultLocale;
  }
});

/**
 * Admitedly not exhaustive, but tests the numbers from 1-100
 */
test("Properly Computes the Ordinal in english", function () {

  // Force it to English
  String.preferredLanguage = 'en';
  SC.Locale.currentLocale = SC.Locale.createCurrentLocale();

  equals(SC.Locale.currentLocale.language, 'en');

  var sts = [1, 21, 31, 41, 51, 61, 71, 81, 91, 101],
    nds = [2, 22, 32, 42, 52, 62, 72, 82, 92, 102],
    rds = [3, 23, 33, 43, 53, 63, 73, 83, 93, 103];

  sts.forEach(function (number) {
    equals(number.ordinal(), 'st');
  });

  nds.forEach(function (number) {
    equals(number.ordinal(), 'nd');
  });

  rds.forEach(function (number) {
    equals(number.ordinal(), 'rd');
  });

  var ths = [];
  for (var i = 0; i < 100; i++) {
    ths.push(i);
  }

  ths.removeObjects(sts);
  ths.removeObjects(nds);
  ths.removeObjects(rds);

  ths.forEach(function (number) {
    equals(number.ordinal(), 'th');
  });

});

test("Do not compute the ordinal in a language if no method is defined", function () {

  // Force it to Japanese
  String.preferredLanguage = 'jp';
  SC.Locale.currentLocale = SC.Locale.createCurrentLocale();

  equals(SC.Locale.currentLocale.language, 'ja');

  var st = 1,
    nd = 2,
    rd = 3,
    th = 4;

  equals(st.ordinal(), '');
  equals(nd.ordinal(), '');
  equals(rd.ordinal(), '');
  equals(th.ordinal(), '');
});
