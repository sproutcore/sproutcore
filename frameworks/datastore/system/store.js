// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

sc_require('models/record');

/**
  @class


  The Store is where you can find all of your dataHashes. Stores can be 
  chained for editing purposes and committed back one chain level at a time 
  all the way back to a persistent data source.
  
  Every application you create should generally have its own store objects.
  Once you create the store, you will rarely need to work with the store
  directly except to retrieve records and collections.  
  
  Internally, the store will keep track of changes to your json data hashes
  and manage syncing those changes with your data source.  A data source may
  be a server, local storage, or any other persistent code.

  @extends SC.Object
  @since SproutCore 1.0
*/
SC.Store = SC.Object.extend( /** @scope SC.Store.prototype */ {

  /**
    An array of all the chained stores that current rely on the receiver 
    store.
    
    @property {Array}
  */
  nestedStores: null,

  /**
    The data source is the persistent storage that will provide data to the
    store and save changes.  You normally will set your data source when you
    first create your store in your application.
  */
  dataSource: null,
  
  /**
    This type of store is not nested.
  */
  isNested: NO,
  
  // ..........................................................
  // DATA SOURCE SUPPORT
  // 
  
  /**
    Convenience method.  Sets the current data source to the passed property.
    This will also set the store property on the dataSource to the receiver.
    
    @returns {SC.Store} receiver
  */
  from: function(dataSource) {
    this.set('dataSource', dataSource);
    return this ;
  },
  
  /**
    Convenience method.  Creates a CascadeDataSource with the passed 
    data source arguments and sets the CascadeDataSource as the data source 
    for the receiver.
    
    @param {SC.DataSource...} dataSource one or more data source arguments
    @returns {SC.Store} reciever
  */
  cascade: function(dataSource) {
    var dataSources = SC.A(arguments) ;
    dataSource = SC.CascadeDataSource.create({
      dataSources: dataSources 
    });
    return this.from(dataSource);
  },
  
  // ..........................................................
  // STORE CHAINING
  // 
  
  /**  
    Returns a new nested store instance that can be used to buffer changes
    until you are ready to commit them.  When you are ready to commit your 
    changes, call commitChanges() or destroyChanges() and then destroy() when
    you are finished with the chained store altogether.
    
    {{{
      store = MyApp.store.chain();
      .. edit edit edit
      store.commitChanges().destroy();
    }}}
    
    @returns {SC.NestedStore} new nested store chained to receiver
  */
  chain: function() {
    var ret = SC.NestedStore.create({ parentStore: this }) ; 
    var nested = this.nestedStores;
    if (!nested) nested =this.nestedStores = [];
    nested.push(ret);
    return ret ;
  },
  
  /** @private
  
    Called by a nested store just before it is destroyed so that the parent
    can remove the store from its list of nested stores.
    
    @returns {SC.Store} receiver
  */
  willDestroyNestedStore: function(nestedStore) {
    if (this.nestedStores) {
      this.nestedStores.removeObject(nestedStore);
    }
    return this ;
  },

  // ..........................................................
  // SHARED DATA STRUCTURES 
  // 
  
  /** @private
    JSON data hashes indexed by store key.  
    
    *IMPORTANT: Property is not observable*

    Shared by a store and its child stores until you make edits to it.
    
    @property {Hash}
  */
  dataHashes: null,

  /** @private
    The current status of a data hash indexed by store key.
    
    *IMPORTANT: Property is not observable*

    Shared by a store and its child stores until you make edits to it.
    
    @property {Hash}
  */
  statuses: null,
    
  /** @private
    This array contains the revisions for the attributes indexed by the 
    storeKey.  
    
    *IMPORTANT: Property is not observable*
    
    Revisions are used to keep track of when an attribute hash has been 
    changed. A store shares the revisions data with its parent until it 
    starts to make changes to it.
    
    @property {Hash}
  */
  revisions: null,

  /**
    Array indicates whether a data hash is possibly in use by an external 
    record for editing.  If a data hash is editable then it may be modified
    at any time and therefore chained stores may need to clone the 
    attributes before keeping a copy of them.
  
    Note that this is kept as an array because it will be stored as a dense 
    array on some browsers, making it faster.
    
    @property {Array}
  */
  editables: null,
    
  /**
    A set of storeKeys that need to be committed back to the data source. If
    you call commitRecords() without passing any other parameters, the keys
    in this set will be committed instead.
  
    @property {Hash}
  */
  changelog: null,
  
  // ..........................................................
  // CORE ATTRIBUTE API
  // 
  // The methods in this layer work on data hashes in the store.  They do not
  // perform any changes that can impact records.  Usually you will not need 
  // to use these methods.
  
  /**
    Returns the current edit status of a storekey.  May be one of EDITABLE or
    LOCKED.  Used mostly for unit testing.
    
    @param {Number} storeKey the store key
    @returns {Number} edit status
  */
  storeKeyEditState: function(storeKey) {
    var editables = this.editables, locks = this.locks;
    return (editables && editables[storeKey]) ? SC.Store.EDITABLE : SC.Store.LOCKED ;
  },
   
  /** 
    Returns the data hash for the given storeKey.  This will also 'lock'
    the hash so that further edits to the parent store will no 
    longer be reflected in this store until you reset.
    
    @param {Number} storeKey key to retrieve
    @returns {Hash} data hash or null
  */
  readDataHash: function(storeKey) {
    return this.dataHashes[storeKey];
  },
  
  /** 
    Returns the data hash for the storeKey, cloned so that you can edit
    the contents of the attributes if you like.  This will do the extra work
    to make sure that you only clone the attributes one time.  
    
    If you use this method to modify data hash, be sure to call 
    dataHashDidChange() when you make edits to record the change.
    
    @param {Number} storeKey the store key to retrieve
    @returns {Hash} the attributes hash
  */
  readEditableDataHash: function(storeKey) {
    // read the value - if there is no hash just return; nothing to do
    var ret = this.dataHashes[storeKey];
    if (!ret) return ret ; // nothing to do.

    // clone data hash if not editable
    var editables = this.editables;
    if (!editables) editables = this.editables = [];
    if (!editables[storeKey]) {
      editables[storeKey] = 1 ; // use number to store as dense array
      ret = this.dataHashes[storeKey] = SC.clone(ret);
    }
    return ret;
  },
  
  /**
    Replaces the data hash for the storeKey.  This will lock the data hash and
    mark them as cloned.  This will also call dataHashDidChange() for you.
    
    Note that the hash you set here must be a different object from the 
    original data hash.  Once you make a change here, you must also call
    dataHashDidChange() to register the changes.

    If the data hash does not yet exist in the store, this method will add it.
    Pass the optional status to edit the status as well.
    
    @param {Number} storeKey the store key to write
    @param {Hash} hash the new hash
    @param {String} status the new hash status
    @returns {SC.Store} receiver
  */
  writeDataHash: function(storeKey, hash, status) {

    // update dataHashes and optionally status.
    if (hash) this.dataHashes[storeKey] = hash;
    if (status) this.statuses[storeKey] = status ;
    
    // also note that this hash is now editable
    var editables = this.editables;
    if (!editables) editables = this.editables = [];
    editables[storeKey] = 1 ; // use number for dense array support
    
    return this ;
  },

  /**
    Removes the data hash from the store.  This does not imply a deletion of
    the record.  You could be simply unloading the record.  Eitherway, 
    removing the dataHash will be synced back to the parent store but not to 
    the server.
    
    Note that you can optionally pass a new status to go along with this. If
    you do not pass a status, it will change the status to SC.RECORD_EMPTY
    (assuming you just unloaded the record).  If you are deleting the record
    you may set it to SC.Record.DESTROYED_CLEAN.
    
    Be sure to also call dataHashDidChange() to register this change.
    
    @param {Number} storeKey
    @param {String} status optional new status
    @returns {SC.Store} reciever
  */
  removeDataHash: function(storeKey, status) {
    var rev ;
    
     // don't use delete -- that will allow parent dataHash to come through
    this.dataHashes[storeKey] = null;  
    this.statuses[storeKey] = status || SC.Record.EMPTY;
    rev = this.revisions[storeKey] = this.revisions[storeKey]; // copy ref
    
    // hash is gone and therefore no longer editable
    var editables = this.editables;
    if (editables) editables[storeKey] = 0 ;
    
    return this ;    
  },
  
  /**
    Reads the current status for a storeKey.  This will also lock the data 
    hash.  If no status is found, returns SC.RECORD_EMPTY.
    
    @param {Number} storeKey the store key
    @returns {String} status
  */
  readStatus: function(storeKey) {
    // use readDataHash to handle optimistic locking.  this could be inlined
    // but for now this minimized copy-and-paste code.
    this.readDataHash(storeKey);
    return this.statuses[storeKey] || SC.Record.EMPTY;
  },
  
  /**
    Writes the current status for a storeKey.
  */
  writeStatus: function(storeKey, newStatus) {
    // use writeDataHash for now to handle optimistic lock.  maximize code 
    // reuse.
    return this.writeDataHash(storeKey, null, newStatus);
  },
  
  /**
    Call this method whenever you modify some editable data hash to register
    with the Store that the attribute values have actually changed.  This will
    do the book-keeping necessary to track the change across stores including 
    managing locks.
    
    @param {Number|Array} storeKeys one or more store keys that changed
    @param {Number} rev optional new revision number. normally leave null
    @param {Boolean} statusOnly (optional) YES if only status changed
    @returns {SC.Store} receiver
  */
  dataHashDidChange: function(storeKeys, rev, statusOnly) {
    
    // update the revision for storeKey.  Use generateStoreKey() because that
    // gaurantees a universally (to this store hierarchy anyway) unique 
    // key value.
    if (!rev) rev = SC.Store.generateStoreKey();
    var isArray, len, idx, storeKey;
    
    isArray = SC.typeOf(storeKeys) === SC.T_ARRAY;
    if (isArray) {
      len = storeKeys.length;
    } else {
      len = 1;
      storeKey = storeKeys;
    }
    
    for(idx=0;idx<len;idx++) {
      if (isArray) storeKey = storeKeys[idx];
      this.revisions[storeKey] = rev;
      this._notifyRecordPropertyChange(storeKey, statusOnly);
    }
    
    return this ;
  },

  /**
    Will notify any record instances of the property change at the end of 
    the run loop.  Also notifies any inherited record instances as well.
  */
  _notifyRecordPropertyChange: function(storeKey, statusOnly) {

    var records = this.records, rec ;
    
    // schedule
    if (records && (rec=records[storeKey])) {
      rec.storeDidChangeProperties(statusOnly);
    }

    // pass along to nested stores
    var nestedStores = this.get('nestedStores'), len, idx, store;
    var K = SC.Store;
    len = nestedStores ? nestedStores.length : 0 ;
    for(idx=0;idx<len;idx++) {
      store = nestedStores[idx];
      if (store.storeKeyEditState(storeKey) === K.INHERITED) {
        store._notifyRecordPropertyChange(storeKey, statusOnly);
      }
    }
    return this;
  },
  
  /**
    Resets the store content.  This will clear all internal data for all
    records, resetting them to an EMPTY state.  You generally do not want
    to call this method yourself, though you may override it.
    
    @returns {SC.Store} receiver
  */
  reset: function() {
    
    // create a new empty data store
    this.dataHashes = {} ;
    this.revisions  = {} ;
    this.statuses   = {} ;

    // also reset temporary objects
    this.chainedChanges = this.locks = this.editables = null;
    this.changelog = null ;

    var records = this.records, storeKey;
    if (records) {
      for(storeKey in records) {
        if (!records.hasOwnProperty(storeKey)) continue ;
        this._notifyRecordPropertyChange(storeKey, NO);
      }
    }
    
    this.set('hasChanges', NO);    
  },
  
  /** @private
    Called by a nested store on a parent store to commit any changes from the
    store.  This will copy any changed dataHashes as well as any persistant 
    change logs.
    
    If the parentStore detects a conflict with the optimistic locking, it will
    raise an exception before it makes any changes.  If you pass the 
    force flag then this detection phase will be skipped and the changes will
    be applied even if another resource has modified the store in the mean
    time.
  
    @param {SC.Store} nestedStore the child store
    @param {Array} changes the array of changed store keys
    @param {Boolean} force
    @returns {SC.Store} receiver
  */
  commitChangesFromNestedStore: function(nestedStore, changes, force)
  {
    // first, check for optimistic locking problems
    if (!force) this._verifyLockRevisions(changes, nestedStore.locks);
    
    // OK, no locking issues.  So let's just copy them changes. 
    // get local reference to values.
    var len = changes.length, i, storeKey ;
    var my_dataHashes, my_statuses, my_editables, my_revisions;
    var ch_dataHashes, ch_statuses, ch_revisions;
    
    my_revisions  = this.revisions ;
    my_dataHashes = this.dataHashes;
    my_statuses   = this.statuses;
    my_editables  = this.editables ;

    // setup some arrays if needed
    if (!my_editables) my_editables = this.editables = [] ;
    
    ch_dataHashes = nestedStore.dataHashes;
    ch_revisions  = nestedStore.revisions ;
    ch_statuses   = nestedStore.statuses;

    for(i=0;i<len;i++) {
      storeKey = changes[i];

      // now copy changes
      my_dataHashes[storeKey] = ch_dataHashes[storeKey];
      my_statuses[storeKey]   = ch_statuses[storeKey];
      my_revisions[storeKey]  = ch_revisions[storeKey];
      
      my_editables[storeKey] = 0 ; // always make dataHash no longer editable
      
      this._notifyRecordPropertyChange(storeKey, NO);
    }

    // add any records to the changelog for commit handling
    var my_changelog = this.changelog, ch_changelog = nestedStore.changelog;
    if (ch_changelog) {
      if (!my_changelog) my_changelog = this.changelog = SC.Set.create();
      my_changelog.addEach(ch_changelog);
    }  
    this.changelog=my_changelog;
    
    return this ;
  },

  /** @private
    Verifies that the passed lock revisions match the current revisions 
    in the receiver store.  If the lock revisions do not match, then the 
    store is in a conflict and an exception will be raised.
    
    @param {Array}  changes set of changes we are trying to apply
    @param {SC.Set} locks the locks to verify
    @returns {SC.Store} receiver
  */
  _verifyLockRevisions: function(changes, locks) {
    var len = changes.length, revs = this.revisions, i, storeKey, lock, rev ;
    if (locks && revs) {
      for(i=0;i<len;i++) {
        storeKey = changes[i];
        lock = locks[storeKey] || 1;
        rev  = revs[storeKey] || 1;

        // if the save revision for the item does not match the current rev
        // the someone has changed the data hash in this store and we have
        // a conflict. 
        if (lock < rev) throw SC.Store.CHAIN_CONFLICT_ERROR;
      }   
    }
    return this ;
  },
  
  // ..........................................................
  // HIGH-LEVEL RECORD API
  // 
  
  
  /**
    Finds a record instance with the specified recordType and id, returning 
    the record instance.  If no matching record could be found, asks the 
    data source to retrieve the record.  If the data source cannot retrieve
    the record, returns null.
    
    Note that if you try to find a record id that does not exist in memory,
    a dataSource may load it from ths server.  In this case, this method will
    return a record instance with a status of SC.Record.BUSY_LOADING to indicate
    that it is still fetching the data from the server.
    
    @param {SC.Record} recordType the expected record type
    @param {String} id the id to load
    @returns {SC.Record} record instance or null
  */
  find: function(recordType, id) {
    // first attempt to find the record in the local store
    var storeKey = recordType.storeKeyFor(id);
    if (this.readStatus(storeKey) === SC.Record.EMPTY) {
      storeKey = this.retrieveRecord(recordType, id);
    }
    
    // now we have the storeKey, materialize the record and return it.
    return storeKey ? this.materializeRecord(storeKey) : null ;
  },

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
    @param {SC.Store} _store this is a private param.  Do not pass
    @returns {SC.RecordArray} matching set or null if no server handled it
  */
  findAll: function(queryKey, params, _store) { 
    if (!_store) _store = this;

    var source = this.get('dataSource'), ret, storeKeys, cacheKey ;
    if (source) {
      
      // ask the dataSource to provide a storeKey array
      storeKeys = source.fetchRecords.call(source, this, queryKey, params);
      if (storeKeys) {
        
        // if an array was provided, see if a wrapper already exists for 
        // this store.  Otherwise create it
        cacheKey = SC.keyFor('__records__', SC.guidFor(storeKeys));
        ret = this[cacheKey];
        if (!ret) {
          ret = SC.RecordArray.create({store: _store, storeKeys: storeKeys});
          this[cacheKey] = ret ; // save for future reuse.
        }
      }
    }
    return ret ;
  },

  /**
    Array of all records currently in the store with the specified
    type.  This method only reflects the actual records loaded into memory and
    therefore is not usually needed at runtime.  However you will often use
    this method for testing.
    
    @param {SC.Record} recordType the record type
    @returns {SC.Array} array instance - usually SC.RecordArray
  */
  recordsFor: function(recordType) {
    var storeKeys = [], storeKeysById = recordType.prototype.storeKeysById; 
    var id, storeKey, ret;
    
    // collect all non-empty store keys
    if (storeKeysById) {
      for(id in storeKeysById) {
        storeKey = storeKeysById[id]; // get the storeKey
        if (this.readStatus(storeKey) !== SC.RECORD_EMPTY) {
          storeKeys.push(storeKey);
        }
      }
    }
    
    if (storeKeys.length>0) {
      ret = SC.RecordArray.create({ store: this, storeKeys: storeKeys });
    } else ret = storeKeys; // empty array
    return ret ;
  },
  
  _TMP_REC_ATTRS: {},
  
  /** 
    Given a storeKey, return a materialized record.  You will not usually
    call this method yourself.  Instead it will used by other methods when
    you find records by id or perform other searches.

    If a recordType has been mapped to the storeKey, then a record instance
    will be returned even if the data hash has not been requested yet.
    
    Each Store instance returns unique record instances for each storeKey.

    @param {Integer} storeKey The storeKey for the dataHash.
    @returns {SC.Record} Returns a record instance.
  */
  materializeRecord: function(storeKey) {
    var records = this.records, ret, recordType, attrs;
    
    // look up in cached records
    if (!records) records = this.records = {}; // load cached records
    ret = records[storeKey];
    if (ret) return ret;
    
    // not found -- OK, create one then.
    recordType = SC.Store.recordTypeFor(storeKey);
    if (!recordType) return null; // not recordType registered, nothing to do
    
    attrs = this._TMP_REC_ATTRS ;
    attrs.storeKey = storeKey ;
    attrs.store    = this ;
    ret = records[storeKey] = recordType.create(attrs);
    
    return ret ;
  },

  // ..........................................................
  // CORE RECORDS API
  // 
  // The methods in this section can be used to manipulate records without 
  // actually creating record instances.
  
  /**
    Creates a new record instance with the passed recordType and dataHash.
    You can also optionally specify an id or else it will be pulled from the 
    data hash.

    Note that the record will not yet be saved back to the server.  To save
    a record to the server, call commitChanges() on the store.

    @param {SC.Record} recordType the record class to use on creation
    @param {Hash} dataHash the JSON attributes to assign to the hash.
    @param {String} id (optional) id to assign to record

    @returns {SC.Record} Returns the created record
  */
  createRecord: function(recordType, dataHash, id) {

    var primaryKey, storeKey, status, K = SC.Record, changelog;
    
    // First, try to get an id.  If no id is passed, look it up in the 
    // dataHash.
    if (!id && (primaryKey = recordType.prototype.primaryKey)) {
      id = dataHash[primaryKey];
    }
    
    // Next get the storeKey - base on id if available
    storeKey = id ? recordType.storeKeyFor(id) : SC.Store.generateStoreKey();
    
    // now, check the state and do the right thing.
    status = this.readStatus(storeKey);
    
    // check state
    // any busy or ready state or destroyed dirty state is not allowed
    if ((status & K.BUSY)  || 
        (status & K.READY) || 
        (status == K.DESTROYED_DIRTY)) { 
      throw id ? K.RECORD_EXISTS_ERROR : K.BAD_STATE_ERROR;
      
    // allow error or destroyed state only with id
    } else if (!id && (status==SC.DESTROYED_CLEAN || status==SC.ERROR)) {
      throw K.BAD_STATE_ERROR;
    }
    
    // add dataHash and setup initial status -- also save recordType
    this.writeDataHash(storeKey, (dataHash ? dataHash : {}), K.READY_NEW);
    SC.Store.replaceRecordTypeFor(storeKey, recordType);
    this.dataHashDidChange(storeKey);

    // Record is now in a committable state -- add storeKey to changelog
    changelog = this.changelog;
    if (!changelog) changelog = SC.Set.create();
    changelog.add(storeKey);
    this.changelog=changelog;
    
    // finally return materialized record
    return this.materializeRecord(storeKey) ;
  },
  
  /**
    Creates an array of new records.  You must pass an array of dataHashes 
    plus a recordType and, optionally, an array of ids.  This will create an
    array of record instances with the same record type.
    
    If you need to instead create a bunch of records with different data types
    you can instead pass an array of recordTypes, one for each data hash.
    
    @param {SC.Record|Array} recordTypes class or array of classes
    @param {Array} dataHashes array of data hashes
    @param {Array} ids (optional) ids to assign to records
    @returns {Array} array of materialized record instances.
  */
  createRecords: function(recordTypes, dataHashes, ids) {
    var ret = [], recordType, id, isArray, len = dataHashes.length, idx ;
    isArray = SC.typeOf(recordTypes) === SC.T_ARRAY;
    if (!isArray) recordType = recordTypes;
    for(idx=0;idx<len;idx++) {
      if (isArray) recordType = recordTypes[idx] || SC.Record;
      id = ids ? ids[idx] : undefined ;
      ret.push(this.createRecord(recordType, dataHashes[idx], id));
    }
    return ret ;
  },
  
  /**
    Destroys a record, removing the data hash from the store and adding the
    record to the destroyed changelog.  If you try to destroy a record that is 
    already destroyed then this method will have no effect.  If you destroy a 
    record that does not exist or an error then an exception will be raised.
    
    @param {SC.Record} recordType the recordType
    @param {String} id the record id
    @param {Number} storeKey (optional) if passed, ignores recordType and id
    @returns {SC.Store} receiver
  */
  destroyRecord: function(recordType, id, storeKey) {
    if (storeKey === undefined) storeKey = recordType.storeKeyFor(id);
    var status = this.readStatus(storeKey), changelog, K = SC.Record;

    // handle status - ignore if destroying or destroyed
    if ((status === K.BUSY_DESTROYING) || (status & K.DESTROYED)) {
      return this; // nothing to do
      
    // error out if empty
    } else if (status == K.EMPTY) {
      throw K.NOT_FOUND_ERROR ;
      
    // error out if busy
    } else if (status & K.BUSY) {
      throw K.BUSY_ERROR ;
      
    // if new status, destroy but leave in clean state
    } else if (status == K.READY_NEW) {
      status = K.DESTROYED_CLEAN ;
      
    // otherwise, destroy in dirty state
    } else status = K.DESTROYED_DIRTY ;
    
    // remove the data hash, set new status
    this.removeDataHash(storeKey, status);
    this.dataHashDidChange(storeKey);

    // add/remove change log
    changelog = this.changelog;
    if (!changelog) changelog = this.changelog = SC.Set.create();
    ((status & K.DIRTY) ? changelog.add(storeKey) : changelog.remove(storeKey));
    this.changelog=changelog;
    
    return this ;
  },
  
  /**
    Destroys a group of records.  If you have a set of record ids, destroying
    them this way can be faster than retrieving each record and destroying 
    it individually.
    
    You can pass either a single recordType or an array of recordTypes.  If
    you pass a single recordType, then the record type will be used for each
    record.  If you pass an array, then each id must have a matching record 
    type in the array.

    You can optionally pass an array of storeKeys instead of the recordType
    and ids.  In this case the first two parameters will be ignored.  This
    is usually only used by low-level internal methods.  You will not usually
    destroy records this way.
    
    @param {SC.Record|Array} recordTypes class or array of classes
    @param {Array} ids ids to destroy
    @param {Array} storeKeys (optional) store keys to destroy
    @returns {SC.Store} receiver
  */
  destroyRecords: function(recordTypes, ids, storeKeys) {
    var len, isArray, idx, id, recordType, storeKey;
    if(storeKeys===undefined){
      len = ids.length;
      isArray = SC.typeOf(recordTypes) === SC.T_ARRAY;
      if (!isArray) recordType = recordTypes;
      for(idx=0;idx<len;idx++) {
        if (isArray) recordType = recordTypes[idx] || SC.Record;
        id = ids ? ids[idx] : undefined ;
        this.destroyRecord(recordType, id, undefined);
      }
    }else{
      len = storeKeys.length;
      for(idx=0;idx<len;idx++) {
        storeKey = storeKeys ? storeKeys[idx] : undefined ;
        this.destroyRecord(undefined, undefined, storeKey);
      }
    }
    return this ;
  },
  
  /**
    Notes that the data for the given record id has changed.  The record will
    be committed to the server the next time you commit the root store.  Only
    call this method on a record in a READY state of some type.
    
    @param {SC.Record} recordType the recordType
    @param {String} id the record id
    @param {Number} storeKey (optional) if passed, ignores recordType and id
    @returns {SC.Store} receiver
  */
  recordDidChange: function(recordType, id, storeKey) {
    if (storeKey === undefined) storeKey = recordType.storeKeyFor(id);
    var status = this.readStatus(storeKey), changelog, K = SC.Record;

    // BUSY_LOADING, BUSY_CREATING, BUSY_COMMITTING, BUSY_REFRESH_CLEAN
    // BUSY_REFRESH_DIRTY, BUSY_DESTROYING
    if (status & K.BUSY) {
      throw K.BUSY_ERROR ;
      
    // if record is not in ready state, then it is not found.
    // ERROR, EMPTY, DESTROYED_CLEAN, DESTROYED_DIRTY
    } else if (!(status & K.READY)) {
      throw K.NOT_FOUND_ERROR ;
      
    // otherwise, make new status READY_DIRTY unless new.
    // K.READY_CLEAN, K.READY_DIRTY, ignore K.READY_NEW
    } else {
      if (status != K.READY_NEW) this.writeStatus(storeKey, K.READY_DIRTY);
    }
    
    // record data hash change
    this.dataHashDidChange(storeKey, null);
    
    // record in changelog
    changelog = this.changelog ;
    if (!changelog) changelog = this.changelog = SC.Set.create() ;
    changelog.add(storeKey);
    this.changelog=changelog;
    
    return this ;
  },

  /**
    Mark a group of records as dirty.  The records will be committed to the
    server the next time you commit changes on the root store.  If you have a 
    set of record ids, marking them dirty this way can be faster than 
    retrieving each record and destroying it individually.
    
    You can pass either a single recordType or an array of recordTypes.  If
    you pass a single recordType, then the record type will be used for each
    record.  If you pass an array, then each id must have a matching record 
    type in the array.

    You can optionally pass an array of storeKeys instead of the recordType
    and ids.  In this case the first two parameters will be ignored.  This
    is usually only used by low-level internal methods.  
    
    @param {SC.Record|Array} recordTypes class or array of classes
    @param {Array} ids ids to destroy
    @param {Array} storeKeys (optional) store keys to destroy
    @returns {SC.Store} receiver
  */
  recordsDidChange: function(recordTypes, ids, storeKeys) {
     var len, isArray, idx, id, recordType, storeKey;
      if(storeKeys===undefined){
        len = ids.length;
        isArray = SC.typeOf(recordTypes) === SC.T_ARRAY;
        if (!isArray) recordType = recordTypes;
        for(idx=0;idx<len;idx++) {
          if (isArray) recordType = recordTypes[idx] || SC.Record;
          id = ids ? ids[idx] : undefined ;
          storeKey = storeKeys ? storeKeys[idx] : undefined ;
          this.recordDidChange(recordType, id, storeKey);
        }
      }else{
        len = storeKeys.length;
        for(idx=0;idx<len;idx++) {
          storeKey = storeKeys ? storeKeys[idx] : undefined ;
          this.recordDidChange(undefined, undefined, storeKey);
        }
      }
      return this ;  
  },

  /**
    Retrieves a set of records from the server.  If the records has 
    already been loaded in the store, then this method will simply return.  
    Otherwise if your store has a dataSource, this will call the 
    dataSource to retrieve the record.  Generally you will not need to 
    call this method yourself. Instead you can just use find().
    
    This will not actually create a record instance but it will initiate a 
    load of the record from the server.  You can subsequently get a record 
    instance itself using materializeRecord()
    
    @param {SC.Record|Array} recordTypes class or array of classes
    @param {Array} ids ids to destroy
    @param {Array} storeKeys (optional) store keys to destroy
    @returns {Array} storeKeys to be retrieved
  */
  retrieveRecords: function(recordTypes, ids, storeKeys, _isRefresh) {

    var source  = this.get('dataSource'),
        isArray = SC.typeOf(recordTypes) === SC.T_ARRAY,
        len     = (storeKeys === undefined) ? ids.length : storeKeys.length,
        ret     = [],
        rev     = SC.Store.generateStoreKey(),
        K       = SC.Record,
        recordType, idx, storeKey, status;
        
    if (!isArray) recordType = recordTypes;

    // if no storeKeys were passed, map recordTypes + ids
    for(idx=0;idx<len;idx++) {
      
      // collect store key
      if (storeKeys) {
        storeKey = storeKeys[idx];
      } else {
        if (isArray) recordType = recordTypes[idx];
        storeKey = recordType.storeKeyFor(ids[idx]);
      }
      
      // collect status and process
      status = this.readStatus(storeKey);
      
      // K.EMPTY, K.ERROR, K.DESTROYED_CLEAN - initial retrieval
      if ((status == K.EMPTY) || (status == K.ERROR) || (status == K.DESTROYED_CLEAN)) {

        this.writeStatus(storeKey, K.BUSY_LOADING);
        this.dataHashDidChange(storeKey, rev, YES);
        ret.push(storeKey);

      // otherwise, ignore record unless isRefresh is YES.
      } else if (_isRefresh) {
        
        // K.READY_CLEAN, K.READY_DIRTY, ignore K.READY_NEW
        if (status & K.READY) {
          this.writeStatus(storeKey, K.BUSY_REFRESH | (status & 0x03)) ;
          this.dataHashDidChange(storeKey, rev, YES);
          ret.push(storeKey);

        // K.BUSY_DESTROYING, K.BUSY_COMMITTING, K.BUSY_CREATING
        } else if ((status == K.BUSY_DESTROYING) || (status == K.BUSY_CREATING) || (status == K.BUSY_COMMITTING)) {
          throw K.BUSY_ERROR ;

        // K.DESTROY_DIRTY, bad state...
        } else if (status == K.DESTROYED_DIRTY) {
          throw K.BAD_STATE_ERROR ;
          
        // ignore K.BUSY_LOADING, K.BUSY_REFRESH_CLEAN, K.BUSY_REFRESH_DIRTY
        }
      }
    }
    
    // now commit storekeys to dataSource
    if (source) {
      var ok = source.retrieveRecords.call(source, this, ret);
      if (ok === NO) ret.length = 0; // could not find.
    }
    return ret ;
  },

  _TMP_RETRIEVE_ARRAY: [],
  
  /**
    Retrieves a record from the server.  If the record has already been loaded
    in the store, then this method will simply return.  Otherwise if your 
    store has a dataSource, this will call the dataSource to retrieve the 
    record.  Generally you will not need to call this method yourself.  
    Instead you can just use find().
    
    This will not actually create a record instance but it will initiate a 
    load of the record from the server.  You can subsequently get a record 
    instance itself using materializeRecord()

    @param {SC.Record} recordType class
    @param {String} id id to retrieve
    @param {Number} storeKey (optional) store key
    @returns {Number} storeKey that was retrieved 
  */
  retrieveRecord: function(recordType, id, storeKey, _isRefresh) {
    var array = this._TMP_RETRIEVE_ARRAY,
        ret;
        
    if (storeKey !== undefined) {
      array[0] = storeKey;
      storeKey = array;
      id = null ;
    } else {
      array[0] = id;
      id = array;
    }
    
    ret = this.retrieveRecords(recordType, id, storeKey, _isRefresh);
    array.length = 0 ;
    return ret[0];
  },

  /**
    Refreshes a record from the server.  If the record has already been loaded
    in the store, then this method will request a refresh from the dataSource.
    Otherwise it will attempt to retrieve the record.
    
    @param {String} id to id of the record to load
    @param {SC.Record} recordType the expected record type
    @param {Number} storeKey (optional) optional store key
    @returns {Boolean} YES if the retrieval was a success.
  */
  refreshRecord: function(recordType, id, storeKey) {
    return this.retrieveRecord(recordType, id, storeKey, YES);
  },

  /**
    Refreshes a set of records from the server.  If the records has already been loaded
    in the store, then this method will request a refresh from the dataSource.
    Otherwise it will attempt to retrieve them.
    
    @param {SC.Record|Array} recordTypes class or array of classes
    @param {Array} ids ids to destroy
    @param {Array} storeKeys (optional) store keys to destroy
    @returns {Boolean} YES if the retrieval was a success.
  */
  refreshRecords: function(recordTypes, ids, storeKeys) {
    return this.retrieveRecords(recordTypes, ids, storeKeys, YES);
  },
    
  /**
    Commits the passed store keys.  Based on the current state of the 
    record, this will ask the data source to perform the appropriate actions
    on the store keys.
    
    @param {String} id to id of the record to load
    @param {SC.Record} recordType the expected record type

    @returns {SC.Bool} if the action was succesful.
  */
  commitRecords: function(recordTypes, ids, storeKeys) {
    var source    = this.get('dataSource'),
        isArray   = SC.typeOf(recordTypes) === SC.T_ARRAY,    
        retCreate= [], retUpdate= [], retDestroy = [], 
        rev       = SC.Store.generateStoreKey(),
        K         = SC.Record,
        recordType, idx, storeKey, status, key, ret, len ;

    // If no params are passed, look up storeKeys in the changelog property.
    // Remove any committed records from changelog property.

    if(recordTypes===undefined && ids===undefined && storeKeys===undefined){
      storeKeys=this.changelog;
    }
    len = (storeKeys === undefined) ? ids.length : storeKeys.length;
    
    for(idx=0;idx<len;idx++) {
      
      // collect store key
      if (storeKeys) {
        storeKey = storeKeys[idx];
      } else {
        if (isArray) recordType = recordTypes[idx] || SC.Record;
        else recordType = recordTypes;
        storeKey = recordType.storeKeyFor(ids[idx]);
      }
      
      // collect status and process
      status = this.readStatus(storeKey);
      
      if ((status == K.EMPTY) || (status == K.ERROR) || (status == K.DESTROYED_CLEAN)) {
        throw K.NOT_FOUND_ERROR ;
      }else{
        if(status==K.READY_NEW){
          this.writeStatus(storeKey, K.BUSY_CREATING);
          this.dataHashDidChange(storeKey, rev, YES);
          retCreate.push(storeKey);
        } else if (status==K.READY_DIRTY) {
          this.writeStatus(storeKey, K.BUSY_COMMITTING);
          this.dataHashDidChange(storeKey, rev, YES);
          retUpdate.push(storeKey);
        } else if (status==K.DESTROYED_DIRTY) {
          this.writeStatus(storeKey, K.BUSY_DESTROYING);
          this.dataHashDidChange(storeKey, rev, YES);
          retDestroy.push(storeKey);
        }
        // ignore K.READY_CLEAN, K.BUSY_LOADING, K.BUSY_CREATING, K.BUSY_COMMITTING, 
        // K.BUSY_REFRESH_CLEAN, K_BUSY_REFRESH_DIRTY, KBUSY_DESTROYING
      }
    }   
      
    // now commit storekeys to dataSource
    if (source) ret=source.commitRecords.call(source, this, retCreate, retUpdate, retDestroy);
    //remove all commited changes from changelog
    if (ret && recordTypes===undefined && ids===undefined && storeKeys===this.changelog){ 
      this.changelog=null; 
    }
    return ret ;
  },

  /**
    Commits the passed store key.  Based on the current state of the 
    record, this will ask the data source to perform the appropriate action
    on the store key.
    
    You have to pass either the id or the storeKey otherwise it will return NO.
    
    @param {String} id to id of the record to load
    @param {SC.Record} recordType the expected record type

    @returns {SC.Bool} if the action was succesful.
  */
  commitRecord: function(recordType, id, storeKey) {
    var array = this._TMP_RETRIEVE_ARRAY,
        ret ;
    if (id === undefined && storeKey === undefined ) return NO;
    if (storeKey !== undefined) {
      array[0] = storeKey;
      storeKey = array;
      id = null ;
    } else {
      array[0] = id;
      id = array;
    }
    
    ret = this.commitRecords(recordType, id, storeKey);
    array.length = 0 ;
    return ret;
  },
  
  /**
    Cancels an inflight request for the passed records.  Depending on the 
    server implementation, this could cancel an entire request, causing 
    other records to also transition their current state.
    
    @param {SC.Record|Array} recordTypes class or array of classes
    @param {Array} ids ids to destroy
    @param {Array} storeKeys (optional) store keys to destroy
    @returns {SC.Store} the store.
  */
  cancelRecords: function(recordTypes, ids, storeKeys) {
    var source  = this.get('dataSource'),
        isArray = SC.typeOf(recordTypes) === SC.T_ARRAY,
        K       = SC.Record,
        ret     = [],
        status, len, idx, id, recordType, storeKey;
        
    len = (storeKeys === undefined) ? ids.length : storeKeys.length;
    for(idx=0;idx<len;idx++) {
      if (isArray) recordType = recordTypes[idx] || SC.Record;
      else recordType = recordTypes || SC.Record;
      
      id = ids ? ids[idx] : undefined ;
      
      if(storeKeys===undefined){
        storeKey = recordType.storeKeyFor(id);
      }else{
        storeKey = storeKeys ? storeKeys[idx] : undefined ;        
      }
      if(storeKey) {
        status = this.readStatus(storeKey);

        if ((status == K.EMPTY) || (status == K.ERROR)) {
          throw K.NOT_FOUND_ERROR ;
        }
        ret.push(storeKey);
      }
    }
    
    if (source) source.cancel.call(source, this, ret);
    
    return this ;
  },

  /**
    Cancels an inflight request for the passed record.  Depending on the 
    server implementation, this could cancel an entire request, causing 
    other records to also transition their current state.
  
    @param {SC.Record|Array} recordTypes class or array of classes
    @param {Array} ids ids to destroy
    @param {Array} storeKeys (optional) store keys to destroy
    @returns {SC.Store} the store.
  */
  cancelRecord: function(recordType, id, storeKey) {
    var array = this._TMP_RETRIEVE_ARRAY,
        ret ;
        
    if (storeKey !== undefined) {
      array[0] = storeKey;
      storeKey = array;
      id = null ;
    } else {
      array[0] = id;
      id = array;
    }
    
    ret = this.cancelRecords(recordType, id, storeKey);
    array.length = 0 ;
    return this;
  },
  
  /** 
    Convenience method can be called by the store or other parts of your 
    application to load records into the store.  This method will take a
    recordType and an array of data hashes and either add or update the 
    record in the store. 
    
    The loaded records will be in an SC.Record.READY_CLEAN state, indicating
    they were loaded from the data source and do not need to be committed 
    back before changing.
    
    This method is implemented by calling pushRetrieve().  The standard
    state constraints for that method apply here.
    
    If you are upgrading from a pre SproutCore 1.0 application, this method 
    is the closest to the old updateRecords().
    
    @param {SC.Record} recordTypes the record type or array of record types
    @param {Array} dataHashes array of data hashes to update
    @param {Array} ids optional array of ids.  if not passed lookup on hashes
    @returns {Array} store keys assigned to these ids
  */
  loadRecords: function(recordTypes, dataHashes, ids) {
    var isArray = SC.typeOf(recordTypes) === SC.T_ARRAY,
        len     = dataHashes.get('length'),
        ret     = [],
        recordType, id, primaryKey, idx, dataHash, storeKey;
        
    // save lookup info
    if (!isArray) {
      recordType = recordTypes || SC.Record;
      primaryKey = recordType.prototype.primaryKey ;
    }
    
    // push each record
    for(idx=0;idx<len;idx++) {
      dataHash = dataHashes.objectAt(idx);
      if (isArray) {
        recordType = recordTypes.objectAt(idx) || SC.Record;
        primaryKey = recordType.prototype.primaryKey ;
      } 
      id = (ids) ? ids.objectAt(idx) : dataHash[primaryKey];
      ret[idx] = storeKey = recordType.storeKeyFor(id); // needed to cache
      this.pushRetrieve(recordType, id, dataHash, storeKey);
    }
    
    // return storeKeys
    return ret ;
  },
  
  // ..........................................................
  // DATA SOURCE CALLBACKS
  // 
  // Mathods called by the data source on the store

  /**
    Called by a dataSource when it cancels an inflight operation on a 
    record.  This will transition the record back to it non-inflight state.
    
    @param {Number} storeKey record store key to cancel
    @returns {SC.Store} reciever
  */
  dataSourceDidCancel: function(storeKey) {
    var status = this.readStatus(storeKey), 
        K      = SC.Record;
    
    // EMPTY, ERROR, READY_CLEAN, READY_NEW, READY_DIRTY, DESTROYED_CLEAN,
    // DESTROYED_DIRTY
    if (!(status & K.BUSY)) {
      throw K.BAD_STATE_ERROR; // should never be called in this state
      
    }
    
    // otherwise, determine proper state transition
    switch(status) {
      case K.BUSY_LOADING:
        status = K.EMPTY;
        break ;
      
      case K.BUSY_CREATING:
        status = K.READY_NEW;
        break;
        
      case K.BUSY_COMMITTING:
        status = K.READY_DIRTY ;
        break;
        
      case K.BUSY_REFRESH_CLEAN:
        status = K.READY_CLEAN;
        break;
        
      case K.BUSY_REFRESH_DIRTY:
        status = K.READY_DIRTY ;
        break ;
        
      case K.BUSY_DESTROYING:
        status = K.DESTROYED_DIRTY ;
        break;
        
      default:
        throw K.BAD_STATE_ERROR ;
    } 
    this.writeStatus(storeKey, status) ;
    this.dataHashDidChange(storeKey, null, YES);
    
    return this ;
  },
  
  /**
    Called by a data source when it creates or commits a record.  Passing an
    optional id will remap the storeKey to the new record id.  This is 
    required when you commit a record that does not have an id yet.
    
    @param {Number} storeKey record store key to change to READY_CLEAN state
    @returns {SC.Store} reciever
  */
  dataSourceDidComplete: function(storeKey, dataHash, newId) {
    var status = this.readStatus(storeKey), K = SC.Record;
    
    // EMPTY, ERROR, READY_CLEAN, READY_NEW, READY_DIRTY, DESTROYED_CLEAN,
    // DESTROYED_DIRTY
    if (!(status & K.BUSY)) {
      throw K.BAD_STATE_ERROR; // should never be called in this state
      
    }
    
    // otherwise, determine proper state transition
    if(status==K.BUSY_DESTROYING) {
      throw K.BAD_STATE_ERROR ;
    } else status = K.READY_CLEAN ;

    this.writeStatus(storeKey, status) ;
    if (dataHash) this.writeDataHash(storeKey, dataHash, status) ;
    if (newId) SC.Store.replaceIdFor(storeKey, newId);
    this.dataHashDidChange(storeKey);
    
    return this ;
  },
  
  /**
    Called by a data source when it has destroyed a record.  This will
    transition the record to the proper state.
    
    @param {Number} storeKey record store key to cancel
    @returns {SC.Store} reciever
  */
  dataSourceDidDestroy: function(storeKey) {
    var status = this.readStatus(storeKey), K = SC.Record;

    // EMPTY, ERROR, READY_CLEAN, READY_NEW, READY_DIRTY, DESTROYED_CLEAN,
    // DESTROYED_DIRTY
    if (!(status & K.BUSY)) {
      throw K.BAD_STATE_ERROR; // should never be called in this state
    }
    // otherwise, determine proper state transition
    else{
      status = K.DESTROYED_CLEAN ;
    } 
    this.removeDataHash(storeKey, status) ;
    this.dataHashDidChange(storeKey);

    return this ;
  },

  /**
    Converts the passed record into an error object.
    
    @param {Number} storeKey record store key to cancel
    @returns {SC.Store} reciever
  */
  dataSourceDidError: function(storeKey, error) {
    var status = this.readStatus(storeKey), K = SC.Record;

    // EMPTY, ERROR, READY_CLEAN, READY_NEW, READY_DIRTY, DESTROYED_CLEAN,
    // DESTROYED_DIRTY
    if (!(status & K.BUSY)) {
      throw K.BAD_STATE_ERROR; // should never be called in this state
    }
    // otherwise, determine proper state transition
    else{
      status = error ;
    } 
    this.writeStatus(storeKey, status) ;
    this.dataHashDidChange(storeKey, null, YES);

    return this ;
  },

  // ..........................................................
  // PUSH CHANGES FROM DATA SOURCE
  // 
  
  pushRetrieve: function(recordType, id, dataHash, storeKey) {
    var K = SC.Record, status;
    
    if(storeKey===undefined){
      storeKey = recordType.storeKeyFor(id);
    }
    status = this.readStatus(storeKey);
    if(status==K.EMPTY || status==K.ERROR || status==K.READY_CLEAN || status==K.DESTROY_CLEAN){ 
      status = K.READY_CLEAN;
      if(dataHash===undefined) this.writeStatus(storeKey, status) ;
      else this.writeDataHash(storeKey, dataHash, status) ;
      this.dataHashDidChange(storeKey);
      
      return YES;
    }
    //conflicted (ready)
    return NO;
  },
  
  pushDestroy: function(recordType, id, storeKey) {
    var K = SC.Record, status;

    if(storeKey===undefined){
      storeKey = recordType.storeKeyFor(id);
    }
    status = this.readStatus(storeKey);
    if(status==K.EMPTY || status==K.ERROR || status==K.READY_CLEAN || status==K.DESTROY_CLEAN){
      status = K.DESTROY_CLEAN;
      this.removeDataHash(storeKey, status) ;
      this.dataHashDidChange(storeKey);
      return YES;
    }
    //conflicted (destroy)
    return NO;
  },

  pushError: function(recordType, id, error, storeKey) {
    var K = SC.Record, status;

    if(storeKey===undefined){
      storeKey = recordType.storeKeyFor(id);
    }
    status = this.readStatus(storeKey);
    if(status==K.EMPTY || status==K.ERROR || status==K.READY_CLEAN || status==K.DESTROY_CLEAN){
      status = error;
      this.writeStatus(storeKey, status) ;
      this.dataHashDidChange(storeKey, null, YES);
      return YES;
    }
    //conflicted (error)
    return NO;
  },
  
  // ..........................................................
  // INTERNAL SUPPORT
  // 
  
  init: function() {
    sc_super();
    this.reset();
  },


  // ..........................................................
  // PRIMARY KEY CONVENIENCE METHODS
  // 

  /** 
    Given a storeKey, return the primaryKey.
  
    @param {Number} storeKey the store key
    @returns {String} primaryKey value
  */
  idFor: function(storeKey) {
    return SC.Store.idFor(storeKey);
  },
  
  /**
    Given a storeKey, return the recordType.
    
    @param {Number} storeKey the store key
    @returns {SC.Record} record instance
  */
  recordTypeFor: function(storeKey) {
    return SC.Store.recordTypeFor(storeKey) ;
  },
  
  /**
    Given a recordType and primaryKey, find the storeKey.
    
    @param {SC.Record} recordType the record type
    @param {String} primaryKey the primary key
    @returns {Number} storeKey
  */
  storeKeyFor: function(recordType, primaryKey) {
    return recordType.storeKeyFor(primaryKey);
  }
  
}) ;

