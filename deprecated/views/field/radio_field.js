// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('views/field/field') ;

/**
  @class
  
  A RadioFieldView can be used to wrap a series of radio inputs.  The value
  of this field will be the selected radio.  To use this, you really need to
  provide some preformatted HTML that already contains the radio buttons with
  matching name attributes.  If you use the form_view helpers, this will be
  handled for you.
  
  @extends SC.FieldView
  @author Charles Jolley
  @version 1.0
*/
SC.RadioFieldView = SC.FieldView.extend(
/** @scope SC.RadioFieldView.prototype */ {
  
  emptyElement: '<div></div>',
  
  /**
    RO - The list of values allowed by these radio buttons.
    
    @field
  */
  values: function() {
    if (!this._fields) return [] ;
    return Object.keys(this._fields) ;
  }.property(),
  
  /**
    If you would like your radio buttons to map to actual object values,
    then set this to a hash with keys matching values found in the radio
    buttons.
  */  
  objects: null,
  
  // INTERNAL SUPPORT METHODS
  setFieldValue: function(value) {
    if (!this._fields) return ;
    
    // map object value to radio button value if set.
    var objects = this.get('objects') ;
    if (objects) {
      for(var key in objects) {
        if (!objects.hasOwnProperty(key)) continue ;
        if (objects[key] == value) {
          value = key ; break ;
        }
      }
    }
    
    // set value.
    var field = this._fields[value] ;
    if (field) {
      field.checked = true ;
    } else {
      for(var key in this._fields) {
        if (!this._fields.hasOwnProperty(key)) continue ;
        this._fields[key].checked = false ;
      }
    }
  },
  
  getFieldValue: function() {
    if (!this._fields) return null;

    var ret = null;
    for(var key in this._fields) {
      if (!this._fields.hasOwnProperty(key)) continue ;
      if (this._fields[key].checked == true) {
        ret = key ; break ;
      } ;
    }
    
    // map to object value if set.
    var objects = this.get('objects') ;
    if (objects && ret) ret = objects[ret] ;
    return ret ;
  },
  
  enableField: function() {
    if (!this._fields) return ;
    for(var key in this._fields) {
      if (!this._fields.hasOwnProperty(key)) continue ;
      Form.Element.enable(this._fields[key]) ;
    }
  },

  // override to disable editing of this field.
  disableField: function() {
    if (!this._fields) return ;
    for(var key in this._fields) {
      if (!this._fields.hasOwnProperty(key)) continue ;
      Form.Element.disable(this._fields[key]) ;
    }
  },
  
  init: function() {
    sc_super() ;
    
    // find all inputs.
    this._fields = {} ;
    
    var inputFields = this.$$tag('input') ;
    var f = this.fieldValueDidChange.bind(this, false) ;
    var loc = inputFields.length ;
  
    this._fields = {} ;
    while(--loc >= 0) {
      var field = inputFields[loc] ;
      this._fields[field.value] = field ;
      Event.observe(field,'change', f) ;
    }
  }
  
}) ;
