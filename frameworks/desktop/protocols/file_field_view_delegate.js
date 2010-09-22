// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/**
  @namespace
  
  The file field view delegate receives notifications from the file field view when the open dialog is about to appear, did appear, before and after submission.
  
  This allows the delegate to control the behavior of the file field view.
  
  @since SproutCore 1.0
*/
SC.FileFieldViewDelegate = {
  
/**
    Called before the browser opens its file dialog for the selected input. 

    You can use this method to prevent the file dialog from opening.

    @param fileFieldView {SC.FileFieldView} The file field view.
    @returns {Boolean} YES to allow the browser's file selection dialog to open.
  */
  fileFieldViewShouldOpenFileSelect: function(fileFieldView) {
    return YES;
  },

  fileFieldViewDidOpenFileSelect: function(fileFieldView) {},

  fileFieldValueDidChange: function(fileFieldView, value, previousValue) {},
  
  /**
      Called before the file field view submits its form. 

      You can use this method to prevent submission, particularly when autoSubmit is true.

      @param fileFieldView {SC.FileFieldView} The file field view.
      @returns {Boolean} YES to allow the file field view to submit.
    */
  fileFieldViewShouldSubmit: function(fileFieldView) {
    return YES;
  },

  /**
      Called before the file field view submits its form. 

      @param fileFieldView {SC.FileFieldView} The file field view.
      @returns {void}
    */
  fileFieldViewWillSubmit: function(fileFieldView) {},
  

  /**
      Called after the file field view submits its form, but before the upload completes.
      This is a useful time to start polling the server for progress if your server has
      been configured to support this.

      @param fileFieldView {SC.FileFieldView} The file field view.
      @returns {void}
    */
  fileFieldViewDidSubmit: function(fileFieldView, uuid) {},

  /**
      Called after the upload completes. The result is the body element of the hidden iframe
      used to capture the response.  You will need to write a tiny bit of code to parse this
      result to match your server's response and determine the success or failure of the 
      upload.
      
      For example, if the server returns a JSON encoded string, you may do something like:
        var parsedResult = JSON.parse(result.innerHTML);

      @param fileFieldView {SC.FileFieldView} The file field view.
      @param result {HTMLBodyElement} The body element containing the server's response
      @returns {void}
    */
  fileFieldViewDidComplete: function(fileFieldView, result) {}

};
