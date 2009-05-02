// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Apple, Inc. and contributors.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

// test querying through findAll on the store
var MyApp;
module("SC.Query querying findAll on a store", {
  setup: function() {
    // setup dummy app and store
    MyApp = SC.Object.create({});
    
    // setup data source that just returns cached storeKeys
    MyApp.DataSource = SC.DataSource.create({
      
      storeKeys: null,
      
      fetchRecords: function(store, fetchKey, params) {
        return this.storeKeys;
      }
      
    });
    
    MyApp.store = SC.Store.create().from(MyApp.DataSource);
    
    // setup a dummy model
    MyApp.Foo = SC.Record.extend({});
    
    // load some data
    MyApp.DataSource.storeKeys = MyApp.store.loadRecords(MyApp.Foo, [
      { guid: 1, firstName: "John", lastName: "Doe" },
      { guid: 2, firstName: "Jane", lastName: "Doe" },
      { guid: 3, firstName: "Emily", lastName: "Parker", bornIn: 1975 },
      { guid: 4, firstName: "Johnny", lastName: "Cash" },
      { guid: 5, firstName: "Bert", lastName: "Berthold" }
    ]);
    
  }
});


// ..........................................................
// RECORD PROPERTIES
// 

test("should find records based on query string", function() {
  
  var records = MyApp.store.findAll("firstName = 'John'");
  equals(records.get('length'), 1, 'record length should be 1');
  equals(records.objectAt(0).get('firstName'), 'John', 'name should be John');

});

test("should find records based on SC.Query", function() {
  
  var q = SC.Query.create({queryString:"firstName = 'Jane'"});
  
  var records = MyApp.store.findAll(q);
  equals(records.get('length'), 1, 'record length should be 1');
  equals(records.objectAt(0).get('firstName'), 'Jane', 'name should be Jane');

});

test("should find records within a passed record array", function() {

  var recArray = MyApp.store.findAll(MyApp.Foo);
  var records = MyApp.store.findAll("firstName = 'Emily'", null, null, recArray);
  
  equals(records.get('length'), 1, 'record length should be 1');
  equals(records.objectAt(0).get('firstName'), 'Emily', 'name should be Emily');

});

test("changing the original store key array from data source should propagate to record array", function() {
  
  var records = MyApp.store.findAll(MyApp.Foo);
  
  equals(records.get('length'), 5, 'record length should be 5');
  
  var newStoreKeys = MyApp.DataSource.storeKeys;
  newStoreKeys.pop();
  
  // .replace() will call .enumerableContentDidChange()
  MyApp.DataSource.storeKeys.replace(0,100,newStoreKeys);
  
  equals(records.get('length'), 4, 'record length should be 4');

});

test("loading more data into the store should propagate to record array", function() {
  
  var records = MyApp.store.findAll(MyApp.Foo);
  
  equals(records.get('length'), 5, 'record length before should be 5');
  
  var newStoreKeys = MyApp.store.loadRecords(MyApp.Foo, [
    { guid: 10, firstName: "John", lastName: "Johnson" }
  ]);
  
  MyApp.DataSource.storeKeys.replace(0,0,newStoreKeys);
  
  equals(records.get('length'), 6, 'record length after should be 6');

});

test("loading more data into the store should propagate to record array with query", function() {
  
  var records = MyApp.store.findAll("firstName = 'John'");
  
  equals(records.get('length'), 1, 'record length before should be 1');
  
  var newStoreKeys = MyApp.store.loadRecords(MyApp.Foo, [
    { guid: 10, firstName: "John", lastName: "Johnson" }
  ]);
  
  // .replace() will call .enumerableContentDidChange()
  // and should fire original SC.Query again
  MyApp.DataSource.storeKeys.replace(0,0,newStoreKeys);
  
  equals(records.get('length'), 2, 'record length after should be 2');
  
  // subsequent updates to store keys should also work
  
  var newStoreKeys2 = MyApp.store.loadRecords(MyApp.Foo, [
    { guid: 11, firstName: "John", lastName: "Norman" }
  ]);
  
  MyApp.DataSource.storeKeys.replace(0,0,newStoreKeys2);
  
  equals(records.get('length'), 3, 'record length after should be 3');

});
