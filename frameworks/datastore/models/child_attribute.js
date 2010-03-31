// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2010 Evin Grano
// License:   Licensed under MIT license (see license.js)
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
  /** @scope SC.ChildAttribute.prototype */ {
    
  isChildRecordTransform: YES,
      
  // ..........................................................
  // LOW-LEVEL METHODS
  //
  
  /**  @private - adapted for to many relationship */
  toType: function(parentRecord, key, hash) {
    var ret   = null,
        cacheKey  = SC.keyFor('__kid__', SC.guidFor(this)),
        recordType  = this.get('typeClass');
    
    if (parentRecord[cacheKey]) return parentRecord[cacheKey];
    
    if (!parentRecord) {
      throw 'SC.Child: Error during transform: Unable to retrieve parent record.';
    }

    // If no hash, return null.
    if (hash){
      // Get the record type.
      var childNS = parentRecord.get('childRecordNamespace');
      if (hash.type && !SC.none(childNS)) {
        recordType = childNS[hash.type];
      }

      if (!recordType || SC.typeOf(recordType) !== SC.T_CLASS) {
        throw 'SC.Child: Error during transform: Invalid record type.';
      }
      // Create an instance of the record by registering it with the parent and return.
      ret = parentRecord[cacheKey] = parentRecord.registerChildRecord(recordType, hash);
    }
    return ret;
  },
  
  // Default fromType is just returning itself
  fromType: function(record, key, value){
    return value;
  },
    
  /**
    The core handler.  Called from the property.
    
    @param {SC.Record} record the record instance
    @param {String} key the key used to access this attribute on the record
    @param {Object} value the property value if called as a setter
    @returns {Object} property value
  */
  call: function(record, key, value) {
    var attrKey = this.get('key') || key,
        cacheKey = SC.keyFor('__kid__', SC.guidFor(this)), 
        nvalue;
    if (value !== undefined) {
      // careful: don't overwrite value here.  we want the return value to 
      // cache.
      this.orphan(record);
      nvalue = this.fromType(record, key, value) ; // convert to attribute.
      record[cacheKey] = null;
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
  },
  
  orphan: function(parentRecord){
    var cacheKey = SC.keyFor('__kid__', SC.guidFor(this)),
        store, storeKey, attrs, key, param, cRef;
    cRef = parentRecord ? parentRecord[cacheKey] : null;
    if (cRef) {
      attrs = cRef.get('readOnlyAttributes');
      for(key in attrs) {
        param = cRef[key];
        // Orphan all the child record and child records in a tree to clean up the store
        if(param && param.isChildRecordTransform) param.orphan(parentRecord);
      }
      store = cRef.get('store');
      if(store) storeKey = cRef.storeKey;
      if(storeKey) store.unloadRecord(undefined, undefined, storeKey);
    }
  }
});


