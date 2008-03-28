// ========================================================================
// SproutCore
// copyright 2006-2007 Sprout Systems, Inc.
// ========================================================================

require('views/text_field') ;

SC.TextareaFieldView = SC.TextFieldView.extend({
  
  emptyElement: '<textarea></textarea>',

  insertNewline: function(evt) { evt._stopWhenHandled = false; return true; }

});
