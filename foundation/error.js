// ========================================================================
// SproutCore
// copyright 2006-2007 Sprout Systems, Inc.
// ========================================================================

require('foundation/object');

// Error is used to communicate errors throughout the app.
SC.Error = SC.Object.extend({
  code: -1, // error code. Used to designate type.
  description: '', // human readable dscriptions.
  label: null // optionally set to human readable the name of the item with the error.
}) ;

// this will create a new instance of the receiver with the passed 
// description, etc.
SC.Error.desc = function(description, label, code) {
  var opts = { description: description } ;
  if (label !== undefined) opts.label = label ;
  if (code !== undefined) opts.code = code ;
  return this.create(opts) ;
} ;

// returns an error object.
function $error(description, label, c) { 
  return SC.Error.desc(description,label, c); 
} ;


// returns true if the return value is not false or an error.
function $ok(ret) {
  return (ret !== false) && ($type(ret) != T_ERROR) ;
}


// STANDARD ERROR OBJECTS

// Used by objects that do not support multiple values.
SC.Error.HAS_MULTIPLE_VALUES = -100 ;