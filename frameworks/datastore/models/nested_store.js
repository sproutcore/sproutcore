// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

sc_require('models/store');

/**
  @class

  A nested store can buffer changes to a parent store and then commit them
  all at once.  You usually will use a NestedStore as part of store chaining
  to stage changes to your object graph before sharing them with the rest of
  the application.
  
  Normally you will not create a nested store directly.  Instead, you can 
  retrieve a nested store by using the chain() method.  When you are finished
  working with the nested store, destroy() will dispose of it.
  
  @extends SC.Store
  @since SproutCore 1.0
*/
SC.NestedStore = SC.Store.extend(
/** @scope SC.NestedStore.prototype */ {

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
    YES if the view is nested. Walk like a duck
  */
  isNested: YES,

  /**
    If YES, then the attribute hash state will be locked when you first 
    read the data hash or status.  This means that if you retrieve a record
    then change the record in the parent store, the changes will not be 
    visible to your nested store until you commit or discard changes.
    
    If NO, then the attribute hash will lock only when you write data.
    
    Normally you want to lock your attribute hash the first time you read it.
    This will make your nested store behave most consistently.  However, if
    you are using multiple sibling nested stores at one time, you may want
    to turn off this property so that changes from one store will be reflected
    in the other one immediately.  In this case you will be responsible for
    ensuring that the sibling stores do not edit the same part of the object
    graph at the same time.
    
    @property {Boolean} 
  */
  lockOnRead: YES,
  
  // ..........................................................
  // STORE CHAINING
  // 
  
  /**
    Propagate this store's changes to it's parent.  If the store does not 
    have a parent, this has no effect other than to clear the change set.

    @param {Boolean} force if YES, does not check for conflicts first
    @returns {SC.Store} receiver
  */
  commitChanges: function(force) {
    var pstore = this.get('parentStore');
    if (pstore) {
      pstore.commitChangesFromNestedStore(this, this.chainedChanges, force);
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

  /**
    Resets a store's data hash contents to match its parent.
    
    @returns {SC.Store} receiver
  */
  reset: function() {

    // requires a pstore to reset
    var parentStore = this.get('parentStore');
    if (!parentStore) throw SC.Store.NO_PARENT_STORE_ERROR;
    
    // inherit data store from parent store.
    this.dataHashes = SC.beget(parentStore.dataHashes);
    this.revisions  = SC.beget(parentStore.revisions);
    this.statuses   = SC.beget(parentStore.statuses);
    
    // also, reset private temporary objects
    this.chainedChanges = this.locks = this.editables = null;
    this.changelog = null ;

    // TODO: Notify record instances
    
    this.set('hasChanges', NO);
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
  chainedChanges: null,
  
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
    Locks the data hash so that it iterates independently from the parent 
    store.
  */
  _lock: function(storeKey) {
    var ret = this.dataHashes[storeKey], locks = this.locks, rev;
    if (!ret || (locks && locks[storeKey])) return this ; // already locked
    
    // lock attributes hash to the current version.
    // copy references for prototype-based objects and save the current 
    // revision number in the locks array so we can check for conflicts when
    // committing changes later.
    if (!locks) locks = this.locks = [];
    this.dataHashes[storeKey] = this.dataHashes[storeKey]; 
    this.statuses[storeKey] = this.statuses[storeKey];
    rev = this.revisions[storeKey] = this.revisions[storeKey];
    locks[storeKey] = rev || 1;    
    
    return this ;
  },
  
  /** 
    Returns the data hash for the given storeKey.  This will also 'lock'
    the hash so that further edits to the parent store will no 
    longer be reflected in this store until you reset.
    
    @param {Number} storeKey key to retrieve
    @returns {Hash} data hash or null
  */
  readDataHash: function(storeKey) {
    var ret = this.dataHashes[storeKey];
    if (this.get('lockOnRead') this._lock(storeKey);
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

    // lock the data hash
    this._lock(storeKey);
    
    // get the data hash.  use readDataHash() to handle locking
    var ret = this.dataHashes[storeKey];
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
    this.statuses[storeKey] = status ? status : (this.statuses[storeKey] || SC.Record.READY_NEW);
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
    you may set it to SC.Record.DESTROYED_CLEAN.
    
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
      var changes = this.chainedChanges;
      if (!changes) changes = this.chainedChanges = SC.Set.create();
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
    my_changes    = this.chainedChanges ;
    my_locks      = this.locks ;
    my_editables  = this.editables ;

    // setup some arrays if needed
    if (!my_changes) my_changes = this.chainedChanges = SC.Set.create();
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
    this.chainedChanges = this.locks = this.editables = null;
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
      parentStore.commitChangesFromStore(this, this.chainedChanges, force);
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
    return a record instance with a status of SC.Record.BUSY_LOADING to indicate
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
    } else if (!id && (status===SC.DESTROYED_CLEAN || status===SC.ERROR)) {
      throw K.BAD_STATE_ERROR;
    }
    
    // add dataHash and setup initial status -- also save recordType
    this.writeDataHash(storeKey, dataHash, K.READY_NEW);
    SC.Store.replaceRecordTypeFor(storeKey, recordType);

    // Record is now in a committable state -- add storeKey to changelog
    changelog = this.changelog;
    if (!changelog) changelog = SC.Set.create();
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
    } else if (status === K.EMPTY) {
      throw K.NOT_FOUND_ERROR ;
      
    // error out if busy
    } else if (status & K.BUSY) {
      throw K.BUSY_ERROR ;
      
    // if new status, destroy but leave in clean state
    } else if (status === K.READY_NEW) {
      status = K.DESTROYED_CLEAN ;
      
    // otherwise, destroy in dirty state
    } else status = K.DESTROYED_DIRTY ;
    
    // remove the data hash, set new status
    this.removeDataHash(storeKey, status);

    // add/remove change log
    changelog = this.changelog;
    if (!changelog) changelog = this.changelog = SC.Set.create();
    ((status & K.DIRTY) ? changelog.add(storeKey) : changelog.remove(storeKey));
    
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
    // JUAN TODO: Implement
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
      throw K.NOT_FOUND ;
      
    // otherwise, make new status READY_DIRTY unless new.
    // K.READY_CLEAN, K.READY_DIRTY, ignore K.READY_NEW
    } else {
      if (status !== K.READY_NEW) this.writeStatus(storeKey, K.READY_DIRTY);
    }
    
    // record data hash change
    this.dataHashDidChange(storeKey);
    
    // record in changelog
    changelog = this.changelog ;
    if (!changelog) changelog = this.changelog = SC.Set.create() ;
    changelog.add(storeKey);
    
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
    is usually only used by low-level internal methods.  You will not usually
    destroy records this way.
    
    @param {SC.Record|Array} recordTypes class or array of classes
    @param {Array} ids ids to destroy
    @param {Array} storeKeys (optional) store keys to destroy
    @returns {SC.Store} receiver
  */
  recordsDidChange: function(recordTypes, ids, storeKeys) {
    // JUAN TODO: Implement
    return this ;
  },

  /**
    Retrieves a record from the server.  If the record has already been loaded
    in the store, then this method will simply return.  Otherwise if your 
    store has a dataSource, this will call the dataSource to retrieve the 
    record.  Generally you will not need to call this method yourself.  
    Instead you can just use find().
    
    This will not actually create a record instance but it will initiate a 
    load of the record from the server.  You can subsequently get a record 
    instance itself using materializeRecord()
    
    @param {SC.Record|Array} recordTypes class or array of classes
    @param {Array} ids ids to destroy
    @param {Array} storeKeys (optional) store keys to destroy
    @returns {Array} storeKeys to be retrieved
  */
  retrieveRecords: function(recordTypes, ids, storeKeys, _isRefresh) {

    // pass up to parentStore if we have one
    var parentStore = this.get('parentStore');
    if (parentStore) {
      return parentStore.retrieveRecords(recordTypes, ids, storeKeys);
    }

    var isArray, recordType, len, idx, storeKey, status, K = SC.Record, ret;
    var source = this.get('dataSource');
    if (!isArray) recordType = recordsTypes;

    // if no storeKeys were passed, map recordTypes + ids
    len = (storeKeys === undefined) ? ids.length : storeKeys.length;
    ret = [];
    for(idx=0;idx<len;idx++) {
      
      // collect store key
      if (storeKeys) {
        storeKey = storeKeys[idx];
      } else {
        if (isArray) recordType = recordsTypes[idx];
        storeKey = recordTypes.storeKeyFor(ids[idx]);
      }
      
      // collect status and process
      status = this.readStatus(storeKey);
      
      // K.EMPTY, K.ERROR, K.DESTROYED_CLEAN - initial retrieval
      if ((status === K.EMPTY) || (status === K.ERROR) || (status === K.DESTROYED_CLEAN)) {

        this.writeStatus(K.BUSY_LOADING);
        ret.push(storeKey);

      // otherwise, ignore record unless isRefresh is YES.
      } else if (_isRefresh) {
        
        // K.READY_CLEAN, K.READY_DIRTY, ignore K.READY_NEW
        if (status & K.READY) {
          this.writeStatus(K.BUSY_REFRESH | (status & 0x03)) ;
          ret.push(storeKey);

        // K.BUSY_DESTROYING, K.BUSY_COMMITTING, K.BUSY_CREATING
        } else if ((status === K.BUSY_DESTROYING) || (status === K.BUSY_CREATING) || (status === K.BUSY_COMMITTING)) {
          throw K.BUSY_ERROR ;

        // K.DESTROY_DIRTY, bad state...
        } else if (status === K.DESTROY_DIRTY) {
          throw K.BAD_STATE_ERROR ;
          
        // ignore K.BUSY_LOADING, K.BUSY_REFRESH_CLEAN, K.BUSY_REFRESH_DIRTY
        }
      }
    }
    
    // now commit storekeys to dataSource
    if (source) source.retrieveRecords.call(source, this, ret);
    return ret ;
  },

  _TMP_RETRIEVE_ARRAY: [],
  
  /**
    JUAN TODO: Add description

    @param {SC.Record} recordType class
    @param {String} id id to retrieve
    @param {Number} storeKey (optional) store key
    @returns {Number} storeKey that was retrieved 
  */
  retrieveRecord: function(recordType, id, storeKey, _isRefresh) {
    
    var array = this._TMP_RETRIEVE_ARRAY ;
    if (storeKey !== undefined) {
      array[0] = storeKey;
      storeKey = array;
      id = null ;
    } else {
      array[0] = id;
      id = array;
    }
    
    var ret = this.retrieveRecords(recordType, id, storeKey, _isRefresh);
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
    JUAN TODO: Add description like other multiple variations.

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

    @returns {SC.Record} the actual recordType you should use to instantiate.
  */
  commitRecords: function(recordTypes, ids, storeKeys) {
    // TODO: Implement to call dataSource.commitRecords.call()...
    // If no params are passed, look up storeKeys in the changelog property.
    // Remove any committed records from changelog property.
  },

  /**
    TODO: Document
    
    @param {String} id to id of the record to load
    @param {SC.Record} recordType the expected record type

    @returns {SC.Record} the actual recordType you should use to instantiate.
  */
  commitRecord: function(recordType, ids, storeKey) {
    // TODO: Implement to call commitRecords()
  },
  
  /**
    Cancels an inflight request for the passed records.  Depending on the 
    server implementation, this could cancel an entire request, causing 
    other records to also transition their current state.
    
    // TODO: document
  */
  cancelRecords: function(recordType, ids, storeKeys) {
    // TODO: Implement to call cancelRecord()
  },

  /**
    // TODO: document
  */
  cancelRecords: function(recordType, ids, storeKeys) {
    // TODO: Implement to call dataSource.cancel()
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
    var status = this.readStatus(storeKey), K = SC.Record;
    
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
    
    return this ;
  },
  
  /**
    Called by a data source when it creates or commits a record.  Passing an
    optional id will remap the storeKey to the new record id.  This is 
    required when you commit a record that does not have an id yet.
    
    @param {Number} storeKey record store key to cancel
    @returns {SC.Store} reciever
  */
  dataSourceDidComplete: function(storeKey, dataHash, newId) {
    // TODO: Implement
  },
  
  /**
    Called by a data source when it has destroyed a record.  This will
    transition the record to the proper state.
    
    @param {Number} storeKey record store key to cancel
    @returns {SC.Store} reciever
  */
  dataSourceDidDestroy: function(storeKey) {
    // TODO: Implement
  },

  /**
    Converts the passed record into an error object.
    
    @param {Number} storeKey record store key to cancel
    @returns {SC.Store} reciever
  */
  dataSourceDidError: function(storeKey, error) {
    // TODO: Implement
  },

  // ..........................................................
  // PUSH CHANGES FROM DATA SOURCE
  // 
  
  pushRetrieve: function(recordType, id, dataHash, context, storeKey) {
    // TODO: Implement
  },
  
  pushDestroy: function(recordType, id, context, storeKey) {
    // TODO: Implement
  },

  pushError: function(recordType, id, error, context, storeKey) {
    // TODO: Implement
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
