// ==========================================================================
// Project:   SC.MultiplexedDataSource Unit Test
// Copyright: ©2011 Junction Networks
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module test ok equals same stop start */

var MyApp, wasCalled;
module("SC.MultiplexedDataSource", {
  setup: function () {
    MyApp = window.MyApp = {};
    MyApp.DataSource = SC.MultiplexedDataSource.extend({
      foo: 'baz',

      bar: function () {
        return 'qux';
      }.property()
    });

    MyApp.store = SC.Store.create();
    MyApp.Foo = SC.Record.extend();
    MyApp.Bar = SC.Record.extend();
    MyApp.FooDelegate = SC.DataSource.extend(
      SC.DataSourceDelegate, {

      isDelegateFor: 'MyApp.Foo',

      init: function () {
        wasCalled = true;
        ok(this.get('dataSource'),
           "The dataStore property should be populated on this delegate");

        equals(this.get('foo'), "baz",
               "unknown properties should be proxied to the parent data source. (raw)");
        equals(this.get('bar'), "qux",
               "unknown properties should be proxied to the parent data source. (computed)");
        equals(this.get('isDelegateFor'), "MyApp.Foo",
               "known properties should be intercepted by this object.");
      },

      fetch: function (store, query) {
        wasCalled = true;
        equals(query.recordType, MyApp.Foo,
               "The record type should match.");
        equals(arguments.length, 2);
        return YES;
      },

      createRecord: function (store, storeKey, params) {
        wasCalled = true;
        equals(store.recordTypeFor(storeKey), MyApp.Foo,
               "The record type should match.");
        equals(arguments.length, 3);
        return YES;
      },

      updateRecord: function (store, storeKey, params) {
        wasCalled = true;
        equals(store.recordTypeFor(storeKey), MyApp.Foo,
               "The record type should match.");
        equals(arguments.length, 3);
        return YES;
      },

      retrieveRecord: function (store, storeKey, params) {
        wasCalled = true;
        equals(store.recordTypeFor(storeKey), MyApp.Foo,
               "The record type should match.");
        equals(arguments.length, 3);
        return YES;
      },

      destroyRecord: function (store, storeKey, params) {
        wasCalled = true;
        equals(store.recordTypeFor(storeKey), MyApp.Foo,
               "The record type should match.");
        equals(arguments.length, 3);
        return YES;
      }
    });

    // Assume checking once on a single method will cover all of them.
    MyApp.FooBarDelegate = SC.DataSource.extend(
      SC.DataSourceDelegate, {
      isDelegateFor: 'MyApp.Foo MyApp.Bar'.w(),

      fetch: function (store, query) {
        wasCalled = true;
        return YES;
      }
    });

  }
});

test("The dataSource will return NO for all records with no delegates", function () {
  var ds = MyApp.DataSource.create();
  ok(!wasCalled, "`init` should have not been called");
  MyApp.store.set('dataSource', ds);
  ok(MyApp.store.find(SC.Query.remote(MyApp.Foo)),
     "the fetch should return a record array");
  ok(!MyApp.store.find(MyApp.Foo, "testing retrieve"),
     "no results should come from the retrieve");

  var rec = MyApp.store.createRecord(MyApp.Foo, {});

  equals(MyApp.store.commitRecord(MyApp.Foo, 'foo', rec.get('storeKey')), NO,
         "commiting a new record should return NO");
  MyApp.store.writeStatus(rec.get('storeKey'), SC.Record.READY_CLEAN);

  rec.set('zero', 0);
  equals(MyApp.store.commitRecord(MyApp.Foo, 'foo', rec.get('storeKey')), NO,
         "updating the record should return NO");
  MyApp.store.writeStatus(rec.get('storeKey'), SC.Record.READY_CLEAN);

  rec.destroy();
  equals(MyApp.store.commitRecord(MyApp.Foo, 'foo', rec.get('storeKey')), NO,
         "destroying the record should return NO");
});

