// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
/*globals TestRunner */

sc_require('states/ready');

/**
  Initial state of application before it has loaded targets.
*/
TestRunner.READY_LIST = SC.Responder.create({
  
  nextResponder: TestRunner.READY,
  
  /**
    Show laoding targets view.
  */
  didBecomeFirstResponder: function() {
    TestRunner.set('currentScene', 'testsMaster');
    TestRunner.testsController.set('selection', null); // always empty sel
    //TestRunner.testsController.set('isShowingTests', YES);

    var target = TestRunner.sourceController.get('selection').firstObject();
    TestRunner.updateRoute(target, null, NO);
    if (TestRunner.get('routePending')) {
      var test = TestRunner.computeRouteTest();
      if (test) TestRunner.sendAction('selectTest', this, test);
      else TestRunner.updateRoute(target, null, YES);
    } 
    
  },
  
  willLoseFirstResponder: function() {
    TestRunner.set('currentScene', null);
    //TestRunner.testsController.set('isShowingTests', NO);
  }
  
});