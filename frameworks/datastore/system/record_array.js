// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/**
  @class

  A RecordArray wraps an array of storeKeys and, optionally, a Query object.
  When you access the items of a RecordArray it will automatically convert the
  storeKeys into actual SC.Record objects that the rest of your application
  can work with.
  
  Normally you do not create RecordArray's yourself.  Instead, a RecordArray
  is returned when you call SC.Store.findAll(), already properly configured.
  You can usually just work with the RecordArray instance just like another
  array.
  
  The information below about RecordArray internals is only intended for those
  who need to override this class for some reason to do some special.
  
  h2. Internal Notes
  
  Normally the RecordArray behavior is very simple.  Any array-like operations
  will be translated into similar calls onto the underlying array of 
  storeKeys.  The underlying array can be a real array or it may be a 
  SparseArray, which is how you implement incremental loading.
  
  If the RecordArray is created with an SC.Query objects as well (and it 
  almost always will have a Query object), then the RecordArray will also 
  consult the query for various delegate operations such as determining if 
  the record array should update automatically whenever records in the store
  changes.
  
  It will also ask the Query to refresh the storeKeys whenever records change
  in the store.
  
  @extends SC.Object
  @extends SC.Enumerable
  @extends SC.Array
  @since SproutCore 1.0
*/

