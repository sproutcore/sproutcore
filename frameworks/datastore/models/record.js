// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

sc_require('models/store') ;


/**
  @class

  A Record is the core model class in SproutCore. It is analogous to 
  NSManagedObject in Core Data and EOEnterpriseObject in the Enterprise
  Objects Framework (aka WebObjects), or ActiveRecord::Base in Rails.
  
  To create a new model class, in your SproutCore workspace, do:
  
  {{{
    $ sc-gen model MyApp.MyModel
  }}}

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
  updateAttributes() method.

  @extends SC.Object
  @since SproutCore 1.0
*/
SC.Record = SC.Object.extend(
/** @scope SC.Record.prototype */ {
  
  // ...............................
  // PROPERTIES
  //
  
  /**
    This is the primary key used to distinguish records.  If the keys
    match, the records are assumed to be identical.
    
    @property
    @type {String}
  */
  primaryKey: 'guid',
  
  /**
    Returns the id for the record instance.  The id is used to uniquely 
    identify this record instance from all others of the same type.  If you 
    have a primaryKey set on this class, then the id will be the value of the
    primaryKey property on the underlying JSON hash.
  */
  id: function() {
    return SC.Store.idFor(this.storeKey);
  }.property('storeKey').cacheable(),
  
  /**
    The record's status changes as it is loaded from the server.
    
    @property {Number}
  */
  status: function() {
    return this.store.readStatus(this.storeKey);
  }.property('storeKey').cacheable(),

  /**
    The store that owns this record.  All changes will be buffered into this
    store and committed to the rest of the store chain through here.
    
    This property is set when the record instance is created and should not be
    changed or else it will break the record behavior.
    
    @property {SC.Store}
  */
  store: null,

  /**
    This is the store key for the record, it is used to link it back to the 
    dataHash. If a record is reused, this value will be replaced.
    
    You should not edit this store key but you may sometimes need to refer to
    this store key when implementing a Server object.
    
    @property {Integer}
  */
  storeKey: null,
  
  // ...............................
  // CRUD OPERATIONS
  //

  /**
    Returns YES if the status matches any of the passed statuses.
  
    @return {Boolean}
  */
  hasStatus: function(statuses) {
    var len = arguments.length, idx, s = 0;
    for(idx=0;idx<len;idx++) s = s | arguments[idx];
    return this.get('status') & s ;
  },
  
  /**
    Refresh the record from the persistent store.  If the record was loaded 
    from a persistent store, then the store will be asked to reload the 
    record data from the server.  If the record is new and exists only in 
    memory then this call will have no effect.
    
    @returns {SC.Record} receiver
  */
  refresh: function() { 
    if (this.hasStatus(SC.Record.READY_CLEAN, SC.Record.ERROR)) {
      var pkey = this.get(this.get('primaryKey'));
      this.get('store').refreshRecord(this);
    }
    return this ;
  },
  
  /**
    Deletes the record along with any dependent records.  This will mark the 
    records destroyed in the store as well as changing the isDestroyed 
    property on the record to YES.  If this is a new record, this will avoid 
    creating the record in the first place.
    
    @returns {SC.Record} receiver
  */
  destroy: function() { 
    if (!this.hasStatus(SC.Record.BUSY_LOADING, SC.Record.READY_CLEAN)) {
      this.get('store').destroyRecord(this);      
    }
    return this ;
  },

  _TMP_RECORDS_ARY: [],
  
  /**
    You can invoke this method anytime you need to make the record as dirty.
    This will cause the record to be commited when you commitChanges()
    on the underlying store.
    
    If you use the writeAttribute() primitive, this method will be called for 
    you.
    
    @returns {SC.Record} reciever
  */
  recordDidChange: function() {
    if (!this.hasStatus(SC.Record.DESTROYED_CLEAN, SC.RECORD_EMPTY)) {
      this.get('store').recordDidChange(null, null, this.storeKey);
    }
    return this ;
  },
  
  // ...............................
  // ATTRIBUTES
  //

  /** @private
    Current edit level.  Used to defer editing changes. 
  */
  _editLevel: 0 ,
  
  /**
    Defers notification of record changes until you call a matching 
    endEditing() method.  This method is called automatically whenever you
    set an attribute, but you can call it yourself to group multiple changes.
    
    Calls to beginEditing() and endEditing() can be nested.
    
    @returns {SC.Record} receiver
  */
  beginEditing: function() {
    this._editLevel++;
    return this ;
  },

  /**
    Notifies the store of record changes if this matches a top level call to
    beginEditing().  This method is called automatically whenever you set an
    attribute, but you can call it yourself to group multiple changes.
    
    Calls to beginEditing() and endEditing() can be nested.
    
    @returns {SC.Record} receiver
  */
  endEditing: function() {
    if(--this._editLevel <= 0) {
      this._editLevel = 0; 
      this.recordDidChange();
    }
    return this ;
  },
  
  /**
    Reads the raw attribute from the underlying data hash.  This method does
    not transform the underlying attribute at all.
  
    @param {String} key the attribute you want to read
    @returns {Object} the value of the key, or null if it doesn't exist
  */
  readAttribute: function(key) {
    var store = this.get('store'), storeKey = this.storeKey;
    var attrs = store.readDataHash(storeKey);
    return attrs ? attrs[key] : undefined ; 
  },

  /**
    Updates the passed attribute with the new value.  This method does not 
    transform the value at all.  If instead you want to modify an array or 
    hash already defined on the underlying json, you should instead get 
    an editable version of the attribute using editableAttribute()
  
    @param {String} key the attribute you want to read
    @param {Object} value the attribute you want to read
    @returns {SC.Record} receiver
  **/
  writeAttribute: function(key, value) {
    this.beginEditing();
    var store = this.get('store'), storeKey = this.storeKey;
    var attrs = store.readEditableDataHash(storeKey);
    if (!attrs) {
      throw "Cannot not modify %@ because it is not loaded".fmt(this);
    }
    attrs[key] = value;
    this.endEditing();
    return this ;  
  },
  
  /**
    Reads the value for the passed attribute key.  If the value is an array
    or hash, then the object will be cloned the first time it is returned.
    
    Use this method if you need to retrieve an array or hash that you intend
    to then edit.  This will only clone the array the first time if it is 
    needed.
    
    @param {String} key the attribute to read
    @param {Object} the object value
  */
  editableAttribute: function(key) {
    var store = this.get('store'), storeKey = this.storeKey;
    return store.getWriteableAttribute(storeKey, key) ;
  },
  
  /**
    This will return the raw attributes that you can edit directly.  If you 
    make changes to this hash, be sure to call beginEditing() before you get
    the attributes and endEditing() aftwards.
  
    @returns {Object} the current attributes of the receiver
  **/
  attributes: function() {
    var store = this.get('store'), storeKey = this.storeKey;
    var attrs = store.dataHashes[storeKey];
    if (!attrs) attrs = store.dataHashes[storeKey] = {} ;
    return attrs ;
  }.property(),
  
  /**
    Called by the store whenever the underlying data hash has changed.  This
    will notify any observers interested in data hash properties that they
    have changed.
    
    @returns {SC.Record} receiver
  */
  storeDidChangeAttributes: function() {
    // TODO: Notify of property changes more selectively?
    this.allPropertiesDidChange(); 
  },
  
  /**
    If you try to get/set a property not defined by the record, then this 
    method will be called. It will try to get the value from the set of 
    attributes.
  
    @param {String} key the attribute being get/set
    @param {Object} value the value to set the key to, if present
    @returns {Object} the value
  */
  unknownProperty: function(key, value) {
    if (value !== undefined) {
      
      // if we're modifying the PKEY, then SC.Store needs to relocate where 
      // this record is cached. store the old key, update the value, then let 
      // the store do the housekeeping...
      var primaryKey = this.get('primaryKey');
      this.writeAttribute(key,value);
      
      // no need to relocate if there wasn't an old key...
      if (key === primaryKey) {
        this.get('store').replaceGuid(this.storeKey, value);
      }
      
    } else {
      value = this.readAttribute(key);
    }
    return value;
  },
  
  // ...............................
  // PRIVATE
  //
  
  toString: function() {
    var attrs = this.get('attributes');
    return "%@(%@)".fmt(this.constructor.toString(), SC.inspect(attrs));
  }
    
}) ;

