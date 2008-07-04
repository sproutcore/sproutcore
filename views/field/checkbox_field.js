// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('views/field/field') ;

/**
  @class
  
  Supports using platform native checkboxs with the input field.  If you 
  would like to make use of the extended SproutCore checkbox features
  including a mixed state and theming support, use SC.CheckboxView instead.
  
  @extends SC.FieldView
  @author Charles Jolley
  @version 1.0
*/
SC.CheckboxFieldView = SC.FieldView.extend(
/** @scope SC.CheckboxFieldView.prototype */ {
  
  emptyElement: '<input type="checkbox" value="1" />',
  
  setFieldValue: function(value) {
    this.rootElement.checked = !!value;
  },
  
  getFieldValue: function() {
    return this.rootElement.checked;
  },
  
  valueBindingDefault: SC.Binding.Bool,
  
  init: function() {
    sc_super() ;
    var f = this.fieldValueDidChange.bind(this, false) ;
    Event.observe(this.rootElement,'click', f) ;
  }
  
}) ;
