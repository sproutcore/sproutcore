// ==========================================================================
// Project:   Greenhouse.propertyController
// Copyright: ©2009 My Company, Inc.
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
