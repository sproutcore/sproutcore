// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals TestRunner */

sc_require('states/ready');

/**
  Initial state of application before it has loaded targets.
*/
TestRunner.READY_DETAIL = SC.Responder.create({
  
  nextResponder: TestRunner.READY,
  
  /**
    Show loading targets view.
  */
  didBecomeFirstResponder: function() {
    TestRunner.set('currentScene', 'testsDetail');
    
    var target = TestRunner.sourceController.get('selection').firstObject();
    var test   = TestRunner.detailController.get('content');
    TestRunner.updateRoute(target, test, YES);
  },
  
  willLoseFirstResponder: function() {
    TestRunner.set('currentScene', null);
  },
  
  /**
    Invoked when you click "back"
  */
  back: function() {
    TestRunner.detailController.set('content', null);
    TestRunner.makeFirstResponder(TestRunner.READY_LIST);
  }
  
});
