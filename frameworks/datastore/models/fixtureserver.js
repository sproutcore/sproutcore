// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

require('core') ;
require('models/persistentstore') ;
/**
  @class

  @extends SC.PersistentStore
  @static
  @since SproutCore 1.0
*/

SC.FixtureServer = SC.PersistentStore.extend(
/** @scope SC.PersistentStore.prototype */ {
  
  makeChangesPersistent: function(childStore) {
    

    var isSuccess = YES;

    var dataHashes = childStore.dataHashes;
    var storeKeyMap = childStore.storeKeyMap;
    var recKeyTypeMap = childStore.recKeyTypeMap;
    var instantiatedRecordMap = childStore.instantiatedRecordMap;

    for(var i=0; i<this.createdRecords.length;i++) {
      console.log("AJAX create with hash: "+SC.json.encode(dataHashes[this.createdRecords[i]]));
    }

    for(var i=0; i<this.updatedRecords.length;i++) {
      console.log("AJAX update for guid: "+storeKeyMap[this.updatedRecords[i]] + " with hash: "+SC.json.encode(dataHashes[this.updatedRecords[i]]));
    }

    for(var i=0; i<this.deletedRecords.length;i++) {
      console.log("AJAX delete for guid: "+storeKeyMap[this.deletedRecords[i]] + " with hash: "+SC.json.encode(dataHashes[this.deletedRecords[i]]));
    }

    return isSuccess;
  },
  retrieveRecordForGuid: function(guid, recordType) {
  
    return recordType;
  },
  provideLengthForQuery: function(query) {
    if(this.parentStore) {
      this.parentStore.provideLengthForQuery(query);
    } else {
      if(query) {
        query.performQuery();
      }
    }
  },

  prepareQuery: function(query) {
    if(this.parentStore) {
      this.parentStore.prepareQuery(query);
    } else {
      //query.set('hasAllRecords', YES);

      console.log("prep persistent store for query");
    }
  },
  
  provideRecordsForQuery: function(query, range) {
    if(query) {
      query.performQuery();
    }
  },
  
  
});