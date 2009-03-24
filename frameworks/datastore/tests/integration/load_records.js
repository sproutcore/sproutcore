// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Apple, Inc. and contributors.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test json0_9 json10_19 json20_29 json30_39 json40_49 StandardTestSetup MyApp */

module("SC.Store - SC.Record integration", {
  setup: function() {
    StandardTestSetup.setup().loadRecords();
  }
});

// ..........................................................
// EDITING ATTRIBUTES
// 

test("record: materialize guid='4995bc653ae78', test using set() on record without beginEditing() call. then commitChanges on store.", function() {
  var record = MyApp.store.find('4995bc653ae78', MyApp.Author);
  ok(typeof record === 'object', "record returned is of type 'object'");
  ok(record.get('fullName') == "Erskine Aultman 2", "record.get('fullName') should equal 'Erskine Aultman 2'");

  ok(MyApp.store.revisions[record.storeKey] === 0, "Before editing record, revision in store should be 0.");

  record.set('fullName', 'Bob Jones');
  ok(record.get('fullName') == "Bob Jones", "record.set('fullName', 'Bob Jones'), fullName should equal 'Bob Jones'");
  ok(record._editLevel === 0, "after a set operation without using explicit beginEditing(), _editLevel should return to 0. ACTUAL: " + record._editLevel);

  ok(MyApp.store.revisions[record.storeKey] === 1, "After first edit, revision in store should be 1. ACTUAL: " + MyApp.store.revisions[record.storeKey]);

  record.set('fullName', 'Bobby Jones');
  ok(record.get('fullName') == "Bobby Jones", "record.set('fullName', 'Bobby Jones'), fullName should equal 'Bobby Jones'");
  ok(record._editLevel === 0, "after a set operation without using explicit beginEditing(), _editLevel should return to 0. ACTUAL: " + record._editLevel);

  ok(MyApp.store.revisions[record.storeKey] === 2, "After second edit, revision in store should be 2. ACTUAL: " + MyApp.store.revisions[record.storeKey]);

  ok(MyApp.store.changes.length == 2, "BEFORE commit, 2 changes should have been recorded."); 
  ok(MyApp.store.persistentChanges.updated.length == 2, "BEFORE commit, 2 persistentChanges.updated should have been recorded."); 
  ok(MyApp.store.get('hasChanges') === YES, "BEFORE commit, hasChanges property on store is set to YES."); 

  var success = MyApp.store.commitChanges();
  ok(success == YES, "AFTER commit, YES should be returned to signify success."); 

  ok(MyApp.store.changes.length === 0, "AFTER commit and reset of changes should result in a length of 0."); 
  ok(MyApp.store.persistentChanges.updated.length === 0, "AFTER commit and reset of persistentChanges.updated should result in a length of 0."); 
  ok(MyApp.store.get('hasChanges') === NO, "AFTER commit and reset, hasChanges property on store is set to NO."); 

});

test("record: materialize guid='4995bc653af24', test using set() on record WITH beginEditing() and endEditing() calls. then commitChanges store.", function() {
  var record = MyApp.store.find('4995bc653af24', MyApp.Author);
  ok(typeof record === 'object', "record returned is of type 'object'");
  ok(record.get('fullName') == "Hailey Berkheimer 3", "record.get('fullName') should equal 'Hailey Berkheimer 3'");

  ok(MyApp.store.revisions[record.storeKey] === 0, "Before editing record, revision in store should be 0.");

  record.beginEditing();
  
  record.set('fullName', 'Bob Jones');
  ok(record.get('fullName') == "Bob Jones", "record.set('fullName', 'Bob Jones'), fullName should equal 'Bob Jones'");
  ok(record._editLevel === 1, "after a set operation with explicit beginEditing(), _editLevel should be to 1. ACTUAL: " + record._editLevel);

  ok(MyApp.store.revisions[record.storeKey] === 0, "After first edit, revision in store should be 0. ACTUAL: " + MyApp.store.revisions[record.storeKey]);

  record.set('fullName', 'Bobby Jones');
  ok(record.get('fullName') == "Bobby Jones", "record.set('fullName', 'Bobby Jones'), fullName should equal 'Bobby Jones'");
  ok(record._editLevel === 1, "after a set operation with explicit beginEditing(), _editLevel should be to 1. ACTUAL: " + record._editLevel);

  ok(MyApp.store.revisions[record.storeKey] === 0, "After second edit, revision in store should be 0. ACTUAL: " + MyApp.store.revisions[record.storeKey]);
  
  record.endEditing();

  ok(MyApp.store.revisions[record.storeKey] === 1, "AFTER calling record.endEditing(), revision in store should be 1. ACTUAL: " + MyApp.store.revisions[record.storeKey]);
  ok(record._editLevel === 0, "AFTER calling record.endEditing() with explicit beginEditing(), _editLevel should be to 0. ACTUAL: " + record._editLevel);

  
  ok(MyApp.store.changes.length == 1, "BEFORE commit, 1 changes should have been recorded."); 
  ok(MyApp.store.persistentChanges.updated.length == 1, "BEFORE commit, 1 persistentChanges.updated should have been recorded."); 
  ok(MyApp.store.get('hasChanges') === YES, "BEFORE commit, hasChanges property on store is set to YES."); 

  var success = MyApp.store.commitChanges();
  ok(success == YES, "AFTER commit, YES should be returned to signify success."); 


  ok(MyApp.store.changes.length === 0, "AFTER commit and reset of changes should result in a length of 0."); 
  ok(MyApp.store.persistentChanges.updated.length === 0, "AFTER commit and reset of persistentChanges.updated should result in a length of 0."); 
  ok(MyApp.store.get('hasChanges') === NO, "AFTER commit and reset, hasChanges property on store is set to NO."); 

});

