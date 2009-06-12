// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
/*globals TestRunner */

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
  store: SC.Store.create().from('TestRunner.DevDataSource'),
  
  /** Returns all known targets */
  targets: function() {
    return this.get('store').findAll(TestRunner.Target);
  }.property().cacheable(),
  
  trace: NO
  
}) ;
