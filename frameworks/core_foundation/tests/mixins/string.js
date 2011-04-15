// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*global module test equals context ok same */
var LocaleObject;

module('SC.Object', {
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
    
    SC.stringsFor('English', {
      'Test': '%@',
      'Test.Multiple': '%@ %@'
    });
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
  equals("en".loc(), "en", "Using String.prototype.loc") ;
  equals(SC.String.loc("en"), "en", "Using SC.String.loc");

  equals("jp".locWithDefault("Japanese"), "Japanese", "Using String.prototype.locWithDefault") ;
  equals(SC.String.locWithDefault("jp", "Japanese"), "Japanese", "Using SC.String.locWithDefault") ;

  equals('deflang'.loc(), "dl", "Using String.prototype.loc") ;
  equals(SC.String.loc('deflang'), "dl", "Using SC.String.loc") ;
});

test("Localize a string with mutliple parameters", function() {
  equals("Test".loc('parameter1'), 'parameter1', "Localizing with one parameter - using String.prototype.loc");
  equals(SC.String.loc("Test", 'parameter1'), 'parameter1', "Localizing with one parameter - using SC.String.loc");

  equals("Test.Multiple".loc('parameter1', 'parameter2'), 'parameter1 parameter2', "Localizing with multiple parameters - using String.prototype.loc");
  equals(SC.String.loc("Test.Multiple", 'parameter1', 'parameter2'), 'parameter1 parameter2', "Localizing with multiple parameters - using SC.String.loc");
});

test("Localize a string even if localized version is empty", function() {
  equals("empty".loc(), "", "Using String.prototype.loc");
  equals(SC.String.loc("empty"), "", "Using SC.String.loc");

  equals("empty".locWithDefault("Empty"), "", "Using String.prototype.locWithDefault");
  equals(SC.String.locWithDefault("empty", "Empty"), "", "Using SC.String.locWithDefault");
});
