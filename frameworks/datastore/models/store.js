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

  /**
    An array of all the chained stores that current rely on the receiver 
    store.
    
    @property {Array}
  */
  chainedStores: null,

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
    The current status of a data hash indexed by store key,  May be one
    of SC.RECORD_NEW, SC.RECORD_LOADING, SC.RECORD_READY, SC.RECORD_DESTROYED,
    SC.RECORD_EMPTY, SC.RECORD_ERROR.

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

  /** @private
    Array contains the base revision for an attribute hash when it was first
    cloned from the parent store.  If the attribute hash is edited and 
    commited, the commit will fail if the parent attributes hash has been 
    edited since.
    
    This is a form of optimistic locking, hence the name.
    
    Each store gets its own array of locks, which are selectively populated
    as needed.
    
    Note that this is kept as an array because it will be stored as a dense 
    array on some browsers, making it faster.
    
    @property {Array}
  */
  locks: null,

  /**
    Array contains number indicating whether the related attributes have 
    been cloned yet or not.
    
    Each store gets it own cloned array.
  
    Note that this is kept as an array because it will be stored as a dense 
    array on some browsers, making it faster.
    
    @property {Array}
  */
  editables: null,
    
  /** @private
    An array that includes the store keys that have changed since the store
    was last committed.  This array is used to sync data hash changes between
    chained stores.  For a log changes that may actually be committed back to
    the server see the changelog property.
    
    @property {Array}
  */
  changedDataHashes: null,
  
  /**
    Log of changed storeKeys that need to be persisted back to the dataSource.
  
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
    Returns the data hash for the given storeKey.  This will also 'lock'
    the hash so that further edits to the parent store will no 
    longer be reflected in this store until you reset.
    
    @param {Number} storeKey key to retrieve
    @returns {Hash} data hash or null
  */
  readDataHash: function(storeKey) {
    var ret = this.dataHashes[storeKey], locks = this.locks, rev;
    if (!ret || (locks && locks[storeKey])) return ret ; // already locked
    
    // lock attributes hash to the current version.
    // copy references for prototype-based objects and save the current 
    // revision number in the locks array so we can check for conflicts when
    // committing changes later.
    if (!locks) locks = this.locks = [];
    this.dataHashes[storeKey] = this.dataHashes[storeKey]; 
    this.statuses[storeKey] = this.statuses[storeKey];
    rev = this.revisions[storeKey] = this.revisions[storeKey];
    locks[storeKey] = rev || 1;
    
    return ret ;
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
    
    // get the data hash.  use readDataHash() to handle locking
    var ret = this.readDataHash(storeKey);
    if (!ret) return ret ; // nothing to do.

    // now if the attributes have not been cloned 
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
    var locks = this.locks, rev ;
    
    // update dataHashes and optionally status.  Note that if status is not
    // passed, we want to copy the reference to the status anyway to lock it
    // in.
    if (hash) this.dataHashes[storeKey] = hash;
    this.statuses[storeKey] = status ? status : (this.statuses[storeKey] || SC.RECORD_NEW);
    rev = this.revisions[storeKey] = this.revisions[storeKey]; // copy ref
    
    // make sure we lock if needed.
    if (!locks) locks = this.locks = [];
    if (!locks[storeKey]) locks[storeKey] = rev || 1;
    
    // also note that this hash is now editable
    var editables = this.editables;
    if (!editables) editables = this.editables = [];
    editables[storeKey] = 1 ; // use number for dense array support
    
    return this ;
  },

  /**
    Removes the data hash from the store.  This does not imply a deletion of
    the record.  You could be simply unloading the record.  Eitherway, 
    removing the dataHash will be synced back to the parent store.
    
    Note that you can optionally pass a new status to go along with this. If
    you do not pass a status, it will change the status to SC.RECORD_EMPTY
    (assuming you just unloaded the record).  If you are deleting the record
    you may set it to SC.RECORD_DESTROYED.
    
    Be sure to also call dataHashDidChange() to register this change.
    
    @param {Number} storeKey
    @param {String} status optional new status
    @returns {SC.Store} reciever
  */
  removeDataHash: function(storeKey, status) {

    var rev ;
    // if we don't already have a dataHash, do nothing.
    if (!this.dataHashes[storeKey]) return this;
    
     // don't use delete -- that will allow parent dataHash to come through
    this.dataHashes[storeKey] = null;  
    this.statuses[storeKey] = status || SC.RECORD_EMPTY;
    rev = this.revisions[storeKey] = this.revisions[storeKey]; // copy ref
    
    // record optimistic lock revision
    var locks = this.locks;
    if (!locks) locks = this.locks = [];
    if (!locks[storeKey]) locks[storeKey] = rev || 1;
    
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
    return this.statuses[storeKey];
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
    do the book-keeping necessary to track the change across stores.
    
    @param {Number|Array} storeKeys one or more store keys that changed
    @returns {SC.Store} receiver
  */
  dataHashDidChange: function(storeKeys, rev) {
    
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

      // add storeKey to changed set.
      var changes = this.changedDataHashes;
      if (!changes) changes = this.changedDataHashes = SC.Set.create();
      changes.add(storeKey);
    }
    
    // note that we now have changes
    this.setIfChanged('hasChanges', YES);
    
    return this ;
  },
  
  // ..........................................................
  // STORE CHAINING
  // 
  
  /**
    
    Returns a new chained store instance that can be used to buffer changes
    until you are ready to commit them.  When you are ready to commit your 
    changes, call commitChanges() or destroyChanges() and then destroy() when
    you are finished with the chained store altogether.
    
    {{{
      store = MyApp.store.chain();
      .. edit edit edit
      store.commitChanges().destroy();
    }}}
    
    @returns {SC.Store} Returns a new store that is child from this one.
  */
  chain: function() {
    var childStore = SC.Store.create({ parentStore: this });
    this.childStores.push(childStore);
    return childStore;
  },
  
  /**
    When you are finished working with a chained store, call this method to 
    tear it down.  This will also discard any pending changes.
    
    @returns {SC.Store} receiver
  */
  destroy: function() {
    this.discardChanges();
    
    var parentStore = this.get('parentStore');
    if (parentStore) parentStore.willDestroyChildStore(this);
    
    sc_super();  
    return this ;
  },
  
  /** @private
  
    Called by a child store just before it is destroyed so that the parent
    can remove the child from its list of child stores.
    
    @returns {SC.Store} receiver
  */
  willDestroyChildStore: function(childStore) {
    this.childStores.removeObject(childStore);
    return this ;
  },
  
  /** @private
    Called by a childStore on a parent store to commit any changes from the
    childStore.  This will copy any changed dataHashes as well as any 
    persistant change logs.
    
    If the parentStore detects a conflict with the optimistic locking, it will
    raise an exception before it makes any changes.  If you pass the 
    force flag then this detection phase will be skipped and the changes will
    be applied even if another resource has modified the store in the mean
    time.
  
    @param {SC.Store} childStore the child store
    @param {Array} changes the array of changed store keys
    @param {Boolean} force
    @returns {SC.Store} receiver
  */
  commitChangesFromStore: function(childStore, changes, force)
  {
    // first, check for optimistic locking problems
    var len = changes.length, i, storeKey;
    var ch_locks = childStore.locks, my_revisions = this.revisions, lock, rev;
    if (!force && ch_locks && my_revisions) { 
      for(i=0;i<len;i++) {
        storeKey = changes[i];
        lock = ch_locks[storeKey] || 1;
        rev  = my_revisions[storeKey] || 1;
        
        // if the save revision for the item does not match the current rev
        // the someone has changed the data hash in this store and we have
        // a conflict. 
        if (lock < rev) {
          throw "conflict: storeKey %@ was changed in parent".fmt(storeKey);
        }
      }   
    }
    
    // OK, no locking issues.  So let's just copy them changes. 
    // get local reference to values.
    var my_dataHashes, ch_dataHashes, ch_revisions, my_statuses, ch_statuses;
    var my_changes, my_locks, my_editables ;
    my_dataHashes = this.dataHashes;
    my_statuses   = this.statuses;
    my_changes    = this.changedDataHashes ;
    my_locks      = this.locks ;
    my_editables  = this.editables ;

    // setup some arrays if needed
    if (!my_changes) my_changes = this.changedDataHashes = SC.Set.create();
    if (!my_locks) my_locks = this.locks = [];
    if (!my_editables) my_editables = this.editables = [] ;
    
    ch_dataHashes = childStore.dataHashes;
    ch_revisions  = childStore.revisions ;
    ch_statuses   = childStore.statuses;

    for(i=0;i<len;i++) {
      storeKey = changes[i];

      // save my own lock if needed.
      if (!my_locks[storeKey]) my_locks[storeKey] = my_revisions[storeKey]||1;

      // now copy changes
      my_dataHashes[storeKey] = ch_dataHashes[storeKey];
      my_statuses[storeKey]   = ch_statuses[storeKey];
      my_revisions[storeKey]  = ch_revisions[storeKey];
      
      my_changes.add(storeKey);
      my_editables[storeKey] = 0 ; // always make dataHash no longer editable
      
      // TODO: Notify record instances if they exist that they changed
    }
    
    // TODO: Copy changelog.
    
    // Changes copied.  Now mark this store as dirty since we have changes.
    this.setIfChanged('hasChanges', YES);
    return this ;
  },

  /**
    Resets a store's data hash contents to match its parent.
    
    @returns {SC.Store} receiver
  */
  reset: function() {
    
    // if we have a transient parent store, then we can just respawn from 
    // its properties
    var parentStore = this.get('parentStore');
    if(parentStore && parentStore.get('isTransient')) {
      this.dataHashes = SC.beget(parentStore.dataHashes);
      this.revisions  = SC.beget(parentStore.revisions);
      this.statuses   = SC.beget(parentStore.statuses);
    }
    
    // also, reset private temporary objects
    this.changedDataHashes = this.locks = this.editables = null;
    this.changelog = null ;

    // notify record instances that they may have changed
    var records = this.records, idx, len = records ? records.length : 0 ;
    for(idx=0;idx<len;idx++) records[idx].storeDidChangeAttributes();
    

    this.set('hasChanges', NO);
  },
  
  /**
    Propagate this store's changes to it's parent.  If the store does not 
    have a parent, this has no effect other than to clear the change set.

    @param {Boolean} force if YES, does not check for conflicts first
    @returns {SC.Store} receiver
  */
  commitChanges: function(force) {
    var parentStore = this.get('parentStore');
    if (parentStore) {
      parentStore.commitChangesFromStore(this, this.changedDataHashes, force);
    }
    this.reset(); // clear out custom changes 
    return this ;
  },

  /**
    Discard the changes made to this store and reset the store.
    
    @returns {SC.Store} receiver
  */
  discardChanges: function() {
    this.reset();
    return this ;
  },

  // ..........................................................
  // HIGH-lEVEL RECORD API
  // 
  
  
  /**
    Finds a record instance with the specified recordType and id, returning 
    the record instance.  If no matching record could be found, returns null.
    
    Note that if you try to find a record id that does not exist in memory,
    a dataSource may load it from ths server.  In this case, this method will
    return a record instance with a status of SC.RECORD_LOADING to indicate
    that it is still fetching the data from the server.
    
    @param {SC.Record} recordType the expected record type
    @param {String} id the id to load
    @returns {SC.Record} record instance or null
  */
  find: function(recordType, id) {
    // first attempt to find the record in the local store
    var storeKey = recordType.storeKeyFor(id);
    if (this.readStatus(storeKey) === SC.RECORD_EMPTY) {
      recordType = this.retrieveRecord(recordType, id);
      storeKey = recordType ? recordType.storeKeyFor(id) : null ;
    }
    
    // now we have the storeKey, materialize the record and return it.
    return storeKey ? this.materializeRecord(storeKey) : null ;
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
    if (!records) records = this.records = []; // load cached records
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
  // LOW-LEVEL RECORDS API
  // 
  // The methods in this section can be used to manipulate records without 
  // actually creating record instances.
  
  /**
    Creates a new record instance with the passed recordType and dataHash.
    You can also optionally specify an id or else it will be pulled from the 
    data hash.

    Note that the record will not yet be saved back to the server.  To save
    a record to the server, call commitChanges() on the store.

    The behavior of this method will change slightly depending on the 
    record state:
    
    - NEW, LOADING, READY: If the record is already in the data hashes, you
      cannot create a record with the same id.

    - EMPTY, ERROR: An empty record or an error state can be overwritten

    - DESTROYED: you can overwrite a destroyed record.  If you destroy a 
      record and then create it again before committing your changes that will 
      be treated as an update.

    @param {SC.Record} recordType the record class to use on creation
    @param {Hash} dataHash the JSON attributes to assign to the hash.
    @param {String} id (optional) id to assign to record

    @returns {SC.Record} Returns the created record
  */
  createRecord: function(recordType, dataHash, id) {

    var primaryKey, storeKey, changelog, status, isRecreated = NO, destroyed;
    
    // First, try to get an id.  If no id is passed, look it up in the 
    // dataHash.
    if (!id && (primaryKey = recordType.prototype.primaryKey)) {
      id = dataHash[primaryKey];
    }
    
    // Next get the storeKey - base on id if available
    storeKey = id ? recordType.storeKeyFor(id) : SC.Store.generateStoreKey();

    // now, check the state and do the right thing.
    status = this.readStatus(storeKey);
    switch(status) {
      // illegal states - throw exception
      case SC.RECORD_NEW:
      case SC.RECORD_LOADING:
      case SC.RECORD_READY:
        throw "%@(id:%@) already exists".fmt(recordType, id);
        
      // destroyed stay - may actually be an update
      case SC.RECORD_DESTROYED:
        isRecreated = YES ;
        status = SC.RECORD_READY ;
        break; 
        
      // otherwise just let pass
      default:
        status = SC.RECORD_NEW ;
        break;
    }
    
    // add dataHash and setup initial status -- also save recordType
    this.writeDataHash(storeKey, dataHash, status);
    SC.Store.replaceRecordTypeFor(storeKey, recordType);
    
    // add to changelog 
    changelog = this.changelog;
    if (!changelog) changelog = this.changelog = {};

    // if recreating and the storeKey is in the destroyed changelog, then
    // treat this like an update instead of a create since you can't store a
    // record in both destroyed & created sets.
    destroyed = changelog.destroyed ;
    if (isRecreated && destroyed && destroyed.contains(storeKey)) {      
      destroyed.remove(storeKey);
      changelog = changelog.updated || (changelog.updated = SC.Set.create());

    // otherwise, just add to created changelog
    } else {
      changelog = changelog.created || (changelog.created = SC.Set.create());
    }
    changelog.add(storeKey);
    
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
    record to the destroyed changelog.  Note that you can only destroy a 
    record that is in the SC.RECORD_NEW, SC.RECORD_LOADING, or SC.RECORD_READY
    state.  If you try to destroy a record that is already destroyed then
    this method will have no effect.  If you destroy a record that does not 
    exist or an error then an exception will be raised.
    
    @param {SC.Record} recordType the recordType
    @param {String} id the record id
    @param {Number} storeKey (optional) if passed, ignores recordType and id
    @returns {SC.Store} receiver
  */
  destroyRecord: function(recordType, id, storeKey) {
    if (storeKey === undefined) storeKey = recordType.storeKeyFor(id);
    var status = this.readStatus(storeKey), changelog, created, updated;

    // record is already destroyed or does not exist.  destroy
    if ((status === SC.RECORD_EMPTY) || (status === SC.RECORD_DESTROYED)) {
      return this ;

    // record is in error state, throw exception
    } else if (status === SC.RECORD_ERROR) {
      if (!recordType) recordType = SC.Store.recordTypeFor(storeKey);
      if (!id) id = SC.Store.idFor(storeKey);
      throw "Cannot destroy %@(id: %@) because it in error state".fmt(recordType, id);

    }

    // remove the data hash, set new status
    this.removeDataHash(storeKey, SC.RECORD_DESTROYED);

    changelog = this.changelog;
    if (!changelog) changelog = this.changelog = {};
    created = changelog.created;

    // if changelog has record in created set, just remove it
    if (created && created.contains(storeKey)) {
      created.remove(storeKey);
      
    // otherwise, remove from updated changelog if needed and add to destroyed
    } else {
      updated = changelog.updated;
      if (updated && updated.contains(storeKey)) updated.remove(storeKey);
      changelog = changelog.destroyed || (changelog.destroyed = SC.Set.create());
      changelog.add(storeKey);
    }
    
    return this ;
  },
  
  /**
    Called by a record whenever its attribute contents may have changed.
    You can call this method yourself to indicate that a record has been 
    updated and needs to be committed back to the server, passing in the 
    recordType and id or the storeKey without materializing a record first.

    This method only has an effect on records that are in a READY state.
    You cannot change a record that is new, destroyed, or still loading.
    
    @param {SC.Record} recordType the recordType
    @param {String} id the record id
    @param {Number} storeKey (optional) if passed, ignores recordType and id
    @returns {SC.Store} receiver
  */
  recordDidChange: function(recordType, id, storeKey) {
    if (storeKey === undefined) storeKey = recordType.storeKeyFor(id);
    if (this.readStatus(storeKey) !== SC.RECORD_READY) return this;
    
    this.dataHashDidChange(storeKey); // record data hash change
    
    // record in changelog
    var changelog = this.changelog, created, updated;
    if (!changelog) changelog = this.changelog = {} ;
    created = changelog.created;
    if (!created || !created.contains(storeKey)) {
      updated = changelog.updated;
      if (!updated) updated = changelog.updated = SC.Set.create();
      updated.add(storeKey);
    }
    
    return this ;
  },

  /**
    Initiates a record retrieval. If your store has a datasource, this will
    call the dataSource to retrieve the record.  Generally you will not need 
    to call this method yourself.  Instead you can just use find().
    
    This will not actually create a record instance but it will initiate a 
    load of the record from the server.  You can subsequently get a record 
    instance itself using materializeRecord()
    
    @param {String} id to id of the record to load
    @param {SC.Record} recordType the expected record type

    @returns {SC.Record} the actual recordType you should use to instantiate.
  */
  retrieveRecord: function(recordType, id) {
    var source = (this.get('parentStore') || this.get('dataSource'));
    return source ? source.retrieveRecord(id, recordType) : null ;
  },

  /**
    Commits the passed store keys.  Based on the current state of the 
    record, this will ask the data source to perform the appropriate actions
    on the store keys.
    
    @param {String} id to id of the record to load
    @param {SC.Record} recordType the expected record type

    @returns {SC.Record} the actual recordType you should use to instantiate.
  */
  commitRecords: function(recordType, ids) {
  },
  
  
  // ..........................................................
  // DATA SOURCE API
  // 
  // Methods used to interact with the dataSource

  /**
    Called by the dataSource whenever it has created a record.  Pass the 
    record storeKey along with the record's new id.  This will change the 
    record state to SC.RECORD_READY.
    
    @param {Number} storeKey the storeKey of the created record
    @param {String} id the new record id
    @returns {SC.Store} receiver
  */
  dataSourceDidCreateRecord: function(storeKey, id) {  
    this.replaceIdFor(storeKey, id); // fix it up
    this.writeStatus(storeKey, SC.RECORD_READY);
    
    // TODO: Notify child stores that the record status and id have changed
    // TODO: Notify relevant record that status and id have changed
  },
  
  /**
    Called by the dataSource to load record data into the store.  This will
    add the record data to the store and update existing records, possibly 
    notifying the record instances that their content has changed.
    
    @param {SC.Record|Array} recordTypes a record type or array of types
    @param {Array} dataHashes array of data hashes to load
    @param {Array} id (optional) array of ids for dataHashes
    @param {Array} statuses (optional) array of statuses
    @returns {Array} store keys for created records
  */
  dataSourceDidLoadRecords: function(recordTypes, dataHashes, ids, statuses) {
    
  },
  
  /**
    Creates or updates the store's attributes.  This does not create 
    SC.Record instances, but it will clear their attribute caches as needed.
    Usually you will not need to work directly with this method.  Instead 
    you should use the higher-level SC.Record or other APIs.

    Note that for the statuses
    h2. Example: Loading Attributes From The Server
    
    {{{
      store.updateAttributes(attrs, MyApp.Contact, 'guid', YES)
    }}}
    
    h2. Example: Editing An Existing Attribute Hash
    
    {{{
      store.upateAttributes([attrs], MyApp.Contact, 'guid', NO);
    }}}
    
    @param {Hash|Array} attributes JSON-hash or array of JSON-hashes
    @param {SC.Record|Array} recordType SC.Record class or array of classes
    @param {String} statuses new status, array of status or null
    @param {Boolean} hasPrimaryKey is YES then set primary key. 
    @param {Boolean} isLocalOnly  (optional) If set to YES, then don't record changes.

    @returns {Array} Array of storeKeys that were updated or created.
  */  
  loadRecords: function(attributes, recordTypes, statuses, hasPrimaryKey, isLocalOnly){

    var recordTypeIsArray;
    
    var dataHashes = this.dataHashes;
    var revisions = this.revisions;
    var isLoadAction, pUpdated, disregardPrimaryKeys, storeKeyMap ;
    var primaryKeyMap, recKeyTypeMap, dataTypeMap, recType, recTypeKey;
    var changes, ret, cachedAttributes, retrievedRecQueue, retrievedRecords;
    
    // normalize attrs data
    var attrsIsArray, len, curAttrs, i;
    attrsIsArray = SC.typeOf(attributes) === SC.T_ARRAY;
    len = attrsIsArray ? attributes.length : 1 ;
    
    // normalize recordTypes
    var recordTypesIsArray, curRecordType;
    if (!recordTypes) recordTypes = SC.Record; 
    recordTypesIsArray = SC.typeOf(recordTypes) === SC.T_ARRAY;
    curRecordType = recordTypesIsArray ? null : recordTypes;
    
    // discover the primaryKey if not set - get from recordType or default
    // to 'guid'
    if (SC.none(hasPrimaryKey)) hasPrimaryKey = YES; // assume yes.
    var primaryKey = recordTypesIsArray ? null : (curRecordType.prototype.primaryKey || 'guid');

    // discover statuses
    var statusesIsArray, curStatus;
    if (!statuses) statuses = SC.RECORD_READY;
    statusesIsArray = SC.typeOf(statuses) == SC.T_ARRAY;
    curStatus = statusesIsArray ? null : statuses;
    
    if (!isLocalOnly) isLocalOnly = NO ; // assume not local.
    
    // get local ref to record-related elements
    var my_attributes, my_statuses, my_records ;
    my_attributes = this.attributes;
    my_statuses   = this.statuses;
    my_records    = this.records ;
    
    // get local ref to locking attrs
    var rev, my_revisions, parentStore, needsLocking, my_locks, ps_revisions;
    my_revisions  = this.revisions ;
    if (!my_revisions) my_revision = this.revisions = [];
    
    parentStore   = this.get('parentStore');
    needsLocking  = parentStore && parentStore.get('isTransient');
    rev           = SC.Store.generateStoreKey();
    if (needsLocking) {
      my_locks    = this.locks;
      if (!my_locks) my_locks = this.locks = [] ;
      ps_revisions = parentStore.revisions ;
      if (!ps_revisions) ps_revisions = parentStore.revisions = [];
    }

    SC.Benchmark.start('writeAttributes: loop');

    // Iterate per record in the attributes and either update an existing 
    // dataHash or create a new dataHash.
    for(i=0; i<len; i++) {

      SC.Benchmark.start('updateRecord');

      var data = attrsIsArray ? attributes[i] : attributes;
      var rec, storeKey, guid, error;

      // Find the current recordType and primaryKey 
      if (recordTypeIsArray) {
        curRecordType = recordTypes[i] || SC.Record;
        primaryKey = curRecordType.prototype.primaryKey || 'guid';
      }
      
      // Find the current status
      if (statusesIsArray) curStatus = statuses[i] || SC.RECORD_READY;

      // Now we need the storeKey.  If this attrbutes doesn't have a primary
      // key yet, generate a storeKey blindly.  Otherwise look it up.
      if (hasPrimaryKey) {
        guid = data[primaryKey];
        if (SC.none(guid)) {
          throw "SC.Store: could not write attributes without primaryKey: %@".fmt(SC.inspect(data));
        }
        storeKey = curRecordType.storeKeyFor(guid);
      } else storeKey = SC.Store.generateStoreKey();
      
      // If we need locking, then save the revision number of the parent 
      // for the storeKey in locks.  also get parent rev.
      if (needsLocking && !my_locks[storeKey]) {
        my_locks[storeKey] = ps_revisions[storeKey] || 1;
      }

      // set new revision as well
      my_revisions[storeKey] = rev;
    
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
  
  // ..........................................................
  // INTERNAL SUPPORT
  // 
  
  init: function() {
    sc_super();
    this.childStores = [];
    
    this.reset();

    // if we don't have a parent store or the parent store is not transient
    // then create our own storage.
    var parentStore = this.get('parentStore');
    if(!parentStore || !parentStore.get('isTransient')) {
      this.dataHashes = {};
      this.revisions  = {};
      this.statuses   = {};
    }
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

// ..........................................................
// COMPATIBILITY
// 

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
SC.Store.prototype.nextStoreIndex = 1;
