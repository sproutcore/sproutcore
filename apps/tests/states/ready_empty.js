// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals TestRunner */

sc_require('states/ready');

/**
  State when targets are loaded, but no target is selected.
*/
TestRunner.READY_EMPTY = SC.Responder.create({

  nextResponder: TestRunner.READY,
  
  /**
    Show laoding targets view.
  */
  didBecomeFirstResponder: function() {
    TestRunner.set('currentScene', 'testsNone');

    // if a route is pending, then try to select the target.  If no target
    // could be found, then set the final route to here.
    TestRunner.updateRoute(null, null, NO);
     
    if (TestRunner.get('routePending')) {
      var target = TestRunner.computeRouteTarget();
      if (target) TestRunner.sendAction('selectTarget', this, target);
      else TestRunner.updateRoute(null, null, YES) ;
    } 
    
  },
  
  willLoseFirstResponder: function() {
    TestRunner.set('currentScene', null);
  },
  
  /**
    While in the empty state, save the target/test and then. 
  */
  route: function(sender, params) {
    TestRunner.set('routeTarget', params.target);
    TestRunner.set('routeTest', params.test);
  }
  
});
