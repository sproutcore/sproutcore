// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module, ok, equals, same, test */

var store, child, json;

module("SC.NestedStore.prototype.conflictedStoreKeys", {
  setup: function () {
    SC.run(function () {
      store = SC.Store.create();

      json = {
        string: "string",
        number: 23,
        bool: true
      };

      child = store.chain();  // test multiple levels deep
    });
  },

  teardown: function () {
    child.destroy();
    store.destroy();

    store = child = json = null;
  }
});

test("should return empty array when no conflict is present", function() {
  SC.run(function () {
    var storeKey = SC.Store.generateStoreKey();

    // write basic status
    child.writeDataHash(storeKey, json, SC.Record.READY_DIRTY);
    child.dataHashDidChange(storeKey);
    child.changelog = SC.Set.create();
    child.changelog.add(storeKey);

    same(child.get('conflictedStoreKeys'), null, "There should be no conflicted store keys");
  });
});

test("should return an array with one or more storekeys when one or more conflicts exist", function() {
  SC.run(function () {
    var json2 = { kind: "json2" };
    var json3 = { kind: "json3" };

    // create a lock conflict.  use a new storeKey since the old one has been
    // setup in a way that won't work for this.
    var storeKey = SC.Store.generateStoreKey();

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

    // just to make sure verify that the lock and revision in parent do not match
    ok(child.locks[storeKey] !== store.revisions[storeKey], 'child.lock (%@) should !== store.revision (%@)'.fmt(child.locks[storeKey], store.revisions[storeKey]));

    // step 5: now try to retrieve conflicts
    same(child.get('conflictedStoreKeys') , [storeKey], "There should be conflicted store key as");

  });
});


test("should be able to bind and observe conflictedStoreKeys", function () {
  var observerExpected = null,
      observerObject = SC.Object.create({
        conflictedStoreKeysDC: function () {
          same(child.get('conflictedStoreKeys'), observerExpected, "There should be conflicted store keys observed as");
        }
      });

  child.addObserver('conflictedStoreKeys', observerObject, 'conflictedStoreKeysDC');

  SC.run(function () {
    var json2 = { kind: "json2" };
    var json3 = { kind: "json3" };
    var json4 = { kind: "json4" };

    // create a lock conflict.  use a new storeKey since the old one has been
    // setup in a way that won't work for this.
    var storeKey = SC.Store.generateStoreKey();

    // step 1: add data to root store
    store.writeDataHash(storeKey, json, SC.Record.READY_CLEAN);
    store.dataHashDidChange(storeKey);

    // step 2: read data in chained store.  this will create lock
    child.readDataHash(storeKey);

    // Run observer manually once.
    observerObject.conflictedStoreKeysDC();

    // step 3: modify root store again
    store.writeDataHash(storeKey, json2, SC.Record.READY_CLEAN);
    store.dataHashDidChange(storeKey);

    // Observer should fire on its own.
    observerExpected = [storeKey];

    // step 4: modify data in chained store so we have something to commit.
    child.writeDataHash(storeKey, json3, SC.Record.READY_DIRTY);
    child.dataHashDidChange(storeKey);

    // step 5: modify data again (shouldn't fire update b/c it's the same record)
    child.writeDataHash(storeKey, json4, SC.Record.READY_DIRTY);
    child.dataHashDidChange(storeKey);

    var storeKey2 = SC.Store.generateStoreKey();

    // step 6: add data to root store
    store.writeDataHash(storeKey2, SC.copy(json), SC.Record.READY_CLEAN);
    store.dataHashDidChange(storeKey2);

    // step 7: read data in chained store.  this will create lock
    child.readDataHash(storeKey2);

    // Run observer manually once.
    observerObject.conflictedStoreKeysDC();

    // step 8: modify root store again
    store.writeDataHash(storeKey2, SC.copy(json2), SC.Record.READY_CLEAN);
    store.dataHashDidChange(storeKey2);

    // Observer should fire on its own.
    observerExpected = [storeKey, storeKey2];

    // step 4: modify data in chained store so we have something to commit.
    child.writeDataHash(storeKey2, SC.copy(json3), SC.Record.READY_DIRTY);
    child.dataHashDidChange(storeKey2);

    // Observer should fire on its own.
    observerExpected = null;

    // step 6: throw away the changes, conflicted store keys should go to null.
    child.discardChanges();
  });
});

