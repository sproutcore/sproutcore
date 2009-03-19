// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Apple, Inc. and contributors.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

var store, storeKey, json;
module("SC.Store#readDataHash", {
  setup: function() {
    store = SC.Store.create();
    
    json = {
      string: "string",
      number: 23,
      bool:   YES
    };
    
    storeKey = SC.Store.generateStoreKey();

    store.writeDataHash(storeKey, json, SC.RECORD_READY);
    store.commitChanges();
  }
});

test("reading unmodified record from root store", function() {
  ok(!store.locks || !store.locks[storeKey], 'precond - no lock yet on record');

  var oldrev = store.revisions[storeKey];
  
  equals(store.readDataHash(storeKey), json, 'should return json');

  ok(store.locks[storeKey], 'should add a lock');
  ok(store.dataHashes.hasOwnProperty(storeKey), 'should copy reference to json');

  // test revisions...
  equals(store.revisions[storeKey], oldrev, 'should not change revision');
  if (!SC.none(oldrev)) {
    ok(store.revisions.hasOwnProperty(storeKey), 'should copy reference to revision');
  }
});

test("should return null when accessing an unknown storeKey", function() {
  equals(store.readDataHash(20000000), null, 'shuld return null for non-existant store key');
});

test("reading unmodified record from chained store", function() {
  var parent = store;
  store = parent.chain();

  ok(!store.locks || !store.locks[storeKey], 'precond - no lock yet on record');
  ok(!store.dataHashes.hasOwnProperty(storeKey), 'precond - record is currently inherited from parent store');
  ok(!store.statuses.hasOwnProperty(storeKey), 'precond - record is currently inherited from parent store');
  ok(!store.revisions.hasOwnProperty(storeKey), 'precond - revision is inherited from parent');
  var oldrev = store.revisions[storeKey];
  
  equals(store.readDataHash(storeKey), json, 'should return json');
  ok(store.locks[storeKey], 'should add a lock');
  ok(store.dataHashes.hasOwnProperty(storeKey), 'should copy reference to json');
  ok(store.statuses.hasOwnProperty(storeKey), 'should copy reference to status');

  // test revisions...
  equals(store.revisions[storeKey], oldrev, 'should not change revision');
  if (!SC.none(oldrev)) {
    ok(store.revisions.hasOwnProperty(storeKey), 'should copy reference to revision');
  }

  ok(!store.editables || !store.editables[storeKey], 'should not be editable');
    
});
