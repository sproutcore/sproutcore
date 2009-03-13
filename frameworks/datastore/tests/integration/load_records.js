// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Apple, Inc. and contributors.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

var MyApp = {};

MyApp = SC.Object.create();
MyApp.store = SC.Store.create();
//MyApp.fixtureServer = SC.Server.create();
MyApp.Author = SC.Record.extend({
  isCylon: function() {
    switch(this.get('fullName')) {
      case "Saul Tigh":
      case "Galen Tyrol":
        return YES;
      default: 
        return NO;
    }
  }.property()
});


MyApp.fixtureServer = SC.FixtureServer.create({
  simulateResponseFromServer: function(guid) {
    var json = [];
    if(guid === '123') {
      json = [ {"type": "Author", "guid": "123","fullName": "Galen Tyrol", "bookTitle": "The Fear of the Spiders", "address":" London University, 142 Castro St, London, UK"}];
    }
    if(guid === 51) {
      this.get('childStore').didCreateRecords([51], ['abcdefg'], [{guid: 'abcdefg', fullName: "John Locke", bookTitle: "A Letter Concerning Toleration"}]);

      return;
    }
    if(guid === 52) {
      this.get('childStore').didCreateRecords([52], ['abc'], [{guid: 'abc', fullName: "Jim Locke", bookTitle: "A Letter Concerning Toleration Part Deux"}]);

      return;
    }
    
    this.get('childStore').loadRecords(json, MyApp.Author);
    
  }
});

MyApp.fixtureServer.addStore(MyApp.store); //.set('parentStore', MyApp.fixtureServer);

module("SC.Store", {
  
    setup: function() {
    }
  }

);

test("Basic Requirements", function() {
  ok(MyApp, "MyApp is defined") ;
  ok(MyApp.store, "MyApp.store is defined") ;
  ok(MyApp.fixtureServer, "MyApp.fixtureServer is defined") ;
  ok(MyApp.Author, "MyApp.Author is defined") ;
  ok(json0_9, "json0_9 is defined") ;
  ok(json10_19, "json10_19 is defined") ;
  ok(json20_29, "json20_29 is defined") ;
  ok(json30_39, "json30_39 is defined") ;
  ok(json40_49, "json40_49 is defined") ;
});



test("set parentStore property on MyApp.store to MyApp.fixtureServer", function() {
  var ret = MyApp.store.set('parentStore', MyApp.fixtureServer);
  ok(MyApp.fixtureServer === MyApp.store.get('parentStore'), "MyApp.fixtureServer should === MyApp.store.get('parentStore')" ) ;
});

test("MyApp.store sees that parentStore is persistent", function() {
  equals(YES, MyApp.store.get('parentStore').get('isPersistent')) ;
});

test("MyApp.fixtureServer sees its childStore is MyApp.store", function() {
  ok(MyApp.fixtureServer.get('childStore') === MyApp.store, ".MyApp.fixtureServer.get('childStore') should === MyApp.store" ) ;
});

test("loadRecords: call loadRecords(json0_9, MyApp.Author), should return array with 10 unique storeKeys 0-9", function() {
  var ret = MyApp.store.loadRecords(json0_9, MyApp.Author);
  var expected = [0,1,2,3,4,5,6,7,8,9];
  for(var i=0; i<10; i++) {
    ok(ret[i] === expected[i], ("storeKey returned at index " + i + ":  "+ret[i]+" equal to expected value " +expected[i]));
  }
  ok(MyApp.store.changes.length == 0, "no changes should have been recorded."); 
  ok(MyApp.store.persistentChanges.created.length == 0, "no persistentChanges.created should have been recorded."); 
});

test("loadRecords: call loadRecords(json10_19, MyApp.Author, 'guid'), should return array with 10 unique storeKeys 10-19", function() {
  var ret = MyApp.store.loadRecords(json10_19, MyApp.Author, 'guid');
  var expected = [10,11,12,13,14,15,16,17,18,19];
  for(var i=0; i<10; i++) {
    ok(ret[i] === expected[i], ("storeKey returned at index " + i + ":  "+ret[i]+" equal to expected value " +expected[i]));
  }
  ok(MyApp.store.changes.length == 0, "no changes should have been recorded."); 
  ok(MyApp.store.persistentChanges.created.length == 0, "no persistentChanges.created should have been recorded."); 
});

test("loadRecords: call loadRecords(json20_29, [MyApp.Author,...,MyApp.Author]), should return array with 10 unique storeKeys 20-29", function() {
  var recordTypes = [MyApp.Author, MyApp.Author, MyApp.Author, MyApp.Author, MyApp.Author, MyApp.Author, MyApp.Author, MyApp.Author, MyApp.Author, MyApp.Author];
  var ret = MyApp.store.loadRecords(json20_29, recordTypes);
  var expected = [20,21,22,23,24,25,26,27,28,29];
  for(var i=0; i<10; i++) {
    ok(ret[i] === expected[i], ("storeKey returned at index " + i + ":  "+ret[i]+" equal to expected value  " +expected[i]));
  }
  ok(MyApp.store.changes.length == 0, "no changes should have been recorded."); 
  ok(MyApp.store.persistentChanges.created.length == 0, "no persistentChanges.created should have been recorded."); 
});

test("loadRecords: call loadRecords(json30_39, [MyApp.Author,...,MyApp.Author], 'guid'), should return array with 10 unique storeKeys 30-39", function() {
  var recordTypes = [MyApp.Author, MyApp.Author, MyApp.Author, MyApp.Author, MyApp.Author, MyApp.Author, MyApp.Author, MyApp.Author, MyApp.Author, MyApp.Author];
  var ret = MyApp.store.loadRecords(json30_39, recordTypes, 'guid');
  var expected = [30,31,32,33,34,35,36,37,38,39];
  for(var i=0; i<10; i++) {
    ok(ret[i] === expected[i], ("storeKey returned at index " + i + ":  "+ret[i]+" equal to expected value " +expected[i]));
  }
  ok(MyApp.store.changes.length == 0, "no changes should have been recorded."); 
  ok(MyApp.store.persistentChanges.created.length == 0, "no persistentChanges.created should have been recorded."); 
});

test("loadRecords: call loadRecords(json40_49), should return array with 10 unique storeKeys 40-49", function() {
  var ret = MyApp.store.loadRecords(json40_49);
  var expected = [40,41,42,43,44,45,46,47,48,49];
  for(var i=0; i<10; i++) {
    ok(ret[i] === expected[i], ("storeKey returned at index " + i + ":  "+ret[i]+" equal to expected value  " +expected[i]));
  }
  ok(MyApp.store.changes.length == 0, "no changes should have been recorded."); 
  ok(MyApp.store.persistentChanges.created.length == 0, "no persistentChanges.created should have been recorded."); 
});

test("loadRecords: check recKeyTypeMap for correctness. Expect 40 MyApp.Author types and 10 SC.Record types.", function() {
  var ret = MyApp.store.recKeyTypeMap;
  
  for(var i=0; i<40; i++) {
    ok(ret[i] === MyApp.Author, ("storeKey " + i + " is of type MyApp.Author"));
  }
  
  for(var i=40; i<50; i++) {
    ok(ret[i] === SC.Record, ("storeKey " + i + " is of type SC.Record"));
  }
  ok(MyApp.store.changes.length == 0, "no changes should have been recorded."); 
  ok(MyApp.store.persistentChanges.created.length == 0, "no persistentChanges.created should have been recorded."); 
});

test("loadRecords: check dataTypeMap for correctness. Expect 40 MyApp.Author types and 10 SC.Record types.", function() {
  var map = MyApp.store.dataTypeMap;
  
  var type1 = map[SC.guidFor(MyApp.Author)];
  var type2 = map[SC.guidFor(SC.Record)];
  
  ok(type1, "MyApp.Author is defined in the dataTypeMap.");
  ok(type2, "SC.Record is defined in the dataTypeMap.");
  
  var expected1 = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39];
  var expected2 = [40,41,42,43,44,45,46,47,48,49];
  
  for(var i=0; i<40; i++) {
    ok(type1[i] === expected1[i], ("storeKey returned for type MyApp.Author at index " + i + ":  "+type1[i]+" equal to expected value " +expected1[i]));
  }
  
  for(var i=0; i<10; i++) {
    ok(type2[i] === expected2[i], ("storeKey returned for type SC.Record at index " + i + ":  "+type2[i]+" equal to expected value " +expected2[i]));
  }
});

test("loadRecords: check revisions for correctness. All revisions should be 0", function() {
  var rev = MyApp.store.revisions;
    
  var expected = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49];
  
  for(var i=0; i<50; i++) {
    ok(rev[i] === 0, ("revision returned for storeKey at index " + i + " is "+rev[i]+"."));
  }
  
});

test("loadRecords: simulate update from server.", function() {
  var rev = MyApp.store.revisions;
  var hash = MyApp.store.dataHashes;

  var json = [
    {"type": "Author", "guid": "4995bc653acad","fullName": "Billy Bob", "bookTitle": "The Death Doors", "address":" UC Santa Cruz, 35 First St, Wichita, KS"},
    {"type": "Author", "guid": "4995bc653acfe","fullName": "Billy Joe", "bookTitle": "The Fear of the Thieves", "address":" Michigan State University, 285 Lazaneo St, Ann Arbor, MI"}
  ];
  
  var ret = MyApp.store.loadRecords(json, MyApp.Author, 'guid');

  ok(ret[0] === 0, "ret[0] from loadRecords is storeKey 0");
  ok(hash[0].fullName == "Billy Bob" , "dataHash at storeKey 0 has new fullName set to 'Billy Bob'");
  ok(rev[0] === 1, "revision at storeKey 0 has revision 1");

  ok(ret[1] === 1, "ret[0] from loadRecords is storeKey 0");
  ok(hash[1].fullName == "Billy Joe" , "dataHash at storeKey 0 has new fullName set to 'Billy Joe'");
  ok(rev[1] === 1, "revision at storeKey 1 has revision 1");
  
  ok(MyApp.store.changes.length == 0, "no changes should have been recorded."); 
  ok(MyApp.store.persistentChanges.updated.length == 0, "no persistentChanges.updated should have been recorded."); 
});

test("materialization: find record with command  MyApp.store.find('4995bc653adad')", function() {
  var record = MyApp.store.find('4995bc653adad');
  ok(typeof record === 'object', "record returned is of type 'object'");
  ok(record.get('fullName') == 'Milburn Holdeman 2', "record.get('fullName') should equal 'Milburn Holdeman 2'");
  ok(record.get(record.primaryKey) == '4995bc653adad', "record.get(record.primaryKey) should equal '4995bc653adad'");
  ok(record.get('guid') == '4995bc653adad', "record.get('guid') should equal '4995bc653adad'");
  ok(record._storeKey === 8, "record._storeKey should equal 8");

  var rec = MyApp.store.find('4995bc653adad');
  ok(rec === record, "find again, var rec = MyApp.store.find('4995bc653adad'). rec should === record");
});

test("materialization: find record with command  MyApp.Author.find('4995bc653adc4', MyApp.store)", function() {
  var record = MyApp.Author.find('4995bc653adc4', MyApp.store);
  ok(typeof record === 'object', "record returned is of type 'object'");
  ok(record.get('fullName') == 'Martina Read 4', "record.get('fullName') should equal 'Martina Read 4'");
  ok(record.get(record.primaryKey) == '4995bc653adc4', "record.get(record.primaryKey) should equal '4995bc653adc4'");
  ok(record.get('guid') == '4995bc653adc4', "record.get('guid') should equal '4995bc653adc4'");
  ok(record._storeKey === 9, "record._storeKey should equal 9");

  var rec = MyApp.Author.find('4995bc653adc4', MyApp.store);
  ok(rec === record, "find again, var rec = MyApp.Author.find('4995bc653adc4'). rec should === record");
});

test("materialization: find unknown record with command MyApp.store.find('123') should fault and return null.", function() {
  var record = MyApp.store.find('123');
  ok(record === null, "record returned should equal null");
});

test("materialization: find record with command  MyApp.store.find('123', MyApp.Author) should fault and get data from server.", function() {
  var record = MyApp.store.find('123', MyApp.Author);
  ok(typeof record === 'object', "record returned is of type 'object'");
  ok(record._storeKey === 50, "record._storeKey should equal 50");
  ok(record.get('guid') === null, "record.get('guid') should === null");
  ok(record.get('status') === SC.RECORD_LOADING, "record.get('status') should === SC.RECORD_LOADING");
  
  MyApp.fixtureServer.simulateResponseFromServer('123');
  
  ok(record.get('guid') === '123', "record.get('guid') should === '123'");
  ok(record.get('status') === SC.RECORD_LOADED, "record.get('status') should === SC.RECORD_LOADED");
  ok(record.get('fullName') === 'Galen Tyrol', "record.get('fullName') should === 'Galen Tyrol'");
  ok(record._storeKey === 50, "record._storeKey should equal 50");
  ok(MyApp.store.revisions[50] === 0, "revision should equal 0");

});

test("record: materialize guid='4995bc653ae78', test using set() on record without beginEditing() call. then commitChanges on store.", function() {
  var record = MyApp.store.find('4995bc653ae78', MyApp.Author);
  ok(typeof record === 'object', "record returned is of type 'object'");
  ok(record.get('fullName') == "Erskine Aultman 2", "record.get('fullName') should equal 'Erskine Aultman 2'");

  ok(MyApp.store.revisions[record._storeKey] === 0, "Before editing record, revision in store should be 0.");

  record.set('fullName', 'Bob Jones');
  ok(record.get('fullName') == "Bob Jones", "record.set('fullName', 'Bob Jones'), fullName should equal 'Bob Jones'");
  ok(record._editLevel === 0, "after a set operation without using explicit beginEditing(), _editLevel should return to 0. ACTUAL: " + record._editLevel);

  ok(MyApp.store.revisions[record._storeKey] === 1, "After first edit, revision in store should be 1. ACTUAL: " + MyApp.store.revisions[record._storeKey]);

  record.set('fullName', 'Bobby Jones');
  ok(record.get('fullName') == "Bobby Jones", "record.set('fullName', 'Bobby Jones'), fullName should equal 'Bobby Jones'");
  ok(record._editLevel === 0, "after a set operation without using explicit beginEditing(), _editLevel should return to 0. ACTUAL: " + record._editLevel);

  ok(MyApp.store.revisions[record._storeKey] === 2, "After second edit, revision in store should be 2. ACTUAL: " + MyApp.store.revisions[record._storeKey]);

  ok(MyApp.store.changes.length == 2, "BEFORE commit, 2 changes should have been recorded."); 
  ok(MyApp.store.persistentChanges.updated.length == 2, "BEFORE commit, 2 persistentChanges.updated should have been recorded."); 
  ok(MyApp.store.get('hasChanges') === YES, "BEFORE commit, hasChanges property on store is set to YES."); 

  var success = MyApp.store.commitChanges();
  ok(success == YES, "AFTER commit, YES should be returned to signify success."); 

  ok(MyApp.store.changes.length == 0, "AFTER commit and reset of changes should result in a length of 0."); 
  ok(MyApp.store.persistentChanges.updated.length == 0, "AFTER commit and reset of persistentChanges.updated should result in a length of 0."); 
  ok(MyApp.store.get('hasChanges') === NO, "AFTER commit and reset, hasChanges property on store is set to NO."); 

});

test("record: materialize guid='4995bc653af24', test using set() on record WITH beginEditing() and endEditing() calls. then commitChanges store.", function() {
  var record = MyApp.store.find('4995bc653af24', MyApp.Author);
  ok(typeof record === 'object', "record returned is of type 'object'");
  ok(record.get('fullName') == "Hailey Berkheimer 3", "record.get('fullName') should equal 'Hailey Berkheimer 3'");

  ok(MyApp.store.revisions[record._storeKey] === 0, "Before editing record, revision in store should be 0.");

  record.beginEditing();
  
  record.set('fullName', 'Bob Jones');
  ok(record.get('fullName') == "Bob Jones", "record.set('fullName', 'Bob Jones'), fullName should equal 'Bob Jones'");
  ok(record._editLevel === 1, "after a set operation with explicit beginEditing(), _editLevel should be to 1. ACTUAL: " + record._editLevel);

  ok(MyApp.store.revisions[record._storeKey] === 0, "After first edit, revision in store should be 0. ACTUAL: " + MyApp.store.revisions[record._storeKey]);

  record.set('fullName', 'Bobby Jones');
  ok(record.get('fullName') == "Bobby Jones", "record.set('fullName', 'Bobby Jones'), fullName should equal 'Bobby Jones'");
  ok(record._editLevel === 1, "after a set operation with explicit beginEditing(), _editLevel should be to 1. ACTUAL: " + record._editLevel);

  ok(MyApp.store.revisions[record._storeKey] === 0, "After second edit, revision in store should be 0. ACTUAL: " + MyApp.store.revisions[record._storeKey]);
  
  record.endEditing();

  ok(MyApp.store.revisions[record._storeKey] === 1, "AFTER calling record.endEditing(), revision in store should be 1. ACTUAL: " + MyApp.store.revisions[record._storeKey]);
  ok(record._editLevel === 0, "AFTER calling record.endEditing() with explicit beginEditing(), _editLevel should be to 0. ACTUAL: " + record._editLevel);

  
  ok(MyApp.store.changes.length == 1, "BEFORE commit, 1 changes should have been recorded."); 
  ok(MyApp.store.persistentChanges.updated.length == 1, "BEFORE commit, 1 persistentChanges.updated should have been recorded."); 
  ok(MyApp.store.get('hasChanges') === YES, "BEFORE commit, hasChanges property on store is set to YES."); 

  var success = MyApp.store.commitChanges();
  ok(success == YES, "AFTER commit, YES should be returned to signify success."); 


  ok(MyApp.store.changes.length == 0, "AFTER commit and reset of changes should result in a length of 0."); 
  ok(MyApp.store.persistentChanges.updated.length == 0, "AFTER commit and reset of persistentChanges.updated should result in a length of 0."); 
  ok(MyApp.store.get('hasChanges') === NO, "AFTER commit and reset, hasChanges property on store is set to NO."); 

});

test("record: materialize guid='4995bc653b043', test using set() on record without beginEditing() call. then discardChanges on store.", function() {
  var record = MyApp.store.find('4995bc653b043', MyApp.Author);
  ok(typeof record === 'object', "record returned is of type 'object'");
  ok(record.get('fullName') == "Clitus Mccallum 2", "record.get('fullName') should equal 'Clitus Mccallum 2'");

  ok(MyApp.store.revisions[record._storeKey] === 0, "Before editing record, revision in store should be 0.");

  record.set('fullName', 'Bob Jones');
  ok(record.get('fullName') == "Bob Jones", "record.set('fullName', 'Bob Jones'), fullName should equal 'Bob Jones'");
  ok(record._editLevel === 0, "after a set operation without using explicit beginEditing(), _editLevel should return to 0. ACTUAL: " + record._editLevel);

  ok(MyApp.store.revisions[record._storeKey] === 1, "After first edit, revision in store should be 1. ACTUAL: " + MyApp.store.revisions[record._storeKey]);

  record.set('fullName', 'Bobby Jones');
  ok(record.get('fullName') == "Bobby Jones", "record.set('fullName', 'Bobby Jones'), fullName should equal 'Bobby Jones'");
  ok(record._editLevel === 0, "after a set operation without using explicit beginEditing(), _editLevel should return to 0. ACTUAL: " + record._editLevel);

  ok(MyApp.store.revisions[record._storeKey] === 2, "After second edit, revision in store should be 2. ACTUAL: " + MyApp.store.revisions[record._storeKey]);

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

  ok(MyApp.store.changes.length == 0, "AFTER discard and reset of changes should result in a length of 0."); 
  ok(MyApp.store.persistentChanges.updated.length == 0, "AFTER discard and reset of persistentChanges.updated should result in a length of 0."); 
  ok(MyApp.store.get('hasChanges') === NO, "AFTER discard and reset, hasChanges property on store is set to NO."); 

});

