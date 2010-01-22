// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2010 Evin Grano
// License:   Licened under MIT license (see license.js)
// ==========================================================================

sc_require('models/record');
sc_require('models/record_attribute');

/** @class
  
  ChildAttribute is a subclass of RecordAttribute and handles to-one 
  relationship for child record
  
  When setting ( .set() ) the value of a toMany attribute, make sure
  to pass in an array of SC.Record objects.
  
  There are many ways you can configure a ManyAttribute:
  
  {{{
    contacts: SC.ChildAttribute.attr('SC.Child');
  }}}
  
  @extends SC.RecordAttribute
  @since SproutCore 1.0
*/
SC.ChildAttribute = SC.RecordAttribute.extend(
  /** @scope SC.ChildrenAttribute.prototype */ {
    
  isChildRecordTransform: YES,
    
  // ..........................................................
  // LOW-LEVEL METHODS
  //
  
  /**  @private - adapted for to many relationship */
  toType: function(parentRecord, key, hash) {
    if (!parentRecord || !parentRecord.isParentRecord) {
      throw 'SC.Child: Error during transform: Unable to retrieve parent record.';
    }

    // If no hash, return null.
    if (!hash) return null;
    
    // Get the record type.
    // REVIEW: [EG, MB] Review to see if this is the best way to do this.
    var childNS = parentRecord.get('childRecordNamespace');
    if (!hash.type || SC.none(childNS)) {
      throw 'SC.Child: Error during transform: Unable to determine record type.';
    }
    var recordType = childNS[hash.type];

    if (!recordType || SC.typeOf(recordType) !== SC.T_CLASS) {
      throw 'SC.Child: Error during transform: Invalid record type.';
    }

    // Create an instance of the record by registering it with the parent and return.
    return parentRecord.registerChildRecord(recordType, hash);
  },
    
  /**
    The core handler.  Called from the property.
    
    @param {SC.Record} record the record instance
    @param {String} key the key used to access this attribute on the record
    @param {Object} value the property value if called as a setter
    @returns {Object} property value
  */
  call: function(record, key, value) {
    var attrKey = this.get('key') || key, nvalue;

    if (value !== undefined) {
      // careful: don't overwrite value here.  we want the return value to 
      // cache.
      nvalue = this.fromType(record, key, value) ; // convert to attribute.
      record.writeAttribute(attrKey, nvalue);
      value = this.toType(record, key, value); // need to convert to the child record for caching
    } else {
      value = record.readAttribute(attrKey);
      if (SC.none(value) && (value = this.get('defaultValue'))) {
        if (typeof value === SC.T_FUNCTION) {
          value = this.defaultValue(record, key, this);
          // write default value so it doesn't have to be executed again
          if(record.attributes()) record.writeAttribute(attrKey, value, true);
        }
      } else value = this.toType(record, key, value);
    }

    return value ;
  }  
});


