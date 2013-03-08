// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

var store, child, storeKey, json;
module("SC.Store#_commitConflictsFromNestedStore", {
  setup: function() {
    SC.RunLoop.begin();

    store = SC.Store.create();

    json = {
      string: "string",
      number: 23,
      bool:   YES
    };

    storeKey = SC.Store.generateStoreKey();

    child = store.chain();  // test multiple levels deep

    // write basic status
    child.writeDataHash(storeKey, json, SC.Record.READY_DIRTY);
    child.dataHashDidChange(storeKey);
    child.changelog = SC.Set.create();
    child.changelog.add(storeKey);

    SC.RunLoop.end();
  }
});

test("should return false when no conflict is present", function() {
  
  SC.RunLoop.begin();
  
  equals(child.commitConflictsWithParent(), false);
  
  SC.RunLoop.end();
  
});

test("should return an array with one or more storekeys when one or more conflicts exist", function() {

  SC.RunLoop.begin();

  var json2 = { kind: "json2" };
  var json3 = { kind: "json3" };

  // create a lock conflict.  use a new storeKey since the old one has been
  // setup in a way that won't work for this.
  storeKey = SC.Store.generateStoreKey();

  // step 1: add data to root store
  store.writeDataHash(storeKey, json, SC.Record.READY_CLEAN);
  store.dataHashDidChange(storeKey);

  // step 2: read data in chained store.  this will create lock
  child.readDataHash(storeKey);
  ok(child.locks[storeKey], 'child store should now have lock');

  // step 3: modify root store again
  store.writeDataHash(storeKey, json2, SC.Record.READY_CLEAN);
  store.dataHashDidChange(storeKey);

  // step 4: modify data in chained store so we have something to commit.
  child.writeDataHash(storeKey, json3, SC.Record.READY_DIRTY);
  child.dataHashDidChange(storeKey);

  // just to make sure verify that the lock and revision in parent do not
  // match
  ok(child.locks[storeKey] !== store.revisions[storeKey], 'child.lock (%@) should !== store.revision (%@)'.fmt(child.locks[storeKey], store.revisions[storeKey]));

  // step 5: now try to retrieve conflicts
  var c = child.commitConflictsWithParent();
  equals(c,[storeKey],"return value should have the storekey");
  
  SC.RunLoop.end();
  
});


