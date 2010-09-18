// ==========================================================================
// Project:   Greenhouse.ListItem
// Copyright: ©2010 Mike Ball
// ==========================================================================
/*globals Greenhouse */
/** @class

  This class is here to receive custom editor events
  @extends SC.View
*/
Greenhouse.ListItem = SC.ListItemView.extend(
/** @scope Greenhouse.ListItem.prototype */ {
  /**
    Called just after the inline editor has ended editing. You can use this 
    method to save the final value of the inline editor and to perform any 
    other cleanup you need to do.
    
    @param inlineEditor {SC.InlineTextFieldView} the inline editor
    @param finalValue {Object} the final value
    @returns {void}
  */
  // inlineEditorDidEndEditing: function(inlineEditor, finalValue) {
  //   var content = this.get('content');
  //   var parent = content.get('parent'), newContent = SC.copy(content);
  //   newContent.set('name', finalValue);
  // 
  //   
  //   //check for duplicates on parent's contents array
  //   if(parent && parent.includesFile(newContent)){
  //     SC.AlertPane.warn("You've already got something named that", "Just pick something different");
  //     finalValue = content.get('name');
  //     sc_super();
  //   }
  //   else{
  //     sc_super();
  //     
  //     //send change to server
  //     content.commit();
  //   }
  // }
  
});
