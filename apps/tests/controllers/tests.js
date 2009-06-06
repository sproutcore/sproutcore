// ==========================================================================
// Project:   TestRunner.testsController
// Copyright: ©2009 My Company, Inc.
// ==========================================================================
/*globals TestRunner */

/** @class

  Tests from current selected target

  @extends SC.ArrayController
*/
TestRunner.testsController = SC.ArrayController.create(
/** @scope TestRunner.testsController.prototype */ {

  contentBinding: "TestRunner.targetController.tests",
  
  /**
    Action runs when a test is selected to show the server.
  */
  showDetails: function() {
    console.log('showDetails(%@)'.fmt(this.get('selection')));
  }

}) ;
