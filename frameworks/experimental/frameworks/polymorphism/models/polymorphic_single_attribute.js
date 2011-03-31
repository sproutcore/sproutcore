// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/** @class
  
  PolymorphicSingleAttribute is a subclass of SingleAttribute and handles polymorphic
  to-one relationships.
  
  @extends SC.SingleAttribute
  @author Colin Campbell
  @since SproutCore 1.0
*/
SC.PolymorphicSingleAttribute = SC.SingleAttribute.extend(
/** @scope SC.PolymorphicSingleAttribute.prototype */ {

  /**
    Contains information on how to transform from and from the passed attribute values.
    This property is required so the attribute knows which type to use for the relationship.
    If it is not included, it will default to the first provided type.
    
    @property {String}
    @default null
  */
  typeKey: null,
  
  /**
    Provides the ability to map the type names provided by the attribute value into
    something usable for record relationships. For example, you may need to store
    record names on the server but only with the class name, not the fully qualified
    path name (ie. 'Record' vs. 'MyApp.Record'). If the passed records are:
    
      ['MyApp.Foo', 'MyApp.Bar']
    
    then your typeMap may be
    
      ['Foo', 'Bar']
    
    'Foo' and 'Bar' are what gets saved to the datahash when writing to the server,
    and the types are used for the relationship within the application.
    
    @property {Array of Strings}
    @default null
  */
  typeMap: null,
  
  /**
    Returns the type, resolved to a class.  If the type property is a regular
    class, returns the type unchanged.  Otherwise attempts to lookup the 
    type as a property path.
    
    @property {Object}
  */
  typeClass: function() {
    var ret = this.get('type'),
        l, i, type;
    if (SC.isArray(ret)) {
      l = ret.get('length');
      for (i=0; i<length; i++) {
        type = ret.objectAt(i);
        if (SC.typeOf(type) === SC.T_STRING) ret.replace(i, 1, SC.objectForPropertyPath(type));
      }
    } else {
      SC.Logger.warn("%@ is a polymorphic relationship without an array of types".fmt(this));
      if (SC.typeOf(ret) === SC.T_STRING) ret = SC.objectForPropertyPath(ret);
    }
    return ret ;
  }.property('type').cacheable(),

  /** @private
    Override the transform function, as we need it to change depending on the record.
    
    @param {Class} typeClass The class of the type
    @param {SC.Record} record The record of this attribute
  */
  transform: function(klass) {
    var transforms = SC.RecordAttribute.transforms,
        ret ;
    
    // walk up class hierarchy looking for a transform handler
    while(klass && !(ret = transforms[SC.guidFor(klass)])) {
      // check if super has create property to detect SC.Object's
      if(klass.superclass.hasOwnProperty('create')) klass = klass.superclass;
      // otherwise return the function transform handler
      else klass = SC.T_FUNCTION;
    }
    
    return ret;
  },
  
  /**
    Converts the passed value into the core attribute value. Uses the polymorphism
    information provided to determine the correct type.
    
    @param {SC.Record} record the record instance
    @param {String} key the key used to access this attribute on the record
    @param {Object} value the property value
    @returns {Object} attribute value
  */
  toType: function(record, key, value) {
    var types = this.get('type'),
        typeKey = this.get('typeKey'),
        typeMap = this.get('typeMap'),
        type, transform, idx;
    
    if (typeKey) {
      type = record.get(typeKey);
    } else if (SC.isArray(types)) {
      // default to the first object if no type is provided
      type = types.get('firstObject');
    }
    
    if (typeMap) {
      idx = typeMap.indexOf(type);
      if (idx > -1) {
        type = types[idx];
      } else {
        SC.Logger.warn("Polymorphic map on property %@ for %@ did not exist on %@".fmt(key, type, record.constructor.toString()));
      }
    }
    
    if (types.indexOf(type) > -1) {
      if (SC.typeOf(type) === SC.T_STRING) type = SC.objectForPropertyPath(type);
      transform = this.transform(type);
      if (transform && transform.to) {
        value = transform.to(value, this, type, record, key);
      }
    } else {
      SC.Logger.warn("%@ is not a type on %@ of %@".fmt(type.toString(), key, record.constructor.toString()));
    }
    
    return value;
  },
  
  /** 
    Converts the passed value from the core attribute value. Uses the polymorphism
    information provided to determine the correct type, and sets the typeKey attribute
    on the record.
    
    @param {SC.Record} record the record instance
    @param {String} key the key used to access this attribute on the record
    @param {Object} value the property value
    @returns {Object} attribute value
  */
  fromType: function(record, key, value) {
    var types = this.get('type'),
        type = value.constructor,
        typeString = type.toString(),
        typeKey = this.get('typeKey'),
        typeMap = this.get('typeMap'),
        transform, idx;
    
    if (!SC.empty(typeString)) {
      if (typeMap) {
        idx = types.indexOf(typeString);
        if (idx > -1) {
          typeString = typeMap[idx];
        } else {
          SC.Logger.warn("Polymorphic map on property %@ for %@ did not exist on %@".fmt(key, typeString, record.constructor.toString()));
        }
      }
      
      if (typeKey) {
        record.set(typeKey, typeString);
      }
    } else {
      SC.Logger.warn("Could not determine type of %@ for polymorphic relation %@ on %@".fmt(value, key, record));
      type = types.get('firstObject');
      if (SC.typeOf(type) === SC.T_STRING) type = SC.objectForPropertyPath(type);
    }
    
    transform = this.transform(type);
    
    if (transform && transform.from) {
      value = transform.from(value, this, type, record, key);
    }
    return value;
  }

});
