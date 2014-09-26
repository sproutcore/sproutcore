// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

// NOTE: The test below are based on the Data Hashes state chart.  This models
// the "write" event in the NestedStore portion of the diagram.

var parent, store, child, storeKey, json;
module("SC.NestedStore#writeDataHash", {
  setup: function() {
    parent = SC.Store.create();

    json = {
      string: "string",
      number: 23,
      bool:   YES
    };

    storeKey = SC.Store.generateStoreKey();

    parent.writeDataHash(storeKey, json, SC.Record.READY_CLEAN);
    parent.editables = null; // manually patch to setup test state

    store = parent.chain(); // create nested store
    child = store.chain();  // test multiple levels deep
  }
});

// ..........................................................
// BASIC STATE TRANSITIONS
//

// The transition from each base state performs the same operation, so just
// run the same test on each state.
function testWriteDataHash() {
  var oldrev = store.revisions[storeKey];

  // perform test
  var json2 = { foo: "bar" };
  equals(store.writeDataHash(storeKey, json2, SC.Record.READY_NEW), store, 'should return receiver');

  // verify
  equals(store.storeKeyEditState(storeKey), SC.Store.EDITABLE, 'new edit state should be editable');

  equals(store.readDataHash(storeKey), json2, 'should have new json data hash');
  equals(store.readStatus(storeKey), SC.Record.READY_NEW, 'should have new status');

  equals(store.revisions[storeKey], oldrev, 'should not change revision');
  if (!SC.none(oldrev)) {
    ok(store.revisions.hasOwnProperty(storeKey), 'should clone reference to revision');
  }
}


test("edit state=INHERITED", function() {

  // test preconditions
  equals(store.storeKeyEditState(storeKey), SC.Store.INHERITED, 'precond - edit state should be inherited');

  testWriteDataHash();
});

test("edit state=LOCKED", function() {

  // test preconditions
  store.readDataHash(storeKey);
  equals(store.storeKeyEditState(storeKey), SC.Store.LOCKED, 'precond - edit state should be locked');

  testWriteDataHash();

});

test("edit state=EDITABLE", function() {

  // test preconditions
  store.readEditableDataHash(storeKey);
  equals(store.storeKeyEditState(storeKey), SC.Store.EDITABLE, 'precond - edit state should be editable');

  testWriteDataHash();

});

// ..........................................................
// WRITING NEW VS EXISTING
//

test("writing a new hash", function() {
  storeKey = SC.Store.generateStoreKey(); // new store key!
  equals(parent.readDataHash(storeKey), null, 'precond - parent should not have a data hash for store key yet');
  equals(store.storeKeyEditState(storeKey), SC.Store.INHERITED, 'precond - edit status should be inherited');

  // perform write
  equals(store.writeDataHash(storeKey, json, SC.Record.READY_NEW), store, 'should return receiver');

  // verify change
  equals(store.storeKeyEditState(storeKey), SC.Store.EDITABLE, 'new status should be editable');
  equals(store.readDataHash(storeKey), json, 'should match new json');
  equals(store.readStatus(storeKey), SC.Record.READY_NEW, 'should have new record status');
});

// ..........................................................
// PROPOGATING TO NESTED STORES
//

test("change should propogate to child if child edit state = INHERITED", function() {

  // verify preconditions
  equals(child.storeKeyEditState(storeKey), SC.Store.INHERITED, 'precond - child edit state should be INHERITED');

  // perform change
  var json2 = { version: 2 };
  store.writeDataHash(storeKey, json2, SC.Record.READY_NEW);

  // verify
  same(child.readDataHash(storeKey), json2, 'child should pick up change');
  equals(parent.readDataHash(storeKey), json, 'parent should still have old json');

  equals(child.readStatus(storeKey), SC.Record.READY_NEW, 'child should pick up new status');
  equals(parent.readStatus(storeKey), SC.Record.READY_CLEAN, 'parent should still have old status');

});


