// These are basic enhancements to the string class used throughout
// SproutCore.
/** @private */
SC.STRING_TITLEIZE_REGEXP = (/([\s|\-|\_|\n])([^\s|\-|\_|\n]?)/g);
SC.STRING_HUMANIZE_REGEXP = (/[\-_]/g);
SC.STRING_TRIM_REGEXP = (/^\s+|\s+$/g);
SC.STRING_TRIM_LEFT_REGEXP = (/^\s+/g);
SC.STRING_TRIM_RIGHT_REGEXP = (/\s+$/g);
SC.STRING_REGEXP_ESCAPED_REGEXP = (/([\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:])/g);

// Since there are many strings that are commonly dasherized(), we'll maintain
// a cache.  Moreover, we'll pre-add some common ones.
SC.STRING_DASHERIZE_CACHE = {
  top:      'top',
  left:     'left',
  right:    'right',
  bottom:   'bottom',
  width:    'width',
  height:   'height',
  minWidth: 'min-width',
  maxWidth: 'max-width'
};

// Active Support style inflection constants
SC.INFLECTION_CONSTANTS = {
  PLURAL: [
      [/(quiz)$/i,               "$1zes"  ],
      [/^(ox)$/i,                "$1en"   ],
      [/([m|l])ouse$/i,          "$1ice"  ],
      [/(matr|vert|ind)ix|ex$/i, "$1ices" ],
      [/(x|ch|ss|sh)$/i,         "$1es"   ],
      [/([^aeiouy]|qu)y$/i,      "$1ies"  ],
      [/(hive)$/i,               "$1s"    ],
      [/(?:([^f])fe|([lr])f)$/i, "$1$2ves"],
      [/sis$/i,                  "ses"    ],
      [/([ti])um$/i,             "$1a"    ],
      [/(buffal|tomat)o$/i,      "$1oes"  ],
      [/(bu)s$/i,                "$1ses"  ],
      [/(alias|status)$/i,       "$1es"   ],
      [/(octop|vir)us$/i,        "$1i"    ],
      [/(ax|test)is$/i,          "$1es"   ],
      [/s$/i,                    "s"      ],
      [/$/,                      "s"      ]
  ],

  SINGULAR: [
      [/(quiz)zes$/i,                                                    "$1"     ],
      [/(matr)ices$/i,                                                   "$1ix"   ],
      [/(vert|ind)ices$/i,                                               "$1ex"   ],
      [/^(ox)en/i,                                                       "$1"     ],
      [/(alias|status)es$/i,                                             "$1"     ],
      [/(octop|vir)i$/i,                                                 "$1us"   ],
      [/(cris|ax|test)es$/i,                                             "$1is"   ],
      [/(shoe)s$/i,                                                      "$1"     ],
      [/(o)es$/i,                                                        "$1"     ],
      [/(bus)es$/i,                                                      "$1"     ],
      [/([m|l])ice$/i,                                                   "$1ouse" ],
      [/(x|ch|ss|sh)es$/i,                                               "$1"     ],
      [/(m)ovies$/i,                                                     "$1ovie" ],
      [/(s)eries$/i,                                                     "$1eries"],
      [/([^aeiouy]|qu)ies$/i,                                            "$1y"    ],
      [/([lr])ves$/i,                                                    "$1f"    ],
      [/(tive)s$/i,                                                      "$1"     ],
      [/(hive)s$/i,                                                      "$1"     ],
      [/([^f])ves$/i,                                                    "$1fe"   ],
      [/(^analy)ses$/i,                                                  "$1sis"  ],
      [/((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)ses$/i, "$1$2sis"],
      [/([ti])a$/i,                                                      "$1um"   ],
      [/(n)ews$/i,                                                       "$1ews"  ],
      [/s$/i,                                                            ""       ]
  ],

  IRREGULAR: [
      ['move',   'moves'   ],
      ['sex',    'sexes'   ],
      ['child',  'children'],
      ['man',    'men'     ],
      ['person', 'people'  ]
  ],

  UNCOUNTABLE: [
      "sheep",
      "fish",
      "series",
      "species",
      "money",
      "rice",
      "information",
      "info",
      "equipment"
  ]
};

SC.StringInflections = {
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
    var ret = this.replace(SC.STRING_DECAMELIZE_REGEXP,'$1_$2'); // decamelize
    return ret.replace(SC.STRING_TITLEIZE_REGEXP,
      function(str,separater,character) {
        return (character) ? (' ' + character.toUpperCase()) : ' ';
      }).capitalize() ;
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
    return this.decamelize().replace(SC.STRING_HUMANIZE_REGEXP,' ') ;
  },

  /**
    Will escape a string so it can be securely used in a regular expression.

    Useful when you need to use user input in a regular expression without
    having to worry about it breaking code if any reserved regular expression
    characters are used.

    @returns {String} the string properly escaped for use in a regexp.
  */
  escapeForRegExp: function() {
    return this.replace(SC.STRING_REGEXP_ESCAPED_REGEXP, "\\$1");
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

    var original, replacement, ret = "",
        length = this.length;
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
    return this.replace(SC.STRING_TRIM_REGEXP,"");
  },

  /**
    Removes any extra whitespace from the left edge of the string.

    @returns {String} the trimmed string
  */
  trimLeft: function () {
    return this.replace(SC.STRING_TRIM_LEFT_REGEXP,"");
  },

  /**
    Removes any extra whitespace from the right edge of the string.

    @returns {String} the trimmed string
  */
  trimRight: function () {
    return this.replace(SC.STRING_TRIM_RIGHT_REGEXP,"");
  },

  /**
    Converts a word into its plural form.

    @returns {String} the plural form of the string
  */
  pluralize: function() {
      var idx, len,
           compare = this.split(/\s/).pop(), //check only the last word of a string
          restOfString = this.replace(compare,''),
          isCapitalized = compare.charAt(0).match(/[A-Z]/) ? true : false;

      compare = compare.toLowerCase();
      for (idx=0, len=SC.INFLECTION_CONSTANTS.UNCOUNTABLE.length; idx < len; idx++) {
          var uncountable = SC.INFLECTION_CONSTANTS.UNCOUNTABLE[idx];
          if (compare == uncountable) {
              return this.toString();
          }
      }
      for (idx=0, len=SC.INFLECTION_CONSTANTS.IRREGULAR.length; idx < len; idx++) {
          var singular = SC.INFLECTION_CONSTANTS.IRREGULAR[idx][0],
              plural   = SC.INFLECTION_CONSTANTS.IRREGULAR[idx][1];
          if ((compare == singular) || (compare == plural)) {
              if(isCapitalized) plural = plural.capitalize();
              return restOfString + plural;
          }
      }
      for (idx=0, len=SC.INFLECTION_CONSTANTS.PLURAL.length; idx < len; idx++) {
          var regex          = SC.INFLECTION_CONSTANTS.PLURAL[idx][0],
              replace_string = SC.INFLECTION_CONSTANTS.PLURAL[idx][1];
          if (regex.test(compare)) {
              return this.replace(regex, replace_string);
          }
      }
  },

  /**
    Converts a word into its singular form.

    @returns {String} the singular form of the string
  */
  singularize: function() {
      var idx, len,
          compare = this.split(/\s/).pop(), //check only the last word of a string
          restOfString = this.replace(compare,''),
          isCapitalized = compare.charAt(0).match(/[A-Z]/) ? true : false;

      compare = compare.toLowerCase();
      for (idx=0, len=SC.INFLECTION_CONSTANTS.UNCOUNTABLE.length; idx < len; idx++) {
          var uncountable = SC.INFLECTION_CONSTANTS.UNCOUNTABLE[idx];
          if (compare == uncountable) {
              return this.toString();
          }
      }
      for (idx=0, len=SC.INFLECTION_CONSTANTS.IRREGULAR.length; idx < len; idx++) {
          var singular = SC.INFLECTION_CONSTANTS.IRREGULAR[idx][0],
              plural   = SC.INFLECTION_CONSTANTS.IRREGULAR[idx][1];
          if ((compare == singular) || (compare == plural)) {
              if(isCapitalized) singular = singular.capitalize();
              return restOfString + singular;
          }
      }
      for (idx=0, len=SC.INFLECTION_CONSTANTS.SINGULAR.length; idx < len; idx++) {
          var regex          = SC.INFLECTION_CONSTANTS.SINGULAR[idx][0],
              replace_string = SC.INFLECTION_CONSTANTS.SINGULAR[idx][1];
          if (regex.test(compare)) {
              return this.replace(regex, replace_string);
          }
      }
  }

}

/** @private */
SC.String.strip = SC.String.trim; // convenience alias.
SC.supplement(SC.String, SC.StringInflections);

// Apply SC.String mixin to built-in String object
SC.supplement(String.prototype, SC.StringInflections) ;

