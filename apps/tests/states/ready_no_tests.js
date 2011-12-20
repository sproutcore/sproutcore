// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals TestRunner */

/**
  Displayed when the app has no targets.
*/
TestRunner.READY_NO_TESTS = SC.Responder.create({
  
  nextResponder: TestRunner.READY,
  
  /**
    Show loading targets view.
  */
  didBecomeFirstResponder: function() {
    TestRunner.set('currentScene', 'noTests');

    // this is always the final route since we can't load any tests
    var target = TestRunner.sourceController.get('selection').firstObject();
    TestRunner.updateRoute(target, null, YES);
  },
  
  willLoseFirstResponder: function() {
    TestRunner.set('currentScene', null);
  }
    
});
