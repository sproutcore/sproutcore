// ==========================================================================
// Project:   SproutCore - Web Application - Client Data Store
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/** @class
  @extends Object
  @since SproutCore 1.12.0
*/
SC.WebSQLAdaptor = {

  connectDatabase: function (name, version, options, onSuccess, onError, onUpgrade) {
    var database,
        size;

    if (options !== null) {
      /*jshint eqnull:true*/
      size = options.size != null ? options.size : 1024 * 1024 * 2; // Request 2MB by default.
    }

    database = window.openDatabase(name, version, 'SproutCore: ' + name, size);
    database.transaction(function (tx) {
      tx.executeSql('SELECT 1+1', [],
        function (tx, results) {
          SC.run(function () {
            onUpgrade(database);
            onSuccess(database);
          });
        },
        function (tx, e) {
          SC.run(function () {
            onError(e);
          });
        });
    });

    // database.onerror = function (tx, event) {
    //   SC.run(function () {
    //     console.log('connectDatabase(): error');
    //     onError(event);
    //   });
    // };

    // database.onsuccess = function(tx, r) {
    //   SC.run(function () {
    //     console.log('connectDatabase(): success');
    //     console.dir(r);
    //     onSuccess(database);
    //   });
    // };
  },

  createTable: function (database, tableName, options, onSuccess, onError) {
    var columns = options.columns,
        sql;

    // sql = 'CREATE TABLE IF NOT EXISTS %@ (%@, %@)'.fmt(tableName, columns.join(','), 'PRIMARY KEY (' + primaryKeyName + ')');
    sql = 'CREATE TABLE IF NOT EXISTS %@ (%@)'.fmt(tableName, columns.join(','));

    console.log('createTable: sql: %@'.fmt(sql));
    database.transaction(function (tx) {
      tx.executeSql(sql, [],
        function (tx, results) {
          SC.run(function () {
            onSuccess();
          });
        },
        function (tx, e) {
          SC.run(function () {
            onError(e);
          });
        });
    });
  },

  deleteDatabase: function (name, onSuccess, onError) {
    //@if(debug)
    SC.warn("Developer Warning: It is not possible to delete WebSQL databases.");
    //@endif

    onSuccess();
  },

  deleteRow: function (database, tableName, primaryKeyValue, onSuccess, onError) {
    var sql;

    sql = 'DELETE FROM %@ WHERE rowid = ?'.fmt(tableName);

    console.log('deleteRow: sql: %@'.fmt(sql));
    database.transaction(function (tx) {
      tx.executeSql(sql, [primaryKeyValue],
        function (tx) {
          SC.run(function () {
            onSuccess();
          });
        },
        function (tx, e) {
          SC.run(function () {
            onError(e);
          });
        });
    });
  },

  deleteTable: function (database, tableName, onSuccess, onError) {
    var sql;

    // sql = 'CREATE TABLE IF NOT EXISTS %@ (%@, %@)'.fmt(tableName, columns.join(','), 'PRIMARY KEY (' + primaryKeyName + ')');
    sql = 'DROP TABLE %@'.fmt(tableName);

    database.transaction(function (tx) {
      tx.executeSql(sql, [],
        function (tx, results) {
          SC.run(function () {
            onSuccess(tableName);
          });
        },
        function (tx, e) {
          SC.run(function () {
            onError(e);
          });
        });
    });
  },

  getRow: function (database, tableName, primaryKeyValue, onSuccess, onError) {
    var sql;

    sql = 'SELECT rowid AS sc_client_id, * FROM %@ WHERE rowid = ? LIMIT 1'.fmt(tableName);

    console.log('getRow: sql: %@'.fmt(sql));
    database.transaction(function (tx) {
      tx.executeSql(sql, [primaryKeyValue + ''],
        function (tx, results) {
          SC.run(function () {
            var result = null;

            if (results.rows.length > 0) {
              result = results.rows.item(0);
            }

            onSuccess(result);
          });
        },
        function (tx, e) {
          SC.run(function () {
            onError(e);
          });
        });
    });
  },

  getRows: function (database, tableName, onRowSuccess, onSuccess, onError) {
    var sql;

    sql = 'SELECT rowid AS sc_client_id, * FROM %@'.fmt(tableName);

    console.log('getRows: sql: %@'.fmt(sql));
    database.transaction(function (tx) {
      tx.executeSql(sql, [],
        function (tx, cursor) {
          SC.run(function () {
            for (var i = 0, len = cursor.rows.length; i < len; i++) {
              onRowSuccess(cursor.rows.item(i));
            }

            onSuccess();
          });
        },
        function (tx, e) {
          SC.run(function () {
            onError(e);
          });
        });
    });
  },

  insertRow: function (database, tableName, dataHash, onSuccess, onError) {
    var columns = [],
        values = [],
        qMarks = [],
        sql;

    // Convert dataHash into keys, values.
    for (var key in dataHash) {
      if (!dataHash.hasOwnProperty(key)) { continue; }

      var value = dataHash[key];

      // Transform undefined to null.
      if (value === undefined) { value = null; }

      columns.push(key);
      values.push(value);
      qMarks.push('?');
    }

    sql = 'INSERT INTO %@ (%@) VALUES (%@)'.fmt(tableName, columns.join(','), qMarks.join(','));

    database.transaction(function (tx) {
      tx.executeSql(sql, values,
        function (tx, result) {
          SC.run(function () {
            onSuccess(result.insertId); // Return the newly created rowid.
          });
        },
        function (tx, e) {
          SC.run(function () {
            onError(e);
          });
        });

    });
  },

  updateRow: function (database, tableName, dataHash, onSuccess, onError) {
    var updates = [],
        values = [],
        primaryKeyValue,
        sql;

    // Convert dataHash into keys, values.
    for (var key in dataHash) {
      if (!dataHash.hasOwnProperty(key)) { continue; }

      var value = dataHash[key];

      // Ignore update to `sc_client_id`, but use the value.
      if (key === 'sc_client_id') {
        primaryKeyValue = value;

        continue;
      }

      // Transform undefined to null.
      if (value === undefined) { value = null; }

      updates.push(key + '=?');
      values.push(value);
    }

    // Add the primary key value last.
    values.push(primaryKeyValue);

    sql = 'UPDATE %@ SET %@ WHERE rowid = ?'.fmt(tableName, updates.join(','));

    console.log('updateRow: sql: %@'.fmt(sql));
    database.transaction(function (tx) {
      tx.executeSql(sql, values,
        function (tx) {
          SC.run(function () {
            onSuccess();
          });
        },
        function (tx, e) {
          SC.run(function () {
            onError(e);
          });
        });
    });
  }
};
