// ==========================================================================
// Project:   Greenhouse.designController
// Copyright: ©2010 Mike Ball
// ==========================================================================
/*globals Greenhouse */

/** @class

  (Document Your Controller Here)

  @extends SC.ObjectController
*/
Greenhouse.designController = SC.ObjectController.create(
/** @scope Greenhouse.designController.prototype */ {
  contentBinding: 'Greenhouse.pageController*designController.selection',
  contentBindingDefault: SC.Binding.single().oneWay(),
  
  propertySelection: null
  
}) ;
