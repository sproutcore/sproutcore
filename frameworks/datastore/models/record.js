// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

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
  
  /**  Walk like a duck */
  isRecord: YES,
  
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
    
    @property 
    @type {Integer}
  */
  storeKey: null,

  /**
    YES when the record is in an editable state.  You can use this property to
    quickly determine whether attempting to modify the record would raise an 
    exception or not.
    
    This property is both readable and writable.  Note however that if you 
    set this property to YES but the status of the record is anything but
    SC.Record.READY, the return value of this property may remain NO.
    
    @property
    @type {Boolean}
  */
  isEditable: function(key, value) {
    if (value !== undefined) this._screc_isEditable = value;
    if (this.get('status') & SC.Record.READY) return this._screc_isEditable;
    else return NO ;
  }.property('status').cacheable(),
  
  _screc_isEditable: YES, // default
  
  /**
    YES when the record's contents have been loaded for the first time.  You 
    can use this to quickly determine if the record is ready to display.
    
    @property
    @type {Boolean}
  */
  isLoaded: function() {
    var K = SC.Record, 
        status = this.get('status');
    return !((status===K.EMPTY) || (status===K.BUSY_LOADING) || (status===K.ERROR));
  }.property('status').cacheable(),
  
  // ...............................
  // CRUD OPERATIONS
  //

  /**
    Refresh the record from the persistent store.  If the record was loaded 
    from a persistent store, then the store will be asked to reload the 
    record data from the server.  If the record is new and exists only in 
    memory then this call will have no effect.
    
    @returns {SC.Record} receiver
  */
  refresh: function() { 
    this.get('store').refreshRecord(null, null, this.get('storeKey'));
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
    this.get('store').destroyRecord(null, null, this.get('storeKey'));
    return this ;
  },

  /**
    You can invoke this method anytime you need to make the record as dirty.
    This will cause the record to be commited when you commitChanges()
    on the underlying store.
    
    If you use the writeAttribute() primitive, this method will be called for 
    you.
    
    If you pass the key that changed it will ensure that observers are fired
    only once for the changed property instead of allPropertiesDidChange()
    
    @param {String} key that changed (optional)
    @returns {SC.Record} receiver
  */
  recordDidChange: function(key) {
    this.get('store').recordDidChange(null, null, this.get('storeKey'), key);
    this.storeDidChangeProperties(NO);
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
    
    @param {String} key that changed (optional)
    @returns {SC.Record} receiver
  */
  endEditing: function(key) {
    if(--this._editLevel <= 0) {
      this._editLevel = 0; 
      this.recordDidChange(key);
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
    @param {Boolean} ignoreDidChange only set if you do NOT want to flag 
      record as dirty
    @returns {SC.Record} receiver
  **/
  writeAttribute: function(key, value, ignoreDidChange) {
    var store = this.get('store'), storeKey = this.storeKey;
    var attrs = store.readEditableDataHash(storeKey);
    if (!attrs) throw SC.Record.BAD_STATE_ERROR;
    
    // if value is the same, do not flag record as dirty
    if (value !== attrs[key]) {
      if(!ignoreDidChange) this.beginEditing();
      attrs[key] = value;
      if(!ignoreDidChange) this.endEditing(key);
    }
    
    // if value is primaryKey of record, write it to idsByStoreKey
    if (key===this.get('primaryKey')) {
      SC.Store.idsByStoreKey[storeKey] = attrs[key] ;
    }
    
    return this ;  
  },
  
  /**
    This will return the raw attributes that you can edit directly.  If you 
    make changes to this hash, be sure to call beginEditing() before you get
    the attributes and endEditing() afterwards.
  
    @returns {Object} the current attributes of the receiver
  **/
  attributes: function() {
    var store    = this.get('store'), 
        storeKey = this.storeKey;
    return store.readEditableDataHash(storeKey);
  }.property(),
  
  /**
    Called by the store whenever the underlying data hash has changed.  This
    will notify any observers interested in data hash properties that they
    have changed.
    
    @param {Boolean} statusOnly changed
    @param {String} key that changed (optional)
    @returns {SC.Record} receiver
  */
  storeDidChangeProperties: function(statusOnly, key) {
    if (statusOnly) {
      this.notifyPropertyChange('status');
    } 
    else if(key) {
      this.notifyPropertyChange(key);
    } 
    else {
      this.allPropertiesDidChange();
    }
  },
  
  /**
    Normalizing a record will ensure that the underlying hash conforms
    to the record attributes such as their types (transforms) and default 
    values. 
    
    This method will write the conforming hash to the store and return
    the materialized record.
    
    By normalizing the record, you can use .attributes() and be
    assured that it will conform to the defined model. For example, this
    can be useful in the case where you need to send a JSON representation
    to some server after you have used .createRecord(), since this method
    will enforce the 'rules' in the model such as their types and default
    values. You can also include null values in the hash with the 
    includeNull argument.
    
    @param {Boolean} includeNull will write empty (null) attributes
    @returns {SC.Record} the normalized record
  */
  
  normalize: function(includeNull) {
    
    var primaryKey = this.primaryKey, 
        dataHash   = {}, 
        recordId   = this.get('id'), 
        store      = this.get('store'), 
        storeKey   = this.get('storeKey'), 
        recHash, attrValue, isRecord, defaultVal;
    
    dataHash[primaryKey] = recordId;
    
    for(var key in this) {
      // make sure property is a record attribute.
      if(this[key] && this[key]['typeClass']) {
        
        isRecord = SC.typeOf(this[key].typeClass())==='class';

        if (!isRecord) {
          attrValue = this.get(key);
          if(attrValue!==undefined || attrValue!==null) dataHash[key] = attrValue;
        }
        else if(isRecord) {
          recHash = store.readDataHash(storeKey);

          if(recHash[key]!==undefined) {
            // write value already there
            dataHash[key] = recHash[key];

          // or write default
          } else {
            defaultVal = this[key].get('defaultValue');

            // computed default value
            if (SC.typeOf(defaultVal)===SC.T_FUNCTION) {
              dataHash[key] = defaultVal();
            
            // plain value
            } else {
              dataHash[key] = defaultVal;
            }
          }
        }
        
        if (includeNull && dataHash[key]===undefined) dataHash[key] = null;
      }
    }
    
    store.writeDataHash(storeKey, dataHash);
    return store.materializeRecord(storeKey);
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

      // update ID if needed
      if (key === primaryKey) {
        SC.Store.replaceIdFor(this.get('storeKey'), value);
      }
      
    }
    return this.readAttribute(key);
  },
  
  /**
    Lets you commit this specific record to the store which will trigger
    the appropriate methods in the data source for you.
    
    @param {Hash} params optional additonal params that will passed down
      to the data source
  */
  commitRecord: function(params) {
    var store = this.get('store');
    store.commitRecord(undefined, undefined, this.get('storeKey'), params);
  },
  
  // ..........................................................
  // EMULATE SC.ERROR API
  // 
  
  /**
    Returns YES whenever the status is SC.Record.ERROR.  This will allow you 
    to put the UI into an error state.
    
    @property
    @type {Boolean}
  */
  isError: function() {
    return this.get('status') & SC.Record.ERROR;
  }.property('status').cacheable(),

  /**
    Returns the receiver if the record is in an error state.  Returns null
    otherwise.
    
    @property
    @type {SC.Record}
  */
  errorValue: function() {
    return this.get('isError') ? this : null;
  }.property('isError').cacheable(),
  
  /**
    Returns the current error object only if the record is in an error state.
    If no explicit error object has been set, returns SC.Record.GENERIC_ERROR.
    
    @property
    @type {SC.Error}
  */
  errorObject: function() {
    if (this.get('isError')) {
      var store = this.get('store');
      return store.readError(this.get('storeKey')) || SC.Record.GENERIC_ERROR;
    } else return null ;
  }.property('isError').cacheable(),
  
  // ...............................
  // PRIVATE
  //
  
  /** @private
    Creates string representation of record, with status.
    
    @returns {String}
  */
  
  toString: function() {
    var attrs = this.get('attributes');
    return "%@(%@) %@".fmt(this.constructor.toString(), SC.inspect(attrs), this.statusString());
  },
  
  /** @private
    Creates string representation of record, with status.
    
    @returns {String}
  */
  
  statusString: function() {
    var ret = [], status = this.get('status');
    
    for(prop in SC.Record) {
      if(prop.match(/[A-Z_]$/) && SC.Record[prop]===status) {
        ret.push(prop);
      }
    }
    
    return ret.join(" ");
  }
      
}) ;