SC.Store.mixin({
  
  CHAIN_CONFLICT_ERROR: new Error("Nested Store Conflict"),
  NO_PARENT_STORE_ERROR: new Error("Parent Store Required"),
  NESTED_STORE_UNSUPPORTED_ERROR: new Error("Unsupported In Nested Store"),

  EDITABLE:  'editable',
  LOCKED:    'locked',
  INHERITED: 'inherited',
  
  /** @private
    This array maps all storeKeys to primary keys.  You will not normally
    access this method directly.  Instead use the idFor() and 
    storeKeyFor() methods on SC.Record.
  */
  idsByStoreKey: [],
  
  /** @private
    Maps all storeKeys to a recordType.  Once a storeKey is associated with 
    a primaryKey and recordType that remains constant throughout the lifetime
    of the application.
  */
  recordTypesByStoreKey: [],
  
  /** @private
    The next store key to allocate.  A storeKey must always be greater than 0
  */
  nextStoreKey: 1,
  
  generateStoreKey: function() { return this.nextStoreKey++; },
  
  /** 
    Given a storeKey returns the primaryKey associated with the key.
    If not primaryKey is associated with the storeKey, returns null.
    
    @param {Number} storeKey the store key
    @returns {String} the primary key or null
  */
  idFor: function(storeKey) {
    return this.idsByStoreKey[storeKey] ;
  },
  
  /**
    Given a storeKey returns the SC.Record class associated with the key.
    If no record type is associated with the store key, returns null.
    
    @param {Number} storeKey the store key
    @returns {String} the primary key or null
  */
  recordTypeFor: function(storeKey) {
    return this.recordTypesByStoreKey[storeKey];
  },
  
  /**
    Swaps the primaryKey mapped to the given storeKey with the new 
    primaryKey.  If the storeKey is not currently associated with a record
    this will raise an exception.
    
    @param {Number} storeKey the existing store key
    @param {String} newPrimaryKey the new primary key
    @returns {SC.Store} receiver
  */
  replaceIdFor: function(storeKey, primaryKey) {
    var recordType = this.recordTypeFor(storeKey);
    if (!recordType) {
      throw "replaceIdFor: storeKey %@ does not exist".fmt(storeKey);
    }
    
    // map one direction...
    var oldPrimaryKey = this.idsByStoreKey[storeKey];
    this.idsByStoreKey[storeKey] = primaryKey ;
    
    // then the other...
    var storeKeys = recordType.storeKeysById ;
    if (!storeKeys) storeKeys = recordType.storeKeysById = {};
    delete storeKeys[oldPrimaryKey];
    storeKeys[primaryKey] = storeKey;     
    
    return this ;
  },
  
  /**
    Swaps the recordType recorded for a given storeKey.  Normally you should
    not call this method directly as it can damage the store behavior.  This
    method is used by other store methods to set the recordType for a 
    storeKey.
    
    @param {Integer} storeKey the store key
    @param {SC.Record} recordType a record class
    @returns {SC.Store} reciever
  */
  replaceRecordTypeFor: function(storeKey, recordType) {
    this.recordTypesByStoreKey[storeKey] = recordType;
    return this ;
  }
    
});


