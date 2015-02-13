// ==========================================================================
// Project:   SproutCore - Web Application - Client Data Store
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
sc_require('data_sources/indexeddb_data_source');
sc_require('data_sources/websql_data_source');


/** @class
  A generic data source for communicating with client storage, IndexedDB or WebSQL, dependent on
  browser support.

  Depending on which client storage option is available, the SC.ClientDataSource will automatically
  proxy requests to either an IndexedDB (SC.IndexedDBDataSource) or a WebSQL (SC.WebSQLDataSource)
  data source.

  Note. For browsers that support both client storage options, WebSQL takes preference. The reason
  for this is that browsers that do support both (like Safari) tend to have full support for
  WebSQL and only partial support for IndexedDB [circa 2015].

  @extends SC.DataSource
  @since SproutCore 1.12.0
*/
SC.ClientDataSource = SC.DataSource.extend(
/** @scope SC.ClientDataSource.prototype */ {

  // ---------------------------------------------------------------------------------------------
  // Properties
  //

  /** @private The assigned client store data source. WebSQL is preferred if both are available. */
  _sc_assignedDataSource: null,

  // ---------------------------------------------------------------------------------------------
  // Methods
  //

  /**
    Inserts the record into the client store.

    @see SC.DataSource#createRecord
  */
  createRecord: function (store, storeKey, params) {
    if (this._sc_assignedDataSource) {
      this._sc_assignedDataSource.createRecord(store, storeKey);

      return true;
    } else {
      return false;
    }
  },

  /** @see SC.Object#destroy */
  destroy: function () {
    if (this._sc_assignedDataSource) {
      this._sc_assignedDataSource.destroy();
    }

    sc_super();
  },

  /** @see SC.DataSource#destroyRecord */
  destroyRecord: function (store, storeKey, params) {
    if (this._sc_assignedDataSource) {
      this._sc_assignedDataSource.destroyRecord(store, storeKey);

      return true;
    } else {
      return false;
    }
  },

  /** @see SC.Object#init */
  init: function () {
    sc_super();

    // Attempt to assign a client store adaptor.
    if (SC.platform.supportsWebSQL) {
      this._sc_assignedDataSource = SC.WebSQLDataSource.create();
    } else if (SC.platform.supportsIndexedDB) {
      this._sc_assignedDataSource = SC.IndexedDBDataSource.create();
    }
  },

  /** @see SC.DataSource#fetch */
  fetch: function (store, query) {
    if (this._sc_assignedDataSource) {
      this._sc_assignedDataSource.fetch(store, query);

      return true;
    } else {
      return false;
    }
  },

  /** @see SC.DataSource#retrieveRecord */
  retrieveRecord: function (store, storeKey, id) {
    if (this._sc_assignedDataSource) {
      this._sc_assignedDataSource.retrieveRecord(store, storeKey);

      return true;
    } else {
      return false;
    }
  },

  /** @see SC.DataSource#updateRecord */
  updateRecord: function (store, storeKey, params) {
    if (this._sc_assignedDataSource) {
      this._sc_assignedDataSource.updateRecord(store, storeKey);

      return true;
    } else {
      return false;
    }
  }

});
