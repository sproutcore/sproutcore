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
   *
   */
  primaryKey: 'childRecordKey',
  
  /**
   * The immediate parent of the child record.
   */
  _parentRecord: null,
  
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
  },
  
  /**
   * Creates a new child record using the parent of *this* child record.
   * all the way up to the base parent record.  This is to give access to 
   * all the children in a root parent tree  
   */
  createChildRecord: function(recordType, hash) {
    var myParent = this._parentRecord;
  
    if (myParent) {
      return myParent.createChildRecord(recordType, hash);
    } else {
      throw 'Error creating child record: Parent record is unknown.';
    }
  
    return null;
  }  
});
