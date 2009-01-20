// ========================================================================
// SproutCore -- JavaScript Application Framework
// Copyright ©2006-2008, Sprout Systems, Inc. and contributors.
// Portions copyright ©2008 Apple, Inc.  All rights reserved.
// ========================================================================

require('system/mixins/string');

// deprecated, mostly useless API, that was blindly copied from Prototype
SC.mixin(String.prototype, {
    
    /** @deprecated
      Explodes a string into an array of characters.

      @returns {Array}
    */
    toArray: function() {
      return this.split('');
    },
    
    // Deprecated, longer version of this method.
    format: SC.String.fmt
});

// Add strings for various languages to this collection.  String.loc()
// method will try to localize the string passed using the current language.
// if the language is not available, it will use English.
SC.mixin(String,
/** @scope String @static */ {

  /** @deprecated
    The current browser language as a two letter code.  
    Use SC.browser.language instead.
  */
  browserLanguage: ((navigator.language || navigator.browserLanguage).split('-', 1)[0]),
  
  /** @deprecated
    If YES, localization will favor the detected language instead of the
    preferred one.
    
    Use SC.Locale.useAutodetectedLanguage instead.
  */
  useAutodetectedLanguage: null,
  
  /** @deprecated
    This property is set by the build tools to the current build language.
    Use SC.Locale.preferredLanguage instead
  */
  preferredLanguage: null,
  
  /** @deprecated
    Returns the hash key to use for loc strings.  The default implementation
    will autodetect the browser language and look for a loc string to 
    match.  If it can't find one then it will introspect to find loc strings
    that are defined and use those instead.
    
    Use SC.Locale.currentLanguage property instead.
  */
  currentLanguage: function () { 
    return this.normalizedLanguage(SC.Locale.currentLanguage); 
  },
  
  /** @deprecated
    Returns a normalized language string for the two letter country code.
    
    Use SC.Locale.normalizeLanguage() instead.
  */
  normalizedLanguage: function(ret) { 
    switch(SC.Locale.normalizeLanguage(ret).split('-')[0]) {
      case 'en':
        ret = 'English' ;
        break;
      case 'fr':
        ret = 'French' ;
        break ;
      case 'ja':
        ret = 'Japanese' ;
        break ;
      case 'de':
        ret = 'German' ;
        break ;
      case 'es':
        ret = 'Spanish' ;
        break;
      default: 
        ret = 'English';
    } 
    return ret ;
  },
  
  /**
    Adds loc strings for the named language.  This method takes care of 
    creating the localized string hash if it does not already exist.
    The language can be one of the following or any two-letter country code.
    
    English, French, German, Japanese, Spanish
    
    @param language {String} the language code
    @param strings {Hash} hash of loc strings.
    @returns {this}
  */
  addStringsFor: SC.stringsFor

});

String.English  = String.English  || {};
String.French   = String.French   || {};
String.German   = String.German   || {};
String.Japanese = String.Japanese || {};
