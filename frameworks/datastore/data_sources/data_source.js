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
SC.DataSource = SC.Object.extend( /** @scope SC.DataSource.prototype */ {

  // ..........................................................
  // SC.STORE ENTRY POINTS
  // 
  

  /**
  
    Invoked by the store whenever it needs to retrieve data matching a 
    specific query, triggered by find().  This method is called anytime
    you invoke SC.Store#find() with a query or SC.RecordArray#refresh().  You 
    should override this method to actually retrieve data from the server 
    needed to fulfill the query.  If the query is a remote query, then you 
    will also need to provide the contents of the query as well.
    
    h3. Handling Local Queries
    
    Most queries you create in your application will be local queries.  Local
    queries are populated automatically from whatever data you have in memory.
    When your fetch() method is called on a local queries, all you need to do
    is load any records that might be matched by the query into memory. 
    
    The way you choose which queries to fetch is up to you, though usually it
    can be something fairly straightforward such as loading all records of a
    specified type.
    
    When you finish loading any data that might be required for your query, 
    you should always call SC.Store#dataSourceDidFetchQuery() to put the query 
    back into the READY state.  You should call this method even if you choose
    not to load any new data into the store in order to notify that the store
    that you think it is ready to return results for the query.
    
    h3. Handling Remote Queries
    
    Remote queries are special queries whose results will be populated by the
    server instead of from memory.  Usually you will only need to use this 
    type of query when loading large amounts of data from the server.
    
    Like Local queries, to fetch a remote query you will need to load any data
    you need to fetch from the server and add the records to the store.  Once
    you are finished loading this data, however, you must also call
    SC.Store#loadQueryResults() to actually set an array of storeKeys that
    represent the latest results from the server.  This will implicitly also
    call datasSourceDidFetchQuery() so you don't need to call this method 
    yourself.
    
    If you want to support incremental loading from the server for remote 
    queries, you can do so by passing a SC.SparseArray instance instead of 
    a regular array of storeKeys and then populate the sparse array on demand.
    
    h3. Handling Errors and Cancelations
    
    If you encounter an error while trying to fetch the results for a query 
    you can call SC.Store#dataSourceDidErrorQuery() instead.  This will put
    the query results into an error state.  
    
    If you had to cancel fetching a query before the results were returned, 
    you can instead call SC.Store#dataSourceDidCancelQuery().  This will set 
    the query back into the state it was in previously before it started 
    loading the query.
    
    h3. Return Values
    
    When you return from this method, be sure to return a Boolean.  YES means
    you handled the query, NO means you can't handle the query.  When using
    a cascading data source, returning NO will mean the next data source will
    be asked to fetch the same results as well.
    
    @param {SC.Store} store the requesting store
    @param {SC.Query} query query describing the request
    @returns {Boolean} YES if you can handle fetching the query, NO otherwise
  */
  fetch: function(store, query) {
    return NO ; // do not handle anything!
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
    @returns {Boolean} YES if handled, NO otherwise
  */
  retrieveRecords: function(store, storeKeys, ids) {
    return this._handleEach(store, storeKeys, this.retrieveRecord, ids);  
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
    if (createStoreKeys.length>0) {
      cret = this.createRecords.call(this, store, createStoreKeys, params);
    }
        
    if (updateStoreKeys.length>0) {
      uret = this.updateRecords.call(this, store, updateStoreKeys, params); 
    }
       
    if (destroyStoreKeys.length>0) {
      dret = this.destroyRecords.call(this, store, destroyStoreKeys, params);
    }
     
    return ((cret === uret) && (cret === dret)) ? cret : SC.MIXED_STATE;
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
    @param {Hash} params 
      to be passed down to data source. originated from the commitRecords() 
      call on the store

    @returns {Boolean} YES, NO, or SC.MIXED_STATE  

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
    
    @param {Hash} params 
      to be passed down to data source. originated from the commitRecords() 
      call on the store
    
    @returns {Boolean} YES, NO, or SC.MIXED_STATE  
  
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

    @returns {Boolean} YES, NO, or SC.MIXED_STATE  

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
    @returns {Boolean} YES if handled
  */
  retrieveRecord: function(store, storeKey, id) {
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
