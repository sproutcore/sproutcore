// ==========================================================================
// Project:   SproutCore - Web Application - Client Data Store
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/** @class
  @extends SC.DataSource
  @since SproutCore 1.12.0
*/
SC.IndexedDBDataSource = SC.DataSource.extend(SC.StatechartManager,
/** @scope SC.IndexedDBDataSource.prototype */ {

  /// ---------------------------------------------------------------------------------------------
  /// Properties
  ///

  /** @private The open database(s). */
  _sc_db: null,

  /** @private Queued actions while the database is not accessible. */
  _sc_queue: null,

  /** @private Useful or not?
    Whether to connect to the database immediately or not.

    If true, the database connection will be opened immediately when this data source is created.
    Otherwise, the database will not be opened until the data source is used.

    @type Boolean
    @default false
    */
  connectOnInit: false,

  /**
    Whether the database is connected and ready or not.

    @type Boolean
    @default false
    */
  isReady: function () {
    return this.stateIsEntered('Connected.Ready');
  }.property('enteredStates').cacheable(),

  /**
    The name of the database.

    This is required in order to maintain an IndexedDB database between sessions.

    @type String
    @default null
    */
  name: null,

  /**
    The record types that will be stored in the IndexedDB database.

    This is required in order for tables to be created for each record type when the database is
    first initialized.

    @type Array
    @default null
    */
  recordTypes: null,

  /**
    The version of the data.

    @type Number
    @default 1
    */
  version: 1,

  /// ---------------------------------------------------------------------------------------------
  /// Methods
  ///

  /** @private */
  _sc_addToQueue: function (context) {
    var queue = this._sc_queue;

    // Queue up the actions in order for when the database is connected.
    if (queue === null) { queue = this._sc_queue = []; }
    queue.push(context);
  },

  /**
    Opens the connection to the IndexedDB database.

    If the database is already open, this has no effect.

    @returns {void}
  */
  connect: function () {
    this.invokeStateMethod('connect');
  },

  /**
    Inserts the record into the IndexedDB store.

    @see SC.DataSource#createRecord
  */
  createRecord: function (store, storeKey) {
    this.invokeStateMethod('createRecord', store, storeKey);
  },

  /**
    Removes the record from the IndexedDB store.

    @see SC.DataSource#destroyRecord
  */
  destroyRecord: function (store, storeKey) {
    this.invokeStateMethod('destroyRecord', store, storeKey);
  },

  /** @see SC.Object#init */
  init: function () {
    sc_super();

    var version = this.get('version'),
        name = this.get('name');

    //@if(debug)
    // Debug mode only developer support to prevent improper versions being set on create.
    /*jshint eqeqeq:false*/
    if (!version) {
      SC.error("Developer Error: The IndexedDB version value must be set on create.");
    } else if (version != version.toFixed(0)) {
      SC.error("Developer Error: The IndexedDB version must be an integer Number. The given value, %@, is invalid.".fmt(version));
    }

    // Debug mode only developer support to prevent missing name on create.
    /*jshint eqeqeq:false*/
    if (!name) {
      SC.error("Developer Error: The IndexedDB name value must be set on create.");
    }
    //@endif

  },

  /** @see SC.Object#destroy */
  destroy: function () {
    var dbName = this.get('name');

    // Lock the database by name. This prevents the issue where an IndexedDB database is opened
    // with the same name as one that is being deleted.
    var K = SC.IndexedDBDataSource,
        databaseLocks = K._sc_databaseLocks;
    if (databaseLocks === null) { databaseLocks = K._sc_databaseLocks = {}; }
    databaseLocks[dbName] = true;

    SC.IndexedDBAdaptor.deleteDatabase(dbName,

      // onSuccess
      function () {
        SC.IndexedDBDataSource._sc_databaseLocks[dbName] = null;
      },

      // onError
      function () {
      });

    this._sc_db = this._sc_queue = null;

    sc_super();
  },

  /**
    Retrieves all records matching the query from the IndexedDB store.

    @see SC.DataSource#createRecord
  */
  fetch: function (store, query) {
    this.invokeStateMethod('fetch', store, query);
  },

  /**
    Retrieves a record from the IndexedDB store.

    @see SC.DataSource#retrieveRecord
  */
  retrieveRecord: function (store, storeKey) {
    this.invokeStateMethod('retrieveRecord', store, storeKey);
  },

  /**
    Updates a record in the IndexedDB store.

    @see SC.DataSource#updateRecord
  */
  updateRecord: function (store, storeKey) {
    this.invokeStateMethod('updateRecord', store, storeKey);
  },

  /// ---------------------------------------------------------------------------------------------
  /// Statechart
  ///

  // trace: true,

  /** @see SC.StatechartManager.prototype.rootSubstate */
  rootSubstate: SC.Substate.extend({

    ///
    /// Properties
    ///

    initialSubstate: 'Disconnected',

    ///
    /// Events
    ///

    didConnect: function (context) {
      // Substates must always route only their descendents.
      this.gotoSubstate('Connected.Ready', context);
    },

    doUpgrade: function (context) {
      // Substates must always route only their descendents.
      this.gotoSubstate('Connected.Migrating', context);
    },

    ///
    /// Methods
    ///

    createRecord: function (store, storeKey) {
      // Queue up the request.
      this.statechart._sc_addToQueue({ action: 'createRecord', arg1: store, arg2: storeKey });
    },

    destroyRecord: function (store, storeKey) {
      // Queue up the request.
      this.statechart._sc_addToQueue({ action: 'destroyRecord', arg1: store, arg2: storeKey });
    },

    fetch: function (store, query) {
      // Queue up the request.
      this.statechart._sc_addToQueue({ action: 'fetch', arg1: store, arg2: query });
    },

    retrieveRecord: function (store, storeKey) {
      // Queue up the request.
      this.statechart._sc_addToQueue({ action: 'retrieveRecord', arg1: store, arg2: storeKey });
    },

    updateRecord: function (store, storeKey) {
      // Queue up the request.
      this.statechart._sc_addToQueue({ action: 'updateRecord', arg1: store, arg2: storeKey });
    },

    ///
    /// Substates
    ///

    Disconnected: SC.Substate.extend({

      /// Properties

      initialSubstate: 'Ready',

      /// Events

      didStartConnect: function (context) {
        // Substates must always route only their descendents.
        this.gotoSubstate('Connecting');
      },

      /// Substates

      Ready: SC.Substate.extend({

        /** @private */
        _sc_connectToDatabase: function () {
          var statechart = this.statechart,
              dbName = statechart.get('name'),
              dbVersion = statechart.get('version');

          // Don't allow open on databases that are being deleted.
          var K = SC.IndexedDBDataSource,
              databaseLocks = K._sc_databaseLocks;
          if (databaseLocks !== null && databaseLocks[dbName]) {
            SC.throw("Developer Error: Attempted to open a database with the same name as one that was being deleted.");
          }

          // Connect to the database.
          SC.IndexedDBAdaptor.connectDatabase(dbName, dbVersion,

            // onsuccess
            function (db) {
              // Track the db.
              statechart._sc_db = db;

              // Send event to statechart.
              statechart.sendEvent('didConnect');
            },

            // onupgradeneeded
            function (db) {
              // Track the db.
              statechart._sc_db = db;

              // Send event to statechart.
              statechart.sendEvent('doUpgrade');
            });
        },

        enterSubstate: function () {
          if (this.statechart.get('connectOnInit')) {
            // Connect to database.
            this.connect();
          }
        },

        connect: function () {
          // Connect to database.
          this._sc_connectToDatabase();

          // Send event to statechart.
          this.statechart.sendEvent('didStartConnect');
        },

        destroyRecord: function (store, storeKey) {
          // Queue up the request.
          this.statechart._sc_addToQueue({ action: 'destroyRecord', arg1: store, arg2: storeKey });

          // Connect to database.
          this.connect();
        },

        createRecord: function (store, storeKey) {
          // Queue up the request.
          this.statechart._sc_addToQueue({ action: 'createRecord', arg1: store, arg2: storeKey });

          // Connect to database.
          this.connect();
        },

        fetch: function (store, query) {
          // Queue up the request.
          this.statechart._sc_addToQueue({ action: 'fetch', arg1: store, arg2: query });

          // Connect to database.
          this.connect();
        },

        retrieveRecord: function (store, storeKey) {
          // Queue up the request.
          this.statechart._sc_addToQueue({ action: 'retrieveRecord', arg1: store, arg2: storeKey });

          // Connect to database.
          this.connect();
        },

        updateRecord: function (store, storeKey) {
          // Queue up the request.
          this.statechart._sc_addToQueue({ action: 'updateRecord', arg1: store, arg2: storeKey });

          // Connect to database.
          this.connect();
        }

      }),

      Connecting: SC.Substate

    }),

    Connected: SC.Substate.extend({

      initialSubstate: 'Undetermined',

      // IndexedDB calls the onsuccess function on top of onupgradeneeded.
      // didConnect: function (context) {
      //   // noop
      // },

      // didMigrate: function (context) {
      //   console.log('didMigrate: statechart.isDestroyed: %@'.fmt(this.statechart.get('isDestroyed')));
      //   // Substates must always route only their descendents.
      //   this.gotoSubstate('Ready', context);
      // },

      Undetermined: SC.Substate,

      Ready: SC.Substate.extend({

        enterSubstate: function (context) {
          var queue = this.statechart._sc_queue;

          // Run through the queued up actions.
          if (queue !== null) {
            for (var i = 0, len = queue.length; i < len; i++) {
              var actionContext = queue[i];

              this[actionContext.action].call(this, actionContext.arg1, actionContext.arg2);
            }

            // Reset the queue.
            queue.length = 0;
          }
        },

        createRecord: function (store, storeKey) {
          console.log("%@ - createRecord()".fmt(this));
          var dataHash = store.readDataHash(storeKey),
              db = this.statechart._sc_db,
              recordType = store.recordTypeFor(storeKey),
              recordTypeName;

          recordTypeName = SC._object_className(recordType);

          SC.IndexedDBAdaptor.insertRow(db, recordTypeName, dataHash, function (newId) {
            var recordType = store.recordTypeFor(storeKey),
                primaryKeyName = recordType.prototype.primaryKey;

            // Insert the new ID in the data hash.
            dataHash[primaryKeyName] = newId;
            store.dataSourceDidComplete(storeKey, dataHash, newId);
          });
        },

        destroyRecord: function (store, storeKey) {
          console.log("%@ - destroyRecord()".fmt(this));
          var db = this.statechart._sc_db,
              recordType = store.recordTypeFor(storeKey),
              recordTypeName,
              id;

          recordTypeName = SC._object_className(recordType);
          id = store.idFor(storeKey);

          SC.IndexedDBAdaptor.deleteRow(db, recordTypeName, id, function () {
            store.dataSourceDidDestroy(storeKey);
          });
        },

        fetch: function (store, query) {
          console.log("%@ - fetch()".fmt(this));
          var db = this.statechart._sc_db,
              recordType = query.recordType,
              recordTypeName;

          recordTypeName = SC._object_className(recordType);

          SC.IndexedDBAdaptor.getRows(db, recordTypeName,
            function (result) {
              store.loadRecord(recordType, result);
            },

            function () {
              store.dataSourceDidFetchQuery(query);
            });
        },

        retrieveRecord: function (store, storeKey) {
          console.log("%@ - retrieveRecord()".fmt(this));
          var db = this.statechart._sc_db,
              recordType = store.recordTypeFor(storeKey),
              recordTypeName,
              id;

          recordTypeName = SC._object_className(recordType);
          id = store.idFor(storeKey);

          SC.IndexedDBAdaptor.getRow(db, recordTypeName, id,
            function (result) {
              store.loadRecord(recordType, result);
            });
        },

        updateRecord: function (store, storeKey) {
          console.log("%@ - updateRecord()".fmt(this));
          var dataHash = store.readDataHash(storeKey),
              db = this.statechart._sc_db,
              recordType = store.recordTypeFor(storeKey),
              recordTypeName;
              // id;

          recordTypeName = SC._object_className(recordType);
          // id = store.idFor(storeKey);

          SC.IndexedDBAdaptor.updateRow(db, recordTypeName, dataHash,
            function () {
              store.dataSourceDidComplete(storeKey);
            });
        }
      }),

      Migrating: SC.Substate.extend({

        enterSubstate: function (context) {
          var db = this.statechart._sc_db;

          // Create object stores for each record type as necessary.
          var statechart = this.statechart,
              recordTypes = statechart.recordTypes,
              len = recordTypes.length,
              count = 0;

          var waitFunc = function () {
              count++;

              // Once all tables are created, continue.
              if (count === len) {
                statechart.sendEvent('didMigrate');
              }
            };

          for (var i = 0; i < len; i++) {
            var recordType = recordTypes[i],
                recordTypeName,
                primaryKeyName;

            recordTypeName = SC._object_className(recordType);
            primaryKeyName = recordType.prototype.primaryKey;
            // if (!db.objectStoreNames.contains(recordTypeName)) {
            SC.IndexedDBAdaptor.createTable(db, recordTypeName, primaryKeyName, waitFunc);
            // }
          }
        }

      })
    })
  })

});


SC.IndexedDBDataSource.mixin(
/* @scope SC.IndexedDBDataSource */ {

  /** @private Locks on databases by name to prevent opening a database that is being deleted. */
  _sc_databaseLocks: null

});
