// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2011 Junction Networks
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
sc_require('data_sources/data_source');

/** @class

  A multiplexed data source will forward data to a number of registered
  {@link SC.DataSourceDelegate}s that accept the {@link SC.Record} type provided.
  This should be used when you have a single channel that has a multitude of
  record types that are non-trivial to transform into data hashes suitable for
  the store.

  For example,

      MyApp.dataSource = SC.MultiplexedDataSource.create({
        delegates: 'presence chat muc roster vcard'.w(),

        presence: MyApp.PresenceDataSourceDelegate,
        chat: MyApp.MessageDataSourceDelegate.extend({ type: 'chat' }),
        muc: MyApp.MultiUserChatSourceDelegate,
        roster: MyApp.RosterItemDataSourceDelegate,
        vcard: MyApp.VCardTempDataSourceDelegate
      });

      MyApp.store.set('dataSource', MyApp.dataSource);

  The order of the delegates is irrelevant. Queries and CRUD actions will
  be forwarded to the apropriated delegate(s).

  Alternatively, you can use a more jQuery-like API for defining your data
  sources:

      MyApp.dataSource = SC.MultiplexedDataSource.create()
        .from(MyApp.PresenceDataSourceDelegate)
        .from(MyApp.MessageDataSourceDelegate.extend({ type: 'chat' }))
        .from(MyApp.MultiUserChatSourceDelegate)
        .from(MyApp.RosterItemDataSourceDelegate)
        .from(MyApp.VCardTempDataSourceDelegate)

      MyApp.store.set('dataSource', MyApp.dataSource);

  A similar API can be used before creation time that allows {@link SC.DataSourceDelegate}s
  to be wired to their parent {@link SC.DataSource} via the `plugin` method.

  The child delegates have direct access to the parent {@link SC.MultiplexedDataSource},
  which acts like a hub where all common functions and properties should be
  placed.

  @since 1.7
  @extends SC.DataStore
 */