test("record: materialize guid='4995bc653b043', test using set() on record without beginEditing() call. then discardChanges on store.", function() {
  var record = MyApp.store.find('4995bc653b043', MyApp.Author);
  ok(typeof record === 'object', "record returned is of type 'object'");
  ok(record.get('fullName') == "Clitus Mccallum 2", "record.get('fullName') should equal 'Clitus Mccallum 2'");

  ok(MyApp.store.revisions[record.storeKey] === 0, "Before editing record, revision in store should be 0.");

  record.set('fullName', 'Bob Jones');
  ok(record.get('fullName') == "Bob Jones", "record.set('fullName', 'Bob Jones'), fullName should equal 'Bob Jones'");
  ok(record._editLevel === 0, "after a set operation without using explicit beginEditing(), _editLevel should return to 0. ACTUAL: " + record._editLevel);

  ok(MyApp.store.revisions[record.storeKey] === 1, "After first edit, revision in store should be 1. ACTUAL: " + MyApp.store.revisions[record.storeKey]);

  record.set('fullName', 'Bobby Jones');
  ok(record.get('fullName') == "Bobby Jones", "record.set('fullName', 'Bobby Jones'), fullName should equal 'Bobby Jones'");
  ok(record._editLevel === 0, "after a set operation without using explicit beginEditing(), _editLevel should return to 0. ACTUAL: " + record._editLevel);

  ok(MyApp.store.revisions[record.storeKey] === 2, "After second edit, revision in store should be 2. ACTUAL: " + MyApp.store.revisions[record.storeKey]);

  ok(MyApp.store.changes.length == 2, "BEFORE discard, 2 changes should have been recorded."); 
  ok(MyApp.store.persistentChanges.updated.length == 2, "BEFORE discard, 2 persistentChanges.updated should have been recorded."); 
  ok(MyApp.store.get('hasChanges') === YES, "BEFORE discard, hasChanges property on store is set to YES."); 

  var didThrow = NO;
  try {
    var success = MyApp.store.discardChanges();
    ok(success == NO, "AFTER discard, NO should be returned to signify error because you're in a store that is attached to a fixtureServer."); 
  } catch(e) {
    didThrow = YES;
  }
  ok(didThrow == YES, "AFTER discardChanges of parentStore, FATAL error was thrown."); 

  ok(MyApp.store.changes.length === 0, "AFTER discard and reset of changes should result in a length of 0."); 
  ok(MyApp.store.persistentChanges.updated.length === 0, "AFTER discard and reset of persistentChanges.updated should result in a length of 0."); 
  ok(MyApp.store.get('hasChanges') === NO, "AFTER discard and reset, hasChanges property on store is set to NO."); 

});

// ..........................................................
// DESTROY
// 

test("record: destroy existing record with guid='4995bc653b043' by calling store.destroyRecords([record]) then commitChanges.", function() {
  var record = MyApp.store.find('4995bc653b043', MyApp.Author);
  ok(typeof record === 'object', "record returned is of type 'object'");
  
  equals(record.get('fullName'), "Clitus Mccallum 2", "record.get('fullName')");

  MyApp.store.destroyRecords([record]);

  equals(record.get('fullName'), null, "record.get('fullName') shoud be null");

  equals(MyApp.store.changes.length, 1, "BEFORE commit, store.changes.length"); 
  equals(MyApp.store.persistentChanges.deleted.length, 1, "BEFORE commit, store.persistentChanges.deleted.length"); 
  equals(MyApp.store.get('hasChanges'), YES, "BEFORE commit, store.hasChanges"); 

  var success = MyApp.store.commitChanges();
  ok(success, "AFTER commit, YES should be returned to signify success."); 

  equals(MyApp.store.changes.length, 0, "AFTER commit - store.changes.length"); 
  equals(MyApp.store.persistentChanges.updated.length, 0, "AFTER commit, store.persistentChanges.updated.length"); 
  equals(MyApp.store.get('hasChanges'), NO, "AFTER commit and reset, hasChanges property on store is set to NO."); 

});


test("record: destroy existing record with guid='4995bc653af24' by calling record.destroy() then commitChanges.", function() {
  var record = MyApp.store.find('4995bc653af24', MyApp.Author);
  ok(typeof record === 'object', "record returned is of type 'object'");
  equals(record.get('fullName'), "Hailey Berkheimer 3", "record.get('fullName')");

  record.destroy();

  equals(record.get('fullName'), null, "record.get('fullName')");

  equals(MyApp.store.changes.length, 1, "BEFORE commit, 1 change should have been recorded."); 
  equals(MyApp.store.persistentChanges.deleted.length, 1, "BEFORE commit, 1 persistentChanges.deleted should have been recorded."); 
  equals(MyApp.store.get('hasChanges'), YES, "BEFORE commit, hasChanges property on store is set to YES."); 

  var success = MyApp.store.commitChanges();
  ok(success, "AFTER commit, YES should be returned to signify success."); 

  equals(MyApp.store.changes.length, 0, "AFTER commit and reset of changes should result in a length of 0."); 
  equals(MyApp.store.persistentChanges.updated.length, 0, "AFTER commit and reset of persistentChanges.updated should result in a length of 0."); 
  equals(MyApp.store.get('hasChanges'), NO, "AFTER commit and reset, hasChanges property on store is set to NO."); 
});

test("record: destroy existing record with guid='4995bc653ae78' by calling record.destroy() then discardChanges.", function() {
  var record = MyApp.store.find('4995bc653ae78', MyApp.Author);
  ok(typeof record === 'object', "record returned is of type 'object'");
  equals(record.get('fullName'), "Erskine Aultman 2", "record.get('fullName')");

  record.destroy();

  equals(record.get('fullName'), null, "record.get('fullName'), fullName should equal to null.");

  equals(MyApp.store.changes.length, 1, "BEFORE commit, 1 change should have been recorded."); 
  equals(MyApp.store.persistentChanges.deleted.length, 1, "BEFORE commit, 1 persistentChanges.deleted should have been recorded."); 
  equals(MyApp.store.get('hasChanges'), YES, "BEFORE commit, hasChanges property on store is set to YES."); 

  var didThrow = NO;
  try {
    var success = MyApp.store.discardChanges();
    equals(success, NO, "AFTER discard, NO should be returned to signify error because you're in a store that is attached to a fixtureServer.");
  } catch(e) {
    didThrow = YES;
  }

  equals(MyApp.store.changes.length, 0, "AFTER commit and reset of changes should result in a length of 0."); 
  equals(MyApp.store.persistentChanges.updated.length, 0, "AFTER commit and reset of persistentChanges.updated should result in a length of 0."); 
  equals(MyApp.store.get('hasChanges'), NO, "AFTER commit and reset, hasChanges property on store is set to NO."); 

});

