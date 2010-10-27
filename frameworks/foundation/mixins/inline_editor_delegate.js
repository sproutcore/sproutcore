// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  This delegate controls the editing capability of a view. It allows you to customize when a view that uses it is allowed to begin and end editing, as well as the type of editor it uses.
  
  By default it edits an SC.LabelView using an SC.InlineTextFieldView.
  
  @since SproutCore 1.0
*/
SC.InlineEditorDelegate = {
  // quack
  isInlineEditorDelegate: YES,

  /**
    The exampleInlineTextFieldView property is by default a 
    SC.InlineTextFieldView but it can be set to a customized inline text field
    view.

    @property
    @type {SC.View}
    @default {SC.InlineTextFieldView}
  */
  exampleInlineTextFieldView: SC.InlineTextFieldView,
  
  inlineEditorClassName: null,

  /**
    If you want the inline editor to be multiline set this property to YES.
  
    @type {Boolean}
    @default {NO}
  */
  isInlineEditorMultiline: NO,

  /**
    Call to tell the delegate to begin editing the given view. Returns YES if it was able to begin editing.
  
    @param {SC.View} the view the user is trying to edit
    @param {Object} the current value of the view
    @returns {Boolean} YES if the view began editing
  */
  inlineEditorShouldBeginEditing: function(view, startingValue) {
    if(!view.get('isEditable')) return NO;
    if(view.get('isEditing')) return YES;
    
    var el = view.$(),
        value = view.get('value') || '',
        f = SC.viewportOffset(el[0]),
        frameTemp = view.convertFrameFromView(view.get('frame'), null),
        exampleEditor = this.get('exampleInlineTextFieldView');
        f.width=frameTemp.width;
        f.height=frameTemp.height;

    return exampleEditor.beginEditing({
      pane: view.get('pane'),
      frame: f,
      layout: view.get('layout'),
      exampleInlineTextFieldView: exampleEditor,
      target: view,
      inlineEditorClassName: this.get('inlineEditorClassName'),
      exampleElement: el,
      value: startingValue,
      multiline: this.get('isInlineEditorMultiline'),
      isCollection: NO
    });
  },

  /**
    The view the editor view should attach itself to as child. For example if you are editing a row of a formview inside a scrollview, you should attach to the scrollview's containerview or the formview's div, not the label itself. This way you will scroll with the target view but also be above it so editors can reuse views.
  
    @param {SC.View} the view attempting to begin editing
    @returns {SC.View} the view that the editor should be a child of
  */
  parentViewForEditor: function(view) {
    return view.get('parentView');
  },

  /**
    Called to tell the editor associated with the given view that the user wants to end editing and save their changes.
  
    @param {SC.View} the view whose edit mode is being commited
    @param {Object} the current value of the view
    @returns {Boolean} YES if the editor was able to end and commit
  */
  inlineEditorShouldCommitEditing: function(view) {
    if(!view.get('isEditing')) return NO;
    // TODO: figure out how a validator works without a form
    return SC.InlineTextFieldView.commitEditing();
  },
  
  /**
    Called to tell the editor associated with the given view that the user wants to end editing and discard their changes.
  
    @param {SC.View} the view whose edit mode is ending
    @param {Object} the current value of the view
    @returns {Boolean} YES if the editor was able to end
  */
  inlineEditorShouldDiscardEditing: function(view) {
    if(!view.get('isEditing')) return NO;
    
    return SC.InlineTextFieldView.discardEditing();
  }
};
