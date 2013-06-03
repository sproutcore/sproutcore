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
