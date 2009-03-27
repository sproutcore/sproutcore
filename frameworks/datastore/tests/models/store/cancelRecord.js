// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Apple, Inc. and contributors.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

var store, storeKey, json;
module("SC.Store#cancelRecord", {
  setup: function() {
    
    store = SC.Store.create();
    
    json = {
      string: "string",
      number: 23,
      bool:   YES
    };
    
    storeKey = SC.Store.generateStoreKey();

    store.writeDataHash(storeKey, json, SC.Record.READY_CLEAN);
    store.commitChanges();
  }
});

test("create a record", function() {
  var sk;
  var rec = SC.Record.create();;
  hash = {
    guid: "1234abcd",
    string: "abcd",
    number: 1,
    bool:   NO
    };
  hash2 = {
    string: "abcd",
    number: 1,
    bool:   NO
  };
//  debugger
  rec = store.createRecord(SC.Record, hash);
  ok(rec, "a record was created");
  sk=store.storeKeyFor(SC.Record, rec.id());
  equals(store.readDataHash(sk), hash, "data hashes are equivalent");
  equals(rec.id(), "1234abcd", "guids are the same");
//  store.changelog.contains(sk); 
  rec = store.createRecord(SC.Record, hash2, "priKey");
  ok(rec, "a record with a custom id was created");
  sk=store.storeKeyFor(SC.Record, "priKey");
  equals(store.readDataHash(sk), hash2, "data hashes are equivalent");
  equals(rec.id(), "priKey", "guids are the same");
  
});
