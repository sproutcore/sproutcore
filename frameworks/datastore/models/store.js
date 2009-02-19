// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

require('core') ;
/**
  @class


  The DataStore is where you can find all of your records. There can be one
  'Active' store registered at a time. From this active store, you can chain
  stores used for editing, etc. Objects are stored as JSON and are materialized
  as SproutCore record objects on demand.
  
  By default, a base "SC.Store" is created for your application. If you have more
  than one applications running at once, you can manually create other base stores
  using the isBaseStore property.
  
  The reason to keep seperate data stores for each application is to reduce complexity
  and decrease the chance for data corruption.
  

  When chaining data stores, changes in the chained store will be probagated to the 
  parent store and saved if possible (The chained store has a newer version of the object).
  
  If you are at the base store, you can specify a parent store that may be a REST or 
  local storage interface for persistant storage.

  @extends SC.Object
  @static
  @since SproutCore 1.0
*/

SC.DataStore = SC.Object.extend(
/** @scope SC.DataStore.prototype */ {

  /**
    To specify that you're a base store, set this to YES. If is not a base 
    store, then you cannot save back to persistant storage.

    @property
    @type {Boolean}
    @default NO
  */
  isBaseStore: NO,
  
  /**
    When a base store is active, you can by default specify if it can resign as
    the active store or not. By default it is NO, but if certain specialized 
    circumstances such as when there are more than one application loaded, 
    it can be usefult to allow a store to resign as active.
    
    @property
    @type {Boolean}
    @default NO
  */
  canResignAsActiveStore: NO,

  /**
    This is set to YES when there are changes that have not been committed yet.

    @property
    @type {Boolean}
    @default NO
  */
  hasUncommittedChanges: NO,


  /**
    If YES, use JSON.parse otherwise use eval. This is a performance/security trade off.
    
    @property
    @type {Boolean}
    @default NO
  */
  useJSONParsing: NO,

  /**
    At times, it is useful to know if the store you're working with is chained or not. This
    property returns YES if it is chained from a base store, otherwise NO.
  
    @property
    @type {Boolean}
    @default NO
  */
  isChainedStore: function() {
    return (this.get('parentStore') !== null && !this.get('isBaseStore'));
  }.property('parentStore').cacheable(),


  /**
    This is a handle to the parent store that you can chain from. Also, if you're
    a base store, you can specify a parent store that is a handle to perisistant 
    storage.

    @property
    @type {SC.DataStore}
  */
  parentStore: null,

  /**
    This is a handle to the based store that you ultimately chain from. 

    @property
    @type {SC.DataStore}
  */
  baseStore: null,

  /**
    The chainedStores property is an array that contains all the chained stores for 
    THIS store.
    
    @property
    @type {Array}
  */
  chainedStores: [],

  /**
    This is the change set that is kept for a store. When the store is committed, this hash is
    used to pass changes down to from chained store stores to their parents. 
    
    The changes hash contains the following:
    
      "created", "deleted", and "updated" are Arrays that contain change sets in the form:
    
        {guid: guid, json: json, rev: revision}

      "createdGuids", "deletedGuids", and "updatedGuids" are hashes that contain 
       the index into the arrays based on the data guids.
       
    @property
    @type {Object}
  */
  changes: {
    created: [],
    deleted: [],
    updated: [],
    createdGuids: {},
    deletedGuids: {},
    updatedGuids: {}
  },
  
  /**
    This is an internal hash that is used for quick look up of chained stores.
  
    @private
    @property
    
    @type {Object}
  */
  _chainedStoreGuids: {},


  /** 
    Only one base store can be specified as active at any given time. Each application
    should only have one base store.
  
    @property
    @private
    
    @type {Boolean}
    @default NO
  */
  _isActiveStore: NO,
  
  /**
    Register this store as active. Only works if it is a base store and the currently
    active store can resign as the active store.

    @returns {Boolean} Returns YES if the store registration was successful.
  */
  registerAsActive: function() {
    if(!this.get('isBaseStore')) return NO;
    var activeStore = SC.DataStore.prototype.activeStore;
    if(activeStore !== this) {

      // If there is an active store, try to take control.
      if(activeStore) {
        var canResign = SC.DataStore.prototype.activeStore.resignAsActiveStore();
        if(!canResign) {
          return NO;
        }
      }
      SC.DataStore.prototype._activeStore = this;
      this._isActiveStore = YES;
    }
    return YES;
  },

  /**
    Attempt to resign as the active store. If the "canResignAsActiveStore" property and
    "isBaseStore" property are set to YES, then resign as active store. 
    
    @returns {Boolean} Returns YES if resignation is successful.
  */
  resignAsActiveStore: function() {
    if(this.get('canResignAsActiveStore') && this.get('isBaseStore'))
    {
      this._isActiveStore = NO;
      return YES;
    }
    return NO;
  },
  
  
  /**
    Create a chained data store form this instance. Adds it to the list of chained stores
    for this store.
    
    @returns {SC.DataStore} Returns a new store that is chained from this one.
  */
  createChainedStore: function() {
    var chainedStore = SC.clone(this);
    chainedStore.set('parentStore', this);
    
    if(this.get('baseStore') === null && this.get('isBaseStore')) {
      this.set('baseStore', this);
    }
    
    chainedStore.set('baseStore', this.get('baseStore'));
    
    this._chainedStoreGuids[SC.guidFor(chainedStore)] = (this.get('chainedStores').push(chainedStore)-1); 

    this.resetChainedStore(chainedStore);
    return chainedStore;
  },
  
  /**
    Push the changes TO a child store FROM its parent.

    @param {SC.DataStore} chainedStore The chained store to have its data replaced.
    @param {Object} changeSet The change set.
  */
  updateLocalStore: function(changeSet) {
    if(changeSet === undefined) return NO;
    
    var isSuccess = YES;

    var copy = changeSet.copy;
    var remove = changeSet.remove;
    var store = this.store;
    
    var purgeGuids = [];
    
    var baseStore = this.get('baseStore').store;
    
    // Handle creation and updates.
    for(var i=0, iLen=copy.length; i<iLen; i++) {
      var item = copy[i];
      var storeKey = item.storeKey;
      store[storeKey] = baseStore[storeKey];
      purgeGuids.push(item.guid);
    }

    // Handle deletions.
    for(var i=0, iLen=remove.length; i<iLen; i++) {
      var item = remove[i];
      store[item.storeKey] = null;
      delete store[item.storeKey];
      purgeGuids.push(item.guid);
    }

    this._purgeChangeSet(purgeGuids);
    
    return this.pushChangesToChainedStores(changeSet);
  },
  
  _clearComponent: function(arr, purgeGuids) {
    var newArr = [];
    var newHash = [];
    for(var i=0, iLen=arr.length; i<iLen; i++) {
      if(purgeGuids.indexOf(arr[i].guid) === -1) {
        newHash[arr[i].guid] = (newArr.push(arr[i])-1);
      }
    }
    return [newArr, newHash];
  },
  
  _purgeChangeSet: function(purgeGuids) {
    var localChanges = this.changes;

    var newCreated = this._clearComponent(localChanges.updated, purgeGuids);
    var newDeleted = this._clearComponent(localChanges.deleted, purgeGuids);
    var newUpdated = this._clearComponent(localChanges.created, purgeGuids);

    this.changes = {
      created: newCreated[0],
      deleted: newDeleted[0],
      updated: newUpdated[0],
      createdGuids: newCreated[1],
      deletedGuids: newDeleted[1],
      updatedGuids: newUpdated[1]
    };
  },
  
  pushChangesToChainedStores: function(changeSet) {
    var chainedStores = this.get('chainedStores');
    for(var i=0, iLen=chainedStores.length; i<iLen; i++) {
      chainedStores[i].updateLocalStore(changeSet);
    }
  },
  
  /** 
    Returns the parentStore if there is one.
    
    @returns {SC.DataStore} Returns the parent store or NO if there is none.
  */
  getParentStore: function() {
    var pS = this.get('parentStore');
    if(pS) {
      return pS;
    }
    return NO;
  },
  
  /**
    Remove a chained store from its parent.
    
    @returns {Boolean} Returns YES if the operation was successful.  
  */
  removeFromParentStore: function() {
    
    // I think this may something that should destroy the store, we don't want dangling stores do we?
    var pS = this.get('parentStore');
    if(pS) {
      return pS.removeChainedStore(this);
    }
    return NO;
  },

  /**
    Remove a given chained store from its parent.

    @param {SC.DataStore} chainedStore The chained store that is being removed.

    @returns {Boolean} Returns YES if the operation was successful.  
  */
  removeChainedStore: function(chainedStore) {
    if(chainedStore) {
      var guid = SC.guidFor(chainedStore);
      var chainedStoreIndex = this._chainedStoreGuids[guid];

      if(chainedStoreIndex !== undefined) {
        this.get('chainedStores').splice(chainedStoreIndex, 1);
        delete this._chainedStoreGuids[guid];
        chainedStore.set('parentStore', null);
        return YES;
      }
    }
    return NO;
  },


  // If collision, highest revision wins.
  // If no collision, chained parent change set does not change, it just gets passed down further.

  handleChangesFromChainedStore: function(chainedStore)
  {
    if(chainedStore === undefined) return NO;


    if(this.get('isBaseStore')) {


      var isSuccess = YES;

      var store = this.store;
      var guidRelation = this.guidRelation;
      var revisionRelation = this.revisionRelation;

      var created = chainedStore.changes.created;
      var updated = chainedStore.changes.updated;
      var deleted = chainedStore.changes.created;

      var createdGuids = chainedStore.changes.createdGuids;
      var updatedGuids = chainedStore.changes.updatedGuids;
      var deletedGuids = chainedStore.changes.deletedGuids;

      var globalChanges = {
        copy: [],
        remove: []
      };

      // Handle creation.
      for(var i=0, iLen=created.length; i<iLen; i++) {
        var data = created[i];
        var guid = data.guid;
        
        // If the item has been updated before committed, defer until updated array is processed.
        // If the item has been deleted, then there is no need to store it before deleting it.
        if(updatedGuids[guid] === undefined && deletedGuids[guid] === undefined)
        {
          store[guidRelation[guid]] = {json: data.json, rev: data.rev};
          globalChanges.copy.push({guid: guid, storeKey: guidRelation[guid]});
        }
      }

      // Handle updates.
      for(var i=0, iLen=updated.length; i<iLen; i++) {
        var data = updated[i];
        var guid = data.guid;
        
        // If the item is not deleted, then just store it if it is the latest revision.
        if(deletedGuids[guid] === undefined || deleted[deletedGuids[guid]].rev < data.rev ) {
          if(data.rev === revisionRelation[guid]) {
            store[guidRelation[guid]] = {json: data.json, rev: data.rev};
            globalChanges.copy.push({guid: guid, storeKey: guidRelation[guid]});
          } else {
            // What do we do in this case?
            isSuccess = NO;
            console.log("SC.DataStore: Attempting to update record %@ but has been marked to be deleted more recently, skipping.".fmt(guid));
          }
        }
      }
      
      // Handle deletions.
      for(var i=0, iLen=deleted.length; i<iLen; i++) {
        var data = deleted[i];
        var guid = data.guid;
        
        // If the item is to be deleted.
        if(data.rev === revisionRelation[guid]) {
          this._destroyRecord(guid);
          globalChanges.remove.push({guid: guid, storeKey: guidRelation[guid]});
        } else {
          // What do we do in this case?
          isSuccess = NO;
          console.log("SC.DataStore: Attempting to delete record %@ but has been marked to be updated more recently, skipping.".fmt(guid));
        }
      }

      this.pushChangesToChainedStores(globalChanges);


      if(this.get('parentStore')) {
        console.log('push to server persistant store');
      }
      
      
      
      
      return isSuccess;
    } else if(this.get('parentStore')) {
      return this.get('parentStore').handleChangesFromChainedStore(chainedStore);
    }
    
    return NO;
  },

  /**
    Reset a chained store.

    @param {SC.DataStore} chainedStore The chained store to have its data replaced.
  */
  resetChainedStore: function(chainedStore) {
    chainedStore._chainedStoreGuids = {};
    chainedStore.chainedStores = [];
    chainedStore.isBaseStore = NO;

    chainedStore.store = SC.clone(this.store);
//    chainedStore.guidRelation = SC.clone(this.guidRelation);

    chainedStore._clearChangeSet(); 
  },

  
  commitChanges: function() {
    if(this.get('isBaseStore')) {
      console.log('push to server object');
      return YES;
    } else if(this.get('parentStore')) {
      return this.get('parentStore').handleChangesFromChainedStore(this);
    }
    return NO;
  },
  
  // How to discard changes on base store?
  discardChanges: function() {
    if(this.get('isBaseStore')) {
      this._clearChangeSet();
    } else if(this.get('parentStore')){
      this.get('parentStore').resetChainedStore(this);
    }
  },
  
  
  /**
    Creates or updates records in the store.
  
    This method is often called from a server to update the store with the 
    included record objects.
  
    You can use this method yourself to mass update the store whenever you 
    retrieve new records from the server.  The first parameter should contain
    an array of JSON-compatible hashes.  The hashes can have any properties 
    you want but they should at least contain the following two keys:
  
    - guid: This is a unique identifier for the record. 
    - type: The name of the record type.  I.e. "Contact" or "Photo"
  
    @param {Array|String} dataHashes array of hash records.  See discussion.
    @param {Boolean} initLoad If YES, don't add created records to changes hash.

    @returns {Boolean} Returns YES if the store operation was successful.
  */  
  updateRecords: function(dataHashes, initLoad) {

    var isSuccess = YES;

    // If you're not the active store, don't allow imports.
    if(!this._isActiveStore) return NO;
    
    // First, check if the dataHashes var is a string or an array. 
    // If it is a string, evaluate it so it can be iterated over.
    if(typeof dataHashes === 'string') {
      SC.Benchmark.start('updateRecords: eval');
      if(this.get('useJSONParsing')) {
        dataHashes = JSON.parse(dataHashes) ;
      } else {
        dataHashes = eval(dataHashes) ;
      }
      SC.Benchmark.end('updateRecords: eval');
    }
    
    // One last sanity check to see if the hash is in the proper format.
    if(typeof dataHashes !== 'object') {
      return NO;
    }

    SC.Benchmark.start('updateRecords: loop');

    this.beginPropertyChanges() ;

    for(var i=0, iLen=dataHashes.length; i<iLen; i++) {
      if(!this.updateRecord(dataHashes[i])) isSuccess = NO;
    }
    
    this.endPropertyChanges() ;
    SC.Benchmark.end('updateRecords: loop');
    
    // Return YES to signify successful import.
    return isSuccess;
    
  },
  
  /**
    Routes to the updateRecord function.

    @param {Object} data hash for single record.
    @param {Boolean} initLoad If YES, don't add created records to changes hash.

    @returns {Boolean} Returns YES if the store operation was successful.
  */
  addRecord: function(data, initLoad) {
    return updateRecord(data, initLoad);
  },
  
  /**
    This function creates or updates a record.
    
    A record is a data hash that contains at least the following parameters:
    
    - guid: This is a unique identifier for the record. 
    - type: The name of the record type.  I.e. "Contact" or "Photo"
      
    @param {Object} data hash for single record.
    @param {Boolean} initLoad If YES, don't add created records to changes hash.

    @returns {Boolean} Returns YES if the store operation was successful.
  */
  updateRecord: function(data, initLoad)
  {
    SC.Benchmark.start('updateRecord');
    
    var isSuccess = YES;
    var store = this.store;
    var guidRelation = this.guidRelation;
    var revisionRelation = this.revisionRelation;
    var changes = this.changes;
    
    var storeKey, rec;
    var type = data.type;
    var guid = data.guid;
    
    if(!type || !guid) {
      var err = (!type && !guid) ? 'guid and type' : (!guid) ? 'guid' : (!type) ? 'type' : '';
      console.log("SC.DataStore: Insertion of record failed, missing %@.".fmt(err));
      isSuccess = NO;
    }

    if(guidRelation[guid] !== undefined)
    {
      storeKey = guidRelation[guid];
      if(store[storeKey])
      {
        rec = SC.clone(store[storeKey]);
        rec.rev++;
        revisionRelation[guid] = (revisionRelation[guid] < rec.rev) ? rec.rev : revisionRelation[guid];
        rec.json = data;
        changes.updatedGuids[guid] = (changes.updated.push({guid: guid, json: rec.json, rev: rec.rev})-1);
      }
      else
      {
        console.log("SC.DataStore: Record key is registed, but no record exists for guid %@.".fmt(guid));
        isSuccess = NO;
      }
    }
    else
    {
      storeKey = this.nextStoreIndex;
      rec = {json: data, rev: 0};
      guidRelation[guid] = storeKey;
      revisionRelation[guid] = 0;
      this.nextStoreIndex++;
      this.storeSize++;
      if(!initLoad)
      {
        changes.createdGuids[guid] = (changes.created.push({guid: guid, json: rec.json, rev: rec.rev})-1);
      }
    }
    store[storeKey] = rec;
    if(isSuccess) {
      this.set('hasUncommittedChanges', YES);
    }
    
    SC.Benchmark.end('updateRecord');
    
    return isSuccess;    
  },
  
  /**
    Given array of guids or records, delete them.
    
    @param {Array} guids Array of guids or records.
    
    @returns {Boolean} Returns YES if the store operation was successful.
  */
  deleteRecords: function(guids)
  {
    var isSuccess = YES;
    
    this.beginPropertyChanges() ;

    for(var i=0, iLen=guids.length; i<iLen; i++) {
       if(!this.deleteRecord(guids[i])) isSuccess = NO;
    }
    this.endPropertyChanges() ;
    
    return isSuccess;
  },
  
  /**
    Given guid or record, delete it.
    
    @param {Array} guid A guid or record.
    
    @returns {Boolean} Returns YES if the store operation was successful.
  */
  deleteRecord: function(guid)
  {
    if(typeof guid !== 'string') {
      guid = guid.get('guid');
      if(!guid) return NO;
    }
    
    var storeIdx = this.guidRelation[guid];
    var changes = this.changes;
    if(storeIdx !== undefined)
    {
      var rec = this.store[storeIdx];
      rec.rev++;
      if(rec !== undefined)
      {
        changes.deletedGuids[guid] = (changes.deleted.push({guid: guid, json: rec.json, rev: rec.rev})-1);
        this.revisionRelation[guid] = rec.rev;
        // this.guidRelation[guid] = null;
        this.store[storeIdx] = null;
      }
      // Should we delete the local version in the data store??

      this.set('hasUncommittedChanges', YES);
      return YES;
    }
    return NO;
  },
  

  find: function(guid)
  {
    if(this.guidRelation[guid] !== undefined)
    {
      var storeKey = this.guidRelation[guid];
      if(this.store[storeKey] !== undefined)
      {
        return this.store[storeKey];
      }
    }
    return NO;
  },
  
  
  /*
  
    Private methods.
  
  */
  
  
  /**
    Given guids, destroy records.
    
    @private
  */
  _destroyRecords: function(guids) {
    var isSuccess = YES;

    this.beginPropertyChanges() ;

    for(var i=0, iLen=guids.length; i<iLen; i++) {
      if(!this._destroyRecord(guids[i])) isSuccess = NO;
    }
    this.endPropertyChanges() ;
    
    return isSuccess;
  },
  
  _destroyRecord: function(guid)
  {
    try
    {
      var storeIdx = this.guidRelation[guid];
      var rev = this.store[storeIdx].rev;
      this.store[storeIdx] = null;
      delete this.store[storeIdx];
    
      this.guidRelation[guid] = null;
      delete this.guidRelation[guid];

      this.revisionRelation[guid] = null;
      delete this.revisionRelation[guid];
      
      this.storeSize--;
    }
    catch(err)
    {
      console.log("SC.DataStore: destroyRecord failed for %@ - %@".fmt(guid, err));
      return NO;
    }
    return YES;
  },

  /**
    Reset the change set after a commit or discard operation.
    @private
  */
  _clearChangeSet: function() {
    this.changes = {
      created: [],
      deleted: [],
      updated: [],
      createdGuids: {},
      deletedGuids: {},
      updatedGuids: {}
    };
  }
  
}) ;


SC.DataStore.prototype.store = [];
SC.DataStore.prototype.guidRelation = {};
SC.DataStore.prototype.revisionRelation = {};
SC.DataStore.prototype.nextStoreIndex = 0;
SC.DataStore.prototype.storeSize = 0;
SC.DataStore.prototype.activeStore = null;


SC.Store = SC.DataStore.create({isBaseStore: YES});
SC.Store.registerAsActive();
