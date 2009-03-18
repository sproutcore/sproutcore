// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/** @class

  A RecordAttribute describes a single attribute on a record.  It is used to
  generate computed properties on records that can automatically convert data
  types and verify data.
  
  You usually will not work with RecordAttribute objects directly, though you
  may extend the class in any way that you like to create a custom attribute.

  A number of default RecordAttribute types are defined on the SC.Record.
  
  @since SproutCore 1.0
*/
SC.RecordAttribute = {
  
  /**
    Creates a 'subclass' of the receiver, copying on the applied properties.
    This uses beget() unlike typical SC.Objects.  This will also wipe the
    cached property handler.
  */
  extend: function(attrs) {
    var ret = SC.beget(this), len = arguments.length, idx ;
    for(idx=0;idx<len;idx++) SC.mixin(ret, arugments[idx]);
    ret._property = null ;
    return ret ;  
  },
  
  // ..........................................................
  // LOW-LEVEL METHODS
  // 
  
  /** 
    override to convert the passed value into the core attribute value.
    
    @param {Object} value the property value
    @returns {Object} attribute value
  */
  toAttribute: function(value) { return value; },

  /** 
    override to convert the passed attribute value into the output value.
    
    @param {Object} value the attribute
    @returns {Object} output value
  */
  fromAttribute: function(value) { return value; },

  /**
    Override to validate the current attribute value.  Return NO or an error
    object if invalid.  Default looks at allowEmptyValue property only.
  */
  validate: function(value) {
    if ((SC.none(value) || (value === '')) && this.get('isRequired')) {
      return NO;
    }
    return YES ;
  },

  /**
    Set to YES to require a non-null or non-empty value.
  */
  isRequired: NO,

  /**
    The default value.  If the value is undefined, this will be returned 
    instead.  This should be the output value, after conversion, not the json.
    
    If this property is a function, it will be called on the record.
  */
  _defaultValue: undefined,
  
  /**
    The core handler.  Called from the property.
  */
  call: function(record, key, value) {
    if (value !== undefined) {
      value = this.toAttribute(value) ; // convert to attribute.
      record.writeAttribute(key, value);
    } else {
      value = record.readAttribute(key);
      if (value === undefined) {
        value = this.get('defaultValue');
        if (typeof value === SC.T_FUNCTION) value = value.call(record, key);
      }
    }
    return value ;
  },
  
  /** 
    Make this look like a property so that get() will call it. 
  */
  isProperty: YES,
  
  /**
    Generates a new computed property handler for the receiver instance.
  */
  property: function() {
    if (!this._property) {
      var handler = this ;
      this._property = function(key, value) {
        return handler._handle(this, key, value)/
      }.property().cacheable()
    }
    return this._property;
  }
  
});
