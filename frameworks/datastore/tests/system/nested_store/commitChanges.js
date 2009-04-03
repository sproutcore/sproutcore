// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Apple, Inc. and contributors.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

// NOTE: The test below are based on the Data Hashes state chart.  This models
// the "commit" event in the NestedStore portion of the diagram.

var parent, store, child, storeKey, json, args;
module("SC.NestedStore#commitChanges", {
  setup: function() {
    parent = SC.Store.create();
    
    json = {
      string: "string",
      number: 23,
      bool:   YES
    };
    args = null;
    
    storeKey = SC.Store.generateStoreKey();

    store = parent.chain(); // create nested store
    child = store.chain();  // test multiple levels deep
    
    // override commitChangesFromNestedStore() so we can ensure it is called
    // save call history for later evaluation
    parent.commitChangesFromNestedStore =
    child.commitChangesFromNestedStore =
    store.commitChangesFromNestedStore = function(store, changes, force) {
      if (!args) args = [];
      args.push({ 
        target: this, 
        store: store, 
        changes: changes, 
        force: force 
      });
    };
    
  }
});

// ..........................................................
// BASIC STATE TRANSITIONS
//

function testStateTransition(shouldIncludeStoreKey) {

  // attempt to commit
  equals(store.commitChanges(), store, 'should return receiver');
  
  // verify result
  equals(store.storeKeyEditState(storeKey), SC.Store.INHERITED, 'data edit state');
  equals(args.length, 1, 'should have called commitChangesFromNestedStore');
  equals(args[0].target, parent, 'should have called on parent store');
  
  // verify if changes passed to callback included storeKey
  var changes = args[0].changes;
  var didInclude = changes && changes.contains(storeKey);
  if (shouldIncludeStoreKey) {
    ok(didInclude, 'passed set of changes should include storeKey');
  } else {
    ok(!didInclude, 'passed set of changes should NOT include storeKey');
  }
  
  equals(store.get('hasChanges'), NO, 'hasChanges should be cleared');
  ok(!store.chainedChanges || store.chainedChanges.length===0, 'should have empty chainedChanges set');
}

notest("state = INHERITED", function() {
  
  // write in some data to parent
  parent.writeDataHash(storeKey, json);
  
  // check preconditions
  equals(store.storeKeyEditState(storeKey), SC.Store.INHERITED, 'precond - data edit state');

  testStateTransition(NO);
});


notest("state = LOCKED", function() {
  
  // write in some data to parent
  parent.writeDataHash(storeKey, json);
  parent.editables = null ; // manually force to lock state
  store.readDataHash(storeKey);
  
  // check preconditions
  equals(store.storeKeyEditState(storeKey), SC.Store.LOCKED, 'precond - data edit state');
  ok(!store.chainedChanges || !store.chainedChanges.contains(storeKey), 'locked record should not be in chainedChanges set');

  testStateTransition(NO);
});

notest("state = EDITABLE", function() {
  
  // write in some data to parent
  store.writeDataHash(storeKey, json);
  store.dataHashDidChange(storeKey);
  
  // check preconditions
  equals(store.storeKeyEditState(storeKey), SC.Store.EDITABLE, 'precond - data edit state');
  ok(store.chainedChanges  && store.chainedChanges.contains(storeKey), 'editable record should be in chainedChanges set');

  testStateTransition(YES);
});


// ..........................................................
// SPECIAL CASES
// 

// TODO: Add more special cases for SC.NestedStore#commitChanges
