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

test("Regular expression escaping a string", function() {
  same('\.+*?[^]$(){}=!<>|:'.escapeForRegExp(), '\\.\\+\\*\\?\\[\\^\\]\\$\\(\\)\\{\\}\\=\\!\\<\\>\\|\\:', "should be escaped");
});

test("Pluralizing a string", function() {
	expect(8);
  same('Goat'.pluralize(), 'Goats', "standard pluralization");
  same('There are many goat'.pluralize(), 'There are many goats', "standard pluralization of a multi-word string");
  same('Bunny'.pluralize(), 'Bunnies', "non-standard pluralization");
  same('I like bunny'.pluralize(), 'I like bunnies', "non-standard pluralization of a multi-word string");
  same('child'.pluralize(), 'children', "irregular pluralization");
  same('I have three child'.pluralize(), 'I have three children', "irregular pluralization of a multi-word string");
  same('sheep'.pluralize(), 'sheep', "uncountable pluralization");
  same('Please hold this sheep'.pluralize(), 'Please hold this sheep', "uncountable pluralization of a multi-word string");
});

test("Singularizing a string", function() {
	expect(8);
  same('Vegetables'.singularize(), 'Vegetable', "standard singularization");
  same('Broccoli is a vegetables'.singularize(), 'Broccoli is a vegetable', "standard singularization of a multi-word string");
  same('Properties'.singularize(), 'Property', "non-standard singularization");
  same('Buy a properties'.singularize(), 'Buy a property', "non-standard singularization of a multi-word string");
  same('people'.singularize(), 'person', "irregular singularization");
  same('The Village People'.singularize(), 'The Village Person', "irregular singularization of a multi-word string");
  same('money'.singularize(), 'money', "uncountable singularization");
  same('Gotta git da money'.singularize(), 'Gotta git da money', "uncountable singularization of a multi-word string");
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