// ..........................................................
// CREATE
// 
test("record: create new record using MyApp.store.createRecord({fullName: 'John Locke'}, MyApp.Author) then commitChanges. See guid from server.", function() {
  
  var record = MyApp.store.createRecord({fullName: 'John Locke'}, MyApp.Author);

  ok(typeof record === 'object', "record returned is of type 'object'");
  equals(record.get('fullName'), "John Locke", "record.get('fullName')");
  equals(record.get('guid'), null, "record.get('guid'), guid be equal to null.");

  equals(MyApp.store.changes.length, 1, "BEFORE commit, 1 change should have been recorded."); 
  equals(MyApp.store.persistentChanges.created.length, 1, "BEFORE commit, 1 persistentChanges.created should have been recorded."); 
  equals(MyApp.store.get('hasChanges'), YES, "BEFORE commit, hasChanges property on store is set to YES."); 

  var success = MyApp.store.commitChanges();
  ok(success, "AFTER commit, YES should be returned to signify success."); 

  equals(MyApp.store.changes.length, 0, "AFTER commit and reset of changes should result in a length of 0."); 
  equals(MyApp.store.persistentChanges.updated.length, 0, "AFTER commit and reset of persistentChanges.updated should result in a length of 0."); 
  equals(MyApp.store.get('hasChanges'), NO, "AFTER commit and reset, hasChanges property on store is set to NO."); 

  equals(record.get('status'), SC.Record.READY_NEW, "record.get('status') should === SC.Record.READY_NEW");
  equals(record.get('newRecord'), YES, "record.get('newRecord') should === YES");

  MyApp.fixtureServer.simulateResponseFromServer('john locke', record.storeKey);

  equals(record.get('fullName'), "John Locke", "record.get('fullName')");
  equals(record.get('bookTitle'), "A Letter Concerning Toleration", "record.get('bookTitle')");
  equals(record.get('guid'), "abcdefg", "record.get('guid')");
  equals(MyApp.store.primaryKeyMap.abcdefg, record.storeKey, "MyApp.store.primaryKeyMap['abcdefg'] == storeKey");
  equals(MyApp.store.storeKeyMap[record.storeKey], 'abcdefg', "MyApp.store.storeKeyMap[storeKey] == 'abcdefg'");

  equals(record.get('status'), SC.RECORD_LOADED, "record.get('status') should === SC.RECORD_LOADED");
  equals(record.get('newRecord'), NO, "record.get('newRecord') should === NO");

});


// ..........................................................
// CHAINING
// 
test("chaining: create new chained store off from MyApp.store", function() {
  MyApp.chainedStore = MyApp.store.createChainedStore();
  equals(MyApp.chainedStore.get('parentStore'),  MyApp.store, "MyApp.chainedStore's parentStore should be MyApp.store.");
  equals(MyApp.chainedStore, MyApp.store.childStores[0], "MyApp.store's first childStore should be MyApp.chainedStore.");
});

test("chaining: new record in chainedStore. commit it, commit parentStore", function() {
  MyApp.chainedStore = MyApp.store.createChainedStore();
  
  var record = MyApp.chainedStore.createRecord({fullName: 'Jim Locke'}, MyApp.Author);
  
  ok(typeof record === 'object', "record returned is of type 'object'");
  equals(record.get('fullName'), "Jim Locke", "record.get('fullName')");
  equals(record.get('guid'), null, "record.get('guid')");

  ok(MyApp.chainedStore.dataHashes[record.storeKey], "created dataHashes should exist with storeKey in chainedStore");
  equals(MyApp.store.dataHashes[record.storeKey], undefined, "created dataHashes should NOT exist with storeKey in store");

  equals(MyApp.chainedStore.changes.length, 1, "BEFORE commit, 1 change in chainedStore should have been recorded."); 
  equals(MyApp.chainedStore.persistentChanges.created.length, 1, "BEFORE commit, 1 persistentChanges.created  in chainedStore should have been recorded."); 
  equals(MyApp.chainedStore.get('hasChanges'), YES, "BEFORE commit, hasChanges property on chainedStore is set to YES."); 

  equals(MyApp.store.changes.length, 0, "BEFORE commit and reset of changes in parentStore should result in a length of 0."); 
  equals(MyApp.store.persistentChanges.created.length, 0, "BEFORE commit and reset of persistentChanges.created in parentStore should result in a length of 0."); 
  equals(MyApp.store.get('hasChanges'), NO, "BEFORE commit and reset, hasChanges property in parentStore is set to NO."); 

  var success = MyApp.chainedStore.commitChanges();
  ok(success, "AFTER commit of chainedStore, YES should be returned to signify success."); 

  equals(MyApp.chainedStore.changes.length, 0, "AFTER commit, 0 change in chainedStore should have been recorded."); 
  equals(MyApp.chainedStore.persistentChanges.created.length, 0, "AFTER commit, 1 persistentChanges.created  in chainedStore should have been recorded."); 
  equals(MyApp.chainedStore.get('hasChanges'), NO, "AFTER commit, hasChanges property on chainedStore is set to NO."); 

  equals(MyApp.store.changes.length, 0, "BEFORE commit, 0 change  in parentStore should have been recorded."); 
  equals(MyApp.store.persistentChanges.created.length, 1, "BEFORE commit, 1 persistentChanges.created in parentStore should have been recorded."); 
  equals(MyApp.store.get('hasChanges'), NO, "BEFORE commit, hasChanges property on parentStore is set to NO."); 

  success = MyApp.store.commitChanges();
  ok(success, "AFTER commit of parentStore, YES should be returned to signify success."); 

  console.log('storeKey = %@'.fmt(record.get(record.primaryKey)));
  MyApp.fixtureServer.simulateResponseFromServer('jim locke', record.storeKey);

  equals(record.get('fullName'), "Jim Locke", "record.get('fullName')");
  equals(record.get('bookTitle'), "A Letter Concerning Toleration Part Deux", "record.get('bookTitle'), bookTitle");
  equals(record.get('guid'), "abc", "record.get('guid')");
  equals(MyApp.store.primaryKeyMap.abc, record.storeKey, "MyApp.store.primaryKeyMap['abc'] == storeKey");
  equals(MyApp.store.storeKeyMap[record.storeKey], 'abc', "MyApp.store.storeKeyMap[storekey] == 'abc'");

  equals(record.get('status'), SC.RECORD_LOADED, "record.get('status') should === SC.RECORD_LOADED");
  equals(record.get('newRecord'), NO, "record.get('newRecord') should === NO");

  
  var rec = MyApp.store.find('abc');
  equals(typeof rec, 'object', "check store to see if record is there. rec MyApp.store.find('abc') is of type 'object'");
  ok(rec !== record, 'rec from store should be the same object as record from chainedStore');
});

