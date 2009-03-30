// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Apple, Inc. and contributors.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

var store, storeKey1, storeKey2, storeKey3, storeKey4, storeKey5, storeKey6;
var storeKey7, json, json1, json2, json3, json4, json5, json6, json7;

module("SC.Store#commitRecord", {
  setup: function() {
    
    store = SC.Store.create();
    
    json1 = {
      guid: "commitGUID1",
      string: "string",
      number: 23,
      bool:   YES
    };
    json2 = {
      guid: "commitGUID2",
      string: "string",
      number: 23,
      bool:   YES
    };
    json3 = {
      guid: "commitGUID3",
      string: "string",
      number: 23,
      bool:   YES
    };
    json4 = {
      guid: "commitGUID4",
      string: "string",
      number: 23,
      bool:   YES
    };
    json5 = {
      guid: "commitGUID5",
      string: "string",
      number: 23,
      bool:   YES
    };
    json6 = {
      guid: "commitGUID6",
      string: "string",
      number: 23,
      bool:   YES
    };
    json7 = {
      guid: "commitGUID7",
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

test("commit a record", function() {

  var sk;
  var rec = SC.Record.create();
  store.commitRecord(undefined, undefined, storeKey1);
  status = store.readStatus( storeKey1);
  equals(SC.Record.READY_CLEAN, status, "the status shouldn't have changed.");
  
  store.commitRecord(undefined, undefined, storeKey2);
  status = store.readStatus( storeKey2);
  equals(SC.Record.BUSY_CREATING, status, "the status shouldn't have changed.");
  
  store.commitRecord(undefined, undefined, storeKey3);
  status = store.readStatus( storeKey3);
  equals(SC.Record.BUSY_COMMITTING, status, "the status shouldn't have changed.");
  
  store.commitRecord(undefined, undefined, storeKey4);
  status = store.readStatus( storeKey4);
  equals(SC.Record.BUSY_DESTROYING, status, "the status shouldn't have changed.");
   
   
  
  try{
    store.commitRecord(undefined, undefined, storeKey5);
  }catch(error1){
    equals(SC.Record.NOT_FOUND_ERROR.message, error1.message, "the status shouldn't have changed.");
  }
  try{
    store.commitRecord(undefined, undefined, storeKey6);
  }catch(error2){
    equals(SC.Record.NOT_FOUND_ERROR.message, error2.message, "the status shouldn't have changed.");
  }
  try{
    store.commitRecord(undefined, undefined, storeKey7);
  }catch(error3){
    equals(SC.Record.NOT_FOUND_ERROR.message, error3.message, "the status shouldn't have changed.");
  }
  
});