test("record: destroy existing record with guid='4995bc653b043' by calling store.destroyRecords([record]) then commitChanges.", function() {
  var record = MyApp.store.find('4995bc653b043', MyApp.Author);
  ok(typeof record === 'object', "record returned is of type 'object'");
  ok(record.get('fullName') == "Bobby Jones", "record.get('fullName'), fullName should equal 'Bobby Jones'");

  MyApp.store.destroyRecords([record]);

  ok(record.get('fullName') === null, "record.get('fullName'), fullName should equal to null.");

  ok(MyApp.store.changes.length == 1, "BEFORE commit, 1 change should have been recorded."); 
  ok(MyApp.store.persistentChanges.deleted.length == 1, "BEFORE commit, 1 persistentChanges.deleted should have been recorded."); 
  ok(MyApp.store.get('hasChanges') === YES, "BEFORE commit, hasChanges property on store is set to YES."); 

  var success = MyApp.store.commitChanges();
  ok(success == YES, "AFTER commit, YES should be returned to signify success."); 

  ok(MyApp.store.changes.length == 0, "AFTER commit and reset of changes should result in a length of 0."); 
  ok(MyApp.store.persistentChanges.updated.length == 0, "AFTER commit and reset of persistentChanges.updated should result in a length of 0."); 
  ok(MyApp.store.get('hasChanges') === NO, "AFTER commit and reset, hasChanges property on store is set to NO."); 

});

test("record: destroy existing record with guid='4995bc653af24' by calling record.destroy() then commitChanges.", function() {
  var record = MyApp.store.find('4995bc653af24', MyApp.Author);
  ok(typeof record === 'object', "record returned is of type 'object'");
  ok(record.get('fullName') == "Bobby Jones", "record.get('fullName'), fullName should equal 'Bobby Jones'");

  record.destroy();

  ok(record.get('fullName') === null, "record.get('fullName'), fullName should equal to null.");

  ok(MyApp.store.changes.length == 1, "BEFORE commit, 1 change should have been recorded."); 
  ok(MyApp.store.persistentChanges.deleted.length == 1, "BEFORE commit, 1 persistentChanges.deleted should have been recorded."); 
  ok(MyApp.store.get('hasChanges') === YES, "BEFORE commit, hasChanges property on store is set to YES."); 

  var success = MyApp.store.commitChanges();
  ok(success == YES, "AFTER commit, YES should be returned to signify success."); 

  ok(MyApp.store.changes.length == 0, "AFTER commit and reset of changes should result in a length of 0."); 
  ok(MyApp.store.persistentChanges.updated.length == 0, "AFTER commit and reset of persistentChanges.updated should result in a length of 0."); 
  ok(MyApp.store.get('hasChanges') === NO, "AFTER commit and reset, hasChanges property on store is set to NO."); 

});

test("record: destroy existing record with guid='4995bc653ae78' by calling record.destroy() then discardChanges.", function() {
  var record = MyApp.store.find('4995bc653ae78', MyApp.Author);
  ok(typeof record === 'object', "record returned is of type 'object'");
  ok(record.get('fullName') == "Bobby Jones", "record.get('fullName'), fullName should equal 'Bobby Jones'");

  record.destroy();

  ok(record.get('fullName') === null, "record.get('fullName'), fullName should equal to null.");

  ok(MyApp.store.changes.length == 1, "BEFORE commit, 1 change should have been recorded."); 
  ok(MyApp.store.persistentChanges.deleted.length == 1, "BEFORE commit, 1 persistentChanges.deleted should have been recorded."); 
  ok(MyApp.store.get('hasChanges') === YES, "BEFORE commit, hasChanges property on store is set to YES."); 

  var didThrow = NO;
  try {
    var success = MyApp.store.discardChanges();
    ok(success == NO, "AFTER discard, NO should be returned to signify error because you're in a store that is attached to a fixtureServer.");
  } catch(e) {
    didThrow = YES;
  }

  ok(MyApp.store.changes.length == 0, "AFTER commit and reset of changes should result in a length of 0."); 
  ok(MyApp.store.persistentChanges.updated.length == 0, "AFTER commit and reset of persistentChanges.updated should result in a length of 0."); 
  ok(MyApp.store.get('hasChanges') === NO, "AFTER commit and reset, hasChanges property on store is set to NO."); 

});

test("record: create new record using MyApp.store.createRecord({fullName: 'John Locke'}, MyApp.Author) then commitChanges. See guid from server.", function() {
  
  var record = MyApp.store.createRecord({fullName: 'John Locke'}, MyApp.Author);

  ok(typeof record === 'object', "record returned is of type 'object'");
  ok(record.get('fullName') == "John Locke", "record.get('fullName'), fullName should equal 'John Locke'");
  ok(record.get('guid') == null, "record.get('guid'), guid be equal to null.");

  ok(MyApp.store.changes.length == 1, "BEFORE commit, 1 change should have been recorded."); 
  ok(MyApp.store.persistentChanges.created.length == 1, "BEFORE commit, 1 persistentChanges.created should have been recorded."); 
  ok(MyApp.store.get('hasChanges') === YES, "BEFORE commit, hasChanges property on store is set to YES."); 

  var success = MyApp.store.commitChanges();
  ok(success == YES, "AFTER commit, YES should be returned to signify success."); 

  ok(MyApp.store.changes.length == 0, "AFTER commit and reset of changes should result in a length of 0."); 
  ok(MyApp.store.persistentChanges.updated.length == 0, "AFTER commit and reset of persistentChanges.updated should result in a length of 0."); 
  ok(MyApp.store.get('hasChanges') === NO, "AFTER commit and reset, hasChanges property on store is set to NO."); 

  ok(record.get('status') === SC.RECORD_NEW, "record.get('status') should === SC.RECORD_NEW");
  ok(record.get('newRecord') === YES, "record.get('newRecord') should === YES");

  MyApp.fixtureServer.simulateResponseFromServer(51);

  ok(record.get('fullName') == "John Locke", "record.get('fullName'), fullName should equal 'John Locke'");
  ok(record.get('bookTitle') == "A Letter Concerning Toleration", "record.get('bookTitle'), bookTitle should equal 'A Letter Concerning Toleration'");
  ok(record.get('guid') == "abcdefg", "record.get('guid'), guid should equal 'abcdefg'");
  ok(MyApp.store.primaryKeyMap['abcdefg'] == 51, "MyApp.store.primaryKeyMap['abcdefg'] == 51");
  ok(MyApp.store.storeKeyMap[51] == 'abcdefg', "MyApp.store.storeKeyMap[51] == 'abcdefg'");

  ok(record.get('status') === SC.RECORD_LOADED, "record.get('status') should === SC.RECORD_LOADED");
  ok(record.get('newRecord') === NO, "record.get('newRecord') should === NO");

});

test("chaining: create new chained store off from MyApp.store", function() {
  MyApp.chainedStore = MyApp.store.createChainedStore();
  ok(MyApp.chainedStore.get('parentStore')=== MyApp.store, "MyApp.chainedStore's parentStore should be MyApp.store.");
  ok(MyApp.chainedStore=== MyApp.store.childStores[0], "MyApp.store's first childStore should be MyApp.chainedStore.");
});

test("chaining: new record in chainedStore. commit it, commit parentStore", function() {
  var record = MyApp.chainedStore.createRecord({fullName: 'Jim Locke'}, MyApp.Author);
  
  ok(typeof record === 'object', "record returned is of type 'object'");
  ok(record.get('fullName') == "Jim Locke", "record.get('fullName'), fullName should equal 'Jim Locke'");
  ok(record.get('guid') == null, "record.get('guid'), guid be equal to null.");

  ok(MyApp.chainedStore.dataHashes[52] !== undefined, "created dataHashes should exist with storeKey 52 in chainedStore");
  ok(MyApp.store.dataHashes[52] === undefined, "created dataHashes should NOT exist with storeKey 52 in store");

  ok(MyApp.chainedStore.changes.length == 1, "BEFORE commit, 1 change in chainedStore should have been recorded."); 
  ok(MyApp.chainedStore.persistentChanges.created.length == 1, "BEFORE commit, 1 persistentChanges.created  in chainedStore should have been recorded."); 
  ok(MyApp.chainedStore.get('hasChanges') === YES, "BEFORE commit, hasChanges property on chainedStore is set to YES."); 

  ok(MyApp.store.changes.length == 0, "BEFORE commit and reset of changes in parentStore should result in a length of 0."); 
  ok(MyApp.store.persistentChanges.created.length == 0, "BEFORE commit and reset of persistentChanges.created in parentStore should result in a length of 0."); 
  ok(MyApp.store.get('hasChanges') === NO, "BEFORE commit and reset, hasChanges property in parentStore is set to NO."); 

  var success = MyApp.chainedStore.commitChanges();
  ok(success == YES, "AFTER commit of chainedStore, YES should be returned to signify success."); 

  ok(MyApp.chainedStore.changes.length == 0, "AFTER commit, 0 change in chainedStore should have been recorded."); 
  ok(MyApp.chainedStore.persistentChanges.created.length == 0, "AFTER commit, 1 persistentChanges.created  in chainedStore should have been recorded."); 
  ok(MyApp.chainedStore.get('hasChanges') === NO, "AFTER commit, hasChanges property on chainedStore is set to NO."); 

  ok(MyApp.store.changes.length == 0, "BEFORE commit, 0 change  in parentStore should have been recorded."); 
  ok(MyApp.store.persistentChanges.created.length == 1, "BEFORE commit, 1 persistentChanges.created in parentStore should have been recorded."); 
  ok(MyApp.store.get('hasChanges') === NO, "BEFORE commit, hasChanges property on parentStore is set to NO."); 

  var success = MyApp.store.commitChanges();
  ok(success == YES, "AFTER commit of parentStore, YES should be returned to signify success."); 

  MyApp.fixtureServer.simulateResponseFromServer(52);

  ok(record.get('fullName') == "Jim Locke", "record.get('fullName'), fullName should equal 'Jim Locke'");
  ok(record.get('bookTitle') == "A Letter Concerning Toleration Part Deux", "record.get('bookTitle'), bookTitle should equal 'A Letter Concerning Toleration Part Deux'");
  ok(record.get('guid') == "abc", "record.get('guid'), guid should equal 'abcdefg'");
  ok(MyApp.store.primaryKeyMap['abc'] == 52, "MyApp.store.primaryKeyMap['abc'] == 52");
  ok(MyApp.store.storeKeyMap[52] == 'abc', "MyApp.store.storeKeyMap[52] == 'abc'");

  ok(record.get('status') === SC.RECORD_LOADED, "record.get('status') should === SC.RECORD_LOADED");
  ok(record.get('newRecord') === NO, "record.get('newRecord') should === NO");

  
  var rec = MyApp.store.find('abc');
  ok(typeof rec === 'object', "check store to see if record is there. rec MyApp.store.find('abc') is of type 'object'");
  ok(rec === record, 'rec from store should be the same object as record from chainedStore');
  
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

  ok(MyApp.store.changes.length == 0, "BEFORE commit and reset of changes in parentStore should result in a length of 0."); 
  ok(MyApp.store.persistentChanges.created.length == 0, "BEFORE commit and reset of persistentChanges.created in parentStore should result in a length of 0."); 
  ok(MyApp.store.get('hasChanges') === NO, "BEFORE commit and reset, hasChanges property in parentStore is set to NO."); 

  var success = MyApp.chainedStore.commitChanges();
  ok(success == YES, "AFTER commit of chainedStore, YES should be returned to signify success."); 

  ok(MyApp.chainedStore.changes.length == 0, "AFTER commit, 0 change in chainedStore should have been recorded."); 
  ok(MyApp.chainedStore.persistentChanges.created.length == 0, "AFTER commit, 1 persistentChanges.created  in chainedStore should have been recorded."); 
  ok(MyApp.chainedStore.get('hasChanges') === NO, "AFTER commit, hasChanges property on chainedStore is set to NO."); 

  ok(MyApp.store.changes.length == 0, "BEFORE commit, 0 change  in parentStore should have been recorded."); 
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

  ok(MyApp.store.changes.length == 0, "BEFORE discard and reset of changes in parentStore should result in a length of 0."); 
  ok(MyApp.store.persistentChanges.created.length == 0, "BEFORE discard and reset of persistentChanges.created in parentStore should result in a length of 0."); 
  ok(MyApp.store.get('hasChanges') === NO, "BEFORE discard and reset, hasChanges property in parentStore is set to NO."); 

  var success = MyApp.chainedStore.discardChanges();
  ok(success == YES, "AFTER discard of chainedStore, YES should be returned to signify success."); 

  ok(MyApp.chainedStore.dataHashes[54] === undefined, "created dataHash should NOT exist with storeKey 54 in chainedStore");
  ok(MyApp.store.dataHashes[54] === undefined, "created dataHash should NOT exist with storeKey 54 in store");

  ok(MyApp.chainedStore.changes.length == 0, "AFTER discard, 0 change in chainedStore should have been recorded."); 
  ok(MyApp.chainedStore.persistentChanges.created.length == 0, "AFTER discard, 1 persistentChanges.created  in chainedStore should have been recorded."); 
  ok(MyApp.chainedStore.get('hasChanges') === NO, "AFTER discard, hasChanges property on chainedStore is set to NO."); 

  ok(MyApp.store.changes.length == 0, "AFTER discard and reset of changes in parentStore should result in a length of 0."); 
  ok(MyApp.store.persistentChanges.created.length == 0, "AFTER discard and reset of persistentChanges.created in parentStore should result in a length of 0."); 
  ok(MyApp.store.get('hasChanges') === NO, "AFTER discard and reset, hasChanges property in parentStore is set to NO."); 

});


test("chaining: get record in chainedStore AND store. update it in chainedStore. commit. then commit to fixtureServer.", function() {
  var chainedStoreRecord = MyApp.chainedStore.find("4995bc653b11d");
  var storeRecord = MyApp.store.find("4995bc653b11d");
  
  ok(chainedStoreRecord !== storeRecord, "BEFORE UPDATE: chainedStoreRecord should not equal storeRecord");
  ok(chainedStoreRecord._storeKey == storeRecord._storeKey, "BEFORE UPDATE: chainedStoreRecord._storeKey should equal storeRecord._storeKey");
  ok( MyApp.chainedStore.dataHashes[chainedStoreRecord._storeKey] === MyApp.store.dataHashes[storeRecord._storeKey], "BEFORE UPDATE: chainedStoreRecord and storeRecord should point to the same dataHash");

  chainedStoreRecord.set('fullName', 'Kara Thrace');
  ok( MyApp.chainedStore.dataHashes[chainedStoreRecord._storeKey] !== MyApp.store.dataHashes[storeRecord._storeKey], "AFTER UPDATE:  chainedStoreRecord.set('fullName', 'Kara Thrace').. chainedStoreRecord and storeRecord should NOT point to the same dataHash");
  
  ok(storeRecord.get('fullName') == 'Janette Koepple 2', "AFTER UPDATE: storeRecord.get('fullName') should equal original value 'Janette Koepple 2'");
  ok(chainedStoreRecord.get('fullName') == 'Kara Thrace', "AFTER UPDATE: chainedStoreRecord.get('fullName') should equal new value 'Kara Thrace'");

  ok(MyApp.chainedStore.changes.length == 1, "AFTER UPDATE, 1 change in chainedStore should have been recorded."); 
  ok(MyApp.chainedStore.persistentChanges.updated.length == 1, "AFTER UPDATE, 1 persistentChanges.updated in chainedStore should have been recorded."); 
  ok(MyApp.chainedStore.get('hasChanges') === YES, "AFTER UPDATE, hasChanges property on chainedStore is set to YES."); 

  ok(MyApp.store.changes.length == 0, "AFTER UPDATE, 0 change in store should have been recorded."); 
  ok(MyApp.store.persistentChanges.updated.length == 0, "AFTER UPDATE, 0 persistentChanges.updated in store should have been recorded."); 
  ok(MyApp.store.get('hasChanges') === NO, "AFTER UPDATE, hasChanges property on store is set to NO."); 

  var success = MyApp.chainedStore.commitChanges();
  ok(success == YES, "AFTER commit of chainedStore, YES should be returned to signify success."); 

  ok(chainedStoreRecord !== storeRecord, "AFTER COMMIT: chainedStoreRecord should still not equal storeRecord.");
  ok(chainedStoreRecord._storeKey == storeRecord._storeKey, "AFTER COMMIT: chainedStoreRecord._storeKey should equal storeRecord._storeKey");
  ok( MyApp.chainedStore.dataHashes[chainedStoreRecord._storeKey] === MyApp.store.dataHashes[storeRecord._storeKey], "AFTER COMMIT: chainedStoreRecord and storeRecord should point to the same dataHash");
  
  var success = MyApp.store.commitChanges();
  ok(success == YES, "AFTER commit of store, YES should be returned to signify success."); 

  ok(storeRecord.get('fullName') == 'Kara Thrace', "AFTER COMMIT: storeRecord.get('fullName') should equal original value 'Kara Thrace'");
  ok(chainedStoreRecord.get('fullName') == 'Kara Thrace', "AFTER COMMIT: chainedStoreRecord.get('fullName') should equal original value 'Kara Thrace'");

});

test("chaining: get record in chainedStore AND store. update it in chainedStore. discard.", function() {
  var chainedStoreRecord = MyApp.chainedStore.find("4995bc653b173");
  var storeRecord = MyApp.store.find("4995bc653b173");
  
  ok(chainedStoreRecord !== storeRecord, "BEFORE UPDATE: chainedStoreRecord should not equal storeRecord");
  ok(chainedStoreRecord._storeKey == storeRecord._storeKey, "BEFORE UPDATE: chainedStoreRecord._storeKey should equal storeRecord._storeKey");
  ok( MyApp.chainedStore.dataHashes[chainedStoreRecord._storeKey] === MyApp.store.dataHashes[storeRecord._storeKey], "BEFORE UPDATE: chainedStoreRecord and storeRecord should point to the same dataHash");

  chainedStoreRecord.set('fullName', 'Karl Agathon');
  ok( MyApp.chainedStore.dataHashes[chainedStoreRecord._storeKey] !== MyApp.store.dataHashes[storeRecord._storeKey], "AFTER UPDATE:  chainedStoreRecord.set('fullName', 'Karl Agathon').. chainedStoreRecord and storeRecord should NOT point to the same dataHash");
  
  ok(storeRecord.get('fullName') == 'Leyton Jyllian 4', "AFTER UPDATE: storeRecord.get('fullName') should equal original value 'Leyton Jyllian 4'");
  ok(chainedStoreRecord.get('fullName') == 'Karl Agathon', "AFTER UPDATE: chainedStoreRecord.get('fullName') should equal new value 'Karl Agathon'");

  ok(MyApp.chainedStore.changes.length == 1, "AFTER UPDATE, 1 change in chainedStore should have been recorded."); 
  ok(MyApp.chainedStore.persistentChanges.updated.length == 1, "AFTER UPDATE, 1 persistentChanges.updated in chainedStore should have been recorded."); 
  ok(MyApp.chainedStore.get('hasChanges') === YES, "AFTER UPDATE, hasChanges property on chainedStore is set to YES."); 

  ok(MyApp.store.changes.length == 0, "AFTER UPDATE, 0 change in store should have been recorded."); 
  ok(MyApp.store.persistentChanges.updated.length == 0, "AFTER UPDATE, 0 persistentChanges.updated in store should have been recorded."); 
  ok(MyApp.store.get('hasChanges') === NO, "AFTER UPDATE, hasChanges property on store is set to NO."); 

  var success = MyApp.chainedStore.discardChanges();
  ok(success == YES, "AFTER discard of chainedStore, YES should be returned to signify success."); 

  ok(MyApp.chainedStore.changes.length == 0, "AFTER DISCARD, 0 change in chainedStore should have been recorded."); 
  ok(MyApp.chainedStore.persistentChanges.updated.length == 0, "AFTER DISCARD, 0 persistentChanges.updated in chainedStore should have been recorded."); 
  ok(MyApp.chainedStore.get('hasChanges') === NO, "AFTER DISCARD, hasChanges property on chainedStore is set to NO."); 

  ok(MyApp.store.changes.length == 0, "AFTER UPDATE, 0 change in store should have been recorded."); 
  ok(MyApp.store.persistentChanges.updated.length == 0, "AFTER UPDATE, 0 persistentChanges.updated in store should have been recorded."); 
  ok(MyApp.store.get('hasChanges') === NO, "AFTER UPDATE, hasChanges property on store is set to NO."); 

  ok(chainedStoreRecord !== storeRecord, "AFTER DISCARD: chainedStoreRecord should still not equal storeRecord.");
  ok(chainedStoreRecord._storeKey == storeRecord._storeKey, "AFTER DISCARD: chainedStoreRecord._storeKey should equal storeRecord._storeKey");
  ok( MyApp.chainedStore.dataHashes[chainedStoreRecord._storeKey] === MyApp.store.dataHashes[storeRecord._storeKey], "AFTER DISCARD: chainedStoreRecord and storeRecord should point to the same dataHash");
  
  ok(storeRecord.get('fullName') == 'Leyton Jyllian 4', "AFTER DISCARD: storeRecord.get('fullName') should equal original value 'Leyton Jyllian 4'");
  ok(chainedStoreRecord.get('fullName') == 'Leyton Jyllian 4', "AFTER DISCARD: chainedStoreRecord.get('fullName') should equal original value 'Leyton Jyllian 4'");
  
});

