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
TestRunner.START = SC.Responder.create({
  
  /**
    Show loading targets view.
  */
  didBecomeFirstResponder: function() {
    TestRunner.set('currentScene', 'targetsLoading');
    TestRunner.targetsController.reload(); // load the targets.
  },
  
  willLoseFirstResponder: function() {
    TestRunner.set('currentScene', null);
  },
  
  /**
    Called when the targets have loaded.  Pass param whether we have targets 
    or not.
  */
  targetsDidChange: function() {
    if (TestRunner.getPath('targets.status') !== SC.Record.READY_CLEAN) return NO;
    
    var hasTargets = TestRunner.getPath('targets.length') >0;
    if (hasTargets) TestRunner.makeFirstResponder(TestRunner.READY_EMPTY);
    else TestRunner.makeFirstResponder(TestRunner.NO_TARGETS);
    return YES;
  }
    
});