test("The dataSource will delegate calls to its registered delegates", function () {
  var ds = MyApp.DataSource.create().from(MyApp.FooDelegate);
  ok(wasCalled, "`init` should have been called");
  wasCalled = NO;
  MyApp.store.set('dataSource', ds);
  ok(MyApp.store.find(SC.Query.remote(MyApp.Foo)),
     "the fetch should return a record array");
  ok(wasCalled, "`fetch` should have been called");
  wasCalled = NO;

  ok(MyApp.store.find(SC.Query.remote(SC.Record)),
     "the fetch should return a record array");
  ok(!wasCalled, "`fetch` should have not been called");
  
  ok(MyApp.store.find(MyApp.Foo, "testing retrieve"),
     "retrieve should return a new record (because the dataSource handled the request YES)");
  ok(wasCalled, "`retrieve` should have been called");
  wasCalled = NO;

  ok(!MyApp.store.find(SC.Record, "testing retrieve"),
     "retrieve should not return anything");
  ok(!wasCalled, "`retrieve` should have not been called");

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

  equals(MyApp.store.commitRecord(MyApp.Foo, 'foo', rec.get('storeKey')), YES,
     "destroying the record should return YES");
  ok(wasCalled, "`destroyRecord` should have been called");
  wasCalled = NO;

  rec = MyApp.store.createRecord(SC.Record, {});

  equals(MyApp.store.commitRecord(SC.Record, 'foo', rec.get('storeKey')), NO,
         "commiting a new record should return NO");
  ok(!wasCalled, "`createRecord` should have not been called");

  MyApp.store.writeStatus(rec.get('storeKey'), SC.Record.READY_CLEAN);

  rec.set('zero', 0);
  equals(MyApp.store.commitRecord(SC.Record, 'foo', rec.get('storeKey')), NO,
         "updating a record should return NO");
  ok(!wasCalled, "`updateRecord` should have not been called");

  MyApp.store.writeStatus(rec.get('storeKey'), SC.Record.READY_CLEAN);

  rec.destroy();

  equals(MyApp.store.commitRecord(SC.Record, 'foo', rec.get('storeKey')), NO,
         "destroying the record should return NO");
  ok(!wasCalled, "`destroyRecord` should have not been called");
});

test("The dataSource will delegate calls to its registered delegates that were plugged into its prototype", function () {
  MyApp.DataSource.plugin(MyApp.FooDelegate);

  var ds = MyApp.DataSource.create();
  ok(wasCalled, "`init` should have been called");
  wasCalled = NO;

  ds = MyApp.DataSource.create();
  ok(wasCalled, "`init` should have been called");
  wasCalled = NO;
});

test("The dataSource will delegate calls to its registered delegates that were provided via the `delegates` property (String property lookup)", function () {
  var ds = MyApp.DataSource.create({
    delegates: 'fooDelegate',
    fooDelegate: MyApp.FooDelegate
  });

  ok(wasCalled, "`init` should have been called");
  wasCalled = NO;
});

test("The dataSource will delegate calls to its registered delegates that were provided via the `delegates` property (String[] property lookup)", function () {
  var ds = MyApp.DataSource.create({
    delegates: ['fooDelegate'],
    fooDelegate: MyApp.FooDelegate
  });

  ok(wasCalled, "`init` should have been called");
  wasCalled = NO;
});

test("The dataSource will delegate calls to its registered delegates that were provided via the `delegates` property (raw SC.DataSourceDelegate)", function () {
  var ds = MyApp.DataSource.create({
    delegates: MyApp.FooDelegate
  });

  ok(wasCalled, "`init` should have been called");
  wasCalled = NO;
});

test("The dataSource will delegate calls to its registered delegates that were provided via the `delegates` property (SC.DataSourceDelegate[])", function () {
  var ds = MyApp.DataSource.create({
    delegates: [MyApp.FooDelegate]
  });

  ok(wasCalled, "`init` should have been called");
  wasCalled = NO;
});

test("Multiple recordTypes are allowed", function () {
  MyApp.store.set('dataSource', MyApp.DataSource.create().from(MyApp.FooBarDelegate));
  MyApp.store.find(SC.Query.remote(MyApp.Foo));
  ok(wasCalled, "MyApp.Foo should be handled by the dataSource delegate");
  wasCalled = NO;

  MyApp.store.find(SC.Query.remote(MyApp.Bar));
  ok(wasCalled, "MyApp.Bar should be handled by the dataSource delegate");
  wasCalled = NO;

  MyApp.store.find(SC.Query.remote(SC.Record));
  ok(!wasCalled, "SC.Record should not be handled by the dataSource delegate");
});

test("Chained MultiplexedDataSources are allowed", function () {
  var ds = MyApp.DataSource.create()
         .from(SC.MultiplexedDataSource.extend(
                 SC.DataSourceDelegate, {
                   isDelegateFor: 'MyApp.Foo MyApp.Bar'.w(),
                   delegates: 'fooDelegate barDelegate'.w(),

                   fooDelegate: MyApp.FooDelegate,
                   barDelegate: SC.DataSource.extend(SC.DataSourceDelegate)
                 }));

  ok(wasCalled, "`init` should have been called");
  wasCalled = NO;
});