test("chaining: get record in chainedStore AND store. commit edit in chainedStore. then discard store to the fixtureServer", function() {
  var chainedStoreRecord = MyApp.chainedStore.find("4995bc653b008");
  var storeRecord = MyApp.store.find("4995bc653b008");
  
  ok(chainedStoreRecord !== storeRecord, "BEFORE UPDATE: chainedStoreRecord should not equal storeRecord");
  ok(chainedStoreRecord._storeKey == storeRecord._storeKey, "BEFORE UPDATE: chainedStoreRecord._storeKey should equal storeRecord._storeKey");
  ok( MyApp.chainedStore.dataHashes[chainedStoreRecord._storeKey] === MyApp.store.dataHashes[storeRecord._storeKey], "BEFORE UPDATE: chainedStoreRecord and storeRecord should point to the same dataHash");

  chainedStoreRecord.set('fullName', 'Felix Gaeta');
  ok( MyApp.chainedStore.dataHashes[chainedStoreRecord._storeKey] !== MyApp.store.dataHashes[storeRecord._storeKey], "AFTER UPDATE:  chainedStoreRecord.set('fullName', 'Felix Gaeta').. chainedStoreRecord and storeRecord should NOT point to the same dataHash");
  
  ok(storeRecord.get('fullName') == 'Alfreda Rahl 3', "AFTER UPDATE: storeRecord.get('fullName') should equal original value 'Alfreda Rahl 3'");
  ok(chainedStoreRecord.get('fullName') == 'Felix Gaeta', "AFTER UPDATE: chainedStoreRecord.get('fullName') should equal original value 'Felix Gaeta'");

  ok(MyApp.chainedStore.changes.length == 1, "AFTER UPDATE, 1 change in chainedStore should have been recorded."); 
  ok(MyApp.chainedStore.persistentChanges.updated.length == 1, "AFTER UPDATE, 1 persistentChanges.updated in chainedStore should have been recorded."); 
  ok(MyApp.chainedStore.get('hasChanges') === YES, "AFTER UPDATE, hasChanges property on chainedStore is set to YES."); 

  ok(MyApp.store.changes.length == 0, "AFTER UPDATE, 0 change in store should have been recorded."); 
  ok(MyApp.store.persistentChanges.updated.length == 0, "AFTER UPDATE, 0 persistentChanges.updated in store should have been recorded."); 
  ok(MyApp.store.get('hasChanges') === NO, "AFTER UPDATE, hasChanges property on store is set to NO."); 

  var success = MyApp.chainedStore.commitChanges();
  ok(success == YES, "AFTER commit of chainedStore, YES should be returned to signify success."); 

  ok(chainedStoreRecord !== storeRecord, "AFTER COMMIT: chainedStoreRecord should still not equal storeRecord.");
  ok(chainedStoreRecord._storeKey == storeRecord._storeKey, "AFTER COMMIT: chainedStoreRecord._storeKey should equal storeRecord._storeKey");
  ok( MyApp.chainedStore.dataHashes[chainedStoreRecord._storeKey] === MyApp.store.dataHashes[storeRecord._storeKey], "AFTER COMMIT: chainedStoreRecord and storeRecord should point to the same dataHash");
  
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
  ok(chainedStoreRecord._storeKey == storeRecord._storeKey, "BEFORE UPDATE: chainedStoreRecord._storeKey should equal storeRecord._storeKey");
  ok( MyApp.chainedStore.dataHashes[chainedStoreRecord._storeKey] === MyApp.store.dataHashes[storeRecord._storeKey], "BEFORE UPDATE: chainedStoreRecord and storeRecord should point to the same dataHash");

  storeRecord.set('fullName', 'Saul Tigh');
  ok( MyApp.chainedStore.dataHashes[chainedStoreRecord._storeKey] !== MyApp.store.dataHashes[storeRecord._storeKey], "AFTER UPDATE:  store.set('fullName', 'Saul Tigh').. chainedStoreRecord and storeRecord should NOT point to the same dataHash");
  
  ok(storeRecord.get('fullName') == 'Saul Tigh', "AFTER UPDATE: storeRecord.get('fullName') should equal new value 'Saul Tigh'");
  ok(chainedStoreRecord.get('fullName') == 'Kerri Mayers 3', "AFTER UPDATE: chainedStoreRecord.get('fullName') should equal original value 'Kerri Mayers 3'");

  ok(MyApp.chainedStore.changes.length == 0, "AFTER UPDATE, 0 change in chainedStore should have been recorded."); 
  ok(MyApp.chainedStore.persistentChanges.updated.length == 0, "AFTER UPDATE, 0 persistentChanges.updated in chainedStore should have been recorded."); 
  ok(MyApp.chainedStore.get('hasChanges') === NO, "AFTER UPDATE, hasChanges property on chainedStore is set to NO."); 

  ok(MyApp.store.changes.length == 1, "AFTER UPDATE, 1 change in store should have been recorded."); 
  ok(MyApp.store.persistentChanges.updated.length == 1, "AFTER UPDATE, 1 persistentChanges.updated in store should have been recorded."); 
  ok(MyApp.store.get('hasChanges') === YES, "AFTER UPDATE, hasChanges property on store is set to YES."); 

  var success = MyApp.store.commitChanges();
  ok(success == YES, "AFTER commit of store, YES should be returned to signify success."); 

  ok(MyApp.chainedStore.changes.length == 0, "AFTER DISCARD, 0 change in chainedStore should have been recorded."); 
  ok(MyApp.chainedStore.persistentChanges.updated.length == 0, "AFTER DISCARD, 0 persistentChanges.updated in chainedStore should have been recorded."); 
  ok(MyApp.chainedStore.get('hasChanges') === NO, "AFTER DISCARD, hasChanges property on chainedStore is set to NO."); 

  ok(MyApp.store.changes.length == 0, "AFTER UPDATE, 0 change in store should have been recorded."); 
  ok(MyApp.store.persistentChanges.updated.length == 0, "AFTER UPDATE, 0 persistentChanges.updated in store should have been recorded."); 
  ok(MyApp.store.get('hasChanges') === NO, "AFTER UPDATE, hasChanges property on store is set to NO."); 

  ok(chainedStoreRecord !== storeRecord, "AFTER COMMIT: chainedStoreRecord should still not equal storeRecord.");
  ok(chainedStoreRecord._storeKey == storeRecord._storeKey, "AFTER COMMIT: chainedStoreRecord._storeKey should equal storeRecord._storeKey");
  ok( MyApp.chainedStore.dataHashes[chainedStoreRecord._storeKey] !== MyApp.store.dataHashes[storeRecord._storeKey], "AFTER COMMIT: chainedStoreRecord and storeRecord should still NOT point to the same dataHash");
  
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
  ok(chainedStoreRecord._storeKey == storeRecord._storeKey, "BEFORE UPDATE: chainedStoreRecord._storeKey should equal storeRecord._storeKey");
  ok( MyApp.chainedStore.dataHashes[chainedStoreRecord._storeKey] === MyApp.store.dataHashes[storeRecord._storeKey], "BEFORE UPDATE: chainedStoreRecord and storeRecord should point to the same dataHash");

  storeRecord.set('fullName', 'Saul Tigh');
  storeRecord.set('bookTitle', 'Cylons: Friend or Foe?');
  ok( MyApp.chainedStore.dataHashes[chainedStoreRecord._storeKey] !== MyApp.store.dataHashes[storeRecord._storeKey], "AFTER UPDATE:  store.set('fullName', 'Saul Tigh').. chainedStoreRecord and storeRecord should NOT point to the same dataHash");
  
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

  ok(MyApp.store.changes.length == 0, "AFTER COMMIT, 0 change in store should have been recorded."); 
  ok(MyApp.store.persistentChanges.updated.length == 0, "AFTER COMMIT, 0 persistentChanges.updated in store should have been recorded."); 
  ok(MyApp.store.get('hasChanges') === NO, "AFTER COMMIT, hasChanges property on store is set to NO."); 

  ok(chainedStoreRecord !== storeRecord, "AFTER COMMIT: chainedStoreRecord should still not equal storeRecord.");
  ok(chainedStoreRecord._storeKey == storeRecord._storeKey, "AFTER COMMIT: chainedStoreRecord._storeKey should equal storeRecord._storeKey");
  ok( MyApp.chainedStore.dataHashes[chainedStoreRecord._storeKey] !== MyApp.store.dataHashes[storeRecord._storeKey], "AFTER COMMIT: chainedStoreRecord and storeRecord should still NOT point to the same dataHash");
  
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


// 500 records.

var AuthorFixtures = [{"type": "Author",
 "guid": "4995bc373454a",
"fullName": "Gerry Woolery 4",
 "bookTitle": "The Madness of the Meddler",
 "address":" MIT, 21 Castro St, San Francisco, CA"},
{"type": "Author",
 "guid": "4995bc37345ab",
"fullName": "Forrest Eggbert 2",
 "bookTitle": "The Night Inferno",
 "address":" Harvard, 86 University Loop, Southampton, UK"},
{"type": "Author",
 "guid": "4995bc37345c0",
"fullName": "Dorthy Wilson 4",
 "bookTitle": "The Nightmare of Space",
 "address":" Harvard, 283 Elm St, Los Angeles, CA"},
{"type": "Author",
 "guid": "4995bc37345e4",
"fullName": "Nathan Lineman 4",
 "bookTitle": "The Night of the Ice",
 "address":" College University, 199 First St, Seattle, WA"},
{"type": "Author",
 "guid": "4995bc3734605",
"fullName": "Phinehas Laurenzi 3",
 "bookTitle": "The Day Infinity",
 "address":" Foothill College, 144 First St, Wichita, KS"},
{"type": "Author",
 "guid": "4995bc3734618",
"fullName": "Avis Cass 3",
 "bookTitle": "Masque of Space",
 "address":" London University, 75 Fifth Ave, Los Angeles, CA"},
{"type": "Author",
 "guid": "4995bc373462d",
"fullName": "Everard Richardson 1",
 "bookTitle": "The Day of the Horn",
 "address":" London University, 265 Lazaneo St, New York, NY"},
{"type": "Author",
 "guid": "4995bc3734641",
"fullName": "Su Strickland 2",
 "bookTitle": "The Day Ambassador",
 "address":" Santa Clara University, 461 Dana St, Los Angeles, CA"},
{"type": "Author",
 "guid": "4995bc3734655",
"fullName": "Patton Kooser 2",
 "bookTitle": "The Ultimate Seed",
 "address":" London University, 235 Van Ness Blvd, St. Louis, MO"},
{"type": "Author",
 "guid": "4995bc373466e",
"fullName": "Janelle Howard 3",
 "bookTitle": "The Fury Massacre",
 "address":" Springfield University, 411 Main St, Southampton, UK"},
{"type": "Author",
 "guid": "4995bc3734685",
"fullName": "Eliza Ropes 2",
 "bookTitle": "The Fear Robots",
 "address":" Foothill College, 386 Broadway Blvd, Ann Arbor, MI"},
{"type": "Author",
 "guid": "4995bc373469a",
"fullName": "Alisya Drennan 2",
 "bookTitle": "The Fear Paradise",
 "address":" University of Southampton, 282 Elm St, Santa Clara, CA"},
{"type": "Author",
 "guid": "4995bc37346b1",
"fullName": "Lori Magor 4",
 "bookTitle": "The Madness Attack",
 "address":" MIT, 429 Dana St, San Francisco, CA"},
{"type": "Author",
 "guid": "4995bc37346c4",
"fullName": "Amethyst Evans 4",
 "bookTitle": "The Fear of the Thieves",
 "address":" London University, 309 Main St, Cupertino, CA"},
{"type": "Author",
 "guid": "4995bc37346d8",
"fullName": "Ridley Ewing 2",
 "bookTitle": "The Killer Angel",
 "address":" New York University, 470 Broadway Blvd, New York, NY"},
{"type": "Author",
 "guid": "4995bc37346ef",
"fullName": "Sloane Moulton 1",
 "bookTitle": "The Dead of Time",
 "address":" Springfield University, 1 Dana St, Southampton, UK"},
{"type": "Author",
 "guid": "4995bc3734704",
"fullName": "Marquis Fuchs 3",
 "bookTitle": "The Seeds of Menace",
 "address":" CalTech, 348 Fifth Ave, Santa Clara, CA"},
{"type": "Author",
 "guid": "4995bc3734718",
"fullName": "August Feufer 4",
 "bookTitle": "The Fangs",
 "address":" CalTech, 244 Broadway Blvd, Cambridge, MA"},
{"type": "Author",
 "guid": "4995bc373472c",
"fullName": "Alix Rifler 1",
 "bookTitle": "The Day Whisper",
 "address":" Santa Clara University, 368 Oak Ave, Los Angeles, CA"},
{"type": "Author",
 "guid": "4995bc3734740",
"fullName": "Virgil Pinney 3",
 "bookTitle": "The Death of the Hive",
 "address":" College University, 452 Elm St, Los Angeles, CA"},
{"type": "Author",
 "guid": "4995bc373475d",
"fullName": "Carin Burnett 4",
 "bookTitle": "The Space of the Mist",
 "address":" Michigan State University, 331 University Loop, Santa Clara, CA"},
{"type": "Author",
 "guid": "4995bc3734774",
"fullName": "Matty Cypret 2",
 "bookTitle": "Crater of Day",
 "address":" London University, 37 Broadway Blvd, Seattle, WA"},
{"type": "Author",
 "guid": "4995bc3734794",
"fullName": "Matilda Rockwell 3",
 "bookTitle": "The Pirate Masters",
 "address":" CalTech, 487 Bloom St, Cambridge, MA"},
{"type": "Author",
 "guid": "4995bc37347b0",
"fullName": "Luann Garneis 1",
 "bookTitle": "The Day of the Keys",
 "address":" Springfield University, 418 Dana St, New York, NY"},
{"type": "Author",
 "guid": "4995bc37347c4",
"fullName": "Alysha Fox 1",
 "bookTitle": "The Death Face",
 "address":" Springfield University, 423 Castro St, Southampton, UK"},
{"type": "Author",
 "guid": "4995bc37347d9",
"fullName": "Clifford Dugger 3",
 "bookTitle": "The Ultimate Inferno",
 "address":" MIT, 478 Lazaneo St, San Francisco, CA"},
{"type": "Author",
 "guid": "4995bc37347ec",
"fullName": "Christianne Taggart 3",
 "bookTitle": "The Curse of Day",
 "address":" Stanford University, 83 Lazaneo St, Cambridge, MA"},
{"type": "Author",
 "guid": "4995bc373480b",
"fullName": "Kestrel Nehling 2",
 "bookTitle": "The Machines History",
 "address":" Santa Clara University, 296 Bloom St, Ann Arbor, MI"},
{"type": "Author",
 "guid": "4995bc373481f",
"fullName": "Mackenzie Pittman 1",
 "bookTitle": "Cave of Night",
 "address":" New York University, 489 Elm St, Ann Arbor, MI"},
{"type": "Author",
 "guid": "4995bc3734833",
"fullName": "Sheila Ammons 4",
 "bookTitle": "Robots of Menace",
 "address":" Harvard, 211 Second St, Cambridge, MA"},
{"type": "Author",
 "guid": "4995bc3734847",
"fullName": "September Glover 4",
 "bookTitle": "The Illusion Carnival",
 "address":" London University, 370 Fifth Ave, New York, NY"},
{"type": "Author",
 "guid": "4995bc3734863",
"fullName": "Porsche Gilman 1",
 "bookTitle": "The Seeds of Menace",
 "address":" Michigan State University, 1 Fifth Ave, Los Angeles, CA"},
{"type": "Author",
 "guid": "4995bc3734875",
"fullName": "Vance Jolce 1",
 "bookTitle": "The Final Time",
 "address":" CalTech, 364 University Loop, London, UK"},
{"type": "Author",
 "guid": "4995bc373488a",
"fullName": "Clifford Dugger 4",
 "bookTitle": "Dreams of Menace",
 "address":" Springfield University, 211 First St, New York, NY"},
{"type": "Author",
 "guid": "4995bc373489e",
"fullName": "Zander Pershing 1",
 "bookTitle": "Killer of Menace",
 "address":" Harvard, 464 Dana St, London, UK"},
{"type": "Author",
 "guid": "4995bc37348b2",
"fullName": "Joye Eisenman 3",
 "bookTitle": "The Whisper Faces",
 "address":" College University, 171 Lazaneo St, St. Louis, MO"},
{"type": "Author",
 "guid": "4995bc37348c5",
"fullName": "Phyliss Saylor 3",
 "bookTitle": "The Fury Secret",
 "address":" London University, 443 Dana St, St. Louis, MO"},
{"type": "Author",
 "guid": "4995bc37348e1",
"fullName": "Duke Rosenstiehl 1",
 "bookTitle": "The Time Fangs",
 "address":" CalTech, 28 Oak Ave, Los Angeles, CA"},
{"type": "Author",
 "guid": "4995bc37348f3",
"fullName": "Silvester Mcfall 3",
 "bookTitle": "Whispers of Madness",
 "address":" MIT, 217 First St, Cambridge, MA"},
{"type": "Author",
 "guid": "4995bc3734909",
"fullName": "Branda Wood 1",
 "bookTitle": "The Inferno",
 "address":" London University, 120 University Loop, Wichita, KS"},
{"type": "Author",
 "guid": "4995bc373491d",
"fullName": "Em Leichter 1",
 "bookTitle": "The Day of the Massacre",
 "address":" CalTech, 113 Castro St, Wichita, KS"},
{"type": "Author",
 "guid": "4995bc3734931",
"fullName": "Bonita Downing 4",
 "bookTitle": "Minds of Fury",
 "address":" Santa Clara University, 64 University Loop, London, UK"},
{"type": "Author",
 "guid": "4995bc3734944",
"fullName": "Norm Burns 4",
 "bookTitle": "The Machines Mists",
 "address":" UC Santa Cruz, 27 Lazaneo St, Cupertino, CA"},
{"type": "Author",
 "guid": "4995bc373495f",
"fullName": "Victor Painter 3",
 "bookTitle": "The Laboratory",
 "address":" MIT, 5 Elm St, Los Angeles, CA"},
{"type": "Author",
 "guid": "4995bc3734974",
"fullName": "Lalla Haverrman 2",
 "bookTitle": "Planet of Death",
 "address":" University of Southampton, 60 Oak Ave, London, UK"},
{"type": "Author",
 "guid": "4995bc3734988",
"fullName": "Jeri Stroh 3",
 "bookTitle": "The Meddler",
 "address":" London University, 390 Oak Ave, Southampton, UK"},
{"type": "Author",
 "guid": "4995bc373499c",
"fullName": "Raynard Peters 1",
 "bookTitle": "The Horror of the Minds",
 "address":" Michigan State University, 186 Van Ness Blvd, New York, NY"},
{"type": "Author",
 "guid": "4995bc37349bb",
"fullName": "Buck Eisaman 3",
 "bookTitle": "Future of Night",
 "address":" New York University, 470 First St, Southampton, UK"},
{"type": "Author",
 "guid": "4995bc37349d8",
"fullName": "Annie Surrency 3",
 "bookTitle": "The Menace Androids",
 "address":" Foothill College, 192 Bloom St, Southampton, UK"},
{"type": "Author",
 "guid": "4995bc37349f3",
"fullName": "Ashlie Newman 4",
 "bookTitle": "The Horror Key",
 "address":" MIT, 106 First St, Cupertino, CA"},
{"type": "Author",
 "guid": "4995bc3734a07",
"fullName": "Mabelle Staymates 2",
 "bookTitle": "The Riders of Death",
 "address":" Foothill College, 42 Broadway Blvd, Ann Arbor, MI"},
{"type": "Author",
 "guid": "4995bc3734a22",
"fullName": "Eveleen Mixey 3",
 "bookTitle": "The Doom of the Jaws",
 "address":" New York University, 218 University Loop, Los Angeles, CA"},
{"type": "Author",
 "guid": "4995bc3734a5f",
"fullName": "Anneka Gist 3",
 "bookTitle": "Ark of Space",
 "address":" London University, 301 Van Ness Blvd, Cambridge, MA"},
{"type": "Author",
 "guid": "4995bc3734a75",
"fullName": "Avis Cass 3",
 "bookTitle": "The Doomed Pit",
 "address":" Foothill College, 40 Second St, Seattle, WA"},
{"type": "Author",
 "guid": "4995bc3734a89",
"fullName": "Cedar Garry 3",
 "bookTitle": "The Death Dead",
 "address":" University of Southampton, 206 Bloom St, Palo Alto, CA"},
{"type": "Author",
 "guid": "4995bc3734aa3",
"fullName": "Kezia Henry 1",
 "bookTitle": "The Operation",
 "address":" MIT, 294 First St, New York, NY"},
{"type": "Author",
 "guid": "4995bc3734ab8",
"fullName": "Lindsey Straub 3",
 "bookTitle": "The Fury of the Angel",
 "address":" Stanford University, 11 Dana St, Cambridge, MA"},
{"type": "Author",
 "guid": "4995bc3734aca",
"fullName": "Cornell Siegrist 1",
 "bookTitle": "The Ghost",
 "address":" College University, 310 Second St, Southampton, UK"},
{"type": "Author",
 "guid": "4995bc3734ae5",
"fullName": "Raine Warrick 2",
 "bookTitle": "The Menace Myth",
 "address":" Springfield University, 360 University Loop, San Francisco, CA"},
{"type": "Author",
 "guid": "4995bc3734af9",
"fullName": "Marci Caesar 2",
 "bookTitle": "Fangs of Fury",
 "address":" Santa Clara University, 486 Main St, Ann Arbor, MI"},
{"type": "Author",
 "guid": "4995bc3734b0d",
"fullName": "Hewie Rose 2",
 "bookTitle": "Mirror of Night",
 "address":" CalTech, 419 Elm St, Wichita, KS"},
{"type": "Author",
 "guid": "4995bc3734b26",
"fullName": "Titania Tilton 3",
 "bookTitle": "The Day of the Mists",
 "address":" Michigan State University, 251 Main St, Los Angeles, CA"},
{"type": "Author",
 "guid": "4995bc3734b3b",
"fullName": "Amyas Hice 1",
 "bookTitle": "City of Menace",
 "address":" Santa Clara University, 380 Lazaneo St, San Francisco, CA"},
{"type": "Author",
 "guid": "4995bc3734b5c",
"fullName": "Lyric Richards 1",
 "bookTitle": "The Impossible Doors",
 "address":" MIT, 412 Elm St, Cambridge, MA"},
{"type": "Author",
 "guid": "4995bc3734b6f",
"fullName": "Lianne Kemble 4",
 "bookTitle": "The Mind Massacre",
 "address":" Harvard, 318 Fifth Ave, Ann Arbor, MI"},
{"type": "Author",
 "guid": "4995bc3734b83",
"fullName": "Gabe Milliron 4",
 "bookTitle": "The Carnival",
 "address":" MIT, 187 Second St, Los Angeles, CA"},
{"type": "Author",
 "guid": "4995bc3734b97",
"fullName": "Willis Costello 4",
 "bookTitle": "The Night of the Bandits",
 "address":" Michigan State University, 114 Elm St, Cambridge, MA"},
{"type": "Author",
 "guid": "4995bc3734bb6",
"fullName": "Lottie Sherlock 3",
 "bookTitle": "The Space Skull",
 "address":" Foothill College, 165 Main St, Cambridge, MA"},
{"type": "Author",
 "guid": "4995bc3734bc8",
"fullName": "Frieda Wade 2",
 "bookTitle": "The Operation",
 "address":" Santa Clara University, 179 University Loop, Cupertino, CA"},
{"type": "Author",
 "guid": "4995bc3734bde",
"fullName": "Chip Haynes 1",
 "bookTitle": "The Robot of Night",
 "address":" Foothill College, 258 First St, Ann Arbor, MI"},
{"type": "Author",
 "guid": "4995bc3734bf2",
"fullName": "Denzel Buehler 3",
 "bookTitle": "The Night of the Brides",
 "address":" Michigan State University, 138 First St, Cambridge, MA"},
{"type": "Author",
 "guid": "4995bc3734c0e",
"fullName": "Kaelee Johnson 3",
 "bookTitle": "The Evil Invasion",
 "address":" MIT, 121 Fifth Ave, Southampton, UK"},
{"type": "Author",
 "guid": "4995bc3734c25",
"fullName": "Prissy Cressman 1",
 "bookTitle": "Monster of Day",
 "address":" CalTech, 53 Second St, Los Angeles, CA"},
{"type": "Author",
 "guid": "4995bc3734c38",
"fullName": "Anne Roadman 4",
 "bookTitle": "The Meddler of Fear",
 "address":" MIT, 374 Broadway Blvd, St. Louis, MO"},
{"type": "Author",
 "guid": "4995bc3734c57",
"fullName": "Stacy Moffat 3",
 "bookTitle": "The Menace Mist",
 "address":" University of Southampton, 42 Second St, London, UK"},
{"type": "Author",
 "guid": "4995bc3734c6b",
"fullName": "Jerold Jenkins 3",
 "bookTitle": "The Thieves of Time",
 "address":" London University, 188 Broadway Blvd, London, UK"},
{"type": "Author",
 "guid": "4995bc3734c7f",
"fullName": "Berniece Berry 2",
 "bookTitle": "The Illusion Ark",
 "address":" College University, 148 Second St, Palo Alto, CA"},
{"type": "Author",
 "guid": "4995bc3734c92",
"fullName": "Tim Beck 3",
 "bookTitle": "The Warrior",
 "address":" New York University, 47 Broadway Blvd, London, UK"},
{"type": "Author",
 "guid": "4995bc3734cad",
"fullName": "Alexis Weisgarber 1",
 "bookTitle": "The Space of the Crater",
 "address":" Harvard, 47 Elm St, Palo Alto, CA"},
{"type": "Author",
 "guid": "4995bc3734cc0",
"fullName": "Levi Wilkinson 1",
 "bookTitle": "The Ambassador of Horror",
 "address":" UC Santa Cruz, 34 Lazaneo St, Ann Arbor, MI"},
{"type": "Author",
 "guid": "4995bc3734cd4",
"fullName": "Bailey Lauffer 3",
 "bookTitle": "Fury of Doom",
 "address":" New York University, 227 Castro St, Santa Clara, CA"},
{"type": "Author",
 "guid": "4995bc3734ce7",
"fullName": "Gerry Woolery 1",
 "bookTitle": "The Menace of the Computers",
 "address":" Springfield University, 8 Main St, Ann Arbor, MI"},
{"type": "Author",
 "guid": "4995bc3734cfb",
"fullName": "Hale Alliman 2",
 "bookTitle": "The Paradise of Death",
 "address":" Santa Clara University, 21 University Loop, Cupertino, CA"},
{"type": "Author",
 "guid": "4995bc3734d0f",
"fullName": "Everard Richardson 2",
 "bookTitle": "The Skull",
 "address":" Santa Clara University, 391 Elm St, Cupertino, CA"},
{"type": "Author",
 "guid": "4995bc3734d2c",
"fullName": "Tammie Crawford 1",
 "bookTitle": "The Empty Runaway",
 "address":" Michigan State University, 155 Van Ness Blvd, Cambridge, MA"},
{"type": "Author",
 "guid": "4995bc3734d3f",
"fullName": "Xavier Porter 3",
 "bookTitle": "The Resurrection of Death",
 "address":" Springfield University, 187 Lazaneo St, Palo Alto, CA"},
{"type": "Author",
 "guid": "4995bc3734d53",
"fullName": "Alec Owens 3",
 "bookTitle": "The Madness of the History",
 "address":" New York University, 385 University Loop, St. Louis, MO"},
{"type": "Author",
 "guid": "4995bc3734d67",
"fullName": "Jancis Busk 2",
 "bookTitle": "The Mind Seed",
 "address":" Harvard, 49 Main St, Santa Clara, CA"},
{"type": "Author",
 "guid": "4995bc3734d7b",
"fullName": "Daffodil Harper 1",
 "bookTitle": "Monster of Day",
 "address":" Michigan State University, 254 Castro St, Ann Arbor, MI"},
{"type": "Author",
 "guid": "4995bc3734d8f",
"fullName": "Davey Moore 2",
 "bookTitle": "Ghost of Fury",
 "address":" Harvard, 160 Broadway Blvd, Cupertino, CA"},
{"type": "Author",
 "guid": "4995bc3734dca",
"fullName": "Ridley Ewing 3",
 "bookTitle": "The Fear Awakening",
 "address":" College University, 86 Lazaneo St, San Francisco, CA"},
{"type": "Author",
 "guid": "4995bc3734dde",
"fullName": "Loreto Isemann 1",
 "bookTitle": "The Madness Night",
 "address":" Foothill College, 496 Van Ness Blvd, Wichita, KS"},
{"type": "Author",
 "guid": "4995bc3734df2",
"fullName": "Deshawn Pyle 4",
 "bookTitle": "Suns of Time",
 "address":" Santa Clara University, 271 Fifth Ave, Southampton, UK"},
{"type": "Author",
 "guid": "4995bc3734e07",
"fullName": "Hailey Berkheimer 3",
 "bookTitle": "The Time Smuggler",
 "address":" Stanford University, 345 Main St, St. Louis, MO"},
{"type": "Author",
 "guid": "4995bc3734e51",
"fullName": " 3",
 "bookTitle": "The Menace Nightmares",
 "address":" Stanford University, 346 Main St, Santa Clara, CA"},
{"type": "Author",
 "guid": "4995bc3734e74",
"fullName": "Simona Craig 2",
 "bookTitle": "The Horror of the Ice",
 "address":" Michigan State University, 47 Bloom St, Cambridge, MA"},
{"type": "Author",
 "guid": "4995bc3734e89",
"fullName": "Peta Filby 1",
 "bookTitle": "Masque of Space",
 "address":" Santa Clara University, 95 Broadway Blvd, Wichita, KS"},
{"type": "Author",
 "guid": "4995bc3734ea6",
"fullName": "Kathi Williams 4",
 "bookTitle": "Madness of Death",
 "address":" Springfield University, 307 Second St, San Francisco, CA"},
{"type": "Author",
 "guid": "4995bc3734eba",
"fullName": "Barret Lalty 1",
 "bookTitle": "The Space of the Mirror",
 "address":" University of Southampton, 287 Fifth Ave, St. Louis, MO"},
{"type": "Author",
 "guid": "4995bc3734ed9",
"fullName": "Russ Nicola 4",
 "bookTitle": "The Bride of Horror",
 "address":" University of Southampton, 270 Elm St, Cupertino, CA"},
{"type": "Author",
 "guid": "4995bc3734eed",
"fullName": "Maya Schrader 2",
 "bookTitle": "The Terrible Sea",
 "address":" College University, 206 First St, London, UK"},
{"type": "Author",
 "guid": "4995bc3734f01",
"fullName": "Hazel Holts 1",
 "bookTitle": "The Carnival",
 "address":" CalTech, 65 University Loop, London, UK"},
{"type": "Author",
 "guid": "4995bc3734f26",
"fullName": "Saffron Elinor 3",
 "bookTitle": "The Seeds of Menace",
 "address":" Springfield University, 462 Castro St, San Francisco, CA"},
{"type": "Author",
 "guid": "4995bc3734f39",
"fullName": "Tiger Whitling 2",
 "bookTitle": "The Night of the Brides",
 "address":" MIT, 139 Castro St, Palo Alto, CA"},
{"type": "Author",
 "guid": "4995bc3734f4e",
"fullName": "Rolph Burris 4",
 "bookTitle": "The Horror Power",
 "address":" Harvard, 418 Second St, London, UK"},
{"type": "Author",
 "guid": "4995bc3734f61",
"fullName": "Mark Wheeler 1",
 "bookTitle": "The Horror Key",
 "address":" University of Southampton, 441 Bloom St, New York, NY"},
{"type": "Author",
 "guid": "4995bc3734f75",
"fullName": "Wenona Tennant 2",
 "bookTitle": "The Men",
 "address":" Stanford University, 122 Main St, New York, NY"},
{"type": "Author",
 "guid": "4995bc3734f89",
"fullName": "Callista Bishop 1",
 "bookTitle": "The Pirate Masters",
 "address":" UC Santa Cruz, 127 Main St, Cambridge, MA"},
{"type": "Author",
 "guid": "4995bc3734fa4",
"fullName": "Cecil Rodacker 2",
 "bookTitle": "The Fury of the Wings",
 "address":" MIT, 499 Fifth Ave, Santa Clara, CA"},
{"type": "Author",
 "guid": "4995bc3734fb7",
"fullName": "Liliana Northey 4",
 "bookTitle": "The Fear Awakening",
 "address":" Harvard, 185 First St, Cambridge, MA"},
{"type": "Author",
 "guid": "4995bc3734fcb",
"fullName": "Webster Jelliman 1",
 "bookTitle": "The Talons of Day",
 "address":" University of Southampton, 472 Lazaneo St, Los Angeles, CA"},
{"type": "Author",
 "guid": "4995bc3734fdf",
"fullName": "Loreen Buck 4",
 "bookTitle": "The Masque of Doom",
 "address":" UC Santa Cruz, 122 Broadway Blvd, Cupertino, CA"},
{"type": "Author",
 "guid": "4995bc3734ff3",
"fullName": "Keisha Klockman 2",
 "bookTitle": "The Ice Web",
 "address":" MIT, 88 Lazaneo St, Cupertino, CA"},
{"type": "Author",
 "guid": "4995bc3735006",
"fullName": "Bennett Little 1",
 "bookTitle": "Revelation of Menace",
 "address":" UC Santa Cruz, 118 University Loop, Palo Alto, CA"},
{"type": "Author",
 "guid": "4995bc3735022",
"fullName": "Louis Waldron 1",
 "bookTitle": "The Mountain Suns",
 "address":" CalTech, 79 First St, San Francisco, CA"},
{"type": "Author",
 "guid": "4995bc3735034",
"fullName": "Sophia Spring 1",
 "bookTitle": "The Death of the Nightmares",
 "address":" Santa Clara University, 450 First St, San Francisco, CA"},
{"type": "Author",
 "guid": "4995bc3735048",
"fullName": "Joscelin Nash 3",
 "bookTitle": "The Day Monster",
 "address":" Santa Clara University, 191 Lazaneo St, St. Louis, MO"},
{"type": "Author",
 "guid": "4995bc373505c",
"fullName": "Porsche Gilman 1",
 "bookTitle": "Robots of Night",
 "address":" CalTech, 338 First St, St. Louis, MO"},
{"type": "Author",
 "guid": "4995bc3735070",
"fullName": "Deshawn Pyle 4",
 "bookTitle": "The Space Brides",
 "address":" Michigan State University, 204 Second St, Southampton, UK"},
{"type": "Author",
 "guid": "4995bc3735084",
"fullName": "Galen Flanders 2",
 "bookTitle": "The Secret Devils",
 "address":" CalTech, 219 Castro St, Palo Alto, CA"},
{"type": "Author",
 "guid": "4995bc37350a5",
"fullName": "Lonnie Linton 3",
 "bookTitle": "The Armageddon",
 "address":" London University, 214 Elm St, Los Angeles, CA"},
{"type": "Author",
 "guid": "4995bc37350ba",
"fullName": "Melvin Wilkerson 4",
 "bookTitle": "The Space Reign",
 "address":" Harvard, 71 Bloom St, San Francisco, CA"},
{"type": "Author",
 "guid": "4995bc37350d0",
"fullName": "Eleanor Bennett 4",
 "bookTitle": "Runaway of Death",
 "address":" Harvard, 148 Castro St, San Francisco, CA"},
{"type": "Author",
 "guid": "4995bc37350e4",
"fullName": "Fawn Carr 3",
 "bookTitle": "The Warrior of Menace",
 "address":" Springfield University, 202 Oak Ave, Ann Arbor, MI"},
{"type": "Author",
 "guid": "4995bc37350f8",
"fullName": "Linsay Mcmullen 4",
 "bookTitle": "The Doom Masters",
 "address":" Harvard, 116 First St, Los Angeles, CA"},
{"type": "Author",
 "guid": "4995bc3735110",
"fullName": "Amyas Hice 4",
 "bookTitle": "The Space Skull",
 "address":" College University, 6 Fifth Ave, St. Louis, MO"},
{"type": "Author",
 "guid": "4995bc3735123",
"fullName": "Monty Kava 4",
 "bookTitle": "The Day Ice",
 "address":" Santa Clara University, 175 Elm St, Cambridge, MA"},
{"type": "Author",
 "guid": "4995bc3735138",
"fullName": "Brock Young 4",
 "bookTitle": "The Killer Sound",
 "address":" College University, 414 University Loop, Southampton, UK"},
{"type": "Author",
 "guid": "4995bc373514c",
"fullName": "Belinda Alice 3",
 "bookTitle": "The Deadly Memories",
 "address":" UC Santa Cruz, 172 Elm St, Wichita, KS"},
{"type": "Author",
 "guid": "4995bc3735160",
"fullName": "Marlene Agnes 4",
 "bookTitle": "The Death Creature",
 "address":" CalTech, 291 Van Ness Blvd, Ann Arbor, MI"},
{"type": "Author",
 "guid": "4995bc3735174",
"fullName": "Godric Sommer 3",
 "bookTitle": "The Fury Infinity",
 "address":" CalTech, 290 Oak Ave, Southampton, UK"},
{"type": "Author",
 "guid": "4995bc373518d",
"fullName": "Janis Bullard 2",
 "bookTitle": "The Wings",
 "address":" Foothill College, 265 Van Ness Blvd, Southampton, UK"},
{"type": "Author",
 "guid": "4995bc37351a3",
"fullName": "Pamella Mckee 3",
 "bookTitle": "The Children of Madness",
 "address":" London University, 273 Broadway Blvd, London, UK"},
{"type": "Author",
 "guid": "4995bc37351c8",
"fullName": "Prince Demuth 4",
 "bookTitle": "The Riders",
 "address":" Michigan State University, 193 Main St, St. Louis, MO"},
{"type": "Author",
 "guid": "4995bc37351dc",
"fullName": "Kristal Young 2",
 "bookTitle": "The Pirate Nightmares",
 "address":" Foothill College, 354 Castro St, St. Louis, MO"},
{"type": "Author",
 "guid": "4995bc37351ef",
"fullName": "Osmund Pritchard 1",
 "bookTitle": "The Time Suns",
 "address":" University of Southampton, 250 Dana St, Ann Arbor, MI"},
{"type": "Author",
 "guid": "4995bc3735209",
"fullName": "Jazmine Adams 3",
 "bookTitle": "The Day of the Computers",
 "address":" Stanford University, 340 Van Ness Blvd, Cambridge, MA"},
{"type": "Author",
 "guid": "4995bc3735221",
"fullName": "Rose Mays 3",
 "bookTitle": "Meddler of Space",
 "address":" UC Santa Cruz, 409 Bloom St, Los Angeles, CA"},
{"type": "Author",
 "guid": "4995bc373523f",
"fullName": "Rylee Fiddler 2",
 "bookTitle": "Masque of Space",
 "address":" UC Santa Cruz, 413 Fifth Ave, Wichita, KS"},
{"type": "Author",
 "guid": "4995bc3735253",
"fullName": "Meg Coveney 1",
 "bookTitle": "Devils of Fury",
 "address":" MIT, 446 Oak Ave, Southampton, UK"},
{"type": "Author",
 "guid": "4995bc3735267",
"fullName": "Pamelia Mang 4",
 "bookTitle": "The Time of the Pyramid",
 "address":" New York University, 131 Main St, Cupertino, CA"},
{"type": "Author",
 "guid": "4995bc373527b",
"fullName": "Raphael Wilks 4",
 "bookTitle": "Ark of Day",
 "address":" Foothill College, 44 Fifth Ave, Cambridge, MA"},
{"type": "Author",
 "guid": "4995bc373529a",
"fullName": "Matilda Rockwell 4",
 "bookTitle": "The Time Smugglers",
 "address":" Michigan State University, 135 Van Ness Blvd, Ann Arbor, MI"},
{"type": "Author",
 "guid": "4995bc37352ae",
"fullName": "Duke Rosenstiehl 1",
 "bookTitle": "Mist of Death",
 "address":" Santa Clara University, 160 First St, Ann Arbor, MI"},
{"type": "Author",
 "guid": "4995bc37352cf",
"fullName": "Effie Greenwood 2",
 "bookTitle": "The Fury Mist",
 "address":" UC Santa Cruz, 288 Main St, Santa Clara, CA"},
{"type": "Author",
 "guid": "4995bc37352e3",
"fullName": "Kathy Huston 4",
 "bookTitle": "History of Doom",
 "address":" Harvard, 299 Bloom St, Cupertino, CA"},
{"type": "Author",
 "guid": "4995bc37352f6",
"fullName": "Rina Prescott 1",
 "bookTitle": "The Children of Madness",
 "address":" College University, 458 Elm St, Los Angeles, CA"},
{"type": "Author",
 "guid": "4995bc3735319",
"fullName": "Raven Pirl 4",
 "bookTitle": "Smugglers of Night",
 "address":" UC Santa Cruz, 467 Main St, St. Louis, MO"},
{"type": "Author",
 "guid": "4995bc373532c",
"fullName": "Xavier Porter 2",
 "bookTitle": "The Robot of Night",
 "address":" University of Southampton, 52 Lazaneo St, London, UK"},
{"type": "Author",
 "guid": "4995bc373533f",
"fullName": "Lianne Kemble 1",
 "bookTitle": "The Seeds",
 "address":" College University, 482 Castro St, Cupertino, CA"},
{"type": "Author",
 "guid": "4995bc3735353",
"fullName": "Byrne Bruxner 1",
 "bookTitle": "The Long Suns",
 "address":" CalTech, 238 Dana St, Ann Arbor, MI"},
{"type": "Author",
 "guid": "4995bc3735367",
"fullName": "Byrne Bruxner 3",
 "bookTitle": "The Wings",
 "address":" New York University, 331 Van Ness Blvd, Cambridge, MA"},
{"type": "Author",
 "guid": "4995bc373537a",
"fullName": "Fawn Carr 4",
 "bookTitle": "The Laboratory",
 "address":" CalTech, 237 Fifth Ave, London, UK"},
{"type": "Author",
 "guid": "4995bc3735398",
"fullName": "Alyx Hincken 2",
 "bookTitle": "The Revelation",
 "address":" CalTech, 41 First St, Palo Alto, CA"},
{"type": "Author",
 "guid": "4995bc37353aa",
"fullName": "Xerxes Newbern 1",
 "bookTitle": "The Ghost",
 "address":" Stanford University, 424 Van Ness Blvd, Southampton, UK"},
{"type": "Author",
 "guid": "4995bc37353c0",
"fullName": "Alton Saline 3",
 "bookTitle": "The Space of the Leisure",
 "address":" London University, 102 Bloom St, London, UK"},
{"type": "Author",
 "guid": "4995bc37353d3",
"fullName": "Lina Sanborn 1",
 "bookTitle": "The Night Caves",
 "address":" Michigan State University, 79 Second St, Ann Arbor, MI"},
{"type": "Author",
 "guid": "4995bc37353e7",
"fullName": "Laura Herrold 3",
 "bookTitle": "The Runaway Gods",
 "address":" College University, 476 Dana St, Ann Arbor, MI"},
{"type": "Author",
 "guid": "4995bc37353fb",
"fullName": "Maximilian Wolfe 1",
 "bookTitle": "The Doom Meddler",
 "address":" Stanford University, 400 Lazaneo St, Santa Clara, CA"},
{"type": "Author",
 "guid": "4995bc3735418",
"fullName": "Ben Lombardi 3",
 "bookTitle": "The Day",
 "address":" College University, 139 Bloom St, St. Louis, MO"},
{"type": "Author",
 "guid": "4995bc373543d",
"fullName": "Tiger Whitling 4",
 "bookTitle": "The Fury Sea",
 "address":" MIT, 55 Second St, St. Louis, MO"},
{"type": "Author",
 "guid": "4995bc3735450",
"fullName": "Nena Davis 1",
 "bookTitle": "The Operation of Menace",
 "address":" University of Southampton, 2 First St, Cambridge, MA"},
{"type": "Author",
 "guid": "4995bc3735464",
"fullName": "Luther Johnston 3",
 "bookTitle": "The Keeper of Space",
 "address":" Foothill College, 76 University Loop, San Francisco, CA"},
{"type": "Author",
 "guid": "4995bc373547e",
"fullName": "Rikki Graham 3",
 "bookTitle": "The Devil",
 "address":" Foothill College, 322 Castro St, Cupertino, CA"},
{"type": "Author",
 "guid": "4995bc3735493",
"fullName": "Alec Owens 1",
 "bookTitle": "The Hive of Doom",
 "address":" Michigan State University, 448 Bloom St, Wichita, KS"},
{"type": "Author",
 "guid": "4995bc37354b2",
"fullName": "Lettie Roberts 3",
 "bookTitle": "Dead of Time",
 "address":" Stanford University, 152 Second St, Southampton, UK"},
{"type": "Author",
 "guid": "4995bc37354c5",
"fullName": "Amalia Grant 2",
 "bookTitle": "The Talons of Day",
 "address":" University of Southampton, 42 Oak Ave, New York, NY"},
{"type": "Author",
 "guid": "4995bc37354d9",
"fullName": "Brady Smail 2",
 "bookTitle": "The Horror Visitor",
 "address":" University of Southampton, 350 Castro St, Ann Arbor, MI"},
{"type": "Author",
 "guid": "4995bc37354ed",
"fullName": "Lori Magor 2",
 "bookTitle": "The Ultimate Seed",
 "address":" London University, 397 Main St, Cambridge, MA"},
{"type": "Author",
 "guid": "4995bc373550f",
"fullName": "Jewel Mortland 2",
 "bookTitle": "The Horror of the Ragnarok",
 "address":" College University, 46 Elm St, St. Louis, MO"},
{"type": "Author",
 "guid": "4995bc3735538",
"fullName": "Kaitlyn Paul 1",
 "bookTitle": "The Memories",
 "address":" New York University, 489 Lazaneo St, Los Angeles, CA"},
{"type": "Author",
 "guid": "4995bc373554e",
"fullName": "Aletha Lambert 1",
 "bookTitle": "The Horror of the Universe",
 "address":" Stanford University, 425 Van Ness Blvd, Los Angeles, CA"},
{"type": "Author",
 "guid": "4995bc3735563",
"fullName": "Lela Warner 2",
 "bookTitle": "The Menace of the Anvil",
 "address":" CalTech, 430 Fifth Ave, Seattle, WA"},
{"type": "Author",
 "guid": "4995bc3735578",
"fullName": "Brandi Bauerle 4",
 "bookTitle": "The Fear of the Key",
 "address":" College University, 485 Elm St, San Francisco, CA"},
{"type": "Author",
 "guid": "4995bc373558c",
"fullName": "Marva Wise 4",
 "bookTitle": "The Meddler",
 "address":" Stanford University, 388 Second St, Cupertino, CA"},
{"type": "Author",
 "guid": "4995bc373559e",
"fullName": "Seymour Fischer 1",
 "bookTitle": "The Rock",
 "address":" Springfield University, 375 First St, San Francisco, CA"},
{"type": "Author",
 "guid": "4995bc37355b2",
"fullName": "Honor Simmons 3",
 "bookTitle": "The Menace Mist",
 "address":" CalTech, 179 Broadway Blvd, San Francisco, CA"},
{"type": "Author",
 "guid": "4995bc37355c7",
"fullName": "Sarah Chapman 1",
 "bookTitle": "The Day Androids",
 "address":" UC Santa Cruz, 317 Dana St, Cupertino, CA"},
{"type": "Author",
 "guid": "4995bc37355db",
"fullName": "Suzanna Neely 1",
 "bookTitle": "The Secret Devils",
 "address":" CalTech, 201 Main St, New York, NY"},
{"type": "Author",
 "guid": "4995bc37355ee",
"fullName": "Wil Hoffhants 2",
 "bookTitle": "The Empty Machines",
 "address":" UC Santa Cruz, 446 Bloom St, San Francisco, CA"},
{"type": "Author",
 "guid": "4995bc3735602",
"fullName": "Ridley Ewing 4",
 "bookTitle": "The Ghost of Menace",
 "address":" College University, 252 Broadway Blvd, Southampton, UK"},
{"type": "Author",
 "guid": "4995bc3735616",
"fullName": "Rodge Catherina 2",
 "bookTitle": "The Empty Herald",
 "address":" Michigan State University, 367 Van Ness Blvd, Palo Alto, CA"},
{"type": "Author",
 "guid": "4995bc373562a",
"fullName": "Brady Smail 1",
 "bookTitle": "The Day Ice",
 "address":" London University, 426 Elm St, Los Angeles, CA"},
{"type": "Author",
 "guid": "4995bc373563e",
"fullName": "Antony Stern 4",
 "bookTitle": "Reign of Night",
 "address":" University of Southampton, 6 Van Ness Blvd, St. Louis, MO"},
{"type": "Author",
 "guid": "4995bc3735652",
"fullName": "Loreen Buck 1",
 "bookTitle": "The Day Whisper",
 "address":" Michigan State University, 47 Main St, Palo Alto, CA"},
{"type": "Author",
 "guid": "4995bc3735666",
"fullName": "Melita Barkley 1",
 "bookTitle": "The Meddler of Fear",
 "address":" CalTech, 328 Lazaneo St, Cambridge, MA"},
{"type": "Author",
 "guid": "4995bc373567a",
"fullName": "Kerensa Benford 2",
 "bookTitle": "The Menace of the Ghosts",
 "address":" New York University, 411 Elm St, Seattle, WA"},
{"type": "Author",
 "guid": "4995bc373568e",
"fullName": "Prue Putnam 2",
 "bookTitle": "The Doom of the Night",
 "address":" College University, 340 Oak Ave, Southampton, UK"},
{"type": "Author",
 "guid": "4995bc37356aa",
"fullName": "Rosaleen Mench 3",
 "bookTitle": "The Devil",
 "address":" College University, 266 First St, Palo Alto, CA"},
{"type": "Author",
 "guid": "4995bc37356bc",
"fullName": "Washington Rummel 4",
 "bookTitle": "Man of Madness",
 "address":" College University, 54 Castro St, San Francisco, CA"},
{"type": "Author",
 "guid": "4995bc37356d0",
"fullName": "Leyton Jyllian 1",
 "bookTitle": "The Menace of the Computers",
 "address":" Springfield University, 432 First St, St. Louis, MO"},
{"type": "Author",
 "guid": "4995bc37356e4",
"fullName": "Perce Pennington 3",
 "bookTitle": "The Seventh Child",
 "address":" College University, 178 Oak Ave, London, UK"},
{"type": "Author",
 "guid": "4995bc37356f8",
"fullName": "Sabrina Beedell 3",
 "bookTitle": "Runaway of Death",
 "address":" Stanford University, 105 Lazaneo St, Ann Arbor, MI"},
{"type": "Author",
 "guid": "4995bc3735713",
"fullName": "Mckenzie Carden 2",
 "bookTitle": "The Universe",
 "address":" Springfield University, 436 Broadway Blvd, Palo Alto, CA"},
{"type": "Author",
 "guid": "4995bc3735728",
"fullName": "Ginny Finlay 2",
 "bookTitle": "The Doom of the Massacre",
 "address":" Foothill College, 56 Broadway Blvd, Wichita, KS"},
{"type": "Author",
 "guid": "4995bc373573c",
"fullName": "Fox Omara 4",
 "bookTitle": "The Madness Horns",
 "address":" Foothill College, 239 Fifth Ave, London, UK"},
{"type": "Author",
 "guid": "4995bc373574f",
"fullName": "Cherice Blatenberger 2",
 "bookTitle": "The Claws of Fury",
 "address":" Harvard, 235 Van Ness Blvd, Cupertino, CA"},
{"type": "Author",
 "guid": "4995bc3735763",
"fullName": "Harriette Alington 4",
 "bookTitle": "The Whispers",
 "address":" College University, 203 Lazaneo St, Wichita, KS"},
{"type": "Author",
 "guid": "4995bc3735777",
"fullName": "Eldon Ream 2",
 "bookTitle": "The Revelation",
 "address":" University of Southampton, 97 Broadway Blvd, Cambridge, MA"},
{"type": "Author",
 "guid": "4995bc373578b",
"fullName": "Ambrosine Echard 4",
 "bookTitle": "The Android of Madness",
 "address":" University of Southampton, 133 Oak Ave, Los Angeles, CA"},
{"type": "Author",
 "guid": "4995bc373579f",
"fullName": "Bekki Blunt 4",
 "bookTitle": "Evil of Fury",
 "address":" Springfield University, 236 Oak Ave, Los Angeles, CA"},
{"type": "Author",
 "guid": "4995bc37357b2",
"fullName": "Zena Giesler 1",
 "bookTitle": "The Terrible Ghosts",
 "address":" Foothill College, 228 Bloom St, Santa Clara, CA"},
{"type": "Author",
 "guid": "4995bc37357c6",
"fullName": "Lalo Pery 4",
 "bookTitle": "The Fury of the Devils",
 "address":" Michigan State University, 39 Lazaneo St, Cupertino, CA"},
{"type": "Author",
 "guid": "4995bc37357da",
"fullName": "Rowina Bicknell 2",
 "bookTitle": "Evil of Fury",
 "address":" University of Southampton, 471 Second St, Santa Clara, CA"},
{"type": "Author",
 "guid": "4995bc37357ee",
"fullName": "Candis Kanaga 4",
 "bookTitle": "The Operation",
 "address":" UC Santa Cruz, 11 Bloom St, London, UK"},
{"type": "Author",
 "guid": "4995bc3735802",
"fullName": "Jess Richter 4",
 "bookTitle": "The Bride of Fury",
 "address":" MIT, 91 University Loop, Seattle, WA"},
{"type": "Author",
 "guid": "4995bc3735816",
"fullName": "Elfreda Vanleer 1",
 "bookTitle": "The Madness of the Face",
 "address":" College University, 147 Main St, Cupertino, CA"},
{"type": "Author",
 "guid": "4995bc373582a",
"fullName": "Rolo Orner 1",
 "bookTitle": "The Dead Sea",
 "address":" London University, 475 Dana St, St. Louis, MO"},
{"type": "Author",
 "guid": "4995bc373583e",
"fullName": "Lottie Sherlock 1",
 "bookTitle": "The Robbers",
 "address":" Michigan State University, 306 Van Ness Blvd, New York, NY"},
{"type": "Author",
 "guid": "4995bc3735851",
"fullName": "Shyla Clarke 3",
 "bookTitle": "The Attack",
 "address":" College University, 299 Dana St, Cupertino, CA"},
{"type": "Author",
 "guid": "4995bc3735865",
"fullName": "Bethany Veith 3",
 "bookTitle": "The Secret Pyramids",
 "address":" Harvard, 248 Fifth Ave, Wichita, KS"},
{"type": "Author",
 "guid": "4995bc3735879",
"fullName": "Bertha Jesse 3",
 "bookTitle": "The Space of the Pit",
 "address":" Harvard, 364 University Loop, London, UK"},
{"type": "Author",
 "guid": "4995bc373588d",
"fullName": "Marylou Frankenberger 1",
 "bookTitle": "The Time Keys",
 "address":" College University, 322 Elm St, Cambridge, MA"},
{"type": "Author",
 "guid": "4995bc37358a1",
"fullName": "Roderick Powell 3",
 "bookTitle": "The Inferno of Death",
 "address":" University of Southampton, 266 Main St, St. Louis, MO"},
{"type": "Author",
 "guid": "4995bc37358b5",
"fullName": "Maureen Leach 3",
 "bookTitle": "The Unearthly Assassin",
 "address":" Santa Clara University, 170 Bloom St, Cupertino, CA"},
{"type": "Author",
 "guid": "4995bc37358c8",
"fullName": "Jaclyn Stiffey 1",
 "bookTitle": "Dominator of Death",
 "address":" Harvard, 236 Second St, Palo Alto, CA"},
{"type": "Author",
 "guid": "4995bc37358dc",
"fullName": "Lindsey Straub 3",
 "bookTitle": "The Decay of Space",
 "address":" UC Santa Cruz, 155 Castro St, Cambridge, MA"},
{"type": "Author",
 "guid": "4995bc37358f7",
"fullName": "Lyric Richards 1",
 "bookTitle": "The Paradise of Menace",
 "address":" Foothill College, 293 Elm St, Santa Clara, CA"},
{"type": "Author",
 "guid": "4995bc373590b",
"fullName": "Allycia Mackendrick 1",
 "bookTitle": "The Long Suns",
 "address":" Santa Clara University, 449 Castro St, San Francisco, CA"},
{"type": "Author",
 "guid": "4995bc373591f",
"fullName": "James Buzzard 2",
 "bookTitle": "The Death of the Thieves",
 "address":" University of Southampton, 341 Oak Ave, San Francisco, CA"},
{"type": "Author",
 "guid": "4995bc3735933",
"fullName": "Pamelia Mang 2",
 "bookTitle": "The Masque of Doom",
 "address":" Santa Clara University, 411 University Loop, Southampton, UK"},
{"type": "Author",
 "guid": "4995bc3735947",
"fullName": "Chandler Wildman 3",
 "bookTitle": "The Fear Awakening",
 "address":" Santa Clara University, 144 Main St, New York, NY"},
{"type": "Author",
 "guid": "4995bc373595b",
"fullName": "Tyrese Knight 2",
 "bookTitle": "The Messenger of Fear",
 "address":" Michigan State University, 342 Castro St, Ann Arbor, MI"},
{"type": "Author",
 "guid": "4995bc373596e",
"fullName": "Emery Cavalet 2",
 "bookTitle": "City of Menace",
 "address":" CalTech, 477 Fifth Ave, Ann Arbor, MI"},
{"type": "Author",
 "guid": "4995bc3735982",
"fullName": "Jackson Garratt 3",
 "bookTitle": "The Claws of Fear",
 "address":" College University, 25 Dana St, London, UK"},
{"type": "Author",
 "guid": "4995bc3735996",
"fullName": "Gussie Bowman 2",
 "bookTitle": "The Space of the Runaway",
 "address":" Michigan State University, 372 Main St, San Francisco, CA"},
{"type": "Author",
 "guid": "4995bc37359aa",
"fullName": "Kezia Henry 2",
 "bookTitle": "The Time Ark",
 "address":" Stanford University, 199 Main St, San Francisco, CA"},
{"type": "Author",
 "guid": "4995bc37359bd",
"fullName": "Quintin Hays 1",
 "bookTitle": "The Nightmares of Doom",
 "address":" Santa Clara University, 172 University Loop, London, UK"},
{"type": "Author",
 "guid": "4995bc37359d1",
"fullName": "Amalia Grant 2",
 "bookTitle": "The Fang Ghost",
 "address":" University of Southampton, 471 Fifth Ave, Seattle, WA"},
{"type": "Author",
 "guid": "4995bc37359e5",
"fullName": "Jasper Swarner 4",
 "bookTitle": "The Time Armageddon",
 "address":" Foothill College, 65 Lazaneo St, Southampton, UK"},
{"type": "Author",
 "guid": "4995bc37359f9",
"fullName": "Tania Scott 4",
 "bookTitle": "The Secret Monster",
 "address":" Michigan State University, 24 Second St, London, UK"},
{"type": "Author",
 "guid": "4995bc3735a0d",
"fullName": "Jarrod Schreckengost 3",
 "bookTitle": "Dreams of Menace",
 "address":" New York University, 126 Bloom St, Cambridge, MA"},
{"type": "Author",
 "guid": "4995bc3735a21",
"fullName": "Lesley Sanforth 3",
 "bookTitle": "The Jaws of Death",
 "address":" CalTech, 357 Castro St, New York, NY"},
{"type": "Author",
 "guid": "4995bc3735a34",
"fullName": "Roosevelt Stewart 3",
 "bookTitle": "The Fear of the Mist",
 "address":" College University, 6 Main St, Cambridge, MA"},
{"type": "Author",
 "guid": "4995bc3735a48",
"fullName": "Jacaline Mathews 2",
 "bookTitle": "The Day of the Runaway",
 "address":" Santa Clara University, 420 Broadway Blvd, Seattle, WA"},
{"type": "Author",
 "guid": "4995bc3735a5c",
"fullName": "Kaitlyn Paul 3",
 "bookTitle": "The Carnival",
 "address":" Michigan State University, 322 Bloom St, London, UK"},
{"type": "Author",
 "guid": "4995bc3735a70",
"fullName": "Christianne Taggart 1",
 "bookTitle": "The Doomed Bride",
 "address":" Michigan State University, 289 Van Ness Blvd, London, UK"},
{"type": "Author",
 "guid": "4995bc3735a84",
"fullName": "Lawrie Toyley 1",
 "bookTitle": "The Night of the Ice",
 "address":" University of Southampton, 367 University Loop, Palo Alto, CA"},
{"type": "Author",
 "guid": "4995bc3735a98",
"fullName": "Gladwyn Handyside 1",
 "bookTitle": "The Fury Face",
 "address":" Springfield University, 350 University Loop, Wichita, KS"},
{"type": "Author",
 "guid": "4995bc3735ab0",
"fullName": "Raphael Wilks 4",
 "bookTitle": "Myth of Madness",
 "address":" CalTech, 187 Fifth Ave, London, UK"},
{"type": "Author",
 "guid": "4995bc3735ad1",
"fullName": "Matilda Rockwell 3",
 "bookTitle": "The Unearthly Assassin",
 "address":" Stanford University, 84 Fifth Ave, Southampton, UK"},
{"type": "Author",
 "guid": "4995bc3735ae5",
"fullName": "Alan Brown 4",
 "bookTitle": "The Menace of the Visitor",
 "address":" Springfield University, 45 Oak Ave, Santa Clara, CA"},
{"type": "Author",
 "guid": "4995bc3735af8",
"fullName": "Romy Ward 3",
 "bookTitle": "The Space Underworld",
 "address":" Harvard, 387 Lazaneo St, Los Angeles, CA"},
{"type": "Author",
 "guid": "4995bc3735b0c",
"fullName": "Eldreda Flick 2",
 "bookTitle": "The Death of the Dominators",
 "address":" MIT, 453 Oak Ave, Santa Clara, CA"},
{"type": "Author",
 "guid": "4995bc3735b20",
"fullName": "Em Leichter 1",
 "bookTitle": "The Future Web",
 "address":" University of Southampton, 291 First St, Santa Clara, CA"},
{"type": "Author",
 "guid": "4995bc3735b34",
"fullName": "Janella Warner 3",
 "bookTitle": "The Final Claws",
 "address":" Springfield University, 398 Castro St, New York, NY"},
{"type": "Author",
 "guid": "4995bc3735b48",
"fullName": "Chip Haynes 3",
 "bookTitle": "The Menace Thieves",
 "address":" Michigan State University, 490 Broadway Blvd, Seattle, WA"},
{"type": "Author",
 "guid": "4995bc3735b5c",
"fullName": "Lita Rumbaugh 3",
 "bookTitle": "The Child of Space",
 "address":" Springfield University, 444 First St, Ann Arbor, MI"},
{"type": "Author",
 "guid": "4995bc3735b6f",
"fullName": "Zena Giesler 3",
 "bookTitle": "The Deadly Memories",
 "address":" Harvard, 420 Main St, Ann Arbor, MI"},
{"type": "Author",
 "guid": "4995bc3735b83",
"fullName": "Polly Van 3",
 "bookTitle": "Horns of Day",
 "address":" New York University, 57 Dana St, Palo Alto, CA"},
{"type": "Author",
 "guid": "4995bc3735b97",
"fullName": "Ceara Sanner 1",
 "bookTitle": "The Evil Assassin",
 "address":" Michigan State University, 410 Second St, St. Louis, MO"},
{"type": "Author",
 "guid": "4995bc3735bab",
"fullName": "Nola Bell 4",
 "bookTitle": "The Last Alien",
 "address":" Harvard, 261 Oak Ave, Seattle, WA"},
{"type": "Author",
 "guid": "4995bc3735bbf",
"fullName": "Hamilton Heyman 1",
 "bookTitle": "The Minds of Madness",
 "address":" New York University, 352 Fifth Ave, Cambridge, MA"},
{"type": "Author",
 "guid": "4995bc3735bd2",
"fullName": "Neville Mildred 3",
 "bookTitle": "Mutants of Night",
 "address":" CalTech, 115 University Loop, Ann Arbor, MI"},
{"type": "Author",
 "guid": "4995bc3735be6",
"fullName": "Fran Willcox 4",
 "bookTitle": "The Menace of the Spider",
 "address":" London University, 432 Second St, San Francisco, CA"},
{"type": "Author",
 "guid": "4995bc3735bfa",
"fullName": "Matty Cypret 3",
 "bookTitle": "The Day of the Vengeance",
 "address":" College University, 218 Lazaneo St, Cupertino, CA"},
{"type": "Author",
 "guid": "4995bc3735c0e",
"fullName": "Austen Fonblanque 4",
 "bookTitle": "The Space Reign",
 "address":" Foothill College, 142 Bloom St, Cupertino, CA"},
{"type": "Author",
 "guid": "4995bc3735c21",
"fullName": "Felix Mitchell 4",
 "bookTitle": "God of Doom",
 "address":" Foothill College, 45 Castro St, Wichita, KS"},
{"type": "Author",
 "guid": "4995bc3735c35",
"fullName": "Matty Cypret 3",
 "bookTitle": "The Night of the Leisure",
 "address":" London University, 9 Fifth Ave, Seattle, WA"},
{"type": "Author",
 "guid": "4995bc3735c49",
"fullName": "Cassarah Vinsant 4",
 "bookTitle": "The Seed of Night",
 "address":" Michigan State University, 20 Van Ness Blvd, London, UK"},
{"type": "Author",
 "guid": "4995bc3735c5d",
"fullName": "Vernon Perkins 1",
 "bookTitle": "Reign of Night",
 "address":" MIT, 274 Fifth Ave, Cupertino, CA"},
{"type": "Author",
 "guid": "4995bc3735c71",
"fullName": "Shirley Mingle 2",
 "bookTitle": "The Smugglers of Menace",
 "address":" Harvard, 125 Dana St, Cambridge, MA"},
{"type": "Author",
 "guid": "4995bc3735c85",
"fullName": "Kemp Lord 4",
 "bookTitle": "The Horror Angel",
 "address":" London University, 159 Second St, Palo Alto, CA"},
{"type": "Author",
 "guid": "4995bc3735c98",
"fullName": "Kermit Throckmorton 1",
 "bookTitle": "The Tenth Web",
 "address":" London University, 106 Van Ness Blvd, Palo Alto, CA"},
{"type": "Author",
 "guid": "4995bc3735cb3",
"fullName": "Delma Auman 4",
 "bookTitle": "Killer of Night",
 "address":" University of Southampton, 226 Second St, Cambridge, MA"},
{"type": "Author",
 "guid": "4995bc3735cc7",
"fullName": "Marly Friedline 4",
 "bookTitle": "Runaway of Horror",
 "address":" Foothill College, 256 Dana St, San Francisco, CA"},
{"type": "Author",
 "guid": "4995bc3735cdb",
"fullName": "Noah Kline 4",
 "bookTitle": "The Menace of the Ragnarok",
 "address":" Springfield University, 63 Bloom St, St. Louis, MO"},
{"type": "Author",
 "guid": "4995bc3735cef",
"fullName": "Wendy Sayre 1",
 "bookTitle": "History of Doom",
 "address":" New York University, 39 Castro St, Southampton, UK"},
{"type": "Author",
 "guid": "4995bc3735d03",
"fullName": "Izzy Wyatt 4",
 "bookTitle": "The Assassin of Fear",
 "address":" University of Southampton, 73 Bloom St, Los Angeles, CA"},
{"type": "Author",
 "guid": "4995bc3735d17",
"fullName": "Ann Sachse 2",
 "bookTitle": "The Doom Fury",
 "address":" CalTech, 133 Elm St, Ann Arbor, MI"},
{"type": "Author",
 "guid": "4995bc3735d2b",
"fullName": "Ebba Hil 1",
 "bookTitle": "Talons of Madness",
 "address":" Harvard, 54 Broadway Blvd, Santa Clara, CA"},
{"type": "Author",
 "guid": "4995bc3735d3f",
"fullName": "Alexina Compton 2",
 "bookTitle": "War of Time",
 "address":" University of Southampton, 44 Main St, St. Louis, MO"},
{"type": "Author",
 "guid": "4995bc3735d53",
"fullName": "Sybella Henley 2",
 "bookTitle": "The Illusion Revelation",
 "address":" UC Santa Cruz, 107 Van Ness Blvd, Santa Clara, CA"},
{"type": "Author",
 "guid": "4995bc3735d66",
"fullName": "Tylar Monahan 1",
 "bookTitle": "Image of Space",
 "address":" London University, 126 Second St, Los Angeles, CA"},
{"type": "Author",
 "guid": "4995bc3735d7a",
"fullName": " 4",
 "bookTitle": "The False Masque",
 "address":" MIT, 318 Oak Ave, Wichita, KS"},
{"type": "Author",
 "guid": "4995bc3735d91",
"fullName": "Lorrin Reichard 2",
 "bookTitle": "The Fear of the Androids",
 "address":" Springfield University, 467 Main St, Cambridge, MA"},
{"type": "Author",
 "guid": "4995bc3735da5",
"fullName": "Harriette Alington 1",
 "bookTitle": "The Future of Time",
 "address":" Stanford University, 5 Castro St, St. Louis, MO"},
{"type": "Author",
 "guid": "4995bc3735db9",
"fullName": "Dominic Groah 3",
 "bookTitle": "Smuggler of Day",
 "address":" UC Santa Cruz, 246 Fifth Ave, St. Louis, MO"},
{"type": "Author",
 "guid": "4995bc3735dcc",
"fullName": "Everard Richardson 1",
 "bookTitle": "The Revelation",
 "address":" Springfield University, 261 Dana St, Seattle, WA"},
{"type": "Author",
 "guid": "4995bc3735de0",
"fullName": "Gladwyn Handyside 2",
 "bookTitle": "The Secret Monster",
 "address":" UC Santa Cruz, 94 Main St, Wichita, KS"},
{"type": "Author",
 "guid": "4995bc3735df4",
"fullName": "Kyla Moore 3",
 "bookTitle": "The Horror Robot",
 "address":" Santa Clara University, 456 Castro St, London, UK"},
{"type": "Author",
 "guid": "4995bc3735e08",
"fullName": "Latonya Roche 4",
 "bookTitle": "The Machines Spider",
 "address":" Michigan State University, 429 Elm St, Palo Alto, CA"},
{"type": "Author",
 "guid": "4995bc3735e1c",
"fullName": "Chanel Boyd 2",
 "bookTitle": "The Horror of the Minds",
 "address":" London University, 482 Elm St, Southampton, UK"},
{"type": "Author",
 "guid": "4995bc3735e2f",
"fullName": "Delice Kimmons 4",
 "bookTitle": "The Death of the Memory",
 "address":" MIT, 257 Broadway Blvd, Palo Alto, CA"},
{"type": "Author",
 "guid": "4995bc3735e43",
"fullName": "Cornelius Metzer 2",
 "bookTitle": "City of Menace",
 "address":" Springfield University, 353 Bloom St, Wichita, KS"},
{"type": "Author",
 "guid": "4995bc3735e57",
"fullName": "Meg Coveney 2",
 "bookTitle": "The Assassin of Fear",
 "address":" College University, 348 Lazaneo St, Los Angeles, CA"},
{"type": "Author",
 "guid": "4995bc3735e6a",
"fullName": "Roxanna Loewentsein 2",
 "bookTitle": "The Riders of Death",
 "address":" CalTech, 125 Bloom St, St. Louis, MO"},
{"type": "Author",
 "guid": "4995bc3735e7e",
"fullName": "Emmett Agg 2",
 "bookTitle": "The Last Mists",
 "address":" UC Santa Cruz, 210 Oak Ave, Los Angeles, CA"},
{"type": "Author",
 "guid": "4995bc3735e99",
"fullName": "Junior Christman 4",
 "bookTitle": "Ragnarok of Space",
 "address":" Foothill College, 264 Second St, Palo Alto, CA"},
{"type": "Author",
 "guid": "4995bc3735eae",
"fullName": "Wendy Sayre 2",
 "bookTitle": "The Madness Myth",
 "address":" University of Southampton, 398 Bloom St, Santa Clara, CA"},
{"type": "Author",
 "guid": "4995bc3735ec0",
"fullName": "Amandine Catlay 1",
 "bookTitle": "The Night Inferno",
 "address":" MIT, 364 Oak Ave, Santa Clara, CA"},
{"type": "Author",
 "guid": "4995bc3735ed8",
"fullName": "Gordon Zadovsky 4",
 "bookTitle": "The Key of Death",
 "address":" Foothill College, 68 Fifth Ave, Los Angeles, CA"},
{"type": "Author",
 "guid": "4995bc3735eec",
"fullName": "Earline Judge 1",
 "bookTitle": "The Doom of the Claws",
 "address":" CalTech, 462 Bloom St, London, UK"},
{"type": "Author",
 "guid": "4995bc3735f00",
"fullName": "Chryssa Robertson 3",
 "bookTitle": "The Fear of Day",
 "address":" New York University, 323 First St, San Francisco, CA"},
{"type": "Author",
 "guid": "4995bc3735f14",
"fullName": "Tim Beck 4",
 "bookTitle": "The Fear of the Arc",
 "address":" New York University, 287 Lazaneo St, Seattle, WA"},
{"type": "Author",
 "guid": "4995bc3735f28",
"fullName": "Sarah Chapman 4",
 "bookTitle": "Pyramids of Menace",
 "address":" University of Southampton, 289 Lazaneo St, Los Angeles, CA"},
{"type": "Author",
 "guid": "4995bc3735f3b",
"fullName": "Serrena Canham 2",
 "bookTitle": "The Ultimate Seed",
 "address":" Springfield University, 268 Castro St, Seattle, WA"},
{"type": "Author",
 "guid": "4995bc3735f4f",
"fullName": "Pierce Conrad 4",
 "bookTitle": "Future of Night",
 "address":" New York University, 44 Elm St, Southampton, UK"},
{"type": "Author",
 "guid": "4995bc3735f63",
"fullName": "Sheard Alcocke 1",
 "bookTitle": "The Claws of Day",
 "address":" Springfield University, 23 Van Ness Blvd, Wichita, KS"},
{"type": "Author",
 "guid": "4995bc3735f77",
"fullName": "Prue Putnam 1",
 "bookTitle": "Robbers of Doom",
 "address":" College University, 244 Main St, San Francisco, CA"},
{"type": "Author",
 "guid": "4995bc3735f8a",
"fullName": "Kezia Henry 3",
 "bookTitle": "Creature of Space",
 "address":" Stanford University, 440 Lazaneo St, New York, NY"},
{"type": "Author",
 "guid": "4995bc3735f9f",
"fullName": "Chrystal Prevatt 4",
 "bookTitle": "The Day of the Mirror",
 "address":" New York University, 135 Main St, Cupertino, CA"},
{"type": "Author",
 "guid": "4995bc3735fb3",
"fullName": "Kim Oppenheimer 2",
 "bookTitle": "The Killers of Time",
 "address":" London University, 226 Oak Ave, Cambridge, MA"},
{"type": "Author",
 "guid": "4995bc3735fc8",
"fullName": "Adolph Hayhurst 2",
 "bookTitle": "Messenger of Fear",
 "address":" MIT, 298 Fifth Ave, Ann Arbor, MI"},
{"type": "Author",
 "guid": "4995bc3735fdb",
"fullName": "Luann Garneis 1",
 "bookTitle": "The Masque",
 "address":" Santa Clara University, 109 Van Ness Blvd, Cupertino, CA"},
{"type": "Author",
 "guid": "4995bc3735ff0",
"fullName": "Hazel Holts 4",
 "bookTitle": "The Pirate Memory",
 "address":" Santa Clara University, 241 Dana St, London, UK"},
{"type": "Author",
 "guid": "4995bc3736005",
"fullName": "Brittney Lowe 1",
 "bookTitle": "The Time Smugglers",
 "address":" Springfield University, 216 University Loop, Palo Alto, CA"},
{"type": "Author",
 "guid": "4995bc3736367",
"fullName": "Missie Marjorie 2",
 "bookTitle": "The Computer Time",
 "address":" Michigan State University, 306 Elm St, New York, NY"},
{"type": "Author",
 "guid": "4995bc3736381",
"fullName": "Blondie Rogers 3",
 "bookTitle": "The Empty Runaway",
 "address":" UC Santa Cruz, 336 Castro St, Seattle, WA"},
{"type": "Author",
 "guid": "4995bc3736396",
"fullName": "Kyla Moore 2",
 "bookTitle": "The First Cave",
 "address":" Michigan State University, 269 University Loop, Santa Clara, CA"},
{"type": "Author",
 "guid": "4995bc37363ab",
"fullName": "Kaylynn Herndon 4",
 "bookTitle": "The Time of the Seeds",
 "address":" Stanford University, 201 Bloom St, Seattle, WA"},
{"type": "Author",
 "guid": "4995bc37363bf",
"fullName": "Jancis Busk 1",
 "bookTitle": "The Ultimate Resurrection",
 "address":" Harvard, 314 Main St, London, UK"},
{"type": "Author",
 "guid": "4995bc37363e0",
"fullName": "Linnie Fraser 3",
 "bookTitle": "The God",
 "address":" University of Southampton, 302 Fifth Ave, San Francisco, CA"},
{"type": "Author",
 "guid": "4995bc37363f5",
"fullName": "Tyrell Riggle 1",
 "bookTitle": "Visitors of Time",
 "address":" University of Southampton, 258 First St, Southampton, UK"},
{"type": "Author",
 "guid": "4995bc373640a",
"fullName": "Luanne Mens 3",
 "bookTitle": "The Day Sea",
 "address":" Stanford University, 422 Fifth Ave, San Francisco, CA"},
{"type": "Author",
 "guid": "4995bc373641e",
"fullName": "Everitt Thompson 3",
 "bookTitle": "The Enemies",
 "address":" University of Southampton, 57 Fifth Ave, Cambridge, MA"},
{"type": "Author",
 "guid": "4995bc3736432",
"fullName": "Robynne Unk 4",
 "bookTitle": "The Fear of the Devil",
 "address":" Springfield University, 326 Castro St, Cambridge, MA"},
{"type": "Author",
 "guid": "4995bc373644e",
"fullName": "Lake Elder 1",
 "bookTitle": "Spiders of Death",
 "address":" University of Southampton, 237 Fifth Ave, Santa Clara, CA"},
{"type": "Author",
 "guid": "4995bc3736465",
"fullName": "Gale Cross 4",
 "bookTitle": "The Mutants",
 "address":" Foothill College, 323 Broadway Blvd, St. Louis, MO"},
{"type": "Author",
 "guid": "4995bc3736479",
"fullName": "Amy Mcelroy 4",
 "bookTitle": "The Caves of Madness",
 "address":" MIT, 255 Fifth Ave, San Francisco, CA"},
{"type": "Author",
 "guid": "4995bc373648d",
"fullName": "Lowell Holtzer 3",
 "bookTitle": "The Spider",
 "address":" College University, 370 Oak Ave, Cambridge, MA"},
{"type": "Author",
 "guid": "4995bc37364a1",
"fullName": "Zola Haines 4",
 "bookTitle": "The Fear of the Mist",
 "address":" New York University, 286 Fifth Ave, Palo Alto, CA"},
{"type": "Author",
 "guid": "4995bc37364b4",
"fullName": "Pearce Swartzbaugh 4",
 "bookTitle": "The Menace Killers",
 "address":" Stanford University, 34 Dana St, New York, NY"},
{"type": "Author",
 "guid": "4995bc37364cc",
"fullName": "Lorayne Losey 1",
 "bookTitle": "The Messenger",
 "address":" Springfield University, 70 University Loop, Cupertino, CA"},
{"type": "Author",
 "guid": "4995bc37364e0",
"fullName": "Perdita Casteel 3",
 "bookTitle": "Illusion of Doom",
 "address":" College University, 103 First St, Los Angeles, CA"},
{"type": "Author",
 "guid": "4995bc37364f4",
"fullName": "Jules Leech 4",
 "bookTitle": "The Dominator",
 "address":" Foothill College, 405 Broadway Blvd, St. Louis, MO"},
{"type": "Author",
 "guid": "4995bc3736508",
"fullName": "Reagan Ironmonger 1",
 "bookTitle": "Hive of Menace",
 "address":" London University, 447 University Loop, Los Angeles, CA"},
{"type": "Author",
 "guid": "4995bc373651c",
"fullName": "Bevis Powers 3",
 "bookTitle": "The Sun of Death",
 "address":" Foothill College, 447 Main St, Santa Clara, CA"},
{"type": "Author",
 "guid": "4995bc3736530",
"fullName": "Kip Mosser 4",
 "bookTitle": "The Door of Space",
 "address":" Stanford University, 294 University Loop, London, UK"},
{"type": "Author",
 "guid": "4995bc3736543",
"fullName": "Jilly Poorbaugh 3",
 "bookTitle": "The Doom of the Battlefield",
 "address":" Harvard, 360 Elm St, Los Angeles, CA"},
{"type": "Author",
 "guid": "4995bc3736557",
"fullName": "Chip Haynes 1",
 "bookTitle": "The Unearthly Androids",
 "address":" MIT, 483 Elm St, Cupertino, CA"},
{"type": "Author",
 "guid": "4995bc373656b",
"fullName": "Daffodil Harper 4",
 "bookTitle": "The War of Fury",
 "address":" Michigan State University, 483 Second St, Palo Alto, CA"},
{"type": "Author",
 "guid": "4995bc373657f",
"fullName": "Dorthy Wilson 2",
 "bookTitle": "The Mind Crime",
 "address":" Michigan State University, 412 Broadway Blvd, Seattle, WA"},
{"type": "Author",
 "guid": "4995bc3736593",
"fullName": "Ridley Ewing 3",
 "bookTitle": "The Night of the Universe",
 "address":" New York University, 287 First St, Wichita, KS"},
{"type": "Author",
 "guid": "4995bc37365a7",
"fullName": "Brennan Whishaw 1",
 "bookTitle": "The War of Fury",
 "address":" University of Southampton, 499 First St, Los Angeles, CA"},
{"type": "Author",
 "guid": "4995bc37365bb",
"fullName": "Hale Alliman 1",
 "bookTitle": "Devils of Fury",
 "address":" Foothill College, 265 Main St, Southampton, UK"},
{"type": "Author",
 "guid": "4995bc37365d6",
"fullName": "Petronella Eckhardstein 1",
 "bookTitle": "The Mind Massacre",
 "address":" MIT, 78 Castro St, St. Louis, MO"},
{"type": "Author",
 "guid": "4995bc37365ea",
"fullName": "Maurice Bagley 4",
 "bookTitle": "The Decay Claws",
 "address":" Foothill College, 159 Fifth Ave, Ann Arbor, MI"},
{"type": "Author",
 "guid": "4995bc37365fe",
"fullName": "Shaun Drabble 3",
 "bookTitle": "The Fang Secret",
 "address":" Michigan State University, 79 Broadway Blvd, Wichita, KS"},
{"type": "Author",
 "guid": "4995bc3736612",
"fullName": "Brady Smail 3",
 "bookTitle": "Sound of Time",
 "address":" UC Santa Cruz, 456 Elm St, Los Angeles, CA"},
{"type": "Author",
 "guid": "4995bc3736626",
"fullName": "Juliet Shaw 3",
 "bookTitle": "The Ghost Universe",
 "address":" New York University, 379 Castro St, Los Angeles, CA"},
{"type": "Author",
 "guid": "4995bc373663a",
"fullName": "Lorayne Losey 3",
 "bookTitle": "The Jaws of Death",
 "address":" Michigan State University, 398 University Loop, Ann Arbor, MI"},
{"type": "Author",
 "guid": "4995bc373664e",
"fullName": "Lisha Enderly 4",
 "bookTitle": "The Web",
 "address":" Santa Clara University, 86 Broadway Blvd, Ann Arbor, MI"},
{"type": "Author",
 "guid": "4995bc3736662",
"fullName": "Becky Davis 1",
 "bookTitle": "The Doom of the Claws",
 "address":" London University, 284 Van Ness Blvd, New York, NY"},
{"type": "Author",
 "guid": "4995bc3736676",
"fullName": "Leyton Jyllian 3",
 "bookTitle": "Operation of Night",
 "address":" MIT, 137 Dana St, Wichita, KS"},
{"type": "Author",
 "guid": "4995bc373668a",
"fullName": "Alice Yates 1",
 "bookTitle": "The Madness of the Spiders",
 "address":" Stanford University, 484 First St, London, UK"},
{"type": "Author",
 "guid": "4995bc373669d",
"fullName": "Lemoine James 1",
 "bookTitle": "The Deadly Mutants",
 "address":" Springfield University, 359 Oak Ave, Cambridge, MA"},
{"type": "Author",
 "guid": "4995bc37366b1",
"fullName": "Baylee Raybould 1",
 "bookTitle": "Curse of Fear",
 "address":" Michigan State University, 154 Lazaneo St, London, UK"},
{"type": "Author",
 "guid": "4995bc37366c5",
"fullName": "Ford Steiner 2",
 "bookTitle": "The Masque of Doom",
 "address":" Michigan State University, 390 Second St, Southampton, UK"},
{"type": "Author",
 "guid": "4995bc37366d9",
"fullName": "Laureen Moon 1",
 "bookTitle": "The Fear Memories",
 "address":" Stanford University, 372 Castro St, Ann Arbor, MI"},
{"type": "Author",
 "guid": "4995bc37366ed",
"fullName": "Colin Hair 4",
 "bookTitle": "The Time of the Secret",
 "address":" Springfield University, 464 Bloom St, Cupertino, CA"},
{"type": "Author",
 "guid": "4995bc3736701",
"fullName": "Haven Crissman 1",
 "bookTitle": "The Armageddon Laboratory",
 "address":" College University, 141 Lazaneo St, Palo Alto, CA"},
{"type": "Author",
 "guid": "4995bc373671a",
"fullName": "Ludmilla Candles 2",
 "bookTitle": "The Pyramids",
 "address":" CalTech, 303 Bloom St, Southampton, UK"},
{"type": "Author",
 "guid": "4995bc373672f",
"fullName": "Alberta Fowler 1",
 "bookTitle": "The Day of the Door",
 "address":" London University, 271 University Loop, Cambridge, MA"},
{"type": "Author",
 "guid": "4995bc3736744",
"fullName": "Lowell Holtzer 3",
 "bookTitle": "The Night of the Bandits",
 "address":" University of Southampton, 173 Second St, Seattle, WA"},
{"type": "Author",
 "guid": "4995bc3736758",
"fullName": "Lesley Sanforth 4",
 "bookTitle": "Robbers of Doom",
 "address":" University of Southampton, 129 Van Ness Blvd, Seattle, WA"},
{"type": "Author",
 "guid": "4995bc373676c",
"fullName": "Vic Close 1",
 "bookTitle": "The Bride of Horror",
 "address":" MIT, 390 Main St, Santa Clara, CA"},
{"type": "Author",
 "guid": "4995bc3736780",
"fullName": "Lorraine Butler 2",
 "bookTitle": "The Time of the Seeds",
 "address":" New York University, 13 Oak Ave, Wichita, KS"},
{"type": "Author",
 "guid": "4995bc3736794",
"fullName": "Cedar Garry 3",
 "bookTitle": "The Madness Myth",
 "address":" CalTech, 45 Fifth Ave, New York, NY"},
{"type": "Author",
 "guid": "4995bc37367a8",
"fullName": "Sinclair Dale 2",
 "bookTitle": "The Night of the Dominator",
 "address":" New York University, 493 Bloom St, Cambridge, MA"},
{"type": "Author",
 "guid": "4995bc37367bc",
"fullName": "Goldie Pickering 1",
 "bookTitle": "Menace of Day",
 "address":" University of Southampton, 216 First St, St. Louis, MO"},
{"type": "Author",
 "guid": "4995bc37367cf",
"fullName": "Kaleigh Brooks 2",
 "bookTitle": "The Doom Fury",
 "address":" UC Santa Cruz, 189 Bloom St, London, UK"},
{"type": "Author",
 "guid": "4995bc37367e3",
"fullName": "Rain Joyce 3",
 "bookTitle": "The Day",
 "address":" New York University, 499 Dana St, Palo Alto, CA"},
{"type": "Author",
 "guid": "4995bc37367f7",
"fullName": "Merton Fillmore 3",
 "bookTitle": "Dreams of Menace",
 "address":" Santa Clara University, 98 Bloom St, Cambridge, MA"},
{"type": "Author",
 "guid": "4995bc373680b",
"fullName": "Bekki Blunt 4",
 "bookTitle": "The Whispers of Day",
 "address":" UC Santa Cruz, 112 Lazaneo St, Ann Arbor, MI"},
{"type": "Author",
 "guid": "4995bc373681f",
"fullName": "Godric Sommer 1",
 "bookTitle": "Men of Night",
 "address":" College University, 88 Lazaneo St, New York, NY"},
{"type": "Author",
 "guid": "4995bc3736832",
"fullName": "Thorburn Smith 4",
 "bookTitle": "Door of Horror",
 "address":" CalTech, 401 Elm St, Santa Clara, CA"},
{"type": "Author",
 "guid": "4995bc3736846",
"fullName": "Frankie Giesen 3",
 "bookTitle": "The Jaws",
 "address":" Harvard, 117 Van Ness Blvd, London, UK"},
{"type": "Author",
 "guid": "4995bc373685a",
"fullName": "Brock Young 3",
 "bookTitle": "The Killer Key",
 "address":" New York University, 225 Van Ness Blvd, Santa Clara, CA"},
{"type": "Author",
 "guid": "4995bc373686e",
"fullName": "Pleasance Mcloskey 1",
 "bookTitle": "Sound of Fear",
 "address":" College University, 331 Fifth Ave, Cupertino, CA"},
{"type": "Author",
 "guid": "4995bc3736881",
"fullName": "Colin Hair 3",
 "bookTitle": "The Faceless Universe",
 "address":" Harvard, 185 Broadway Blvd, New York, NY"},
{"type": "Author",
 "guid": "4995bc3736895",
"fullName": "Jo Brindle 2",
 "bookTitle": "The Day Ice",
 "address":" UC Santa Cruz, 278 Fifth Ave, Palo Alto, CA"},
{"type": "Author",
 "guid": "4995bc37368a9",
"fullName": "Loreen Buck 2",
 "bookTitle": "Underworld of Space",
 "address":" Harvard, 385 Main St, London, UK"},
{"type": "Author",
 "guid": "4995bc37368bd",
"fullName": "Darrell Reade 4",
 "bookTitle": "The Madness Seeds",
 "address":" UC Santa Cruz, 423 Dana St, Cambridge, MA"},
{"type": "Author",
 "guid": "4995bc37368d0",
"fullName": "Delice Kimmons 2",
 "bookTitle": "The Fear of the Key",
 "address":" MIT, 161 First St, New York, NY"},
{"type": "Author",
 "guid": "4995bc37368e4",
"fullName": "Bettye Bode 1",
 "bookTitle": "The Thieves of Time",
 "address":" College University, 207 Main St, Southampton, UK"},
{"type": "Author",
 "guid": "4995bc37368f8",
"fullName": "Dillon Rowe 3",
 "bookTitle": "The Mind Wings",
 "address":" Foothill College, 374 Broadway Blvd, Cambridge, MA"},
{"type": "Author",
 "guid": "4995bc373690c",
"fullName": "Bennett Little 4",
 "bookTitle": "The Day Nemesis",
 "address":" MIT, 129 Lazaneo St, Los Angeles, CA"},
{"type": "Author",
 "guid": "4995bc373691f",
"fullName": "Bevis Powers 4",
 "bookTitle": "The Horror of Madness",
 "address":" Santa Clara University, 68 Oak Ave, St. Louis, MO"},
{"type": "Author",
 "guid": "4995bc3736933",
"fullName": "Perce Pennington 3",
 "bookTitle": "The Massacre",
 "address":" New York University, 432 Bloom St, Los Angeles, CA"},
{"type": "Author",
 "guid": "4995bc3736947",
"fullName": "America Thigpen 4",
 "bookTitle": "The Long Suns",
 "address":" University of Southampton, 217 University Loop, Cupertino, CA"},
{"type": "Author",
 "guid": "4995bc373695b",
"fullName": "Lyndsea Roberts 4",
 "bookTitle": "The Keeper",
 "address":" UC Santa Cruz, 153 Fifth Ave, Los Angeles, CA"},
{"type": "Author",
 "guid": "4995bc373696f",
"fullName": "Loreen Buck 1",
 "bookTitle": "The Space of the Devil",
 "address":" CalTech, 65 University Loop, Santa Clara, CA"},
{"type": "Author",
 "guid": "4995bc3736983",
"fullName": "Unique Whitten 1",
 "bookTitle": "Infinity of Night",
 "address":" University of Southampton, 238 Dana St, Ann Arbor, MI"},
{"type": "Author",
 "guid": "4995bc3736997",
"fullName": "Bernadine Raub 4",
 "bookTitle": "The Menace of the Ark",
 "address":" London University, 369 Dana St, London, UK"},
{"type": "Author",
 "guid": "4995bc37369b2",
"fullName": "Gabe Milliron 4",
 "bookTitle": "The Machines",
 "address":" UC Santa Cruz, 331 University Loop, London, UK"},
{"type": "Author",
 "guid": "4995bc37369c6",
"fullName": "Ronda Higgens 2",
 "bookTitle": "Spiders of Death",
 "address":" Foothill College, 496 Castro St, Cupertino, CA"},
{"type": "Author",
 "guid": "4995bc37369da",
"fullName": "Oscar Camp 2",
 "bookTitle": "The Day of the Computers",
 "address":" Santa Clara University, 292 Fifth Ave, New York, NY"},
{"type": "Author",
 "guid": "4995bc37369ed",
"fullName": "Hudson Cable 4",
 "bookTitle": "The Fury of the Angel",
 "address":" Stanford University, 116 Oak Ave, San Francisco, CA"},
{"type": "Author",
 "guid": "4995bc3736a01",
"fullName": "Willis Costello 4",
 "bookTitle": "The Ghosts of Day",
 "address":" Foothill College, 370 Castro St, Cupertino, CA"},
{"type": "Author",
 "guid": "4995bc3736a15",
"fullName": "Douglas Bennett 3",
 "bookTitle": "The Universe",
 "address":" New York University, 74 University Loop, Seattle, WA"},
{"type": "Author",
 "guid": "4995bc3736a29",
"fullName": "Chonsie Conkle 1",
 "bookTitle": "The Seas of Fear",
 "address":" Santa Clara University, 479 Main St, London, UK"},
{"type": "Author",
 "guid": "4995bc3736a3c",
"fullName": "Lalage Schmidt 3",
 "bookTitle": "The Fear of the Awakening",
 "address":" CalTech, 415 Elm St, St. Louis, MO"},
{"type": "Author",
 "guid": "4995bc3736a50",
"fullName": "Patton Kooser 1",
 "bookTitle": "The Madness Nightmares",
 "address":" Stanford University, 38 University Loop, Los Angeles, CA"},
{"type": "Author",
 "guid": "4995bc3736a64",
"fullName": "Mya Eckert 3",
 "bookTitle": "The Tenth Web",
 "address":" Harvard, 89 Dana St, New York, NY"},
{"type": "Author",
 "guid": "4995bc3736a78",
"fullName": "Kayleen Trout 2",
 "bookTitle": "The Riders",
 "address":" London University, 355 Second St, Wichita, KS"},
{"type": "Author",
 "guid": "4995bc3736a8c",
"fullName": "Tawnie Vorrasi 2",
 "bookTitle": "The Runaway Gods",
 "address":" College University, 183 Elm St, Southampton, UK"},
{"type": "Author",
 "guid": "4995bc3736aa0",
"fullName": "Marian Gearhart 4",
 "bookTitle": "The Pyramids of Death",
 "address":" UC Santa Cruz, 176 First St, Cambridge, MA"},
{"type": "Author",
 "guid": "4995bc3736ab4",
"fullName": "York Merryman 2",
 "bookTitle": "The Horns",
 "address":" New York University, 154 Castro St, Ann Arbor, MI"},
{"type": "Author",
 "guid": "4995bc3736ac8",
"fullName": "Dene Fair 1",
 "bookTitle": "The Menace Pyramid",
 "address":" MIT, 226 First St, Santa Clara, CA"},
{"type": "Author",
 "guid": "4995bc3736adb",
"fullName": "Konnor Wells 4",
 "bookTitle": "Planet of Death",
 "address":" UC Santa Cruz, 94 Fifth Ave, Ann Arbor, MI"},
{"type": "Author",
 "guid": "4995bc3736aef",
"fullName": "Chanel Boyd 4",
 "bookTitle": "The Horror Alien",
 "address":" CalTech, 125 Broadway Blvd, Cupertino, CA"},
{"type": "Author",
 "guid": "4995bc3736b03",
"fullName": "Crispian Nickolson 2",
 "bookTitle": "The Impossible Armageddon",
 "address":" CalTech, 67 Oak Ave, Los Angeles, CA"},
{"type": "Author",
 "guid": "4995bc3736b1d",
"fullName": "Elouise Langston 3",
 "bookTitle": "The Doom of the Night",
 "address":" New York University, 48 University Loop, Ann Arbor, MI"},
{"type": "Author",
 "guid": "4995bc3736b33",
"fullName": "Eliza Ropes 4",
 "bookTitle": "The Mirror",
 "address":" CalTech, 158 University Loop, Southampton, UK"},
{"type": "Author",
 "guid": "4995bc3736b46",
"fullName": "Raynard Peters 3",
 "bookTitle": "Child of Fear",
 "address":" MIT, 385 Lazaneo St, Seattle, WA"},
{"type": "Author",
 "guid": "4995bc3736b5a",
"fullName": "Kaylynn Herndon 4",
 "bookTitle": "The Reign",
 "address":" Stanford University, 237 Van Ness Blvd, Cambridge, MA"},
{"type": "Author",
 "guid": "4995bc3736b6e",
"fullName": "Priscilla Dean 4",
 "bookTitle": "The Space of the Horn",
 "address":" CalTech, 317 First St, St. Louis, MO"},
{"type": "Author",
 "guid": "4995bc3736b81",
"fullName": "Leighton Wickes 3",
 "bookTitle": "Pyramids of Menace",
 "address":" Springfield University, 313 Oak Ave, Los Angeles, CA"},
{"type": "Author",
 "guid": "4995bc3736b9c",
"fullName": "Anneka Gist 3",
 "bookTitle": "The God",
 "address":" Foothill College, 6 University Loop, Los Angeles, CA"},
{"type": "Author",
 "guid": "4995bc3736bb0",
"fullName": "Roseanne Rowley 2",
 "bookTitle": "The Horror of the Ice",
 "address":" Harvard, 253 First St, Seattle, WA"},
{"type": "Author",
 "guid": "4995bc3736bc4",
"fullName": "Brandi Bauerle 1",
 "bookTitle": "The Children of Madness",
 "address":" Foothill College, 497 First St, Santa Clara, CA"},
{"type": "Author",
 "guid": "4995bc3736bd8",
"fullName": "Kaitlyn Paul 3",
 "bookTitle": "The Mind Massacre",
 "address":" College University, 490 Lazaneo St, St. Louis, MO"},
{"type": "Author",
 "guid": "4995bc3736beb",
"fullName": "Silvester Mcfall 3",
 "bookTitle": "The Fear Child",
 "address":" CalTech, 348 Broadway Blvd, St. Louis, MO"},
{"type": "Author",
 "guid": "4995bc3736bff",
"fullName": "Woodrow Fleming 2",
 "bookTitle": "The Empty Fear",
 "address":" Springfield University, 340 First St, Los Angeles, CA"},
{"type": "Author",
 "guid": "4995bc3736c13",
"fullName": "Wynonna Erskine 3",
 "bookTitle": "Cave of Night",
 "address":" UC Santa Cruz, 37 Castro St, Ann Arbor, MI"},
{"type": "Author",
 "guid": "4995bc3736c27",
"fullName": "Lawrie Toyley 2",
 "bookTitle": "The Horror City",
 "address":" Stanford University, 172 University Loop, Southampton, UK"},
{"type": "Author",
 "guid": "4995bc3736c3b",
"fullName": "Breana Bastion 3",
 "bookTitle": "The Doomed Whisper",
 "address":" London University, 157 Lazaneo St, Cupertino, CA"},
{"type": "Author",
 "guid": "4995bc3736c4e",
"fullName": "Delice Kimmons 2",
 "bookTitle": "The Space of the Leisure",
 "address":" Stanford University, 308 Bloom St, Seattle, WA"},
{"type": "Author",
 "guid": "4995bc3736c62",
"fullName": "Sybella Henley 2",
 "bookTitle": "The Armageddon",
 "address":" University of Southampton, 314 Lazaneo St, New York, NY"},
{"type": "Author",
 "guid": "4995bc3736c76",
"fullName": "Sebastian Stone 2",
 "bookTitle": "The Stone",
 "address":" Springfield University, 348 Second St, St. Louis, MO"},
{"type": "Author",
 "guid": "4995bc3736c8a",
"fullName": "Perdita Casteel 2",
 "bookTitle": "The Space Alien",
 "address":" Stanford University, 38 Castro St, Santa Clara, CA"},
{"type": "Author",
 "guid": "4995bc3736c9e",
"fullName": "Lyndsea Roberts 4",
 "bookTitle": "The Fear Paradise",
 "address":" New York University, 433 Second St, Ann Arbor, MI"},
{"type": "Author",
 "guid": "4995bc3736cb2",
"fullName": "Reanna Meyers 2",
 "bookTitle": "Image of Menace",
 "address":" MIT, 452 Second St, San Francisco, CA"},
{"type": "Author",
 "guid": "4995bc3736cc6",
"fullName": "Paul Parrish 4",
 "bookTitle": "The Death Angels",
 "address":" MIT, 468 Castro St, Ann Arbor, MI"},
{"type": "Author",
 "guid": "4995bc3736cda",
"fullName": "Eldred West 2",
 "bookTitle": "The Time of the Mirror",
 "address":" College University, 420 Bloom St, Los Angeles, CA"},
{"type": "Author",
 "guid": "4995bc3736ced",
"fullName": "Tawnie Vorrasi 2",
 "bookTitle": "The Madness of the Horror",
 "address":" Michigan State University, 289 Lazaneo St, Cupertino, CA"},
{"type": "Author",
 "guid": "4995bc3736d01",
"fullName": "Vic Close 4",
 "bookTitle": "The Death of the Pyramid",
 "address":" New York University, 229 Main St, Southampton, UK"},
{"type": "Author",
 "guid": "4995bc3736d15",
"fullName": "Shana Owen 4",
 "bookTitle": "The Killer Fury",
 "address":" London University, 438 First St, Southampton, UK"},
{"type": "Author",
 "guid": "4995bc3736d29",
"fullName": "Lissa Tillson 1",
 "bookTitle": "The Fear Killers",
 "address":" Harvard, 100 Castro St, San Francisco, CA"},
{"type": "Author",
 "guid": "4995bc3736d3d",
"fullName": "Gabriel Cherry 1",
 "bookTitle": "The Reign of Madness",
 "address":" Stanford University, 319 Elm St, San Francisco, CA"},
{"type": "Author",
 "guid": "4995bc3736d51",
"fullName": "Willis Costello 4",
 "bookTitle": "The Horror Angel",
 "address":" UC Santa Cruz, 411 Van Ness Blvd, Ann Arbor, MI"},
{"type": "Author",
 "guid": "4995bc3736d65",
"fullName": "Seward Romanoff 2",
 "bookTitle": "The Day Monster",
 "address":" University of Southampton, 371 University Loop, Wichita, KS"},
{"type": "Author",
 "guid": "4995bc3736d80",
"fullName": "Cornelius Metzer 3",
 "bookTitle": "Hive of Menace",
 "address":" CalTech, 99 Second St, Seattle, WA"},
{"type": "Author",
 "guid": "4995bc3736d94",
"fullName": "Pansy Summy 4",
 "bookTitle": "The Day Thieves",
 "address":" New York University, 419 University Loop, London, UK"},
{"type": "Author",
 "guid": "4995bc3736da8",
"fullName": "Jaymes Cox 3",
 "bookTitle": "The Fear of the Minds",
 "address":" MIT, 54 First St, Palo Alto, CA"},
{"type": "Author",
 "guid": "4995bc3736dbc",
"fullName": "Pansy Summy 4",
 "bookTitle": "The Runaway Gods",
 "address":" Foothill College, 85 Elm St, Palo Alto, CA"},
{"type": "Author",
 "guid": "4995bc3736dcf",
"fullName": "August Feufer 2",
 "bookTitle": "God of Doom",
 "address":" Michigan State University, 237 Second St, Cambridge, MA"},
{"type": "Author",
 "guid": "4995bc3736de3",
"fullName": "Raphael Wilks 4",
 "bookTitle": "The Creature",
 "address":" College University, 46 Main St, Los Angeles, CA"},
{"type": "Author",
 "guid": "4995bc3736df7",
"fullName": "Colin Hair 4",
 "bookTitle": "The Horror Child",
 "address":" Foothill College, 244 Castro St, Seattle, WA"},
{"type": "Author",
 "guid": "4995bc3736e0a",
"fullName": "Colten Stange 2",
 "bookTitle": "Dreams of Menace",
 "address":" CalTech, 212 Fifth Ave, San Francisco, CA"},
{"type": "Author",
 "guid": "4995bc3736e1e",
"fullName": "Chonsie Conkle 3",
 "bookTitle": "The Menace Carnival",
 "address":" CalTech, 470 Broadway Blvd, Southampton, UK"},
{"type": "Author",
 "guid": "4995bc3736e32",
"fullName": "Kaleigh Brooks 4",
 "bookTitle": "The Fury Massacre",
 "address":" New York University, 361 Lazaneo St, Cupertino, CA"},
{"type": "Author",
 "guid": "4995bc3736e46",
"fullName": "Kaye Harding 3",
 "bookTitle": "The Doom of the Battlefield",
 "address":" Harvard, 246 Castro St, San Francisco, CA"},
{"type": "Author",
 "guid": "4995bc3736e59",
"fullName": "Kendal Ritter 1",
 "bookTitle": "The Whisper Faces",
 "address":" Foothill College, 80 Fifth Ave, San Francisco, CA"},
{"type": "Author",
 "guid": "4995bc3736e6d",
"fullName": "Eleanor Bennett 4",
 "bookTitle": "The Angels of Madness",
 "address":" CalTech, 263 Oak Ave, San Francisco, CA"},
{"type": "Author",
 "guid": "4995bc3736e81",
"fullName": "Lindsey Straub 3",
 "bookTitle": "The Doom of the Jaws",
 "address":" MIT, 146 Van Ness Blvd, St. Louis, MO"},
{"type": "Author",
 "guid": "4995bc3736e95",
"fullName": "Fawn Carr 1",
 "bookTitle": "Door of Space",
 "address":" Stanford University, 22 Oak Ave, Los Angeles, CA"},
{"type": "Author",
 "guid": "4995bc3736ea9",
"fullName": "Deshawn Pyle 3",
 "bookTitle": "The Secret",
 "address":" MIT, 180 University Loop, Wichita, KS"},
{"type": "Author",
 "guid": "4995bc3736ebd",
"fullName": "Virgee Mcdonald 1",
 "bookTitle": "The Space Mists",
 "address":" MIT, 288 Lazaneo St, San Francisco, CA"},
{"type": "Author",
 "guid": "4995bc3736ed0",
"fullName": "Tex Koster 4",
 "bookTitle": "The Time Ambassador",
 "address":" Santa Clara University, 372 Main St, Ann Arbor, MI"},
{"type": "Author",
 "guid": "4995bc3736ee4",
"fullName": "Sorrel Dugmore 2",
 "bookTitle": "The Robber",
 "address":" Stanford University, 390 Oak Ave, Santa Clara, CA"},
{"type": "Author",
 "guid": "4995bc3736ef8",
"fullName": "Beverly Harrold 2",
 "bookTitle": "The Planet of Doom",
 "address":" Harvard, 289 Fifth Ave, London, UK"},
{"type": "Author",
 "guid": "4995bc3736f0c",
"fullName": "Webster Jelliman 4",
 "bookTitle": "The Madness Masters",
 "address":" Foothill College, 316 First St, London, UK"},
{"type": "Author",
 "guid": "4995bc3736f24",
"fullName": "Tracee Martin 4",
 "bookTitle": "The Minds of Fury",
 "address":" UC Santa Cruz, 272 First St, Wichita, KS"},
{"type": "Author",
 "guid": "4995bc3736f3b",
"fullName": "Delice Kimmons 2",
 "bookTitle": "The Warrior of Day",
 "address":" University of Southampton, 364 University Loop, London, UK"},
{"type": "Author",
 "guid": "4995bc3736f5c",
"fullName": "Godric Sommer 1",
 "bookTitle": "Robots of Menace",
 "address":" MIT, 251 University Loop, Palo Alto, CA"},
{"type": "Author",
 "guid": "4995bc3736f70",
"fullName": "Tatianna Johns 3",
 "bookTitle": "The Death of the Riders",
 "address":" Santa Clara University, 416 Oak Ave, St. Louis, MO"},
{"type": "Author",
 "guid": "4995bc3736f8c",
"fullName": "Herbert Durstine 1",
 "bookTitle": "The Space of the Devil",
 "address":" New York University, 384 Fifth Ave, Seattle, WA"},
{"type": "Author",
 "guid": "4995bc3736fa0",
"fullName": "Myron Rhodes 4",
 "bookTitle": "The Devil",
 "address":" London University, 8 Castro St, Los Angeles, CA"},
{"type": "Author",
 "guid": "4995bc3736fb3",
"fullName": "Hank Hughes 2",
 "bookTitle": "The Machine of Doom",
 "address":" Springfield University, 42 First St, London, UK"},
{"type": "Author",
 "guid": "4995bc3736fc7",
"fullName": "Fox Omara 2",
 "bookTitle": "The Night of the Leisure",
 "address":" CalTech, 468 Fifth Ave, Wichita, KS"},
{"type": "Author",
 "guid": "4995bc3736fdb",
"fullName": "Dyan Bratton 1",
 "bookTitle": "The Child of Space",
 "address":" Springfield University, 463 Castro St, St. Louis, MO"},
{"type": "Author",
 "guid": "4995bc3736fef",
"fullName": "Eleanor Bennett 4",
 "bookTitle": "Machine of Night",
 "address":" Springfield University, 301 Second St, London, UK"},
{"type": "Author",
 "guid": "4995bc3737002",
"fullName": "Seward Romanoff 3",
 "bookTitle": "The Secret Pit",
 "address":" College University, 353 University Loop, Wichita, KS"},
{"type": "Author",
 "guid": "4995bc3737016",
"fullName": "Erick Sulyard 1",
 "bookTitle": "Whispers of Day",
 "address":" Harvard, 223 Castro St, Wichita, KS"},
{"type": "Author",
 "guid": "4995bc373702a",
"fullName": "Godric Sommer 3",
 "bookTitle": "The Menace Mist",
 "address":" London University, 260 Van Ness Blvd, Cupertino, CA"},
{"type": "Author",
 "guid": "4995bc373703d",
"fullName": " 2",
 "bookTitle": "The Horror Robot",
 "address":" New York University, 499 Castro St, Palo Alto, CA"},
{"type": "Author",
 "guid": "4995bc3737055",
"fullName": "Porsche Gilman 3",
 "bookTitle": "The Time Suns",
 "address":" CalTech, 336 First St, San Francisco, CA"},
{"type": "Author",
 "guid": "4995bc3737069",
"fullName": "Phineas Poehl 1",
 "bookTitle": "Ark of Day",
 "address":" London University, 162 Bloom St, Wichita, KS"},
{"type": "Author",
 "guid": "4995bc373707d",
"fullName": "Tylar Monahan 3",
 "bookTitle": "The Menace of the Robbers",
 "address":" Springfield University, 498 Broadway Blvd, Seattle, WA"},
{"type": "Author",
 "guid": "4995bc3737091",
"fullName": "Harvey Wardle 3",
 "bookTitle": "Mutants of Night",
 "address":" MIT, 58 Bloom St, Ann Arbor, MI"},
{"type": "Author",
 "guid": "4995bc37370a5",
"fullName": "Thea Sullivan 1",
 "bookTitle": "The Night of the Dominator",
 "address":" Santa Clara University, 443 Lazaneo St, San Francisco, CA"},
{"type": "Author",
 "guid": "4995bc37370b9",
"fullName": "Brandie Tue 2",
 "bookTitle": "The Fury Secret",
 "address":" CalTech, 130 Lazaneo St, London, UK"},
{"type": "Author",
 "guid": "4995bc37370cd",
"fullName": "Tessa Pullman 3",
 "bookTitle": "The Menace of the Pit",
 "address":" CalTech, 393 Oak Ave, San Francisco, CA"},
{"type": "Author",
 "guid": "4995bc37370e0",
"fullName": "Freeman Marcotte 4",
 "bookTitle": "The Jaws of Night",
 "address":" Harvard, 288 Second St, Seattle, WA"},
{"type": "Author",
 "guid": "4995bc37370f4",
"fullName": "Tex Koster 2",
 "bookTitle": "The Madness Attack",
 "address":" College University, 233 Fifth Ave, Ann Arbor, MI"},
{"type": "Author",
 "guid": "4995bc3737108",
"fullName": "Barret Lalty 2",
 "bookTitle": "The Unearthly Assassin",
 "address":" London University, 399 Elm St, Seattle, WA"},
{"type": "Author",
 "guid": "4995bc373711c",
"fullName": "Timotha Weeks 4",
 "bookTitle": "The Death Face",
 "address":" Stanford University, 302 Lazaneo St, Cambridge, MA"},
{"type": "Author",
 "guid": "4995bc3737130",
"fullName": "Tybalt Hahn 2",
 "bookTitle": "Masque of Space",
 "address":" New York University, 108 Elm St, Los Angeles, CA"},
{"type": "Author",
 "guid": "4995bc3737144",
"fullName": "Dewayne Patton 3",
 "bookTitle": "The Armageddon",
 "address":" Harvard, 83 Bloom St, Seattle, WA"},
{"type": "Author",
 "guid": "4995bc3737158",
"fullName": "Tommie Keilbach 4",
 "bookTitle": "The First Cave",
 "address":" College University, 124 First St, Ann Arbor, MI"},
{"type": "Author",
 "guid": "4995bc3737196",
"fullName": "Boyce Baughman 3",
 "bookTitle": "The Stone of Madness",
 "address":" Stanford University, 366 Second St, London, UK"},
{"type": "Author",
 "guid": "4995bc37371ac",
"fullName": "Godric Sommer 3",
 "bookTitle": "Killer of Night",
 "address":" London University, 489 Oak Ave, Southampton, UK"},
{"type": "Author",
 "guid": "4995bc37371c1",
"fullName": "Kenelm Tomco 2",
 "bookTitle": "The Fury of the Master",
 "address":" UC Santa Cruz, 142 Bloom St, London, UK"},
{"type": "Author",
 "guid": "4995bc37371d4",
"fullName": "Wendell Osteen 3",
 "bookTitle": "The Fear Awakening",
 "address":" New York University, 419 First St, Santa Clara, CA"},
{"type": "Author",
 "guid": "4995bc37371eb",
"fullName": "Antwan Biery 4",
 "bookTitle": "The Day of the Invasion",
 "address":" Santa Clara University, 445 Fifth Ave, Cupertino, CA"},
{"type": "Author",
 "guid": "4995bc37371ff",
"fullName": "Stacy Moffat 4",
 "bookTitle": "Door of Horror",
 "address":" College University, 282 Oak Ave, Ann Arbor, MI"},
{"type": "Author",
 "guid": "4995bc3737213",
"fullName": "Alyx Hincken 3",
 "bookTitle": "The Day Nemesis",
 "address":" CalTech, 235 University Loop, St. Louis, MO"},
{"type": "Author",
 "guid": "4995bc3737227",
"fullName": "Silvester Mcfall 1",
 "bookTitle": "The Monster",
 "address":" Springfield University, 86 Lazaneo St, Southampton, UK"},
{"type": "Author",
 "guid": "4995bc373723a",
"fullName": "Janella Warner 2",
 "bookTitle": "The Madness Man",
 "address":" Stanford University, 96 Dana St, Ann Arbor, MI"},
{"type": "Author",
 "guid": "4995bc373724e",
"fullName": "Braeden Seidner 2",
 "bookTitle": "The Menace Pit",
 "address":" Santa Clara University, 154 Bloom St, New York, NY"},
{"type": "Author",
 "guid": "4995bc3737263",
"fullName": "Cyrus Hatfield 2",
 "bookTitle": "The Night Nightmares",
 "address":" Michigan State University, 46 Van Ness Blvd, St. Louis, MO"},
{"type": "Author",
 "guid": "4995bc3737277",
"fullName": "Carly Reiss 4",
 "bookTitle": "The Spiders of Fear",
 "address":" CalTech, 420 Dana St, San Francisco, CA"},
{"type": "Author",
 "guid": "4995bc373728b",
"fullName": "Anselm Swift 4",
 "bookTitle": "The Final Time",
 "address":" Stanford University, 203 Main St, Seattle, WA"},
{"type": "Author",
 "guid": "4995bc373729f",
"fullName": "Dallas Hawker 2",
 "bookTitle": "The Day Galaxy",
 "address":" CalTech, 195 First St, San Francisco, CA"},
{"type": "Author",
 "guid": "4995bc37372b3",
"fullName": "Horatio Hutton 1",
 "bookTitle": "The Time Ambassador",
 "address":" Springfield University, 183 Castro St, Palo Alto, CA"},
{"type": "Author",
 "guid": "4995bc37372c7",
"fullName": "Trev Hallauer 1",
 "bookTitle": "The Final Time",
 "address":" New York University, 51 Broadway Blvd, Los Angeles, CA"},
{"type": "Author",
 "guid": "4995bc37372db",
"fullName": "Sharyn Quinn 4",
 "bookTitle": "The Reign of Day",
 "address":" Foothill College, 493 Lazaneo St, Palo Alto, CA"},
{"type": "Author",
 "guid": "4995bc37372ee",
"fullName": "Raphael Wilks 1",
 "bookTitle": "The Masque of Death",
 "address":" New York University, 96 Oak Ave, Los Angeles, CA"}];

