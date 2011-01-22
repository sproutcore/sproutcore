// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
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

    TestRunner.sourceController.selectObject(target);
    
    if (target) {
      var tests = target.get('tests');
      if (tests && (tests.get('status') & SC.Record.BUSY)) {
        TestRunner.makeFirstResponder(TestRunner.READY_LOADING);
      } else if (!tests || (tests.get('length')===0)) {
        TestRunner.makeFirstResponder(TestRunner.READY_NO_TESTS);
      } else TestRunner.makeFirstResponder(TestRunner.READY_LIST);
      
    } else TestRunner.makeFirstResponder(TestRunner.READY_EMPTY);
  },

  /**
    Invoked when you select the test.
  */
  selectTest: function(sender, test) {
    if (!TestRunner.targetController.get('hasContent')) return NO ;

    if (test && test.isEnumerable) test = test.firstObject();
    TestRunner.detailController.set('content', test);
    TestRunner.set('routeName', test ? test.get('filename') : null);

    if (test) TestRunner.makeFirstResponder(TestRunner.READY_DETAIL);
    else TestRunner.makeFirstResponder(TestRunner.READY_LIST);
  },
  
  route: function(sender, params) {
    var target = TestRunner.computeRouteTarget(),
        test   = TestRunner.computeRouteTest();

    if (test) TestRunner.sendAction('selectTest', this, test);
    else TestRunner.sendAction('selectTarget', this, target);
  }
      
});
