// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

sc_require('models/record');
sc_require('models/record_attribute');

/** @class

  TODO: Describe
  
  @extends SC.RecordAttribute
  @since SproutCore 1.0
*/
SC.ManyAttribute = SC.RecordAttribute.extend(
  /** @scipe SC.ManyAttribute.prototype */ {
  
  // ..........................................................
  // LOW-LEVEL METHODS
  // 
  
  /**  @private - adapted for to many relationship */
  toType: function(record, key, value) {
    // TODO: Implement ManyAttribute
    return value ;
  },

  /** @private - adapted for to many relationship */
  fromType: function(record, key, value) {
    // TODO: Implement ManyAttribute
    return value;
  }
  
}) ;

