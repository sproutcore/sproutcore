// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('system/query');

/**
  @class

  A Record is the core model class in SproutCore. It is analogous to
  NSManagedObject in Core Data and EOEnterpriseObject in the Enterprise
  Objects Framework (aka WebObjects), or ActiveRecord::Base in Rails.

  To create a new model class, in your SproutCore workspace, do:

      $ sc-gen model MyApp.MyModel

  This will create MyApp.MyModel in clients/my_app/models/my_model.js.

  The core attributes hash is used to store the values of a record in a
  format that can be easily passed to/from the server.  The values should
  generally be stored in their raw string form.  References to external
  records should be stored as primary keys.

  Normally you do not need to work with the attributes hash directly.
  Instead you should use get/set on normal record properties.  If the
  property is not defined on the object, then the record will check the
  attributes hash instead.

  You can bulk update attributes from the server using the
  `updateAttributes()` method.

  @extends SC.Object
  @see SC.RecordAttribute
  @since SproutCore 1.0
*/
SC.Record = SC.Object.extend(
/** @scope SC.Record.prototype */ {

  //@if(debug)
  /* BEGIN DEBUG ONLY PROPERTIES AND METHODS */

  /** @private
    Creates string representation of record, with status.

    @returns {String}
  */
  toString: function () {
    // We won't use 'readOnlyAttributes' here because accessing them directly
    // avoids a SC.clone() -- we'll be careful not to edit anything.
    var attrs = this.get('store').readDataHash(this.get('storeKey'));
    return "%@(%@) %@".fmt(this.constructor.toString(), SC.inspect(attrs), this.statusString());
  },

  /** @private
    Creates string representation of record, with status.

    @returns {String}
  */

  statusString: function () {
    var ret = [], status = this.get('status');

    for (var prop in SC.Record) {
      if (prop.match(/[A-Z_]$/) && SC.Record[prop] === status) {
        ret.push(prop);
      }
    }

    return ret.join(" ");
  },

  /* END DEBUG ONLY PROPERTIES AND METHODS */
  //@endif

  /**
    Walk like a duck

    @type Boolean
    @default YES
  */
  isRecord: YES,

  /**
    If you have nested records

    @type Boolean
    @default NO
  */
  isParentRecord: NO,

  /**
    Indicates whether this SC.Record is nested within another SC.Record

    @property {Boolean}
  */
  isChildRecord: NO,

  // ...............................
  // PROPERTIES
  //

  /**
    This is the primary key used to distinguish records.  If the keys
    match, the records are assumed to be identical.

    @type String
    @default 'guid'
  */
  primaryKey: 'guid',

  /**
    Returns the id for the record instance.  The id is used to uniquely
    identify this record instance from all others of the same type.  If you
    have a `primaryKey set on this class, then the id will be the value of the
    `primaryKey` property on the underlying JSON hash.

    @type String
    @property
    @dependsOn storeKey
  */
  id: function (key, value) {
    var pk = this.get('primaryKey');
    var parent = this.get('parentObject');
    if (value !== undefined) {
      this.writeAttribute(pk, value);
      return value;
    } else {
      if (parent) {
        return this.readAttribute(pk);
      }
      else return SC.Store.idFor(this.storeKey);
    }
  }.property('storeKey').cacheable(),

  /**
    All records generally have a life cycle as they are created or loaded into
    memory, modified, committed and finally destroyed.  This life cycle is
    managed by the status property on your record.

    The status of a record is modelled as a finite state machine.  Based on the
    current state of the record, you can determine which operations are
    currently allowed on the record and which are not.

    In general, a record can be in one of five primary states:
    `SC.Record.EMPTY`, `SC.Record.BUSY`, `SC.Record.READY`,
    `SC.Record.DESTROYED`, `SC.Record.ERROR`.  These are all described in
    more detail in the class mixin (below) where they are defined.

    @type Number
    @property
    @dependsOn storeKey
  */
  status: function () {
    var parent = this.get('parentObject');
    if (parent) {
      if (this._sc_nestedrec_isDestroyed) return SC.Record.DESTROYED;
      else return parent.get('status');
    }
    else return this.get('store').readStatus(this.storeKey);
  }.property('storeKey'),

  /**
    The store that owns this record.  All changes will be buffered into this
    store and committed to the rest of the store chain through here.

    This property is set when the record instance is created and should not be
    changed or else it will break the record behavior.

    The default is to look up the store in the parentObject, because it is not
    set by default for child records

    @type SC.Store
    @default null
  */
  store: function () {
    return this.getPath('parentObject.store');
  }.property().cacheable(),

  /**
    This is the store key for the record, it is used to link it back to the
    dataHash. If a record is reused, this value will be replaced.

    You should not edit this store key but you may sometimes need to refer to
    this store key when implementing a Server object.

    The default is to look up the store in the parentObject, because it is not
    set by default for child records

    @type Number
    @default null
  */
  storeKey: function () {
    return this.getPath('parentObject.storeKey');
  }.property().cacheable(),

  /**
    YES when the record has been destroyed

    @type Boolean
    @property
    @dependsOn status
  */

  _sc_nestedrec_isDestroyed: NO,

  isDestroyed: function (key, value) {
    var parent = this.get('parentObject');
    if (parent) {
      if (value !== undefined) {
        this._sc_nestedrec_isDestroyed = value; // setting for destroyed nested records
      }
      else if (this._sc_nestedrec_isDestroyed) {
        return true;
      }
      else return !!(parent.get('status') & SC.Record.DESTROYED);
    }
    else {
      return !!(this.get('status') & SC.Record.DESTROYED);
    }
  }.property('status').cacheable(),

  /**
    `YES` when the record is in an editable state.  You can use this property to
    quickly determine whether attempting to modify the record would raise an
    exception or not.

    This property is both readable and writable.  Note however that if you
    set this property to `YES` but the status of the record is anything but
    `SC.Record.READY`, the return value of this property may remain `NO`.

    @type Boolean
    @property
    @dependsOn status
  */
  isEditable: function (key, value) {
    if (value !== undefined) this._screc_isEditable = value;
    if (this.get('status') & SC.Record.READY) return this._screc_isEditable;
    else return NO;
  }.property('status').cacheable(),

  /**
    @private

    Backing value for isEditable
  */
  _screc_isEditable: YES, // default

  /**
    `YES` when the record's contents have been loaded for the first time.  You
    can use this to quickly determine if the record is ready to display.

    @type Boolean
    @property
    @dependsOn status
  */
  isLoaded: function () {
    var K = SC.Record,
        status = this.get('status');
    return !((status === K.EMPTY) || (status === K.BUSY_LOADING) || (status === K.ERROR));
  }.property('status').cacheable(),

  /**
    If set, this should be an array of active relationship objects that need
    to be notified whenever the underlying record properties change.
    Currently this is only used by toMany relationships, but you could
    possibly patch into this yourself also if you are building your own
    relationships.

    Note this must be a regular Array - NOT any object implementing SC.Array.

    @type Array
    @default null
  */
  relationships: null,

  /**
    This will return the raw attributes that you can edit directly.  If you
    make changes to this hash, be sure to call `beginEditing()` before you get
    the attributes and `endEditing()` afterwards.

    @type Hash
    @property
  **/
  attributes: function () {
    var store, storeKey, ret, idx,
        parent = this.get('parentObject'),
        parentAttr = this.get('parentAttribute');

    if (parent) {
      if (this.get('isDestroyed')) return null;
      else {
        ret = parent.get('attributes');
        if (ret) {
          if (parent.isChildArray) {
            idx = parent.indexOf(this);
            ret = ret[idx];
          }
          else ret = ret[parentAttr];
        }
      }
    }
    else {
      store    = this.get('store');
      storeKey = this.get('storeKey');
      ret = store.readEditableDataHash(storeKey);
    }
    return ret;
  }.property(),

  /**
    This will return the raw attributes that you cannot edit directly.  It is
    useful if you want to efficiently look at multiple attributes in bulk.  If
    you would like to edit the attributes, see the `attributes` property
    instead.

    @type Hash
    @property
  **/
  readOnlyAttributes: function () {
    var ret = this.get('attributes');
    if (ret) ret = SC.clone(ret, YES);
    return ret;
  }.property(),

  /**
    Whether or not this is a nested Record.

    @type Boolean
    @property
  */
  isNestedRecord: NO,

  /**
    This refers to any parentObject in the event this record is nested (isNestedRecord is true). In the
    event that the parentObject nested this record using toOne(), parentObject will be a SC.Record; if instead
    the parent nested this record using toMany(), parentObject will be a SC.ChildArray.

    @property {SC.Record} or {SC.ChildArray}
  */
  parentObject: null,

  /**
    The property where the data hash for this SC.Record is stored in the parentObject's data hash. In the
    event that the parent nested this record using toOne(), parentAttribute will be a String; if
    instead the parent nested this record using toMany(), parentAttribute will be a number
    corresponding to an index in the SC.ChildArray.

    @property {String} or {Number}
  */
  parentAttribute: null,


  /**
    Computed property for backwards compatability

  */
  parentRecord: function () {
    var ret = this.get('parentObject');
    if (ret.isChildArray) {
      ret = ret.objectAt(ret.indexOf(this));
    }
    return ret;
  }.property('parentObject').cacheable(),

  // ...............................
  // CRUD OPERATIONS
  //

  /**
    Refresh the record from the persistent store.  If the record was loaded
    from a persistent store, then the store will be asked to reload the
    record data from the server.  If the record is new and exists only in
    memory then this call will have no effect.

    @param {boolean} recordOnly optional param if you want to only THIS record
      even if it is a child record.
    @param {Function} callback optional callback that will fire when request finishes

    @returns {SC.Record} receiver
  */
  refresh: function (recordOnly, callback) {
    var store = this.get('store'), rec, ro,
        sk = this.get('storeKey'),
        parent = this.get('parentObject'),
        parentAttr = this.get('parentAttribute');

    // If we only want to commit this record or it doesn't have a parent record
    // we will commit this record
    ro = recordOnly || (SC.none(recordOnly) && SC.none(parent));
    if (ro) {
      store.refreshRecord(null, null, sk, callback);
    } else if (parent) {
      parent.refresh(recordOnly, callback);
    }
    return this;
  },

  /**
    Deletes the record along with any dependent records.  This will mark the
    records destroyed in the store as well as changing the isDestroyed
    property on the record to YES.  If this is a new record, this will avoid
    creating the record in the first place.

    @param {boolean} recordOnly optional param if you want to only THIS record
      even if it is a child record.

    @returns {SC.Record} receiver
  */
  destroy: function (recordOnly) {
    var store = this.get('store'), rec, ro,
        sk = this.get('storeKey'),
        isParent = this.get('isParentRecord'),
        parent = this.get('parentObject'),
        parentAttr = this.get('parentAttribute');

    // If we only want to commit this record or it doesn't have a parent record
    // we will commit this record
    ro = recordOnly || (SC.none(recordOnly) && SC.none(parent));
    if (ro) {
      store.destroyRecord(null, null, sk);
      this.notifyPropertyChange('status');
      // If there are any aggregate records, we might need to propagate our new
      // status to them.
      this.propagateToAggregates();

    } else if (parent) {
      if (parent.isChildArray) parent.removeObject(this);
      else {
        parent.writeAttribute(parentAttr, null); // remove from parent hash
      }
      this._sc_nestedrec_isDestroyed = true;
      this.notifyPropertyChange('status');
      this.notifyPropertyChange('isDestroyed');
    }
    if (isParent) this.notifyChildren(['status']);

    return this;
  },

  /**
    helper method to destroy the children of this record when ths record is being destroyed.
   */

  _destroyChildren: function () {
    var i, item;
    for (i in this) {
      item = this[i];
      if (item && (SC.instanceOf(item, SC.ChildAttribute) || SC.instanceOf(item, SC.ChildrenAttribute))) {
        this.get(i).destroy();
      }
    }
  },

  /**
     Notifies the children of this record of a property change on the underlying hash.

     @param  {Array} keys
   */
  notifyChildren: function (keys) {
    var i, item, obj;
    for (i in this) {
      item = this[i];
      if (item && (SC.instanceOf(item, SC.ChildAttribute) || SC.instanceOf(item, SC.ChildrenAttribute))) {
        obj = this.get(i);
        if (obj) {
          if (!keys && obj.allPropertiesDidChange) obj.allPropertiesDidChange();
          else {
            if (obj.notifyPropertyChange) {
              obj.notifyPropertyChange(keys);
            }
          }
          if (obj.notifyChildren) {
            obj.notifyChildren(keys);
          }
        }
      }
    }
  },

  /**
    You can invoke this method anytime you need to make the record as dirty.
    This will cause the record to be committed when you `commitChanges()`
    on the underlying store.

    If you use the `writeAttribute()` primitive, this method will be called
    for you.

    If you pass the key that changed it will ensure that observers are fired
    only once for the changed property instead of `allPropertiesDidChange()`

    @param {String} key key that changed (optional)
    @returns {SC.Record} receiver
  */
  recordDidChange: function (key) {

    // If we have a parent, they changed too!
    var p = this.get('parentObject');
    if (p) {
      p.recordDidChange();
    }
    else {
      this.get('store').recordDidChange(null, null, this.get('storeKey'), key);
    }
    this.notifyPropertyChange('status');

    // If there are any aggregate records, we might need to propagate our new
    // status to them.
    this.propagateToAggregates();

    return this;
  },

  toJSON: function () {
    return this.get('attributes');
  },

  // ...............................
  // ATTRIBUTES
  //

  /** @private
    Current edit level.  Used to defer editing changes.
  */
  _editLevel: 0,

  /**
    Defers notification of record changes until you call a matching
    `endEditing()` method.  This method is called automatically whenever you
    set an attribute, but you can call it yourself to group multiple changes.

    Calls to `beginEditing()` and `endEditing()` can be nested.

    @returns {SC.Record} receiver
  */
  beginEditing: function () {
    this._editLevel++;
    return this;
  },

  /**
    Notifies the store of record changes if this matches a top level call to
    `beginEditing()`.  This method is called automatically whenever you set an
    attribute, but you can call it yourself to group multiple changes.

    Calls to `beginEditing()` and `endEditing()` can be nested.

    @param {String} key key that changed (optional)
    @returns {SC.Record} receiver
  */
  endEditing: function (key) {
    if (--this._editLevel <= 0) {
      this._editLevel = 0;
      this.recordDidChange(key);
    }
    return this;
  },

  /**
    Reads the raw attribute from the underlying data hash.  This method does
    not transform the underlying attribute at all.

    @param {String} key the attribute you want to read
    @returns {Object} the value of the key, or undefined if it doesn't exist
  */
  readAttribute: function (key) {
    var parent = this.get('parentObject'),
      store, storeKey, attrs, idx, parentAttr;

    if (!parent) {
      store = this.get('store');
      storeKey = this.get('storeKey');
      attrs = store.readDataHash(storeKey);
    }
    else {
      // get the data hash from the parent record
      parentAttr = this.get('parentAttribute');
      attrs = parent.readAttribute(parentAttr);
      if (parent.isChildArray) {
        // this assumes the order of the nested records in the child array is the same as
        // in the underlying hash, which doesn't need to be the case when things change from the store
        // needs a test
        idx = parent.indexOf(this);
        attrs = attrs[idx];
      }
    }
    return attrs ? attrs[key] : undefined;
  },

  /**
    Reads the raw attribute from the underlying data hash.

    @param {String} key the attribute you want to read
    @returns {Object} the value of the key, or undefined if it doesn't exist
  */

  readEditableAttribute: function (key) {
    var attr = this.readAttribute(key);
    return SC.clone(attr);
  },

   /**
    Helper method to recurse down the attributes to the data hash we are changing.

    @param attrs
    @param keyStack
    @return {Object}
    @private
   */
  _retrieveAttrs: function (attrs, keyStack) {
    var newattrs, newkey;
    if (2 >= keyStack.length) { // retrieve attrs runs one time too many.
      if (keyStack.length === 2) {
        newkey = keyStack.pop();
        newattrs = attrs[newkey];
      }
      else newattrs = attrs;
      if (newattrs === null || newattrs === undefined) {
        keyStack.push(newkey); // push back on
        return newattrs;
      }
      else return newattrs;
    } else {
      newkey = keyStack.pop();
      newattrs = attrs[newkey];
      if (newattrs) {
        return this._retrieveAttrs(newattrs, keyStack);
      }
    }
    if (newattrs === null || newattrs === undefined) {
      keyStack.push(newkey);
    }
    return newattrs;
  },

  /**
   * a helper to actually write the attribute to the record hash
   * format of the keystack with regards to the nested hash:
   *
          {
            end_user: {
              impairments: [
                0: {
                  impairment_type: 'something'
                }
              ]
            }
          }

          keyStack: ['impairment_type',0,impairments,end_user]

   */


  _writeAttribute: function (keyStack, value, ignoreDidChange) {
      var parent = this.get('parentObject'),
        parentAttr,
        store,
        storeKey,
        attrs,
        attrsToChange,
        lastKey,
        didChange = NO;

      if (parent) {
        // If we have a parent record, we need to get our editable hash from the parent record
        // push the parentAttribute onto the keyStack and call this function on the parent
        if (parent.isChildArray) {
          keyStack.push(parent.indexOf(this));
        }
        parentAttr = this.get('parentAttribute');
        keyStack.push(parentAttr);
        didChange = parent._writeAttribute(keyStack, value, ignoreDidChange);
      } else {
        // We have reached the top. Now we need to grab the editable has from the store and update it
        store = this.get('store');
        storeKey = this.get('storeKey');

        attrs = store.readEditableDataHash(storeKey);

        // no attributes? that's bad
        if (!attrs) {
          throw SC.Record.BAD_STATE_ERROR;
        }

        attrsToChange = attrs;
        var curAttr;
        for (var i = keyStack.length - 1; i > 0; i -= 1) { // down from the last key, but not the last
          curAttr = attrsToChange[keyStack[i]];
          if (!curAttr) { // current attr doesn't exist? check whether next is a number, if yes, current is an array
            if (SC.typeOf(keyStack[i - 1]) === SC.T_NUMBER) {
              attrsToChange[keyStack[i]] = [];
            }
            else {
              attrsToChange[keyStack[i]] = {};
            }
          }
          attrsToChange = attrsToChange[keyStack[i]];
        }
        lastKey = keyStack[0];

        // TODO: need to throw an exception if we run out of keys or attributes
        // if the value is the same, do not flag the record as dirty
        if (value !== attrsToChange[lastKey]) {
          // NOTE: the public method, writeAttribute, calls beginEditing() and endEditing()
          attrsToChange[lastKey] = value;
          didChange = YES;
        }
      }

      return didChange;
    },

  /**
    Updates the passed attribute with the new value.  This method does not
    transform the value at all.  If instead you want to modify an array or
    hash already defined on the underlying json, you should instead get
    an editable version of the attribute using `editableAttribute()`.

    @param {String} key the attribute you want to read
    @param {Object} value the value you want to write
    @param {Boolean} ignoreDidChange only set if you do NOT want to flag
      record as dirty
    @returns {SC.Record} receiver
  */

  writeAttribute: function (key, value, ignoreDidChange) {
    var keyStack = [],
        didChange,
        store = this.get('store'),
        storeKey = this.get('storeKey');

    if (!ignoreDidChange) {
      this.beginEditing();
    }

    keyStack.push(key);
    didChange = this._writeAttribute(keyStack, value, ignoreDidChange);

    if (didChange) {
      if (key === this.get('primaryKey')) {
        SC.Store.replaceIdFor(storeKey, value);
        this.propertyDidChange('id'); // Reset computed value
      }
      if (!ignoreDidChange) {
        this.endEditing(key);
      }
      else {
        // We must still inform the store of the change so that it can track the change across stores.
        store.dataHashDidChange(storeKey, null, undefined, key);
      }
    }

    return this;
  },

  /**
    This will also ensure that any aggregate records are also marked dirty
    if this record changes.

    Should not have to be called manually.
  */
  propagateToAggregates: function () {
    var storeKey   = this.get('storeKey'),
        recordType = SC.Store.recordTypeFor(storeKey),
        aggregates = recordType.__sc_aggregate_keys,
        idx, len, key, prop, val, recs;

    // if recordType aggregates are not set up yet, make sure to
    // create the cache first
    if (!aggregates) {
      aggregates = [];
      for (key in this) {
        prop = this[key];
        if (prop  &&  prop.isRecordAttribute  &&  prop.aggregate === YES) {
          aggregates.push(key);
        }
      }
      recordType.__sc_aggregate_keys = aggregates;
    }

    // now loop through all aggregate properties and mark their related
    // record objects as dirty
    var K          = SC.Record,
        dirty      = K.DIRTY,
        readyNew   = K.READY_NEW,
        destroyed  = K.DESTROYED,
        readyClean = K.READY_CLEAN,
        iter;

    /**
      @private

      If the child is dirty, then make sure the parent gets a dirty
      status.  (If the child is created or destroyed, there's no need,
      because the parent will dirty itself when it modifies that
      relationship.)

      @param {SC.Record} record to propagate to
    */
    iter =  function (rec) {
      var childStatus, parentStore, parentStoreKey, parentStatus;

      if (rec) {
        childStatus = this.get('status');
        if ((childStatus & dirty)  ||
            (childStatus & readyNew)  ||  (childStatus & destroyed)) {

          // Since the parent can cache 'status', and we might be called before
          // it has been invalidated, we'll read the status directly rather than
          // trusting the cache.
          parentStore    = rec.get('store');
          parentStoreKey = rec.get('storeKey');
          parentStatus   = parentStore.peekStatus(parentStoreKey);
          if (parentStatus === readyClean) {
            // Note:  storeDidChangeProperties() won't put it in the
            //        changelog!
            rec.get('store').recordDidChange(rec.constructor, null, rec.get('storeKey'), null, YES);
          }
        }
      }
    };

    for (idx = 0, len = aggregates.length; idx < len; ++idx) {
      key = aggregates[idx];
      val = this.get(key);
      recs = SC.kindOf(val, SC.ManyArray) ? val : [val];
      recs.forEach(iter, this);
    }
  },

  /**
    Called by the store whenever the underlying data hash has changed.  This
    will notify any observers interested in data hash properties that they
    have changed.

    @param {Boolean} statusOnly changed
    @param {String} key that changed (optional)
    @returns {SC.Record} receiver
  */
  storeDidChangeProperties: function (statusOnly, keys) {
    // TODO:  Should this function call propagateToAggregates() at the
    //        appropriate times?
    //debugger;
    var isParent = this.get('isParentRecord');
    if (statusOnly) {
      this.notifyPropertyChange('status');
      if (isParent) this.notifyChildren(['status']);
    }
    else {
      if (keys) {
        this.beginPropertyChanges();
        keys.forEach(function (k) { this.notifyPropertyChange(k); }, this);
        this.notifyPropertyChange('status');
        this.endPropertyChanges();
        if (isParent) this.notifyChildren(keys);
      } else {
        this.allPropertiesDidChange();
        if (isParent) {
          this.notifyChildren();
        }
      }

      // also notify manyArrays
      var manyArrays = this.relationships,
          loc        = manyArrays ? manyArrays.length : 0;
      while (--loc >= 0) manyArrays[loc].recordPropertyDidChange(keys);

    }
  },

  /**
    Normalizing a record will ensure that the underlying hash conforms
    to the record attributes such as their types (transforms) and default
    values.

    This method will write the conforming hash to the store and return
    the materialized record.

    By normalizing the record, you can use `.attributes()` and be
    assured that it will conform to the defined model. For example, this
    can be useful in the case where you need to send a JSON representation
    to some server after you have used `.createRecord()`, since this method
    will enforce the 'rules' in the model such as their types and default
    values. You can also include null values in the hash with the
    includeNull argument.

    @param {Boolean} includeNull will write empty (null) attributes
    @returns {SC.Record} the normalized record
  */

  normalize: function (includeNull) {
    var primaryKey = this.primaryKey,
        recordId   = this.get('id'),
        store      = this.get('store'),
        storeKey   = this.get('storeKey'),
        keysToKeep = {},
        key, valueForKey, typeClass, recHash, attrValue, normChild,  isRecord,
        isChild, defaultVal, keyForDataHash, attr;

    //var dataHash = store.readEditableDataHash(storeKey) || {};
    var dataHash = this.get('attributes') || {};
    if (!this.get('parentObject')) dataHash[primaryKey] = recordId; // only apply on top
    //recHash = store.readDataHash(storeKey);
    recHash = this.get('attributes');

    // For now we're going to be agnostic about whether ids should live in the
    // hash or not.
    keysToKeep[primaryKey] = YES;

    for (key in this) {
      // make sure property is a record attribute.
      valueForKey = this[key];
      if (valueForKey) {
        typeClass = valueForKey.typeClass;
        if (typeClass) {
          keyForDataHash = valueForKey.get('key') || key; // handle alt keys

          // As we go, we'll build up a key —> attribute mapping table that we
          // can use when purging keys from the data hash that are not defined
          // in the schema, below.
          keysToKeep[keyForDataHash] = YES;

          isRecord = SC.typeOf(typeClass.call(valueForKey)) === SC.T_CLASS;
          isChild  = valueForKey.isNestedRecordTransform;
          if (!isRecord && !isChild) {
            attrValue = this.get(key);
            if (attrValue !== undefined && (attrValue !== null || includeNull)) {
              attr = this[key];
              // if record attribute, make sure we transform with the fromType
              if(SC.kindOf(attr, SC.RecordAttribute)) {
                attrValue = attr.fromType(this, key, attrValue);
              }
              dataHash[keyForDataHash] = attrValue;
            }
            else if (!includeNull) {
              keysToKeep[keyForDataHash] = NO;
            }

          } else if (isChild) {
            attrValue = this.get(key);

            // Sometimes a child attribute property does not refer to a child record.
            // Catch this and don't try to normalize.
            if (attrValue && attrValue.normalize) {
              attrValue.normalize();
            }
          } else if (isRecord) {
            attrValue = recHash[keyForDataHash];
            if (attrValue !== undefined) {
              // write value already there
              dataHash[keyForDataHash] = attrValue;
            } else {
              // or write default
              defaultVal = valueForKey.get('defaultValue');

              // computed default value
              if (SC.typeOf(defaultVal) === SC.T_FUNCTION) {
                dataHash[keyForDataHash] = defaultVal(this, key, defaultVal);
              } else {
                // plain value
                dataHash[keyForDataHash] = defaultVal;
              }
            }
          }
        }
      }
    }

    // Finally, we'll go through the underlying data hash and remove anything
    // for which no appropriate attribute is defined.  We can do this using
    // the mapping table we prepared above.
    for (key in dataHash) {
      if (!keysToKeep[key]) {
        // Deleting a key doesn't seem too common unless it's a mistake, so
        // we'll log it in debug mode.
        SC.debug("%@:  Deleting key from underlying data hash due to normalization:  %@", this, key);
        delete dataHash[key];
      }
    }

    return this;
  },



  /**
    If you try to get/set a property not defined by the record, then this
    method will be called. It will try to get the value from the set of
    attributes.

    This will also check is `ignoreUnknownProperties` is set on the recordType
    so that they will not be written to `dataHash` unless explicitly defined
    in the model schema.

    @param {String} key the attribute being get/set
    @param {Object} value the value to set the key to, if present
    @returns {Object} the value
  */
  unknownProperty: function (key, value) {

    if (value !== undefined) {

      // first check if we should ignore unknown properties for this
      // recordType
      var storeKey = this.get('storeKey'),
        recordType = SC.Store.recordTypeFor(storeKey);

      if (recordType.ignoreUnknownProperties === YES) {
        this[key] = value;
        return value;
      }

      // if we're modifying the PKEY, then `SC.Store` needs to relocate where
      // this record is cached. store the old key, update the value, then let
      // the store do the housekeeping...
      var primaryKey = this.get('primaryKey');
      this.writeAttribute(key, value);

      // update ID if needed
      if (key === primaryKey) {
        SC.Store.replaceIdFor(storeKey, value);
      }

    }
    return this.readAttribute(key);
  },

  /**
    Lets you commit this specific record to the store which will trigger
    the appropriate methods in the data source for you.

    @param {Hash} params optional additional params that will passed down
      to the data source
    @param {boolean} recordOnly optional param if you want to only commit a single
      record if it has a parent.
    @param {Function} callback optional callback that the store will fire once the
    datasource finished committing
    @returns {SC.Record} receiver
  */
  commitRecord: function (params, recordOnly, callback) {
    var store = this.get('store'), rec, ro,
        sk = this.get('storeKey'),
        parent = this.get('parentObject');

    // If we only want to commit this record or it doesn't have a parent record
    // we will commit this record
    ro = recordOnly || (SC.none(recordOnly) && SC.none(parent));
    if (ro) {
      store.commitRecord(undefined, undefined, this.get('storeKey'), params, callback);
    } else if (parent) {
      parent.commitRecord(params, recordOnly, callback);
    }
    return this;
  },

  // ..........................................................
  // EMULATE SC.ERROR API
  //

  /**
    Returns `YES` whenever the status is SC.Record.ERROR.  This will allow you
    to put the UI into an error state.

    @type Boolean
    @property
    @dependsOn status
  */
  isError: function () {
    return !!(this.get('status') & SC.Record.ERROR);
  }.property('status').cacheable(),

  /**
    Returns the receiver if the record is in an error state.  Returns null
    otherwise.

    @type SC.Record
    @property
    @dependsOn isError
  */
  errorValue: function () {
    return this.get('isError') ? SC.val(this.get('errorObject')) : null;
  }.property('isError').cacheable(),

  /**
    Returns the current error object only if the record is in an error state.
    If no explicit error object has been set, returns SC.Record.GENERIC_ERROR.

    @type SC.Error
    @property
    @dependsOn isError
  */
  errorObject: function () {
    if (this.get('isError')) {
      var store = this.get('store');
      return store.readError(this.get('storeKey')) || SC.Record.GENERIC_ERROR;
    } else return null;
  }.property('isError').cacheable(),

  // ...............................
  // PRIVATE
  //

  /** @private
    Sets the key equal to value.

    This version will first check to see if the property is an
    `SC.RecordAttribute`, and if so, will ensure that its isEditable property
    is `YES` before attempting to change the value.

    @param key {String} the property to set
    @param value {Object} the value to set or null.
    @returns {SC.Record}
  */
  set: function (key, value) {
    var func = this[key];

    if (func && func.isProperty && func.get && !func.get('isEditable')) {
      return this;
    }
    return sc_super();
  },

  /**
    Registers a child record with this parent record.

    If the parent already knows about the child record, return the cached
    instance. If not, create the child record instance and add it to the child
    record cache.

    @param {Hash} value The hash of attributes to apply to the child record.
    @param {Integer} key The store key that we are asking for
    @param {String} path The property path of the child record
    @returns {SC.Record} the child record that was registered
   */
  registerNestedRecord: function (value, key) {
    var childRecord;
    // if a record instance is passed, simply use the storeKey.  This allows
    // you to pass a record from a chained store to get the same record in the
    // current store.
    if (value && value.get && value.get('isRecord')) {
      childRecord = value;
    }
    else {
      childRecord = this.materializeNestedRecord(value, key, this);
    }
    if (childRecord) {
      this.isParentRecord = YES;
    }

    return childRecord;
  },
  /**
   * materializes a nested record or nested array.
   */
  // register will always create a nested record, which is not what we need
  // createNestedRecord should only create a non existing nested rec,
  // and this should return an instance of the right recordType
  materializeNestedRecord: function (value, key, parentObject) {
    var childRecord, recordType, attrkey,
        attribute = this[key];

    if (this.get('status') & SC.Record.DESTROYED) return null; // don't return anything for destroyed records...
    if (value && value.get && value.get('isRecord')) {
      childRecord = value;
    }
    else {
      if (attribute && attribute.isNestedRecordTransform) {
        attrkey = this[key].key || key;
      }
      else attrkey = key;
      recordType = this._materializeNestedRecordType(value, key);
      if (!recordType) {
        // try the attribute
        if (attribute) recordType = attribute.get('typeClass');
        if (!recordType) return null;
      }
      if (recordType.kindOf && recordType.kindOf(SC.Record)) {
        childRecord = recordType.create({
          parentObject: parentObject || this,
          parentAttribute: attrkey,
          isChildRecord: true
        });
      }
      else childRecord = value;
    }
    if (childRecord) {
      this.isParentRecord = YES;
    }
    return childRecord;

  },

  /** @deprecated... same as destroy essentially

    Unregisters a child record from its parent record.

    Since accessing a child (nested) record creates a new data hash for the
    child and caches the child record and its relationship to the parent record,
    it's important to clear those caches when the child record is overwritten
    or removed.  This function tells the store to remove the child record from
    the store's various child record caches.

    You should not need to call this function directly.  Simply setting the
    child record property on the parent to a different value will cause the
    previous child record to be unregistered.

    @param {String} path The property path of the child record.
  */
  unregisterNestedRecord: function (path) {
    // var childRecord, csk, store;

    // store = this.get('store');
    // childRecord = this.getPath(path);
    // csk = childRecord.get('storeKey');
    // store.unregisterChildFromParent(csk);
  },

  /**
     private methods that retrieves the recordType from the hash that is provided.

     @param {Hash} value The hash of attributes to apply to the child record.
     @param {String} key the name of the key on the attribute
    */

  _findRecordAttributeFor: function (hashkey) { // to find
    var i, item;
    for (i in this) {
      item = this[i];
      if (item && item.get && item.key === hashkey) {
        return item;
      }
    }
  },

  _materializeNestedRecordType: function (value, key) {
    var childNS, recordType, item;
    // If no hash, return null.
    if (SC.typeOf(value) === SC.T_HASH) {
      // Get the record type.
      childNS = this.get('nestedRecordNamespace');
      if (value.type && !SC.none(childNS)) {
        recordType = childNS[value.type];
      }

      // check to see if we have a record type at this point and call
      // for the typeClass if we dont
      if (!recordType && key && this[key]) {
        recordType = this[key].get('typeClass');
      }

      // reverse lookup, we have the hash key, but no direct available attributes
      if (!recordType && key && !this[key]) {
        item = this._findRecordAttributeFor(key);
        if (item) {
          recordType = item.get('typeClass');
        }
      }

      // When all else fails throw and exception
      if (!recordType || SC.typeOf(recordType) !== SC.T_CLASS) {
        this._throwUnlessRecordTypeDefined(recordType, 'nestedRecord');
        // throw 'SC.Record#_materializeNestedRecordType: Error during transform: ' +
        //         'Record type could not be found. Forgot a key? Or perhaps forgot a sc_require?';
      }
    }

    return recordType;
  },

  /**
    Creates a new nested record instance.

    @param {SC.Record} recordType The type of the nested record to create.
    @param {Hash} hash The hash of attributes to apply to the child record.
    (may be null)
    @returns {SC.Record} the nested record created
   */
  createNestedRecord: function (recordType, hash, key, parentObject) {
    var attrkey, cr, attrval,
        attrIsToMany = false,
        attribute, po;

    if (!key && SC.typeOf(recordType) === 'string') {
      key = recordType;
      recordType = this._materializeNestedRecordType(hash, key);
    }
    attribute = this[key] || this._findRecordAttributeFor(key);

    if (attribute && attribute.isNestedRecordTransform) {
      attrkey = attribute.key || key;
      if (attribute.isChildrenAttribute) attrIsToMany = true;
    }
    else attrkey = key;

    hash = hash || {}; // init if needed

    // this function also checks whether the child records hash already exists at the parents hash,
    // because if not, it should write it
    if (recordType.kindOf && recordType.kindOf(SC.Record)) {
      po = this.get(key);
      if (attrIsToMany && !parentObject && po && po.isChildArray) {
        // figure out parentObject
        parentObject = po;
      }
      cr = recordType.create({
        parentObject: parentObject || this,
        parentAttribute: attrkey,
        isChildRecord: true
      });
    }
    else cr = hash;

    attrval = this.readAttribute(attrkey);
    this.propertyWillChange(key);
    if (!attrval) { // create if it doesn't exist
      if (attrIsToMany) {
        this.writeAttribute(attrkey, [hash]); // create the array too
      }
      else {
        this.writeAttribute(attrkey, hash);
      }
    }
    else { // update
      if (attrIsToMany) {
        attrval.push(hash);
        this.writeAttribute(attrkey, attrval);
      }
      else {
        this.writeAttribute(attrkey, hash);
      }
    }
    this.propertyDidChange(key);

    return cr;
  },

  _nestedRecordKey: 0,

  /**
    Override this function if you want to have a special way of creating
    ids for your child records

    @param {SC.Record} childRecord
    @returns {String} the id generated
   */
  generateIdForChild: function (childRecord) {}

});

