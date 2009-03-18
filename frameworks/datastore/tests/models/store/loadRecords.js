// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Apple, Inc. and contributors.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test json0_9 json10_19 json20_29 json30_39 json40_49 StandardTestSetup MyApp */

module("SC.Store#loadRecords", StandardTestSetup);

test("call loadRecords(json0_9, MyApp.Author), should return array with 10 unique storeKeys 0-9", function() {
  var ret = MyApp.store.loadRecords(json0_9, MyApp.Author);
  equals(ret.length, 10, 'length of returned array');
  for(var i=0; i<10; i++) {
    equals(MyApp.store.dataHashes[ret[i]], json0_9[i], 'dataHash for storeKey %@ should match json'.fmt(ret[i]));
  }
  ok(MyApp.store.changes.length === 0, "no changes should have been recorded."); 
  ok(MyApp.store.persistentChanges.created.length === 0, "no persistentChanges.created should have been recorded."); 
});

test("call loadRecords(json10_19, MyApp.Author, 'guid'), should return array with 10 unique storeKeys 10-19", function() {
  var ret = MyApp.store.loadRecords(json10_19, MyApp.Author, 'guid');
  equals(ret.length, 10, 'length of returned array');
  for(var i=0; i<10; i++) {
    equals(MyApp.store.dataHashes[ret[i]], json10_19[i], 'dataHash for storeKey %@ should match json'.fmt(ret[i]));
  }
  ok(MyApp.store.changes.length === 0, "no changes should have been recorded."); 
  ok(MyApp.store.persistentChanges.created.length === 0, "no persistentChanges.created should have been recorded."); 
});

test("call loadRecords(json20_29, [MyApp.Author,...,MyApp.Author]), should return array with 10 unique storeKeys 20-29", function() {
  var recordTypes = [MyApp.Author, MyApp.Author, MyApp.Author, MyApp.Author, MyApp.Author, MyApp.Author, MyApp.Author, MyApp.Author, MyApp.Author, MyApp.Author];
  var ret = MyApp.store.loadRecords(json20_29, recordTypes);
  equals(ret.length, 10, 'length of returned array');
  for(var i=0; i<10; i++) {
    equals(MyApp.store.dataHashes[ret[i]], json20_29[i], 'dataHash for storeKey %@ should match json'.fmt(ret[i]));
  }

  ok(MyApp.store.changes.length === 0, "no changes should have been recorded."); 
  ok(MyApp.store.persistentChanges.created.length === 0, "no persistentChanges.created should have been recorded."); 
});

test("call loadRecords(json30_39, [MyApp.Author,...,MyApp.Author], 'guid'), should return array with 10 unique storeKeys 30-39", function() {
  var recordTypes = [MyApp.Author, MyApp.Author, MyApp.Author, MyApp.Author, MyApp.Author, MyApp.Author, MyApp.Author, MyApp.Author, MyApp.Author, MyApp.Author];
  var ret = MyApp.store.loadRecords(json30_39, recordTypes, 'guid');
  equals(ret.length, 10, 'length of returned array');
  for(var i=0; i<10; i++) {
    equals(MyApp.store.dataHashes[ret[i]], json30_39[i], 'dataHash for storeKey %@ should match json'.fmt(ret[i]));
  }

  ok(MyApp.store.changes.length === 0, "no changes should have been recorded."); 
  ok(MyApp.store.persistentChanges.created.length === 0, "no persistentChanges.created should have been recorded."); 
});

test("call loadRecords(json40_49), should return array with 10 unique storeKeys 40-49", function() {
  var ret = MyApp.store.loadRecords(json40_49);
  equals(ret.length, 10, 'length of returned array');
  for(var i=0; i<10; i++) {
    equals(MyApp.store.dataHashes[ret[i]], json40_49[i], 'dataHash for storeKey %@ should match json'.fmt(ret[i]));
  }

  ok(MyApp.store.changes.length === 0, "no changes should have been recorded."); 
  ok(MyApp.store.persistentChanges.created.length === 0, "no persistentChanges.created should have been recorded."); 
});

// ..........................................................
// TEST INTERNAL STRUCTURES
// 
module("SC.Store#loadRecords - internal structures", {
  setup: function() {
    // setup standard environment
    StandardTestSetup.setup().loadRecords();
  }
});

test("check recKeyTypeMap for correctness. Expect 40 MyApp.Author types and 10 SC.Record types.", function() {
  var ret = MyApp.store.recKeyTypeMap, i, loc=0;
  
  // first 40 keys should have author type
  for(i in ret) {
    if (++loc <= 40) {
      equals(ret[i], MyApp.Author, "storeKey %@ should be of type MyApp.Author".fmt(i));
    } else {
      equals(ret[i], SC.Record, "storeKey %@ should be of type SC.Record".fmt(i));
    }
  }
  
  // should only have 50 keys
  equals(loc, 50, 'should have 50 keys in store');

  equals(MyApp.store.changes.length, 0, "no changes should have been recorded."); 
  equals(MyApp.store.persistentChanges.created.length, 0, "no persistentChanges.created should have been recorded."); 
});

test("check dataTypeMap for correctness. Expect 40 MyApp.Author types and 10 SC.Record types.", function() {
  var map = MyApp.store.dataTypeMap;
  
  var type1 = map[SC.guidFor(MyApp.Author)];
  var type2 = map[SC.guidFor(SC.Record)];
  
  ok(type1, "MyApp.Author is defined in the dataTypeMap.");
  ok(type2, "SC.Record is defined in the dataTypeMap.");
  
  equals(type1.length, 40, 'MyApp.Author should have 40 keys mapped');
  equals(type2.length, 10, 'SC.Record should have 10 keys mapped');
});

test("check revisions for correctness. All revisions should be 0", function() {
  var rev = MyApp.store.revisions, i, len = rev.length;
    
  for(i=0;i<len;i++) {
    ok(rev[i]===0 || rev[i]===undefined, 'revision for storeKey %@ is %@ - should be 0 or undefined'.fmt(i, rev[i]));
  }
});

test("simulate update from server.", function() {
  var rev = MyApp.store.revisions;
  var hash = MyApp.store.dataHashes;

  var json = [
    {"type": "Author", "guid": "4995bc653acad","fullName": "Billy Bob", "bookTitle": "The Death Doors", "address":" UC Santa Cruz, 35 First St, Wichita, KS"},
    {"type": "Author", "guid": "4995bc653acfe","fullName": "Billy Joe", "bookTitle": "The Fear of the Thieves", "address":" Michigan State University, 285 Lazaneo St, Ann Arbor, MI"}
  ];
  
  var ret = MyApp.store.loadRecords(json, MyApp.Author, 'guid'), storeKey;

  storeKey = ret[0]; 
  equals(SC.typeOf(storeKey), SC.T_NUMBER, 'storeKey is a number') ;
  ok(hash[storeKey].fullName == "Billy Bob" , "dataHash at storeKey[0] has new fullName set to 'Billy Bob'");
  ok(rev[storeKey] === 1, "revision at storeKey has revision 1");

  storeKey = ret[1]; 
  equals(SC.typeOf(storeKey), SC.T_NUMBER, 'storeKey is a number') ;
  ok(hash[storeKey].fullName == "Billy Joe" , "dataHash at storeKey 0 has new fullName set to 'Billy Joe'");
  ok(rev[storeKey] === 1, "revision at storeKey 1 has revision 1");
  
  ok(MyApp.store.changes.length === 0, "no changes should have been recorded."); 
  ok(MyApp.store.persistentChanges.updated.length === 0, "no persistentChanges.updated should have been recorded."); 
});
