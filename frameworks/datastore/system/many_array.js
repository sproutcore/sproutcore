// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/**
  @class

  A ManyArray is used to map an array of store ids back to their 
  record objects which will be materialized from the owner store on demand.
  
  @extends SC.ManyArray
  @since SproutCore 1.0
*/

SC.ManyArray = SC.Object.extend(SC.Enumerable, SC.Array,
  /** @scope SC.ManyArray.prototype */ {

  /**
    The store that owns this record array.  All record arrays must have a 
    store to function properly.

    @property {SC.Store}
  */
  store: null,

  /**
    SC.Array object that will provide the store ids for the array.  The 
    many array will register itself as an observer for this array.

    @property {SC.Array}
  */
  storeIds: null,
  
  /**
    recordType will tell what type to transform the record to when
    materializing the record.

    @type {String}
  */
  recordType: null,

  // ..........................................................
  // ARRAY PRIMITIVES
  // 

  /**
    Returned length is a pass-through to the storeIds array.
  */
  length: function() {
    var storeIds = this.get('storeIds');
    return storeIds ? storeIds.get('length') : 0;
  }.property('storeIds').cacheable(),

  /**
    Looks up the store id in the store ids array and materializes a
    records.
  */
  objectAt: function(idx) {
    var recs      = this._records, 
        storeIds  = this.get('storeIds'),
        store     = this.get('store'),
        recordType = this.get('recordType'),
        storeKey, ret ;
        
    if (!storeIds || !store) return undefined; // nothing to do
    if (recs && (ret=recs[idx])) return ret ; // cached

    // not in cache, materialize
    if (!recs) this._records = recs = [] ; // create cache
    storeId = storeIds.objectAt(idx);
    if (storeId) {

      // if record is not loaded already, then ask the data source to 
      // retrieve it
      var storeKey = store.storeKeyFor(recordType, storeId);
      
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
    var storeIds = this.get('storeIds'), 
        len       = recs ? (recs.get ? recs.get('length') : recs.length) : 0,
        i, keys;

    if (!storeIds) throw "storeIds required";

    // map to store keys
    ids = [] ;
    for(i=0;i<len;i++) ids[i] = recs.objectAt(i).get('id');

    // pass along - if allowed, this should trigger the content observer 
    storeIds.replace(idx, amt, ids);
    
    return this;
  },
  
  // ..........................................................
  // INTERNAL SUPPORT
  // 

  /** @private 
    Invoked whenever the storeIds array changes.  Observes changes.
  */
  _storeIdsDidChange: function() {
    var storeIds = this.get('storeIds');
    var prev = this._prevStoreIds, f = this._storeIdsContentDidChange;

    if (storeIds === prev) return this; // nothing to do

    if (prev) {
      prev.removeObserver('[]', this, f);
    }

    this._prevStoreIds = storeIds;

    if (storeIds) {
      storeIds.addObserver('[]', this, f);
    }

    var rev = (storeIds) ? storeIds.propertyRevision : -1 ;
    this._storeIdsContentDidChange(storeIds, '[]', storeIds, rev);
    
  }.observes('storeIds'),

  /** @private
    Invoked whenever the content of the storeIds array changes.  This will
    dump any cached record lookup and then notify that the enumerable content
    has changed.
  */
  _storeIdsContentDidChange: function(target, key, value, rev) {
    this._records = null ; // clear cache

    this.beginPropertyChanges()
      .notifyPropertyChange('length')
      .enumerableContentDidChange()
    .endPropertyChanges();
  },

  init: function() {
    sc_super();
    this._storeIdsDidChange();
  }
  
}) ;