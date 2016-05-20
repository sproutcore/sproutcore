// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

var parent, store, Application;

module("SC.Store#autonomous_errorMethods", {
  setup: function() {

    SC.RunLoop.begin();
    Application = {};
    Application.Thing = SC.Record.extend({
      name: SC.Record.attr(String)
    });

    parent = SC.Store.create().from(SC.Record.fixtures);

    var records = [
      { guid: 1, name: 'Thing One' },
      { guid: 2, name: 'Thing Two' }
    ];

    var types = [ Application.Thing, Application.Thing ];

    parent.loadRecords(types, records);
    store = parent.chainAutonomousStore();
  },

  teardown: function() {
    store = null;
    Application = null;
    SC.RunLoop.end();
  }
});

test("Verify readError() returns correct errors", function() {
  var thing1 = store.find(Application.Thing, 1);
  var storeKey = thing1.get('storeKey');

  store.writeStatus(storeKey, SC.Record.BUSY_LOADING);
  store.dataSourceDidError(storeKey, SC.Record.GENERIC_ERROR);

  equals(store.readError(storeKey), SC.Record.GENERIC_ERROR,
    "store.readError(storeKey) should return the correct error object");
});

test("Verify readQueryError() returns correct errors", function() {
  var q = SC.Query.local(Application.Thing);
  var things = store.find(q);

  things.set('status', SC.Record.BUSY_LOADING);
  store.dataSourceDidErrorQuery(q, SC.Record.GENERIC_ERROR);

  equals(store.readQueryError(q), SC.Record.GENERIC_ERROR,
    "store.readQueryError(q) should return the correct error object");
});
