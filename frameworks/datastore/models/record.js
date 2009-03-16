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
    
    @property
    @type {Boolean}
  */
  newRecord: NO,
  
  /**
    The record's status changes as it is loaded from the server.
    
    @property
    @type {Number}
  */
  status: SC.RECORD_EMPTY,
  
  /**
    @private

    The edit level needs to be 0 in order to commit a record.
    
    @property
    @type {Integer}
  */
  _editLevel: 0,

  /**
    @private

    This is the store key for the record, it is used to link it back to the 
    dataHash. If a record is reused, this value will be replaced.
    
    @property
    @type {Integer}
  */
  _storeKey: null,

  
  // ...............................
  // CRUD OPERATIONS
  //

  /**
    The item providing the data for this.  Set to either the store or a
    Server.  Setting it to the Store will make refresh and commit effectively
    null-ops.
    
    @property
    @type {SC.Store or SC.Server}
  */
  store: SC.Store,

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
    This is automatically called when using set on a property. However, if you
    want to prevent the store from being updated with every set, you can get 
    edits from being propagated by calling beginEditing() first then ending 
    the editing session with endEditing().
  */
  beginEditing: function() {
    if(this._editLevel === 0) {
      var store = this.get('store');
      if(store) {
        store.makeRecordEditable(this); 
      }
    }
    this._editLevel++;
  },

  /**
    This is automatically called when using set on a property. However, if you
    want to prevent the store from being updated with every set, you can get 
    edits from being propagated by calling beginEditing() function first then 
    ending the editing session with endEditing().
  */
  endEditing: function() {
    this._editLevel--;
    if(this._editLevel <= 0) {
      this._editLevel = 0;
      this.recordDidChange();
    }
  },
  
  // ...............................
  // ATTRIBUTES
  //
  // The core attributes hash is used to store the values of a record in a 
  // format that can be easily passed to/from the server.  The values should 
  // generally be stored in their raw string form.  References to external 
  // records should be stored as primary keys.
  //
  // Normally you do not need to work with the attributes hash directly.  
  // Instead you should use get/set on normal record properties.  If the 
  // property is not defined on the object, then the record will check the 
  // attributes hash instead.
  // 
  // You can bulk update attributes from the server using the 
  // updateAttributes() method.
  
  /**
    Gets an attribute, converting it to the proper format.
  
    @param {string} key the attribute you want to read
    @returns {value} the value of the key, or null if it doesn't exist
  **/
  readAttribute: function(key) {
    var store = this.get('store'), storeKey = this._storeKey;
    var cached = store.cachedAttributes[storeKey];
    var attr = store.dataHashes[storeKey];
    if(cached === undefined) cached = {};
    if (cached[key] !== undefined) return cached[key];

    var ret = (attr) ? attr[key] : undefined ;
    ret = ret || this[key] ; // also check properties...
    if (ret !== undefined) {
      var recordType = this.recordType(key+'Type') ;
      ret = this._propertyFromAttribute(ret, recordType) ;
    }
    store.cachedAttributes[storeKey] = cached[key] = ret;
    return (ret === undefined) ? null : ret;
  },

  /**
    Updates the attribute, converting it back to the property format.
  
    @param {String} key the attribute you want to read
    @param {Object} value the attribute you want to read
    @returns {Object} the value of the key, or null if it doesn't exist
  **/
  writeAttribute: function(key, value) {
    this.beginEditing();
    var recordType = this.recordType(key+'Type') ;
    var ret = this._attributeFromProperty(value, recordType) ;

    var store = this.get('store'), storeKey = this._storeKey;
    var cached = store.cachedAttributes[storeKey];
    var attr = store.dataHashes[storeKey];
    
    if(!attr) attr = {};
    if(!cached) cached = {};
    
    attr[key] = ret ;
    if (cached) delete cached[key];  // clear cache.
    this.endEditing();
    return value ;  
  },
  
  /**
    You can invoke this method anytime you need to make the record as dirty
    and needing a commit to the server.
  */
  recordDidChange: function() {
    var store = this.get('store');
    if(store) {
      store.recordDidChange(this);
    }
  },
  
  /**
    This will return the current set of attributes as a hash you can send 
    back to the server.
  
    @returns {Object} the current attributes of the receiver
  **/
  attributes: function() {
    var store = this.get('store'), storeKey = this._storeKey;
    var attr = store.dataHashes[storeKey];
    return SC.clone(attr);
  }.property(),
  
  /**
    If you try to get/set a property not defined by the record, then this 
    method will be called. It will try to get the value from the set of 
    attributes.
  
    @param {String} key the attribute being get/set
    @param {Object} value the value to set the key to, if present
    @returns {Object} the value
  **/
  unknownProperty: function( key, value )
  {
    if (value !== undefined) {
      
      // if we're modifying the PKEY, then SC.Store needs to relocate where 
      // this record is cached. store the old key, update the value, then let 
      // the store do the housekeeping...
      var primaryKeyName = this.get('primaryKey');
      if (key == primaryKeyName)
      {
        var oldPrimaryKey  = this.get(key);
        var newPrimaryKey  = value;
      }
      
      this.writeAttribute(key,value);
      
      // no need to relocate if there wasn't an old key...
      if ((key == primaryKeyName) && oldPrimaryKey) {
        SC.Store.relocateRecord( oldPrimaryKey, newPrimaryKey, this );
      }
      
    } else {
      value = this.readAttribute(key);
    }
    return value;
  },
  
  _attributeFromProperty: function(value,recordType) {
    if (value && value instanceof Array) {
      var that = this;
      return value.map(function(v) { 
        return that._attributeFromProperty(v,recordType); 
      }) ;
    } else {
      var typeConverter = this._pickTypeConverter(recordType) ;
      if (typeConverter) return typeConverter(value,'out') ;
      if (recordType) {
        return (value) ? value.get(recordType.primaryKey()) : null ;
      } else return value ;
    }
  },
  
  _propertyFromAttribute: function(value,recordType) {
    if (value && value instanceof Array) {
      var max = value.get('length') ;
      var ret = new Array(max) ; 
      for(var idx=0;idx<max;idx++) {
        var v = value.objectAt(idx) ; 
        ret[idx] = this._propertyFromAttribute(v, recordType) ; 
      }
      ret.ownerRecord = this ;
      return ret ;
      
    } else {
      var typeConverter = this._pickTypeConverter(recordType) ;
      if (typeConverter) return typeConverter(value,'in') ;
      if (recordType) {
        if (!value) return null ;
        return SC.Store.getRecordFor(value,recordType) ;
      } else return value ;
    }
  },
  
  recordType: function(recordTypeKey) {
    var type = this[recordTypeKey] ;
    if (type && (typeof(type) == "string")) {
      type = eval(type) ; // look up type.
      if (type) this[recordTypeKey] = type ;
    }
    return type ;
  },

  // ...............................
  // PRIVATE
  //
  
  toString: function() {
    var that = this ;  
    var store = this.get('store'), storeKey = this._storeKey;
    var cached = store.cachedAttributes[storeKey];

    var ret = cached.map(function(key) {
      var value = that.get(key) ; 
      if (typeof(value) == "string") value = '"' + value + '"' ;
      if (value === undefined) value = "(undefined)" ;
      if (value === null) value = "(null)" ;
      return [key,value].join('=') ;
    }) ;
    return this.constructor.toString() + '({ ' + ret.join(', ') + ' })' ;
  },
    
  concatenatedProperties: ['properties'],
  
  // this is used for the update.  It should return a hash with current state
  // of the record.  This uses the types to automatically marshall properties.
  getPropertyData: function() {
    var ret = {} ;
    var properties = this.get('properties') || []; var loc = properties.length;
    while(--loc >= 0) {
      var key = properties[loc] ;
      var value = this.get(key) ;
      var recordType = this[key + 'Type'] ;
      var typeConverter = this._pickTypeConverter(recordType) ;
      if (typeConverter) recordType = null ;
      
      // if there is a type, use that to make the conversion.
      if (value instanceof Array) {
        var ary = [] ;
        for(var vloc=0;vloc<value.length;vloc++) {
          var v = value[vloc] ;
          ary.push(this._convertValueOut(v,typeConverter,recordType));          
        }
        value = ary ;
      } else value = this._convertValueOut(value,typeConverter,recordType);
      
      // set key
      ret[key] = value ;
    }
    return ret ;
  },
  
  _pickTypeConverter: function(recordType) {
    var typeConverter = null ;
    if (recordType && recordType.isTypeConverter) {
      typeConverter = recordType; recordType = null ;
    } else if(recordType) switch(recordType) {
      case Date:
        typeConverter = SC.Record.Date; recordType = null ;
        break ;
      case Number:
        typeConverter = SC.Record.Number; recordType = null;
        break;
      case String:
        typeConverter = null; recordType = null ;
        break ;
    }          
    return typeConverter;
  },
  
  _convertValueOut: function(value,typeConverter,recordType) {
    if (typeConverter) return typeConverter(value,'out') ;
    if (recordType) {
      return (value) ? value.get(recordType.primaryKey()) : null ;
    } else return value ;
  },
  
  _convertValueIn: function(value,typeConverter,recordType) {
    if (typeConverter) return typeConverter(value,'in') ;
    if (recordType) {
      return SC.Store.getRecordFor(value,recordType) ;
    } else return value ;
  }
  
}) ;