// Class Methods
SC.Record.mixin( /** @scope SC.Record */ {

  // Record States
  CLEAN:            0x0001,
  DIRTY:            0x0002,

  EMPTY:            0x0100,
  ERROR:            0x1000,

  READY:            0x0200,
  READY_CLEAN:      0x0201,
  READY_DIRTY:      0x0202,
  READY_NEW:        0x0203,

  DESTROYED:        0x0400,
  DESTROYED_CLEAN:  0x0401,
  DESTROYED_DIRTY:  0x0402,

  BUSY:             0x0800,
  BUSY_LOADING:     0x0804,
  BUSY_CREATING:    0x0808,
  BUSY_COMMITTING:  0x0810,
  BUSY_REFRESH:     0x0820,
  BUSY_REFRESH_CLEAN:  0x0821,
  BUSY_REFRESH_DIRTY:  0x0822,
  BUSY_DESTROYING:  0x0840,

  // exceptions that can be raised when processing records
  BAD_STATE_ERROR:     new Error("Internal Inconsistency"),
  RECORD_EXISTS_ERROR: new Error("Record Exists"),
  NOT_FOUND_ERROR:     new Error("Not found "),
  BUSY_ERROR:          new Error("Busy"),
  
  /**
    Given a primaryKey value for the record, returns the associated
    storeKey.  If the primaryKey has not been assigned a storeKey yet, it 
    will be added.
    
    For the inverse of this method see SC.Store.idFor() and 
    SC.Store.recordTypeFor().
    
    @param {String} id a record id
    @returns {Number} a storeKey.
  */
  storeKeyFor: function(id) {
    var storeKeys = this.storeKeysById;
    if (!storeKeys) storeKeys = this.storeKeysById = {};
    var ret = storeKeys[id];
    if (!ret) {
      ret = SC.Store.generateStoreKey();
      SC.Store.idsByStoreKey[ret] = id ;
      storeKeys[id] = ret ;
    }
    return ret ;
  },

  /** 
    Used to find the first object matching the specified conditions.  You can 
    pass in either a simple guid or one or more hashes of conditions.
  */
  find: function(guid, store) {
    if(store) {
      return store.find(guid, this) ;
    }
    return null;
  },
  
  // Same as find except returns all records matching the passed conditions.
  findAll: function(filter) {
    var ret;
    var args = SC.$A(arguments) ; args.push(this) ; // add type
    var store = this.get('store');
    if(store) {
      ret = store.find.apply(store,args) ;
    }
    return ret;
  }
  
}) ;
