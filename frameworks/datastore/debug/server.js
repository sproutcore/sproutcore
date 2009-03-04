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
    
    this.get('inMemoryStore').loadRecords(json, MyApp.Author);
    
  },
  
  retrieveRecordForGuid: function(guid, recordType) {
    
    console.log("retrieveRecordForGuid in persistentStore");
    return recordType;
  },
  handleChangesFromStore: function(childStore) {
    console.log("retrieveRecordForGuid in persistentStore");
  },
  isPersistent: YES
});
