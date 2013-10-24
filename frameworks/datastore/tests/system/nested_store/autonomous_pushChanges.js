// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

// This file tests the initial state of the store when it is first created
// either independently or as a chained store.

var Rec = SC.Record.extend({

  title: SC.Record.attr(String),

  fired: NO,

  reset: function() {
    this.fired = NO;
  },

  titleDidChange: function() {
    this.fired = YES;
  }.observes('title')

});

// ..........................................................
// SC.Store#autonomous_pushChanges - init
//
module("SC.Store#autonomous_pushChanges - init");

test("record updates pushed from the server via an autonomous chained store should propagate reliably to the main store", function() {
  var parent, rec, store, rec2;

  parent = SC.Store.create().from(SC.Record.fixtures);

  SC.run(function() {
    parent.loadRecords(Rec, [{ title: "foo", guid: 1 }]);
  });

  rec = parent.find(Rec, 1);
  ok(rec && rec.get('title')==='foo', 'precond - base store should have record');

  SC.RunLoop.begin();
  store = parent.chainAutonomousStore();
  rec2  = store.find(Rec, 1);
  ok(rec2 && rec2.get('title')==='foo', 'chain store should have record');

  var res = store.pushRetrieve(Rec, 1, { title: "bar" });
  equals(res, rec2.storeKey, "There is no conflict, pushRetrieve was succesful.");
  var dh = store.readDataHash(rec2.storeKey);
  ok(dh && dh.title==='bar', 'dataHash.title should change');
  SC.RunLoop.end();

  equals(store.get('hasChanges'), YES, 'chained store.hasChanges');
  equals(rec.get('title'), 'foo', 'original rec.title should NOT change');
  equals(rec.fired, NO, 'original rec.title should not have notified');

  SC.RunLoop.begin();
  rec.reset();
  store.commitChanges();
  store.destroy();
  SC.RunLoop.end();

  equals(rec.get('title'), 'bar', 'original rec.title should change');
  equals(rec.fired, YES, 'original rec.title should have notified');
});

test("record destroy pushed from the server via an autonomous chained store should propagate reliably to the main store", function() {
  var parent, rec, store, rec2;

  parent = SC.Store.create().from(SC.Record.fixtures);

  SC.run(function() {
    parent.loadRecords(Rec, [{ title: "foo", guid: 1 }]);
  });

  rec = parent.find(Rec, 1);
  ok(rec && rec.get('title')==='foo', 'precond - base store should have record');
  var storeKey1 = rec.storeKey;

  SC.RunLoop.begin();
  store = parent.chainAutonomousStore();
  rec2  = store.find(Rec, 1);
  ok(rec2 && rec2.get('title')==='foo', 'chain store should have record');

  var storeKey2 = rec2.storeKey;
  var res = store.pushDestroy(Rec, 1);

  equals(res, storeKey2, "There is no conflict, pushDestroy was succesful.");
  SC.RunLoop.end();

  rec = parent.find(Rec, 1);
  ok( rec && rec.get('title')==='foo', 'original rec should still be present into the main store');
  equals(store.get('hasChanges'), YES, 'chained store.hasChanges');

  var status2 = store.readStatus(storeKey2);

  equals(store.dataHashes[storeKey2], null, "the data hash should be removed from the chained store");
  equals(status2, SC.Record.DESTROYED_CLEAN, "the status should have changed to DESTROYED_CLEAN ");

  SC.RunLoop.begin();
  rec.reset();
  store.commitChanges();
  store.destroy();
  SC.RunLoop.end();

  var status = store.readStatus(storeKey1);

  equals(store.dataHashes[storeKey1], null, "the data hash should be removed from the main store");
  equals(status, SC.Record.DESTROYED_CLEAN, "the status of the record into main store should have changed to DESTROYED_CLEAN ");
});


