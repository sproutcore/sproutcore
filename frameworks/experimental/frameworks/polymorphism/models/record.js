// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

SC.mixin(SC.Record, {

  /**
    Returns a SC.PolymorphicSingleAttribute that converts the underlying ID to
    a number of types, dependent on a attribute on the record (the name of this
    attribute is provided by the typeKey property).
    
    @param {Array} recordTypes the array of record types the object could be
    @param {Hash} opts additional options
    @returns {SC.PolymorphicSingleAttribute} created instance
  */
  toOneOf: function(recordTypes, opts) {
    return SC.PolymorphicSingleAttribute.attr(recordTypes, opts);
  }

});