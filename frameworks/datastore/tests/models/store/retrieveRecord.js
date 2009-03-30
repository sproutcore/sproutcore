// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Apple, Inc. and contributors.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */


var store, storeKey1, storeKey2, storeKey3, storeKey4, storeKey5, storeKey6;
var storeKey7, storeKey8, json, json1, json2, json3, json4, json5, json6 ;
var json7, json8;

module("SC.Store#commitRecord", {
  setup: function() {
    
    store = SC.Store.create();
    
    json1 = {
      guid: "retrieveGUID1",
      string: "string",
      number: 23,
      bool:   YES
    };
    json2 = {
      guid: "retrieveGUID2",
      string: "string",
      number: 23,
      bool:   YES
    };
    json3 = {
      guid: "retrieveGUID3",
      string: "string",
      number: 23,
      bool:   YES
    };
    json4 = {
      guid: "retrieveGUID4",
      string: "string",
      number: 23,
      bool:   YES
    };
    json5 = {
      guid: "retrieveGUID5",
      string: "string",
      number: 23,
      bool:   YES
    };
    json6 = {
      guid: "retrieveGUID6",
      string: "string",
      number: 23,
      bool:   YES
    };
    json7 = {
      guid: "retrieveGUID7",
      string: "string",
      number: 23,
      bool:   YES
    };
    json8 = {
      guid: "retrieveGUID8",
      string: "string",
      number: 23,
      bool:   YES
    };
    
    storeKey1 = SC.Store.generateStoreKey();
    store.writeDataHash(storeKey1, json1, SC.Record.EMPTY);
    storeKey2 = SC.Store.generateStoreKey();
    store.writeDataHash(storeKey2, json2, SC.Record.ERROR);
    storeKey3 = SC.Store.generateStoreKey();
    store.writeDataHash(storeKey3, json3, SC.Record.DESTROYED_CLEAN);
    storeKey4 = SC.Store.generateStoreKey();
    store.writeDataHash(storeKey4, json4, SC.Record.BUSY_DESTROYING);
    storeKey5 = SC.Store.generateStoreKey();
    store.writeDataHash(storeKey5, json5, SC.Record.BUSY_CREATING);
    storeKey6 = SC.Store.generateStoreKey();
    store.writeDataHash(storeKey6, json6, SC.Record.BUSY_COMMITING);
    storeKey7 = SC.Store.generateStoreKey();
    store.writeDataHash(storeKey7, json7, SC.Record.DESTROY_DIRTY);
    storeKey8 = SC.Store.generateStoreKey();
    store.writeDataHash(storeKey8, json8, SC.Record.READY_CLEAN);
    }
});
    
test("retrieve a record", function() {
  var sk;
  var rec = SC.Record.create();
  store.retrieveRecord(undefined, undefined, storeKey1, YES);
  status = store.readStatus( storeKey1);
  equals(SC.Record.BUSY_LOADING, status, "the status shouldn't have changed.");
  
  store.retrieveRecord(undefined, undefined, storeKey2, YES);
  status = store.readStatus( storeKey2);
  equals(SC.Record.BUSY_LOADING, status, "the status shouldn't have changed.");
  
  store.retrieveRecord(undefined, undefined, storeKey3, YES);
  status = store.readStatus( storeKey3);
  equals(SC.Record.BUSY_LOADING, status, "the status shouldn't have changed.");
  
  try{
    store.retrieveRecord(undefined, undefined, storeKey4, YES);
  }catch(error1){
    equals(SC.Record.BUSY_ERROR.message, error1.message, "should throw busy error");
  }
  try{
    store.retrieveRecord(undefined, undefined, storeKey5, YES);
  }catch(error2){
    equals(SC.Record.BUSY_ERROR.message, error2.message, "should throw busy error");
  }
  try{
    store.retrieveRecord(undefined, undefined, storeKey6, YES);
  }catch(error3){
    equals(SC.Record.BUSY_ERROR.message, error3.message, "should throw busy error");
  }
  try{
    store.retrieveRecord(undefined, undefined, storeKey7, YES);
  }catch(error4){
    equals(SC.Record.BAD_STATE_ERROR.message, error4.message, "should throw bad_state error");
  }
  
  store.retrieveRecord(undefined, undefined, storeKey3, YES);
  status = store.readStatus( storeKey3);
  ok(status & SC.Record.READY, "the status shouldn't have changed.");
  
});
