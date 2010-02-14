// ==========================================================================
// Project:   SC.designController
// ==========================================================================
/*globals SC */

/** @class

  (Document Your Controller Here)

  @extends SC.Object
*/
SC.designController = SC.ObjectController.create(
/** @scope SC.designController.prototype */ {

  contentBinding: 'SC.designsController.selection',
  contentBindingDefault: SC.Binding.single()
}) ;
