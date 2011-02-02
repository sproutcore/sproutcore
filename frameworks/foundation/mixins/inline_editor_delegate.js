// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @protocol
  
  This delegate is consulted by view implementing SC.InlineEditable and
  SC.InlineEditor and controls the lifecycle of the editor as well as begin
  notified of events in the editing process.
  
  By default it edits an SC.LabelView using an SC.InlineTextFieldView.

  All methods will be attempted to be called on the inlineEditorDelegate of the
  inlineEditor or inlineEditable first and then the target view if it didn't exist
  on the delegate. This allows you to implement default delegate handlers on your
  editable view.
  
  @since SproutCore 1.0
*/
SC.InlineEditorDelegate = {
  /** REQUIRED FUNCTIONS **/
  /*
  * @method
  *
  * Acquires an editor for the view. This may simply create one and return it,
  * or you may implement more complex lifecycle management like pooling of
  * editors.
  *
  * May return null if for some reason an editor could not be required.
  *
  * @params {SC.InlineEditable} the view that is begin edited
  * @returns {SC.InlineEditor} an editor for the view
  */
  acquireEditor:function(editable) {},

  /*
  * @method
  *
  * Releases an editor. This may simply remove it from its parent and dispose of
  * it, or you may implement more complex lifecycle management like pooling of
  * editors.
  *
  * @params {SC.InlineEditor} the editor being released
  * @returns {Boolean} YES if it was successfully released
  */
  releaseEditor:function(editor) {},

  /** OPTIONAL FUNCTIONS **/
  /*
  * @method
  *
  * Determines if the view should be allowed to begin editing and returns YES if
  * so. Isn't passed the editor because it hasn't been created yet. If this
  * method is not defined the editor will assume it is always allowed to begin
  * editing.
  *
  * @params {SC.InlineEditable} the view that is attempting to begin editing
  * @params {Object} the current value of the view
  * @returns {Boolean} YES if the view is allowed to edit
  */
  inlineEditorShouldBeginEditing: function(editable, value) {},

  /*
  * @method
  *
  * Notifies the delegate that the view was allowed to begin editing and the
  * editor has been acquired, but hasn't actually done any setup. Most views will
  * set their current value as the starting value of the editor here, and
  * depending on the editor other configuration options may be available.
  *
  * Since the editor's value hasn't been configured with, the value passed here will be
  * the default value of the editor.
  *
  * @params {SC.InlineEditable} the view being edited
  * @params {SC.InlineEditor} the editor for the view
  * @params {Object} the value the editor will start with
  */
  inlineEditorWillBeginEditing:function(editor, value, editable) {},

  /*
  * @method
  *
  * Notifies the delegate that the editor has finished setting up itself and is
  * now editing.
  *
  * @params {SC.InlineEditable} the view being edited
  * @params {SC.InlineEditor} the editor for the view
  * @params {Object} the value the editor started with
  */
  inlineEditorDidBeginEditing:function(editor, value, editable) {},

  /*
  * @method
  *
  * Determines if the editor is allowed to end editing and store its value back
  * to the view being edited. If this method is not defined the editor will
  * assume it is always allowed to commit.
  *
  * @params {SC.InlineEditable} the view being edited
  * @params {SC.InlineEditor} the editor for the view
  * @params {Object} the value the editor is attempting to commit
  */
  inlineEditorShouldCommitEditing:function(editor, value, editable) {},

  /*
  * @method
  *
  * Notifies the delegate that the editor was allowed to commit and is going to
  * commit but hasn't actually performed any cleanup yet.
  *
  * @params {SC.InlineEditable} the view being edited
  * @params {SC.InlineEditor} the editor for the view
  * @params {Object} the value the editor ended with
  */
  inlineEditorWillCommitEditing:function(editor, value, editable) {},

  /*
  * @method
  *
  * Notifies the delegate that the editor was allowed to commit and finished
  * performing any cleanup necessary. This is where you should save the final
  * value back to your view after performing any necessary transforms to it.
  *
  * @params {SC.InlineEditable} the view being edited
  * @params {SC.InlineEditor} the editor for the view
  * @params {Object} the value the editor ended with
  */
  inlineEditorDidCommitEditing:function(editor, value, editable) {},

  /*
  * @method
  *
  * Determines if the editor is allowed to discard its current value and end
  * editing. If this method is undefined the editor will assume it is always
  * allowed to discard.
  *
  * @params {SC.InlineEditable} the view being edited
  * @params {SC.InlineEditor} the editor for the view
  */
  inlineEditorShouldDiscardEditing:function(editor, editable) {},

  /*
  * @method
  *
  * Notifies the delegate that the view was allowed to discard editing but
  * hasn't performed any cleanup yet.
  *
  * @params {SC.InlineEditable} the view being edited
  * @params {SC.InlineEditor} the editor for the view
  */
  inlineEditorWillDiscardEditing:function(editor, editable) {},

  /*
  * @method
  *
  * Notifies the delegate that the editor has finished cleaning up after
  * discarding editing.
  *
  * @params {SC.InlineEditable} the view being edited
  * @params {SC.InlineEditor} the editor for the view
  */
  inlineEditorDidDiscardEditing:function(editor, editable) {},

  /** BACKWARDS COMPATIBILITY **/
  /*
  * @method
  *
  * Notifies the delegate that the editor will end editing but hasn't cleaned up
  * yet. This can be caused by both commit or discard. If it was a discard, the
  * value will be the same as the current value of the editable view. Otherwise,
  * it was a commit and the value will be the value of the editor.
  *
  * This method is for backwards compatibility and should not be used.
  *
  * @params {SC.InlineEditable} the view being edited
  * @params {SC.InlineEditor} the editor for the view
  * @params {Object} the final value of the edit
  */
  inlineEditorWillEndEditing: function(editor, value, editable) {},

  /*
  * @method
  *
  * Notifies the delegate that the editor has cleaned up after editing. This can
  * be caused by both commit or discard. If it was a discard, the value will be
  * the same as the current value of the editable view. Otherwise, it was a
  * commit and the value will be the value of the editor.

  *
  * This method is for backwards compatibility and should not be used.
  *
  * @params {SC.InlineEditable} the view being edited
  * @params {SC.InlineEditor} the editor for the view
  * @params {Object} the final value of the edit
  */
  inlineEditorDidEndEditing: function(editor, value, editable) {}
};

