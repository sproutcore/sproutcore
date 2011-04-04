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
    return this.replace(SC.STRING_DECAMELIZE_REGEXP,'$1_$2').toLowerCase();
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
    // Do we have the item in our cache?
    var cache = SC.STRING_DASHERIZE_CACHE,
        ret   = cache[this];

    if (ret) {
      return ret;
    }
    else {
      ret = this.decamelize().replace(SC.STRING_DASHERIZE_REGEXP,'-') ;

      // Add the item to our cache.
      cache[this] = ret;
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
  loc: function() {
    // NB: This could be implemented as a wrapper to locWithDefault() but
    // it would add some overhead to deal with the arguments and adds stack
    // frames, so we are keeping the implementation separate.
    if(!SC.Locale.currentLocale) SC.Locale.createCurrentLocale();
    var str = SC.Locale.currentLocale.locWithDefault(this);
    if (SC.typeOf(str) !== SC.T_STRING) str = this;
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
    var str = SC.Locale.currentLocale.locWithDefault(this, def);
    if (SC.typeOf(str) !== SC.T_STRING) str = this;
    var args = SC.$A(arguments); args.shift(); // remove def param
    return str.fmt.apply(str,args) ;
  }
};

// Apply SC.String mixin to built-in String object
SC.supplement(String.prototype, SC.String) ;

/** @private */
String.prototype.loc = SC.String.loc; // Two places define it, and we want the version at SC.String.loc

/** @private */
SC.String.fmt = String.prototype.fmt; // copy from runtime

