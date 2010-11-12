// ..........................................................
// SC.ChildRecord
// 

sc_require('core');
sc_require('models/record');
sc_require('system/query'); // FIXME: [EG] some wonky build order crap here...

/**
 * An extension of SC.Record. We use this as the superclass for child record types 
 *
 * @extends SC.Record
 * @author Evin Grano
 * @author Sean Eidemiller
 * @author Juan Pablo Goldfinger
 *
 * @version Sproutcore 1.0
 * @since Sproutcore 1.0
 */
 
SC.ChildRecord = SC.Record.extend(
  /** @scope SC.ChildRecord.prototype */ {
  
  /**
   * This is a check to see if this is a ChildRecord
   */
  isChildRecord: YES,
  
  /**
   * The type of the child record.
   *
   * This will be set by subclasses that require a type attribute.
   */
  type: null,
  
  /**
   * Primary Key of the Child Record
   */
  primaryKey: 'childRecordKey',
  
  /**
   * Create Id for this child automatically
   */
  generatePrimaryKey: YES,
  
  /**
   * The immediate parent of the child record.
   */
  _parentRecord: null,
  
  /**
    All child records will have a life cycle that mirrors as they are created or 
    loaded into memory, modified, committed and finally destroyed.  This life 
    cycle is managed by the status property on your record. 

    The status of a record is modelled as a finite state machine.  Based on the 
    current state of the record, you can determine which operations are 
    currently allowed on the record and which are not.
    
    In general, a record can be in one of five primary states; SC.Record.EMPTY,
    SC.Record.BUSY, SC.Record.READY, SC.Record.DESTROYED, SC.Record.ERROR. 
    These are all described in more detail in the class mixin (in record.js) where 
    they are defined.
    
    @property {Number}
  */
  status: function() {
    var pStatus = SC.Record.EMPTY;
    if (this._parentRecord) {
      pStatus = this._parentRecord.get('status');
      this.store.writeStatus(this.storeKey, pStatus);
      this.store.dataHashDidChange(this.storeKey);
    } else {
      pStatus = this.store.readStatus(this.storeKey);
    }
    return pStatus;
  }.property('storeKey').cacheable(),
  
  /**
   * Marks the record as dirty.
   *
   * Invokes the parent's recordDidChange() function until it gets to an SC.Record instance, at
   * which point the record is marked as dirty in the store.
   */
  recordDidChange: function() {
    if (this._parentRecord && this._parentRecord.recordDidChange) {
      this._parentRecord.recordDidChange();
    }
    else{
      sc_super();
    }
  },
  
  /**
   * Creates a new child record using the parent of *this* child record.
   * all the way up to the base parent record.  This is to give access to 
   * all the children in a root parent tree  
   */
  createChildRecord: function(recordType, hash) {
    var ret, myParent = this._parentRecord;
  
    if (myParent) {
      ret = myParent.createChildRecord(recordType, hash);
    } else {
      ret = sc_super();
    }
  
    return ret;
  }  
});