test("chaining: new record in chainedStore. commit it, discard parentStore. should cause error", function() {
  var record = MyApp.chainedStore.createRecord({fullName: 'Jim Bob'}, MyApp.Author);
  
  ok(typeof record === 'object', "record returned is of type 'object'");
  ok(record.get('fullName') == "Jim Bob", "record.get('fullName'), fullName should equal 'Jim Bob'");
  ok(record.get('guid') == null, "record.get('guid'), guid be equal to null.");

  ok(MyApp.chainedStore.dataHashes[53] !== undefined, "created dataHashes should exist with storeKey 53 in chainedStore");
  ok(MyApp.store.dataHashes[53] === undefined, "created dataHashes should NOT exist with storeKey 53 in store");

  ok(MyApp.chainedStore.changes.length == 1, "BEFORE commit, 1 change in chainedStore should have been recorded."); 
  ok(MyApp.chainedStore.persistentChanges.created.length == 1, "BEFORE commit, 1 persistentChanges.created  in chainedStore should have been recorded."); 
  ok(MyApp.chainedStore.get('hasChanges') === YES, "BEFORE commit, hasChanges property on chainedStore is set to YES."); 

  ok(MyApp.store.changes.length === 0, "BEFORE commit and reset of changes in parentStore should result in a length of 0."); 
  ok(MyApp.store.persistentChanges.created.length === 0, "BEFORE commit and reset of persistentChanges.created in parentStore should result in a length of 0."); 
  ok(MyApp.store.get('hasChanges') === NO, "BEFORE commit and reset, hasChanges property in parentStore is set to NO."); 

  var success = MyApp.chainedStore.commitChanges();
  ok(success == YES, "AFTER commit of chainedStore, YES should be returned to signify success."); 

  ok(MyApp.chainedStore.changes.length === 0, "AFTER commit, 0 change in chainedStore should have been recorded."); 
  ok(MyApp.chainedStore.persistentChanges.created.length === 0, "AFTER commit, 1 persistentChanges.created  in chainedStore should have been recorded."); 
  ok(MyApp.chainedStore.get('hasChanges') === NO, "AFTER commit, hasChanges property on chainedStore is set to NO."); 

  ok(MyApp.store.changes.length === 0, "BEFORE commit, 0 change  in parentStore should have been recorded."); 
  ok(MyApp.store.persistentChanges.created.length == 1, "BEFORE commit, 1 persistentChanges.created in parentStore should have been recorded."); 
  ok(MyApp.store.get('hasChanges') === NO, "BEFORE commit, hasChanges property on parentStore is set to NO."); 
  
  var didThrow = NO;
  try {
    var success = MyApp.store.discardChanges();
    ok(success == NO, "AFTER discardChanges of parentStore, NO should be returned to signify error because it cannot be discarded. Record still remains but not probagated to server."); 
  } catch(e) {
    didThrow = YES;
  }
  ok(didThrow == YES, "AFTER discardChanges of parentStore, FATAL error was thrown."); 
});

test("chaining: new record in chainedStore. discard it, chainedStore restored and record does not exist in chainedStore.", function() {
  var record = MyApp.chainedStore.createRecord({fullName: 'Bill Adama'}, MyApp.Author);
  
  ok(typeof record === 'object', "record returned is of type 'object'");
  ok(record.get('fullName') == "Bill Adama", "record.get('fullName'), fullName should equal 'Bill Adama'");
  ok(record.get('guid') == null, "record.get('guid'), guid be equal to null.");

  ok(MyApp.chainedStore.dataHashes[54] !== undefined, "created dataHashes should exist with storeKey 54 in chainedStore");
  ok(MyApp.store.dataHashes[54] === undefined, "created dataHashes should NOT exist with storeKey 54 in store");

  ok(MyApp.chainedStore.changes.length == 1, "BEFORE discard, 1 change in chainedStore should have been recorded."); 
  ok(MyApp.chainedStore.persistentChanges.created.length == 1, "BEFORE discard, 1 persistentChanges.created  in chainedStore should have been recorded."); 
  ok(MyApp.chainedStore.get('hasChanges') === YES, "BEFORE discard, hasChanges property on chainedStore is set to YES."); 

  ok(MyApp.store.changes.length === 0, "BEFORE discard and reset of changes in parentStore should result in a length of 0."); 
  ok(MyApp.store.persistentChanges.created.length === 0, "BEFORE discard and reset of persistentChanges.created in parentStore should result in a length of 0."); 
  ok(MyApp.store.get('hasChanges') === NO, "BEFORE discard and reset, hasChanges property in parentStore is set to NO."); 

  var success = MyApp.chainedStore.discardChanges();
  ok(success == YES, "AFTER discard of chainedStore, YES should be returned to signify success."); 

  ok(MyApp.chainedStore.dataHashes[54] === undefined, "created dataHash should NOT exist with storeKey 54 in chainedStore");
  ok(MyApp.store.dataHashes[54] === undefined, "created dataHash should NOT exist with storeKey 54 in store");

  ok(MyApp.chainedStore.changes.length === 0, "AFTER discard, 0 change in chainedStore should have been recorded."); 
  ok(MyApp.chainedStore.persistentChanges.created.length === 0, "AFTER discard, 1 persistentChanges.created  in chainedStore should have been recorded."); 
  ok(MyApp.chainedStore.get('hasChanges') === NO, "AFTER discard, hasChanges property on chainedStore is set to NO."); 

  ok(MyApp.store.changes.length === 0, "AFTER discard and reset of changes in parentStore should result in a length of 0."); 
  ok(MyApp.store.persistentChanges.created.length === 0, "AFTER discard and reset of persistentChanges.created in parentStore should result in a length of 0."); 
  ok(MyApp.store.get('hasChanges') === NO, "AFTER discard and reset, hasChanges property in parentStore is set to NO."); 

});


