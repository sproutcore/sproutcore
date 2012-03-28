// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

var store, storeKey, json, hash, hash2;

module("SC.Store#createRecord", {
  setup: function() {
    
    MyRecordType = SC.Record.extend({
      string: SC.Record.attr(String, { defaultValue: "Untitled" }),
      number: SC.Record.attr(Number, { defaultValue: 5 }),
      bool: SC.Record.attr(Boolean, { defaultValue: YES }),
      array: SC.Record.attr(Array, { defaultValue: [1, 2] }),
      funcDef: SC.Record.attr(Array, { defaultValue: function() { return [1, 3]} })
    });

    SC.RunLoop.begin();

    store = SC.Store.create();
    
    json = {
      string: "string",
      number: 23,
      bool:   YES
    };
    
    storeKey = SC.Store.generateStoreKey();

    store.writeDataHash(storeKey, json, SC.Record.READY_CLEAN);

    SC.RunLoop.end();
  }
});

test("create a record", function() {
  var sk;
  var rec = SC.Record.create();
  hash = {
    guid: "1234abcd",
    string: "abcd",
    number: 1,
    bool:   NO,
    array:  [],
    funcDef: [1, 2]
    };
  hash2 = {
    string: "abcd",
    number: 1,
    bool:   NO,
    array:  [],
    funcDef: [1, 2]
  };

  rec = store.createRecord(SC.Record, hash);
  ok(rec, "a record was created");
  sk=store.storeKeyFor(SC.Record, rec.get('id'));
  equals(store.readDataHash(sk), hash, "data hashes are equivalent");
  equals(rec.get('id'), "1234abcd", "guids are the same");

  rec = store.createRecord(SC.Record, hash2, "priKey");
  ok(rec, "a record with a custom id was created");
  sk=store.storeKeyFor(SC.Record, "priKey");
  equals(store.readDataHash(sk), hash2, "data hashes are equivalent");
  equals(rec.get('id'), "priKey", "guids are the same");
  
  equals(store.changelog.length, 2, "The changelog has the following number of entries:");
  
  
});

test("Creating an empty (null) record should make the hash available", function() {
  
  store.createRecord(MyRecordType, null, 'guid8');
  var storeKey = store.storeKeyFor(MyRecordType, 'guid8');
  
  ok(store.readDataHash(storeKey), 'data hash should not be empty/undefined');
  
});

test("Initializing default values", function() {
    
    var rec1, rec2, sk1, sk2;
    
    //create 2 records
    rec1 = store.createRecord(MyRecordType, null, 'test1');
    rec2 = store.createRecord(MyRecordType, null, 'test2');
    
    //get storKeys
    sk1 = store.storeKeyFor(MyRecordType, rec1.get('id'));
    sk2 = store.storeKeyFor(MyRecordType, rec2.get('id'));
    
    ok(sk1, "a first record with default values was created");
    
    equals(store.readDataHash(sk1)['string'], "Untitled", "the default value for 'string' was initialized");
    equals(store.readDataHash(sk1)['number'], 5, "the default value for 'number' was initialized");
    equals(store.readDataHash(sk1)['bool'], YES, "the default value for 'bool' was initialized");
    same(store.readDataHash(sk1)['array'], [1, 2], "the default value for 'array' was initialized");
    same(store.readDataHash(sk1)['funcDef'], [1, 3], "the default value for 'funcDef' was initialized");
    
    
    ok(sk2, "a second record with default values was created");
    
    rec2.get('array').push(3);
    rec2.get('funcDef').push(2);
    
    same(store.readDataHash(sk2)['array'], [1, 2, 3], "the array for 'array' was updated");
    same(store.readDataHash(sk2)['funcDef'], [1, 3, 2], "the array for 'funcDef' was updated");
    
    ok(store.readDataHash(sk2)['array'] !== store.readDataHash(sk1)['array'], "the default value for 'array' is a copy not a reference");
    ok(store.readDataHash(sk2)['funcDef'] !== store.readDataHash(sk1)['funcDef'], "the default value for 'funcDef' is a copy not a reference");
    
});