// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
// @global SC

sc_require('ext/function');

/**
  @class

  An error, used to represent an error state.

  Many API's within SproutCore will return an instance of this object whenever
  they have an error occur.  An error includes an errorValue, description,
  and optional human readable label that indicates the item that failed.

  Depending on the error, other properties may also be added to the object
  to help you recover from the failure.

  You can pass error objects to various UI elements to display the error in
  the interface. You can easily determine if the errorValue returned by some API is
  an error or not using the helper SC.ok(errorValue).

  Faking Error Objects
  ---

  You can actually make any object you want to be treated like an Error object
  by simply implementing two properties: isError and errorValue.  If you
  set isError to YES, then calling SC.ok(obj) on your object will return NO.
  If isError is YES, then SC.val(obj) will return your errorValue property
  instead of the receiver.

  When using SC.typeOf(obj), SC.T_ERROR will only be returned if the obj
  is an instance of SC.Error

  @extends SC.Object
  @since SproutCore 1.0
*/
SC.Error = SC.Object.extend(
/** @scope SC.Error.prototype */ {

  /**
    Human readable description of the error.  This can also be a non-localized
    key.

    @type String
  */
  message: '',

  /**
    The errorValue the error represents.  This is used when wrapping a errorValue inside
    of an error to represent the validation failure.

    @type Object
  */
  errorValue: null,

  /**
    The original error object.  Normally this will return the receiver.
    However, sometimes another object will masquerade as an error; this gives
    you a way to get at the underlying error.

    @type SC.Error
  */
  errorObject: function() {
    return this;
  }.property().cacheable(),

  /**
    Throw the error.

    @type SC.Error
  */
  'throw': function() {
    var error = this.toString();
    SC.Logger.error(error);

    throw new Error(error);
  },

  /**
    The error stacktrace.

    @type SC.Error
  */
  trace: function() {
    return (new Error()).trace;
  }.property().cacheable(),

  /**
    Human readable name of the item with the error.

    @type String
  */
  label: null,

  /** @private */
  toString: function() {
    return "SC.Error:%@:%@ (%@)".fmt(SC.guidFor(this), this.get('message'), this.get('errorValue'));
  },

  /**
    Walk like a duck.

    @type Boolean
  */
  isError: YES
});

SC.Error.mixin({

  /**
    Creates a new SC.Error instance with the passed description, label, and
    errorValue.  All parameters are optional.

    @param description {String} human readable description of the error
    @param label {String} human readable name of the item with the error
    @param errorValue {Number} an errorValue to use for testing.
    @returns {SC.Error} new error instance.
  */
  desc: function(description, label, errorValue) {
    var opts = { message: description };
    if (label !== undefined) opts.label = label;
    if (errorValue !== undefined) opts.errorValue = errorValue;
    return this.create(opts) ;
  },

  /**
    Throw a new SC.Error instance with the passed description, label, and
    errorValue.  All parameters are optional.

    @param description {String} human readable description of the error
    @param label {String} human readable name of the item with the error
    @param errorValue {Number} an errorValue to use for testing.
    @returns {SC.Error} new error instance.
  */
  'throw': function(description, label, errorValue) {
    this.desc.apply(this, arguments).throw();
  }

});

/**
  Shorthand form of the SC.Error.desc method.

  @param description {String} human readable description of the error
  @param label {String} human readable name of the item with the error
  @param errorValue {Number} an errorValue to use for testing.
  @returns {SC.Error} new error instance.
*/
SC.$error = function(description, label, errorValue) {
  return SC.Error.desc(description, label, errorValue);
};

/**
  Shorthand form of the SC.Error.throw method.

  @param description {String} human readable description of the error
  @param label {String} human readable name of the item with the error
  @param errorValue {Number} an errorValue to use for testing.
  @returns {SC.Error} new error instance.
*/
SC.throw = function(description, label, errorValue) {
  SC.Error.throw(description, label, errorValue);
};

/** @private */
SC.$throw = SC.throw;

/**
  Returns NO if the passed errorValue is an error object or false.

  @param {Object} ret object errorValue
  @returns {Boolean}
*/
SC.ok = function(ret) {
  return (ret !== false) && !(ret && ret.isError);
};

/** @private */
SC.$ok = SC.ok;

/**
  Returns the errorValue of an object.  If the passed object is an error, returns
  the errorValue associated with the error; otherwise returns the receiver itself.

  @param {Object} obj the object
  @returns {Object} errorValue
*/
SC.val = function(obj) {
  if (SC.get(obj, 'isError')) {
    return SC.get(obj, 'errorValue');
  } else return obj;
};

/** @private */
SC.$val = SC.val;

// STANDARD ERROR OBJECTS

/**
  Standard errorValue for errors that do not support multiple errorValues.

  @type Number
*/
SC.Error.HAS_MULTIPLE_VALUES = -100 ;
