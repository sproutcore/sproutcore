// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Apple, Inc. and contributors.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test json0_9 json10_19 json20_29 json30_39 json40_49 StandardTestSetup MyApp */

module("SC.Store", StandardTestSetup);

test("set parentStore property on MyApp.store to MyApp.fixtureServer", function() {
  var ret = MyApp.store.set('parentStore', MyApp.fixtureServer);
  ok(MyApp.fixtureServer === MyApp.store.get('parentStore'), "MyApp.fixtureServer should === MyApp.store.get('parentStore')" ) ;
});

test("MyApp.store sees that parentStore is persistent", function() {
  equals(YES, MyApp.store.get('parentStore').get('isPersistent')) ;
});

test("MyApp.fixtureServer sees its childStore is MyApp.store", function() {
  ok(MyApp.fixtureServer.get('childStore') === MyApp.store, ".MyApp.fixtureServer.get('childStore') should === MyApp.store" ) ;
});


