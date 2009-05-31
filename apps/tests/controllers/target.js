// ==========================================================================
// Project:   TestRunner.targetController
// Copyright: ©2009 My Company, Inc.
// ==========================================================================
/*globals TestRunner */

/** @class

  The currently selected target

  @extends SC.ObjectController
*/
TestRunner.targetController = SC.ObjectController.create(
/** @scope TestRunner.targetController.prototype */ {

  contentBinding: "TestRunner.sourceController.selection"

}) ;
