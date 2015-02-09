// ==========================================================================
// Project:   SproutCore - Web Application - Client Data Store
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/** @class
  @extends Object
  @since SproutCore 1.12.0
*/
SC.IndexedDBAdaptor = {

  connectDatabase: function (name, version, options, onSuccess, onError, onUpgrade) {
    var openDBRequest = window.indexedDB.open(name, version); // IDBOpenDBRequest

    // Called when an error is encountered on open. This could be the result of a user rejecting
    // access to storage.
    openDBRequest.onerror = function (event) {
      SC.run(function () {
        onError(event);
      });
    };

    // Called when the database is successfully re-opened.
    openDBRequest.onsuccess = function (event) {
      SC.run(function () {
        // Store the result of opening the database in the db variable.
        var db = openDBRequest.result;

        onSuccess(db);
      });
    };

    // Called when the database is first opened or the version has changed.
    openDBRequest.onupgradeneeded = function (event) {
      SC.run(function () {
        // Store the result of opening the database in the db variable.
        var db = openDBRequest.result;

        db.onversionchange = function (event) {
          console.warn("VERSION CHANGE!");
        };

        onUpgrade(db);
      });
    };
  },

  createTable: function (database, tableName, options, onSuccess, onError) {
    if (!database.objectStoreNames.contains(tableName)) {
      var objectStore = database.createObjectStore(tableName, {
        autoIncrement : true,
        keyPath: 'sc_client_id'
      });
    }

    // Use transaction oncomplete to make sure the objectStore creation is
    // finished before adding data into it.
    objectStore.transaction.oncomplete = function(event) {
      SC.run(function () {
        onSuccess();
      });
    };
  },

  deleteDatabase: function (name, onSuccess, onError) {
    var deleteDBRequest = window.indexedDB.deleteDatabase(name); // IDBOpenDBRequest

    // Called when an error is encountered on open. This could be the result of a user rejecting
    // access to storage.
    deleteDBRequest.onerror = function(event) {
      SC.run(function () {
        onError(event);
      });
    };

    // Called when the database is successfully re-opened.
    deleteDBRequest.onsuccess = function(event) {
      SC.run(function () {
        onSuccess();
      });
    };
  },

  deleteRow: function (database, tableName, primaryKey, onSuccess, onError) {
    // Start a new transaction on the appropriate tables.
    var transaction = database.transaction([tableName], "readwrite");
    var objectStore = transaction.objectStore(tableName);
    var request = objectStore.delete(primaryKey);

    transaction.onerror = request.onerror = function (event) {
      SC.run(function () {
        onError();
      });
    };

    // Call success when *entire* transaction is complete. Otherwise a read on the data will return
    // success.
    transaction.oncomplete = function(event) {
      SC.run(function () {
        onSuccess();
      });
    };
  },

  getRow: function (database, tableName, primaryKey, onSuccess, onError) {
    // Start a new transaction on the appropriate tables.
    var transaction = database.transaction([tableName], "readonly"),
        objectStore = transaction.objectStore(tableName),
        request = objectStore.get(primaryKey);

    request.onerror = function (event) {
      SC.run(function () {
        onError(event);
      });
    };

    request.onsuccess = function (event) {
      SC.run(function () {
        onSuccess(request.result || null);
      });
    };

  },

  getRows: function (database, tableName, onRowSuccess, onSuccess, onError) {
    // Start a new transaction on the appropriate tables.
    var transaction = database.transaction([tableName], "readonly");
    var objectStore = transaction.objectStore(tableName);

    objectStore.openCursor().onsuccess = function(event) {
      SC.run(function () {
        var cursor = event.target.result;
        if (cursor) {
          onRowSuccess(cursor.value);

          cursor.continue();
        } else {
          onSuccess();
        }
      });
    };

  },

  insertRow: function (database, tableName, dataHash, onSuccess, onError) {
    // Start a new transaction on the appropriate tables.
    var transaction = database.transaction([tableName], "readwrite");
    var objectStore = transaction.objectStore(tableName);
    var request = objectStore.add(dataHash),
        result;

    request.onsuccess = function (event) {
      SC.run(function () {
        result = event.target.result;
      });
    };

    transaction.onerror = request.onerror = function (event) {
      SC.run(function () {
        onError();
      });
    };

    // Call success when *entire* transaction is complete. Otherwise the data is not immediately readable.
    transaction.oncomplete = function () {
      SC.run(function () {
        onSuccess(result);
      });
    };
  },

  updateRow: function (database, tableName, dataHash, onSuccess, onError) {
    // Start a new transaction on the appropriate tables.
    var transaction = database.transaction([tableName], "readwrite");
    var objectStore = transaction.objectStore(tableName);
    var request = objectStore.put(dataHash);

    transaction.onerror = request.onerror = function (event) {
      SC.run(function () {
      });
    };

    // Call success when *entire* transaction is complete. Otherwise the data is not immediately updated.
    transaction.oncomplete = function () {
      SC.run(function () {
        onSuccess();
      });
    };
  }
};
