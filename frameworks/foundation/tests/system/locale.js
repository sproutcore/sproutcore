	module("object.SC.Locale()", {	
		setup: function() {
			
			LocaleObject = SC.Locale.create({
				init: function(){
					sc_super();
					//hash of new languages
					newLocales = { deflang: 'dl'};
					
					//Added the new languages to the existing list of locales
					SC.Locale.addStrings(newLocales);
				}
			});

		}
	});
	
	test("Locale.init() : Should return a flag if the language has been set during the locale initialization", function() {
		// As the locale is added during initialization the value of hasString is true
		equals(LocaleObject.hasStrings, true) ;
		
		//check the string values. 
		equals(LocaleObject.strings.deflang, 'dl') ;
	});

	
	test("Locale.locWithDefault() : localized version of the string or the string if no match was found", function() {
		//Based on the input passed it should return the default locale
		equals(LocaleObject.locWithDefault("en"), "en") ;
		equals(LocaleObject.locWithDefault("jp", "Japanese"), "Japanese") ;
		equals(LocaleObject.locWithDefault("ab"), "ab") ;
	});
	
	test("Locale.addStrings() : Should be able to add the passed hash of strings to the locale's strings table", function() {		
		
		//Check for the new languages. This should be false as these are not added to the list of locales
		equals(false, SC.Locale.options().strings.chinese === 'zh' && SC.Locale.options().strings.dutch === 'nl') ;
		
		//hash of new languages
		SC.Locale.newLocales = { chinese: 'zh', czech: 'cs', dutch: 'nl'};
		
		//Added the new languages to the existing list of locales
		SC.Locale.addStrings(SC.Locale.newLocales);
		
		//Result should be true as the new lacales added to the list of default locales
		equals(true, SC.Locale.options().strings.chinese === 'zh' && SC.Locale.options().strings.dutch === 'nl') ;
	});
	
	test("Locale.options() : Should provide the registered locales that have not been instantiated", function() {
		//Options should return the list of registered locales, so checking if the retruned object has strings.
		equals(SC.Locale.options().hasStrings, true) ;
		
		//Checking the strings with default locales.
		equals(true, SC.Locale.options().strings.chinese === 'zh' && SC.Locale.options().strings.dutch === 'nl') ;
	});
	
	test("Locale.normalizeLanguage() : Should provide the two character language code for the passed locale", function() {
		//If nothing is passed this will retrun the default code as 'en'
		equals(SC.Locale.normalizeLanguage(), 'en') ;
		
		//If the language is passed as 'English' this will return the code as 'en'
		equals(SC.Locale.normalizeLanguage('English'), 'en') ;
		
		//For any other code passed which is not in the default code it should return as it was passed
		equals(SC.Locale.normalizeLanguage('ab'), 'ab') ; ;
	});
	
	test("Locale.toString() : Should retrun the current language set with the guid value", function() {
		//testcase case is incorrect. Also this always retruns the result as 'SC.Locale[undefined]'
		//Need to know how to use this function
		equals(SC.Locale.toString(), "en") ;
	});
	
	test("Locale.extend() : Should make sure important properties of Locale object are copied to a new class", function() {
		// Creating the new locale by extending an existing Locale object
		SC.Locale.locales['ab'] = SC.Locale.extend({ _deprecatedLanguageCodes: ['newlang'] }) ;
				
		//local class now get created for the new language
		equals(true, SC.Locale.locales.ab.currentLocale.hasStrings) ;
	});
	
	test("Locale.createCurrentLocale() : Should create the Lacale Object for the language selected", function() {
		//This will match the browser language with the SC lanuage and create the object accordingly
		// This test will pass only for the default languages i.e en, fr, de, ja, es, it. 
		equals(true, SC.Locale.createCurrentLocale().language === SC.browser.language) ;
		
		//Resetting the default browser language
		SC.browser.language='kn';
		
		//This is false as currentLocale will be created as 'en'
		equals(false, SC.Locale.createCurrentLocale().language===SC.browser.language) ;
	});	

	test("Locale.localeClassFor() : Should find the locale class for the names language code or creates on based on its most likely parent", function() {
 		// Local Class for any language other than default languages will be 'en'. Therefore this condition is false
		equals(false, SC.Locale.localeClassFor('nl').create().language === "nl") ;
		
		// This adds the new language with the parent language to the default list
		SC.Locale.locales['nl'] = SC.Locale.extend({ _deprecatedLanguageCodes: ['Dutch'] }) ;
		
		//This condition is true as the local class now exists for 'nl'
		equals(true, SC.Locale.localeClassFor('nl').create().language==="nl") ;
	});
	
	test("Locale.define() : Should be able to define a particular type of locale", function() {
 		SC.Locale.define('en', {
			longNames: 'Charles John Romonoski Gregory William'.split(' '),
			shortNames: ['C','A','Y','N']
		});
		
		//This condition is true as the local class now exists for 'kn'
		//equals(true, SC.Locale.localeClassFor('kn').create().language==="kn") ;
	});

	