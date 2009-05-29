// ==========================================================================
// Project:   TestRunner.sourceController
// Copyright: ©2009 My Company, Inc.
// ==========================================================================
/*globals TestRunner */

/** @class

  (Document Your Controller Here)

  @extends SC.Object
*/
TestRunner.sourceController = SC.TreeController.create(
/** @scope TestRunner.sourceController.prototype */ {

  contentBinding: 'TestRunner.targetsController.sourceRoot',
  
  treeItemChildrenKey: "children",
  
  treeItemIsExpandedKey: "isExpanded",
  
  treeItemIsGrouped: YES
 
}) ;
