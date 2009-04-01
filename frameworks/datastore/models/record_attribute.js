// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

sc_require('models/record');

/** @class

  A RecordAttribute describes a single attribute on a record.  It is used to
  generate computed properties on records that can automatically convert data
  types and verify data.
  
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
    
    @property {Object}
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
  */
  transform: function() {
    var klass      = this.get('typeClass') || String,
        transforms = SC.RecordAttribute.transforms,
        ret ;
    
    // walk up class hierarchy looking for a transform handler
    while(klass && !(ret = transforms[SC.guidFor(klass)])) {
      klass = klass.superclass ;
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
    return transform ? transform.to(value, this, type, record, key) : value;        
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
    return transform ? transform.from(value, this, type, record, key) : value;        
  },

  /**
    The core handler.  Called from the property.
    
    @param {SC.Record} record the record instance
    @param {String} key the key used to access this attribute on the record
    @param {Object} value the property value if called as a setter
    @returns {Object} property value
  */
  call: function(record, key, value) {
    if (value !== undefined) {
      value = this.fromType(value) ; // convert to attribute.
      record.writeAttribute(key, value);
    } else {
      value = record.readAttribute(key);
      if (SC.none(value) && (value = this.get('defaultValue'))) {
        if (typeof value === SC.T_FUNCTION) {
          value = this.defaultValue(record, key, this);
        }
      } else value = this.toType(value);
    }
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
  if (!opts.type) opts.type = type || String ;
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

/** @private - generic converter for SC.Record-type records */
SC.RecordAttribute.registerTransform(SC.Record, {

  /** @private - convert a record id to a record instance */
  to: function(id, attr, recordType, parentRecord) {
    var store = parentRecord.get('store');
    return store.find(recordType, id);
  },
  
  /** @private - convert a record instance to a record id */
  from: function(record) { return record.get('id'); }
});

/** @private - generic converter for Date records */
SC.RecordAttribute.registerTransform(Date, {

  /** @private - convert a string to a Date */
  to: function(str) {
    // TODO: make this more robus
    return Date.parse(str);
  },
  
  /** @private - convert a date to a string */
  from: function(date) { 
    // TODO: Make this more robust; supporting various date formats
    return date.toString();
  }
});

