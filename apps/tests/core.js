// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals CoreTools TestRunner */

/** @namespace

  My cool new app.  Describe your application.
  
  @extends SC.Application
*/
TestRunner = SC.Application.create(
  /** @scope TestRunner.prototype */ {

  NAMESPACE: 'TestRunner',
  VERSION: '0.1.0',

  // This is your application store.  You will use this store to access all
  // of your model data.  You can also set a data source on this store to
  // connect to a backend server.  The default setup below connects the store
  // to any fixtures you define.
  store: SC.Store.create().from('CoreTools.DataSource'),
  
  /** Returns all known targets */
  targets: function() {
    return this.get('store').find(CoreTools.TARGETS_QUERY);
  }.property().cacheable(),
  
  trace: NO,
  
  userDefaults: SC.UserDefaults.create({
    userDomain: 'anonymous',
    appDomain:  'SC.TestRunner'
  }),
  
  // ..........................................................
  // ROUTE SUPPORT
  // 
  
  /**
    The current route.  This is set whenever the route changes.
  */
  route: {},
  
  /**
    Whenever the route changes and it does not match the current state,
    this will be set to YES.  Whenever states transition, if the route is
    pending, they will try to move it on to the next step if possible.
  */
  routePending: NO,
  
  /**
    Computes the current target as named by the route.  If the target is not
    found it will return null.  
  */
  computeRouteTarget: function() {
    var name = this.get('route').target;
    if (!name) return null;
    else return TestRunner.targetsController.findProperty('name', name);    
  },
  
  /**
    Computes the current test as named by the route.  If the test is not found
    it will return null.
  */
  computeRouteTest: function() {
    var name = this.get('route').test;
    if (!name) return null;
    else return TestRunner.testsController.findProperty('filename', name);
  },
  
  /**
    Called whenever the route changes.  Sends an appropriate event down the
    responder chain.  Also sets the current target.
  */
  routeDidChange: function(params) {
    if (!params.target) return NO; // nothing to do
    
    // normalize target + test
    params = SC.clone(params);
    if (params.target) params.target = '/' + params.target;
    if (params.test) params.test   = 'tests/' + params.test ;
    
    // save the desired state properties
    this.set('route', params);
    this.set('routePending', YES);
    
    this.trace = YES;
    this.sendAction('route', this, params);
    this.trace=NO;

    return YES;
  },
  
  /**
    Called by the state machine whenever it lands in a stable target state.
    Pass in the target and test.  We'll update the location and set a new 
    target route state if needed.
    
    Whenever you update the route to the current route state, then 
    routePending will be cleared.
    
    Passing isFinal will force the routePending to go to NO.  pass this when
    the state is at a dead-end and can't move forward any further.
  */
  updateRoute: function(target, test, isFinal) {
    var route = this.get('route'),
        loc;
    
    if (isFinal || ((target === route.target) && (test === route.test))) {
      this.set('routePending', NO);
    }

    // if a route is not pending, then update the current location with the
    // new route
    if (!this.get('routePending')) {
      if (target) target = target.get('name');
      if (test)   test = test.get('filename');

      loc = target ? target.slice(1) : '';
      if (test) loc = '%@&test=%@'.fmt(loc, test.slice(6));

      SC.routes.setIfChanged('location', loc);
    }    
  }
  
}) ;

// Add a route handler to select a target and, optionally, a test.
SC.routes.add('*target', TestRunner, TestRunner.routeDidChange);
