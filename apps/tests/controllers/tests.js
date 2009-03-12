// ==========================================================================
// Project:   SproutCore Test Runner - mainPage
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
/*globals TestRunner */

/** @class

  Manages the current selection of tests.

  @extends SC.Object
*/
TestRunner.testsController = SC.Object.create(
/** @scope TestRunner.testsController.prototype */ {

  /**
    Bound to the continuous integration checkbox.  If you start running 
    all tests and this is set to YES, then the runner will loop until it is
    stopped.
    
    @property {Boolean}
  */
  useContinuousIntegration: NO,
  
  /**
    Action invoked when you click the Run All Tests button.
  */
  runAllTests: function() {
    console.log("Run all tests!");
  }

}) ;

TestRunner.testsController.addProbe('useContinuousIntegration');
