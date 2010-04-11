// ==========================================================================
// Project:   TestControls.categoryController
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
  
  delayedShow: "welcome",
  
  delayShow: function() {
    // wait a moment before loading to let things finish...
    this.invokeLater(this.set, 100, "delayedShow", this.get("show"));
    this.hideMasterPicker();
  }.observes("show"),
  
  hideMasterPicker: function() {
    TestControls.mainPage.mainPane.split.hideMasterPicker();
  }
}) ;
