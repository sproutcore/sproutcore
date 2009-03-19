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

  /**
    The childStores property is an array that contains all the child 
    stores for THIS store.
    
    @property {Array}
  */
  childStores: null,

  /**
    All stores that are not persistent stores are transient.  This means the
    contents of this store will disappear when you reload the page.
  
    @property {Boolean}
  */
  isTransient: YES,
  
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
    
  /**
    An array that includes the store keys that have changed since the store
    was last committed.
  */
  changedStoreKeys: null,
  
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
      var changes = this.changedStoreKeys;
      if (!changes) changes = this.changedStoreKeys = SC.Set.create();
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
      for(i=0;idx<len;i++) {
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
    my_changes    = this.changedStoreKeys ;
    my_locks      = this.locks ;
    my_editables  = this.editables ;

    // setup some arrays if needed
    if (!my_changes) my_changes = this.changedStoreKeys = SC.Set.create();
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
    this.changedStoreKeys = this.locks = this.editables = null ;
    
    // TODO: Notify record instances that their content may have changed
    
    // TODO: Reset persistent change log

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
      parentStore.commitChangesFromStore(this, this.changedStoreKeys, force);
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
  // RECORDS API
  // 
  
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
      var rec, rev, storeKey, guid, error;

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
      };

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
    Creates the store's dataHashes then returns an array of SC.Record instances.
        
    @param {Array} dataHashes (required) Array of JSON-compatible hashes.
    @param {SC.Record|Array} recordType (optional) The SC.Record extended class that you want to use or an array of SC.Record classes that match the dataArr item per item.
    @param {String} primaryKey  (optional) This is the primaryKey key for the data hash, if it is not passed in, then 'guid' is used.

    @returns {Array} Returns an array containing the records that were created.
  */
  createRecords: function(dataHashes, recordType, primaryKey)
  {
    // If dataHashes are not set correctly, return null.
    if(!dataHashes) throw "You must pass an array of dataHashes";

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
    return records ? records[0] : null;
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
  // OLD CONTENT
  // 
  
  
  /** @private
    This is the queue of records that need to be retrieved from the server.
    Records in this queue will be notified automatically when the data hash
    for the record is added to the Store.

    This property is shared by all store instances.
    
    @property {Object}
  */
  retrievedRecQueue: [],
  
  
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
  primaryKeyFor: function(storeKey) {
    return SC.Store.primaryKeyFor(storeKey);
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
    access this method directly.  Instead use the primaryKeyFor() and 
    storeKeyFor() methods on SC.Record.
  */
  primaryKeysByStoreKey: [],
  
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
  primaryKeyFor: function(storeKey) {
    return this.primaryKeysByStoreKey[storeKey] ;
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
  replacePrimaryKeyFor: function(storeKey, primaryKey) {
    var recordType = this.recordTypeFor(storeKey);
    if (!recordType) {
      throw "replacePrimaryKeyFor: storeKey %@ does not exist".fmt(storeKey);
    }
    
    // map one direction...
    var oldPrimaryKey = this.primaryKeysByStoreKey[storeKey];
    this.primaryKeysByStoreKey[storeKey] = primaryKey ;
    
    // then the other...
    var storeKeys = recordType.storeKeysByPrimaryKey ;
    if (!storeKeys) storeKeys = recordType.storeKeysByPrimaryKey = {};
    delete storeKeys[oldPrimaryKey];
    storeKeys[primaryKey] = storeKey;     
    
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
