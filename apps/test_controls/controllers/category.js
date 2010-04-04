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
  contentBindingDefault: SC.Binding.single()

}) ;
