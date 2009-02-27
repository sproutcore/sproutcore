// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

require('core') ;
/**
  @class


  The Store is where you can find all of your dataHashes. There can be one
  'Active' record registered at a time. From this active record, you can chain
  dataHashes used for editing, etc. Objects are recordd as JSON and are materialized
  as SproutCore record objects on demand.
  
  By default, a base "SC.Store" is created for your application. If you have more
  than one applications running at once, you can manually create other base dataHashes
  using the isBaseStore property.
  
  The reason to keep seperate data dataHashes for each application is to reduce complexity
  and decrease the chance for data corruption.
  

  When chaining data dataHashes, changes in the child record will be probagated to the 
  parent record and saved if possible (The child record has a newer version of the object).
  
  If you are at the base record, you can specify a parent record that may be a REST or 
  local storage interface for persistant storage.

  @extends SC.Object
  @static
  @since SproutCore 1.0
*/

SC.Store = SC.Object.extend(
/** @scope SC.Store.prototype */ {

  /**
    This is set to YES when there are changes that have not been committed yet.

    @property
    @type {Boolean}
    @default NO
  */
  hasChanges: NO,

  /**
    This is a handle to the parent record that you can chain from. Also, if you're
    a base record, you can specify a parent record that is a handle to perisistant 
    storage.

    @property
    @type {SC.Store}
  */
  parentStore: null,

  /**
    This is the store of dataHashes index by the storeKey. 
    
    This property is NOT unique across stores in a chain until changes are committed.
    
    @property
    @type {Array}
  */
  dataHashes: [],

  /**
    This array contains the revisions for the dataHashes indexed by the storeKey.

    This property is NOT unique across stores in a chain until changes are committed.
    
    @property
    @type {Array}
  */
  revisions: [],

  /**
    This array contains the last revisions for the dataHashes indexed by the storeKey.

    This property is unique across all stores in the application.
    
    @property
    @type {Array}
  */
  latestRevisions: [],

  /**
    This hash contains the storeKeys indexed by the primaryKey guid.

    This property is unique across all stores in the application.
    
    @property
    @type {Array}
  */
  primaryKeyMap: {},

  /**
    This hash contains the primaryKey guids indexed by the storeKey.

    This property is unique across all stores in the application.
    
    @property
    @type {Array}
  */
  storeKeyMap: [],

  /**
    This hash contains the recordTypeKey per dataHash indexed by the storeKey.

    This property is unique across all stores in the application.
    
    @property
    @type {Array}
  */
  recKeyTypeMap: [],

  /**
    This hash contains all the data types stored in the store and within that, there are arrays of storeKeys.

    dataTypeMap: {
      "recordTypeKey":[1,5,10, ... ],
      ...
    }

    This property is unique across all stores in the application.
    
    @property
    @type {Array}
  */
  dataTypeMap: {},
  
  
  instantiatedRecordMap: {
    
    
  },
  
  _compRecordTypeMap: {},
  
  
  recordsQueue: {
    
  },
  
  
  /**
    The childStores property is an array that contains all the child dataHashes for 
    THIS record.
    
    @property
    @type {Array}
  */
  childStores: [],

  /**
    This is the change set that is kept for a record. When the record is committed, this hash is
    used to pass changes down to from child record dataHashes to their parents. 
    
    The changes hash contains the following:
    
      "created", "deleted", and "updated" are Arrays that contain change sets in the form:
    
        {primaryKey: primaryKey, json: json, rev: revision}

      "createdGuids", "deletedGuids", and "updatedGuids" are hashes that contain 
       the index into the arrays based on the data primaryKeyMap.
       
    @property
    @type {Object}
  */
  changes: [],
  
  persistentChanges: {
    created: [],
    updated: [],
    deleted: []
  },
  
  ////////////////////////////////////////////////////////////////////////////////////
  //
  //  Chained Store Handling.
  //
  ////////////////////////////////////////////////////////////////////////////////////
  
  
  /**
    Create a child data record form this instance. Adds it to the list of child dataHashes
    for this record.
    
    @returns {SC.Store} Returns a new store that is child from this one.
  */
  createChainedStore: function() {
    var childStore = SC.Store.create({parentStore: this});
        
    childStore.dataHashes = SC.beget(this.dataHashes);
    childStore.revisions = SC.beget(this.revisions);

    return childStore;
  },
  
  /**
    Given a new childStore, add it to this store.

    @param {SC.Store} childStore The child record that is being added.

    @returns {Boolean} Returns YES if the operation was successful.  
  */
  addStore: function(childStore) {
    if(childStore) {
      this.childStores.removeObject(childStore);
      childStore.set('parentStore', this);
      return YES;
    }
    return NO;
  },

  /**
    Remove a child record from its parent.
    
    @returns {Boolean} Returns YES if the operation was successful.  
  */
  removeFromParent: function() {
    
    // I think this may something that should destroy the record, we don't want dangling dataHashes do we?
    var parentStore = this.get('parentStore');
    if(parentStore) {
      return parentStore.removeChild(this);
    }
    return NO;
  },

  /**
    Remove a given child record from its parent.

    @param {SC.Store} childStore The child record that is being removed.

    @returns {Boolean} Returns YES if the operation was successful.  
  */
  removeStore: function(childStore) {
    if(childStore) {
      this.childStores.removeObject(childStore);
      childStore.set('parentStore', null);
      return YES;
    }
    return NO;
  },
  
  /**
    Given a childStore, handle the changes that have accumulated during editing, etc.
  
    @returns {Boolean} Returns YES if the commit is successful.
  */
  handleChangesFromStore: function(childStore)
  {
    if(childStore === undefined) return NO;

    var isSuccess = YES;

    // Get this store's properties.
    var dataHashes = this.dataHashes;
    var latestRevisions = this.latestRevisions;
    var revisions = this.revisions;
    var instantiatedRecordMap = this.instantiatedRecordMap;

    // Get the childStore's properties.
    var changes = childStore.changes;
    var child_dataHashes = childStore.dataHashes;
    var child_revisions = childStore.revisions;

    // Copy over changes from the childStore to this store.
    for(var i=0, iLen=changes.length; i<iLen; i++) {
      var storeKey = changes[i];
      var rev = child_revisions[storeKey];
      
      // Only do the copy if the revision in childStore is greater than this store's 
      // revision or it is equal to the latest revision.
      if(rev >= revisions[storeKey] && rev === latestRevisions[storeKey]) {
        dataHashes[storeKey] = child_dataHashes[storeKey];
        revisions[storeKey] = rev;
        
        
        
      } else {
        isSuccess = NO;
      }
    }

    // Reset the childStore so that it matches up with this store.
    childStore.reset();
    
    return isSuccess;
  },

  /**
    Reset a store's properties to match the its parent.
  */
  reset: function() {
    var parentStore = this.get('parentStore');
    if(parentStore && !parentStore.get('isPersistent')) {
      this.dataHashes = SC.beget(parentStore.dataHashes);
      this.revisions = SC.beget(parentStore.revisions);
    }
    childStore.changes = []; 
    childStore.persistentChanges = {
      created: [], updated: [], deleted: []
    };
    this.set('hasChanges', NO);
  },
  
  /**
    Propagate this store's changes to it's parent.
  */
  commitChanges: function() {
    return this.get('parentStore').handleChangesFromStore(this);
  },

  /**
    Discard the changes made to this store and reset the store.
  */
  discardChanges: function() {
    return this.reset();
  },

  
  ////////////////////////////////////////////////////////////////////////////////////
  //
  //  Handling of dataHashes.
  //
  ////////////////////////////////////////////////////////////////////////////////////
  
  /**
    Creates or updates the store's dataHashes. Does not manipulate SC.Record instances.
    
    dataArr (required) 
      Array of JSON-compatible hashes.
    
    recordType (optional) 
      The SC.Record extended class that you want to use or an array of SC.Record classes that match the dataArr item per item.
      If none is specified, it is assumed to be a base SC.Record.
    
    primaryKey  (optional) 
      This is the primaryKey key for the data hash, if it is not passed in, then 'guid' is used.

    disregardPrimaryKeys  (optional) 
      If YES, no primaryKey relation is created, this is used when creating new records in the client.
    
    @param {Array} dataArr (required) Array of JSON-compatible hashes.
    @param {SC.Record|Array} recordType (optional) The SC.Record extended class that you want to use or an array of SC.Record classes that match the dataArr item per item.
    @param {String} primaryKey  (optional) This is the primaryKey key for the data hash, if it is not passed in, then 'guid' is used.
    @param {Boolean} disregardPrimaryKeys  (optional) If YES, no primaryKey relation is created, this is used when creating new records in the client.

    @returns {Array} Returns an array containing the storeKeys that were updated or created.
  */  
  updateDataHashes: function(dataArr, recordType, primaryKey, disregardPrimaryKeys) {

    // One last sanity check to see if the hash is in the proper format.
    if(typeof dataArr !== 'object') {
      return null;
    }

    var dataHashes = this.dataHashes;
    var primaryKeyMap = this.primaryKeyMap;
    var revisions = this.revisions;
    var latestRevisions = this.latestRevisions;
    var changes = this.changes;
    var retrievedRecords = [];
    var recordsQueue = this.recordsQueue;
    var storeKeyMap = this.storeKeyMap;
    var recKeyTypeMap = this.recKeyTypeMap;
    var dataTypeMap = this.dataTypeMap;
    var recType, recTypeKey;
    var pUpdated = this.persistentChanges.updated;
    var ret = [];

    // Disambiguate what recordType and primaryKey to use.
    if(!recordType) recordType = SC.Record;

    // If you pass in an array of record types, then this is set to YES and saved for later use.
    var useRecordTypeArray = (recordType.length > 1 && typeof recordType !== 'function');
    if(!useRecordTypeArray) {
      recTypeKey = SC.guidFor(recordType);
      recType = recordType;
    }
    if(!primaryKey && !disregardPrimaryKeys) {
        primaryKey = recordType.primaryKey();
    }

    SC.Benchmark.start('updateRecords: loop');

    // Iterate per record in the data array and either update an existing dataHash or create a new dataHash.
    for(var i=0, iLen=dataArr.length; i<iLen; i++) {

      SC.Benchmark.start('updateRecord');

      var data = dataArr[i];
      var rec, rev, storeKey, guid, error;

      // If you are importing an array of record types, then grab it each iteration.
      if(useRecordTypeArray) {
        recType = recordType[i];
        recTypeKey = SC.guidFor(recType);
      } 

      // If you want to disregard the primaryKeys, generate one blindly.
      if(disregardPrimaryKeys) {
        storeKey = this._generateStoreKey();
        error = (!recType) ? 'type' : null;

        // Otherwise, grab the guid and relate it to a storeKey.
      } else {
        guid = data[primaryKey];
        storeKey = this.storeKeyFor(guid);
        if(!primaryKey) {
          error = (!guid && !recType) ? 'guid and type' : (!primaryKey) ? 'guid' : (!recType) ? 'type' : null;
        }
      }
      
      if(error) {
        console.error("SC.Store: Insertion of record failed, missing %@.".fmt(error));
        continue;
      }
      
      // If the storeKey is already set, then update the dataHash and increment the revision.
      if(dataHashes[storeKey] !== undefined) {
        rev = revisions[storeKey] = (revisions[storeKey]+1);
        if(latestRevisions[storeKey] < rev) latestRevisions[storeKey] = rev;
        dataHashes[storeKey] = data;
        pUpdated.push(storeKey);

      // If there is no storeKey, then create a new dataHash and add all the meta data.
      } else {

        // If you need to add the primaryKey info, do it. Otherwise, disregard this.
        if(!disregardPrimaryKeys) {
          primaryKeyMap[guid] = storeKey;
          storeKeyMap[storeKey] = guid;
        }

        // Set the meta data.
        latestRevisions[storeKey] = 0;
        revisions[storeKey] = 0;
        dataHashes[storeKey] = data;
        recKeyTypeMap[storeKey] = recType;
        if(!dataTypeMap[recTypeKey]) dataTypeMap[recTypeKey] = [];
        dataTypeMap[recTypeKey].push(storeKey);
      }

      // Push the created or updated storeKeys so that they are known during the commit process.
      changes.push(storeKey);
      ret.push(storeKey);
     
      // If the storeKey is regsitered as being an outstanding record from the server, save it so it can be handled.
      if(!disregardPrimaryKeys && recordsQueue[storeKey] !== undefined) {
        retrievedRecords.push(recordsQueue[storeKey]);
      }

      SC.Benchmark.end('updateRecord');
    }

      SC.Benchmark.end('updateRecords: loop');

      // If there are changes, mark the store to have changes.
      this.set('hasChanges', (changes.length > 0));
    
      // If thera retrieved records that need to be marked as such, invoke that operation so they can be cached.
      if(retrievedRecords.length > 0) {
        this._retrivedRecords = retrievedRecords; 
        this.invokeOnce(this._didRetrieveRecords);
      }
    
    SC.Benchmark.end('updateRecords: post');

    // Return the updated/changes storeKeys.
    return ret;
  },
  
  /**
    Given array of storeKeys, delete them from the store.
    
    @param {Array} data Array of storeKeys.
    
    @returns {Boolean} Returns YES if the record operation was successful.
  */
  removeDataHashes: function(storeKeys)
  {
    var changes = this.changes;
    var primaryKeyMap = this.primaryKeyMap;
    var dataHashes = this.dataHashes;
    var latestRevisions = this.latestRevisions;
    var revisions = this.revisions;
    var dataTypeMap = this.dataTypeMap;
    
    for(var i=0, iLen=storeKeys.length; i<iLen; i++) {

      var storeKey = storeKeys[i];
      var dataHash = dataHashes[storeKey];

      if(dataHash !== undefined)
      {
        var rev = latestRevisions[storeKey] = revisions[storeKey] = revisions[storeKey]+1;
        if(changes.indexOf(storeKey) === -1) {
          changes.push(storeKey);
        }
        dataHashes[storeKey] = null;
        dataTypeMap.removeObject(storeKey);
      } else {
        isSuccess = NO;
      }
    }
    this.set('hasChanges', (changes.length > 0));
    return isSuccess;
  },
  

  getWriteableDataHash: function(storeKey) {
    var ret = this.getDataHash(storeKey);
    if(ret === this.get('parentStore').dataHashes[storeKey])
    {
      ret = this.dataHashes[storeKey] = SC.clone(ret);
    }
    return ret;
  },

  getDataHash: function(storeKey)
  {
    if(storeKey) {
      return this.dataHashes[storeKey];
    }
    return null;
  },
  
  ////////////////////////////////////////////////////////////////////////////////////
  //
  //  Handling of Records.
  //
  ////////////////////////////////////////////////////////////////////////////////////

  
  /**
    Creates or updates the store's dataHashes then returns an array of SC.Record instances.
    
    dataArr (required) 
      Array of JSON-compatible hashes.
    
    recordType (optional) 
      The SC.Record extended class that you want to use or an array of SC.Record classes that match the dataArr item per item.
      If none is specified, it is assumed to be a base SC.Record.
    
    primaryKey  (optional) 
      This is the primaryKey key for the data hash, if it is not passed in, then 'guid' is used.
    
    @param {Array} dataArr (required) Array of JSON-compatible hashes.
    @param {SC.Record|Array} recordType (optional) The SC.Record extended class that you want to use or an array of SC.Record classes that match the dataArr item per item.
    @param {String} primaryKey  (optional) This is the primaryKey key for the data hash, if it is not passed in, then 'guid' is used.

    @returns {Array} Returns an array containing the records that were created.
  */
  createRecords: function(dataHashes, recordType, primaryKey)
  {
    // If dataHashes are not set correctly, return null.
    if(!dataHashes || typeof dataHashes !== 'object') return null;

    // If no recordType is set, assume SC.Record.
    if(!recordType) recordType = SC.Record;

    var ret = null;
    
    // Keep track of the new records because they should be pushed back to the persistent store.
    var pCreated = this.persistentChanges.created;

    // Create the data hashes.
    var createStoreKeys = this.updateDataHashes(dataHashes, recordType, primaryKey, YES);

    // If it was sucessful and there are storeKeys returned, materialize the records and return them.
    if(createStoreKeys) {
      ret = [];
      for(var i=0, iLen = createStoreKeys.length; i<iLen; i++) {
        var storeKey = createStoreKeys[i];
        ret.push(this._materializeRecord(storeKey, NO)); 
        pCreated.push(storeKey);
      }
    }
    return ret;
  },
  
  /**
    This is used for bulk loading from a persistent store. 
    
    It will update or create new records but it will then clear the changeset immediately 
    since there is nothing to commit after a load from a persistent store. 
    
    dataArr (required) 
      Array of JSON-compatible hashes.
    
    recordType (optional) 
      The SC.Record extended class that you want to use or an array of SC.Record classes that match the dataArr item per item.
      If none is specified, it is assumed to be a base SC.Record.
    
    primaryKey  (optional) 
      This is the primaryKey key for the data hash, if it is not passed in, then 'guid' is used.
    
    @param {Array} dataArr (required) Array of JSON-compatible hashes.
    @param {SC.Record|Array} recordType (optional) The SC.Record extended class that you want to use or an array of SC.Record classes that match the dataArr item per item.
    @param {String} primaryKey  (optional) This is the primaryKey key for the data hash, if it is not passed in, then 'guid' is used.

    @returns {Array} Returns YES if the record operation was successful.
  */
  loadRecords: function(dataArr, recordType, primaryKey) {
    var parentStore = this.get('parentStore');
    
    var ret = null;
    if(parentStore && parentStore.get('isPersistent')) {
      ret = this.updateDataHashes(dataArr, recordType, primaryKey);
      this.changes = [];
    }
    return ret;
  },

  /**
    Given an array of records, delete them and when the store is commmited, probagate to the persistent store.
  
    @param {Array} records Array of SC.Record instances.

    @returns {Boolean} Returns YES if the delete operation is successful.
  */
  destroyRecords: function(records) {
    return this._removeRecords(records, YES);
  },
  
  /**
    Given an array of records, unload them from the in memory only.
  
    @param {Array} records Array of SC.Record instances.

    @returns {Boolean} Returns YES if the unload operation is successful.
  */
  unloadRecords: function(records) {
    return this._removeRecords(records, NO);
  },
  
  /**
    Given an array of records, make them editable by copying the data hash.
  
    @param {Array} records Array of SC.Record instances.
  */
  makeRecordsEditable: function(records) {
    if(!records) return;
    for(var i=0, iLen=records.length; i<iLen; i++) {
      record._atttributes = this.getWriteableDataHash(this.storeKeyFor(record.get(record.primaryKey())));
      record.set('isEditable', YES);
    }
  },
  
  /**
    Given an array of records, refresh them from their persistent store.
  
    @param {Array} records Array of SC.Record instances.
  */
  refreshRecords: function(records) {
    var parentStore = this.get('parentStore');
    if(records && parentStore) {
      return parentStore.refreshRecords(records);
    }
  },
  
  /**
    This function is called by SC.Record objects to update itself.

    @param {SC.Record} record The record that is being updated.
  */
  recordDidChange: function(record) {
    if(record) {
      var primaryKey = record.primaryKey();
      var recordType = record.recordType();
      var storeKey = this.storeKeyFor(record.get(primaryKey));
      this.updateDataHashes([record._attributes], recordType, primaryKey, NO);
    }
  },
  
  /**
    Given a guid and record type, retrieve it from the parent store or persistent store.
  
    @param {String} guid The guid for the desired record.
    @param {SC.Record} recordType The record type.

    @returns {SC.Record} Returns a record instance.
  */
  retrieveRecordForGuid: function(guid, recordType) {
    return this.retrieveRecordForGuid(guid, recordType);
  },

  didRetrieveRecords: function() {
    
    var records = this._retrivedRecords;

    if(!records || !records.length) return NO;
    
    var recordsQueue = this.recordsQueue;
    
    for(var i=0, iLen=records.length; i<iLen; i++) {
      var record = records[i];
      var guid = record.get(record.primaryKey());
      var storeKey = this.storeKeyFor(guid);
      var recTypeKey = SC.guidFor(this.recKeyTypeMap[storeKey]);
      if(primaryKey && recType) {
        record._attributes = this.getDataHash(guid);
        this.instantiatedRecordMap[recTypeKey][storeKey] = record;
        recordQueue.removeObject(guid);
        record.set('status', RECORD_LOADED);
      }
    }
  },

  _materializeRecord: function(storeKey) {
    var ret = null;
    if(storeKey !== undefined) {
      var dataHash = this.getDataHash(storeKey);
      var recType = this.recKeyTypeMap[storeKey];
      var recTypeKey = SC.guidFor(recType);
      if(dataHash && recType) {
        if(!this.instantiatedRecordMap[recTypeKey]) {
          this.instantiatedRecordMap[recTypeKey] = [];
        }
        if(this.instantiatedRecordMap[recTypeKey][storeKey]) {
          ret = this.instantiatedRecordMap[recTypeKey][storeKey];
        } else {
          ret = this.instantiatedRecordMap[recTypeKey][storeKey] = recType.create({
            _attributes: dataHash,
            _storeKey: storeKey,
            parentStore: this,
            status: RECORD_LOADED
          });
        }
      }
    } 
    return ret;
  },

  _removeRecords: function(records, removeDataHashes) {
    if(!records) return;
    var storeKeys = [];
    var pDeleted = this.persistentChanges.deleted;
    
    for(var i=0, iLen=records.length; i<iLen; i++) {
      var rec = records[i];
      var storeKey = this.storeKeyFor(rec.get(rec.primaryKey()));
      if(removeDataHashes) {
        pDeleted.push(storeKey);
      }
      storeKeys.push(storeKey);
    }
    return this.removeDataHashes(storeKeys);
  },
  
  ////////////////////////////////////////////////////////////////////////////////////
  //
  //  Finding records.
  //
  ////////////////////////////////////////////////////////////////////////////////////

  find: function(guid, recordType)
  {
    var storeKey = this.primaryKeyMap[guid];
    var rec = null;
    if(storeKey) {
      rec = this._materializeRecord(storeKey);
    } else {
      var parentStore = this.get('parentStore');
      if(guid && parentStore) {
        recordType = parentStore.retrieveRecordForGuid(guid, recordType);
        if(recordType) {
          rec = recordType.create({
            _attributes: {},
            _storeKey: storeKey,
            parentStore: this, 
            status: RECORD_LOADING,
            newRecord: YES
          });
          this.recordsQueue[storeKey] = rec;
        }
      }
    }
    return rec;
  },
  
  findAll: function(filter, recordType)
  {
    return [];
  },
  
  
  ////////////////////////////////////////////////////////////////////////////////////
  //
  //  Primary Key convenience methods.
  //
  ////////////////////////////////////////////////////////////////////////////////////

  /** 
    Given a storeKey, return the primaryKey.
  
    @returns {String} The primaryKey guid.
  */
  primaryKeyFor: function(storeKey) {
    return this.storeKeyMap[storeKey];
  },
  
  /** 
    Given a guid, create a storeKey or return an existing one for the guid.
  
    @returns {Integer} The storeKey.
  */
  storeKeyFor: function(guid) {
    var storeKey = this.primaryKeyMap[guid];
    if(!storeKey) {
      storeKey = this.primaryKeyMap[guid] = this._generateStoreKey(); 
    }
    return storeKey;
  },
  
  /** 
    Given a storeKey and a NEW guid, migrate the data to the new guid.
  
    @returns {Integer} The storeKey.
  */
  replaceGuid: function(storeKey, guid) {
    if(storeKey) {
      this.stokeKeyMap[storeKey] = guid;
      this.primaryKeyMap[guid] = storeKey;
    }
  },

  /**
    Generate a new unique storekey.

    @private
    @returns {Integer} A new storeKey.
  */
  _generateStoreKey: function() {
    var storeKey = this.nextStoreIndex;
    this.nextStoreIndex++;
    return storeKey;
  }
}) ;


SC.Store._getDefaultStore = function()
{
  var store = this._store;
  if(!store) {
    this._store = store = SC.Store.create();
  }
  return store;
};

SC.Store.updateRecords = function(/*attrs from old api*/)
{
  return this._getDefaultStore().updateRecords(/*asd*/);
};

SC.Store.find = function(primaryKey)
{
  return this._getDefaultStore().find(primaryKey);
};

SC.Store.findAll = function(query)
{
  return this._getDefaultStore().findAll(query);
};

SC.Store.prototype.addDataHash = SC.Store.prototype.updateDataHash;
SC.Store.prototype.addDataHashes = SC.Store.prototype.updateDataHashes;


SC.Store.prototype.nextStoreIndex = 0;
SC.Store.prototype.dataHashesLen = 0;
