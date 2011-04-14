// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals TestControls */

/** @class

  (Document Your Controller Here)

  @extends SC.Object
*/
TestControls.categoryController = SC.ObjectController.create(
/** @scope SampleControls.categoryController.prototype */ {
  contentBinding: "TestControls.categoriesController.selection",
  contentBindingDefault: SC.Binding.single(),
  
  nowShowing: "welcome",
  
  delayShow: function() {
    // wait a moment before loading to let things finish...
    this.set("nowShowing", this.get("show") || "welcome");
    this.hideMasterPicker();
  }.observes("show"),
  
  hideMasterPicker: function() {
    TestControls.mainPage.mainPane.split.hideMasterPicker();
  },
  
  useDarkTheme: NO,
  themeName: function() {
    return this.get('useDarkTheme') ? 'dark' : 'ace';
  }.property('useDarkTheme').cacheable()
}) ;