test("chaining: get record in chainedStore AND store. update it in chainedStore. commit. then commit to fixtureServer.", function() {
  var chainedStoreRecord = MyApp.chainedStore.find("4995bc653b11d");
  var storeRecord = MyApp.store.find("4995bc653b11d");
  
  ok(chainedStoreRecord !== storeRecord, "BEFORE UPDATE: chainedStoreRecord should not equal storeRecord");
  ok(chainedStoreRecord.storeKey == storeRecord.storeKey, "BEFORE UPDATE: chainedStoreRecord.storeKey should equal storeRecord.storeKey");
  ok( MyApp.chainedStore.dataHashes[chainedStoreRecord.storeKey] === MyApp.store.dataHashes[storeRecord.storeKey], "BEFORE UPDATE: chainedStoreRecord and storeRecord should point to the same dataHash");

  chainedStoreRecord.set('fullName', 'Kara Thrace');
  ok( MyApp.chainedStore.dataHashes[chainedStoreRecord.storeKey] !== MyApp.store.dataHashes[storeRecord.storeKey], "AFTER UPDATE:  chainedStoreRecord.set('fullName', 'Kara Thrace').. chainedStoreRecord and storeRecord should NOT point to the same dataHash");
  
  ok(storeRecord.get('fullName') == 'Janette Koepple 2', "AFTER UPDATE: storeRecord.get('fullName') should equal original value 'Janette Koepple 2'");
  ok(chainedStoreRecord.get('fullName') == 'Kara Thrace', "AFTER UPDATE: chainedStoreRecord.get('fullName') should equal new value 'Kara Thrace'");

  ok(MyApp.chainedStore.changes.length == 1, "AFTER UPDATE, 1 change in chainedStore should have been recorded."); 
  ok(MyApp.chainedStore.persistentChanges.updated.length == 1, "AFTER UPDATE, 1 persistentChanges.updated in chainedStore should have been recorded."); 
  ok(MyApp.chainedStore.get('hasChanges') === YES, "AFTER UPDATE, hasChanges property on chainedStore is set to YES."); 

  ok(MyApp.store.changes.length === 0, "AFTER UPDATE, 0 change in store should have been recorded."); 
  ok(MyApp.store.persistentChanges.updated.length === 0, "AFTER UPDATE, 0 persistentChanges.updated in store should have been recorded."); 
  ok(MyApp.store.get('hasChanges') === NO, "AFTER UPDATE, hasChanges property on store is set to NO."); 

  var success = MyApp.chainedStore.commitChanges();
  ok(success == YES, "AFTER commit of chainedStore, YES should be returned to signify success."); 

  ok(chainedStoreRecord !== storeRecord, "AFTER COMMIT: chainedStoreRecord should still not equal storeRecord.");
  ok(chainedStoreRecord.storeKey == storeRecord.storeKey, "AFTER COMMIT: chainedStoreRecord.storeKey should equal storeRecord.storeKey");
  ok( MyApp.chainedStore.dataHashes[chainedStoreRecord.storeKey] === MyApp.store.dataHashes[storeRecord.storeKey], "AFTER COMMIT: chainedStoreRecord and storeRecord should point to the same dataHash");
  
  var success = MyApp.store.commitChanges();
  ok(success == YES, "AFTER commit of store, YES should be returned to signify success."); 

  ok(storeRecord.get('fullName') == 'Kara Thrace', "AFTER COMMIT: storeRecord.get('fullName') should equal original value 'Kara Thrace'");
  ok(chainedStoreRecord.get('fullName') == 'Kara Thrace', "AFTER COMMIT: chainedStoreRecord.get('fullName') should equal original value 'Kara Thrace'");

});

test("chaining: get record in chainedStore AND store. update it in chainedStore. discard.", function() {
  var chainedStoreRecord = MyApp.chainedStore.find("4995bc653b173");
  var storeRecord = MyApp.store.find("4995bc653b173");
  
  ok(chainedStoreRecord !== storeRecord, "BEFORE UPDATE: chainedStoreRecord should not equal storeRecord");
  ok(chainedStoreRecord.storeKey == storeRecord.storeKey, "BEFORE UPDATE: chainedStoreRecord.storeKey should equal storeRecord.storeKey");
  ok( MyApp.chainedStore.dataHashes[chainedStoreRecord.storeKey] === MyApp.store.dataHashes[storeRecord.storeKey], "BEFORE UPDATE: chainedStoreRecord and storeRecord should point to the same dataHash");

  chainedStoreRecord.set('fullName', 'Karl Agathon');
  ok( MyApp.chainedStore.dataHashes[chainedStoreRecord.storeKey] !== MyApp.store.dataHashes[storeRecord.storeKey], "AFTER UPDATE:  chainedStoreRecord.set('fullName', 'Karl Agathon').. chainedStoreRecord and storeRecord should NOT point to the same dataHash");
  
  ok(storeRecord.get('fullName') == 'Leyton Jyllian 4', "AFTER UPDATE: storeRecord.get('fullName') should equal original value 'Leyton Jyllian 4'");
  ok(chainedStoreRecord.get('fullName') == 'Karl Agathon', "AFTER UPDATE: chainedStoreRecord.get('fullName') should equal new value 'Karl Agathon'");

  ok(MyApp.chainedStore.changes.length == 1, "AFTER UPDATE, 1 change in chainedStore should have been recorded."); 
  ok(MyApp.chainedStore.persistentChanges.updated.length == 1, "AFTER UPDATE, 1 persistentChanges.updated in chainedStore should have been recorded."); 
  ok(MyApp.chainedStore.get('hasChanges') === YES, "AFTER UPDATE, hasChanges property on chainedStore is set to YES."); 

  ok(MyApp.store.changes.length === 0, "AFTER UPDATE, 0 change in store should have been recorded."); 
  ok(MyApp.store.persistentChanges.updated.length === 0, "AFTER UPDATE, 0 persistentChanges.updated in store should have been recorded."); 
  ok(MyApp.store.get('hasChanges') === NO, "AFTER UPDATE, hasChanges property on store is set to NO."); 

  var success = MyApp.chainedStore.discardChanges();
  ok(success == YES, "AFTER discard of chainedStore, YES should be returned to signify success."); 

  ok(MyApp.chainedStore.changes.length === 0, "AFTER DISCARD, 0 change in chainedStore should have been recorded."); 
  ok(MyApp.chainedStore.persistentChanges.updated.length === 0, "AFTER DISCARD, 0 persistentChanges.updated in chainedStore should have been recorded."); 
  ok(MyApp.chainedStore.get('hasChanges') === NO, "AFTER DISCARD, hasChanges property on chainedStore is set to NO."); 

  ok(MyApp.store.changes.length === 0, "AFTER UPDATE, 0 change in store should have been recorded."); 
  ok(MyApp.store.persistentChanges.updated.length === 0, "AFTER UPDATE, 0 persistentChanges.updated in store should have been recorded."); 
  ok(MyApp.store.get('hasChanges') === NO, "AFTER UPDATE, hasChanges property on store is set to NO."); 

  ok(chainedStoreRecord !== storeRecord, "AFTER DISCARD: chainedStoreRecord should still not equal storeRecord.");
  ok(chainedStoreRecord.storeKey == storeRecord.storeKey, "AFTER DISCARD: chainedStoreRecord.storeKey should equal storeRecord.storeKey");
  ok( MyApp.chainedStore.dataHashes[chainedStoreRecord.storeKey] === MyApp.store.dataHashes[storeRecord.storeKey], "AFTER DISCARD: chainedStoreRecord and storeRecord should point to the same dataHash");
  
  ok(storeRecord.get('fullName') == 'Leyton Jyllian 4', "AFTER DISCARD: storeRecord.get('fullName') should equal original value 'Leyton Jyllian 4'");
  ok(chainedStoreRecord.get('fullName') == 'Leyton Jyllian 4', "AFTER DISCARD: chainedStoreRecord.get('fullName') should equal original value 'Leyton Jyllian 4'");
  
});

