// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
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
    Invoked by the store the first time a Query is created.  This gives you a 
    chance to configure the query object before it is actually used to 
    retrieve data.  
    
    Normally if you just want a query to be filled from whatever objects are
    in memory, you don't need to override this method at all.  If you want to
    control the actual way the Query is filled, you can configure the Query
    now.
    
    After this method returns, the query will be frozen.
    
    @param {SC.Store} store the requesting store
    @param {SC.Query} query the query
    @returns {void}
  */
  prepareQuery: function(store, query) {
  },
  
  /**
  
    Invoked by the store whenever it needs to retrieve data matching a 
    specific query, triggered by findAll().
    
    TODO: Update this documentation to reflect the new implementation
    
    The fetchKey will most times be either an SC.Record subclass or an 
    SC.Query object, but it could be anything you want.
    
    If your data source subclass can handle the fetch you should override this 
    method to return a SC.Array with storeKeys. You can return it immediately 
    or return an empty array and populate it dynamically later once the result 
    set has arrived with .replace() . You can also return a SC.SparseArray, 
    where data source will be consulted to dynamically populate the contents 
    of the array as it is requested.
    
    Note that if you gave an SC.Query as the fetchKey to findAll() on the 
    store you do not have to return anything from this method as you are from 
    then on  delegating the responsibility to keep the record array updated to 
    the store. The fetch() method in that case merely functions as a 
    notification mechanism where you get the opportunity to fetch more data 
    from a backend based on the SC.Query.
    
    On return, the Store will write your result set in an SC.RecordArray 
    instance, which will monitor your array for changes and then maps those
    store keys to actual SC.Record instances.  SC.RecordArray can also use 
    your underlying storeKeys to create subqueries for client-side searching
    and filtering.
    
    findAll() will request all records and load them using 
    store.loadRecords(). retrieveRecords() checks if the record is already 
    loaded and in a clean state to then just materialize it. If the record is 
    in an empty state, it will call this method to load the required record to 
    then materialize it.
    
    @param {SC.Store} store the requesting store
    @param {SC.Query} query query describing the request
    @returns {Boolean} YES if you can handle fetching the query, NO otherwise
  */
  fetchQuery: function(store, query) {
  },
  
  /**
    Called by the store whenever it needs to load a specific set of store 
    keys.  The default implementation will call retrieveRecord() for each
    storeKey.  
    
    You should implement either retrieveRecord() or retrieveRecords() to 
    actually fetch the records referenced by the storeKeys .
    
    @param {SC.Store} store the requesting store
    @param {Array} storeKeys
    @param {Array} ids - optional
    @param {Hash} params to be passed down to data source. originated
      from the commitRecords() call on the store
    @returns 
  */
  
  retrieveRecords: function(store, storeKeys, ids, params) {
    return this._handleEach(store, storeKeys, this.retrieveRecord, ids, params);  
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
    @param {Hash} params to be passed down to data source. originated
      from the commitRecords() call on the store
    @returns {Boolean} YES if data source can handle keys
  */
  commitRecords: function(store, createStoreKeys, updateStoreKeys, destroyStoreKeys, params) {
    var cret, uret, dret;
    if(createStoreKeys.length>0) cret = this.createRecords.call(this, store, createStoreKeys, params);    
    if(updateStoreKeys.length>0) uret = this.updateRecords.call(this, store, updateStoreKeys, params);    
    if(destroyStoreKeys.length>0) dret = this.destroyRecords.call(this, store, destroyStoreKeys, params); 
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
    @param {Hash} params to be passed down to data source. originated
      from the commitRecords() call on the store
  */
  updateRecords: function(store, storeKeys, params) {
    return this._handleEach(store, storeKeys, this.updateRecord, null, params);
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
    @param {Hash} params to be passed down to data source. originated
      from the commitRecords() call on the store
  */
  createRecords: function(store, storeKeys, params) {
    return this._handleEach(store, storeKeys, this.createRecord, null, params);
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
    @param {Hash} params to be passed down to data source. originated
      from the commitRecords() call on the store
  */
  destroyRecords: function(store, storeKeys, params) {
    return this._handleEach(store, storeKeys, this.destroyRecord, null, params);
  },

  /** @private
    invokes the named action for each store key.  returns proper value
  */
  _handleEach: function(store, storeKeys, action, ids, params) {
    var len = storeKeys.length, idx, ret, cur, lastArg;
    if(!ids) ids = [];
    
    for(idx=0;idx<len;idx++) {
      lastArg = ids[idx] ? ids[idx] : params;
      
      cur = action.call(this, store, storeKeys[idx], lastArg, params);
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
    @param {Hash} params to be passed down to data source. originated
      from the commitRecords() call on the store
    @returns {Boolean} YES if handled
  */
  updateRecord: function(store, storeKey, params) {
    return NO ;
  },

  /**
    Called from retrieveRecords() to retrieve a single record.
    
    @param {SC.Store} store the requesting store
    @param {Array} storeKey key to retrieve
    @param {String} id the id to retrieve
    @param {Hash} params to be passed down to data source. originated
      from the commitRecords() call on the store
    @returns {Boolean} YES if handled
  */
  retrieveRecord: function(store, storeKey, id, params) {
    return NO ;
  },

  /**
    Called from createdRecords() to created a single record.  This is the 
    most basic primitive to can implement to support creating a record.
    
    To support cascading data stores, be sure to return NO if you cannot 
    handle the passed storeKey or YES if you can.
    
    @param {SC.Store} store the requesting store
    @param {Array} storeKey key to update
    @param {Hash} params to be passed down to data source. originated
      from the commitRecords() call on the store
    @returns {Boolean} YES if handled
  */
  createRecord: function(store, storeKey, params) {
    return NO ;
  },

  /**
    Called from destroyRecords() to destroy a single record.  This is the 
    most basic primitive to can implement to support destroying a record.
    
    To support cascading data stores, be sure to return NO if you cannot 
    handle the passed storeKey or YES if you can.
    
    @param {SC.Store} store the requesting store
    @param {Array} storeKey key to update
    @param {Hash} params to be passed down to data source. originated
      from the commitRecords() call on the store
    @returns {Boolean} YES if handled
  */
  destroyRecord: function(store, storeKey, params) {
    return NO ;
  }  
    
});