SC.MultiplexedDataSource = SC.DataSource.extend(
  /** @scope SC.MultiplexedDataSource.prototype */{

  /** @private
    A lookup table of delegates to use by record type.
    @type Hash
   */
  _ds_delegates: null,

  /**
    The delegates to be used by the multiplexed data source.
    
    @type String|String[]|SC.DataSourceDelegate|SC.DataSourceDelegate[]
   */
  delegates: null,

  /** @private
    Adds class instances of the delegates to this instance of the data source.
   */
  init: function () {
    var delegates = this.constructor.delegates || this.get('delegates') || [];
    if (!this._ds_delegates) this._ds_delegates = {};
    if (!SC.isArray(delegates)) delegates = [delegates];
    delegates.forEach(this.from, this);
  },

  /**
    Adds the delegate to be used by the DataSource for the record types
    it indicates.

    @param {SC.DataSourceDelegate|String} del The delegate to register for use
    @returns {SC.MultiplexedDataSource} The reciever.
   */
  from: function (del) {
    var delegate = del,
        recordTypes, recordType, i, len;
    if (SC.typeOf(del) === SC.T_STRING) {
      delegate = this.get(del);
    }

    if (SC.none(delegate)) {
      throw SC.$error("'%@' does not exist. Did you forget to require() it?".fmt(del));
    }

    delegate = delegate.create({
      dataSource: this
    });

    recordTypes = delegate.get('isDelegateFor');
    if (SC.none(recordTypes)) {
      throw SC.$error("'%@' has no SC.Records that it is delegating for. Did you forget to require() the record type, or is this delegate unused?".fmt(del));
    }
    if (!SC.isArray(recordTypes)) recordTypes = [recordTypes];

    len = recordTypes.length;
    for (i = 0; i < len; i++) {
      recordType = recordTypes[i];
      if (SC.typeOf(recordType) === SC.T_STRING) {
        recordType = SC.objectForPropertyPath(recordType);
        if (SC.none(recordType)) {
          throw SC.$error("'%@' does not exist. Did you forget to require() it?".fmt(recordTypes[i]));
        }
        recordType[i] = recordType;
      }
      this._ds_delegates[SC.guidFor(recordType)] = delegate;
    }
    return this;
  },

  /**
    Returns the {@link SC.DataSourceDelegate} that will delegate for
    the given {@link SC.Record}.

    @param {SC.Record} recordType The record type to lookup the delegate for.
    @returns {SC.DataSourceDelegate} The delegate responsible for the given record type.
   */
  delegateFor: function (recordType) {
    return this._ds_delegates[SC.guidFor(recordType)];
  },

  /**
    Invokes a method on a delegate, returning `YES` or `NO` depending on whether
    or not the request was handled.

    @param {SC.DataSourceDelegate} delegate The delegate to invoke the method on.
    @param {String} methodName The method to invoke on the delegate.
    @param {...} args The arguments to provide to the delegate.
    @returns {Boolean} Whether or not the request was handled by the delegate.
   */
  invokeDelegateMethod: function (delegate, methodName) {
    var args = SC.A(arguments).slice(2);
    if (!SC.none(delegate) && !SC.none(delegate[methodName])) {
      return delegate[methodName].apply(delegate, args);
    }
    return NO;
  },

  /**
    Passes through queries triggered by the store through a find() to the
    registered delegate for that record type.

    @param {SC.Store} store The requesting store.
    @param {SC.Query} query The query describing the request.
    @returns {Boolean} Whether or not the query was handled.
   */
  fetch: function (store, query) {
    return this.invokeDelegateMethod(this.delegateFor(query.recordType),
      "fetch", store, query);
  },

  /**
    Passes through queries triggered by the store through a find() to the
    registered delegate for that record type.

    @param {SC.Store} store The requesting store.
    @param {Number} storeKey The store key of the record to update.
    @param {Hash} [params] Parameters passed by commitRecords().
    @returns {Boolean} Whether or not the record update was handled.
   */
  updateRecord: function (store, storeKey, params) {
    return this.invokeDelegateMethod(this.delegateFor(store.recordTypeFor(storeKey)),
       "updateRecord", store, storeKey, params);
  },

  /**
    Passes through queries triggered by the store through a find() or a refresh()
    to the registered delegate for that record type.

    @param {SC.Store} store The requesting store.
    @param {Number} storeKey The store key of the record to retrieve.
    @param {String} id The ID of the record to retrieve.
    @returns {Boolean} Whether or not the record retrieval was handled.
   */
  retrieveRecord: function (store, storeKey, id) {
    return this.invokeDelegateMethod(this.delegateFor(store.recordTypeFor(storeKey)),
       "retrieveRecord", store, storeKey, id);
  },

  /**
    Passes through queries triggered by the store through a createRecord() to the
    registered delegate for that record type.

    @param {SC.Store} store The requesting store.
    @param {Number} storeKey The store key of the record to create.
    @param {Hash} [params] Parameters passed by commitRecords().
    @returns {Boolean} Whether or not the record creation was handled.
   */
  createRecord: function (store, storeKey, params) {
    return this.invokeDelegateMethod(this.delegateFor(store.recordTypeFor(storeKey)),
       "createRecord", store, storeKey, params);
  },

  /**
    Passes through queries triggered by the store through a destroy() to the
    registered delegate for that record type.

    @param {SC.Store} store The requesting store.
    @param {Number} storeKey The store key of the record to destroy.
    @param {Hash} [params] Parameters passed by commitRecords().
    @returns {Boolean} Whether or not the record destroy was handled.
   */
  destroyRecord: function (store, storeKey, params) {
    return this.invokeDelegateMethod(this.delegateFor(store.recordTypeFor(storeKey)),
       "destroyRecord", store, storeKey, params);
  }

});

SC.MultiplexedDataSource.mixin(
  /** @scope SC.MultiplexedDataSource */{

  /**
    The list of registered delegates.
    @default null
    @type SC.DataSourceDelegate[]
   */
  delegates: null,

  /**
    Registers a delegate to be used for an instance of {@link SC.MultiplexedDataSource}.
    @param {String|SC.DataSourceDelegate} delegate The delegate to register for all instances of the data source.
    @returns {SC.MultiplexedDataSource} The reciever.
   */
  plugin: function (delegate) {
    var delegates = this.delegates;
    if (!delegates) this.delegates = delegates = [];
    delegates.push(delegate);
    return this;
  }
});
