// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/**
  @class


  The Store is where you can find all of your dataHashes. Stores can be 
  chained for editing purposes and committed back one chain level at a time 
  all the way back to the perisistent store.
  
  Data objects are recordd as JSON and are materialized as SproutCore record
  objects on demand.

  When chaining data dataHashes, changes in the child record will be 
  probagated to the parent record and saved if possible (The child record has
  a newer version of the object).
  
  If you are at the base store, you can specify a parentStore that may be a 
  REST or local storage interface for persistant storage.

  @extends SC.Object
  @static
  @since SproutCore 1.0
*/

SC.Store = SC.Object.extend(
/** @scope SC.Store.prototype */ {

  /**
    This is set to YES when there are changes that have not been committed 
    yet.

    @property
    @type {Boolean}
    @default NO
  */
  hasChanges: NO,

  /**
    This is a handle to the parent record that you can chain from. Also, if
    you're a base record, you can specify a parent record that is a handle 
    to perisistant storage.

    @property
    @type {SC.Store}
  */
  parentStore: null,

  // ..........................................................
  // INTERNAL DATA STRUCTURES 
  // 
  
  /** @private
    This is the store of dataHashes index by the storeKey. 
    
    This property is shared by a store and any child stores until you start
    to make edits to it.
    
    @property {Array}
  */
  dataHashes: {},

  /** @private 
    When data hash attributes are retrieved through a record, they are 
    massaged into the proper type and stored here. 
    
    This property is shared by a store and its child stores until you make
    edits to it.
    
    @property {Array}
  */
  cachedAttributes: {},

  /** @private
    This array contains the revisions for the dataHashes indexed by the 
    storeKey.

    This property is shared by a store and its child stores until you make
    edits to it.
    
    @property {Array}
  */
  revisions: [],

  /** @private
    This hash contains the storeKeys indexed by the primaryKey guid.

    This property is shared by all store instances.
    
    @property
    @type {Array}
  */
  primaryKeyMap: {},

  /** @private
    This hash contains the primaryKey guids indexed by the storeKey.

    This property is shared by all store instances.
    
    @property {Array}
  */
  storeKeyMap: {},

  /**
    This hash contains the recordTypeKey per dataHash indexed by the storeKey.

    This property is shared by all store instances.
    
    @property {Array}
  */
  recKeyTypeMap: {},

  /** @private
    This hash contains all the data types stored in the store and within that, 
    there are arrays of storeKeys.

    dataTypeMap: {
      "recordTypeKey":[1,5,10, ... ],
      ...
    }

    This property is shared by all store instances.
    
    @property {Object}
  */
  dataTypeMap: {},

  compTypeMap: {},
  
  /** @private
    This hash contains all the instantiated records arranged by type.

    instantiatedRecordMap: {
      "recordTypeKey":[SC.Record, .... ],
      ...
    }

    This property is NOT shared by store instances.
    
    @property {Object}
  */
  instantiatedRecordMap: {},
  
  /** @private
    This is the queue of records that need to be retrieved from the server.
    Records in this queue will be notified automatically when the data hash
    for the record is added to the Store.

    This property is shared by all store instances.
    
    @property {Object}
  */
  retrievedRecQueue: [],
  
  
  /**
    The childStores property is an array that contains all the child 
    stores for THIS store.
    
    @property {Array}
  */
  childStores: [],

  /**
    This is the change set that is kept for a store. When the record is 
    committed, this hash is used to pass changes down to from child record 
    dataHashes to their parents. 
    
    The changes array contains storeKeys that have changed. 
    
    @property
    @type {Array}
  */
  changes: [],
  
  /**
    This is the change set that is kept for a store and is read by the 
    persistent store. When the record is committed, this hash is used to pass 
    changes down to from child record dataHashes to their parents. 
    
    The changes object contains arrays of storeKeys that have changes. 
    
    persistentChanges: {
      created: [1,2,4,...],
      updated: [],
      deleted: [5,7...]
    },

    @property
    @type {Object}
  */
  persistentChanges: null,
  
  /**
    All stores that are not persistent stores are transient.  This means the
    contents of this store will disappear when you reload the page.
  
    @property {Boolean}
  */
  isTransient: YES,
  
  // ..........................................................
  // STORE CHAINING
  // 
  
  /**
    Create a child data record form this instance. Adds it to the list of 
    child dataHashes for this record.
    
    @returns {SC.Store} Returns a new store that is child from this one.
  */
  createChainedStore: function() {
    var childStore = SC.Store.create({parentStore: this});
    this.childStores.push(childStore);
    return childStore;
  },
  
  /**
    Remove a child record from its parent.
    
    @returns {Boolean} Returns YES if the operation was successful.  
  */
  removeFromParent: function() {
    
    // I think this may something that should destroy the record, we don't 
    // want dangling dataHashes do we?
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
    Given a childStore, handle the changes that have accumulated during 
    editing, etc. This is called on a parent store by a child store which 
    passes itself in as a parameter.
  
    @returns {Boolean} Returns YES if the commit is successful.
  */
  commitChangesFromStore: function(childStore)
  {
    if(childStore === undefined) return NO;

    var isSuccess = YES;

    // Get this store's properties.
    var dataHashes = this.dataHashes;
    var cachedAttributes = this.cachedAttributes;
    var revisions = this.revisions;
    var persistentChanges = this.persistentChanges;

    var recKeyTypeMap = this.recKeyTypeMap;
    var instantiatedRecordMap = this.instantiatedRecordMap;

    // Get the childStore's properties.
    var changes = childStore.changes;
    var child_dataHashes = childStore.dataHashes;
    var child_revisions = childStore.revisions;
    var child_persistentChanges = childStore.persistentChanges;
    var child_instantiatedRecordMap = childStore.instantiatedRecordMap;

    // Copy over changes from the childStore to this store.
    for(var i=0, iLen=changes.length; i<iLen; i++) {
      var storeKey = changes[i];
      var rev = child_revisions[storeKey];
      
      // Only do the copy if the revision in childStore is greater than this 
      // store's revision or it is equal to the latest revision.
      if(revisions[storeKey] === undefined || rev >= revisions[storeKey]) {
        var dataHash = child_dataHashes[storeKey];
        revisions[storeKey] = rev;
        dataHashes[storeKey] = dataHash;

        delete cachedAttributes[storeKey]; 
        var recType = recKeyTypeMap[storeKey];
        var recTypeKey = SC.guidFor(recType);
        if(child_instantiatedRecordMap[recTypeKey] && 
           child_instantiatedRecordMap[recTypeKey][storeKey]) {
          if(!instantiatedRecordMap[recTypeKey]) {
            instantiatedRecordMap[recTypeKey] = [];
          }
          if(!instantiatedRecordMap[recTypeKey][storeKey]) {
            instantiatedRecordMap[recTypeKey][storeKey] = 
                      child_instantiatedRecordMap[recTypeKey][storeKey];
          }
        }
      } else {
        isSuccess = NO;
      }
    }

    // Copy over the persisted changes.
    persistentChanges.created = 
      persistentChanges.created.concat(child_persistentChanges.created);
    persistentChanges.updated = 
      persistentChanges.updated.concat(child_persistentChanges.updated);
    persistentChanges.deleted = 
      persistentChanges.deleted.concat(child_persistentChanges.deleted);
    
    return isSuccess;
  },

  /**
    Reset a store's properties to match the its parent.
  */
  reset: function() {
    
    var parentStore = this.get('parentStore');
    if(parentStore && parentStore.get('isTransient')) {
      this.dataHashes = SC.beget(parentStore.dataHashes);
      this.revisions = SC.clone(parentStore.revisions);
    }

    this.persistentChanges = {
      created: [], updated: [], deleted: []
    };
    this.changes = []; 

    var cachedAttributes = this.cachedAttributes;
    var instantiatedRecordMap = this.instantiatedRecordMap;

    var dataHashes = this.dataHashes;
    for(var key in instantiatedRecordMap)
    {
      var typeArray = instantiatedRecordMap[key];
      for(var k in typeArray)
      {
        delete cachedAttributes[typeArray[k].storeKey];
      }
    }
    
    this.set('hasChanges', NO);
  },
  
  /**
    Propagate this store's changes to it's parent.

    @returns {Boolean} Returns YES if the operation was successful otherwise, 
                       returns NO.
  */
  commitChanges: function() {
    var parentStore = this.get('parentStore');
    var isSuccess = NO;
    if(parentStore) {
      
      // Reset this store so that it matches up with its parentStore.
      isSuccess = parentStore.commitChangesFromStore(this);
      this.reset();

    }
    return isSuccess;
  },

  /**
    Discard the changes made to this store and reset the store.
    
    @returns {Boolean} Returns YES if the operation was successful otherwise, 
                       returns NO.
  */
  discardChanges: function() {
    this.reset();
    
    var parentStore = this.get('parentStore');
    if (!parentStore || !parentStore.get('isTransient')) {
      throw("SC.Store: discardChanges cannot be used on a store that is chained to a persistent store");
    }
    return YES;
  },

  // ..........................................................
  // CORE DATA HASH API
  // 
  
  /**
    Creates or updates the store's dataHashes. Does not manipulate SC.Record 
    instances.
    
    @param {Array} dataArr (required) Array of JSON-compatible hashes.
    @param {SC.Record|Array} recordType (optional) The SC.Record extended class that you want to use or an array of SC.Record classes that match the dataArr item per item.
    @param {String} primaryKey  (optional) This is the primaryKey key for the data hash, if it is not passed in, then 'guid' is used. If set to NO, no primaryKey is used.
    @param {Boolean} isLoadAction  (optional) If set to YES, then don't record changes.

    @returns {Array} Returns an array containing the storeKeys that were updated or created.
  */  
  updateDataHashes: function(dataArr, recordType, primaryKey, isLoadAction) {

    // One last sanity check to see if the hash is in the proper format.
    if(SC.typeOf(dataArr) !== SC.T_ARRAY) {
      return null;
    }

    var dataHashes = this.dataHashes;
    var cachedAttributes = this.cachedAttributes;
    var primaryKeyMap = this.primaryKeyMap;
    var revisions = this.revisions;
    var changes = this.changes;
    var retrievedRecords = [];
    var retrievedRecQueue = this.retrievedRecQueue;
    var storeKeyMap = this.storeKeyMap;
    var recKeyTypeMap = this.recKeyTypeMap;
    var dataTypeMap = this.dataTypeMap;
    var recType, recTypeKey;
    var pUpdated = this.persistentChanges.updated;
    var recordTypeIsArray = NO;
    var ret = [];
    var disregardPrimaryKeys = (primaryKey === NO);

    // Disambiguate what recordType and primaryKey to use.
    if(!recordType) recordType = SC.Record;

    // If you pass in an array of record types, then this is set to YES 
    // and saved for later use.
    recordTypeIsArray = SC.typeOf(recordType) === SC.T_ARRAY; 
    if (!recordTypeIsArray) {
      recTypeKey = SC.guidFor(recordType);
      recType = recordType;
    }
    
    // If the primaryKey is undefined, default to get the key from the 
    // record type.
    if(!recordTypeIsArray && primaryKey === undefined) {
        // Default to 'guid' if not set.
        primaryKey = recType.prototype.primaryKey;
        if(!primaryKey) primaryKey = 'guid';
    }

    SC.Benchmark.start('updateRecords: loop');

    // Iterate per record in the data array and either update an existing 
    // dataHash or create a new dataHash.
    for(var i=0, iLen=dataArr.length; i<iLen; i++) {

      SC.Benchmark.start('updateRecord');

      var data = dataArr[i];
      var rec, rev, storeKey, guid, error;

      // If you are importing an array of record types, then grab it each 
      // iteration.
      if(recordTypeIsArray) {
        recType = recordType[i];
        recTypeKey = SC.guidFor(recType);
        primaryKey = recType.primaryKey;

        // Default to 'guid' if it is not set.
        if(!primaryKey) {
          primaryKey = 'guid';
        }
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
          error = (!guid && !recType) ? 'guid and type' : (!primaryKey) ? 
                  'guid' : (!recType) ? 'type' : null;
        }
      }
      
      if(error) {
        throw "SC.Store: Insertion of record failed, missing %@.".fmt(error) ;
      }
      
      // If the storeKey is already set, then update the dataHash and 
      // increment the revision.
      if(dataHashes[storeKey] !== undefined) {
        rev = revisions[storeKey] = (revisions[storeKey]+1);
        dataHashes[storeKey] = data;
        if(!isLoadAction) {
          pUpdated.push(storeKey);
        }

      // If there is no storeKey, then create a new dataHash and add all 
      // the meta data.
      } else {

        // If you need to add the primaryKey info, do it. Otherwise, 
        // disregard this.
        if(!disregardPrimaryKeys) {
          primaryKeyMap[guid] = storeKey;
          storeKeyMap[storeKey] = guid;
        }

        // Set the meta data.
        revisions[storeKey] = 0;
        dataHashes[storeKey] = data;
        recKeyTypeMap[storeKey] = recType;
        if(!dataTypeMap[recTypeKey]) dataTypeMap[recTypeKey] = [];
        dataTypeMap[recTypeKey].push(storeKey);
      }
      delete cachedAttributes[storeKey];

      // Push the created or updated storeKeys so that they are known during 
      // the commit process.
      if(!isLoadAction) {
        changes.push(storeKey);
      }
      
      ret.push(storeKey);
     
      // If the storeKey is regsitered as being an outstanding record from the
      // server, save it so it can be handled.
      if(retrievedRecQueue.indexOf(storeKey) !== -1) {
        retrievedRecords.push(storeKey);
      }

      SC.Benchmark.end('updateRecord');
    }

      SC.Benchmark.end('updateRecords: loop');

      // If there are changes, mark the store to have changes.
      this.set('hasChanges', (changes.length > 0));
    
      // If there are retrieved records that need to be marked as such, invoke
      // that operation so they can be cached.
      if(retrievedRecords.length > 0) {
        this._didRetrieveRecords(retrievedRecords);
      }
    
    // Return the updated/changed storeKeys.
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
    var revisions = this.revisions;
    var dataTypeMap = this.dataTypeMap;
    var recKeyTypeMap = this.recKeyTypeMap;
    var isSuccess = YES;
    
    for(var i=0, iLen=storeKeys.length; i<iLen; i++) {

      var storeKey = storeKeys[i];
      var dataHash = dataHashes[storeKey];

      if(dataHash !== undefined)
      {
        var rev = (revisions[storeKey] = revisions[storeKey]+1);
        if(changes.indexOf(storeKey) === -1) {
          changes.push(storeKey);
        }
        dataHashes[storeKey] = null;
        var key = SC.guidFor(recKeyTypeMap[storeKey]);
        dataTypeMap[key].removeObject(storeKey);
        recKeyTypeMap[storeKey] = null;
      } else {
        isSuccess = NO;
      }
    }
    this.set('hasChanges', (changes.length > 0));
    return isSuccess;
  },

  /** 
    Given a storeKey, return a writeable copy of the dataHash.
    
    @param {Integer} storeKey The dataHash's storeKey.
    
    @returns {Object} Returns a new instance of the dataHash.
  */
  getWriteableDataHash: function(storeKey) {
    // if the data hash is the same as the parent store, then clone it first.
    var ret = this.dataHashes[storeKey];
    if (!ret) return undefined ; // nothing to do.
    
    var pstore = this.get('parentStore');
    if (pstore && pstore.get('isTransient')) {
      if (ret === pstore.dataHashes[storeKey]) {
        ret = this.dataHashes[storeKey] = SC.clone(ret) ;
      }
    }
    return ret;
  },

  /**
    Returns the passed attribute, cloning it first if needed so that you can
    modify it.  Use this method to modify arrays and hash values.
    
    @param {Integer} storeKey the dataHash store key
    @param {String}  key the attribute 
    @returns {Object} the editable attribute or undefined
  */
  getWriteableAttribute: function(storeKey, key) {
    // if the data hash is the same as the parent store, then clone it first.
    var attrs = this.dataHashes[storeKey], ret, pstore, rtype;
    if (!attrs) return undefined ; // nothing to do.
    
    pstore = this.get('parentStore');
    ret = attrs[key];
    if (pstore && !pstore.get('isTransient')) {

      // clone attrs if needed first to make them writeable
      if (attrs === pstore.dataHashes[storeKey]) {
        attrs = this.dataHashes[storeKey] = SC.clone(ret) ;
      }
      
      // clone ret value if needed to make it writeable also
      rtype = SC.typeOf(ret);
      if (rtype === SC.T_ARRAY) {
        ret = attrs[key] = ret.slice();
      } else if (rtype === SC.T_HASH) {
        ret = attrs[key] = SC.clone(ret) ;
      }
    }
    
    return ret;
  },
  
  /** 
    Given a storeKey, returns the dataHash.
    
    @param {Integer} storeKey The dataHash's storeKey.
    
    @returns {Object} Returns the dataHash or null.
  */
  getDataHash: function(storeKey) {
    // since the dataHashes property may have the parent store dataHashes as
    // a prototype, we set the data hash to make it independent of the 
    // paran dataHash when you get the hash.
    return storeKey ? (this.dataHashes[storeKey] = this.dataHashes[storeKey]) : null;
  },
  
  // ..........................................................
  // RECORDS API
  // 
  
  /**
    Creates the store's dataHashes then returns an array of SC.Record instances.
        
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
    
    // Keep track of the new records because they should be pushed back to the
    // persistent store.
    var pCreated = this.persistentChanges.created;

    // Create the data hashes.
    var createdStoreKeys = 
      this.updateDataHashes(dataHashes, recordType, NO, NO);

    // If it was successful and there are storeKeys returned, materialize the 
    // records and return them.
    if(createdStoreKeys) {
      ret = [];
      for(var i=0, iLen = createdStoreKeys.length; i<iLen; i++) {
        var storeKey = createdStoreKeys[i];
        ret.push(this.materializeRecord(storeKey, YES)); 
        pCreated.push(storeKey);
      }
    }
    return ret;
  },
  
  /**
    Creates one record and returns it.
        
    @param {Object} dataHash (optional) A JSON-compatible hash.
    @param {SC.Record} recordType (optional) he SC.Record extended class that you want to use. If none is specified, it is assumed to be a base SC.Record.
    @param {String} primaryKey  (optional) This is the primaryKey key for the data hash, if it is not passed in, then 'guid' is used.

    @returns {SC.Record} Returns the created record or null.
  */
  createRecord: function(dataHash, recordType, primaryKey)
  {
    if(SC.typeOf(dataHash) === SC.T_CLASS) {
      primaryKey = recordType;
      recordType = dataHash;
      dataHash = {};
    }
    
    var records = this.createRecords([dataHash], recordType, primaryKey);
    if(records && records[0]) return records[0];
    return null;
  },

  /**
    This is used for bulk loading from a persistent store. 
    
    It will update or create new records but it will then clear the changeset 
    immediately since there is nothing to commit after a load from a 
    persistent store. 
        
    @param {Array} dataArr (required) Array of JSON-compatible hashes.
    @param {SC.Record|Array} recordType (optional) The SC.Record extended class that you want to use or an array of SC.Record classes that match the dataArr item per item.
    @param {String} primaryKey  (optional) This is the primaryKey key for the data hash, if it is not passed in, then 'guid' is used.

    @returns {Array} Returns the storeKeys of the updated dataHashes.
  */
  loadRecords: function(dataArr, recordType, primaryKey) {
    var parentStore = this.get('parentStore');
    
    var ret = null;
    if(!parentStore || parentStore.get('isPersistent')) {
      ret = this.updateDataHashes(dataArr, recordType, primaryKey, YES);
    }
    return ret;
  },

  /**
    Given an array of records, delete them and when the store is commmited, 
    probagate to the persistent store.
  
    @param {Array} records Array of SC.Record instances.

    @returns {Boolean} Returns YES if the delete operation is successful.
  */
  destroyRecords: function(records) {
    return this._removeRecords(records, YES);
  },
    
  /**
    Given a single SC.Record instance, make its data editable by copying the 
    data hash.
  
    @private
    
    @param {SC.Record} record Single SC.Record instance.
  */
  makeRecordEditable: function(record) {
    if(!record) return;
    this.getWriteableDataHash(record.storeKey) ;
  },
  
  /**
    Given an array of records, refresh them from their persistent store.
  
    @param {Array} records Array of SC.Record instances.
    
    @returns {Array} Returns the records that were refreshed.
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
      var primaryKey = record.primaryKey;
      var storeKey = record.storeKey;
      this.updateDataHashes([this.dataHashes[storeKey]], 
            this.recKeyTypeMap[storeKey], record.primaryKey, NO);
    }
  },
  
  /**
    Given a guid and record type, retrieve it from the parent store or 
    persistent store.
  
    @private 
    
    @param {String} guid The guid for the desired record.
    @param {SC.Record} recordType The record type.

    @returns {SC.Record} Returns a record class.
  */
  retrieveRecordForGuid: function(guid, recordType) {
    return this.get('parentStore').retrieveRecordForGuid(guid, recordType);
  },

  /** 
    This method is called when there are newly retrieved records from the persistent 
    store that needs to be migrated.

    @private 
    
    @param {Array} storeKeys Array containing the storeKeys for the records that were created.
    @param {Array} guids (optional) Array containing the guids for the records that were created.
    @param {Array} dataArr (optional) Array contianing the dataHahes for the records that were created.
  */
  _didRetrieveRecords: function(storeKeys, guids, dataArr) {
    
    if(!storeKeys || !storeKeys.length) return NO;
    
    var retrievedRecQueue = this.retrievedRecQueue;
    var recKeyTypeMap = this.recKeyTypeMap;
    var instantiatedRecordMap = this.instantiatedRecordMap;
    var dataHashes = this.dataHashes;
    var cachedAttributes = this.cachedAttributes;
    for(var i=0, iLen=storeKeys.length; i<iLen; i++) {
      var storeKey = storeKeys[i];
      var recType = recKeyTypeMap[storeKey];
      var recTypeKey = SC.guidFor(recType);

      if(instantiatedRecordMap[recTypeKey] && 
          instantiatedRecordMap[recTypeKey][storeKey]) {
        var record = instantiatedRecordMap[recTypeKey][storeKey];
        var guid = record.get(record.primaryKey);
        if(guid) {
          retrievedRecQueue.removeObject(guid);
        } else {
          if(guids) { 
            this.replaceGuid(storeKey, guids[i]);
          }
          if(dataArr) { 
            dataHashes[storeKey] = dataArr[i];
            delete cachedAttributes[storeKey] ;
          }
        }
        record.beginPropertyChanges()
              .set('status', SC.RECORD_LOADED)
              .set('newRecord', NO)
              .allPropertiesDidChange()
              .endPropertyChanges();
      }
    }
    return YES;
  },

  /** 
    This method is called when there are new records from the persistent 
    store that needs to be migrated.

    @param {Array} storeKeys Array containing the storeKeys for the records that were created.
    @param {Array} guids Array containing the guids for the records that were created.
    @param {Array} dataArr Array contianing the dataHahes for the records that were created.
  */
  didCreateRecords: function(storeKeys, guids, dataArr) {
    return this._didRetrieveRecords(storeKeys, guids, dataArr);
  },
  
  /** 
    Given a storeKey, materialize the dataHash as part of a record.

    @private
    @param {Integer} storeKey The storeKey for the dataHash.
    @param {Boolean} isNewRecord If YES, then set the SC.RECORD_LOADING and newRecord props to YES.

    @returns {SC.Record} Returns a record instance.
  */
  materializeRecord: function(storeKey, isNewRecord) {
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
          ret = this.instantiatedRecordMap[recTypeKey][storeKey] = 
          recType.create({
            storeKey: storeKey,
            store: this,
            status: (isNewRecord) ? SC.RECORD_NEW : SC.RECORD_LOADED,
            newRecord: (isNewRecord) ? YES : NO
          });
        }
      }
    } 
    return ret;
  },

  /**
    Given an array of records, delete them and when the store is commmited, 
    probagate to the persistent store.
  
    @private
    
    @param {Array} records Array of SC.Record instances.
    @param {Boolean} removeDataHashes If YES, delete all the way to the persistent store.

    @returns {Boolean} Returns YES if the delete operation is successful.
  */
  _removeRecords: function(records, removeDataHashes) {
    if(!records) return;
    var storeKeys = [];
    var pDeleted = this.persistentChanges.deleted;
    
    for(var i=0, iLen=records.length; i<iLen; i++) {
      var rec = records[i];
      var storeKey = rec.storeKey;
      rec.set('status', SC.RECORD_DELETED);
      if(removeDataHashes) {
        pDeleted.push(storeKey);
      }
      storeKeys.push(storeKey);
    }
    return this.removeDataHashes(storeKeys);
  },
  
  // ..........................................................
  // FINDING RECORDS
  // 

  /**
    Retrieves records from the persistent store.  You should pass in a named
    query that will be understood by one of the persistent stores you have
    configured along with any optional parameters needed by the search.
    
    The return value is an SC.RecordArray that may be populated dynamically
    by the server as data becomes available.  You can treat this object just
    like any other object that implements SC.Array.
    
    h2. Query Keys
    
    The kind of query key you pass is generally determined by the type of 
    persistent stores you hook up for your application.  Most stores, however,
    will accept an SC.Record subclass as the query key.  This will return 
    a RecordArray matching all instances of that class as is relevant to your
    application.  
    
    Once you retrieve a RecordArray, you can filter the results even further
    by using the filter() method, which may issue even more specific requests.
    
    @param {Object} queryKey key describing the type of records to fetch
    @param {Hash} params optional additional parameters to pass along
    @param {SC.Store} store this is a private param.  Do not pass
    @returns {SC.RecordArray} matching set or null if no server handled it
  */
  fetch: function(queryKey, params, store) {  
    var parentStore = this.get('parentStore');
    if (store === undefined) store = this ; // first store sets to itself
    return parentStore ? parentStore.fetch(queryKey, params, store) : null ;
  },
  
  /**
    Given a guid and a recordType, retrieve the record. 
    
    If it does not exist, go all the way back to the persistent store.
    
    @param {String} guid The guid for the desired record.
    @param {SC.Record} recordType The record type.

    @returns {SC.Record} Returns a record instance.
  */
  find: function(guid, recordType)
  {
    var storeKey = this.primaryKeyMap[guid];
    var ret = null;
    if(storeKey !== undefined) {
      ret = this.materializeRecord(storeKey);
    } else {
      var parentStore = this.get('parentStore');
      if(guid && parentStore) {
        recordType = this.retrieveRecordForGuid(guid, recordType);
        if(recordType) {
          var recTypeKey = SC.guidFor(recordType);
          storeKey = this._generateStoreKey();
          this.primaryKeyMap[guid] = storeKey;
          this.storeKeyMap[storeKey] = guid;
          ret = recordType.create({
            storeKey: storeKey,
            store: this, 
            status: SC.RECORD_LOADING,
            newRecord: NO
          });
          
          if(!this.instantiatedRecordMap[recTypeKey]) {
            this.instantiatedRecordMap[recTypeKey] = [];
          }
          this.instantiatedRecordMap[recTypeKey][storeKey] = ret;
          
          this.retrievedRecQueue.push(storeKey);
        }
      }
    }
    return ret;
  },
  
  /**
    Given a filter and a recordType, retrieve matching records. 
    
    @param {SC.Record} recordType The query containing a query.
    @param {String} query The query containing a query.
    @param {Mixed} arguments The arguments for the query.
    
    @returns {Array} Returns an array of matched record instances.
  */
  findAll: function(recordType, queryString)
  {
    if(!queryString) return null;
    
    var args = SC.$A(arguments);
    recordType = args.shift();
    queryString = args.shift();
    
    var query = null;
    if(this._queries[queryString]) 
    {
      query = this._queries[queryString];
    } else {
      this._queries[queryString] = query = SC.Query.create({store: this, delegate: this});
    }
    query.parse(recordType, queryString, args);
    this.prepareQuery(query);
    return query;
  },

  /**
    For a in memory store, just perform the query to get the length.
  */
  provideLengthForQuery: function(query) {
    query.performQuery();
    // if(this.parentStore) {
    //   this.parentStore.provideLengthForQuery(query);
    // }
  },

  /**
    For a in memory store, just perform the query to get the records.
  */
  provideRecordsForQuery: function(query) {
    query.performQuery();
    // if(this.parentStore) {
    //   this.parentStore.provideRecordsForQuery(query);
    // }
  },

  /**
    For a in memory store, just perform the query.
  */
  prepareQuery: function(query) {
    query.performQuery();
    // if(this.parentStore) {
    //   this.parentStore.prepareQuery(query);
    // }
  },
  
  performQuery: function(query) {
    var conditions = query.get('conditions') ;
    var truthFunction = query.get('truthFunction');
    var recordType = query.get('recordType');
    var needRecord = query.get('needRecord');
    var rec = null;
    
    if(!recordType) {
      return [];
    }  
    
    if(needRecord) {
      rec = this.createCompRecord(recordType);
    }
    
    var dataHashes = this.dataHashes;
    var storeKeyMap = this.dataTypeMap[SC.guidFor(recordType)];
    var storeKeys = [];
    
    if(truthFunction === null) {
      truthFunction = function() { return YES; };
    }
    
    for(var i=0, iLen=storeKeyMap.length; i<iLen; i++ ) {
      var storeKey = storeKeyMap[i];
      if(needRecord) {
      rec.storeKey = storeKey;
      } else {
        rec = dataHashes[storeKey];
      }

      if(truthFunction(rec, conditions)) {
        storeKeys.push(storeKey);
      }
    }
    return storeKeys;
  },
  
  createCompRecord:function(recordType) {
    var recTypeGuid = SC.guidFor(recordType);
    var rec = null;
    if(this.compTypeMap[recTypeGuid]) {
      rec = this.compTypeMap[recTypeGuid];
    } else {
      this.compTypeMap[recTypeGuid] = rec = recordType.create({store: this});
    }
    return rec;
  },

  // ..........................................................
  // PRIMARY KEY CONVENIENCE METHODS
  // 

  /** 
    Given a storeKey, return the primaryKey.
  
    @returns {String} The primaryKey guid.
  */
  primaryKeyFor: function(storeKey) {
    return this.storeKeyMap[storeKey];
  },
  
  /** 
    Returns the storeKey for a passed primaryKey.  The storeKey is a transient
    identifier that can be used to retrieve data for a record.  Unlike 
    primaryKeys, storeKeys may change from one application reload to the next.
    
    You generally will not need to work with storeKey's yourself, though you
    may need to work with them if you write your own PersistentStore class.
  
    @returns {Integer} The storeKey.
  */
  storeKeyFor: function(primaryKey) {
    var storeKey = this.primaryKeyMap[primaryKey];
    if(storeKey === undefined) {
      storeKey = this.primaryKeyMap[primaryKey] = this._generateStoreKey(); 
    }
    return storeKey;
  },
  
  /** 
    Given a storeKey and a NEW guid, migrate the data to the new guid.
  
    @returns {Integer} The storeKey.
  */
  replaceGuid: function(storeKey, guid) {
    if(storeKey !== undefined) {
      this.storeKeyMap[storeKey] = guid;
      this.primaryKeyMap[guid] = storeKey;
    }
  },

  /**
    Generate a new unique storekey.

    @private
    @returns {Integer} A new storeKey.
  */
  _generateStoreKey: function() {
    var storeKey = SC.Store.prototype.nextStoreIndex;
    SC.Store.prototype.nextStoreIndex++;
    return storeKey;
  },
  
  init: function() {
    sc_super();
    
    this.cachedAttributes = {};
    this.instantiatedRecordMap = {};
    this.childStores = [];
    this.retrievedRecQueue = [];
    this._queries = {};
    
    this.reset();

    // when creating a new store, possibly share content with the parent
    var parentStore = this.get('parentStore');
    if(parentStore && !parentStore.get('isTransient')) {
      this.primaryKeyMap = parentStore.primaryKeyMap;
      this.storeKeyMap = parentStore.storeKeyMap;
      this.recKeyTypeMap = parentStore.recKeyTypeMap;
      this.dataTypeMap = parentStore.dataTypeMap;
    } else {
      this.primaryKeyMap = {};
      this.storeKeyMap = {};
      this.recKeyTypeMap = {};
      this.dataTypeMap = {};
    }
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

SC.Store.updateRecords = function(dataHashes, dataSource, recordType, isLoaded)
{
  return this._getDefaultStore().loadRecords(dataHashes, recordType);
};

SC.Store.find = function(guid, recordType)
{
  return this._getDefaultStore().find(guid, recordType);
};

SC.Store.findAll = function(filter)
{
  return this._getDefaultStore().findAll(filter, SC.Record);
};

SC.Store.prototype.addDataHash = SC.Store.prototype.updateDataHash;
SC.Store.prototype.addDataHashes = SC.Store.prototype.updateDataHashes;
SC.Store.prototype.nextStoreIndex = 0;
