// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2010 Evin Grano
// License:   Licened under MIT license (see license.js)
// ==========================================================================

sc_require('models/record');
sc_require('models/record_attribute');

/** @class
  
  ChildrenAttribute is a subclass of RecordAttribute and handles to-many 
  relationships for child records
  
  When setting ( .set() ) the value of a toMany attribute, make sure
  to pass in an array of SC.Record objects.
  
  There are many ways you can configure a ManyAttribute:
  
  {{{
    contacts: SC.ChildrenAttribute.attr('SC.Child');
  }}}
  
  @extends SC.RecordAttribute
  @since SproutCore 1.0
*/
SC.ChildrenAttribute = SC.RecordAttribute.extend(
  /** @scope SC.ChildrenAttribute.prototype */ {
    
  isChildRecordTransform: YES,
    
  // ..........................................................
  // LOW-LEVEL METHODS
  //
  
  /**  @private - adapted for to many relationship */
  toType: function(record, key, value) {
    var attrKey   = this.get('key') || key,
        arrayKey  = SC.keyFor('__kidsArray__', SC.guidFor(this)),
        ret       = record[arrayKey],
        rel;

    // lazily create a ManyArray one time.  after that always return the 
    // same object.
    if (!ret) {
      ret = SC.ChildArray.create({ 
        record:         record,
        propertyName:   attrKey
      });

      record[arrayKey] = ret ; // save on record
      rel = record.get('relationships');
      if (!rel) record.set('relationships', rel = []);
      rel.push(ret); // make sure we get notified of changes...
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
    sc_super();
    return this.toType(record, key, value);
  }
  
});


