// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Apple Inc. and contributors.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

// NOTE: The test below are based on the Data Hashes state chart.  This models
// the "did_change" event in the Store portion of the diagram.

var store, child, storeKey, json;
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
    store.editables = null; // manually patch to setup test state
    child = store.chain();  // test multiple levels deep
  }
});

// ..........................................................
// BASIC STATE TRANSITIONS
// 


function testStateTransition(fromState, toState) {

  // verify preconditions
  equals(store.storeKeyEditState(storeKey), fromState, 'precond - storeKey edit state');
  if (store.chainedChanges) {
    ok(!store.chainedChanges.contains(storeKey), 'changedChanges should NOT include storeKey');
  }

  var oldrev = store.revisions[storeKey];
  
  // perform action
  equals(store.dataHashDidChange(storeKey), store, 'should return receiver');

  // verify results
  equals(store.storeKeyEditState(storeKey), toState, 'store key edit state is in same state');

  // verify revision
  ok(oldrev !== store.revisions[storeKey], 'revisions should change. was: %@ - now: %@'.fmt(oldrev, store.revisions[storeKey]));
  
} 

test("edit state = LOCKED", function() {
  store.readDataHash(storeKey); // lock
  testStateTransition(SC.Store.LOCKED, SC.Store.LOCKED);
}) ;

test("edit state = EDITABLE", function() {
  store.readEditableDataHash(storeKey); // make editable
  testStateTransition(SC.Store.EDITABLE, SC.Store.EDITABLE);
}) ;

// ..........................................................
// SPECIAL CASES
// 

test("calling with array of storeKeys will edit all store keys", function() {
  
  var storeKeys = [storeKey, SC.Store.generateStoreKey()], idx ;
  store.dataHashDidChange(storeKeys, 2000) ;
  for(idx=0;idx<storeKeys.length;idx++) {
    equals(store.revisions[storeKeys[idx]], 2000, 'storeKey at index %@ should have new revision'.fmt(idx));
  }
});

