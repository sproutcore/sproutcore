// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Apple, Inc. and contributors.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

var store, storeKey1,storeKey2,storeKey3,storeKey4,storeKey5, json;
var json1, json2, json3, json4, json5, json6, json7;
var storeKey6, storeKey7;

module("SC.Store#cancelRecord", {
  setup: function() {
    
    store = SC.Store.create();
    
    json1 = {
      guid: "cancelGUID1",
      string: "string",
      number: 23,
      bool:   YES
    };
    json2 = {
      guid: "cancelGUID2",
      string: "string",
      number: 23,
      bool:   YES
    };
    json3 = {
      guid: "cancelGUID3",
      string: "string",
      number: 23,
      bool:   YES
    };
    json4 = {
      guid: "cancelGUID4",
      string: "string",
      number: 23,
      bool:   YES
    };
    json5 = {
      guid: "cancelGUID5",
      string: "string",
      number: 23,
      bool:   YES
    };
    json6 = {
      guid: "cancelGUID6",
      string: "string",
      number: 23,
      bool:   YES
    };
    json7 = {
      guid: "cancelGUID7",
      string: "string",
      number: 23,
      bool:   YES
    };
    
    storeKey1 = SC.Store.generateStoreKey();
    store.writeDataHash(storeKey1, json1, SC.Record.READY_CLEAN);
    storeKey2 = SC.Store.generateStoreKey();
    store.writeDataHash(storeKey2, json2, SC.Record.READY_NEW);
    storeKey3 = SC.Store.generateStoreKey();
    store.writeDataHash(storeKey3, json3, SC.Record.READY_DIRTY);
    storeKey4 = SC.Store.generateStoreKey();
    store.writeDataHash(storeKey4, json4, SC.Record.DESTROYED_DIRTY);
    storeKey5 = SC.Store.generateStoreKey();
    store.writeDataHash(storeKey5, json5, SC.Record.READY_EMPTY);
    storeKey6 = SC.Store.generateStoreKey();
    store.writeDataHash(storeKey6, json6, SC.Record.READY_ERROR);
    storeKey7 = SC.Store.generateStoreKey();
    store.writeDataHash(storeKey7, json7, SC.Record.READY_DESTROYED_CLEAN);
  }
});

test("cancel a record", function() {
  var sk;
  var rec = SC.Record.create();
  try{
    store.cancelRecord(undefined, undefined, storeKey1);
    ok(true, " cancelRecord was succesfully executed method ");
    
  }catch (error){
    ok(false, "cancelRecord method failed at runtime");
  }
  
});
