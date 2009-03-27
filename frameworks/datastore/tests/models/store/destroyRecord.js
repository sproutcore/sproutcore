// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Apple, Inc. and contributors.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

var store, storeKey1,storeKey2,storeKey3,storeKey4,storeKey5, json;
module("SC.Store#createRecord", {
  setup: function() {
    
    store = SC.Store.create();
    
    json1 = {
      guid: "destroyGUID1",
      string: "string",
      number: 23,
      bool:   YES
    };
    json2 = {
      guid: "destroyGUID2",
      string: "string",
      number: 23,
      bool:   YES
    };
    json3 = {
      guid: "destroyGUID3",
      string: "string",
      number: 23,
      bool:   YES
    };
    json4 = {
      guid: "destroyGUID4",
      string: "string",
      number: 23,
      bool:   YES
    };
    json5 = {
      guid: "destroyGUID5",
      string: "string",
      number: 23,
      bool:   YES
    };
    json6 = {
      guid: "destroyGUID6",
      string: "string",
      number: 23,
      bool:   YES
    };
    
    storeKey1 = SC.Store.generateStoreKey();
    store.writeDataHash(storeKey1, json1, SC.Record.BUSY_DESTROYING);
    storeKey2 = SC.Store.generateStoreKey();
    store.writeDataHash(storeKey2, json2, SC.Record.DESTROYED);
    storeKey3 = SC.Store.generateStoreKey();
    store.writeDataHash(storeKey3, json3, SC.Record.EMPTY);
    storeKey4 = SC.Store.generateStoreKey();
    store.writeDataHash(storeKey4, json4, SC.Record.BUSY);
    storeKey5 = SC.Store.generateStoreKey();
    store.writeDataHash(storeKey5, json5, SC.Record.READY_NEW);
    storeKey6 = SC.Store.generateStoreKey();
    store.writeDataHash(storeKey6, json6, SC.Record.READY_CLEAN);
    
    store.commitChanges();
  }
});

test("destroy a record", function() {
  var sk;
  var rec = SC.Record.create();
  store.destroyRecord(undefined, undefined, storeKey1);
  status = store.readStatus( storeKey1);
  equals(SC.Record.BUSY_DESTROYING, status, "the status shouldn't have changed.");
  
  store.destroyRecord(undefined, undefined, storeKey2);
  status = store.readStatus( storeKey2);
  equals(SC.Record.DESTROYED, status, "the status shouldn't have changed.");
  
  try{
    store.destroyRecord(undefined, undefined, storeKey3);
  }catch(error){
    equals(SC.Record.NOT_FOUND_ERROR.message, error.message, "the status shouldn't have changed.");
  }
  try{
    store.destroyRecord(undefined, undefined, storeKey4);
  }catch(error){
    equals(SC.Record.BUSY_ERROR.message, error.message, "the status shouldn't have changed.");
    
  }
  store.destroyRecord(undefined, undefined, storeKey5);
  status = store.readStatus( storeKey5);
  equals(SC.Record.DESTROYED_CLEAN, status, "the status shouldn't have changed.");
  
  store.destroyRecord(undefined, undefined, storeKey6);
  status = store.readStatus( storeKey6);
  equals(SC.Record.DESTROYED_DIRTY, status, "the status shouldn't have changed.");
  
});
