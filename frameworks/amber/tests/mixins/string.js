// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*global module test equals context ok same */
var LocaleObject;
module('String.prototype.w()', {
  setup: function() {

    LocaleObject = SC.Locale.create({
      init: function(){
        sc_super();
        //hash of new languages
        var newLocales = { deflang: 'dl', empty: '' };

        //Added the new languages to the existing list of locales
        SC.Locale.addStrings(newLocales);
      }
    });
    this.currentLocale = LocaleObject;
  }
});

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

test("Localize a string", function() {
  //Based on the input passed it should return the default locale
  equals("en".loc(), "en") ;
  equals("jp".locWithDefault("Japanese"), "Japanese") ;
  equals('deflang'.loc(), "dl") ;
});

test("Localize a string even if localized version is empty", function() {
  equals("empty".loc(), "");
  equals("empty".locWithDefault("Empty"), "");
});
