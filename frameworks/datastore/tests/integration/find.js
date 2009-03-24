// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Apple, Inc. and contributors.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test json0_9 json10_19 json20_29 json30_39 json40_49 StandardTestSetup MyApp */

module("SC.Store#find", {
  setup: function() {
    StandardTestSetup.setup().loadRecords();
  }
});

test("find record with command  MyApp.store.find('4995bc653adad')", function() {
  var record = MyApp.store.find('4995bc653adad');
  ok(SC.typeOf(record) === SC.T_OBJECT, "record returned is of type 'object'");
  
  equals(record.get('fullName'), 'Milburn Holdeman 2', "record.get(fullName)");
  
  equals(record.get(record.primaryKey), '4995bc653adad', "record.get(record.primaryKey)");
  equals(record.get('guid'), '4995bc653adad', "record.get('guid')");

  var rec = MyApp.store.find('4995bc653adad');
  equals(rec, record, "find again, new rec should be same instance as old");
});

test("find record with command  MyApp.Author.find('4995bc653adc4', MyApp.store)", function() {
  var record = MyApp.Author.find('4995bc653adc4', MyApp.store);
  ok(typeof record === 'object', "record returned is of type 'object'");
  ok(record.get('fullName') == 'Martina Read 4', "record.get('fullName') should equal 'Martina Read 4'");
  ok(record.get(record.primaryKey) == '4995bc653adc4', "record.get(record.primaryKey) should equal '4995bc653adc4'");
  ok(record.get('guid') == '4995bc653adc4', "record.get('guid') should equal '4995bc653adc4'");

  var rec = MyApp.Author.find('4995bc653adc4', MyApp.store);
  ok(rec === record, "find again, var rec = MyApp.Author.find('4995bc653adc4'). rec should === record");
});

test("find unknown record with command MyApp.store.find('123') should fault and return null.", function() {
  var record = MyApp.store.find('123');
  ok(record === null, "record returned should equal null");
});

test("find record with command  MyApp.store.find('123', MyApp.Author) should fault and get data from server.", function() {
  var record = MyApp.store.find('123', MyApp.Author);
  equals(typeof record, 'object', "record type");
  equals(record.get('guid'), null, "record.get('guid')");
  equals(record.get('status'), SC.Record.BUSY_LOADING, "record.get('status')");
  
  MyApp.fixtureServer.simulateResponseFromServer('123');
  
  equals(record.get('guid'), '123', "record.get('guid')");
  equals(record.get('status'), SC.RECORD_LOADED, "record.get('status') should === SC.RECORD_LOADED");
  equals(record.get('fullName'), 'Galen Tyrol', "record.get(fullName)");
  equals(MyApp.store.revisions[record.storeKey], 0, "revision");

});
