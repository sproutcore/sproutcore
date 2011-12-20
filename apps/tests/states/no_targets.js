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
TestRunner.NO_TARGETS = SC.Responder.create({
  
  /**
    Show loading targets view.
  */
  didBecomeFirstResponder: function() {
    TestRunner.set('currentScene', 'noTargets');
    TestRunner.updateRoute(null, null, YES);
  },
  
  willLoseFirstResponder: function() {
    TestRunner.set('currentScene', null);
  }
    
});
