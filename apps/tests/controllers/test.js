// ==========================================================================
// Project:   TestRunner.testController
// Copyright: ©2009 My Company, Inc.
// ==========================================================================
/*globals TestRunner */

/** @class

  (Document Your Controller Here)

  @extends SC.ObjectController
*/
TestRunner.testController = SC.ObjectController.create(
/** @scope TestRunner.testController.prototype */ {

  back: function() {
    TestRunner.sendAction('back');
  }

}) ;
