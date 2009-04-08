// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

sc_require('models/record');
sc_require('models/record_attribute');

/** @class

  ManyAttribute is a subclass of RecordAttribute and handles to-many 
  relationships.
  
  @extends SC.RecordAttribute
  @since SproutCore 1.0
*/
SC.ManyAttribute = SC.RecordAttribute.extend(
  /** @scope SC.ManyAttribute.prototype */ {
  
  // ..........................................................
  // LOW-LEVEL METHODS
  // 
  
  /**  @private - adapted for to many relationship */
  toType: function(record, key, value) {
    var transform = this.get('transform'),
        type      = this.get('typeClass'),
        store     = record.get('store');

    if (transform && transform.to) {
      return SC.ManyArray.create({ store: store, storeIds: value, recordType: type });
    }
  },

  /** @private - adapted for to many relationship */
  fromType: function(record, key, value) {
    return value;
  }
  
}) ;

