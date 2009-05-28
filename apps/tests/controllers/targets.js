// ==========================================================================
// Project:   TestRunner.targetsController
// Copyright: ©2009 My Company, Inc.
// ==========================================================================
/*globals TestRunner */

/** @class

  Displays the full list of targets in the source list view.

  @extends SC.ArrayController
*/
TestRunner.targetsController = SC.ArrayController.create(
/** @scope TestRunner.targetsController.prototype */ {

  allowsMultipleSelection: NO,
  allowsEmptySelection: NO

}) ;
