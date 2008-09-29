// ==========================================================================
// SproutCore -- JavaScript Application Framework
// copyright 2006-2008, Sprout Systems, Inc. and contributors.
// ==========================================================================

// These are basic enhancements to the string class used throughout 
// SproutCore.

SC.STRING_TITLEIZE_REGEXP = (/([\s|\-|\_|\n])([^\s|\-|\_|\n]?)/g);

/**
  @namespace
  
  SproutCore implements a variety of enhancements to the built-in String 
  object that make it easy to perform common substitutions and conversions.
  
  Most of the utility methods defined here mirror those found in Prototype
  1.6.
  
  @since SproutCore 1.0
*/
SC.String = {
  
  // Interpolate string. looks for %@ or %@1; to control the order of params.
  /**
    Apply formatting options to the string.  This will look for occurrences
    of %@ in your string and substitute them with the arguments you pass into
    this method.  If you want to control the specific order of replacement, 
    you can add a number after the key as well to indicate which argument 
    you want to insert.  

    Ordered insertions are most useful when building loc strings where values
    you need to insert may appear in different orders.

    h3. Examples
    
    {{{
      "Hello %@ %@".fmt('John', 'Doe') => "Hello John Doe"
      "Hello %@2, %@1".fmt('John', 'Doe') => "Hello Doe, John"
    }}}
    
    @param args {Object...} optional arguments
    @returns {String} formatted string
  */
  fmt: function() {
    // first, replace any ORDERED replacements.
    var str = this.gsub(/%@([0-9]+)/, function(m) {
      return (arguments[parseInt(m[1],0)-1] || '').toString(); 
    }) ;

    // now, replace any remaining %@ items.  Use this indexOf() method b/c
    // it is faster than split().
    var ret = [] ;
    var idx = -1 ;
    var loc = 0 ;
    var argIdx = 0;
    while((idx = str.indexOf("%@",loc)) >= 0) {
     // slice off initial part of string and push into ret. update loc.
     ret.push(str.slice(loc,idx)) ;
     loc = idx + 2 ; // 2 to skip '%@'.
     
     // add in replacement.
     var value = arguments[argIdx++] ;
     if (value && value.toString) value = value.toString() ;
     ret.push(value) ;
    }
    
    // include any remaining bits of the string.
    if (loc < str.length) {
      ret.push(str.slice(loc,str.length)) ;
    }
    
    // join return value.
    return (ret.length > 1) ? ret.join('') : ret[0] ;
  },

  /**
    Localizes the string.  This will look up the reciever string as a key 
    in the current Strings hash.  If the key matches, the loc'd value will be
    used.  The resulting string will also be passed through fmt() to insert
    any variables.
    
    @param args {Object...} optional arguments to interpolate also
    @returns {String} the localized and formatted string.
  */
  loc: function() {
    // NB: This could be implemented as a wrapper to locWithDefault() but
    // it would add some overhead to deal with the arguments and adds stack
    // frames, so we are keeping the implementation separate.
    
    var kit = String[String.currentLanguage()];
    var str = kit[this] ;
    if (!str) str = String.English[this] || this ;
    return str.fmt.apply(str,arguments) ;
  },

  /**
    Works just like loc() except that it will return the passed default 
    string if a matching key is not found.
    
    @param def {String} the default to return
    @param args {Object...} optional formatting arguments
    @returns {String} localized and formatted string
  */
  locWithDefault: function(def) {
    var kit = String[String.currentLanguage()];
    var str = kit[this] ;
    if (!str) str = String.English[this] || def ;
    var args = SC.$A(arguments) ;
    args.shift() ; // escape def.
    return str.fmt.apply(str, args) ;
  },
  
  /** 
    Capitalizes a string.
    @return {String} capitalized string
  */
  capitalize: function() {
    return this.charAt(0).toUpperCase() + this.substring(1) ;
  },

  /**
    Capitalized every word in the string, separated by spaces or dashes.
    @return {String} titleized string.
  */
  titleize: function() {
    return this.replace(SC.STRING_TITLEIZE_REGEXP, 
      function(str,separater,character) { 
        return (character) ? (' ' + character.toUpperCase()) : ' ';
      }).capitalize() ;
  },
  
  /**
    Camelizes a string.  This will take any words separated by spaces, dashes
    or underscores and convert them into camelCase.
    
    h3. Examples
    
    {{{
      "my favorite items".camelize() => "myFavoriteItems"
      "css-class-name".camelize() => "cssClassName"  
      "action_name".camelize() => "actionName" 
    }}}
    
    @returns {String} camelized string
  */
  camelize: function() {
    var parts = this.split('-'), len = parts.length;
    if (len == 1) return parts[0];

    var camelized = this.charAt(0) == '-'
      ? parts[0].charAt(0).toUpperCase() + parts[0].substring(1)
      : parts[0];

    for (var i = 1; i < len; i++)
      camelized += parts[i].charAt(0).toUpperCase() + parts[i].substring(1);

    return camelized;
  },

  
  /**
    Converts the string into a class name.  This method will camelize your 
    string and then capitalize the first letter.
  */
  classify: function() {
    return this.camelize().capitalize() ;
  },
  
  /**
    Converts a camelized string into all lower case separated by underscores.
    
    @returns {String} the decamelized string.
  */
  decamelize: function() { 
    return this.replace(/([a-z])([A-Z])/g,'$1_$2').toLowerCase();
  },

  /**
    Converts a camelized string or a string with spaces or underscores into
    a string with components separated by dashes.
    
    @returns {String} the dasherized string.
  */
  dasherize: function() {
    return this.decamelize().replace(/[ _]/g,'-') ;  
  },
  
  /**
    Converts a camelized string or a string with dashes or underscores into
    a string with components separated by spaces.
    
    @returns {String} the humanized string.
  */
  humanize: function() {
    return this.decamelize().replace(/[-_]/g,' ') ;
  },
  
  /**
    Removes any extra whitespace from the edges of the strings.
    
    This method is also aliased as strip().
    
    @returns {String} the trimmed string
  */
  trim: function () {
    return this.replace(/^\s+|\s+$/g,"");
  },

  /**
    Explodes a string into an array of characters.
    
    @returns {Array}
  */
  toArray: function() {
    return this.split('');
  }
  
} ;