SC.RecordArray = SC.Object.extend(SC.Enumerable, SC.Array, 
  /** @scope SC.RecordArray.prototype */ {
    
  /**
    The store that owns this record array.  All record arrays must have a 
    store to function properly.
  
    @property {SC.Store}
  */
  store: null,

  /**
    SC.Array object that will provide the store keys for the array.  The 
    record array will register itself as an observer for this array.
    
    @property {SC.Array}
  */
  storeKeys: null,
  
  /**
    SC.Query object that is set if record array is based on a query.
    Whenever the store keys content change, the SC.Query will be
    reapplied so that only matching storeKeys are set on the record
    array.
    
    @property {SC.Query}
  */
  query: null,
  
  /**
    The current load state of the RecordArray.  If the Query object has a 
    status property, then this will match the query status.  Otherwise, it 
    will always return SC.Record.READY.
  */
  status: function() {
    var query = this.get('query'),
        ret   = (query && query.status) ? query.get('status') : null;
    return ret ? ret : SC.Record.READY;
  }.property().cacheable(),
  
  /** @private
    Cache of records returned from objectAt() so they don't need to
    be unneccesarily materialized.
    
    @property {SC.Query}
  */
  _records: null,

  // ..........................................................
  // ARRAY PRIMITIVES
  // 

  /**
    Returned length is a pass-through to the storeKeys array.
  */
  length: function() {

    this.updateIfNeeded(); // cleanup pending if needed

    var storeKeys = this.get('storeKeys');
    return storeKeys ? storeKeys.get('length') : 0;
  }.property('storeKeys').cacheable(),

  /**
    Looks up the store key in the store keys array and materializes a
    records.
    
    @param {Number} idx index of the object
    @return {SC.Record} materialized record
  */
  objectAt: function(idx) {

    this.updateIfNeeded(); // cleanup pending if needed

    var recs      = this._records, 
        storeKeys = this.get('storeKeys'),
        store     = this.get('store'),
        storeKey, ret ;
    
    if (!storeKeys || !store) return undefined; // nothing to do
    if (recs && (ret=recs[idx])) return ret ; // cached
    
    // not in cache, materialize
    if (!recs) this._records = recs = [] ; // create cache
    storeKey = storeKeys.objectAt(idx);
    
    if (storeKey) {
      // if record is not loaded already, then ask the data source to 
      // retrieve it
      if (store.readStatus(storeKey) === SC.Record.EMPTY) {
        store.retrieveRecord(null, null, storeKey);
      }
      recs[idx] = ret = store.materializeRecord(storeKey);
    }
    return ret ;
  },
  
  /**
    Pass through to the underlying array.  The passed in objects must be
    records, which can be converted to storeKeys.
    
    @param {Number} idx start index
    @param {Number} amt end index
    @param {SC.RecordArray} recs to replace with records
    @return {SC.RecordArray} 'this' after replace
  */
  replace: function(idx, amt, recs) {

    this.updateIfNeeded(); // cleanup pending if needed
    
    var storeKeys = this.get('storeKeys'), 
        len       = recs ? (recs.get ? recs.get('length') : recs.length) : 0,
        i, keys;
        
    if (!storeKeys) throw "storeKeys required";
    
    var query = this.get('query');
    if (query && !query.get('isEditable')) throw "RecordArry is not editable";
    
    // you can't modify an array whose store keys are autogenerated from a 
    // query.
    
    // map to store keys
    keys = [] ;
    for(i=0;i<len;i++) keys[i] = recs.objectAt(i).get('storeKey');
    
    // pass along - if allowed, this should trigger the content observer 
    storeKeys.replace(idx, amt, keys);
    return this; 
  },
  
  // ..........................................................
  // AUTO-UPDATING
  // 
  
  /**
    Called by the store whenever some storeKeys have changed.  This will 
    indicate that the record array needs to apply the query again.
  */
  storeDidChangeStoreKeys: function(changedStoreKeys, recordTypes) {
    var query = this.get('query');

    // quick exit conditions
    if (!query || !query.get('updateAutomatically')) return this;
    if (!query.containsRecordTypes(recordTypes)) return this;

    // ok, one or more of these store keys matters to this record array,
    // so save off the info for later processing
    var changed = this._scq_changedStoreKeys;
    if (!changed) changed = this._scq_changedStoreKeys = SC.CoreSet.create();
    changed.addEach(changedStoreKeys);  // save for later
    this.set('needsUpdate', YES);
    this.enumerableContentDidChange(); // we don't know what ranges... :/
  },
  
  /**
    Set to YES whenever the record array knows the store has changed and 
    needs to apply the query again.  Whenever you try to access the 
    record array again, the query will be reapplied if necessary.
    
    (note: always needs update when query is first created)
  */
  needsUpdate: YES,
  
  /**
    Updates the record array from the source query if needsUpdate is YES,
    otherwise does nothing.
    
    @returns {SC.RecordArray} receiver
  */
  updateIfNeeded: function() {
    if (this.get('needsUpdate')) this.update();
    return this ;
  },
  
  /**
    Apply the query parameters to the record array contents.  If there is a 
    list of pending changes from the store, then this method will use those
    changes to update the result set.
    
    If there is no storeKey set yet, this method will generate the storeKeys
    from scratch.
    
    If the query is not generating content from the store, then this method
    has no effect.
    Apply the SC.Query again. This is invoked when new records are loaded
    or changed in the store (or directly on the array with .replace() ) and 
    and when we need to refresh all SC.Query 'based' record arrays 
    accordingly.
    
    @returns {SC.RecordArray} receiver
  */
  update: function() {
    
    this.set('needsUpdate', NO); // avoid running again.

    var query     = this.get('query'), 
        store     = this.get('store'), 
        changed   = this._scq_changedStoreKeys,
        didChange = NO,
        K         = SC.Record,
        storeKeys, ret, rec, status, recordType;
        
    // fast exit points
    if (!query || !store || query.get('storeKeys')) return this; 

    // if we have storeKeys already, just look at the changed keys
    if (storeKeys = this.get('storeKeys')) {
      if (!changed || changed.get('lengt')===0) return this;
      changed.forEach(function(storeKey) {

        // get record - do not include EMPTY or DESTROYED records
        rec = store.materializeRecord(storeKey);
        if (rec) status = rec.get('status');
        if (rec && !(status & K.EMPTY) && !(status & K.DESTROYED)) {
          if (query.contains(rec)) {
            if (storeKeys.indexOf(storeKey)<0) {
              if (!didChange) storeKeys = storeKeys.copy(); //only if needed
              storeKeys.addObject(storeKey);
              didChange = YES ;
            }
          } else {
            if (storeKeys.indexOf(storeKey)>=0) {
              if (!didChange) storeKeys = storeKeys.copy(); //only if needed
              storeKeys.removeObject(storeKey);
              didChange = YES ;
            }
          }
        }
        
      }, this);
      
    // if no storeKeys, then we have to go through all of the storeKeys 
    // and decide if they belong or not.  ick.
    } else {
      recordType = query.get('recordType') || query.get('recordTypes');
      storeKeys = [];
      store.storeKeysFor(recordType).forEach(function(storeKey) {
        rec = store.materializeRecord(storeKey);
        if (rec) status = rec.get('status');
        if (rec && !(status & K.EMPTY) && !(status & K.DESTROYED)) {
          if (query.contains(rec)) storeKeys.push(storeKey);
        }
      });
      didChange = YES ;
    }
    
    // only resort and update if we did change
    if (didChange) {
      storeKeys = SC.Query.orderStoreKeys(storeKeys, query, store);
      this.set('storeKeys', storeKeys); // replace content
    }
    
    return this;
  },
  
  /**
    Will call findAll() on the store, which allows for chaining findAll
    statements. Note that chaining findAll() will not notify the data
    source (only the initial findAll will).
    
    @param {SC.Query} queryKey a SC.Query object
    @returns {SC.RecordArray} 
  */
  findAll: function(queryKey) {
    return this.get('store').findAll(queryKey, null, this);
  },
  
  // ..........................................................
  // INTERNAL SUPPORT
  // 
  
  /** @private
    Invoked whenever the query changes.  Observes the status and storeKey
    properties.
  */
  _queryDidChange: function() {
    var query = this.get('query'),
        prev  = this._prevQuery;
    if (query === prev) return this ; // nothing to do
    if (prev) {
      prev.removeObserver('status', this, this._queryStatusDidChange);
      prev.removeObserver('storeKeys', this, this._queryStoreKeysDidChange);
    }
    
    this._prevQuery = query ;
    if (query) {
      query.addObserver('status', this, this._queryStatusDidChange);
      query.addObserver('storeKeys', this, this._queryStoreKeysDidChange);
    }
    
    this._queryStatusDidChange();
    this._queryStoreKeysDidChange();
    return this;
  }.observes('status'),
  
  /** @private
    Invoked whenever the query status changes.
  */
  _queryStatusDidChange: function() {
    this.notifyPropertyChange('status');
  },
  
  /** @private
    Invoked whenever the storeKeys on the status changes
  */
  _queryStoreKeysDidChange: function() {
    var query = this.get('query'),
        storeKeys = query ? query.get('storeKeys') : null;
    this.setIfChanged('storeKeys', storeKeys);
  },
    
  /** @private 
    Invoked whenever the storeKeys array changes.  Observes changes.
  */
  _storeKeysDidChange: function() {
    var storeKeys = this.get('storeKeys');
    
    var prev = this._prevStoreKeys, 
        f    = this._storeKeysContentDidChange,
        fs   = this._storeKeysStateDidChange;
    
    if (storeKeys === prev) return this; // nothing to do
    
    if (prev) prev.removeObserver('[]', this, f);
    this._prevStoreKeys = storeKeys;
    if (storeKeys) storeKeys.addObserver('[]', this, f);
    
    var rev = (storeKeys) ? storeKeys.propertyRevision : -1 ;
    this._storeKeysContentDidChange(storeKeys, '[]', storeKeys, rev);
    
  }.observes('storeKeys'),
  
  /** @private
    Invoked whenever the content of the storeKeys array changes.  This will
    dump any cached record lookup and then notify that the enumerable content
    has changed.
  */
  _storeKeysContentDidChange: function(target, key, value, rev) {
    this._records = null ; // clear cache
    
    this.beginPropertyChanges()
      .notifyPropertyChange('length')
      .enumerableContentDidChange()
    .endPropertyChanges();
  },
  
  init: function() {
    sc_super();
    this._queryDidChange();
    this._storeKeysDidChange();
  }
  
});

