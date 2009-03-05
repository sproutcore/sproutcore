// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Apple, Inc. and contributors.
// License:   Licened under MIT license (see license.js)
// ==========================================================================


SC.PersistentStore = SC.Object.extend({
  parentStore: null,
  inMemoryStore: null,

  addInMemoryStore: function(inMemoryStore) {
    this.set('inMemoryStore', inMemoryStore);
    inMemoryStore.set('parentStore', this);
  },
  
  simulateResponseFromServer: function(guid) {
    var json = [];
    if(guid === '123') {
      json = [ {"type": "Author", "guid": "123","fullName": "Mr. From Server", "bookTitle": "The Fear of the Spiders", "address":" London University, 142 Castro St, London, UK"}];
    }
    if(guid === 51) {
      this.get('inMemoryStore').didCreateRecords([51], ['abcdefg'], [{guid: 'abcdefg', fullName: "John Locke", bookTitle: "A Letter Concerning Toleration"}]);

      return;
    }
    if(guid === 52) {
      this.get('inMemoryStore').didCreateRecords([52], ['abc'], [{guid: 'abc', fullName: "Jim Locke", bookTitle: "A Letter Concerning Toleration Part Deux"}]);

      return;
    }
    
    this.get('inMemoryStore').loadRecords(json, MyApp.Author);
    
  },
  
  retrieveRecordForGuid: function(guid, recordType) {
    
    console.log("retrieveRecordForGuid in persistentStore");
    return recordType;
  },
  
  createdRecords: [],
  deletedRecords:[],
  updatedRecords: [],
  
  commitChangesFromStore: function(childStore)
  {
    console.log("commitChangesFromStore in persistentStore");
    if(childStore === undefined) return NO;

    var isSuccess = YES;


    // Get the childStore's properties.
    var persistentChanges = childStore.persistentChanges;
    var dataHashes = childStore.dataHashes;
    var storeKeyMap = childStore.storeKeyMap;
    var recKeyTypeMap = childStore.recKeyTypeMap;
    var instantiatedRecordMap = childStore.instantiatedRecordMap;

    this.createdRecords = persistentChanges.created;
    this.deletedRecords = persistentChanges.deleted;
    this.updatedRecords = persistentChanges.updated;
    
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
  isPersistent: YES
});
