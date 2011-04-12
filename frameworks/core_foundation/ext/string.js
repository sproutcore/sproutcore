// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('system/string');

SC.supplement(String.prototype,
/** @scope String.prototype */ {

  /**
    @see SC.String.capitalize
  */
  capitalize: function() {
    return SC.String.capitalize(this, arguments);
  },

  /**
    @see SC.String.camelize
  */
  camelize: function() {
    return SC.String.camelize(this, arguments);
  },

  /**
    @see SC.String.decamelize
  */
  decamelize: function() {
    return SC.String.decamelize(this, arguments);
  },

  /**
    @see SC.String.dasherize
  */
  dasherize: function() {
    return SC.String.dasherize(this, arguments);
  },

  /**
    @see SC.String.loc
  */
  loc: function() {
    return SC.String.loc(this, arguments);
  },

  /**
    @see SC.String.locWithDefault
  */
  locWithDefault: function(def) {
    return SC.String.locWithDefault(this, def, arguments);
  }

});

