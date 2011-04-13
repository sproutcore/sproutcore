// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('system/locale');

// These are basic enhancements to the string class used throughout
// SproutCore.
/** @private */
SC.STRING_TITLEIZE_REGEXP = (/([\s|\-|\_|\n])([^\s|\-|\_|\n]?)/g);
SC.STRING_DECAMELIZE_REGEXP = (/([a-z])([A-Z])/g);
SC.STRING_DASHERIZE_REGEXP = (/[ _]/g);
SC.STRING_DASHERIZE_CACHE = {};
SC.STRING_TRIM_LEFT_REGEXP = (/^\s+/g);
SC.STRING_TRIM_RIGHT_REGEXP = (/\s+$/g);

/**
  @namespace

  SproutCore implements a variety of enhancements to the built-in String
  object that make it easy to perform common substitutions and conversions.

  Most of the utility methods defined here mirror those found in Prototype
  1.6.

  @since SproutCore 1.0
  @lends String.prototype
*/
SC.mixin(SC.String, {

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
  capitalize: function(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
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
  camelize: function(str) {
    var ret = str.replace(SC.STRING_TITLEIZE_REGEXP, function(str, separater, character) {
      return character ? character.toUpperCase() : '';
    });

    var first = ret.charAt(0),
        lower = first.toLowerCase();

    return first !== lower ? lower + ret.slice(1) : ret;
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
  decamelize: function(str) {
    return str.replace(SC.STRING_DECAMELIZE_REGEXP, '$1_$2').toLowerCase();
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
  dasherize: function(str) {
    var cache = SC.STRING_DASHERIZE_CACHE,
        ret   = cache[str];

    if (ret) {
      return ret;
    } else {
      ret = SC.String.decamelize(str).replace(SC.STRING_DASHERIZE_REGEXP,'-');
      cache[str] = ret;
    }

    return ret;
  },

  /**
    Localizes the string.  This will look up the reciever string as a key
    in the current Strings hash.  If the key matches, the loc'd value will be
    used.  The resulting string will also be passed through fmt() to insert
    any variables.

    @param args {Object...} optional arguments to interpolate also
    @returns {String} the localized and formatted string.
  */
  loc: function(str) {
    // NB: This could be implemented as a wrapper to locWithDefault() but
    // it would add some overhead to deal with the arguments and adds stack
    // frames, so we are keeping the implementation separate.
    if(!SC.Locale.currentLocale) { SC.Locale.createCurrentLocale(); }

    var localized = SC.Locale.currentLocale.locWithDefault(str);
    if (SC.typeOf(localized) !== SC.T_STRING) { localized = str; }

    var args = SC.$A(arguments);
    args.shift(); // remove str param

    return SC.String.fmt(localized, arguments);
  },

  /**
    Works just like loc() except that it will return the passed default
    string if a matching key is not found.

    @param {String} def the default to return
    @param {Object...} args optional formatting arguments
    @returns {String} localized and formatted string
  */
  locWithDefault: function(str, def) {
    if (!SC.Locale.currentLocale) { SC.Locale.createCurrentLocale(); }

    var localized = SC.Locale.currentLocale.locWithDefault(str, def);
    if (SC.typeOf(localized) !== SC.T_STRING) { localized = str; }

    var args = SC.$A(arguments);
    args.shift(); // remove str param
    args.shift(); // remove def param

    return SC.String.fmt(localized, args);
  },
  
  /**
   Removes any extra whitespace from the edges of the string. This method is
   also aliased as strip().

   @returns {String} the trimmed string
  */
  trim: jQuery.trim,

  /**
   Removes any extra whitespace from the left edge of the string.

   @returns {String} the trimmed string
  */
  trimLeft: function (str) {
    return str.replace(SC.STRING_TRIM_LEFT_REGEXP,"");
  },

  /**
   Removes any extra whitespace from the right edge of the string.

   @returns {String} the trimmed string
  */
  trimRight: function (str) {
    return str.replace(SC.STRING_TRIM_RIGHT_REGEXP,"");
  }
});


// IE doesn't support string trimming
if(String.prototype.trim) {
  SC.supplement(String.prototype,
  /** @scope String.prototype */ {

    trim: function() {
      return SC.String.trim(this, arguments);
    },

    trimLeft: function() {
      return SC.String.trimLeft(this, arguments);
    },

    trimRight: function() {
      return SC.String.trimRight(this, arguments);
    }
  });
}

// We want the version defined here, not in Runtime
SC.mixin(String.prototype,
/** @scope String.prototype */ {
  
  loc: function() {
    return SC.String.loc(this, arguments);
  }

});

/** @private */
SC.String.fmt = SC.CoreString.fmt;

/** @private */
SC.String.w = SC.CoreString.w;

