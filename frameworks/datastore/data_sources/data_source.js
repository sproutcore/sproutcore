// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================


/** @class

  TODO: Describe
  
  @extend SC.Object
  @since SproutCore 1.0
*/
SC.DataSource = SC.Object.extend( /** SC.DataSource.prototype */ {

  // ..........................................................
  // SC.STORE ENTRY POINTS
  // 
  
  /**
    Invoked by the Store to load or refresh records in the store.  You can 
    map the storeKeys back to recordType and ids as needed to perform the 
    retrieval.
    
    Typically you will override this method to initial a retrieval for the
    records and then provide the data to the store using the standard data
    source callbacks on the store.
    
    If you are implementing an in-memory data source, you can provide this 
    data immediately if you want before returning.
    
    To support cascading data stores, be sure to return NO if you cannot 
    retrieve any of the keys, YES if you can retrieve all of the, or
    SC.MIXED_STATE if you can retrieve some of the.
    
    @param {SC.DataSource} dataSource the receiver
    @param {SC.Store} store the requesting store
    @param {Array} storeKeys array of storeKeys to retrieve
    @returns {Boolean} YES if data source can handle keys
  */
  retrieveRecords: function(dataSource, store, storeKeys) {
    return NO;    
  },

  /**
    Invoked by the store whenever it has one or more records with pending 
    changes that need to be sent back to the server.  The store keys will be
    separated into three categories:
    
     - createStoreKeys: records that need to be created on server
     - updateStoreKeys: existing records that have been modified
     - destroyStoreKeys: records need to be destroyed on the server
     
    If you do not override this method yourself, this method will actually
    invoke createRecords(), updateRecords(), and destroyRecords() on the 
    dataSource, passing each array of storeKeys.  You can usually implement
    those methods instead of overriding this method.
    
    However, if your server API can sync multiple changes at once, you may
    prefer to override this method instead.
    
    To support cascading data stores, be sure to return NO if you cannot 
    handle any of the keys, YES if you can handle all of the keys, or
    SC.MIXED_STATE if you can handle some of them.

    @param {SC.DataSource} dataSource the receiver
    @param {SC.Store} store the requesting store
    @param {Array} createStoreKeys keys to create
    @param {Array} updateStoreKeys keys to update
    @param {Array} destroyStoreKeys keys to destroy
    @returns {Boolean} YES if data source can handle keys
  */
  commitRecords: function(dataSource, store, createStoreKeys, updateStoreKeys, destroyStoreKeys) {
    var cret, uret, dret;
    cret = this.createRecords.call(dataSource, store, createStoreKeys);    
    uret = this.updateRecords.call(dataSource, store, updateStoreKeys);    
    dret = this.destroyRecords.call(dataSource, store, destroyStoreKeys); 
    return (cret === uret === dret) ? cret : SC.MIXED_STATE ;
  },
  
  /**
    Invoked by the store whenever it needs to cancel one or more records that
    are currently in-flight.  If any of the storeKeys match records you are
    currently acting upon, you should cancel the in-progress operation and 
    return YES.
    
    If you implement an in-memory data source that immediately services the
    other requests, then this method will never be called on your data source.
    
    To support cascading data stores, be sure to return NO if you cannot 
    retrieve any of the keys, YES if you can retrieve all of the, or
    SC.MIXED_STATE if you can retrieve some of the.
    
    @param {SC.DataSource} dataSource the receiver
    @param {SC.Store} store the requesting store
    @param {Array} storeKeys array of storeKeys to retrieve
    @returns {Boolean} YES if data source can handle keys
  */
  cancel: function(dataSource, store, storeKeys) {
    return NO;
  },
  
  // ..........................................................
  // BULK RECORD ACTIONS
  // 
  
  /**
    Called from commitRecords() to commit modified existing records to the 
    store.  You can override this method to actually send the updated 
    records to your store.  The default version will simply call 
    updateRecord() for each storeKey.

    To support cascading data stores, be sure to return NO if you cannot 
    handle any of the keys, YES if you can handle all of the keys, or
    SC.MIXED_STATE if you can handle some of them.

    @param {SC.DataSource} dataSource the receiver
    @param {SC.Store} store the requesting store
    @param {Array} storeKeys keys to update
  */
  updateRecords: function(dataSource, store, storeKeys) {
    return this._handleEach(dataSource, store, storeKeys, this.updateRecord);
  },
  
  /**
    Called from commitRecords() to commit newly created records to the 
    store.  You can override this method to actually send the created 
    records to your store.  The default version will simply call 
    createRecord() for each storeKey.

    To support cascading data stores, be sure to return NO if you cannot 
    handle any of the keys, YES if you can handle all of the keys, or
    SC.MIXED_STATE if you can handle some of them.

    @param {SC.DataSource} dataSource the receiver
    @param {SC.Store} store the requesting store
    @param {Array} storeKeys keys to update
  */
  createRecords: function(dataSource, store, storeKeys) {
    return this._handleEach(dataSource, store, storeKeys, this.createRecord);
  },

  /**
    Called from commitRecords() to commit destroted records to the 
    store.  You can override this method to actually send the destroyed 
    records to your store.  The default version will simply call 
    destroyRecord() for each storeKey.

    To support cascading data stores, be sure to return NO if you cannot 
    handle any of the keys, YES if you can handle all of the keys, or
    SC.MIXED_STATE if you can handle some of them.

    @param {SC.DataSource} dataSource the receiver
    @param {SC.Store} store the requesting store
    @param {Array} storeKeys keys to update
  */
  destroyRecords: function(dataSource, store, storeKeys) {
    return this._handleEach(dataSource, store, storeKeys, this.destroyRecord);
  },

  /** @private
    invokes the named action for each store key.  returns proper value
  */
  _handleEach: function(dataSource, store, storeKeys, action) {
    var len = storeKeys.length, idx, ret, cur;
    for(idx=0;idx<len;idx++) {
      cur = action.call(dataSource, store, storeKeys[idx]);
      if (ret === undefined) {
        cur = ret ;
      } else if (ret === YES) {
        ret = (cur === YES) ? YES : SC.MIXED_STATE ;
      } else if (ret === NO) {
        ret = (cur === NO) ? NO : SC.MIXED_STATE ;
      }
    }
    return ret ;
  },
  

  // ..........................................................
  // SINGLE RECORD ACTIONS
  // 
  
  /**
    Called from updatesRecords() to update a single record.  This is the 
    most basic primitive to can implement to support updating a record.
    
    To support cascading data stores, be sure to return NO if you cannot 
    handle the passed storeKey or YES if you can.
    
    @param {SC.DataSource} dataSource the receiver
    @param {SC.Store} store the requesting store
    @param {Array} storeKey key to update
    @returns {Boolean} YES if handled
  */
  updateRecord: function(dataSource, store, storeKey) {
    return NO ;
  },

  /**
    Called from createdRecords() to created a single record.  This is the 
    most basic primitive to can implement to support creating a record.
    
    To support cascading data stores, be sure to return NO if you cannot 
    handle the passed storeKey or YES if you can.
    
    @param {SC.DataSource} dataSource the receiver
    @param {SC.Store} store the requesting store
    @param {Array} storeKey key to update
    @returns {Boolean} YES if handled
  */
  createRecord: function(dataSource, store, storeKey) {
    return NO ;
  },

  /**
    Called from destroyRecords() to destroy a single record.  This is the 
    most basic primitive to can implement to support destroying a record.
    
    To support cascading data stores, be sure to return NO if you cannot 
    handle the passed storeKey or YES if you can.
    
    @param {SC.DataSource} dataSource the receiver
    @param {SC.Store} store the requesting store
    @param {Array} storeKey key to update
    @returns {Boolean} YES if handled
  */
  destroyRecord: function(dataSource, store, storeKey) {
    return NO ;
  }  
    
});
