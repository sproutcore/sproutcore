// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/**
  @class

  Sparse array that can materialize records on demand from an owner store.
  Unlike regular sparse arrays, the RecordArray stores its contents as an 
  array of store keys which are used to create SC.Record instances when you 
  access specific indexes on the array.
  
  To act as a delegate of a RecordArray, you should implement the same 
  SC.SparseArrayDelegate methods as you would normally.  However, instead of
  providing objects, you should provide storeKeys using the various helper
  methods defined on this class.
  
  SC.RecordArray instances are returned both when you do a fetch() or a 
  findAll() on a Store. 

  You can only mutate RecordArrays by adding SC.Record instances.
  
  @extends SC.SparseArray
  @since SproutCore 1.0
*/

SC.RecordArray = SC.SparseArray.extend( 
  /** @scope SC.RecordArray.prototype */ {
    
  /**
    The store that owns this record array.  All record arrays must have a 
    store to function properly.
  
    @property {SC.Store}
  */
  store: null,
  
  /**
    Primitive simple sets the store keys array to the passed array.  This 
    is an optimization that can be used instead of provideStoreKeysInRange()
    since it avoids copying the entire array.
    
    Note that the RecordArray will assume ownership of the storeKeys array 
    you pass in so you should not edit or retain the array after calling this
    method.
    
    @param {Array} storeKeys array of store keys
    @returns {SC.RecordArray} receiver
  */
  setStoreKeys: function(storeKeys) {
    this._storeKeys = storeKeys ;
    this.enumerableContentDidChange({ start: 0, length: storeKeys.length });
    return this ;    
  },
  
  /**
    Call this method to set a set of storeKeys for the range of objects.  Once
    you set store keys this way the records they represent will be 
    materialized as needed for display.
    
    @param {Range} range the range to set
    @param {Array} storeKeys array of store keys to set
    @returns {SC.RecordArray} receiver 
  */
  provideStoreKeysInRange: function(range, storeKeys) {
    var content = this._storeKeys ;
    if (!content) content = this._storeKeys = [] ;
    var start = range.start, len = range.length;
    while(--len >= 0) content[start+len] = storeKeys[len];
    this.enumerableContentDidChange() ;
    return this ;
  },
  
  /**
    Call this method to load new records into the store, simultaneously 
    mapping those records into the passed range on the RecordArray.  This 
    method is a useful way to provide new record content to the RecordArray
    when you have just loaded it from the server.  
    
    If the data hashes you pass in map to existing records they will be 
    overwritten by the new data.
    
    @param {Range} range the range to load into the RecordsArray
    @param {Array} dataArr (required) Array of JSON-compatible hashes.
    @param {SC.Record|Array} recordType (optional) The SC.Record extended class that you want to use or an array of SC.Record classes that match the dataArr item per item.
    @param {String} primaryKey  (optional) This is the primaryKey key for the data hash, if it is not passed in, then 'guid' is used.
    @returns {SC.RecordArray} receiver
  */
  loadRecordsInRange: function(range, dataArr, recordType, primaryKey) {
    var store = this.get('store');
    if (!store) throw "%@ cannot be used without a parent store".fmt(this);
    var storeKeys = store.loadRecords(dataArr, recordType, primaryKey);
    return this.provideStoreKeysInRange(range, storeKeys) ;
  },
  
  _TMP_PKEY_MAP: [],
  
  /**
    Call this method to specify the records in a particular range by guid.
    This method is best to use if you know the primary key value (i.e. guid)
    of the records that match a particular search but you haven't retrieved
    the record details for those primary keys yet.
    
    When you try to retrieve a record from a record array when the guid only
    has been set, the RecordArray will return a new SC.Record instance and 
    then ask your Server object to load the record details automatically.
    
    @param {Range} range the range to load into the RecordsArray
    @param {Array} primaryKeys array of primary keys to set
    @returns {SC.RecordArray} receiver 
  */
  providePrimaryKeysInRange: function(range, primaryKeys) {
    var store = this.get('store');
    if (!store) throw "%@ cannot be used without a parent store".fmt(this);

    // map primaryKeys to storeKeys
    var storeKeys = this._TMP_PKEY_MAP, len = primaryKeys.length, idx=0;
    for(idx=0;idx<len;idx++) {
      storeKeys[idx] = store.storeKeyFor(primaryKeys[idx]);
    }
    
    // now set on storeKeys on receiver
    var ret = this.provideStoreKeysInRange(range, storeKeys);
    
    // and reset storeKeys temporary object
    storeKeys.length = 0;
    return ret ;
  },
  
  // ..........................................................
  // INTERNAL SUPPORT
  // 
  
  /** @private - materialize records if needed. */
  requestIndex: function(idx) {
    // first see if we have a storeKey.  If we do, then materialize the 
    // record before going back to the delegate.
    var storeKeys = this._storeKeys, storeKey ;
    if (storeKeys && !SC.none(storeKey = storeKeys[idx])) {
      var content = this._sa_content ;
      if (!content) content = this._sa_content = [] ;
      return (content[idx] = this.get('store').materializeRecord(storeKey));
    } else return sc_super();
  },
  
  /** @private - when reseting, also reset the internal store key array. */
  reset: function() {
    this._storeKeys = null;
    return sc_super();
  },
  
  /** @private - when objects change in a range, also clear out store keys. */
  objectsDidChangeInRange: function(range) {
    
    // delete cached content
    this._sa_content = null ;
    
    var content = this._storeKeys ;
    if (content) {
      // if range covers entire length of cached content, just reset array
      if (range.start === 0 && SC.maxRange(range)>=content.length) {
        this._storeKeys = null ;
        
      // otherwise, step through the changed parts and delete them.
      } else {
        var start = range.start, loc = Math.min(start + range.length, content.length);
        while (--loc>=start) content[loc] = undefined;
      }
    }    
    this.enumerableContentDidChange(range) ; // notify
    return this ;
  }
  
});

