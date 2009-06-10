// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
/*globals TestRunner */

/**
  Initial state of application before it has loaded targets.
*/
TestRunner.READY = SC.Responder.create({
  
  /**
    Invoked when you select a target.  Set the target controller then show 
    list state if needed.
  */
  selectTarget: function(sender, target) {
    if (target && target.isEnumerable) target = target.firstObject();
    TestRunner.targetController.set('content', target);
    TestRunner.testController.set('content', null);
    
    if (target) TestRunner.makeFirstResponder(TestRunner.READY_LIST);
    else TestRunner.makeFirstResponder(TestRunner.READY_EMPTY);
  },
  
  /**
    Invoked when you select the test.
  */
  selectTest: function(sender, test) {
    if (!TestRunner.targetController.get('hasContent')) return NO ;

    if (test && test.isEnumerable) test = test.firstObject();
    TestRunner.testController.set('content', test);

    if (test) TestRunner.makeFirstResponder(TestRunner.READY_DETAIL);
    else TestRunner.makeFirstResponder(TestRunner.READY_LIST);
  }
    
});