SC.Store.prototype.nextStoreIndex = 1;

// ..........................................................
// COMPATIBILITY
// 

/** @private
  global store is used only for deprecated compatibility methods.  Don't use
  this in real code.
*/
SC.Store._getDefaultStore = function() {
  var store = this._store;
  if(!store) this._store = store = SC.Store.create();
  return store;
};

/** @deprecated 
  Included for compatibility, loads data hashes with the named recordType. 
  If no recordType is passed, expects to find a recordType property in the 
  data hashes.  dataSource and isLoaded params are ignored.
  
  Calls SC.Store#loadRecords() on the default store. Do not use this method in 
  new code.  
  
  @param {Array} dataHashes data hashes to import
  @param {Object} dataSource ignored
  @param {SC.Record} recordType default record type
  @param {Boolean} isLoaded ignored
  @returns {Array} SC.Record instances for loaded data hashes
*/
SC.Store.updateRecords = function(dataHashes, dataSource, recordType, isLoaded) {
  var store = this._getDefaultStore(),
      len   = dataHashes.length,
      idx, ret;
      
  // if no recordType was passed, build an array of recordTypes from hashes
  if (!recordType) {
    recordType = [];
    for(idx=0;idx<len;idx++) recordType[idx] = dataHashes[idx].recordType;
  }
  
  // call new API.  Returns storeKeys
  ret = store.loadRecords(recordType, dataHashes);
  
  // map to SC.Record instances
  len = ret.length;
  for(idx=0;idx<len;idx++) ret[idx] = store.materializeRecord(ret[idx]);
  
  return ret ;
};

/** @deprecated
  Finds a record with the passed guid on the default store.  This is included
  only for compatibility.  You should use the newer find() method defined on
  SC.Store instead.
  
  @param {String} guid the guid
  @param {SC.Record} recordType expected record type
  @returns {SC.Record} found record
*/
SC.Store.find = function(guid, recordType) {
  return this._getDefaultStore().find(recordType, guid);
};

/** @deprecated 
  Passes through to findAll on default store.  This is included only for 
  compatibility.  You should use the newer findAll() defined on SC.Store
  instead.
  
  @param {Hash} filter search parameters
  @param {SC.Record} recordType type of record to find
  @returns {SC.RecordArray} result set
*/
SC.Store.findAll = function(filter, recordType) {
  return this._getDefaultStore().findAll(filter, recordType);
};
