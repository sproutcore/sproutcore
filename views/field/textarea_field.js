// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('views/field/text_field') ;

/**
  @class
  
  Manages a text area field.
  
  @extends SC.TextFieldView
  @author Skip Baney
  @version 1.0
*/
SC.TextareaFieldView = SC.TextFieldView.extend(
/** @scope SC.TextareaFieldView.prototype */ {
  
  emptyElement: '<textarea></textarea>',

  insertNewline: function(evt) { evt._stopWhenHandled = false; return true; }

});