test("chaining: get record in chainedStore AND store. commit edit in chainedStore. then discard store to the fixtureServer", function() {
  var chainedStoreRecord = MyApp.chainedStore.find("4995bc653b008");
  var storeRecord = MyApp.store.find("4995bc653b008");
  
  ok(chainedStoreRecord !== storeRecord, "BEFORE UPDATE: chainedStoreRecord should not equal storeRecord");
  ok(chainedStoreRecord.storeKey == storeRecord.storeKey, "BEFORE UPDATE: chainedStoreRecord.storeKey should equal storeRecord.storeKey");
  ok( MyApp.chainedStore.dataHashes[chainedStoreRecord.storeKey] === MyApp.store.dataHashes[storeRecord.storeKey], "BEFORE UPDATE: chainedStoreRecord and storeRecord should point to the same dataHash");

  chainedStoreRecord.set('fullName', 'Felix Gaeta');
  ok( MyApp.chainedStore.dataHashes[chainedStoreRecord.storeKey] !== MyApp.store.dataHashes[storeRecord.storeKey], "AFTER UPDATE:  chainedStoreRecord.set('fullName', 'Felix Gaeta').. chainedStoreRecord and storeRecord should NOT point to the same dataHash");
  
  ok(storeRecord.get('fullName') == 'Alfreda Rahl 3', "AFTER UPDATE: storeRecord.get('fullName') should equal original value 'Alfreda Rahl 3'");
  ok(chainedStoreRecord.get('fullName') == 'Felix Gaeta', "AFTER UPDATE: chainedStoreRecord.get('fullName') should equal original value 'Felix Gaeta'");

  ok(MyApp.chainedStore.changes.length == 1, "AFTER UPDATE, 1 change in chainedStore should have been recorded."); 
  ok(MyApp.chainedStore.persistentChanges.updated.length == 1, "AFTER UPDATE, 1 persistentChanges.updated in chainedStore should have been recorded."); 
  ok(MyApp.chainedStore.get('hasChanges') === YES, "AFTER UPDATE, hasChanges property on chainedStore is set to YES."); 

  ok(MyApp.store.changes.length === 0, "AFTER UPDATE, 0 change in store should have been recorded."); 
  ok(MyApp.store.persistentChanges.updated.length === 0, "AFTER UPDATE, 0 persistentChanges.updated in store should have been recorded."); 
  ok(MyApp.store.get('hasChanges') === NO, "AFTER UPDATE, hasChanges property on store is set to NO."); 

  var success = MyApp.chainedStore.commitChanges();
  ok(success == YES, "AFTER commit of chainedStore, YES should be returned to signify success."); 

  ok(chainedStoreRecord !== storeRecord, "AFTER COMMIT: chainedStoreRecord should still not equal storeRecord.");
  ok(chainedStoreRecord.storeKey == storeRecord.storeKey, "AFTER COMMIT: chainedStoreRecord.storeKey should equal storeRecord.storeKey");
  ok( MyApp.chainedStore.dataHashes[chainedStoreRecord.storeKey] === MyApp.store.dataHashes[storeRecord.storeKey], "AFTER COMMIT: chainedStoreRecord and storeRecord should point to the same dataHash");
  
  var didThrow = NO;
  try {
    var success = MyApp.store.discardChanges();
    ok(success == NO, "AFTER discardChanges of parentStore, NO should be returned to signify error because it cannot be discarded. Record still remains but not probagated to server."); 
  } catch(e) {
    didThrow = YES;
  }
  ok(didThrow == YES, "AFTER discardChanges of parentStore, FATAL error was thrown."); 


  ok(storeRecord.get('fullName') == 'Felix Gaeta', "AFTER COMMIT: storeRecord.get('fullName') should equal original value 'Felix Gaeta'");
  ok(chainedStoreRecord.get('fullName') == 'Felix Gaeta', "AFTER COMMIT: chainedStoreRecord.get('fullName') should equal original value 'Felix Gaeta'");
});