function testLockedOrEditableChild() {
  // perform change
  var json2 = { version: 2 };
  store.writeDataHash(storeKey, json2, SC.Record.READY_NEW);

  // verify
  same(child.readDataHash(storeKey), json, 'child should NOT pick up change');
  equals(parent.readDataHash(storeKey), json, 'parent should still have old json');

  equals(child.readStatus(storeKey), SC.Record.READY_CLEAN, 'child should pick up new status');
  equals(parent.readStatus(storeKey), SC.Record.READY_CLEAN, 'parent should still have old status');
}


test("change should not propogate to child if child edit state = LOCKED", function() {

  // verify preconditions
  child.readDataHash(storeKey);
  equals(child.storeKeyEditState(storeKey), SC.Store.LOCKED, 'precond - child edit state should be LOCKED');

  testLockedOrEditableChild();
});

test("change should not propogate to child if child edit state = EDITABLE", function() {

  // verify preconditions
  child.readEditableDataHash(storeKey);
  equals(child.storeKeyEditState(storeKey), SC.Store.EDITABLE, 'precond - child edit state should be EDITABLE');

  testLockedOrEditableChild();
});

test("writeDataHash on parent records should be propagated to nested children and eventually to the parent store", function() {
  var model = SC.Record.extend( {
                v: SC.Record.attr( String ),
                c: SC.Record.toMany( SC.Record.extend( {
                                       v: SC.Record.attr( String ),
                                     } ),
                                     {
                                       nested: YES
                                     } )
              } );
  var json1 = { guid: "p1", v: "p1-1", c: [ { guid: "c1", v: "c1-1" }, { id: "c2", v: "c2-1" } ] };
  var json12 = { guid: "p1", v: "p1-2", c: [ { guid: "c1", v: "c1-2" }, { id: "c2", v: "c2-1" } ] };

  SC.RunLoop.begin();

  // load the data into the main store
  var storeKey1 = parent.loadRecord( model, json1 );
  var rec1 = parent.find( model, "p1" );

  equals( rec1.get( "v" ), "p1-1", "the data loaded into the record should be correct" );
  equals( rec1.get( "c" ).objectAt( 0 ).get( "v" ), "c1-1", "the data loaded into the 1st child record should be correct" );
  equals( rec1.get( "c" ).objectAt( 1 ).get( "v" ), "c2-1", "the data loaded into the 2nd child record should be correct" );

  // start an "editing" session into the nested store store
  var rec12 = store.find( rec1 );

  equals( rec12.get( "c" ).objectAt( 0 ).get( "v" ), "c1-1", "the data loaded into the 1st child record should be correct" );
  equals( rec12.get( "c" ).objectAt( 1 ).get( "v" ), "c2-1", "the data loaded into the 2nd child record should be correct" );

  // replace the content and notify the changes
  store.writeDataHash( storeKey1, json12, SC.Record.READY_CLEAN );
  store.dataHashDidChange( storeKey1 );

  SC.RunLoop.end();

  SC.RunLoop.begin();
  // check if the values from the hash are properly propagated to the record + children
  equals( rec12.get( "v" ), "p1-2", "after writeDataHash the data loaded into the record should be updated" );
  equals( rec12.get( "c" ).objectAt( 0 ).get( "v" ), "c1-2", "after writeDataHash the data loaded into the 1st child record should be updated" );
  equals( rec12.get( "c" ).objectAt( 1 ).get( "v" ), "c2-1", "after writeDataHash the data loaded into the 2nd child record should not be updated" );

  // push the changes to the parent store
  store.commitChanges(YES);
  SC.RunLoop.end();

  SC.RunLoop.begin();
  // check if the values updated into the nested store are properly propagated to the record + children
  equals( rec1.get( "v" ), "p1-2", "after commitChanges the data loaded into the record should be updated" );
  equals( rec1.get( "c" ).objectAt( 0 ).get( "v" ), "c1-2", "after commitChanges the data loaded into the 1st child record should be updated" );
  equals( rec1.get( "c" ).objectAt( 1 ).get( "v" ), "c2-1", "the data loaded into the 2nd child record should be correct" );
  SC.RunLoop.end();
});
