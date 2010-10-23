// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('models/record');
sc_require('models/child_record');

/** @class

  A RecordAttribute describes a single attribute on a record.  It is used to
  generate computed properties on records that can automatically convert data
  types and verify data.
  
  When defining an attribute on an SC.Record, you can configure it this way: 
  
  {{{
    title: SC.Record.attr(String, { 
      defaultValue: 'Untitled',
      isRequired: YES|NO
    })
  }}}
  
  In addition to having predefined transform types, there is also a way to 
  set a computed relationship on an attribute. A typical example of this would
  be if you have record with a parentGuid attribute, but are not able to 
  determine which record type to map to before looking at the guid (or any
  other attributes). To set up such a computed property, you can attach a 
  function in the attribute definition of the SC.Record subclass:
  
  {{{
    relatedToComputed: SC.Record.toOne(function() {
      return (this.readAttribute('relatedToComputed').indexOf("foo")==0) ? MyApp.Foo : MyApp.Bar;
    })
  }}}
  
  Notice that we are not using .get() to avoid another transform which would 
  trigger an infinite loop.
  
  You usually will not work with RecordAttribute objects directly, though you
  may extend the class in any way that you like to create a custom attribute.

  A number of default RecordAttribute types are defined on the SC.Record.
  
  @extends SC.Object
  @since SproutCore 1.0
*/
SC.RecordAttribute = SC.Object.extend(
  /** @scope SC.RecordAttribute.prototype */ {

  /**
    The default value.  If attribute is null or undefined, this default value
    will be substituted instead.  Note that defaultValues are not converted
    so the value should be in the output type expected by the attribute.
    
    If you use a defaultValue function, the arguments given to it is the
    record instance and the key.
    
    @property {Object|function}
  */
  defaultValue: null,
  
  /**
    The attribute type.  Must be either an object class or a property path
    naming a class.  The built in handler allows all native types to pass 
    through, converts records to ids and dates to UTF strings.
    
    If you use the attr() helper method to create a RecordAttribute instance,
    it will set this property to the first parameter you pass.
    
    @property {Object|String}
  */
  type: String,
  
  /**
    The underlying attribute key name this attribute should manage.  If this
    property is left empty, then the key will be whatever property name this
    attribute assigned to on the record.  If you need to provide some kind
    of alternate mapping, this provides you a way to override it.
    
    @property {String}
  */
  key: null,
  
  /**
    If YES, then the attribute is required and will fail validation unless
    the property is set to a non-null or undefined value.
    
    @property {Boolean}
  */
  isRequired: NO,
  
  /**
    If NO then attempts to edit the attribute will be ignored.
    
    @property {Boolean}
  */
  isEditable: YES,  
  
  /**
    If set when using the Date format, expect the ISO8601 date format.  
    This is the default.
    
    @property {Boolean}
  */
  useIsoDate: YES,
  
  /**
    Can only be used for toOne or toMany relationship attributes. If YES,
    this flag will ensure that any related objects will also be marked
    dirty when this record dirtied. 
    
    Useful when you might have multiple related objects that you want to 
    consider in an 'aggregated' state. For instance, by changing a child
    object (image) you might also want to automatically mark the parent 
    (album) dirty as well.
    
    @property {Boolean}
  */
  aggregate: NO,
  
  // ..........................................................
  // HELPER PROPERTIES
  // 
  
  /**
    Returns the type, resolved to a class.  If the type property is a regular
    class, returns the type unchanged.  Otherwise attempts to lookup the 
    type as a property path.
    
    @property {Object}
  */
  typeClass: function() {
    var ret = this.get('type');
    if (SC.typeOf(ret) === SC.T_STRING) ret = SC.objectForPropertyPath(ret);
    return ret ;
  }.property('type').cacheable(),
  
  /**
    Finds the transform handler. 
    
    @property {Function}
  */
  transform: function() {
    var klass      = this.get('typeClass') || String,
        transforms = SC.RecordAttribute.transforms,
        ret ;
        
    // walk up class hierarchy looking for a transform handler
    while(klass && !(ret = transforms[SC.guidFor(klass)])) {
      // check if super has create property to detect SC.Object's
      if(klass.superclass.hasOwnProperty('create')) klass = klass.superclass ;
      // otherwise return the function transform handler
      else klass = SC.T_FUNCTION ;
    }
    
    return ret ;
  }.property('typeClass').cacheable(),
  
  // ..........................................................
  // LOW-LEVEL METHODS
  // 
  
  /** 
    Converts the passed value into the core attribute value.  This will apply 
    any format transforms.  You can install standard transforms by adding to
    the SC.RecordAttribute.transforms hash.  See 
    SC.RecordAttribute.registerTransform() for more.
    
    @param {SC.Record} record the record instance
    @param {String} key the key used to access this attribute on the record
    @param {Object} value the property value
    @returns {Object} attribute value
  */
  toType: function(record, key, value) {
    var transform = this.get('transform'),
        type      = this.get('typeClass');
    
    if (transform && transform.to) {
      value = transform.to(value, this, type, record, key) ;
    }
    return value ;
  },

  /** 
    Converts the passed value from the core attribute value.  This will apply 
    any format transforms.  You can install standard transforms by adding to
    the SC.RecordAttribute.transforms hash.  See 
    SC.RecordAttribute.registerTransform() for more.

    @param {SC.Record} record the record instance
    @param {String} key the key used to access this attribute on the record
    @param {Object} value the property value
    @returns {Object} attribute value
  */
  fromType: function(record, key, value) {
    var transform = this.get('transform'),
        type      = this.get('typeClass');
    
    if (transform && transform.from) {
      value = transform.from(value, this, type, record, key);
    }
    return value;
  },

  /**
    The core handler.  Called from the property.
    
    @param {SC.Record} record the record instance
    @param {String} key the key used to access this attribute on the record
    @param {Object} value the property value if called as a setter
    @returns {Object} property value
  */
  call: function(record, key, value) {
    var attrKey = this.get('key') || key, nvalue;
    
    if ((value !== undefined) && this.get('isEditable')) {
      // careful: don't overwrite value here.  we want the return value to 
      // cache.
      nvalue = this.fromType(record, key, value) ; // convert to attribute.
      record.writeAttribute(attrKey, nvalue); 
    } 

    nvalue = value = record.readAttribute(attrKey);
    if (SC.none(value) && (value = this.get('defaultValue')) && record.get('status') & SC.Record.READY_NEW) {
      if (typeof value === SC.T_FUNCTION) {
        value = this.defaultValue(record, key, this);
        // write default value so it doesn't have to be executed again
        if ((nvalue !== value)  &&  record.get('store').readDataHash(record.get('storeKey'))) {
          record.writeAttribute(attrKey, value, true);
        }
      } else {
        // Support for SC.DateTime.
        if (SC.kindOf(value, SC.DateTime)) {
          record.writeAttribute(attrKey, value.toISO8601(), true);
        } else {
          record.writeAttribute(attrKey, value, true);
        }
      }
    } else value = this.toType(record, key, value);
    
    return value ;
  },

  // ..........................................................
  // INTERNAL SUPPORT
  // 
  
  /** @private - Make this look like a property so that get() will call it. */
  isProperty: YES,
  
  /** @private - Make this look cacheable */
  isCacheable: YES,
  
  /** @private - needed for KVO property() support */
  dependentKeys: [],
  
  /** @private */
  init: function() {
    sc_super();
    // setup some internal properties needed for KVO - faking 'cacheable'
    this.cacheKey = "__cache__" + SC.guidFor(this) ;
    this.lastSetValueKey = "__lastValue__" + SC.guidFor(this) ;
  }
  
}) ;

