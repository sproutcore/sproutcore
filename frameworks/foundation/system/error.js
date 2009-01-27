// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/**
  @class
  
  An error, used to represent an error state.
  
  Many API's within SproutCore will return an instance of this object whenever
  they have an error occur.  An error includes an error code, description,
  and optional human readable label that indicates the item that failed. 
  
  Depending on the error, other properties may also be added to the object
  to help you recover from the failure.
  
  You can pass error objects to various UI elements to display the error in
  the interface. You can easily determine if the value returned by some API is 
  an error or not using the helper SC.$ok(value).
  
  @extends SC.Object
  @since SproutCore 1.0
*/
SC.Error = SC.Object.extend(
/** @scope SC.Error.prototype */ {
  
  /**
    error code.  Used to designate the error type.
  */
  code: -1,
  
  /**
    Human readable description of the error.  This can also be a non-localized
    key.
  */
  description: '',
  
  /**
    Human readable name of the item with the error.
  */
  label: null,
  
  toString: function() {
    return "SC.Error:%@:%@ (%@)".fmt(SC.guidFor(this), this.description, this.code);
  }
}) ;

/**
  Creates a new SC.Error instance with the passed description, label, and
  code.  All parameters are optional.
  
  @param description {String} human readable description of the error
  @param label {String} human readable name of the item with the error
  @param code {Number} an error code to use for testing.
  @returns {SC.Error} new error instance.
*/
SC.Error.desc = function(description, label, code) {
  var opts = { description: description } ;
  if (label !== undefined) opts.label = label ;
  if (code !== undefined) opts.code = code ;
  return this.create(opts) ;
} ;

/**
  Shorthand form of the SC.Error.desc method.

  @param description {String} human readable description of the error
  @param label {String} human readable name of the item with the error
  @param code {Number} an error code to use for testing.
  @returns {SC.Error} new error instance.
*/
SC.$error = function(description, label, c) { 
  return SC.Error.desc(description,label, c); 
} ;
var $error = SC.$error ; // export globally

/**
  Returns YES if the passed value is an error object, otherwise NO.
*/
SC.$ok = function(ret) {
  return (ret !== false) && (SC.typeOf(ret) != SC.T_ERROR) ;
};
var $ok = SC.$ok ; // export globally.

// STANDARD ERROR OBJECTS

/**
  Standard error code for errors that do not support multiple values.
*/
SC.Error.HAS_MULTIPLE_VALUES = -100 ;
