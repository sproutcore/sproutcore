// ========================================================================
// SproutCore
// copyright 2006-2007 Sprout Systems, Inc.
// ========================================================================

require('views/field') ;

// A text field is an input element with type "text".  This view adds support
// for hinted values, etc.
SC.CheckboxFieldView = SC.FieldView.extend({
  
  emptyElement: '<input type="checkbox" value="1" />',
  
  setFieldValue: function(value) {
    this.rootElement.checked = !!value;
  },
  
  getFieldValue: function() {
    return this.rootElement.checked;
  },
  
  valueBindingDefault: SC.Binding.Flag,
  
  init: function() {
    arguments.callee.base.apply(this,arguments) ;
    var f = this.fieldValueDidChange.bind(this, false) ;
    Event.observe(this.rootElement,'click', f) ;
  }
  
}) ;