// Class Methods
SC.Record.mixin( /** @scope SC.Record */ {

  // Record States
  CLEAN:            0x0001, // 1
  DIRTY:            0x0002, // 2
  
  EMPTY:            0x0100, // 256
  ERROR:            0x1000, // 4096
  
  READY:            0x0200, // 512
  READY_CLEAN:      0x0201, // 513
  READY_DIRTY:      0x0202, // 514
  READY_NEW:        0x0203, // 515
  
  DESTROYED:        0x0400, // 1024
  DESTROYED_CLEAN:  0x0401, // 1025
  DESTROYED_DIRTY:  0x0402, // 1026
  
  BUSY:             0x0800, // 2048
  BUSY_LOADING:     0x0804, // 2052
  BUSY_CREATING:    0x0808, // 2056
  BUSY_COMMITTING:  0x0810, // 2064
  BUSY_REFRESH:     0x0820, // 2080
  BUSY_REFRESH_CLEAN:  0x0821, // 2081
  BUSY_REFRESH_DIRTY:  0x0822, // 2082
  BUSY_DESTROYING:  0x0840, // 2112

  // exceptions that can be raised when processing records
  BAD_STATE_ERROR:     SC.$error("Internal Inconsistency"),
  RECORD_EXISTS_ERROR: SC.$error("Record Exists"),
  NOT_FOUND_ERROR:     SC.$error("Not found "),
  BUSY_ERROR:          SC.$error("Busy"),
  GENERIC_ERROR:       SC.$error("Generic Error"),
  
  /**
    Helper method returns a new SC.RecordAttribute instance to map a simple
    value or to-one relationship.  At the very least, you should pass the 
    type class you expect the attribute to have.  You may pass any additional
    options as well.
    
    Use this helper when you define SC.Record subclasses. 
    
    h4. Example
    
    {{{
      MyApp.Contact = SC.Record.extend({
        firstName: SC.Record.attr(String, { isRequired: YES })
      });
    }}}
    
    @param {Class} type the attribute type
    @param {Hash} opts the options for the attribute
    @returns {SC.RecordAttribute} created instance
  */
  attr: function(type, opts) { 
    return SC.RecordAttribute.attr(type, opts); 
  },
  
  /**
    Returns an SC.RecordAttribute that describes a fetched attribute.  When 
    you reference this attribute, it will return an SC.RecordArray that uses
    the type as the fetch key and passes the attribute value as a param.
    
    Use this helper when you define SC.Record subclasses. 
    
    h4. Example
    
    {{{
      MyApp.Group = SC.Record.extend({
        contacts: SC.Record.fetch('MyApp.Contact')
      });
    }}}
    
    @param {SC.Record|String} recordType The type of records to load
    @param {Hash} opts the options for the attribute
    @returns {SC.RecordAttribute} created instance
  */
  fetch: function(recordType, opts) {
    return SC.FetchedAttribute.attr(recordType, opts) ;
  },
  
  /**
    Returns an SC.ManyAttribute that describes a record array backed by an 
    array of guids stored in the underlying JSON.  You can edit the contents
    of this relationship.
    
    If you set the inverse and isMaster: NO key, then editing this array will
    modify the underlying data, but the inverse key on the matching record
    will also be edited and that record will be marked as needing a change.
    
    @param {SC.Reocrd|String} recordType The type of record to create
    @param {Hash} opts the options for the attribute
    @returns {SC.ManyAttribute} created instance
  */
  toMany: function(recordType, opts) {
    return SC.ManyAttribute.attr(recordType, opts);
  },
  
  /**
    Returns all storeKeys mapped by Id for this record type.  This method is
    used mostly by the SC.Store and the Record to coordinate.  You will rarely
    need to call this method yourself.
    
    @returns {Hash}
  */
  storeKeysById: function() {
    var key = SC.keyFor('storeKey', SC.guidFor(this)),
        ret = this[key];
    if (!ret) ret = this[key] = {};
    return ret;
  },
  
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
    var storeKeys = this.storeKeysById(),
        ret       = storeKeys[id];
    
    if (!ret) {
      ret = SC.Store.generateStoreKey();
      SC.Store.idsByStoreKey[ret] = id ;
      SC.Store.recordTypesByStoreKey[ret] = this ;
      storeKeys[id] = ret ;
    }
    
    return ret ;
  },
  
  /**
    Given a primaryKey value for the record, returns the associated
    storeKey.  As opposed to storeKeyFor() however, this method
    will NOT generate a new storeKey but returned undefined.
    
    @param {String} id a record id
    @returns {Number} a storeKey.
  */
  storeKeyExists: function(id) {
    var storeKeys = this.storeKeysById(),
        ret       = storeKeys[id];
    
    return ret ;
  },

  /** 
    Returns a record with the named ID in store.
    
    @param {SC.Store} store the store
    @param {String} id the record id
    @returns {SC.Record} record instance
  */
  find: function(store, id) {
    return store.find(this, id);
  },

  /**
    Finds all records in the store with this record type matching the named
    parameters.  This is the same as calling store.findAll(recordType, params)
    
    @param {SC.Store} store the store
    @param {Hash} params optional params
    @returns {SC.RecordArray} result set or null
  */
  findAll: function(store, params) {
    return store.findAll(this, params);
  },
  
  /** @private - enhance extend to notify SC.Query as well. */
  extend: function() {
    var ret = SC.Object.extend.apply(this, arguments);
    SC.Query._scq_didDefineRecordType(ret);
    return ret ;
  }
  
}) ;

/** 
  Alias for SC.Record.attr.  Using this version to describe to-one 
  relationships can sometimes make your code more understandable.
*/
SC.Record.toOne = SC.Record.attr ;

