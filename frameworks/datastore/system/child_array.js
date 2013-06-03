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

  isChildArray: true, // walk like a duck...

  /**
    If set, it is the default record `recordType`

    @default null
    @type String
  */
  defaultRecordType: null,

  /**
    If this array changes, the parentObject will be notified in order to change its own state.
    Always set.

    @default null
    @type {SC.Record}
  */
  parentObject: null,

  /**
    The attribute on the parent this array represents

    @default null
    @type String
  */
  parentAttribute: null,

  /**
    Actual references to the hashes

    @default null
    @type {SC.Array}
  */
  children: null,

  /**
    The store that owns this record array.  All record arrays must have a
    store to function properly.

    @type SC.Store
    @property
  */
  store: function() {
    return this.getPath('parentObject.store');
  }.property('parentObject').cacheable(),

  /**
    The storeKey for the parent record of this many array.  Editing this
    array will place the parent record into a `READY_DIRTY state.

    @type Number
    @property
  */
  storeKey: function() {
    return this.getPath('parentObject.storeKey');
  }.property('parentObject').cacheable(),

  /**
    Returns the storeIds in read only mode.  Avoids modifying the record
    unnecessarily.

    @type SC.Array
    @property
  */
  readOnlyChildren: function() {
    return this.get('parentObject').readAttribute(this.get('parentAttribute'));
  }.property(),

  /**
    Returns an editable array of child hashes.  Marks the owner records as
    modified.

    @type {SC.Array}
    @property
  */
  editableChildren: function() {
    var parent = this.get('parentObject'),
        parentAttr = this.get('parentAttribute'),
        ret;

    ret = parent.readEditableAttribute(parentAttr);
    if(!ret) ret = [];
    if(ret !== this._prevChildren) this.recordPropertyDidChange();

    return ret;

  }.property(),

  /**
    Convenience method to create a new subrecord.

    @type {SC.Record} Record model
    @type {hash} hash to create record from
    @property
  */
  createNestedRecord: function(recType,hash){
    var parent = this.get('parentObject'),
        pattr  = this.get('parentAttribute'),
        rec;

    rec = parent.createNestedRecord(recType,hash,pattr,this); // add ourselves as parent
    // update the cache while we can to prevent materializing of the same record
    if(this._records){
      this._records.push(rec);
    } else this._records = [rec];
    this.enumerableContentDidChange();
    return rec;
  },

   /**
    Convenience method to create a set of new subrecords. Wraps #createNestedRecord.

    @type {SC.Record}
    @type {SC.Array} array of hashes to create records from
    @property
  */

  createNestedRecords: function(recType,hashes){
    var parent = this.get('parentObject'),
        pattr  = this.get('parentAttribute'),
        recs;

    recs = parent.createNestedRecords(recType,hashes,pattr,this);
    return recs;
  },


  /**
   * read the attribute of key on the parent
   * @param  {String} key
   * @return {any} property of the parentObjects attributes
   */
  readAttribute: function(key){
    var parent = this.get('parentObject');
    if(!parent) throw new Error("ChildArray without a parentObject? this is a bug");
    return parent.readAttribute(key);
  },

  /**
   * Internal method for updating the underlying data hash
   * @param  {Array} keyStack: the stack with keys until now
   * @param  {any} value: value that needs to be written
   * @param  {boolean} ignoreDidChange: don't trigger observers
   * @return {[type]}
   */
  _writeAttribute: function(keyStack, value, ignoreDidChange) {
    var parent = this.get('parentObject');
    if(!parent) throw new Error("ChildArray without a parent? this is a bug");
    return parent._writeAttribute(keyStack, value, ignoreDidChange);
  },

  /**
   * called whenever a record did change
   * @param  {String} key
   * @return {[type]}
   */
  recordDidChange: function(key){
    var parent = this.get('parentObject');
    if(!parent) throw new Error("ChildArray without a parent? this is a bug");
    return parent.recordDidChange(key);
  },

  /**
   * Returns attributes of the underlying array
   * @return {Array} with attributes
   */
  attributes: function(){
    var parent = this.get('parentObject'),
        parentAttr = this.get('parentAttribute'),
        attrs;

    if(!parent) throw new Error("ChildArray without a parent? this is a bug");
    attrs = parent.get('attributes');
    if(attrs) return attrs[parentAttr];
    else return attrs;
  }.property(),

  /**
   * Return the status of the underlying record
   * @return {Number} enumerated in SC.Record
   */
  status: function(){
    var parent = this.get('parentObject');
    if(parent) return parent.get('status');
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
    @returns {SC.Record} The record if found or undefined.
  */
  objectAt: function(idx) {
    var recs      = this._records,
        children = this.get('readOnlyChildren'),
        hash, ret, pname = this.get('parentAttribute'),
        parent = this.get('parentObject');
    var len = children ? children.length : 0;

    if (!children) return undefined; // nothing to do
    if (recs && (ret=recs[idx])) return ret ; // cached
    if (!recs) this._records = recs = [] ; // create cache

    // If not a good index return undefined
    if (idx >= len) return undefined;
    hash = children.objectAt(idx);
    if (!hash) return undefined;

    // not in cache, materialize
    recs[idx] = ret = parent.materializeNestedRecord(hash, pname, this);

    return ret;
  },

  /**
    Pass through to the underlying array.  The passed in objects can be
    records, which can be converted to `storeId`s, but they can also
    be simple hashes, which will then be inserted

    @param {Number} idx index of the object to replace.
    @param {Number} amt number of records to replace starting at idx.
    @param {Number} recs array with records to replace.
    @returns {SC.ChildArray} The current array

  */
  replace: function(idx, amt, recs) {
    var children = this.get('editableChildren'),
        len      = recs ? (recs.get ? recs.get('length') : recs.length) : 0,
        record   = this.get('parentObject'), newRecs,

        pname    = this.get('parentAttribute'),
        cr, recordType;

    newRecs = this._processRecordsToHashes(recs);
    // calling replace on the children would result in KVO stuff on an attribute hash, and we don't want that
    if (!recs || recs.length === 0) {
      children.splice(idx, amt) ;
    } else {
      var args = [idx, amt].concat(newRecs) ;
      children.splice.apply(children,args)
    }

    // remove item from _records cache, to leave them to be materialized the next time
    if(this._records) this._records.replace(idx,amt); // we can do replace here, as _records are SC.Record instances
    record.writeAttribute(pname,children);
    // notify that the record did change...
    record.recordDidChange(pname);
    this.enumerableContentDidChange();
    return this;
  },

  /** @private

    Converts a records array into an array of hashes.

    @param {SC.Array} recs records to be converted to hashes.
    @returns {SC.Array} array of hashes.
  */
  _processRecordsToHashes: function(recs){
    var store, sk;
    recs = recs || [];
    recs.forEach( function(me, idx){
      store = me.get('store');
      sk = me.storeKey;
      recs[idx] = store.readDataHash(sk);
    });

    return recs;
  },

  /**
    Calls normalize on each object in the array
  */
  normalize: function(){
    this.forEach(function(child,id){
      if(child.normalize) child.normalize();
    });
  },

  // ..........................................................
  // INTERNAL SUPPORT
  //

  /** @deprecated
    Invoked whenever the children array changes.  Observes changes.

    @param {SC.Array} keys optional
    @returns {SC.ChildArray} itself.
  */
  recordPropertyDidChange: function(keys) {
    return this;
  },

  /** @private
    Invoked whenever the content of the children array changes.  This will
    dump any cached record lookup and then notify that the enumerable content
    has changed.

    @param {Number} target
    @param {Number} key
    @param {Number} value
    @param {Number} rev
  */
  _childrenContentDidChange: function(start, removedCount, addedCount) {
    this._records = null ; // clear cache
    //this.arrayContentDidChange(start, removedCount, addedCount);
    this.enumerableContentDidChange(); // not sure what would be wise here regarding new changes
  },

  // /** @private */
  // init: function() {
  //   sc_super();
  //   this.recordPropertyDidChange();
  // }

}) ;
