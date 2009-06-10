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
  
  didSelectTest: function() {
    var sel = this.get('selection'),
        test = sel ? sel.firstObject() : null;
    TestRunner.sendAction('selectTest', this, test);
    this.set('selection', null); // always empty the selection
  }
    
}) ;
