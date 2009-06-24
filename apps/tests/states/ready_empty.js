// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
/*globals TestRunner */

sc_require('states/ready');

/**
  Show empty selector when no target chosen.
*/
TestRunner.READY_EMPTY = SC.Responder.create({

  nextResponder: TestRunner.READY,
  
  /**
    Show laoding targets view.
  */
  didBecomeFirstResponder: function() {
    TestRunner.set('currentScene', 'testsNone');
    
    // if there is a selected target already, look it up and select it.
    var name = TestRunner.get('targetName'), target;
    if (name) {
      target = TestRunner.targetsController.findProperty('name', name);
      if (target) TestRunner.sendAction('selectTarget', this, target);
    }
  },
  
  willLoseFirstResponder: function() {
    TestRunner.set('currentScene', null);
  }
  
});