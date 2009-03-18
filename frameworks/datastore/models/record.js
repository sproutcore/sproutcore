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

SC.RECORD_NEW = 0;
SC.RECORD_LOADING = 1;
SC.RECORD_LOADED = 2;
SC.RECORD_ERROR = 3;
SC.RECORD_DELETED = 4;

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
    When a new empty record is created, this will be set to true.  It will be
    set to NO again the first time the record is committed.
    
    @property {Boolean}
  */
  newRecord: NO,
  
  /**
    The record's status changes as it is loaded from the server.
    
    @property {Number}
  */
  status: SC.RECORD_EMPTY,

  /**
    The store that owns this record.  All changes will be buffered into this
    store and committed to the rest of the store chain through here.
    
    @property {SC.Store | SC.Server}
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
    Invoked by the UI to request the model object be updated from the server.
    
    Override to actually support server changes.
  */
  refresh: function() { 
    if (!this.get('newRecord')) {
      var store = this.get('store');
      if(store) {
        store.refreshRecords([this]); 
      }
    }
  },
  
  /**
    This can delete the record.  The non-server version just sets isDeleted.
  */
  destroy: function() { 
    var store = this.get('store');
    if(store) {
      store.destroyRecords([this]); 
    }
  },
  
  /**
    You can invoke this method anytime you need to make the record as dirty.
    This will cause the record to be commited when you commitChanges()
    on the underlying store.
    
    If you use the writeAttribute() primitive, this method will be called for 
    you.
    
    @returns {SC.Record} reciever
  */
  recordDidChange: function() {
    var store = this.get('store');
    if(store) {
      store.recordDidChange(this);
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
    var attrs = store.getDataHash(storeKey);
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
    var attrs = store.getWriteableDataHash(storeKey);
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
