// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

sc_require('data_sources/data_source');

/** @class

  
  @extends SC.DataSource
  @since SproutCore 1.0
*/
SC.FixturesDataSource = SC.DataSource.extend( {
  // ..........................................................
  // SC.STORE ENTRY POINTS
  // 
  
  // Contains an array of strings with all the fixtures namespaces
  namespaces: null,
  
  // Stores all fixture data after loading them for the first time
  dataInMemory: null,
  
  // Contains and array of indexes that will store which will be the newxt
  // id to create new records
  recordTypeIndexes: null,
  
  /** @private
    Invoked by fetchRecords() if the fixtures haven't been loaded.
    Loads all the fixtures specified when in the namespaces property.
    
  */
   
  load: function(){
    var res = {}, namespaces = this.get('namespaces'), nloc, recordTypeGUID;
    var namespace, cur, idx, id, len, data, recordType, pk, indexTmp, dataHashes =[] ; 
    this.dataInMemory={};
    this.recordTypeIndexes={};
    
    nloc = namespaces ? namespaces.length : 0 ;
    while(--nloc >= 0) {
      namespaceStr = namespaces[nloc];
      namespace = SC.objectForPropertyPath(namespaceStr);
      recordType=namespace;
      recordTypeGUID=SC.guidFor(recordType);

      if(recordType.subclassOf) {
        if(!recordType.subclassOf(SC.Record)) recordType = SC.Record;
      } else recordType = SC.Record;
      
      pk = recordType.prototype.primaryKey;
      
      cur = namespace ? namespace.FIXTURES : null ;
      if (!cur) return NO; // Nothing to do

      if (SC.typeOf(cur) === SC.T_ARRAY) {
        len = cur.length ;
        for(idx=0;idx<len;idx++) {
          data = cur[idx] ;
          
          //assume that all fixtures come with a GUID or none
          if(id=data[pk]) {
            recordType.storeKeyFor(id);
          }
          else {
            recordType.storeKeyFor(idx);
            id=idx;
          }
          res[id]=data;
          dataHashes.push(data);
          
          //based on the fixtures data , detect the largest GUID and store it
          // if fixtures need to create a new record it will use this index
          // as  the base to generate new ids. 
          indexTmp = this.recordTypeIndexes[recordTypeGUID];
          id=parseInt(id);
          if(indexTmp){
            if(indexTmp<id){
              this.recordTypeIndexes[recordTypeGUID]=id;
            }
          }else{
            this.recordTypeIndexes[recordTypeGUID]=id;
          }
        }
        store.loadRecords(recordType, dataHashes) ;
        this.dataInMemory[recordTypeGUID]=res;
      }
    }
    rec = null;
    return YES;
  },
  
  /**
     Invoked by the store whenever it needs to retrieve an array of records.
     For the fixtures dataSource params is ignored 
     and all storeKeys for the specific recordType are returned.

     @param {SC.Store} store the requesting store
     @param {SC.Array} the array with the storeKeys to be retrieved
     @returns {SC.Bool} return YES because Fixtures supports the function.  
   */
   
  retrieveRecords: function(store, storeKeys) {
    var len = storeKeys.length, dataHash, storeKey;
    for(i=0; i<len; i++){
      storeKey=storeKeys[i];
      dataHash = this.dataInMemoryforStoreKey(store, storeKey);
      if(dataHash)
        store.dataSourceDidComplete(storeKey, dataHash);
    }
    return YES;    
  },

  /**
    Invoked by the store whenever it needs to retrieve an array of storeKeys
    matching a specific query.  For the fixtures dataSource params is ignored 
    and all storeKeys for the specific recordType are returned.
    
    @param {SC.Store} store the requesting store
    @param {Object} recordType key describing the request, may be SC.Record
    @param {Hash} params optional additonal fetch params
    @returns {SC.Array} result set with storeKeys.  May be sparse.
  */
  fetchRecords: function(store, recordType, params) {
    var array = [] , recordTypeData, i, storeKey;
    if(recordType.subclassOf){
      if(!recordType.subclassOf(SC.Record) && recordType!==SC.Record) return null;
    }
    
    if(!this.dataInMemory) this.load();
    
    recordTypeData = this.dataInMemory[SC.guidFor(recordType)];
  
    for(i in recordTypeData){
      storeKey=recordType.storeKeyFor(i);
      array.push(storeKey);
    }
    return array;
  },
  
  /**
    You cannot cancel an operation using fixtures 
  */
  cancel: function(store, storeKeys) {
    return NO;
  },
  

  // ..........................................................
  // SINGLE RECORD ACTIONS
  // 
  
 
 /**
  Update the dataHash in this.dataInMemory
  */
  
  updateRecord: function(store, storeKey) {
    this.setDataInMemoryforStoreKey(store, storeKey, store.readDataHash(storeKey))
    store.dataSourceDidComplete(storeKey);  
    return YES ;
  },

 
  createRecord: function(store, storeKey) {
    var id, recordType, hash, recordTypeGUID; 
    id=store.idFor(storeKey);
    recordType = store.recordTypeFor(storeKey);
    recordTypeGUID=SC.guidFor(recordType);
    hash = store.readDataHash(storeKey);
    hash[recordType.prototype.primaryKey]=id;
    if(!id) {
      id=recordTypeIndexes[recordTypeGUID]+1;
    }
    this.dataInMemory[recordTypeGUID][id]=hash;
    store.dataSourceDidComplete(storeKey, hash, id);
    
    return YES ;
  },

  destroyRecord: function(store, storeKey) {
    var dim = this.dataInMemoryforStoreKey(store, storeKey);
    dim = null;
    store.dataSourceDidDestroy(storeKey);  
    return YES ;
  },
  
  
  /** @private
    Based on the storeKey it returns the specified dataInMemory
  */
  
  dataInMemoryforStoreKey: function(store, storeKey) {
    var id=store.idFor(storeKey);
    var recordType = store.recordTypeFor(storeKey);
    return this.dataInMemory[SC.guidFor(recordType)][id];
  },
  
  setDataInMemoryforStoreKey: function(store, storeKey, data) {
    var id=store.idFor(storeKey);
    var recordType = store.recordTypeFor(storeKey);
    this.dataInMemory[SC.guidFor(recordType)][id]=data;
    return YES;
  }
});
