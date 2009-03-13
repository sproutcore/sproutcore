// ==========================================================================
// Project:   SproutCore Test Runner - mainPage
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
/*globals TestRunner */

/** @class

  Manages the current selection of tests.

  @extends SC.ArrayController
*/
TestRunner.testsController = SC.ArrayController.create(
/** @scope TestRunner.testsController.prototype */ {

  /**
    The selected target.  Will be used to load tests.
  */
  targetBinding: SC.Binding.single("TestRunner.targetsController.selection"),
  
  contentBinding: "*target.tests",
  
  /**
    Bound to the continuous integration checkbox.  If you start running 
    all tests and this is set to YES, then the runner will loop until it is
    stopped.
    
    @property {Boolean}
  */
  useContinuousIntegration: NO
  
}) ;

TestRunner.testsController.addProbe('useContinuousIntegration');
TestRunner.testsController.addProbe('target');
TestRunner.testsController.addProbe('content');
