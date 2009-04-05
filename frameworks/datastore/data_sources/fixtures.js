// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

sc_require('data_sources/data_source');
sc_require('models/record');

/** @class

  TODO: Describe Class
  
  @extends SC.DataSource
  @since SproutCore 1.0
*/
SC.FixturesDataSource = SC.DataSource.extend( {

  // ..........................................................
  // STANDARD DATA SOURCE METHODS
  // 
  
  /**
     Invoked by the store whenever it needs to retrieve an array of records.

     @param {SC.Store} store the requesting store
     @param {SC.Array} the array with the storeKeys to be retrieved
     @returns {SC.Bool} return YES because Fixtures supports the function.  
  */
  retrieveRecords: function(store, storeKeys) {
    var len = storeKeys.length, dataHash, storeKey, i;
    for(i=0; i<len; i++){
      storeKey = storeKeys[i];
      dataHash = this.fixtureForStoreKey(store, storeKey);
      if (dataHash) store.dataSourceDidComplete(storeKey, dataHash);
    }
    return YES;    
  },

  /**
    Invoked by the store whenever it needs to retrieve an array of storeKeys
    matching a specific query.  For the fixtures params are ignored and all 
    storeKeys for the specific recordType are returned.
    
    @param {SC.Store} store the requesting store
    @param {Object} recordType key describing the request, may be SC.Record
    @param {Hash} params optional additonal fetch params
    @returns {SC.Array} result set with storeKeys.  May be sparse.
  */
  fetchRecords: function(store, recordType, params) {
    var ret = [], dataHashes, i, storeKey;
    
    // only support loading records
    if (!(recordType === SC.Record || SC.Record.hasSubclass(recordType))) {
      return null ;
    }
    
    dataHashes = this.fixturesFor(recordType);
    for(i in dataHashes){
      storeKey = recordType.storeKeyFor(i);
      ret.push(storeKey);
    }
    return ret;
  },
  
  /**
    Fixture operations complete immediately so you cannot cancel them.
  */
  cancel: function(store, storeKeys) {
    return NO;
  },
  
 /**
    Update the dataHash in this._fixtures
  */
  updateRecord: function(store, storeKey) {
    this.setFixtureForStoreKey(store, storeKey, store.readDataHash(storeKey));
    store.dataSourceDidComplete(storeKey);  
    return YES ;
  },


  /**
    Adds records to this._fixtures.  If the record does not have an id yet,
    then then calls generateIdFor() and sets that.
    
    @param {SC.Store} store the store
    @param {Number} storeKey the store key
    @returns {Boolean} YES if successful
  */
  createRecord: function(store, storeKey) {
    var id         = store.idFor(storeKey),
        recordType = store.recordTypeFor(storeKey),
        dataHash   = store.readDataHash(storeKey), 
        fixtures   = this.fixturesFor(recordType);
        
    if (!id) id = this.generateIdFor(recordType, dataHash, store, storeKey);
    fixtures[id] = dataHash;

    store.dataSourceDidComplete(storeKey, null, id);
    return YES ;
  },

  /**
    Removes the data from the fixtures.  
    
    @param {SC.Store} store the store
    @param {Number} storeKey the store key
    @returns {Boolean} YES if successful
  */
  destroyRecord: function(store, storeKey) {
    var id         = store.idFor(storeKey),
        recordType = store.recordTypeFor(storeKey),
        fixtures   = this.fixturesFor(recordType);
        
    if (id) delete fixtures[id];
    store.dataSourceDidDestroy(storeKey);  
    return YES ;
  },
  
  // ..........................................................
  // INTERNAL METHODS
  // 

  /**
    Generates an id for the passed record type.  You can override this if 
    needed.  The default generates a storekey and formats it as a string.
  */
  generateIdFor: function(recordType, dataHash, store, storeKey) {
    return "@id%@".fmt(SC.Store.generateStoreKey());
  },
  
  /**
    Based on the storeKey it returns the specified fixtures
    
    @param {SC.Store} store the store 
    @param {Number} storeKey the storeKey
    @returns {Hash} data hash or null
  */
  fixtureForStoreKey: function(store, storeKey) {
    var id         = store.idFor(storeKey),
        recordType = store.recordTypeFor(storeKey),
        fixtures   = this.fixturesFor(recordType);
    return fixtures ? fixtures[id] : null;
  },
  
  /**
    Sets the data hash fixture for the named store key.  
    
    @param {SC.Store} store the store 
    @param {Number} storeKey the storeKey
    @param {Hash} dataHash 
    @returns {SC.FixturesDataSource} receiver
  */
  setFixtureForStoreKey: function(store, storeKey, dataHash) {
    var id         = store.idFor(storeKey),
        recordType = store.recordTypeFor(storeKey),
        fixtures   = this.fixturesFor(recordType);
    fixtures[id] = dataHash;
    return this ;
  },
  
  /** 
    Invoked methods to ensure fixtures for a particular record type have been
    loaded.
    
    @param {SC.Record} recordType
    @returns {Hash} data hashes
  */
  fixturesFor: function(recordType) {
    // get basic fixtures hash.
    if (!this._fixtures) this._fixtures = {};
    var fixtures = this._fixtures[SC.guidFor(recordType)];
    if (fixtures) return fixtures ; 
    
    // need to load fixtures.
    var dataHashes = recordType ? recordType.FIXTURES : null,
        len        = dataHashes ? dataHashes.length : 0,
        primaryKey = recordType ? recordType.prototype.primaryKey : 'guid',
        idx, dataHash, id ;

    this._fixtures[SC.guidFor(recordType)] = fixtures = {} ; 
    for(idx=0;idx<len;idx++) {      
      dataHash = dataHashes[idx];
      id = dataHash[primaryKey];
      if (!id) id = this.generateIdFor(recordType, dataHash); 
      fixtures[id] = dataHash;
    }  
    return fixtures;
  }
  
});

// create default instance for use when configuring
SC.Record.fixtures = SC.FixturesDataSource.create();
