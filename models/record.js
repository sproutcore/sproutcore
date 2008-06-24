// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('foundation/object') ;

SC.Record = SC.Object.extend({
  
  // ...............................
  // PROPERTIES
  //

  // override this with the properties you want the record to manage.
  properties: ['guid'],
  
  // this is the primary key used to distinguish records.  If the keys
  // match, the records are assumed to be identical.
  primaryKey: 'guid',
  
  // when a new empty record is created, this will be set to true.  It will be
  // set to false again the first time the record is committed.
  newRecord: false,
  
  // set to non-zero whenever the record has uncommitted changes.
  changeCount: 0,
  
  // set to true when the record is deleted.  Will cause it to be removed
  // from any member collections.  Once no more objects hold references to it,
  // the property will be disabled.
  isDeleted: false,
  
  // ...............................
  // CRUD OPERATIONS
  //

  // Set this URL to point to the type of resource this record is.  Put a
  // '%@' where you expect the primaryKey to be inserted to identify the
  // record.
  resourceURL: null,
  
  // The item providing the data for this.  Set to either the store or a
  // Server.  Setting it to the Store will make refresh and commit effectively
  // null-ops.
  dataSource: SC.Store,


  init: function()
  {
    arguments.callee.base.apply(this, arguments);
    
    var primaryKeyName = this.get('primaryKey');
    if (!this.get(primaryKeyName))
    {
      // no primary key passed for a new record.
      // we'll need to create one so that it can be cached in SC.Store
      // if this isn't desired behavior, override generateTempPrimaryKey to return false.
      var value = this.generateTempPrimaryKey();
      if (value) this.set(primaryKeyName, value);
    }
  },

  generateTempPrimaryKey: function()
  {
    return "@" + SC.getGUID(this);
  },

  // invoked by the UI to request the model object be updated from the server.
  // Override to actually support server changes.
  refresh: function() { 
    if (!this.get('newRecord')) this.dataSource.refreshRecords([this]); 
  },
  
  // invoked by the UI to tell the model this record should be saved. Override
  // to support server changes.  Note that this is used to support both the
  // create and update components of CRUD.
  commit: function() {
    // no longer a new record once changes have been committed.
    if (this.get('newRecord')) {
      this.dataSource.createRecords([this]) ;
    } else {
      this.dataSource.commitRecords([this]) ;
    }
  },
  
  // this can delete the record.  The non-server version just sets isDeleted.
  destroy: function() { this.dataSource.destroyRecords([this]) ; },

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
  
  // gets an attribute, converting it to the proper format.
  readAttribute: function(key) {
  	if (!this._cachedAttributes) this._cachedAttributes = {} ;
  	var ret = this._cachedAttributes[key] ;
  	if (ret === undefined) {
			var attr = this._attributes ;
			ret = (attr) ? attr[key] : undefined ;
			if (ret !== undefined) {
				var recordType = this._getRecordType(key+'Type') ;
				ret = this._propertyFromAttribute(ret, recordType) ;
			}
			this._cachedAttributes[key] = ret ;
  	}
  	return (ret === undefined) ? null : ret;
  },

  // updates the attribute, converting it back to the property format.
  writeAttribute: function(key, value) {
    var recordType = this._getRecordType(key+'Type') ;
    var ret = this._attributeFromProperty(value, recordType) ;
    if (!this._attributes) this._attributes = {} ;
    this._attributes[key] = ret ;
    if (this._cachedAttributes) delete this._cachedAttributes[key];  // clear cache.
    this.incrementProperty('changeCount') ;
    if (SC.Store) SC.Store.recordDidChange(this) ;
    return value ;  
  },
  
  // This will take the incoming set of attributes and update internal set. Note that
  // if the attributes have never been set, then the object you pass in may become
  // the new set of attribute.  This assumes the attrs you pass in will not be
  // modified later.  This method also assumes it is coming from the server, so the
  // change count will be reset.
  updateAttributes: function(newAttrs, replace, isLoaded) {
    var changed = false ;
    if (this._attributes && (replace !== true)) {
      for(var key in newAttrs) {
        if (!newAttrs.hasOwnProperty(key)) continue ;
        if (!changed) changed = (this._attributes[key] != newAttrs[key]) ;
        this._attributes[key] = newAttrs[key] ;
      }
    } else {
      this._attributes = newAttrs ;
      changed = true ;
    }
    
    this._cachedAttributes = {} ; // reset cache.
    
    if (changed) {
      this.beginPropertyChanges() ;
      this.set('changeCount',0) ;
      this.set('isLoaded',isLoaded) ;
      this.allPropertiesDidChange() ;
      this.endPropertyChanges() ;

      if (SC.Store) SC.Store.recordDidChange(this) ;
    }
  },
  
  // This will return the current set of attributes as a hash you can send back
  // to the server.
  attributes: function() {
    return Object.clone(this._attributes) ;
  }.property(),
  
  // If you try to get/set a property not defined by the record, then this method
  // will be called. It will try to get the value from the set of attributes.
  unknownProperty: function( key, value )
  {
    if (value !== undefined) {
      
      // if we're modifying the PKEY, then SC.Store needs to relocate where this record is cached.
      // store the old key, update the value, then let the store do the housekeeping...
      var primaryKeyName = this.get('primaryKey');
      if (key == primaryKeyName)
      {
        var oldPrimaryKey  = this.get(key);
        var newPrimaryKey  = value;
      }
      
      this.writeAttribute(key,value);
      
      // no need to relocate if there wasn't an old key...
      if ((key == primaryKeyName) && oldPrimaryKey) SC.Store.relocateRecord( oldPrimaryKey, newPrimaryKey, this );
      
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
      var that = this;
      return value.map(function(v) { 
        return that._propertyFromAttribute(v,recordType); 
      }) ;
    } else {
      var typeConverter = this._pickTypeConverter(recordType) ;
      if (typeConverter) return typeConverter(value,'in') ;
      if (recordType) {
        if (!value) return null ;
        return SC.Store.getRecordFor(value,recordType) ;
      } else return value ;
    }
  },
  
  _getRecordType: function(recordTypeKey) {
    var type = this[recordTypeKey] ;
    if (type && (typeof(type) == "string")) {
      type = eval(type) ; // look up type.
      if (type) this[recordTypeKey] = type ;
    }
    return type ;
  },
  
  // ...............................
  // SORTING AND COMPARING RECORDS
  //
  
  valueForSortKey: function(key) { return this.get(key); },
  
  // this will compare the target object with the receiver, using the 
  // orderBy parameters.
  compareTo: function(object, orderBy) {
    if (!orderBy) orderBy = [this.get('primaryKey')] ;
    var ret = SC.Record.SORT_SAME ; var loc ;
    for(loc=0; (ret == SC.Record.SORT_SAME && loc<orderBy.length); loc++) {
      var key = orderBy[loc] ;
      
      // determine order
      var asc = true ;
      if (key.match(/ DESC$/)) { 
        asc = false; key = key.slice(0,-5); 
      } else if (key.match(/ ASC$/)) {
        asc = true; key = key.slice(0,-4); 
      }

      // if key contains a .dot then we need to get the value for the key.
      var keys = key.split('.') ;
      key = keys.shift() ;
      
      // get values for key.
      var a = this.valueForSortKey(key) ;
      var b = object.valueForSortKey(key) ;
      
      // convert the values to comparable values.
      a = this._comparableValueFor(a,keys) ;
      b = this._comparableValueFor(b,keys) ;
      
      // compare values
      if (asc) {
        ret = (a<b) ? SC.Record.SORT_BEFORE : ((a>b) ? SC.Record.SORT_AFTER : SC.Record.SORT_SAME) ;
      } else {
        ret = (a>b) ? SC.Record.SORT_BEFORE : ((a<b) ? SC.Record.SORT_AFTER : SC.Record.SORT_SAME) ;
      }
    }
    return ret ;
  },
  
  _comparableValueFor: function(value, keys) {
    if (keys && keys.length > 0) {
      var key ; var loc = 0 ;
      while(value && (loc < keys.length)) {
        key = keys[loc]; 
        value = (value.get) ? value.get(key) : value[key] ;
        loc++ ;
      }
    
    // handle records.
    } else value = (value && value._guid) ? value._guid : value ;
    return value ;
  },
  
  // used to match records to a set of conditions.  By default, this will
  // call matchCondition on each condition.
  matchConditions: function(conditions) {
    for(var key in conditions) {
      var value = conditions[key] ;
      if (value instanceof Array) {
        var loc = value.length ; var isMatch = false ;
        while(--loc >= 0) {
          if (this.matchCondition(key,value[loc])) isMatch = true ;
        }
        if (!isMatch) return false ;
      } else if (!this.matchCondition(key,value)) return false ;      
    }
    return true ;
  },
  
  // by default this just gets the key value and compares it.  Based on the 
  // type of the receiver's value, try to massage the condition value into
  // that.
  matchCondition: function(key, value) {
    var recValue = this.get(key) ;    
    var isMatch ;
    
    // massage value.
    if (value &&  value.primaryKey) value = value.get(value.primaryKey) ;
    
    if (recValue instanceof Array) {
      var loc = recValue.length ;
      while(--loc >= 0) { 
        if (this._matchValue(recValue[loc],value)) return true; 
      }
    } else return this._matchValue(recValue,value) ;
    return false ;
  },

  _matchValue: function(recValue,value) {
    // massage recValue a tad
    if (recValue && recValue.primaryKey && typeof(value) == "string") recValue = recValue.get(recValue.primaryKey) ;
    var stringify = (value instanceof RegExp);
    return (stringify) ? recValue.toString().match(value) : recValue==value ;        
  },
  
  // ...............................
  // PRIVATE
  //
  
  toString: function() {
    var that = this ;  
    var ret = this.get('properties').map(function(key) {
      var value = that.get(key) ; 
      if (typeof(value) == "string") value = '"' + value + '"' ;
      if (value === undefined) value = "(undefined)" ;
      if (value === null) value = "(null)" ;
      return [key,value].join('=') ;
    }) ;
    return 'Record({ ' + ret.join(', ') + ' })' ;
  },
  
  propertyObserver: function(observing,target,key,value) {
    //if ((target == this) && this.properties.include(key)) this.incrementProperty('changeCount') ;
  },
  
  _cprops: ['properties'],

  // This method should be used by the server to push updated data into a
  // record.  The data should be a hash with strings and arrays.  This will
  // use any types you define to convert the values into their correct type.
  // Note that references to external objects should be a string with the
  // primaryKey value of the record.
  updateProperties: function(data,isLoaded) {
    var rec = this ;
    
    // for each property, if there is a value in the passed data, convert it to
    // the configured type.
    this.beginPropertyChanges() ;
    if (isLoaded) this.set('isLoaded',true) ;
    try {
      var loc = this.properties.length ;
      while(--loc >= 0) {
        var prop = this.properties[loc] ;
        var newValue = data[prop] ;

        //if (prop == 'tags') debugger ;
        
        // handle null values
        if (newValue === null) {
          if (rec.get(prop) != null) rec.set(prop,null) ;
          
        // handle defined, non-null values
        } else if (newValue !== undefined) {
          
          var oldValue = rec.get(prop) ;            
          
          // get type information
          var recordType = rec.get(prop + 'Type') ;
          var typeConverter = this._pickTypeConverter(recordType) ;
          if (typeConverter) recordType = null ;
 
          // if array, convert each object.
          var isSame ; var rec = this ;
          if (newValue instanceof Array) {
            newValue = newValue.map(function(nv) {
              return rec._convertValueIn(nv,typeConverter,recordType) ;
            }) ;
            isSame = newValue.isEqual(oldValue) ;
          } else {
            newValue = this._convertValueIn(newValue,typeConverter,recordType);
            isSame = newValue == oldValue ;
          }
          
          // set value
          if (!isSame) this.set(prop,newValue) ;
           
        }
      }
    }
    
    catch(e) {
      console.log(this._guid + ': Exception raised on UPDATE: ' + e) ;
    }

    this.endPropertyChanges() ;   
    this.set('changeCount',0) ;        
  },
  
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
      return (value) ? value.get(recordType.primaryKey) : null ;
    } else return value ;
  },
  
  _convertValueIn: function(value,typeConverter,recordType) {
    if (typeConverter) return typeConverter(value,'in') ;
    if (recordType) {
      return SC.Store.getRecordFor(value,recordType) ;
    } else return value ;
  },
  
  // used by the store
  _storeKey: function() { return this._type._storeKey(); }  
  
     
}) ;

