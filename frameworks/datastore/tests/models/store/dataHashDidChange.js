// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Apple, Inc. and contributors.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

var store, storeKey, json;
module("SC.Store#dataHashDidChange", {
  setup: function() {
    store = SC.Store.create();
    
    json = {
      string: "string",
      number: 23,
      bool:   YES
    };
    
    storeKey = SC.Store.generateStoreKey();

    store.writeDataHash(storeKey, json, SC.Record.READY_CLEAN);
  }
});

test("called with existing storeKey", function() {
  
  ok(!store.get('hasChanges'), 'precond - hasChanges should be no');
  ok(!store.changedDataHashes || !store.changedDataHashes.contains(storeKey), 'precond -changedDataHashes should not include storeKey');
  
  var oldrev= store.revisions[storeKey];
  store.dataHashDidChange(storeKey);
  
  ok(oldrev !== store.revisions[storeKey], 'should change revision (old=%@, new=%@)'.fmt(oldrev, store.revisions[storeKey]));
  ok(store.changedDataHashes.contains(storeKey), 'changedDataHashes should include storeKey');
  ok(store.get('hasChanges'), 'should set hasChanges to YES');
  
});

test("called with chained store", function() {
  
  var parent = store;
  store = parent.chain();
  
  ok(!store.get('hasChanges'), 'precond - hasChanges should be no');
  ok(!store.changedDataHashes || !store.changedDataHashes.contains(storeKey), 'precond -changedDataHashes should not include storeKey');
  
  var oldrev= store.revisions[storeKey];
  store.dataHashDidChange(storeKey);
  
  ok(oldrev !== store.revisions[storeKey], 'should change revision (old=%@, new=%@)'.fmt(oldrev, store.revisions[storeKey]));
  ok(parent.revisions[storeKey] !== store.revisions[storeKey], 'chained store revisions should not equal parent store revision');
  
  ok(store.changedDataHashes.contains(storeKey), 'changedDataHashes should include storeKey');
  ok(store.get('hasChanges'), 'should set hasChanges to YES');
  
});

test("called with imaginary storeKey - should treat like deleted record", function() {
  
  storeKey = 200000 ;
  
  ok(!store.get('hasChanges'), 'precond - hasChanges should be no');
  ok(!store.changedDataHashes || !store.changedDataHashes.contains(storeKey), 'precond -changedDataHashes should not include storeKey');
  
  var oldrev= store.revisions[storeKey];
  store.dataHashDidChange(storeKey);
  
  ok(oldrev !== store.revisions[storeKey], 'should change revision (old=%@, new=%@)'.fmt(oldrev, store.revisions[storeKey]));
  ok(store.changedDataHashes.contains(storeKey), 'changedDataHashes should include storeKey');
  ok(store.get('hasChanges'), 'should set hasChanges to YES');
  
});

test("called with muliple storeKeys", function() {
  
  var storeKey2 = SC.Store.generateStoreKey();
  store.writeDataHash(storeKey2, {});
  
  var storeKeys = [storeKey, storeKey2];
  var oldrevs   = [];
  
  storeKeys.forEach(function(storeKey) {
    ok(!store.get('hasChanges'), 'precond - hasChanges should be no');
    ok(!store.changedDataHashes || !store.changedDataHashes.contains(storeKey), 'precond -changedDataHashes should not include storeKey');
    oldrevs.push(store.revisions[storeKey]);
  });

  store.dataHashDidChange(storeKeys);

  var idx = 0 ;
  storeKeys.forEach(function(storeKey) {
    var oldrev = oldrevs[idx++];
    ok(oldrev !== store.revisions[storeKey], 'should change revision (old=%@, new=%@)'.fmt(oldrev, store.revisions[storeKey]));
    ok(store.changedDataHashes.contains(storeKey), 'changedDataHashes should include storeKey');
    ok(store.get('hasChanges'), 'should set hasChanges to YES');
  });
  
});