// Class Methods
SC.Record.mixin(
/** @static SC.Record */ {

  // Constants for sorting
  SORT_BEFORE: -1, SORT_AFTER: 1, SORT_SAME: 0,

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
  },
  
  // defines coreRecordType as the first level of extension from SC.Record.
  // e.g. for SC.Record > Contact > Person,  the core record type is Contact.
  extend: function() {
    var ret = SC.Object.extend.apply(this,arguments) ;
    if (ret.coreRecordType == null) ret.coreRecordType = ret ;
    return ret ;
  },  

//  primaryKey: function() { return this.prototype.primaryKey; },

  // this is set by extend to point to the core record type used to store
  // the record in the pool.  The coreRecordType is always the first record
  // type created.
  coreRecordType: null,

  resourceURL: function() { return this.prototype.resourceURL; },
  
  // This will add a property function for your record with a collection
  // of records with the given type that belong to your record.
  hasMany: function(recordTypeString,conditionKey,opts) {
    opts = (opts === undefined) ? {} : Object.clone(opts) ;
    var conditions = opts.conditions || {} ;
    opts.conditions = conditions ;

    var privateKey = '_' + conditionKey + SC.generateGuid() ;
    return function() {
      if (!this[privateKey]) {
        var recordType = eval(recordTypeString);
        conditions[conditionKey] = this ;
        this[privateKey] = recordType.collection(opts) ;
        this[privateKey].refresh() ; // get the initial data set.
      }
      return this[privateKey] ;
    }.property();
  }
  
}) ;

SC.Record.newObject = SC.Record.newRecord; // clone method

// Built in Type Converters.  You can also use an SC.Record.
SC.Record.Date = function(value,direction) {
  if (direction == 'out') {
    if (value instanceof Date) value = value.utcFormat() ;
    
  } else if (typeof(value) == "string") {
    // try to parse date. trim any decimal numbers at end since Rails sends
    // this sometimes.
    var ret = new Date( Date.parse(value.replace(/\.\d+$/,'')) );
    if (ret) value = ret ;
  }
  return value ;
}.typeConverter() ;

SC.Record.Number = function(value,direction) {
  if (direction == 'out') {
    if (typeof(value) == "number") value = value.toString() ;
  
  } else if (typeof(value) == "string") {
    var ret = (value.match('.')) ? parseFloat(value) : parseInt(value,0) ;
    if (ret) value = ret ;
  }
  return value ;
}.typeConverter() ;

SC.Record.Flag = function(value, direction) {
  if (direction == 'out') {
    return value = (value) ? 't' : 'f' ;
  } else if (typeof(value) == "string") {
    return !('false0'.match(value.toLowerCase())) ;
  } else return (value) ? YES : NO ;
}.typeConverter() ;

SC.Record.Bool = SC.Record.Flag ;





