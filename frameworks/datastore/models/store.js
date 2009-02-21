// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

require('core') ;
/**
  @class


  The DataStore is where you can find all of your dataHashes. There can be one
  'Active' record registered at a time. From this active record, you can chain
  dataHashes used for editing, etc. Objects are recordd as JSON and are materialized
  as SproutCore record objects on demand.
  
  By default, a base "SC.Store" is created for your application. If you have more
  than one applications running at once, you can manually create other base dataHashes
  using the isBaseStore property.
  
  The reason to keep seperate data dataHashes for each application is to reduce complexity
  and decrease the chance for data corruption.
  

  When chaining data dataHashes, changes in the chained record will be probagated to the 
  parent record and saved if possible (The chained record has a newer version of the object).
  
  If you are at the base record, you can specify a parent record that may be a REST or 
  local storage interface for persistant storage.

  @extends SC.Object
  @static
  @since SproutCore 1.0
*/

SC.DataStore = SC.Object.extend(
/** @scope SC.DataStore.prototype */ {

  /**
    This is set to YES to signify that you're a transient record. Basically, that means
    that you can't load data from a server.

    @property
    @type {Boolean}
    @default YES
  */
  isTransient: YES,

  /**
    This is set to YES when there are changes that have not been committed yet.

    @property
    @type {Boolean}
    @default NO
  */
  hasUncommittedChanges: NO,

  /**
    At times, it is useful to know if the record you're working with is chained or not. This
    property returns YES if it is chained from a base record, otherwise NO.
  
    @property
    @type {Boolean}
    @default NO
  */
  isChainedStore: function() {
    return (this.get('parentStore') !== null );
  }.property('parentStore').cacheable(),


  /**
    This is a handle to the parent record that you can chain from. Also, if you're
    a base record, you can specify a parent record that is a handle to perisistant 
    storage.

    @property
    @type {SC.DataStore}
  */
  parentStore: null,
  
  /**
    The chainedStores property is an array that contains all the chained dataHashes for 
    THIS record.
    
    @property
    @type {Array}
  */
  chainedStores: [],

  /**
    This is the change set that is kept for a record. When the record is committed, this hash is
    used to pass changes down to from chained record dataHashes to their parents. 
    
    The changes hash contains the following:
    
      "created", "deleted", and "updated" are Arrays that contain change sets in the form:
    
        {guid: guid, json: json, rev: revision}

      "createdGuids", "deletedGuids", and "updatedGuids" are hashes that contain 
       the index into the arrays based on the data guidMap.
       
    @property
    @type {Object}
  */
  changes: [],
  
  /**
    This is an internal hash that is used for quick look up of chained dataHashes.
  
    @private
    @property
    
    @type {Object}
  */
  _chainedStoreGuids: {},

  /**
    Create a chained data record form this instance. Adds it to the list of chained dataHashes
    for this record.
    
    @returns {SC.DataStore} Returns a new record that is chained from this one.
  */
  createChainedStore: function() {
    var chainedStore = SC.DataStore.create({isTransient: true, parentStore: this});
        
    chainedStore.dataHashes = SC.beget(this.dataHashes);
    chainedStore.revisions = SC.beget(this.revisions);

    this._chainedStoreGuids[SC.guidFor(chainedStore)] = (this.get('chainedStores').push(chainedStore)-1); 

    this.resetChainedStore(chainedStore);
    return chainedStore;
  },

  /**
    Remove a chained record from its parent.
    
    @returns {Boolean} Returns YES if the operation was successful.  
  */
  removeFromParentStore: function() {
    
    // I think this may something that should destroy the record, we don't want dangling dataHashes do we?
    var pS = this.get('parentStore');
    if(pS) {
      return pS.removeChainedStore(this);
    }
    return NO;
  },

  /**
    Remove a given chained record from its parent.

    @param {SC.DataStore} chainedStore The chained record that is being removed.

    @returns {Boolean} Returns YES if the operation was successful.  
  */
  removeChainedStore: function(chainedStore) {
    if(chainedStore) {
      var guid = SC.guidFor(chainedStore);
      var chainedStoreIndex = this._chainedStoreGuids[guid];

      if(chainedStoreIndex !== undefined) {
        this.get('chainedStores').splice(chainedStoreIndex, 1);
        this._chainedStoreGuids[guid] = null;
        chainedStore.set('parentStore', null);
        return YES;
      }
    }
    return NO;
  },


  // If collision, highest revision wins.
  // If no collision, chained parent change set does not change, it just gets passed down further.

  handleChangesFromChainedStore: function(chainedStore)
  {
    if(chainedStore === undefined) return NO;

    var dataHashes = this.dataHashes;
    var latestRevisions = this.latestRevisions;
    var revisions = this.revisions;

    var changes = chainedStore.changes;
    var chained_dataHashes = chainedStore.dataHashes;
    var chained_revisions = chainedStore.revisions;

    // Handle changes.
    for(var i=0, iLen=changes.length; i<iLen; i++) {
      var recKey = changes[i];
      var rev = chained_revisions[recKey];
      if(rev >= revisions[recKey] && rev === latestRevisions[recKey]) {
        dataHashes[recKey] = chained_dataHashes[recKey];
        revisions[recKey] = rev;
      } 
    }

    this.resetChainedStore(chainedStore);
    
    return YES;
  },

  /**
    Reset a chained record.

    @param {SC.DataStore} chainedStore The chained record to have its data replaced.
  */
  resetChainedStore: function(chainedStore) {
    chainedStore._chainedStoreGuids = {};
    chainedStore.chainedStores = [];
    chainedStore.isBaseStore = NO;

    chainedStore.dataHashes = SC.beget(this.dataHashes);
    chainedStore.revisions = SC.beget(this.revisions);

    chainedStore.changes = []; 
  },

  
  commitChanges: function() {
    return this.get('parentStore').handleChangesFromChainedStore(this);
  },
  
  // How to discard changes on base record?
  discardChanges: function() {
    return this.get('parentStore').resetChainedStore(this);
  },
  
  /**
    Creates or updates dataHashes in the record.
  
    This method is often called from a server to update the record with the 
    included record objects.
  
    You can use this method yourself to mass update the record whenever you 
    retrieve new dataHashes from the server.  The first parameter should contain
    an array of JSON-compatible hashes.  The hashes can have any properties 
    you want but they should at least contain the following two keys:
  
    - guid: This is a unique identifier for the record. 
    - type: The name of the record type.  I.e. "Contact" or "Photo"
  
    @param {Array|String} dataHashes array of hash dataHashes.  See discussion.

    @returns {Boolean} Returns YES if the record operation was successful.
  */  
  updateRecords: function(dataArr) {

    // One last sanity check to see if the hash is in the proper format.
    if(typeof dataArr !== 'object') {
      return NO;
    }
    SC.Benchmark.start('updateRecords: pre');


    var isSuccess = YES;
    var dataHashes = this.dataHashes;
    var guidMap = this.guidMap;
    var revisions = this.revisions;
    var latestRevisions = this.latestRevisions;
    var changes = this.changes;
    var storeIndex = this.nextStoreIndex;
    var recKeyMap = this.recKeyMap;
    var isTransient = this.isTransient;
   // this.beginPropertyChanges() ;
   //console.log(dataArr.length);
   SC.Benchmark.end('updateRecords: pre');

   SC.Benchmark.start('updateRecords: loop');
    for(var i=0, iLen=dataArr.length; i<iLen; i++) {

      SC.Benchmark.start('updateRecord');

      var data = dataArr[i];
      var recKey = guidMap[guid];
      var rec, rev;
      var type = data.type;
      var guid = data.guid;

      if(!type || !guid) {
        var err = (!type && !guid) ? 'guid and type' : (!guid) ? 'guid' : (!type) ? 'type' : '';
        console.error("SC.DataStore: Insertion of record failed, missing %@.".fmt(err));
        isSuccess = NO;
      }
      
      if(recKey !== undefined)
      {
        if(dataHashes[recKey])
        {
          rev = revisions[recKey] = (revisions[recKey]+1);
          if(latestRevisions[recKey] < rev) latestRevisions[recKey] = rev;
          dataHashes[recKey] = data;
          changes.push(recKey);
        }
        else
        {
          console.error("SC.DataStore: Record key is registed, but no record exists for guid %@.".fmt(guid));
          isSuccess = NO;
        }
      }
      else
      {

        guidMap[guid] = storeIndex;
        latestRevisions[storeIndex] = 0;
        revisions[recKey] = 0;
        recKeyMap[storeIndex] = guid;
        dataHashes[storeIndex] = data;

        storeIndex++;
        //this.dataHashesLen++;

        if(!isTransient)
        {
          changes.push(recKey);
        }
      }
      SC.Benchmark.end('updateRecord');
    }
    SC.Benchmark.end('updateRecords: loop');
    SC.Benchmark.start('updateRecords: post');

    this.nextStoreIndex = storeIndex;

    this.set('hasUncommittedChanges', (changes.length > 0));
//
    //this.endPropertyChanges() ;

    
    SC.Benchmark.end('updateRecords: post');
    // Return YES to signify successful import.
    return isSuccess;
    
  },
  
  /**
    Routes to the updateRecord function.

    @param {Object} data hash for single record.

    @returns {Boolean} Returns YES if the record operation was successful.
  */
  addRecord: function(data) {
    return this.updateRecords([data]);
  },
  
  /**
    This function creates or updates a record.
    
    A record is a data hash that contains at least the following parameters:
    
    - guid: This is a unique identifier for the record. 
    - type: The name of the record type.  I.e. "Contact" or "Photo"
      
    @param {Object} data hash for single record.

    @returns {Boolean} Returns YES if the record operation was successful.
  */
  updateRecord: function(data)
  {
    return this.updateRecords([data]);
  },

  /**
    Given array of guidMap or dataHashes, delete them.
    
    @param {Array} data Array of guidMap or dataHashes.
    
    @returns {Boolean} Returns YES if the record operation was successful.
  */
  deleteRecords: function(data)
  {
    var isSuccess = YES;
    
//    this.beginPropertyChanges() ;

    var changes = this.changes;
    var guidMap = this.guidMap;
    var dataHashes = this.dataHashes;
    var latestRevisions = this.latestRevisions;
    var revisions = this.revisions;
    
    for(var i=0, iLen=data.length; i<iLen; i++) {

      if(typeof data !== 'string') {
        data = data.get('guid');
        if(!data) isSuccess = NO;
      }

      var recKey = guidMap[guid];
      if(recKey !== undefined)
      {
        var rec = dataHashes[recKey];
        var rev = latestRevisions[recKey] = revisions[recKey] = revisions[recKey]+1;

        if(rec !== undefined)
        {
          if(changes.indexOf(recKey) === -1) {
            changes.push(recKey);
          }
          dataHashes[recKey] = null;
        }
        else
        {
          isSuccess = NO;
        }
      }
      else
      {
        isSuccess = NO;
      }
    }

    this.set('hasUncommittedChanges', (changes.length > 0));

    //this.endPropertyChanges() ;
    
    return isSuccess;
  },
  
  /**
    Given guid or record, delete it.
    
    @param {Array} guid A guid or record.
    
    @returns {Boolean} Returns YES if the record operation was successful.
  */
  deleteRecord: function(guid)
  {
    return this.deleteRecords([guid]);
  },
  

  getWriteableAttrHash: function(guid) {
    var ret = null;
    var recKey = this.guidMap[guid];
    if(recKey !== undefined) {
      ret = this.dataHashes[recKey];
      if(ret === this.get('parentStore').dataHashes[recKey])
      {
        ret = this.dataHashes[recKey] = SC.clone(ret);
      }
    }
    return ret;
  },

  getAttrHash: function(guid)
  {
    var ret = null;
    var recKey = this.guidMap[guid];
    if(recKey !== undefined) {
      ret = this.dataHashes[recKey];
    }
    return ret;
  }
  
  
}) ;


SC.DataStore.prototype.dataHashes = [];
SC.DataStore.prototype.revisions = [];
SC.DataStore.prototype.guidMap = {};
SC.DataStore.prototype.recKeyMap = [];
SC.DataStore.prototype.latestRevisions = [];

SC.DataStore.prototype.nextStoreIndex = 0;
SC.DataStore.prototype.dataHashesLen = 0;
SC.DataStore.prototype.activeStore = null;


// SC.Store = SC.DataStore.create();
// SC.Store.registerAsActive();
