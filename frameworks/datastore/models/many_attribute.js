// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

sc_require('models/record');
sc_require('models/record_attribute');

/** @class
  
  ManyAttribute is a subclass of RecordAttribute and handles to-many 
  relationships.
  
  When setting ( .set() ) the value of a toMany attribute, make sure
  to pass in an array of SC.Record objects.
  
  There are many ways you can configure a ManyAttribute:
  
  {{{
    contacts: SC.Record.toMany('MyApp.Contact', { 
      inverse: 'group', // set the key used to represent the inverse 
      isMaster: YES|NO, // indicate whether changing this should dirty
      transform: function(), // transforms value <=> storeKey,
      isEditable: YES|NO, make editable or not,
      through: 'taggings' // set a relationship this goes through
    });
  }}}
  
  @extends SC.RecordAttribute
  @since SproutCore 1.0
*/
SC.ManyAttribute = SC.RecordAttribute.extend(
  /** @scope SC.ManyAttribute.prototype */ {
  
  /**
    Set the foreign key on content objects that represent the inversion of
    this relationship.  The inverse property should be a toOne() or toMany()
    relationship as well.  Modifying this many array will modify the inverse
    property as well.
    
    @property
    @type {String}
  */
  inverse: null,
  
  /**
    If YES then modifying this relationships will mark the owner record 
    dirty.    If set ot NO, then modifying this relationship will not alter
    this record.  You should use this property only if you have an inverse 
    property also set.  Only one of the inverse relationships should be marked
    as master so you can control which record should be committed.
  */
  isMaster: YES,
  
  // ..........................................................
  // LOW-LEVEL METHODS
  //
  
  /**  @private - adapted for to many relationship */
  toType: function(record, key, value) {
    var type      = this.get('typeClass'),
        arrayKey  = SC.keyFor('__manyArray__', SC.guidFor(this)),
        ret       = record[arrayKey],
        rel;
      
    // lazily create a ManyArray one time.  after that always return the 
    // same object.  
    if (!ret) {
      ret = SC.ManyArray.create({ 
        recordType:   type, 
        record:       record, 
        propertyName: key,
        isEditable:   this.get('isEditable'),
        owner:        this
      });
      
      record[arrayKey] = ret ; // save on record
      rel = record.get('relationships');
      if (!rel) record.set('relationships', rel = []);
      rel.push(ret); // make sure we get notified of changes...
      
    }
    
    return ret;
  },
  
  /** @private - adapted for to many relationship */
  fromType: function(record, key, value) {
    var ret = [];
    
    if(!SC.isArray(value)) throw "Expects toMany attribute to be an array";
    
    var len = value.get('length');
    for(var i=0;i<len;i++) {
      ret[i] = value.objectAt(i).get('id');
    }
    
    return ret;
  }
  
});
