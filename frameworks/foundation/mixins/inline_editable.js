// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  This mixin is used for views that show a seperate editor view to edit. If your view is itself editable, use SC.Editable.
  
  To use this, you must also implement an InlineEditorDelegate to manage the editor view and an InlineEditableDelegate to manage the result of editing. For simplicity these may all be implemented by your view itself, but for more complex views or editors they should be kept seperate.
*/
// TODO: ask juan if this should be combined with SC.Editable
SC.InlineEditable = {
  
  editorDelegate: null,
  /**
    Enables editing using the inline editor.
  */
  isEditable: YES,

  /**
    YES if currently editing label view.
  */
  isEditing: NO,
  
  /**
    Opens the inline text editor (closing it if it was already open for 
    another view).
    
    @return {Boolean} YES if did begin editing
  */
  beginEditing: function() {
    var del = this.delegateFor('isInlineEditorDelegate', this.get('editorDelegate'));
    
    if(this.get('isEditing')) return YES;
    
    return del.inlineEditorShouldBeginEditing(this, this.get('value'));
  },
  
  /**
    Cancels the current inline editor and then exits editor. 
    
    @return {Boolean} NO if the editor could not exit.
  */
  discardEditing: function() {
    var del = this.delegateFor('isInlineEditorDelegate', this.get('editorDelegate'));
    
    if (!this.get('isEditing')) return YES;
    
    return del.inlineEditorShouldDiscardEditing(this);
  },
  
  /**
    Commits current inline editor and then exits editor.
    
    @return {Boolean} NO if the editor could not exit
  */
  commitEditing: function() {
    var del = this.delegateFor('isInlineEditorDelegate', this.get('editorDelegate'));
    
    if (!this.get('isEditing')) return YES;
    
    return del.shouldEndEditing(this);
  },
  
  /** @private
    Set editing to true so edits will no longer be allowed.
  */
  inlineEditorWillBeginEditing: function() {
    this.set('isEditing', YES);
  },

  /** @private 
    Hide the label view while the inline editor covers it.
  */
  inlineEditorDidBeginEditing: function() {
    var layer = this.$();
    this._oldOpacity = layer.css('opacity') ;
    layer.css('opacity', 0.0);
  },
  
  // TODO: use validator
  inlineEditorShouldEndEditing: function(finalValue) {
    return YES;
  },
  
  /** @private
    Update the field value and make it visible again.
  */
  inlineEditorDidEndEditing: function(finalValue) {
    this.setIfChanged('value', finalValue) ;
    this.$().css('opacity', this._oldOpacity);
    this._oldOpacity = null ;
    this.set('isEditing', NO) ;
  }
};