test("chaining: get record in chainedStore AND store. update it in store. commit. then commit chainedStore. record in chainedStore should be restored.", function() {
  var chainedStoreRecord = MyApp.chainedStore.find("4995bc653b075");
  var storeRecord = MyApp.store.find("4995bc653b075");
  
  ok(chainedStoreRecord !== storeRecord, "BEFORE UPDATE: chainedStoreRecord should not equal storeRecord");
  ok(chainedStoreRecord.storeKey == storeRecord.storeKey, "BEFORE UPDATE: chainedStoreRecord.storeKey should equal storeRecord.storeKey");
  ok( MyApp.chainedStore.dataHashes[chainedStoreRecord.storeKey] === MyApp.store.dataHashes[storeRecord.storeKey], "BEFORE UPDATE: chainedStoreRecord and storeRecord should point to the same dataHash");

  storeRecord.set('fullName', 'Saul Tigh');
  ok( MyApp.chainedStore.dataHashes[chainedStoreRecord.storeKey] !== MyApp.store.dataHashes[storeRecord.storeKey], "AFTER UPDATE:  store.set('fullName', 'Saul Tigh').. chainedStoreRecord and storeRecord should NOT point to the same dataHash");
  
  ok(storeRecord.get('fullName') == 'Saul Tigh', "AFTER UPDATE: storeRecord.get('fullName') should equal new value 'Saul Tigh'");
  ok(chainedStoreRecord.get('fullName') == 'Kerri Mayers 3', "AFTER UPDATE: chainedStoreRecord.get('fullName') should equal original value 'Kerri Mayers 3'");

  ok(MyApp.chainedStore.changes.length === 0, "AFTER UPDATE, 0 change in chainedStore should have been recorded."); 
  ok(MyApp.chainedStore.persistentChanges.updated.length === 0, "AFTER UPDATE, 0 persistentChanges.updated in chainedStore should have been recorded."); 
  ok(MyApp.chainedStore.get('hasChanges') === NO, "AFTER UPDATE, hasChanges property on chainedStore is set to NO."); 

  ok(MyApp.store.changes.length == 1, "AFTER UPDATE, 1 change in store should have been recorded."); 
  ok(MyApp.store.persistentChanges.updated.length == 1, "AFTER UPDATE, 1 persistentChanges.updated in store should have been recorded."); 
  ok(MyApp.store.get('hasChanges') === YES, "AFTER UPDATE, hasChanges property on store is set to YES."); 

  var success = MyApp.store.commitChanges();
  ok(success == YES, "AFTER commit of store, YES should be returned to signify success."); 

  ok(MyApp.chainedStore.changes.length === 0, "AFTER DISCARD, 0 change in chainedStore should have been recorded."); 
  ok(MyApp.chainedStore.persistentChanges.updated.length === 0, "AFTER DISCARD, 0 persistentChanges.updated in chainedStore should have been recorded."); 
  ok(MyApp.chainedStore.get('hasChanges') === NO, "AFTER DISCARD, hasChanges property on chainedStore is set to NO."); 

  ok(MyApp.store.changes.length === 0, "AFTER UPDATE, 0 change in store should have been recorded."); 
  ok(MyApp.store.persistentChanges.updated.length === 0, "AFTER UPDATE, 0 persistentChanges.updated in store should have been recorded."); 
  ok(MyApp.store.get('hasChanges') === NO, "AFTER UPDATE, hasChanges property on store is set to NO."); 

  ok(chainedStoreRecord !== storeRecord, "AFTER COMMIT: chainedStoreRecord should still not equal storeRecord.");
  ok(chainedStoreRecord.storeKey == storeRecord.storeKey, "AFTER COMMIT: chainedStoreRecord.storeKey should equal storeRecord.storeKey");
  ok( MyApp.chainedStore.dataHashes[chainedStoreRecord.storeKey] !== MyApp.store.dataHashes[storeRecord.storeKey], "AFTER COMMIT: chainedStoreRecord and storeRecord should still NOT point to the same dataHash");
  
  ok(storeRecord.get('fullName') == 'Saul Tigh', "AFTER COMMIT: storeRecord.get('fullName') should equal new value 'Saul Tigh'");
  ok(chainedStoreRecord.get('fullName') == 'Kerri Mayers 3', "AFTER COMMIT: chainedStoreRecord.get('fullName') should equal original value 'Kerri Mayers 3'");
  
  var success = MyApp.chainedStore.commitChanges();
  ok(success == YES, "AFTER commit of chainedStore, YES should be returned but nothing really happened since there is no changeset. It just blows away and restores from parentStore"); 
  
  ok(storeRecord.get('fullName') == 'Saul Tigh', "AFTER COMMIT: storeRecord.get('fullName') should equal new value 'Saul Tigh'");
  ok(chainedStoreRecord.get('fullName') == 'Saul Tigh', "AFTER COMMIT: chainedStoreRecord.get('fullName') should equal original value 'Saul Tigh'");
  
});

