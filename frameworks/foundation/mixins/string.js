// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

sc_require('system/locale');

// These are basic enhancements to the string class used throughout 
// SproutCore.
/** @private */
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
    if(!SC.Locale.currentLocale) SC.Locale.createCurrentLocale();
    var str = SC.Locale.currentLocale.locWithDefault(this) || this;
    return str.fmt.apply(str,arguments) ;
  },

  /**
    Works just like loc() except that it will return the passed default 
    string if a matching key is not found.
    
    @param {String} def the default to return
    @param {Object...} args optional formatting arguments
    @returns {String} localized and formatted string
  */
  locWithDefault: function(def) {
    if(!SC.Locale.currentLocale) SC.Locale.createCurrentLocale();
    var str = SC.Locale.currentLocale.locWithDefault(def) || this;
    var args = SC.$A(arguments); args.shift(); // remove def param
    return str.fmt.apply(str,args) ;
  },
  
  /** 
    Capitalizes a string.

    h2. Examples
    
    | *Input String* | *Output String* |
    | my favorite items | My favorite items |
    | css-class-name | Css-class-name |
    | action_name | Action_name |
    | innerHTML | InnerHTML |

    @return {String} capitalized string
  */
  capitalize: function() {
    return this.charAt(0).toUpperCase() + this.slice(1) ;
  },
  
  /**
    Capitalizes every word in a string.  Unlike titleize, spaces or dashes 
    will remain in-tact.
    
    h2. Examples
    
    | *Input String* | *Output String* |
    | my favorite items | My Favorite Items |
    | css-class-name | Css-Class-Name |
    | action_name | Action_Name |
    | innerHTML | InnerHTML |

    @returns {String} capitalized string
  */
  capitalizeEach: function() {
    return this.replace(SC.STRING_TITLEIZE_REGEXP, 
      function(str,sep,character) { 
        return (character) ? (sep + character.toUpperCase()) : sep;
      }).capitalize() ;
  },

  /**
    Converts a string to a title.  This will decamelize the string, convert
    separators to spaces and capitalize every word.

    h2. Examples
    
    | *Input String* | *Output String* |
    | my favorite items | My Favorite Items |
    | css-class-name | Css Class Name |
    | action_name | Action Name |
    | innerHTML | Inner HTML |

    @return {String} titleized string.
  */
  titleize: function() {
    var ret = this.replace(/([a-z])([A-Z])/g,'$1_$2'); // decamelize
    return ret.replace(SC.STRING_TITLEIZE_REGEXP, 
      function(str,separater,character) { 
        return (character) ? (' ' + character.toUpperCase()) : ' ';
      }).capitalize() ;
  },
  
  /**
    Camelizes a string.  This will take any words separated by spaces, dashes
    or underscores and convert them into camelCase.
    
    h2. Examples
    
    | *Input String* | *Output String* |
    | my favorite items | myFavoriteItems |
    | css-class-name | cssClassName |
    | action_name | actionName |
    | innerHTML | innerHTML |

    @returns {String} camelized string
  */
  camelize: function() {
    var ret = this.replace(SC.STRING_TITLEIZE_REGEXP, 
      function(str,separater,character) { 
        return (character) ? character.toUpperCase() : '' ;
      }) ;
    var first = ret.charAt(0), lower = first.toLowerCase() ;
    return (first !== lower) ? (lower + ret.slice(1)) : ret ;
  },
  
  /**
    Converts the string into a class name.  This method will camelize your 
    string and then capitalize the first letter.
    
    h2. Examples
    
    | *Input String* | *Output String* |
    | my favorite items | MyFavoriteItems |
    | css-class-name | CssClassName |
    | action_name | ActionName |
    | innerHTML | InnerHtml |

    @returns {String}
  */
  classify: function() {
    var ret = this.replace(SC.STRING_TITLEIZE_REGEXP, 
      function(str,separater,character) { 
        return (character) ? character.toUpperCase() : '' ;
      }) ;
    var first = ret.charAt(0), upper = first.toUpperCase() ;
    return (first !== upper) ? (upper + ret.slice(1)) : ret ;
  },
  
  /**
    Converts a camelized string into all lower case separated by underscores.
    
    h2. Examples
    
    | *Input String* | *Output String* |
    | my favorite items | my favorite items |
    | css-class-name | css-class-name |
    | action_name | action_name |
    | innerHTML | inner_html |

    @returns {String} the decamelized string.
  */
  decamelize: function() { 
    return this.replace(/([a-z])([A-Z])/g,'$1_$2').toLowerCase();
  },

  /**
    Converts a camelized string or a string with spaces or underscores into
    a string with components separated by dashes.
    
    h2. Examples
    
    | *Input String* | *Output String* |
    | my favorite items | my-favorite-items |
    | css-class-name | css-class-name |
    | action_name | action-name |
    | innerHTML | inner-html |

    @returns {String} the dasherized string.
  */
  dasherize: function() {
    return this.decamelize().replace(/[ _]/g,'-') ;  
  },
  
  /**
    Converts a camelized string or a string with dashes or underscores into
    a string with components separated by spaces.
    
    h2. Examples
    
    | *Input String* | *Output String* |
    | my favorite items | my favorite items |
    | css-class-name | css class name |
    | action_name | action name |
    | innerHTML | inner html |

    @returns {String} the humanized string.
  */
  humanize: function() {
    return this.decamelize().replace(/[\-_]/g,' ') ;
  },
  
  /**
    Removes any standard diacritic characters from the string. So, for
    example, all instances of 'Á' will become 'A'.

    @returns {String} the modified string
  */
  removeDiacritics: function() {
    // Lazily create the SC.diacriticMappingTable object.
    var diacriticMappingTable = SC.diacriticMappingTable;
    if (!diacriticMappingTable) {
      SC.diacriticMappingTable = {
       'À':'A', 'Á':'A', 'Â':'A', 'Ã':'A', 'Ä':'A', 'Å':'A', 'Ā':'A', 'Ă':'A',
       'Ą':'A', 'Ǎ':'A', 'Ǟ':'A', 'Ǡ':'A', 'Ǻ':'A', 'Ȁ':'A', 'Ȃ':'A', 'Ȧ':'A',
       'Ḁ':'A', 'Ạ':'A', 'Ả':'A', 'Ấ':'A', 'Ầ':'A', 'Ẩ':'A', 'Ẫ':'A', 'Ậ':'A',
       'Ắ':'A', 'Ằ':'A', 'Ẳ':'A', 'Ẵ':'A', 'Ặ':'A', 'Å':'A', 'Ḃ':'B', 'Ḅ':'B',
       'Ḇ':'B', 'Ç':'C', 'Ć':'C', 'Ĉ':'C', 'Ċ':'C', 'Č':'C', 'Ḉ':'C', 'Ď':'D',
       'Ḋ':'D', 'Ḍ':'D', 'Ḏ':'D', 'Ḑ':'D', 'Ḓ':'D', 'È':'E', 'É':'E', 'Ê':'E',
       'Ë':'E', 'Ē':'E', 'Ĕ':'E', 'Ė':'E', 'Ę':'E', 'Ě':'E', 'Ȅ':'E', 'Ȇ':'E',
       'Ȩ':'E', 'Ḕ':'E', 'Ḗ':'E', 'Ḙ':'E', 'Ḛ':'E', 'Ḝ':'E', 'Ẹ':'E', 'Ẻ':'E',
       'Ẽ':'E', 'Ế':'E', 'Ề':'E', 'Ể':'E', 'Ễ':'E', 'Ệ':'E', 'Ḟ':'F', 'Ĝ':'G',
       'Ğ':'G', 'Ġ':'G', 'Ģ':'G', 'Ǧ':'G', 'Ǵ':'G', 'Ḡ':'G', 'Ĥ':'H', 'Ȟ':'H',
       'Ḣ':'H', 'Ḥ':'H', 'Ḧ':'H', 'Ḩ':'H', 'Ḫ':'H', 'Ì':'I', 'Í':'I', 'Î':'I',
       'Ï':'I', 'Ĩ':'I', 'Ī':'I', 'Ĭ':'I', 'Į':'I', 'İ':'I', 'Ǐ':'I', 'Ȉ':'I',
       'Ȋ':'I', 'Ḭ':'I', 'Ḯ':'I', 'Ỉ':'I', 'Ị':'I', 'Ĵ':'J', 'Ķ':'K', 'Ǩ':'K',
       'Ḱ':'K', 'Ḳ':'K', 'Ḵ':'K', 'Ĺ':'L', 'Ļ':'L', 'Ľ':'L', 'Ḷ':'L', 'Ḹ':'L',
       'Ḻ':'L', 'Ḽ':'L', 'Ḿ':'M', 'Ṁ':'M', 'Ṃ':'M', 'Ñ':'N', 'Ń':'N', 'Ņ':'N',
       'Ň':'N', 'Ǹ':'N', 'Ṅ':'N', 'Ṇ':'N', 'Ṉ':'N', 'Ṋ':'N', 'Ò':'O', 'Ó':'O',
       'Ô':'O', 'Õ':'O', 'Ö':'O', 'Ō':'O', 'Ŏ':'O', 'Ő':'O', 'Ơ':'O', 'Ǒ':'O',
       'Ǫ':'O', 'Ǭ':'O', 'Ȍ':'O', 'Ȏ':'O', 'Ȫ':'O', 'Ȭ':'O', 'Ȯ':'O', 'Ȱ':'O',
       'Ṍ':'O', 'Ṏ':'O', 'Ṑ':'O', 'Ṓ':'O', 'Ọ':'O', 'Ỏ':'O', 'Ố':'O', 'Ồ':'O',
       'Ổ':'O', 'Ỗ':'O', 'Ộ':'O', 'Ớ':'O', 'Ờ':'O', 'Ở':'O', 'Ỡ':'O', 'Ợ':'O',
       'Ṕ':'P', 'Ṗ':'P', 'Ŕ':'R', 'Ŗ':'R', 'Ř':'R', 'Ȑ':'R', 'Ȓ':'R', 'Ṙ':'R',
       'Ṛ':'R', 'Ṝ':'R', 'Ṟ':'R', 'Ś':'S', 'Ŝ':'S', 'Ş':'S', 'Š':'S', 'Ș':'S',
       'Ṡ':'S', 'Ṣ':'S', 'Ṥ':'S', 'Ṧ':'S', 'Ṩ':'S', 'Ţ':'T', 'Ť':'T', 'Ț':'T',
       'Ṫ':'T', 'Ṭ':'T', 'Ṯ':'T', 'Ṱ':'T', 'Ù':'U', 'Ú':'U', 'Û':'U', 'Ü':'U',
       'Ũ':'U', 'Ū':'U', 'Ŭ':'U', 'Ů':'U', 'Ű':'U', 'Ų':'U', 'Ư':'U', 'Ǔ':'U',
       'Ǖ':'U', 'Ǘ':'U', 'Ǚ':'U', 'Ǜ':'U', 'Ȕ':'U', 'Ȗ':'U', 'Ṳ':'U', 'Ṵ':'U',
       'Ṷ':'U', 'Ṹ':'U', 'Ṻ':'U', 'Ụ':'U', 'Ủ':'U', 'Ứ':'U', 'Ừ':'U', 'Ử':'U',
       'Ữ':'U', 'Ự':'U', 'Ṽ':'V', 'Ṿ':'V', 'Ŵ':'W', 'Ẁ':'W', 'Ẃ':'W', 'Ẅ':'W',
       'Ẇ':'W', 'Ẉ':'W', 'Ẋ':'X', 'Ẍ':'X', 'Ý':'Y', 'Ŷ':'Y', 'Ÿ':'Y', 'Ȳ':'Y',
       'Ẏ':'Y', 'Ỳ':'Y', 'Ỵ':'Y', 'Ỷ':'Y', 'Ỹ':'Y', 'Ź':'Z', 'Ż':'Z', 'Ž':'Z',
       'Ẑ':'Z', 'Ẓ':'Z', 'Ẕ':'Z',
       '`': '`',
       'à':'a', 'á':'a', 'â':'a', 'ã':'a', 'ä':'a', 'å':'a', 'ā':'a', 'ă':'a',
       'ą':'a', 'ǎ':'a', 'ǟ':'a', 'ǡ':'a', 'ǻ':'a', 'ȁ':'a', 'ȃ':'a', 'ȧ':'a',
       'ḁ':'a', 'ạ':'a', 'ả':'a', 'ấ':'a', 'ầ':'a', 'ẩ':'a', 'ẫ':'a', 'ậ':'a',
       'ắ':'a', 'ằ':'a', 'ẳ':'a', 'ẵ':'a', 'ặ':'a', 'ḃ':'b', 'ḅ':'b', 'ḇ':'b',
       'ç':'c', 'ć':'c', 'ĉ':'c', 'ċ':'c', 'č':'c', 'ḉ':'c', 'ď':'d', 'ḋ':'d',
       'ḍ':'d', 'ḏ':'d', 'ḑ':'d', 'ḓ':'d', 'è':'e', 'é':'e', 'ê':'e', 'ë':'e',
       'ē':'e', 'ĕ':'e', 'ė':'e', 'ę':'e', 'ě':'e', 'ȅ':'e', 'ȇ':'e', 'ȩ':'e',
       'ḕ':'e', 'ḗ':'e', 'ḙ':'e', 'ḛ':'e', 'ḝ':'e', 'ẹ':'e', 'ẻ':'e', 'ẽ':'e',
       'ế':'e', 'ề':'e', 'ể':'e', 'ễ':'e', 'ệ':'e', 'ḟ':'f', 'ĝ':'g', 'ğ':'g',
       'ġ':'g', 'ģ':'g', 'ǧ':'g', 'ǵ':'g', 'ḡ':'g', 'ĥ':'h', 'ȟ':'h', 'ḣ':'h',
       'ḥ':'h', 'ḧ':'h', 'ḩ':'h', 'ḫ':'h', 'ẖ':'h', 'ì':'i', 'í':'i', 'î':'i',
       'ï':'i', 'ĩ':'i', 'ī':'i', 'ĭ':'i', 'į':'i', 'ǐ':'i', 'ȉ':'i', 'ȋ':'i',
       'ḭ':'i', 'ḯ':'i', 'ỉ':'i', 'ị':'i', 'ĵ':'j', 'ǰ':'j', 'ķ':'k', 'ǩ':'k',
       'ḱ':'k', 'ḳ':'k', 'ḵ':'k', 'ĺ':'l', 'ļ':'l', 'ľ':'l', 'ḷ':'l', 'ḹ':'l',
       'ḻ':'l', 'ḽ':'l', 'ḿ':'m', 'ṁ':'m', 'ṃ':'m', 'ñ':'n', 'ń':'n', 'ņ':'n',
       'ň':'n', 'ǹ':'n', 'ṅ':'n', 'ṇ':'n', 'ṉ':'n', 'ṋ':'n', 'ò':'o', 'ó':'o',
       'ô':'o', 'õ':'o', 'ö':'o', 'ō':'o', 'ŏ':'o', 'ő':'o', 'ơ':'o', 'ǒ':'o',
       'ǫ':'o', 'ǭ':'o', 'ȍ':'o', 'ȏ':'o', 'ȫ':'o', 'ȭ':'o', 'ȯ':'o', 'ȱ':'o',
       'ṍ':'o', 'ṏ':'o', 'ṑ':'o', 'ṓ':'o', 'ọ':'o', 'ỏ':'o', 'ố':'o', 'ồ':'o',
       'ổ':'o', 'ỗ':'o', 'ộ':'o', 'ớ':'o', 'ờ':'o', 'ở':'o', 'ỡ':'o', 'ợ':'o',
       'ṕ':'p', 'ṗ':'p', 'ŕ':'r', 'ŗ':'r', 'ř':'r', 'ȑ':'r', 'ȓ':'r', 'ṙ':'r',
       'ṛ':'r', 'ṝ':'r', 'ṟ':'r', 'ś':'s', 'ŝ':'s', 'ş':'s', 'š':'s', 'ș':'s',
       'ṡ':'s', 'ṣ':'s', 'ṥ':'s', 'ṧ':'s', 'ṩ':'s', 'ţ':'t', 'ť':'t', 'ț':'t',
       'ṫ':'t', 'ṭ':'t', 'ṯ':'t', 'ṱ':'t', 'ẗ':'t', 'ù':'u', 'ú':'u', 'û':'u',
       'ü':'u', 'ũ':'u', 'ū':'u', 'ŭ':'u', 'ů':'u', 'ű':'u', 'ų':'u', 'ư':'u',
       'ǔ':'u', 'ǖ':'u', 'ǘ':'u', 'ǚ':'u', 'ǜ':'u', 'ȕ':'u', 'ȗ':'u', 'ṳ':'u',
       'ṵ':'u', 'ṷ':'u', 'ṹ':'u', 'ṻ':'u', 'ụ':'u', 'ủ':'u', 'ứ':'u', 'ừ':'u',
       'ử':'u', 'ữ':'u', 'ự':'u', 'ṽ':'v', 'ṿ':'v', 'ŵ':'w', 'ẁ':'w', 'ẃ':'w',
       'ẅ':'w', 'ẇ':'w', 'ẉ':'w', 'ẘ':'w', 'ẋ':'x', 'ẍ':'x', 'ý':'y', 'ÿ':'y',
       'ŷ':'y', 'ȳ':'y', 'ẏ':'y', 'ẙ':'y', 'ỳ':'y', 'ỵ':'y', 'ỷ':'y', 'ỹ':'y',
       'ź':'z', 'ż':'z', 'ž':'z', 'ẑ':'z', 'ẓ':'z', 'ẕ':'z'
      };
      diacriticMappingTable = SC.diacriticMappingTable;
    }
    
    var original, replacement;
    var ret = "";
    var length = this.length;
    for (var i = 0; i <= length; ++i) {
      original = this.charAt(i);
      replacement = diacriticMappingTable[original];
      if (replacement) {
        ret += replacement;
      }
      else {
        ret += original;
      }
    }
    return ret;
  },
  
  /**
    Removes any extra whitespace from the edges of the string. This method is 
    also aliased as strip().
    
    @returns {String} the trimmed string
  */
  trim: function () {
    return this.replace(/^\s+|\s+$/g,"");
  },
  
  /**
    Removes any extra whitespace from the left edge of the string.
    
    @returns {String} the trimmed string
  */
  trimLeft: function () {
    return this.replace(/^\s+/g,"");
  },
  
  /**
    Removes any extra whitespace from the right edge of the string.
    
    @returns {String} the trimmed string
  */
  trimRight: function () {
    return this.replace(/\s+$/g,"");
  }
    
};

/** @private */
SC.String.strip = SC.String.trim; // convenience alias.

// Apply SC.String mixin to built-in String object
SC.supplement(String.prototype, SC.String) ;

/** @private */
String.prototype.loc = SC.String.loc; // Two places define it, and we want the version at SC.String.loc

/** @private */
SC.String.fmt = String.prototype.fmt; // copy from runtime

