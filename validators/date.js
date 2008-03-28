// ========================================================================
// SproutCore
// copyright 2006-2007 Sprout Systems, Inc.
// ========================================================================

require('validators/validator') ;

// Handle the parsing and display of dates.
SC.Validator.Date = SC.Validator.extend({

  format: 'NNN d, yyyy h:mm:ss a',
  naturalLanguage: true,
  
  // if we have a number, then convert to a date object.
  fieldValueForObject: function(object, form, field) {
    var date ;
    if (typeof(object) == "number") {
      date = new Date(object) ;
    } else if (object instanceof Date) { date = object; }
      
    if (date) object = date.format(this.get('format'),this.get('naturalLanguage')) ;
    
    return object ;
  },

  // try to pase value as a date. convert into a number, or return null if
  // it could not be parsed.
  objectForFieldValue: function(value, form, field) {
    if (value) {
      var date = Date.parseDate(value) ;
      value = (date) ? date.getTime() : null ;
    }
    return value ;
  }
    
}) ;
