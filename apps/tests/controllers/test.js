// ==========================================================================
// Project:   TestRunner.testController
// Copyright: ©2009 My Company, Inc.
// ==========================================================================
/*globals TestRunner */

/** @class

  (Document Your Controller Here)

  @extends SC.Object
*/
TestRunner.testController = SC.Object.create(
/** @scope TestRunner.testController.prototype */ {

  back: function() {
    TestRunner.sendAction('back');
  }

}) ;
