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
    TODO: revise description
    Invoked by the store whenever it needs to retrieve an array of storeKeys
    matching a specific query.  Your subclass should override this method 
    to return an array of storeKeys that match the passed fetchKey and 
    optional params.  Often the fetchKey will actually be an SC.Record 
    subclass used as a filter or string, but it could be anything you want.
    
    If your data source subclass can handle the fetch, it should either return
    an array of storeKeys immediately or it can return an empty array and 
    populate it dynamically later one the result set has arrived.  Optionally
    you can also implement "server-side results" by returning a SparseArray
    and then dynamically populating the contents of the array as it is 
    requested.
    
    On return, the Store will write your result set in an SC.RecordArray 
    instance, which will monitor your array for changes and then maps those
    store keys to actual SC.Record instances.  SC.RecordArray can also use 
    your underlying storeKeys to create subqueries for client-side searching
    and filtering.
    
    This method is invoked from the store functions 'findAll' and 'retrieveRecords'. 
    
    findAll() will request all records and load them using store.loadRecords(). 
    retrieveRecords() checks if the record is already loaded and in a clean 
    state to then just materialize it. If the record is in an empty state, it 
    will call this method to load the required record to then materialize it.
    
    @param {SC.Store} store the requesting store
    @param {Object} fetchKey key describing the request, may be SC.Record or
        SC.Record.STORE_KEYS if invoked from store.retrieveRecords
    @param {Hash} params optional additonal fetch params. storeKeys if invoked
        from store.retrieveRecords
    @returns {SC.Array} result set with storeKeys.  May be sparse.
  */
  fetchRecords: function(store, fetchKey, params) {
    return null;  
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

    @param {SC.Store} store the requesting store
    @param {Array} createStoreKeys keys to create
    @param {Array} updateStoreKeys keys to update
    @param {Array} destroyStoreKeys keys to destroy
    @returns {Boolean} YES if data source can handle keys
  */
  commitRecords: function(store, createStoreKeys, updateStoreKeys, destroyStoreKeys) {
    var cret, uret, dret;
    if(createStoreKeys.length>0) cret = this.createRecords.call(this, store, createStoreKeys);    
    if(updateStoreKeys.length>0) uret = this.updateRecords.call(this, store, updateStoreKeys);    
    if(destroyStoreKeys.length>0) dret = this.destroyRecords.call(this, store, destroyStoreKeys); 
    return (cret === uret === dret) ? (cret || uret || dret) : SC.MIXED_STATE ;
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
    
    @param {SC.Store} store the requesting store
    @param {Array} storeKeys array of storeKeys to retrieve
    @returns {Boolean} YES if data source can handle keys
  */
  cancel: function(store, storeKeys) {
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

    @param {SC.Store} store the requesting store
    @param {Array} storeKeys keys to update
  */
  updateRecords: function(store, storeKeys) {
    return this._handleEach(store, storeKeys, this.updateRecord);
  },
  
  /**
    Called from commitRecords() to commit newly created records to the 
    store.  You can override this method to actually send the created 
    records to your store.  The default version will simply call 
    createRecord() for each storeKey.

    To support cascading data stores, be sure to return NO if you cannot 
    handle any of the keys, YES if you can handle all of the keys, or
    SC.MIXED_STATE if you can handle some of them.

    @param {SC.Store} store the requesting store
    @param {Array} storeKeys keys to update
  */
  createRecords: function(store, storeKeys) {
    return this._handleEach(store, storeKeys, this.createRecord);
  },

  /**
    Called from commitRecords() to commit destroted records to the 
    store.  You can override this method to actually send the destroyed 
    records to your store.  The default version will simply call 
    destroyRecord() for each storeKey.

    To support cascading data stores, be sure to return NO if you cannot 
    handle any of the keys, YES if you can handle all of the keys, or
    SC.MIXED_STATE if you can handle some of them.

    @param {SC.Store} store the requesting store
    @param {Array} storeKeys keys to update
  */
  destroyRecords: function(store, storeKeys) {
    return this._handleEach(store, storeKeys, this.destroyRecord);
  },

  /** @private
    invokes the named action for each store key.  returns proper value
  */
  _handleEach: function(store, storeKeys, action) {
    var len = storeKeys.length, idx, ret, cur;
    for(idx=0;idx<len;idx++) {
      cur = action.call(this, store, storeKeys[idx]);
      if (ret === undefined) {
        ret = cur ;
      } else if (ret === YES) {
        ret = (cur === YES) ? YES : SC.MIXED_STATE ;
      } else if (ret === NO) {
        ret = (cur === NO) ? NO : SC.MIXED_STATE ;
      }
    }
    return ret ? ret : null ;
  },
  

  // ..........................................................
  // SINGLE RECORD ACTIONS
  // 
  
  /**
    Called from updatesRecords() to update a single record.  This is the 
    most basic primitive to can implement to support updating a record.
    
    To support cascading data stores, be sure to return NO if you cannot 
    handle the passed storeKey or YES if you can.
    
    @param {SC.Store} store the requesting store
    @param {Array} storeKey key to update
    @returns {Boolean} YES if handled
  */
  updateRecord: function(store, storeKey) {
    return NO ;
  },

  /**
    Called from createdRecords() to created a single record.  This is the 
    most basic primitive to can implement to support creating a record.
    
    To support cascading data stores, be sure to return NO if you cannot 
    handle the passed storeKey or YES if you can.
    
    @param {SC.Store} store the requesting store
    @param {Array} storeKey key to update
    @returns {Boolean} YES if handled
  */
  createRecord: function(store, storeKey) {
    return NO ;
  },

  /**
    Called from destroyRecords() to destroy a single record.  This is the 
    most basic primitive to can implement to support destroying a record.
    
    To support cascading data stores, be sure to return NO if you cannot 
    handle the passed storeKey or YES if you can.
    
    @param {SC.Store} store the requesting store
    @param {Array} storeKey key to update
    @returns {Boolean} YES if handled
  */
  destroyRecord: function(store, storeKey) {
    return NO ;
  }  
    
});
