// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/**
  @namespace
  
  The inline editor delegate receives notifications from the inline text
  editor before, during, and after the user completes inline editing.
  
  The inline editor delegate is used by views that work with the inline
  editor.  You may need to implement this protocol if you want to
  use the inline editor in your own custom views.
  
  @since SproutCore 1.0
*/
SC.InlineEditorDelegate = {
  
    /**
     This is a  classname you can apply to the inline editor field
     to configure it's styling, in addition to the the editor's 
     default style-cloning behavior.
      
      @property inlineEditorClassName {String} A class name to use with the inline editor.
    */
    inlineEditorClassName: "",
  
  
    /**
      Called just before the inline edit displays itself but after it has been 
      configured for display.  
      
      You can use this method to make last minute changes to the display of 
      the inline editor or to collect its value.
      
      @param inlineEditor {SC.InlineTextFieldView} The inline editor.
      @returns {void}
    */
    inlineEditorWillBeginEditing: function(inlineEditor) {},

    /**
      Called just after an inline editor displays itself.
      
      You can use this method to perform any hiding or other view changes
      you need to perform on your own view to make room for the new editor.
      
      Note tht editors are placed over the top of views in the page, not 
      inside of them from a DOM perspective.
      
      @param inlineEditor {SC.InlineTextFieldView} The inline editor.
      @returns {void}
    */
    inlineEditorDidBeginEditing: function(inlineEditor) {},
    
    /**
      Called just before an inline editor tries to end editing and hide 
      itself.
      
      You can use this method to control whether the inline editor will
      actually be allowed to end editing.  For example, you might disallow
      the editor to end editing if the new value fails validation.
      
      @param inlineEditor {SC.InlineTextFieldView} the inline editor
      @param finalValue {Object} the final value
      @returns {Boolean} YES to allow the editor to end editing.
    */
    inlineEditorShouldEndEditing: function(inlineEditor, finalValue) {
      return YES ;
    },
    
    /**
      Called just after the inline editor has ended editing. You can use this 
      method to save the final value of the inline editor and to perform any 
      other cleanup you need to do.
      
      @param inlineEditor {SC.InlineTextFieldView} the inline editor
      @param finalValue {Object} the final value
      @returns {void}
    */
    inlineEditorDidEndEditing: function(inlineEditor, finalValue) {}
};
