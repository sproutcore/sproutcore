// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

var store, TestRecord;

module("SC.Store#unloadRecords", {
  setup: function() {
    TestRecord = SC.Record.extend({
      name: SC.Record.attr(String)
    });

    SC.RunLoop.begin();

    store = SC.Store.create();

    store.createRecord(TestRecord, {
      name: 'Foo'
    });

    store.createRecord(TestRecord, {
      name: 'Bar'
    });

    store.createRecord(TestRecord, {
      name: 'Baz'
    });

    SC.RunLoop.end();
  }
});

test("Unload all records of a record type", function() {
  var records = store.find(TestRecord);
  equals(records.get('length'), 3, "Store starts with 3 records loaded");
  store.unloadRecords(TestRecord);
  records = store.find(TestRecord);
  equals(records.get('length'), 0, "Number of TestRecord records left");
});