// Class Methods
SC.Record.mixin({

  // Constants for sorting
  SORT_BEFORE: -1, SORT_AFTER: 1, SORT_SAME: 0,

  // Used to find the first object matching the specified conditions.  You can pass
  // in either a simple guid or one or more hashes of conditions.
  find: function(guid) {
    var args ;
    if (typeof(guid) == 'object') {
      args = $A(arguments) ;
      args.push(this) ;
      var ret = SC.Store.findRecords.apply(SC.Store,args) ;
      return (ret && ret.length > 0) ? ret[0] : null ;
    } else return SC.Store._getRecordFor(guid,this) ;
  },
  
  findOrCreate: function(guid) {
    var ret = this.find(guid) ;
    if (!ret) {
      var opts = (typeof(guid) == "object") ? guid : { guid: guid } ;
      ret = this.create(opts) ;
      SC.Store.addRecord(ret) ;
    }
    return ret ;
  },
  
  // Same as find except returns all records matching the passed conditions.
  findAll: function(filter) {
    if (!filter) filter = {} ;
    args = $A(arguments) ; args.push(this) ; // add type
    return SC.Store.findRecords.apply(SC.Store,args) ;  
  },
  
  // Returns a collection with any passed settings and the receiver as a 
  // record type.
  collection: function(opts) {
    if (!opts) opts = {} ;
    opts.recordType = this;
    return SC.Collection.create(opts) ;
  },
  
  /// POSSIBLY REMOVE?
  
  // defines coreRecordType as the first level of extension from SC.Record.
  // e.g. for SC.Record > Contact > Person,  the core record type is Contact.
  extend: function() {
    var ret = SC.Object.extend.apply(this,arguments) ;
    if (ret.coreRecordType == null) ret.coreRecordType = ret ;
    return ret ;
  },  

  // used by the store
  _storeKey: function() {
    return (this.coreRecordType) ? this.coreRecordType._guid : this._guid ;
  },
  
  primaryKey: function() { return this.prototype.primaryKey; },

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

    var privateKey = '_' + conditionKey ;
    return function() {
      if (!this[privateKey]) {
        var recordType = eval(recordTypeString);
        conditions[conditionKey] = this ;
        this[privateKey] = recordType.collection(opts) ;
        this[privateKey].refresh() ; // get the initial data set.
      }
      return this[privateKey] ;
    }.property();
  },
  
  // This will create a new record with the type.  Include the data and an
  // optional data source.
  newRecord: function(attrs,dataSource) {
    if (!dataSource) dataSource = SC.Store ;
    var rec = this.create({ dataSource: dataSource }) ;
    rec.beginPropertyChanges();
    rec.set('newRecord',true);
    for(var key in attrs) {
      if (attrs.hasOwnProperty(key)) rec.set(key,attrs[key]) ;
    }
    rec.endPropertyChanges() ;
    SC.Store.addRecord(rec) ;
    return rec; 
  }
  
}) ;

// Built in Type Converters.  You can also use an SC.Record.
SC.Record.Date = function(value,direction) {
  if (direction == 'out') {
    if (value instanceof Date) value = value.utcFormat() ;
    
  } else if (typeof(value) == "string") {
    // try to parse date. trim any decimal numbers at end since Rails sends
    // this sometimes.
    var ret = Date.parse(value.replace(/\.\d+$/,'')) ;
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
  } else return (value) ? true : false ;
}.typeConverter() ;

SC.Record.Bool = SC.Record.Flag ;

