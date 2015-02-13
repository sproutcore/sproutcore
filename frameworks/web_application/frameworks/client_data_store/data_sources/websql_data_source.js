// ==========================================================================
// Project:   SproutCore - Web Application - Client Data Store
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/** @class
  @extends SC.DataSource
  @since SproutCore 1.12.0
*/
SC.WebSQLDataSource = SC.DataSource.extend(SC.StatechartManager,
/** @scope SC.WebSQLDataSource.prototype */ {

  /// ---------------------------------------------------------------------------------------------
  /// Properties
  ///

  /** @private The open database. */
  _sc_db: null,

  /** @private Queued actions while the database is not yet accessible. */
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
    The initial size of the database.

    @type Number
    @default 2097152
    */
  initialSize: 2097152, // 2MB

  /**
    Whether the database is connected or not. It may not be ready, due to being initialized or
    migrated.

    @type Boolean
    @default false
    */
  isConnected: function () {
    return this.stateIsEntered('Connected');
  }.property('enteredStates').cacheable(),

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
    The version of the schema.

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

  /** @private */
  _sc_tableNameForRecordType: function (recordType) {
    var className = SC._object_className(recordType); // .prototype.constructor

    return className.split('.')[1].toLowerCase();
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

    //@if(debug)
    var version = this.get('version'),
        name = this.get('name'),
        recordTypes = this.get('recordTypes');

    // Debug mode only developer support to prevent improper versions being set on create.
    /*jshint eqeqeq:false*/
    if (!version) {
      SC.throw("Developer Error: The WebSQLDataSource version value must be set on create.");
    } else if (version != version.toFixed(0)) {
      SC.throw("Developer Error: The WebSQLDataSource version must be an integer Number. The given value, %@, is invalid.".fmt(version));
    }

    // Debug mode only developer support to prevent missing name on create.
    /*jshint eqeqeq:false*/
    if (!name) {
      SC.throw("Developer Error: The WebSQLDataSource name value must be set on create.");
    }

    // Debug mode only developer support to prevent missing recordTypes on create.
    /*jshint eqeqeq:false*/
    if (!recordTypes) {
      SC.throw("Developer Error: The WebSQLDataSource recordTypes value must be set on create.");
    }
    //@endif

  },

  /** @see SC.Object#destroy */
  destroy: function () {
    // If this data source auto-created a database, then a call to destroy the data source should
    // destroy the database as well.
    if (this.get('isConnected')) {
      var dbName = this.get('name');

      // Lock the database by name. This prevents the issue where an IndexedDB database is opened
      // with the same name as one that is being deleted.
      var K = SC.WebSQLDataSource,
          databaseLocks = K._sc_databaseLocks;
      if (databaseLocks === null) { databaseLocks = K._sc_databaseLocks = {}; }
      if (databaseLocks[dbName] === undefined) { databaseLocks[dbName] = {}; }

      var recordTypes = this.get('recordTypes');
      for (var i = 0, len = recordTypes.get('length'); i < len; i++) {
        var recordType = recordTypes.objectAt(i),
            tableName;

        tableName = this._sc_tableNameForRecordType(recordType);
        databaseLocks[dbName][tableName] = true;
        SC.WebSQLAdaptor.deleteTable(this._sc_db, tableName,

          // onSuccess
          function (tableName) {
            SC.WebSQLDataSource._sc_databaseLocks[dbName][tableName] = null;

            // TODO: unlock the database when all tables are cleared.
          },

          // onError
          function () {
          });
      }

      this._sc_db = this._sc_queue = null;
    }

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
              dbInitialSize = statechart.get('initialSize'),
              dbVersion = statechart.get('version');

          // Don't allow open on databases that are being deleted.
          var K = SC.WebSQLDataSource,
              databaseLocks = K._sc_databaseLocks;
          if (databaseLocks !== null && databaseLocks[dbName]) {
            SC.throw("Developer Error: Attempted to open a database with the same name as one that was being deleted.");
          }

          // Connect to the database.
          SC.WebSQLAdaptor.connectDatabase(dbName, dbVersion, { size: dbInitialSize },

            // onsuccess
            function (db) {
              // Track the db.
              statechart._sc_db = db;

              // Send event to statechart.
              statechart.sendEvent('didConnect');
            },

            // onerror
            function () {

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

          recordTypeName = this.statechart._sc_tableNameForRecordType(recordType);

          SC.WebSQLAdaptor.insertRow(db, recordTypeName, dataHash,

            // onSuccess
            function (newId) {
              // Insert the new ID in the data hash.
              dataHash.guid = newId;
              store.dataSourceDidComplete(storeKey, dataHash, newId);
            },

            // onError
            function (error) {
              console.error(error);
            });
        },

        destroyRecord: function (store, storeKey) {
          console.log("%@ - destroyRecord()".fmt(this));
          var db = this.statechart._sc_db,
              recordType = store.recordTypeFor(storeKey),
              recordTypeName,
              id;

          recordTypeName = this.statechart._sc_tableNameForRecordType(recordType);
          id = store.idFor(storeKey);

          SC.WebSQLAdaptor.deleteRow(db, recordTypeName, id, function () {
            store.dataSourceDidDestroy(storeKey);
          });
        },

        fetch: function (store, query) {
          console.log("%@ - fetch()".fmt(this));
          var db = this.statechart._sc_db,
              recordType = query.recordType,
              recordTypeName;

          recordTypeName = this.statechart._sc_tableNameForRecordType(recordType);

          SC.WebSQLAdaptor.getRows(db, recordTypeName,
            // onRowSuccess
            function (result) {
              store.loadRecord(recordType, result);
            },

            // onSuccess
            function () {
              store.dataSourceDidFetchQuery(query);
            },

            // onError
            function (error) {
              console.error(error);
            });
        },

        retrieveRecord: function (store, storeKey) {
          console.log("%@ - retrieveRecord()".fmt(this));
          var db = this.statechart._sc_db,
              recordType = store.recordTypeFor(storeKey),
              recordTypeName,
              id;

          recordTypeName = this.statechart._sc_tableNameForRecordType(recordType);
          id = store.idFor(storeKey);

          SC.WebSQLAdaptor.getRow(db, recordTypeName, id,
            // onSuccess
            function (result) {
              store.loadRecord(recordType, result);
            },

            // onError
            function (error) {
              console.error(error);
            });
        },

        updateRecord: function (store, storeKey) {
          console.log("%@ - updateRecord()".fmt(this));
          var dataHash = store.readDataHash(storeKey),
              db = this.statechart._sc_db,
              recordType = store.recordTypeFor(storeKey),
              recordTypeName;

          recordTypeName = this.statechart._sc_tableNameForRecordType(recordType);

          SC.WebSQLAdaptor.updateRow(db, recordTypeName, dataHash,
            // onSuccess
            function () {
              store.dataSourceDidComplete(storeKey);
            },

            // onError
            function (error) {
              console.error(error);
            });
        }
      }),

      Migrating: SC.Substate.extend({

        enterSubstate: function (context) {
          console.log("%@ - migrating()".fmt(this));
          var db = this.statechart._sc_db;

          // Create object stores for each record type as necessary. This is a simple ORM.
          var statechart = this.statechart,
              namespace = statechart.get('name'),
              recordTypes = [],//statechart.get('recordTypes'),
              recordType,
              len,// = recordTypes.get('length'),
              key,
              count = 0;

          var appDomain = window[namespace];
          for (var aKey in appDomain) {
            if (!appDomain.hasOwnProperty(aKey)) { continue; }

            if (SC.kindOf(appDomain[aKey], SC.Record)) { recordTypes.push(appDomain[aKey]); }
          }

          len = recordTypes.length;

          var optionsPerType = {}, // A list of creates by record type.
              relationMaps, // A list of toMany relationships.
              inverses,
              relationMap;

          for (var i = 0; i < len; i++) {
            recordType = recordTypes.objectAt(i);

            console.log('Prepping %@'.fmt(recordType));
            var prototype = recordType.prototype,
                options = {
                  columns: []
                };

            // Get the attributes of the record type.
            for (key in prototype) {
              // Don't block superclass's attributes. if (!prototype.hasOwnProperty(key)) { continue; }

              if (prototype[key] && prototype[key].isRecordAttribute) {
                var attribute = prototype[key],
                    name = attribute.key || key,
                    type = attribute.type;

                // Map SC.RecordAttribute types to SQLite types.
                // TODO: An option may be to store all data as JSON strings in a single column.
                if (SC.kindOf(attribute, SC.SingleAttribute)) {
                  // Foreign key stored on record.
                  options.columns.push(name + ' INTEGER');
                  // console.log("... adding foreign constraint: %@".fmt(name));
                } else if (SC.kindOf(attribute, SC.ManyAttribute)) {
                  // Foreign key stored on other relationship *unless* many-to-many.
                  if (!relationMaps) { relationMaps = {}; inverses = {}; } // lazily instantiate only if necessary.

                  // relationMaps.push(attribute);
                  relationMap = [recordType, name, type, attribute.inverse]; // [From Record, attribute, To Many Record, Inverse Attribute]
                  // if (attribute.inverse) { inverses[relatedName] = attribute; }
                  var relationKey = SC._object_className(recordType) + ',' + name;
                  relationMaps[relationKey] = relationMap;
                  // console.log("... prepping to-many constraint: %@".fmt(relationKey));
                } else {
                  switch (type) {
                  case Boolean:
                    type = 'INTEGER';
                    break;
                  case Number:
                    type = 'REAL';
                    break;
                  case String:
                    type = 'TEXT';
                    break;
                  case SC.DateTime:
                    type = 'TEXT'; // ISO8601 "YYYY-MM-DD HH:MM:SS.SSS"
                    break;
                  default:
                  }

                  options.columns.push(name + ' ' + type);
                  // console.log("... adding column: %@".fmt(name));
                }
              }
            }

            optionsPerType[recordType] = options;
          }

          // Deal with one-to-many and many-to-many relationships.
          for (key in relationMaps) {
            relationMap = relationMaps[key];

            console.log("Resolving to-many constraints %@.%@ => %@.%@".fmt(relationMap[0],relationMap[1],relationMap[2],relationMap[3]));

            var attributeName = relationMap[1],
                inverseAttributeName = relationMap[3];
            if (inverseAttributeName) {
              var inverseKey = relationMap[2] + ',' + attributeName;

              // If there is an inverse toMany attribute, then create a join table.
              if (relationMaps[inverseKey]) {
                console.log('... Adding JOIN table');
                var joinTableName = this.statechart._sc_tableNameForRecordType(relationMap[0]) + '_' +
                    attributeName + '_' +
                    relationMap[2].split('.')[1].toLowerCase() + '_' +
                    inverseAttributeName;

                // Special case A.others <=> B.others
                if (attributeName === inverseAttributeName) {
                  attributeName += '_a';
                  inverseAttributeName += '_b';
                }
                var joinOptions = {
                  columns: [attributeName + ' INTEGER', inverseAttributeName + ' INTEGER']
                };

                SC.WebSQLAdaptor.createTable(db, joinTableName, joinOptions,
                  // onSuccess
                  function () {},

                  // onError
                  function (error) {
                    console.error(error);
                  });

                // Remove the other relation to avoid this happening again.
                relationMaps[inverseKey] = undefined;

              // It is a many-to-one, add the foreign key to the other record.
              } else {
                // // Use the inverse key so that we don't collide with other attributes.
                // var column = inverseAttributeName + ' INTEGER';
                // if (optionsPerType[relationMap[2]].columns.indexOf(column) < 0) {
                //   optionsPerType[relationMap[2]].columns.push(column);
                // }
                console.error("Can't yet store toMany relationships on the record (i.e. an Array) in WebSQL.");
              }
            }
          }

          // Now create the tables.
          var waitFunc = function () {
              count++;

              // Once all tables are created, continue.
              if (count === len) {
                statechart.sendEvent('didMigrate');
              }
            };

          for (i = 0; i < len; i++) {
            var recordTypeName;

            recordType = recordTypes.objectAt(i);
            recordTypeName = this.statechart._sc_tableNameForRecordType(recordType);

            SC.WebSQLAdaptor.createTable(db, recordTypeName, optionsPerType[recordType],
              // onSuccess
              waitFunc,

              // onError
              function (error) {
                console.error(error);
              });
          }
        }

      })
    })
  })

});



SC.WebSQLDataSource.mixin(
/* @scope SC.WebSQLDataSource */ {

  /** @private Locks on databases by name to prevent opening a database that is being deleted. */
  _sc_databaseLocks: null

});