// Class Methods
SC.Record.mixin( /** @scope SC.Record */ {

  /**
    Whether to ignore unknown properties when they are being set on the record
    object. This is useful if you want to strictly enforce the model schema
    and not allow dynamically expanding it by setting new unknown properties

    @static
    @type Boolean
    @default NO
  */
  ignoreUnknownProperties: NO,

  // ..........................................................
  // CONSTANTS
  //

  /**
    Generic state for records with no local changes.

    Use a logical AND (single `&`) to test record status

    @static
    @constant
    @type Number
    @default 0x0001
  */
  CLEAN:            0x0001, // 1

  /**
    Generic state for records with local changes.

    Use a logical AND (single `&`) to test record status

    @static
    @constant
    @type Number
    @default 0x0002
  */
  DIRTY:            0x0002, // 2

  /**
    State for records that are still loaded.

    A record instance should never be in this state.  You will only run into
    it when working with the low-level data hash API on `SC.Store`. Use a
    logical AND (single `&`) to test record status

    @static
    @constant
    @type Number
    @default 0x0100
  */
  EMPTY:            0x0100, // 256

  /**
    State for records in an error state.

    Use a logical AND (single `&`) to test record status

    @static
    @constant
    @type Number
    @default 0x1000
  */
  ERROR:            0x1000, // 4096

  /**
    Generic state for records that are loaded and ready for use

    Use a logical AND (single `&`) to test record status

    @static
    @constant
    @type Number
    @default 0x0200
  */
  READY:            0x0200, // 512

  /**
    State for records that are loaded and ready for use with no local changes

    Use a logical AND (single `&`) to test record status

    @static
    @constant
    @type Number
    @default 0x0201
  */
  READY_CLEAN:      0x0201, // 513


  /**
    State for records that are loaded and ready for use with local changes

    Use a logical AND (single `&`) to test record status

    @static
    @constant
    @type Number
    @default 0x0202
  */
  READY_DIRTY:      0x0202, // 514


  /**
    State for records that are new - not yet committed to server

    Use a logical AND (single `&`) to test record status

    @static
    @constant
    @type Number
    @default 0x0203
  */
  READY_NEW:        0x0203, // 515


  /**
    Generic state for records that have been destroyed

    Use a logical AND (single `&`) to test record status

    @static
    @constant
    @type Number
    @default 0x0400
  */
  DESTROYED:        0x0400, // 1024


  /**
    State for records that have been destroyed and committed to server

    Use a logical AND (single `&`) to test record status

    @static
    @constant
    @type Number
    @default 0x0401
  */
  DESTROYED_CLEAN:  0x0401, // 1025


  /**
    State for records that have been destroyed but not yet committed to server

    Use a logical AND (single `&`) to test record status

    @static
    @constant
    @type Number
    @default 0x0402
  */
  DESTROYED_DIRTY:  0x0402, // 1026


  /**
    Generic state for records that have been submitted to data source

    Use a logical AND (single `&`) to test record status

    @static
    @constant
    @type Number
    @default 0x0800
  */
  BUSY:             0x0800, // 2048


  /**
    State for records that are still loading data from the server

    Use a logical AND (single `&`) to test record status

    @static
    @constant
    @type Number
    @default 0x0804
  */
  BUSY_LOADING:     0x0804, // 2052


  /**
    State for new records that were created and submitted to the server;
    waiting on response from server

    Use a logical AND (single `&`) to test record status

    @static
    @constant
    @type Number
    @default 0x0808
  */
  BUSY_CREATING:    0x0808, // 2056


  /**
    State for records that have been modified and submitted to server

    Use a logical AND (single `&`) to test record status

    @static
    @constant
    @type Number
    @default 0x0810
  */
  BUSY_COMMITTING:  0x0810, // 2064


  /**
    State for records that have requested a refresh from the server.

    Use a logical AND (single `&`) to test record status.

    @static
    @constant
    @type Number
    @default 0x0820
  */
  BUSY_REFRESH:     0x0820, // 2080


  /**
    State for records that have requested a refresh from the server.

    Use a logical AND (single `&`) to test record status

    @static
    @constant
    @type Number
    @default 0x0821
  */
  BUSY_REFRESH_CLEAN:  0x0821, // 2081

  /**
    State for records that have requested a refresh from the server.

    Use a logical AND (single `&`) to test record status

    @static
    @constant
    @type Number
    @default 0x0822
  */
  BUSY_REFRESH_DIRTY:  0x0822, // 2082

  /**
    State for records that have been destroyed and submitted to server

    Use a logical AND (single `&`) to test record status

    @static
    @constant
    @type Number
    @default 0x0840
  */
  BUSY_DESTROYING:  0x0840, // 2112


  // ..........................................................
  // ERRORS
  //

  /**
    Error for when you try to modify a record while it is in a bad
    state.

    @static
    @constant
    @type SC.Error
  */
  BAD_STATE_ERROR:     SC.$error("Internal Inconsistency"),

  /**
    Error for when you try to create a new record that already exists.

    @static
    @constant
    @type SC.Error
  */
  RECORD_EXISTS_ERROR: SC.$error("Record Exists"),

  /**
    Error for when you attempt to locate a record that is not found

    @static
    @constant
    @type SC.Error
  */
  NOT_FOUND_ERROR:     SC.$error("Not found "),

  /**
    Error for when you try to modify a record that is currently busy

    @static
    @constant
    @type SC.Error
  */
  BUSY_ERROR:          SC.$error("Busy"),

  /**
    Generic unknown record error

    @static
    @constant
    @type SC.Error
  */
  GENERIC_ERROR:       SC.$error("Generic Error"),

  /**
    @private
    The next child key to allocate.  A nextChildKey must always be greater than 0.
  */
  _nextChildKey: 0,

  // ..........................................................
  // CLASS METHODS
  //

  /**
    Helper method returns a new `SC.RecordAttribute` instance to map a simple
    value or to-one relationship.  At the very least, you should pass the
    type class you expect the attribute to have.  You may pass any additional
    options as well.

    Use this helper when you define SC.Record subclasses.

        MyApp.Contact = SC.Record.extend({
          firstName: SC.Record.attr(String, { isRequired: YES })
        });

    @param {Class} type the attribute type
    @param {Hash} opts the options for the attribute
    @returns {SC.RecordAttribute} created instance
  */
  attr: function (type, opts) {
    return SC.RecordAttribute.attr(type, opts);
  },

  /**
    Returns an `SC.RecordAttribute` that describes a fetched attribute.  When
    you reference this attribute, it will return an `SC.RecordArray` that uses
    the type as the fetch key and passes the attribute value as a param.

    Use this helper when you define SC.Record subclasses.

        MyApp.Group = SC.Record.extend({
          contacts: SC.Record.fetch('MyApp.Contact')
        });

    @param {SC.Record|String} recordType The type of records to load
    @param {Hash} opts the options for the attribute
    @returns {SC.RecordAttribute} created instance
  */
  fetch: function (recordType, opts) {
    return SC.FetchedAttribute.attr(recordType, opts);
  },

  /**
    Will return one of the following:

     1. `SC.ManyAttribute` that describes a record array backed by an
        array of guids stored in the underlying JSON.
     2. `SC.ChildrenAttribute` that describes a record array backed by a
        array of hashes.

    You can edit the contents of this relationship.

    For `SC.ManyAttribute`, If you set the inverse and `isMaster: NO` key,
    then editing this array will modify the underlying data, but the
    inverse key on the matching record will also be edited and that
    record will be marked as needing a change.

    @param {SC.Record|String} recordType The type of record to create
    @param {Hash} opts the options for the attribute
    @returns {SC.ManyAttribute|SC.ChildrenAttribute} created instance
  */
  toMany: function (recordType, opts) {
    opts = opts || {};
    var isNested = opts.nested || opts.isNested;
    var attr;

    this._throwUnlessRecordTypeDefined(recordType, 'toMany');

    if (isNested) {
      attr = SC.ChildrenAttribute.attr(recordType, opts);
    }
    else {
      attr = SC.ManyAttribute.attr(recordType, opts);
    }
    return attr;
  },

  /**
    Will return one of the following:

     1. `SC.SingleAttribute` that converts the underlying ID to a single
        record.  If you modify this property, it will rewrite the underlying
        ID. It will also modify the inverse of the relationship, if you set it.
     2. `SC.ChildAttribute` that you can edit the contents
        of this relationship.

    @param {SC.Record|String} recordType the type of the record to create
    @param {Hash} opts additional options
    @returns {SC.SingleAttribute|SC.ChildAttribute} created instance
  */
  toOne: function (recordType, opts) {
    opts = opts || {};
    var isNested = opts.nested || opts.isNested;
    var attr;

    this._throwUnlessRecordTypeDefined(recordType, 'toOne');

    if (isNested) {
      attr = SC.ChildAttribute.attr(recordType, opts);
    }
    else {
      attr = SC.SingleAttribute.attr(recordType, opts);
    }
    return attr;
  },

  _throwUnlessRecordTypeDefined: function (recordType, relationshipType) {
    if (!recordType) {
      throw new Error("Attempted to create " + relationshipType + " attribute with " +
            "undefined recordType. Did you forget to sc_require a dependency?");
    }
  },

  /**
    Returns all storeKeys mapped by Id for this record type.  This method is
    used mostly by the `SC.Store` and the Record to coordinate.  You will rarely
    need to call this method yourself.

    @returns {Hash}
  */
  storeKeysById: function () {
    var key = SC.keyFor('storeKey', SC.guidFor(this)),
        ret = this[key];
    if (!ret) ret = this[key] = {};
    return ret;
  },

  /**
    Given a primaryKey value for the record, returns the associated
    storeKey.  If the primaryKey has not been assigned a storeKey yet, it
    will be added.

    For the inverse of this method see `SC.Store.idFor()` and
    `SC.Store.recordTypeFor()`.

    @param {String} id a record id
    @returns {Number} a storeKey.
  */
  storeKeyFor: function (id) {
    var storeKeys = this.storeKeysById(),
        ret       = storeKeys[id];

    if (!ret) {
      ret = SC.Store.generateStoreKey();
      SC.Store.idsByStoreKey[ret] = id;
      SC.Store.recordTypesByStoreKey[ret] = this;
      storeKeys[id] = ret;
    }

    return ret;
  },

  /**
    Given a primaryKey value for the record, returns the associated
    storeKey.  As opposed to `storeKeyFor()` however, this method
    will NOT generate a new storeKey but returned undefined.

    @param {String} id a record id
    @returns {Number} a storeKey.
  */
  storeKeyExists: function (id) {
    var storeKeys = this.storeKeysById(),
        ret       = storeKeys[id];

    return ret;
  },

  /**
    Returns a record with the named ID in store.

    @param {SC.Store} store the store
    @param {String} id the record id or a query
    @returns {SC.Record} record instance
  */
  find: function (store, id) {
    return store.find(this, id);
  },

  /** @private - enhance extend to notify SC.Query as well. */
  extend: function () {
    var ret = SC.Object.extend.apply(this, arguments);
    if (SC.Query) SC.Query._scq_didDefineRecordType(ret);
    return ret;
  }
});