// ..........................................................
// CLASS METHODS
// 

/**
  The default method used to create a record attribute instance.  Unlike 
  create(), takes an attributeType as the first parameter which will be set 
  on the attribute itself.  You can pass a string naming a class or a class
  itself.
  
  @param {Object|String} attributeType the assumed attribute type
  @param {Hash} opts optional additional config options
  @returns {SC.RecordAttribute} new instance
*/
SC.RecordAttribute.attr = function(attributeType, opts) {
  if (!opts) opts = {} ;
  if (!opts.type) opts.type = attributeType || String ;
  return this.create(opts);
};

/** @private
  Hash of registered transforms by class guid. 
*/
SC.RecordAttribute.transforms = {};

/**
  Call to register a transform handler for a specific type of object.  The
  object you pass can be of any type as long as it responds to the following
  methods:

  | *to(value, attr, klass, record, key)* | converts the passed value (which will be of the class expected by the attribute) into the underlying attribute value |
  | *from(value, attr, klass, record, key)* | converts the underyling attribute value into a value of the class |
  
  @param {Object} klass the type of object you convert
  @param {Object} transform the transform object
  @returns {SC.RecordAttribute} receiver
*/
SC.RecordAttribute.registerTransform = function(klass, transform) {
  SC.RecordAttribute.transforms[SC.guidFor(klass)] = transform;
};

// ..........................................................
// STANDARD ATTRIBUTE TRANSFORMS
// 

// Object, String, Number just pass through.

/** @private - generic converter for Boolean records */
SC.RecordAttribute.registerTransform(Boolean, {
  /** @private - convert an arbitrary object value to a boolean */
  to: function(obj) {
    return SC.none(obj) ? null : !!obj;
  }
});

/** @private - generic converter for Numbers */
SC.RecordAttribute.registerTransform(Number, {
  /** @private - convert an arbitrary object value to a Number */
  to: function(obj) {
    return SC.none(obj) ? null : Number(obj) ;
  }
});

/** @private - generic converter for Strings */
SC.RecordAttribute.registerTransform(String, {
  /** @private - 
    convert an arbitrary object value to a String 
    allow null through as that will be checked separately
  */
  to: function(obj) {
    if (!(typeof obj === SC.T_STRING) && !SC.none(obj) && obj.toString) {
      obj = obj.toString();
    }
    return obj;
  }
});

