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
    var childViews = this.childViews, i, len = childViews.length, view;
    
    for(i = 0; i < len; i++) {
      view = childViews[i];
      if(view.get('isEditable')) view.beginEditing();
    }
    
    if(this.get('isEditing')) return YES;
    
    return this.invokeDelegateMethod(this.get('editorDelegate'), 'beginEditingFor', this, this.get('value'));
  },
  
  /**
    Cancels the current inline editor and then exits editor. 
    
    @return {Boolean} NO if the editor could not exit.
  */
  discardEditing: function() {
    var childViews = this.childViews, i, len = childViews.length, view;
    
    for(i = 0; i < len; i++) {
      view = childViews[i];
      if(view.get('isEditable')) view.discardEditing();
    }
    
    if (!this.get('isEditing')) return YES;
    
    return this.invokeDelegateMethod(this.get('editorDelegate'), 'discardEditingFor', this);
  },
  
  /**
    Commits current inline editor and then exits editor.
    
    @return {Boolean} NO if the editor could not exit
  */
  commitEditing: function() {
    var childViews = this.childViews, i, len = childViews.length, view;
    
    for(i = 0; i < len; i++) {
      view = childViews[i];
      if(view.get('isEditable')) view.commitEditing();
    }
    
    if (!this.get('isEditing')) return YES;
    
    return this.invokeDelegateMethod(this.get('editorDelegate'), 'commitEditingFor', this);
  },
  
  /** @private
    Set editing to true so edits will no longer be allowed.
  */
  inlineEditorWillBeginEditing: function(editor) {
    this.set('isEditing', YES);
  },

  /** @private 
    Hide the label view while the inline editor covers it.
  */
  inlineEditorDidBeginEditing: function(editor) {
    return YES;
  },
  
  // TODO: use validator
  inlineEditorShouldCommitEditing: function(editor, finalValue) {
    this.setIfChanged('value', finalValue) ;
    return YES;
  },
  
  /** @private
    Update the field value and make it visible again.
  */
  inlineEditorDidEndEditing: function(editor, finalValue) {
    this.inlineEditorShouldCommitEditing(editor, finalValue);
    this.set('isEditing', NO) ;
    return YES;
  }
};
