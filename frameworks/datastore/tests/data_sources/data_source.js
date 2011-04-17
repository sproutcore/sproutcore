// ==========================================================================
// Project:   SC.DataSource Unit Test
// Copyright: ©2011 Junction Networks and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals JN module test ok equals same stop start */

var MyApp, wasCalled;
module("SC.DataSource", {
  setup: function () {
    MyApp = window.MyApp = {};

    MyApp.store = SC.Store.create();
    MyApp.Foo = SC.Record.extend();

    MyApp.DataSource = SC.DataSource.extend({
      fetch: function (store, query) {
        wasCalled = true;
        equals(arguments.length, 2);
        return YES;
      },

      createRecord: function (store, storeKey, params) {
        wasCalled = true;
        equals(arguments.length, 3);
        return YES;
      },

      updateRecord: function (store, storeKey, params) {
        wasCalled = true;
        equals(arguments.length, 3);
        return YES;
      },

      retrieveRecord: function (store, storeKey, params) {
        wasCalled = true;
        equals(arguments.length, 3);
        return YES;
      },

      destroyRecord: function (store, storeKey, params) {
        wasCalled = true;
        equals(arguments.length, 3);
        return YES;
      }
    });
  }
});

test("The dataSource will forward calls to the appropriate methods", function () {
  var ds = MyApp.DataSource.create();
  MyApp.store.set('dataSource', ds);
  ok(MyApp.store.find(SC.Query.remote(MyApp.Foo)),
     "the fetch should return a record array");
  ok(wasCalled, "`fetch` should have been called");
  wasCalled = NO;
  
  ok(MyApp.store.find(MyApp.Foo, "testing retrieve"),
     "retrieve should return a new record (because the dataSource handled the request YES)");
  ok(wasCalled, "`retrieve` should have been called");
  wasCalled = NO;

  var rec = MyApp.store.createRecord(MyApp.Foo, {});

  equals(MyApp.store.commitRecord(MyApp.Foo, 'foo', rec.get('storeKey')), YES,
         "commiting a new record should return YES");
  ok(wasCalled, "`createRecord` should have been called");
  wasCalled = NO;

  MyApp.store.writeStatus(rec.get('storeKey'), SC.Record.READY_CLEAN);

  rec.set('zero', 0);
  equals(MyApp.store.commitRecord(MyApp.Foo, 'foo', rec.get('storeKey')), YES,
         "updating a record should return YES");
  ok(wasCalled, "`updateRecord` should have been called");
  wasCalled = NO;

  MyApp.store.writeStatus(rec.get('storeKey'), SC.Record.READY_CLEAN);

  rec.destroy();
  // broken in SC.Store
  equals(MyApp.store.commitRecord(MyApp.Foo, 'foo', rec.get('storeKey')), YES,
     "destroying the record should return YES");
  ok(wasCalled, "`destroyRecord` should have been called");
});