test("record error status pushed from the server via an autonomous chained store should propagate reliably to the main store", function() {
  var parent, rec, store, rec2;

  parent = SC.Store.create().from(SC.Record.fixtures);

  SC.run(function() {
    parent.loadRecords(Rec, [{ title: "foo", guid: 1 }]);
  });

  rec = parent.find(Rec, 1);
  ok(rec && rec.get('title')==='foo', 'precond - base store should have record');
  var storeKey1 = rec.storeKey;

  SC.RunLoop.begin();
  store = parent.chainAutonomousStore();
  rec2  = store.find(Rec, 1);
  ok(rec2 && rec2.get('title')==='foo', 'chain store should have record');

  var storeKey2 = rec2.storeKey;
  var res = store.pushError(Rec, 1);

  equals(res, storeKey2, "There is no conflict, pushError was succesful.");
  SC.RunLoop.end();

  rec = parent.find(Rec, 1);
  ok( rec && rec.get('title')==='foo' && rec.get("status") === SC.Record.READY_CLEAN, 'original rec should be unchanged into the main store');
  equals(store.get('hasChanges'), YES, 'chained store.hasChanges');
  ok(store.readStatus(storeKey2) & SC.Record.ERROR, "the status should have changed to ERROR ");

  SC.RunLoop.begin();
  rec.reset();
  store.commitChanges();
  store.destroy();
  SC.RunLoop.end();

  ok(parent.readStatus(storeKey1) & SC.Record.ERROR, "the status of the record into main store should have changed to ERROR ");
});

test("on commitSuccessfulChanges only the clean records from an autonomous chained store should be propagated to the main store", function() {
  var parent, store, apple, apple2, pear1, pear2, peach1Key, peach2Key, peach1, peach2, orange1Key, orange2Key, orange1, orange2;

  parent = SC.Store.create().from(SC.Record.fixtures);

  SC.run(function() {
    parent.loadRecords(Rec, [{ title: "apple", guid: 1 },{ title: "pear", guid: 2 },
                             { title: "peach", guid: 3 },{ title: "orange", guid: 4 }]);
  });

  apple = parent.find(Rec, 1);
  pear = parent.find(Rec, 2);
  peach = parent.find(Rec, 3);
  peach1Key = peach.storeKey;
  orange = parent.find(Rec, 4);
  orange1Key = orange.storeKey;

  SC.RunLoop.begin();
  store = parent.chainAutonomousStore();
  pear2 = store.find(Rec, 2);
  peach2 = store.find(Rec, 3);
  orange2 = store.find(Rec, 4);

  store.pushRetrieve(Rec, 1, { title: "red apple" });
  pear2.set( "title", "big pear" );

  peach2Key = peach2.storeKey;
  store.pushDestroy(Rec, 3);

  orange2Key = orange2.storeKey;
  orange2.destroy();
  SC.RunLoop.end();

  equals(store.get('hasChanges'), YES, 'chained store.hasChanges');
  equals(apple.get('title'), 'apple', 'original apple.title should NOT change');
  equals(apple.fired, NO, 'original apple.title should not have notified');
  equals(pear.get('title'), 'pear', 'original pear.title should NOT change');
  equals(pear.fired, NO, 'original pear.title should not have notified');
  equals(store.readStatus(peach2Key), SC.Record.DESTROYED_CLEAN, 'peach2 should be destroyed clean');
  equals(store.readStatus(orange2Key), SC.Record.DESTROYED_DIRTY, 'orange2 should be destroyed dirty');

  SC.RunLoop.begin();
  apple.reset();
  store.commitSuccessfulChanges();
  SC.RunLoop.end();

  equals(apple.get('title'), 'red apple', 'original apple.title should change');
  equals(apple.fired, YES, 'original apple.title should have notified');
  equals(pear.get('title'), 'pear', 'original pear.title should NOT change');
  equals(pear.fired, NO, 'original pear.title should not have notified');

  var peachStatus = store.readStatus(peach1Key);
  equals(store.dataHashes[peach1Key], null, "the peach data hash should be removed from the main store");
  equals(peachStatus, SC.Record.DESTROYED_CLEAN, "the status of the peach record into main store should have changed to DESTROYED_CLEAN ");

  var orangeStatus = parent.readStatus(orange1Key);
  equals(orangeStatus, SC.Record.READY_CLEAN, "the status of the orange record into main store should remain unchanged: READY_CLEAN ");

  // attempt a new commitSuccessfulChanges
  SC.RunLoop.begin();
  apple.set( "title", "green apple" );
  store.commitSuccessfulChanges();
  SC.RunLoop.end();

  apple2 = store.find(Rec, 1);
  equals(apple2.get('title'), 'green apple', 'the nested store should fetch the apple data from the main store');

  SC.RunLoop.begin();
  apple.reset();
  apple2.set( "title", "yellow apple" );
  SC.RunLoop.end();

  equals(apple2.get('title'), 'yellow apple', 'apple2  should still be editable into the nested store');
  equals(apple.get('title'), 'green apple', 'original apple.title should NOT change');
  equals(apple.fired, NO, 'original apple.title should not have notified');

  SC.RunLoop.begin();
  store.destroy();
  SC.RunLoop.end();
});
