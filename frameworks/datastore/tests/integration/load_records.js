// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Apple, Inc. and contributors.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

var MyApp = {};



MyApp = SC.Object.create();
MyApp.store = SC.Store.create();
MyApp.persistentStore = SC.PersistentStore.create();
MyApp.Author = SC.Record.extend();
MyApp.persistentStore.addInMemoryStore(MyApp.store); //.set('parentStore', MyApp.persistentStore);

module("SC.Store", {
  
    setup: function() {
    }
  }

);

test("Basic Requirements", function() {
  ok(MyApp, "MyApp is defined") ;
  ok(MyApp.store, "MyApp.store is defined") ;
  ok(MyApp.persistentStore, "MyApp.persistentStore is defined") ;
  ok(MyApp.Author, "MyApp.Author is defined") ;
  ok(json0_9, "json0_9 is defined") ;
  ok(json10_19, "json10_19 is defined") ;
  ok(json20_29, "json20_29 is defined") ;
  ok(json30_39, "json30_39 is defined") ;
  ok(json40_49, "json40_49 is defined") ;
});



test("set parentStore property on MyApp.store to MyApp.peristentStore", function() {
  var ret = MyApp.store.set('parentStore', MyApp.persistentStore);
  ok(MyApp.persistentStore === MyApp.store.get('parentStore'), "MyApp.persistentStore should === MyApp.store.get('parentStore')" ) ;
});

test("MyApp.store sees that parentStore is persistent", function() {
  equals(YES, MyApp.store.get('parentStore').get('isPersistent')) ;
});

test("MyApp.peristentStore sees its inMemoryStore is MyApp.store", function() {
  ok(MyApp.persistentStore.get('inMemoryStore') === MyApp.store, ".MyApp.persistentStore.get('inMemoryStore') should === MyApp.store" ) ;
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
    {"type": "Author", "guid": "4995bc653acfe","fullName": "Billy Joe", "bookTitle": "The Fear of the Thieves", "address":" Michigan State University, 285 Lazaneo St, Ann Arbor, MI"},
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
  ok(record.get('status') === RECORD_LOADING, "record.get('status') should === RECORD_LOADING");
  
  MyApp.persistentStore.simulateResponseFromServer('123');
  
  ok(record.get('guid') === '123', "record.get('guid') should === '123'");
  ok(record.get('status') === RECORD_LOADED, "record.get('status') should === RECORD_LOADED");
  ok(record.get('fullName') === 'Mr. From Server', "record.get('fullName') should === 'Mr. From Server'");
  ok(record._storeKey === 50, "record._storeKey should equal 50");
  ok(MyApp.store.revisions[50] === 0, "revision should equal 0");

});

test("record: materialize guid='4995bc653ae78', test set() on record. then commit changes.", function() {
  var record = MyApp.store.find('4995bc653ae78', MyApp.Author);
  ok(typeof record === 'object', "record returned is of type 'object'");
  ok(record.get('fullName') == "Erskine Aultman 2", "record.get('fullName') should equal 'Erskine Aultman 2'");

  record.set('fullName', 'Bob Jones');
  ok(record.get('fullName') == "Bob Jones", "record.set('fullName', 'Bob Jones'), fullName should equal 'Bob Jones'");

});



/*
  
  //load updated dataHash through loadRecord. see updated revisions. Check for no changeset.
  //load updated dataHash array through loadRecord. see updated revisions. Check for no changeset.
  
  //materialize record given one guid. check materialized record for type, datahash, etc.
  //rematerialize record given one guid. check that it is the same record.
  
  //materialize record that does not exist. See it retireved from the server.
  update record using set. commands. see revisions. commit. see changes.
  update record using set. commands. discard. see no changes.
  destroy record. see it be gone? then commit. see it passed to server.
  destroy record. then discard. see it still be there. should be reverted.
  create new record. set params. save to server using commit. see new guid come in.
  create chained store. chained store is in the parentStore's array. chainedStore has parentStore set.
  get record and update it. see that parentStore and chainedStore have different instances of dataHash. commit it. check if they are the same chained to parent.
  get record and update it. see that parentStore and chainedStore have different instances of dataHash. discard it. check if they are the same. parent to chained.
  get record in parentStore and cainedStore. update chainedStore record.. see that parentStore and chainedStore have different instances of dataHash AND record.  commit it. check if they are the same chained to parent.
  get record in parentStore and cainedStore. update chainedStore record.. see that parentStore and chainedStore have different instances of dataHash AND record.  discard it. ccheck if they are the same. parent to chained.
  create new record as child of chainedStore. See that it does not exist in parentStore. commit. See it in parent store. See it passed to server.
  create new record as child of chainedStore. See that it does not exist in parentStore. discard. See it NOT parent store or chained store. See it NOT passed to the server.
  
  
  create new record in parentStore. commit. See it in childStore.
  create new record in parentStore. discard. see it NOT in childStore.
  
  create new chainedStore in chainedStore.
  create new record in child chainedStore. commit. See it in chainedStore but not in parentStore. commit chainedStore. See it in parent. commit parentStore, see in server.
  create new record in child chainedStore. discard. See it not chainedStore but not in parentStore. 
  
  
  
  




*/


/* Now, materialize records, make sure that they are the correct type. */
/* get one record, edit record it, commit. */
/* get 10 records, edit record them, commit. */


