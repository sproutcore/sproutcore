// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2010 Evin Grano
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @class

  A `ChildArray` is used to map an array of `ChildRecord` objects.

  @extends SC.Enumerable
  @extends SC.Array
  @since SproutCore 1.0
*/

SC.ChildArray = SC.Object.extend(SC.Enumerable, SC.Array,
  /** @scope SC.ChildArray.prototype */ {

  //@if(debug)
  /* BEGIN DEBUG ONLY PROPERTIES AND METHODS */

  /* @private */
  toString: function () {
    var propertyName = this.get('propertyName'),
      length = this.get('length');

    return "%@({  propertyName: '%@',  length: %@,  … })".fmt(sc_super(), propertyName, length);
  },

  /* END DEBUG ONLY PROPERTIES AND METHODS */
  //@endif

  /**
    If set, it is the default record `recordType`

    @default null
    @type String
  */
  defaultRecordType: null,

  /**
    If set, the parent record will be notified whenever the array changes so that
    it can change its own state

    @default null
    @type {SC.Record}
  */
  record: null,

  /**
    The name of the attribute in the parent record's datahash that represents
    this child array's data.

    @default null
    @type String
  */
  propertyName: null,

  /**
    The store that owns this child array's parent record.

    @type SC.Store
    @readonly
  */
  store: function() {
    return this.getPath('record.store');
  }.property('record').cacheable(),

  /**
    The storeKey for the parent record of this child array.

    @type Number
    @readonly
  */
  storeKey: function() {
    return this.getPath('record.storeKey');
  }.property('record').cacheable(),

  /**
    Returns the original child array of JavaScript Objects.

    Note: Avoid modifying this array directly, because changes will not be
    reflected by this SC.ChildArray.

    @type SC.Array
    @property
  */
  readOnlyChildren: function() {
    return this.get('record').readAttribute(this.get('propertyName'));
  }.property(),

  /**
    Returns an editable child array of JavaScript Objects.

    Any changes to this array will not affect the parent record's datahash.

    @type {SC.Array}
    @property
  */
  editableChildren: function() {
    var store    = this.get('store'),
        storeKey = this.get('storeKey'),
        pname    = this.get('propertyName'),
        ret, hash;

    ret = store.readEditableProperty(storeKey, pname);
    if (!ret) {
      hash = store.readEditableDataHash(storeKey);
      ret = hash[pname] = [];
    }

    return ret ;
  }.property(),

  // ..........................................................
  // ARRAY PRIMITIVES
  //

  /** @private
    Returned length is a pass-through to the storeIds array.

    @type Number
    @property
  */
  length: function() {
    var children = this.get('readOnlyChildren');
    return children ? children.length : 0;
  }.property('readOnlyChildren'),

  /**
    Looks up the store id in the store ids array and materializes a
    records.

    @param {Number} idx index of the object to retrieve.
    @returns {SC.Record} The nested record if found or undefined if not.
  */
  objectAt: function(idx) {
    var recs      = this._records,
        children = this.get('readOnlyChildren'),
      hash, ret,
      pname = this.get('propertyName'),
      parent = this.get('record'),
      len = children ? children.length : 0;

    if (!children) return undefined; // nothing to do
    if (recs && (ret=recs[idx])) return ret ; // cached

    // If not a good index return undefined
    if (idx >= len) return undefined;
    hash = children.objectAt(idx);
    if (!hash) return undefined;

    // not in cache, materialize
    if (!recs) this._records = recs = []; // create cache
    recs[idx] = ret = parent.registerNestedRecord(hash, pname, pname+'.'+idx);

    return ret;
  },

  /**
    Pass through to the underlying array.  The passed in objects should be
    nested SC.Records, which can be converted to JavaScript objects or
    JavaScript objects themselves.

    @param {Number} idx index of the object to replace.
    @param {Number} amt number of objects to replace starting at idx.
    @param {Number} recs array with records to replace. These may be JavaScript objects or nested SC.Record objects.
    @returns {SC.ChildArray}
  */
  replace: function(idx, amt, recs) {
    var children = this.get('editableChildren'),
      recsLen = recs ? (recs.get ? recs.get('length') : recs.length) : 0,
      parent = this.get('record'),
      pname    = this.get('propertyName'),
      store = this.get('store'),
      removeCount, addCount,
      defaultRecordType, storeKeysById,
      newObjects, rec,
      i, len;

    // Create the proxy cache, we will need it.
    if (!this._records) this._records = [];

    // Convert any SC.Record objects into JavaScript objects.
    newObjects = this._processRecordsToHashes(recs);

    // Unregister the records being replaced.
    // for (i = idx, len = children.length; i < len; ++i) {
    //  this.unregisterNestedRecord(i);
    // }

    // Ensure that all removed objects are pre-registered in case any instances are outstanding.
    // These objects will improperly reflect being registered to this parent, but
    // at least they won't conflict with the actual associated records once we
    // disassociate them from the record type.
    defaultRecordType = this.get('defaultRecordType');
    storeKeysById = defaultRecordType.storeKeysById();

    for (i = idx, len = idx + amt; i < len; i++) {
      rec = this._records[i];

      if (!rec) {
        rec = parent.registerNestedRecord(children[i], pname, pname + '.' + i);
      } else {
        // Remove the cached record.
        this._records[i] = null;
      }

      // Now throw away the connection, so that the parent won't retrieve this
      // same instance. This is a work-around due to the fact that nested records
      // are proxied through their parent records.
      storeKeysById[rec.get('id')] = null;
    }

    // All materialized nested records after idx + amt to end need to be removed
    // because the paths will no longer be valid.
    for (i = idx + amt, len = this._records.length; i < len; i++) {
      rec = this._records[i];

      if (rec) {
        store.unregisterChildFromParent(rec.get('storeKey'));

        this._records[i] = null;
      }
    }

    // All objects from idx to the end must be removed to do an insert.
    removeCount = children.length - idx;
    addCount = children.length - idx - amt + recsLen;

    this.arrayContentWillChange(idx, removeCount, addCount);

    // Perform a raw array replace without any KVO checks.
    if (newObjects.length === 0) {
      children.splice(idx, amt);
    } else {
      var args = [idx, amt].concat(newObjects);
      children.splice.apply(children, args);
    }

    // All current SC.Record instances must be updated to their new backing object.
    // For example, when passing an SC.Record object in, that instance should
    // update to reflect its new nested object path.
    for (i = idx, len = children.length; i < len; i++) {
      this._records[i] = parent.registerNestedRecord(children[i], pname, pname + '.' + i);
    }

    // Update the enumerable, [], property (including firstObject and lastObject)
    this.arrayContentDidChange(idx, removeCount, addCount);

    // Update our cache! So when the record property change comes back down we can ignore it.
    this._sc_prevChildren = children;

    // We must indicate to the parent that we have been modified, so they can
    // update their status.
    parent.recordDidChange(pname);

    return this;
  },

  /**
    Unregisters a child record from its parent record.

    Since accessing a child (nested) record creates a new data hash for the
    child and caches the child record and its relationship to the parent record,
    it's important to clear those caches when the child record is overwritten
    or removed.  This function tells the store to remove the child record from
    the store's various child record caches.

    You should not need to call this function directly.  Simply setting the
    child record property on the parent to a different value will cause the
    previous child record to be unregistered.

    @param {Number} idx The index of the child record.
  */
  // unregisterNestedRecord: function(idx) {
  //   var childArray, childRecord, csk, store,
  //       record   = this.get('record'),
  //       pname    = this.get('propertyName');
  //
  //   store = record.get('store');
  //   childArray = record.getPath(pname);
  //   childRecord = childArray.objectAt(idx);
  //   csk = childRecord.get('storeKey');
  //   store.unregisterChildFromParent(csk);
  // },

  /**
    Calls normalize on each object in the array
  */
  normalize: function(){
    this.forEach(function (rec) {
      if (rec.normalize) rec.normalize();
    });
  },

  // ..........................................................
  // INTERNAL SUPPORT
  //

  /** @private Converts any SC.Records in the array into an array of hashes.

    @param {SC.Array} recs records to be converted to hashes.
    @returns {SC.Array} array of hashes.
  */
  _processRecordsToHashes: function (recs) {
    var store, sk,
      ret = [];

    recs.forEach(function (rec, idx) {
      if (rec.isNestedRecord) {
        store = rec.get('store');
        sk = rec.storeKey;
        ret[idx] = store.readDataHash(sk);
      } else {
        ret[idx] = rec;
      }
    });

    return ret;
  },

  /** @private
    This is called by the parent record whenever its properties change. It is
    also called by the ChildrenAttribute transform when the attribute is set
    to a new array.
  */
  recordPropertyDidChange: function (keys) {
    var oldLength = this.get('length'),
      children = this.get('readOnlyChildren'),
      newLength = children ? children.length : 0,
      // store = this.get('store'),
      prevChildren = this._sc_prevChildren;

    // Fast Path! No actual change to our backing array attribute so we should
    // not notify any changes.
    if (prevChildren === children) { return; }

    // TODO: We can not use this, because removed instances will lose their
    // connection to their data hashes in the store. There is an ugly hack in
    // SC.Store#writeDataHash which can't handle this.
    // All materialized nested records need to be removed. They are no longer valid!
    // if (this._records) {
    //   for (var i = 0, len = this._records.length; i < len; i++) {
    //     var rec = this._records[i];

    //     // Unregister the nested record.
    //     if (rec) {
    //       store.unregisterChildFromParent(rec.get('storeKey'));
    //     }
    //   }

    //   // Throw away our cache.
    //   this._records.length = 0;
    // }

    // Throw away our cache.
    this._records = null;

    // this.arrayContentWillChange(0, oldLength, newLength);
    this.arrayContentDidChange(0, oldLength, newLength);

    // Cache our backing array so we can avoid updates when we haven't actually
    // changed. See fast path above.
    this._sc_prevChildren = children;
  }

}) ;
