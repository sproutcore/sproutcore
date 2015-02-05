// ==========================================================================
// Project:   SproutCore - Web Application - Client Data Store
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module, test, ok, equals, same */

var clientDataSource;
module("SC.ClientDataSource", {

  setup: function () {
    clientDataSource = SC.ClientDataSource.create();
  },

  teardown: function () {
    clientDataSource.destroy();
    clientDataSource = null;
  }
});

/* Properties */

test("Default Properties:", function () {
  clientDataSource.destroy();

  // When nothing is supported.
  SC.platform.supportsIndexedDB = false;
  SC.platform.supportsWebSQL = false;
  clientDataSource = SC.ClientDataSource.create();
  equals(clientDataSource._sc_assignedDataSource, null, "The default value of _sc_assignedDataSource is");
  clientDataSource.destroy();

  // When only IndexedDB is supported.
  SC.platform.supportsIndexedDB = true;
  SC.platform.supportsWebSQL = false;
  clientDataSource = SC.ClientDataSource.create();
  ok(clientDataSource._sc_assignedDataSource.kindOf(SC.IndexedDBDataSource), "SC.IndexedDBDataSource instance", "SC.IndexedDBDataSource instance", "The default value of _sc_assignedDataSource is an");
  clientDataSource.destroy();

  // When only WebSQL is supported.
  SC.platform.supportsIndexedDB = false;
  SC.platform.supportsWebSQL = true;
  clientDataSource = SC.ClientDataSource.create();
  ok(clientDataSource._sc_assignedDataSource.kindOf(SC.WebSQLDataSource), "SC.WebSQLDataSource instance", "SC.WebSQLDataSource instance", "The default value of _sc_assignedDataSource is a");
  clientDataSource.destroy();

  // When IndexedDB and WebSQL are supported.
  SC.platform.supportsIndexedDB = true;
  SC.platform.supportsWebSQL = true;
  clientDataSource = SC.ClientDataSource.create();
  ok(clientDataSource._sc_assignedDataSource.kindOf(SC.WebSQLDataSource), "SC.WebSQLDataSource instance", "SC.WebSQLDataSource instance", "The default value of _sc_assignedDataSource is a");
});

/* Methods */

// This method calls createRecord on the supported data source.
test("Method: createRecord", function () {
  ok(SC.ClientDataSource.prototype.createRecord !== undefined, 'defined', 'defined', "The method is");
});

// This method calls destroyRecord on the supported data source.
test("Method: destroyRecord", function () {
  ok(SC.ClientDataSource.prototype.destroyRecord !== undefined, 'defined', 'defined', "The method is");
});

// This method calls fetch on the supported data source.
test("Method: fetch", function () {
  ok(SC.ClientDataSource.prototype.fetch !== undefined, 'defined', 'defined', "The method is");
});

// This method calls retrieveRecord on the supported data source.
test("Method: retrieveRecord", function () {
  ok(SC.ClientDataSource.prototype.retrieveRecord !== undefined, 'defined', 'defined', "The method is");
});

// This method calls updateRecord on the supported data source.
test("Method: updateRecord", function () {
  ok(SC.ClientDataSource.prototype.updateRecord !== undefined, 'defined', 'defined', "The method is");
});

