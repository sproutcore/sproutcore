// ==========================================================================
// Project:   TestRunner.testsController
// Copyright: ©2009 Apple Inc.
// ==========================================================================
/*globals TestRunner */

/** @class

  Manages the list of tests for the currently focused target.

  @extends SC.ArrayController
*/
TestRunner.testsController = SC.ArrayController.create(
/** @scope TestRunner.testsController.prototype */ {

  contentBinding: "TestRunner.targetController.tests",
  
  /**
    Enables/disables continuous integration mode.
  */
  useContinuousIntegration: NO,
  
  /**
    Whenever we are actually showing the tests, then controls are enabled.
    Set to YES when in READY_LIST mode.
  */
  isShowingTests: YES,
  
  statusDidChange: function() {
    TestRunner.sendAction('testsDidChange');
  }.observes('status')
  
}) ;
