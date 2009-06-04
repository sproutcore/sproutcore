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
  
  nowShowingScene: "testsNone",
  
  // ACTIONS
  
  /**
    Action runs when the content of a tests controller changes.  
  */
  targetDidChange: function() {
    console.log('targetDidChange');
    if (this.get('hasContent')) this.set('nowShowingScene', 'testsMaster');
    else this.set('nowShowingScene', 'testsNone');
  }.observes('content'),
  
  /**
    Action runs when a test is selected to show the server.
  */
  showDetails: function() {
    this.set('nowShowingScene', 'testsDetail');
    console.log('showDetails(%@)'.fmt(this.get('selection')));
  }

}) ;

TestRunner.testsController.addProbe('nowShowingScene');