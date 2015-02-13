// ==========================================================================
// Project:   SproutCore - Web Application - Client Data Store
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module, test, ok, equals, same */

var dataSource,
    store,
    RecordType = SC.Record.extend({
      stringProp: SC.Record.attr(String),

      primaryKey: 'guid'
    });

// Can only test in supported platforms.
if (SC.platform.supportsWebSQL) {
  module("SC.WebSQLDataSource", {

    setup: function () {
      // Create the data source.
      dataSource = SC.WebSQLDataSource.create({
        name: SC.generateGuid(null, 'sc_test_'), // Create a new database for each test.
        recordTypes: [RecordType]
      });

      store = SC.Store.create();
      store.set('dataSource', dataSource);
    },

    teardown: function () {
      dataSource.destroy();
      store.destroy();
      dataSource = store = null;
    }
  });

  /* Properties */

  test("Default Properties:", function () {
    equals(dataSource.version, 1, "The default value of version is");
  });

  /* Methods */

  // This method calls createRecord on the supported data source.
  test("Method: createRecord", function () {
    ok(SC.WebSQLDataSource.prototype.createRecord !== undefined, 'defined', 'defined', "The method is");

    var storeKey;

    storeKey = SC.Store.generateStoreKey();
    store.writeDataHash(storeKey, { stringProp: 'A' }, SC.Record.BUSY_CREATING);
    SC.Store.replaceRecordTypeFor(storeKey, RecordType);

    dataSource.createRecord(store, storeKey);

    store.dataSourceDidComplete = function (storeKey, dataHash, newId) {
      ok(true, 'called', 'called', "The dataSourceDidComplete callback is");

      same(dataHash, { stringProp: 'A', guid: newId }, "The data source should call dataSourceDidComplete with dataHash");

      // Verify the data in the database directly.
      SC.WebSQLAdaptor.getRow(dataSource._sc_db, 'sc_record', newId, function (result) {

        same(result, { stringProp: 'A', guid: newId }, "The database should contain a row equal to");

        expect(4);
        start();
      }, function (e) { console.error(e); });
    };

    // Wait for the asynchronous events.
    stop(2000);
  });

  // This method calls destroyRecord on the supported data source.
  test("Method: destroyRecord", function () {
    ok(SC.WebSQLDataSource.prototype.destroyRecord !== undefined, 'defined', 'defined', "The method is");

    // Connect.
    dataSource.connect();

    // Once connected and ready, continue test.
    dataSource.addObserver('isReady', function () {
      if (dataSource.get('isReady')) {
        dataSource.removeObserver('isReady', this);

        // Insert a record.
        SC.WebSQLAdaptor.insertRow(dataSource._sc_db, 'sc_record', { stringProp: 'A' }, function (id) {
          var storeKey = store.loadRecord(RecordType, { stringProp: 'A', guid: id });
          dataSource.destroyRecord(store, storeKey);

          store.dataSourceDidDestroy = function (storeKey) {
            ok(true, 'called', 'called', "The dataSourceDidDestroy callback is");

            // Verify the data in the database directly.
            SC.WebSQLAdaptor.getRow(dataSource._sc_db, 'sc_record', id, function (result) {
              same(result, null, "The database should not contain a row any more.");

              expect(3);
              start();
            });
          };
        }, function (e) { console.error(e); });
      }
    });

    // Wait for the asynchronous events.
    stop(2000);
  });

  // This method queries all records of a given type and calls dataSourceDidFetchQuery on the store when complete.
  test("Method: fetch", function () {
    ok(SC.WebSQLDataSource.prototype.fetch !== undefined, 'defined', 'defined', "The method is");

    // Connect.
    dataSource.connect();

    // Once connected and ready, continue test.
    dataSource.addObserver('isReady', function () {

      if (dataSource.get('isReady')) {
        dataSource.removeObserver('isReady', this);

        // Insert a record.
        SC.WebSQLAdaptor.insertRow(dataSource._sc_db, 'sc_record', { stringProp: 'A' }, function (id1) {

          // Insert a record.
          SC.WebSQLAdaptor.insertRow(dataSource._sc_db, 'sc_record', { stringProp: 'B' }, function (id2) {

            var query = SC.Query.create({ recordType: RecordType });
            dataSource.fetch(store, query);

            store.loadRecord = function (recordType, dataHash) {
              ok(true, 'called', 'called', "The loadRecord callback is");

              if (dataHash.guid === id1) {
                same(dataHash, { stringProp: 'A', guid: id1 }, "The data source should call loadRecord with data hash");
              } else {
                same(dataHash, { stringProp: 'B', guid: id2 }, "The data source should call loadRecord with data hash");
              }
            };

            store.dataSourceDidFetchQuery = function (query) {
              ok(true, 'called', 'called', "The dataSourceDidFetchQuery callback is");

              expect(6); // Note, two loadRecord calls should fire.
              start();
            };

          });
        });
      }
    });

    // Wait for the asynchronous events.
    stop(2000);
  });

  // This method calls retrieveRecord on the supported data source.
  test("Method: retrieveRecord", function () {
    ok(SC.WebSQLDataSource.prototype.retrieveRecord !== undefined, 'defined', 'defined', "The method is");

    // Connect.
    dataSource.connect();

    // Once connected and ready, continue test.
    dataSource.addObserver('isReady', function () {

      if (dataSource.get('isReady')) {
        dataSource.removeObserver('isReady', this);

        // Insert a record.
        SC.WebSQLAdaptor.insertRow(dataSource._sc_db, 'sc_record', { stringProp: 'A' }, function (id) {
          var storeKey = RecordType.storeKeyFor(id);
          dataSource.retrieveRecord(store, storeKey);

          store.loadRecord = function (recordType, dataHash) {
            ok(true, 'called', 'called', "The loadRecord callback is");

            same(dataHash, { stringProp: 'A', guid: id }, "The data source should call loadRecord with data hash");

            expect(3);
            start();
          };
        });
      }
    });

    // Wait for the asynchronous events.
    stop(2000);
  });

  // This method calls updateRecord on the supported data source.
  test("Method: updateRecord", function () {
    ok(SC.WebSQLDataSource.prototype.updateRecord !== undefined, 'defined', 'defined', "The method is");

    // Connect.
    dataSource.connect();

    // Once connected and ready, continue test.
    dataSource.addObserver('isReady', function () {

      if (dataSource.get('isReady')) {
        dataSource.removeObserver('isReady', this);

        // Insert a record.
        SC.WebSQLAdaptor.insertRow(dataSource._sc_db, 'sc_record', { stringProp: 'A' }, function (id) {
          var storeKey = store.loadRecord(RecordType, { stringProp: 'A', guid: id });

          store.writeDataHash(storeKey, { stringProp: 'B', guid: id }, SC.Record.READY_DIRTY);
          dataSource.updateRecord(store, storeKey);

          store.dataSourceDidComplete = function (storeKey) {
            ok(true, 'called', 'called', "The dataSourceDidComplete callback is");

            // Verify the data in the database directly.
            SC.WebSQLAdaptor.getRow(dataSource._sc_db, 'sc_record', id, function (result) {
              same(result, { stringProp: 'B', guid: id }, "The database should contain a row equal to");

              expect(3);
              start();
            });
          };
        });
      }
    });

    // Wait for the asynchronous events.
    stop(2000);
  });

  /* Integration */

  // Scenario: There is a delay while the database is opened, ensure that any requests in that period are not dropped.
  test("Integration: Calling createRecord multiple times queues up requests until the database is ready.", function () {
    var storeKey1, storeKey2;

    storeKey1 = SC.Store.generateStoreKey();
    store.writeDataHash(storeKey1, { stringProp: 'A' }, SC.Record.BUSY_CREATING);
    SC.Store.replaceRecordTypeFor(storeKey1, RecordType);

    // First create should start connection.
    dataSource.createRecord(store, storeKey1);

    storeKey2 = SC.Store.generateStoreKey();
    store.writeDataHash(storeKey2, { stringProp: 'B' }, SC.Record.BUSY_CREATING);
    SC.Store.replaceRecordTypeFor(storeKey2, RecordType);

    // Subsequent create should be queued.
    dataSource.createRecord(store, storeKey2);

    // Fetch all records.
    var query = SC.Query.create({ recordType: RecordType });
    dataSource.fetch(store, query);

    store.dataSourceDidComplete = function (storeKey, dataHash, newId) {
      ok(true, 'called', 'called', "The dataSourceDidComplete callback is");

      if (storeKey === storeKey1) {
        same(dataHash, { stringProp: 'A', guid: newId }, "The data source should call dataSourceDidComplete with dataHash");
      } else if (storeKey === storeKey2) {
        same(dataHash, { stringProp: 'B', guid: newId }, "The data source should call dataSourceDidComplete with dataHash");
      }
    };

    store.dataSourceDidFetchQuery = function (query) {
      ok(true, 'called', 'called', "The dataSourceDidFetchQuery callback is");

      expect(5); // Note, two dataSourceDidComplete calls should fire.
      start();
    };

    // Wait for the asynchronous events.
    stop(2000);
  });

  // Scenario: Don't allow connect on same database that is being deleted.
  // test("Integration: Calling connect on being deleted database, throws an exception.", function () {
  //   // Connect.
  //   dataSource.connect();

  //   var name = dataSource.get('name');

  //   // Once connected and ready, continue test.
  //   dataSource.addObserver('isReady', function () {

  //     if (dataSource.get('isReady')) {
  //       dataSource.removeObserver('isReady', this);

  //       dataSource.destroy();

  //       dataSource = SC.WebSQLDataSource.create({
  //         name: name,
  //         recordTypes: [RecordType]
  //       });

  //       try {
  //         dataSource.connect();
  //         ok(false, 'exception', 'exception', "Attempt to connect to closing database results in");
  //       } catch (ex) {
  //         ok(true, 'exception', 'exception', "Attempt to connect to closing database results in");
  //       }

  //       start();
  //     }
  //   });

  //   stop(2000);
  // });
}