test("chaining: get record in chainedStore AND store. update it in store twice. update once in chainedStore. commit store. then commit chainedStore. record in chainedStore should be restored but error is raised.", function() {
  var chainedStoreRecord = MyApp.chainedStore.find("4995bc653af3b");
  var storeRecord = MyApp.store.find("4995bc653af3b");
  
  ok(chainedStoreRecord !== storeRecord, "BEFORE UPDATE: chainedStoreRecord should not equal storeRecord");
  ok(chainedStoreRecord.storeKey == storeRecord.storeKey, "BEFORE UPDATE: chainedStoreRecord.storeKey should equal storeRecord.storeKey");
  ok( MyApp.chainedStore.dataHashes[chainedStoreRecord.storeKey] === MyApp.store.dataHashes[storeRecord.storeKey], "BEFORE UPDATE: chainedStoreRecord and storeRecord should point to the same dataHash");

  storeRecord.set('fullName', 'Saul Tigh');
  storeRecord.set('bookTitle', 'Cylons: Friend or Foe?');
  ok( MyApp.chainedStore.dataHashes[chainedStoreRecord.storeKey] !== MyApp.store.dataHashes[storeRecord.storeKey], "AFTER UPDATE:  store.set('fullName', 'Saul Tigh').. chainedStoreRecord and storeRecord should NOT point to the same dataHash");
  
  ok(storeRecord.get('fullName') == 'Saul Tigh', "AFTER UPDATE: storeRecord.get('fullName') should equal new value 'Saul Tigh'");
  ok(chainedStoreRecord.get('fullName') == 'Shanelle Fry 2', "AFTER UPDATE: chainedStoreRecord.get('fullName') should equal original value 'Shanelle Fry 2'");

  chainedStoreRecord.set('fullName', 'Sharon Valerii');
  ok(chainedStoreRecord.get('fullName') == 'Sharon Valerii', "AFTER UPDATE of chainedStore: chainedStoreRecord.get('fullName') should equal other value 'Sharon Valerii'");

  ok(MyApp.chainedStore.changes.length == 1, "AFTER UPDATE, 1 change in chainedStore should have been recorded."); 
  ok(MyApp.chainedStore.persistentChanges.updated.length == 1, "AFTER UPDATE, 1 persistentChanges.updated in chainedStore should have been recorded."); 
  ok(MyApp.chainedStore.get('hasChanges') === YES, "AFTER UPDATE, hasChanges property on chainedStore is set to YES."); 

  ok(MyApp.store.changes.length == 2, "AFTER UPDATE, 2 change in store should have been recorded."); 
  ok(MyApp.store.persistentChanges.updated.length == 2, "AFTER UPDATE, 2 persistentChanges.updated in store should have been recorded."); 
  ok(MyApp.store.get('hasChanges') === YES, "AFTER UPDATE, hasChanges property on store is set to YES."); 

  ok(MyApp.store.revisions[25] == 2, "AFTER UPDATE, the revision count in store should be 2.");
  ok(MyApp.chainedStore.revisions[25] == 1, "AFTER UPDATE, the revision count in chainedStore should be 1.");

  var success = MyApp.store.commitChanges();
  ok(success == YES, "AFTER commit of store, YES should be returned to signify success."); 

  ok(MyApp.chainedStore.changes.length == 1, "AFTER COMMIT, 1 change in chainedStore should have been recorded."); 
  ok(MyApp.chainedStore.persistentChanges.updated.length == 1, "AFTER COMMMIT, 1 persistentChanges.updated in chainedStore should have been recorded."); 
  ok(MyApp.chainedStore.get('hasChanges') === YES, "AFTER COMMMIT, hasChanges property on chainedStore is set to YES."); 

  ok(MyApp.store.changes.length === 0, "AFTER COMMIT, 0 change in store should have been recorded."); 
  ok(MyApp.store.persistentChanges.updated.length === 0, "AFTER COMMIT, 0 persistentChanges.updated in store should have been recorded."); 
  ok(MyApp.store.get('hasChanges') === NO, "AFTER COMMIT, hasChanges property on store is set to NO."); 

  ok(chainedStoreRecord !== storeRecord, "AFTER COMMIT: chainedStoreRecord should still not equal storeRecord.");
  ok(chainedStoreRecord.storeKey == storeRecord.storeKey, "AFTER COMMIT: chainedStoreRecord.storeKey should equal storeRecord.storeKey");
  ok( MyApp.chainedStore.dataHashes[chainedStoreRecord.storeKey] !== MyApp.store.dataHashes[storeRecord.storeKey], "AFTER COMMIT: chainedStoreRecord and storeRecord should still NOT point to the same dataHash");
  
  ok(storeRecord.get('fullName') == 'Saul Tigh', "AFTER COMMIT: storeRecord.get('fullName') should equal new value 'Saul Tigh'");
  ok(chainedStoreRecord.get('fullName') == 'Sharon Valerii', "AFTER COMMIT: chainedStoreRecord.get('fullName') should equal other value 'Sharon Valerii'");
  
  var success = MyApp.chainedStore.commitChanges();
  ok(success == NO, "AFTER commit of chainedStore, NO should be returned since the chainedRecord is out of date. It is just blown away and restored from parentStore"); 
  
  ok(storeRecord.get('fullName') == 'Saul Tigh', "AFTER COMMIT: storeRecord.get('fullName') should equal new value 'Saul Tigh'");
  ok(chainedStoreRecord.get('fullName') == 'Saul Tigh', "AFTER COMMIT: chainedStoreRecord.get('fullName') should equal original value 'Saul Tigh'");
});

test("query: debugger.", function() {
  var storeQuery = MyApp.store.findAll(MyApp.Author, "fullName=%@", "Saul Tigh");
  storeQuery.performQuery();

});

/*
  
  //load updated dataHash through loadRecord. see updated revisions. Check for no changeset.
  //load updated dataHash array through loadRecord. see updated revisions. Check for no changeset.
  
  //materialize record given one guid. check materialized record for type, datahash, etc.
  //rematerialize record given one guid. check that it is the same record.
  
  //materialize record that does not exist. See it retireved from the server.
  //update record using set. commands. see revisions. commit. see changes.
  //update record using set. commands. discard. see no changes.
  
  //destroy record. see it be gone? then commit. see it passed to server.
  //destroy record. then discard. see it still be there. should be reverted.
  //create new record. set params. save to server using commit. see new guid come in.
//  create chained store. chained store is in the parentStore's array. chainedStore has parentStore set.
//create new record as child of chainedStore. See that it does not exist in parentStore. commit. See it in parent store. See it passed to server.

  get record and update it. see that parentStore and chainedStore have different instances of dataHash. commit it. check if they are the same chained to parent.
  get record and update it. see that parentStore and chainedStore have different instances of dataHash. discard it. check if they are the same. parent to chained.
  get record in parentStore and cainedStore. update chainedStore record.. see that parentStore and chainedStore have different instances of dataHash AND record.  commit it. check if they are the same chained to parent.
  get record in parentStore and cainedStore. update chainedStore record.. see that parentStore and chainedStore have different instances of dataHash AND record.  discard it. ccheck if they are the same. parent to chained.
 
 
 
 // create new record as child of chainedStore. See that it does not exist in parentStore. discard. See it NOT parent store or chained store. See it NOT passed to the server.
  
  
  create new record in parentStore. commit. See it in childStore.
  create new record in parentStore. discard. see it NOT in childStore.
  
  create new chainedStore in chainedStore.
  create new record in child chainedStore. commit. See it in chainedStore but not in parentStore. commit chainedStore. See it in parent. commit parentStore, see in server.
  create new record in child chainedStore. discard. See it not chainedStore but not in parentStore. 
  
  
  
  




*/


/* Now, materialize records, make sure that they are the correct type. */
/* get one record, edit record it, commit. */
/* get 10 records, edit record them, commit. */


