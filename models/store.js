// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('foundation/object') ;

/**
  @class

  The Store is where you can find all of your records.  You should also
  use this to define your various types of records, since this will be
  used to automatically update from data coming from the server.

  You should create a store for each application.  This allows the records
  for apps to be kept separate, even if they live in the same page.

  @extends SC.Object
  @static
  @since SproutCore 1.0
*/
SC.Store = SC.Object.create(
/** @scope SC.Store.prototype */ {
  
  /**
    Pushes updated data to all the named records.  
  
    This method is often called from a server to update the store with the 
    included record objects.
  
    You can use this method yourself to mass update the store whenever you 
    retrieve new records from the server.  The first parameter should contain
    an array of JSON-compatible hashes.  The hashes can have any properties 
    you want but they should at least contain the following two keys:
  
    - guid: This is a unique identifier for the record. 
    - type: The name of the record type.  I.e. "Contact" or "Photo"
  
    @param dataHashes {Array} array of hash records.  See discussion.
    @param dataSource {Object} the data source.  Usually a server object.
    @param recordType {SC.Record} optional record type, used if type is not 
      found in the data hashes itself.
    @param isLoaded {Boolean} YES if the data hashes represent the full set of 
      data loaded from the server.  NO otherwise.

    @returns {Array} Array of records that were actually created/updated.
  */
  updateRecords: function(dataHashes, dataSource, recordType, isLoaded) {
    
    this.set('updateRecordsInProgress',true) ;
    var store = this ; 
    var ret = [] ;
    if (!recordType) recordType = SC.Record ;
    this.beginPropertyChanges() ;

    //SC.Benchmark._bench(function() { 
    dataHashes.each(function(data) {
      var rt = data.recordType || recordType; 
      if (data.recordType !== undefined) delete data.recordType;
      
      var pkValue = data[rt.primaryKey()] ;      
      var rec = store.getRecordFor(pkValue,rt,true) ;
      rec.dataSource = dataSource ;
      if (data.refreshURL) rec.refreshURL = data.refreshURL;
      if (data.updateURL) rec.updateURL = data.updateURL;
      if (data.destroyURL) rec.destroyURL = data.destroyURL;
      rec.updateAttributes(data, isLoaded, isLoaded) ;
      if (rec.needsAddToStore) store.addRecord(rec) ;
      ret.push(rec) ;
    });
//    },'dataHashes') ;  

    this.endPropertyChanges() ;
    this.set('updateRecordsInProgress',false) ;
    return ret ;
  },

  // ....................................
  // Record dataSource methods
  //

  refreshRecords: function(records) {},
  
  createRecords: function(recs) {
    recs.invoke('set','newRecord','false') ;
    this.commitRecords(recs); 
  },
  
  commitRecords: function(recs) { recs.invoke('set','isDirty','false'); },
  
  destroyRecords: function(recs) {
    var store = this ;
    recs.each(function(r) { 
      r.set('isDeleted',true); store.removeRecord(r);
    });
  },
  
  // ....................................
  // Record Helpers
  //
  
  /**
    Add a record instance to the store.  The record will now be monitored for
    changes.
  */
  addRecord: function(rec) {
    // save record in a cache
    rec.needsAddToStore = false;
    var guid = rec._storeKey();
    var records = this._records[guid] || [];
    records.push(rec);
    this._records[guid] = records; 

    // global record cache
    if (!this._quickCache) this._quickCache = {};

    // records are cached by Class type
    var records = this._quickCache[guid] || {};
    var pkey = rec.get(rec.primaryKey);
    records[pkey] = rec;
    this._quickCache[guid] = records;

    // and start observing it.
    rec.addObserver('*',this._boundRecordObserver) ;
    this.recordDidChange(rec) ;
  },

  /**
    remove a record instance from the store.  The record will no longer be
    monitored for changes and may be deleted.
  */  
  removeRecord: function(rec) {
    // remove from cache
    var guid = rec._storeKey();
    var records = this._records[guid] || [];
    records = records.without(rec);
    this._records[guid] = records;
    
    // remove from quick cache
    if (this._quickCache)
    {
      var records = this._quickCache[guid] || {};
      var pkey = rec.get(rec.primaryKey);
      delete records[pkey];
      this._quickCache[guid] = records;
    }

    // and stop observing it.
    rec.removeObserver('*',this._boundRecordObserver) ;
    this.recordDidChange(rec) ; // this will remove from cols since destroyed.
  },

  /**
    Since records are cached by primaryKey, whenever that key changes we need 
    to re-cache it in the proper place
    
    @param {string} oldkey Previous primary key
    @param {string} newkey New primary key
    @param {SC.Record} rec The object to relocate
    @returns {SC.Record} The record passed in
  **/
  relocateRecord: function( oldkey, newkey, rec )
  {
    if (!this._quickCache) return rec;
    
    var classKey = rec._storeKey();
    var records  = this._quickCache[classKey] || {};

    records[newkey] = rec;
    delete records[oldkey];
    
    this._quickCache[classKey] = records;
    
    return rec;
  },


  /**
    You can pass any number of condition hashes to this, ending with a
    recordType.  It will AND the results of each condition hash.
  */  
  findRecords: function() {
    var allConditions = SC.$A(arguments) ;
    var recordType = allConditions.pop() ;
    var guid = recordType._storeKey() ;

    // initial set of records.
    var records = this._records[guid] ;
    
    while(allConditions.length > 0) {
      var conditions = allConditions.pop() ;
      var ret = [] ; var loc = (records) ? records.length : 0;
      while(--loc >= 0) {
        var rec = records[loc] ;
        if ((rec._type == recordType) || (rec._type.coreRecordType == recordType)) {
          if (rec.matchConditions(conditions)) ret.push(rec) ;
        }
      }
      records = ret ;
    }

    // clone records...
    return SC.$A(records) ;
  },
  
  // private method used by Record and Store. Returns null if the record does not exist.
  _getRecordFor: function(pkValue,recordType) {
    var guid = recordType._storeKey() ;
    var records = (this._quickCache) ? this._quickCache[guid] : null;
    var ret = (records) ? records[pkValue] : null ;
    return ret ;
  },
  
  /**
    finds the record with the primary key value.  If the record does not 
    exist, creates it.
  */
  getRecordFor: function(pkValue,recordType,dontAutoaddRecord) {
    var ret = this._getRecordFor(pkValue,recordType) ;
    if (!ret) {
      var opts = {}; opts[recordType.primaryKey()] = pkValue;
      ret = recordType.create(opts) ;
      if (dontAutoaddRecord) {
        ret.needsAddToStore = true ;
      } else this.addRecord(ret) ;
    }
    return ret ;
  },
  
  /**
    Returns an array of all records in the store.  Mostly used for storing.
  */
  records: function() {
    var ret = [] ;
    if (this._quickCache) {
      for(var key in this._quickCache) {
        var recs = this._quickCache[key] ;
        for(var recKey in recs) {
          ret.push(recs[recKey]) ;
        }
      }
    }
    return ret ;
  }.property(),
  
  // ....................................
  // Collection Helpers
  //
  
  addCollection: function(collection) {
    var guid = collection.recordType._storeKey() ;
    var collections = this._collections[guid] || [] ;
    collections.push(collection) ;
    this._collections[guid] = collections ;
  },
  
  removeCollection: function(collection) {
    var guid = collection.recordType._storeKey() ;
    var collections = this._collections[guid] || [] ;
    collections = collections.without(collection) ;
    this._collections[guid] = collections ;
  },
  
  listFor: function(opts) {
    var conditions = opts.conditions || {} ;
    var order = opts.order || ['guid'] ;
    var records = this.findRecords(conditions,opts.recordType) ;
    var count = records.length ;

    // sort
    records = records.sort(function(a,b) { return a.compareTo(b,order); }) ;
    
    // slice if needed.
    if (opts.limit && (opts.limit > 0)) {
      var start = (opts.offset) ? opts.offset : 0 ;
      var end = start + opts.limit ;
      records = records.slice(start,end) ;      
    }
    
    // now run callback.
    if (opts.callback) opts.callback(records,count) ; 
  },
  
  // ....................................
  // PRIVATE
  //
  _records: {}, _changedRecords: null, _collections: {},
  
  /** @private
    called whenever properties on a record change.
  */  
  recordDidChange: function(rec) {
    // add to changed records.  This will eventually notify collections.
    var guid = rec._storeKey() ;
    changed = this.get('_changedRecords') || {};
    records = changed[guid] || {} ;
    records[rec._guid] = rec ;

    changed[guid] = records ;    
    this.set('_changedRecords',changed) ;
  },
  
  // invoked whenever the changedRecords hash is updated. This will notify
  // collections.
  _changedRecordsObserver: function() { 
    // process changedRecords to notify collections.
    for(var guid in this._changedRecords) {
      var collections = this._collections[guid] ;
      if (collections && collections.length>0) {
        
        // collect records into array.  Faster than using uniq.
        var records = [] ;
        for(var key in this._changedRecords[guid]) {
          records.push(this._changedRecords[guid][key]) ;
        }
        var cloc = collections.length ;
        while(--cloc >= 0) {
          
          // for each collection watching this type of record, notify.
          var col = collections[cloc] ;
          col.beginPropertyChanges() ;
          try {
            // for each record...
            var rloc = records.length ;
            while(--rloc >= 0) {
              var record = records[rloc] ;
              // notify only if record type matches.
              if (col.recordType == record._type) {
                col.recordDidChange(record) ;
              }
            }
          }
          catch (e) {
            console.log('EXCEPTION: While notifying collection') ;
          }
          col.endPropertyChanges() ;
          
        }
      }
    }
    
    // then clear changed records to start again.
    this._changedRecords = {} ;
    
  }.observes('_changedRecords'),
  
  init: function() {
    arguments.callee.base.call(this) ;
    this._boundRecordObserver = this.recordDidChange.bind(this) ;
  }
    
}) ;
