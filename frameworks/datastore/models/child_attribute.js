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
    
  isNestedRecordTransform: YES,
      
  // ..........................................................
  // LOW-LEVEL METHODS
  //
  
  /**  @private - adapted for to one relationship */
  toType: function(record, key, value) {
    var ret   = null, rel,
        recordType  = this.get('typeClass');
            
    if (!record) {
      throw 'SC.Child: Error during transform: Unable to retrieve parent record.';
    }
    if (!SC.none(value)) ret = record.registerNestedRecord(value, key);
        
    return ret;
  },
  
  // Default fromType is just returning itself
  fromType: function(record, key, value){
    var sk, store, ret;
    if (record){
      ret = record.registerNestedRecord(value, key, key);
      if (ret) {
        sk = ret.get('storeKey');
        store = ret.get('store');
        record.writeAttribute(key, store.readDataHash(sk));
      }
      else if (value) {
        record.writeAttribute(key, value);
      }
    } 
    
    return ret;
  },
    
  /**
    The core handler.  Called from the property.
    @param {SC.Record} record the record instance
    @param {String} key the key used to access this attribute on the record
    @param {Object} value the property value if called as a setter
    @returns {Object} property value
  */
  call: function(record, key, value) {
    var attrKey = this.get('key') || key, cRef,
        cacheKey = SC.keyFor('__kid__', SC.guidFor(this));
    if (value !== undefined) {
      // this.orphan(record, cacheKey, value);
      value = this.fromType(record, key, value) ; // convert to attribute.
      // record[cacheKey] = value;
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


