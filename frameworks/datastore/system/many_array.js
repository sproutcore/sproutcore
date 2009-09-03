// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/**
  @class

  A ManyArray is used to map an array of record ids back to their 
  record objects which will be materialized from the owner store on demand.
  
  Whenever you create a toMany() relationship, the value returned from the 
  property will be an instance of ManyArray.  You can generally customize the
  behavior of ManyArray by passing settings to the toMany() helper.
  
  @extends SC.Enumerable
  @extends SC.Array
  @since SproutCore 1.0
*/

SC.ManyArray = SC.Object.extend(SC.Enumerable, SC.Array,
  /** @scope SC.ManyArray.prototype */ {

  /**
    recordType will tell what type to transform the record to when
    materializing the record.

    @type {String}
  */
  recordType: null,
  
  /**
    If set, this will represent the inverse key used to represent this 
    relationship in the opposite direction.  Whenever you add or remove 
    records to this array, it will modify the inverse relationship as well.
    
    @type {String}
  */
  inverse: null,
  
  /**
    If set, the record will be notified whenever the array changes so that 
    it can change its own state
    
    @type {SC.Record}
  */
  record: null,
  
  /**
    If set will be used by the many array to get an editable version of the
    storeIds from the owner.
    
    @type {String}
  */
  propertyName: null,
  
  /**
    The store that owns this record array.  All record arrays must have a 
    store to function properly.

    @property
    @type {SC.Store}
  */
  store: function() {
    return this.get('record').get('store');
  }.property('record').cacheable(),
  
  /**
    The storeKey for the parent record of this many array.  Editing this 
    array will place the parent record into a READY_DIRTY state.

    @property
    @type {Number}
  */
  storeKey: function() {
    return this.get('record').get('storeKey');
  }.property('record').cacheable(),


  readOnlyStoreIds: function() {
    return this.get('record').readAttribute(this.get('propertyName'));
  }.property(),
  
  
  editableStoreIds: function() {
    var store    = this.get('store'),
        storeKey = this.get('storeKey'),
        pname    = this.get('propertyName'),
        ret, hash;
        
    ret = store.readEditableProperty(storeKey, pname);    
    if (!ret) {
      hash = store.readEditableDataHash(storeKey);
      ret = hash[pname] = [];      
    }
    
    if (ret !== this._prevStoreIds) this.recordPropertyDidChange();
    return ret ;
  }.property(),
  
  // ..........................................................
  // ARRAY PRIMITIVES
  // 

  /**
    Returned length is a pass-through to the storeIds array.
  */
  length: function() {
    var storeIds = this.get('readOnlyStoreIds');
    return storeIds ? storeIds.get('length') : 0;
  }.property('readOnlyStoreIds').cacheable(),

  /**
    Looks up the store id in the store ids array and materializes a
    records.
  */
  objectAt: function(idx) {
    var recs      = this._records, 
        storeIds  = this.get('readOnlyStoreIds'),
        store     = this.get('store'),
        recordType = this.get('recordType'),
        storeKey, ret, storeId ;
        
    if (!storeIds || !store) return undefined; // nothing to do
    if (recs && (ret=recs[idx])) return ret ; // cached

    // not in cache, materialize
    if (!recs) this._records = recs = [] ; // create cache
    storeId = storeIds.objectAt(idx);
    if (storeId) {

      // if record is not loaded already, then ask the data source to 
      // retrieve it
      storeKey = store.storeKeyFor(recordType, storeId);
      
      if (store.readStatus(storeKey) === SC.Record.EMPTY) {
        store.retrieveRecord(recordType, null, storeKey);
      }
      
      recs[idx] = ret = store.materializeRecord(storeKey);
    }
    return ret ;
  },

  /**
    Pass through to the underlying array.  The passed in objects must be
    records, which can be converted to storeIds.
  */
  replace: function(idx, amt, recs) {
    
    if (!this.get('isEditable')) {
      throw "%@.%@[] is not editable".fmt(this.get('record'), this.get('propertyName'));
    }
    
    var storeIds = this.get('editableStoreIds'), 
        len      = recs ? (recs.get ? recs.get('length') : recs.length) : 0,
        owner    = this.get('record'),
        i, keys, ids;

    // map to store keys
    ids = [] ;
    for(i=0;i<len;i++) ids[i] = recs.objectAt(i).get('id');

    // pass along - if allowed, this should trigger the content observer 
    storeIds.replace(idx, amt, ids);
    
    if (owner) owner.recordDidChange();
    
    return this;
  },
  
  // ..........................................................
  // INTERNAL SUPPORT
  // 

  /** @private 
    Invoked whenever the storeIds array changes.  Observes changes.
  */
  recordPropertyDidChange: function(key) {
    if (key && this.get('propertyName') !== key) return; // nothing to do
    
    var storeIds = this.get('readOnlyStoreIds');
    var prev = this._prevStoreIds, f = this._storeIdsContentDidChange;

    if (storeIds === prev) return this; // nothing to do

    if (prev) prev.removeObserver('[]', this, f);
    this._prevStoreIds = storeIds;
    if (storeIds) storeIds.addObserver('[]', this, f);

    var rev = (storeIds) ? storeIds.propertyRevision : -1 ;
    this._storeIdsContentDidChange(storeIds, '[]', storeIds, rev);
    
  },

  /** @private
    Invoked whenever the content of the storeIds array changes.  This will
    dump any cached record lookup and then notify that the enumerable content
    has changed.
  */
  _storeIdsContentDidChange: function(target, key, value, rev) {
    this._records = null ; // clear cache
    this.enumerableContentDidChange();
  },
  
  unknownProperty: function(key, value) {
    var ret = this.reducedProperty(key, value);
    return ret === undefined ? sc_super() : ret;
  },

  init: function() {
    sc_super();
    this.recordPropertyDidChange();
  }
  
}) ;