// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
/*globals TestRunner */

/**
  Displayed when the app has no targets.
*/
TestRunner.READY_NO_TESTS = SC.Responder.create({
  
  nextResponder: TestRunner.READY,
  
  /**
    Show laoding targets view.
  */
  didBecomeFirstResponder: function() {
    TestRunner.set('currentScene', 'noTests');
  },
  
  willLoseFirstResponder: function() {
    TestRunner.set('currentScene', null);
  }
    
});