// Deprecated, longer version of this method.
SC.String.format = SC.String.fmt;
SC.String.strip = SC.String.trim; // convenience alias.

// Apply SC.String mixin to built-in String object
SC.mixin(String.prototype, SC.String) ;

// Add strings for various languages to this collection.  String.loc()
// method will try to localize the string passed using the current language.
// if the language is not available, it will use English.
Object.extend(String,
/** @scope String @static */ {

  /**
    The current browser language as a two letter code.
  */
  browserLanguage: ((navigator.language || navigator.browserLanguage).split('-', 1)[0]),
  
  /**
    If YES, localization will favor the detected language instead of the
    preferred one.
  */
  useAutodetectedLanguage: NO,
  
  /**
    This property is set by the build tools to the current build language.
  */
  preferredLanguage: null,
  
  /**
    Returns the hash key to use for loc strings.  The default implementation
    will autodetect the browser language and look for a loc string to 
    match.  If it can't find one then it will introspect to find loc strings
    that are defined and use those instead.
  */
  currentLanguage: function () {
    var ret = (this.useAutodetectedLanguage) ? (this.browserLanguage || this.preferredLanguage || 'en') : (this.preferredLanguage || this.browserLanguage || 'en') ;

    // then try a couple of normalized forms...
    if (!this[ret]) ret = this.normalizedLanguage(ret);
    return ret ;
  },
  
  /**
    Returns a normalized language string for the two letter country code.
  */
  normalizedLanguage: function(ret) {
    switch(ret) {
      case 'fr':
        ret = 'French'; 
        break ;
      case 'de':
        ret = 'German'; 
        break ;
      case 'ja':
      case 'jp':
        ret = 'Japanese'; 
        break ;
      case 'en':
        ret = 'English' ;
        break ;
      
      case 'es':
        ret = 'Spanish' ;
        break;
        
      default:
        ret = "English";
        break ;
    }
    return ret;
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
  addStringsFor: function(language, strings) {    
    // convert language to a normalized name...
    language = String.normalizedLanguage(language) ;
    if (!String[language]) String[language] = {} ;
    Object.extend(String[language], strings || {}); 
    return this;
  }

});

String.English  = String.English  || {};
String.French   = String.French   || {};
String.German   = String.German   || {};
String.Japanese = String.Japanese || {};
