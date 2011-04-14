// ==========================================================================
// Project:   Greenhouse.propertyController
// Copyright: ©2010 Mike Ball
// ==========================================================================
/*globals Greenhouse */

/** @class

  (Document Your Controller Here)

  @extends SC.ObjectController
*/


Greenhouse.propertyController = SC.ObjectController.create(
/** @scope Greenhouse.propertyController.prototype */ {
  contentBinding: 'Greenhouse.designController.propertySelection',
  contentBindingDefault: SC.Binding.single()
}) ;