/** @private - generic converter for Array */
SC.RecordAttribute.registerTransform(Array, {
  /** @private - check if obj is an array
  */
  to: function(obj) {
    if (!SC.isArray(obj) && !SC.none(obj)) {
      obj = [];
    }
    return obj;
  }
});

/** @private - generic converter for Object */
SC.RecordAttribute.registerTransform(Object, {
  /** @private - check if obj is an object */
  to: function(obj) {
    if (!(typeof obj === 'object') && !SC.none(obj)) {
      obj = {};
    }
    return obj;
  }
});

/** @private - generic converter for SC.Record-type records */
SC.RecordAttribute.registerTransform(SC.Record, {

  /** @private - convert a record id to a record instance */
  to: function(id, attr, recordType, parentRecord) {
    var store = parentRecord.get('store');
    if (SC.none(id) || (id==="")) return null;
    else return store.find(recordType, id);
  },
  
  /** @private - convert a record instance to a record id */
  from: function(record) { return record ? record.get('id') : null; }
});

/** @private - generic converter for transforming computed record attributes */
SC.RecordAttribute.registerTransform(SC.T_FUNCTION, {

  /** @private - convert a record id to a record instance */
  to: function(id, attr, recordType, parentRecord) {
    recordType = recordType.apply(parentRecord);
    var store = parentRecord.get('store');
    return store.find(recordType, id);
  },
  
  /** @private - convert a record instance to a record id */
  from: function(record) { return record.get('id'); }
});

/** @private - generic converter for Date records */
SC.RecordAttribute.registerTransform(Date, {

  /** @private - convert a string to a Date */
  to: function(str, attr) {
    if (str === null) return null;

    var ret ;
    str = str.toString() || '';
    
    if (attr.get('useIsoDate')) {
      var regexp = "([0-9]{4})(-([0-9]{2})(-([0-9]{2})" +
             "(T([0-9]{2}):([0-9]{2})(:([0-9]{2})(\\.([0-9]+))?)?" +
             "(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?",
          d      = str.match(new RegExp(regexp)),
          offset = 0,
          date   = new Date(d[1], 0, 1),
          time ;

      if (d[3]) { date.setMonth(d[3] - 1); }
      if (d[5]) { date.setDate(d[5]); }
      if (d[7]) { date.setHours(d[7]); }
      if (d[8]) { date.setMinutes(d[8]); }
      if (d[10]) { date.setSeconds(d[10]); }
      if (d[12]) { date.setMilliseconds(Number("0." + d[12]) * 1000); }
      if (d[14]) {
         offset = (Number(d[16]) * 60) + Number(d[17]);
         offset *= ((d[15] == '-') ? 1 : -1);
      }

      offset -= date.getTimezoneOffset();
      time = (Number(date) + (offset * 60 * 1000));
      
      ret = new Date();
      ret.setTime(Number(time));
    } else ret = new Date(Date.parse(str));
    return ret ;
  },
  
  _dates: {},

  _zeropad: function(num) { 
    return ((num<0) ? '-' : '') + ((num<10) ? '0' : '') + Math.abs(num); 
  },
  
  /** @private - convert a date to a string */
  from: function(date) { 
    var ret = this._dates[date.getTime()];
    if (ret) return ret ; 
    
    // figure timezone
    var zp = this._zeropad,
        tz = 0-date.getTimezoneOffset()/60;
        
    tz = (tz === 0) ? 'Z' : '%@:00'.fmt(zp(tz));
    
    this._dates[date.getTime()] = ret = "%@-%@-%@T%@:%@:%@%@".fmt(
      zp(date.getFullYear()),
      zp(date.getMonth()+1),
      zp(date.getDate()),
      zp(date.getHours()),
      zp(date.getMinutes()),
      zp(date.getSeconds()),
      tz) ;
    
    return ret ;
  }
});

if (SC.DateTime && !SC.RecordAttribute.transforms[SC.guidFor(SC.DateTime)]) {
  /**
    Registers a transform to allow SC.DateTime to be used as a record attribute,
    ie SC.Record.attr(SC.DateTime);
  
    Because SC.RecordAttribute is in the datastore framework and SC.DateTime in
    the foundation framework, and we don't know which framework is being loaded
    first, this chunck of code is duplicated in both frameworks.
  
    IF YOU EDIT THIS CODE MAKE SURE YOU COPY YOUR CHANGES to record_attribute.js. 
  */

  SC.RecordAttribute.registerTransform(SC.DateTime, {
  
    /** @private
      Convert a String to a DateTime
    */
    to: function(str, attr) {
      if (SC.none(str) || SC.instanceOf(str, SC.DateTime)) return str;
      var format = attr.get('format');
      return SC.DateTime.parse(str, format ? format : SC.DateTime.recordFormat);
    },
  
    /** @private
      Convert a DateTime to a String
    */
    from: function(dt, attr) {
      if (SC.none(dt)) return dt;
      var format = attr.get('format');
      return dt.toFormattedString(format ? format : SC.DateTime.recordFormat);
    }
  });
  
}
