// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Apple, Inc. and contributors.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

var store, storeKey1, storeKey2, json;
module("SC.Store#writeDataHash", {
  setup: function() {
    store = SC.Store.create();
    
    json = {
      string: "string",
      number: 23,
      bool:   YES
    };
    
    storeKey1 = SC.Store.generateStoreKey();
    storeKey2 = SC.Store.generateStoreKey();

    // write existing record
    store.writeDataHash(storeKey1, json, SC.RECORD_LOADING);
    store.commitChanges();
  }
});

// ..........................................................
// ADD NEW
// 
test("writing a new data hash and status", function() {
  json = SC.clone(json); // create new instance for testing
  
  ok(!store.dataHashes[storeKey2], 'precond - should not have record in dataHashes');
  
  store.writeDataHash(storeKey2, json, SC.RECORD_LOADING);
  
  // check high-level result
  var result = store.readDataHash(storeKey2);
  equals(result, json, 'should return same json we just wrote');
  equals(store.readStatus(storeKey2), SC.RECORD_LOADING, 'should return status');
  
  // check extra internals
  ok(store.editables[storeKey2], 'data hash should be marked editable');
  ok(store.locks[storeKey2], 'store should have a lock set');
  ok(!store.revisions[storeKey2], 'store should not have revision yet since that is not set until you call dataHashDidChange() (actual: %@)'.fmt(SC.inspect(store.revisions)));
  
  // should not add to changes
  ok(!store.changedDataHashes || !store.changedDataHashes.contains(storeKey2), 'should not yet be in changed store keys');
});




test("writing a new data hash with no status", function() {
  json = SC.clone(json); // create new instance for testing
  
  ok(!store.dataHashes[storeKey2], 'precond - should not have record in dataHashes');
  
  store.writeDataHash(storeKey2, json);
  
  // check high-level result
  var result = store.readDataHash(storeKey2);
  equals(result, json, 'should return same json we just wrote');
  equals(store.readStatus(storeKey2), SC.RECORD_NEW, 'should return status');
});

// ..........................................................
// REPLACE EXISTING
// 
test("replacing a new data hash and status", function() {
  json = SC.clone(json); // create new instance for testing
  
  ok(store.dataHashes[storeKey1], 'precond - should have record in dataHashes');
  
  var oldrev = store.revisions[storeKey1];
  
  store.writeDataHash(storeKey1, json, SC.RECORD_LOADING);
  
  // check high-level result
  var result = store.readDataHash(storeKey1);
  equals(result, json, 'should return same json we just wrote');
  equals(store.readStatus(storeKey1), SC.RECORD_LOADING, 'should return status');
  
  // check extra internals
  ok(store.editables[storeKey1], 'data hash should be marked editable');
  ok(store.locks[storeKey1], 'store should have a lock set');
  equals(store.revisions[storeKey1], oldrev, 'store have old revision still');
  
  // should not add to changes
  ok(!store.changedDataHashes || !store.changedDataHashes.contains(storeKey1), 'should not yet be in changed store keys');
});

test("replacing an existing data hash with no status", function() {
  json = SC.clone(json); // create new instance for testing
  
  ok(store.dataHashes[storeKey1], 'precond - should have record in dataHashes');
  var oldStatus = store.readStatus(storeKey1);
  
  store.writeDataHash(storeKey1, json);
  
  // check high-level result
  var result = store.readDataHash(storeKey1);
  equals(result, json, 'should return same json we just wrote');
  equals(store.readStatus(storeKey1), oldStatus, 'should return old status');
});

// ..........................................................
// MULTIPLE EDITS
// 
test("replacing a data hash multiple times", function() {
  json = SC.clone(json); // create new instance for testing
  
  ok(store.dataHashes[storeKey1], 'precond - should have record in dataHashes');
  ok(!store.locks || !store.locks[storeKey1], 'precond - should not have lock');
  ok(!store.editables || !store.editables[storeKey1], 'precond - should not be editable');
  
  var oldrev = store.revisions[storeKey1];
  
  // first edit
  store.writeDataHash(storeKey1, json);
  equals(store.readDataHash(storeKey1), json, 'should return same json');
  
  // check extra internals
  ok(store.editables[storeKey1], 'data hash should be marked editable');
  ok(store.locks[storeKey1], 'store should have a lock set');
  equals(store.revisions[storeKey1], oldrev, 'store have old revision still');
  
  // should not add to changes
  ok(!store.changedDataHashes || !store.changedDataHashes.contains(storeKey1), 'should not yet be in changed store keys');
  
  var newLock = store.locks[storeKey1];


  // second edit
  var json2 = {} ;
  store.writeDataHash(storeKey1, json2);
  equals(store.readDataHash(storeKey1), json2, 'should return new json');
  
  // check extra internals
  ok(store.editables[storeKey1], 'data hash should be marked editable');
  equals(store.locks[storeKey1], newLock, 'store should have same lock set during first edit');
  equals(store.revisions[storeKey1], oldrev, 'store have old revision still');
  
  // should not add to changes
  ok(!store.changedDataHashes || !store.changedDataHashes.contains(storeKey1), 'should not yet be in changed store keys');
});
