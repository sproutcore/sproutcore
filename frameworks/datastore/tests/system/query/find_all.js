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
      
      fetch: function(store, fetchKey, params) {
        return this.storeKeys;
      }
      
    });
    
    MyApp.store = SC.Store.create().from(MyApp.DataSource);
    
    // setup a dummy model
    MyApp.Foo = SC.Record.extend({});
    MyApp.Faa = SC.Record.extend({});
    
    var records = [
      { guid: 1, firstName: "John", lastName: "Doe" },
      { guid: 2, firstName: "Jane", lastName: "Doe" },
      { guid: 3, firstName: "Emily", lastName: "Parker", bornIn: 1975 },
      { guid: 4, firstName: "Johnny", lastName: "Cash" },
      { guid: 5, firstName: "Bert", lastName: "Berthold" }
    ];
    
    // load some data
    MyApp.DataSource.storeKeys = MyApp.store.loadRecords(MyApp.Foo, records);
    // for sanity check, load two record types
    MyApp.store.loadRecords(MyApp.Faa, records);
    
    // 
    // now set up a second store with data source that returns SC.Query
    // 
    MyApp.DataSource2 = SC.DataSource.create({
      // just return fetchKey which will be SC.Query
      fetch: function(store, fetchKey, params) {
        return fetchKey;
      }
    });
    MyApp.store2 = SC.Store.create().from(MyApp.DataSource2);
    MyApp.DataSource2.storeKeys = MyApp.store2.loadRecords(MyApp.Foo, records);
    // for sanity check, load two record types
    MyApp.store2.loadRecords(MyApp.Faa, records);
    
  }
});


// ..........................................................
// RECORD PROPERTIES
// 

test("should find records based on query string", function() {
  
  var q = SC.Query.create({recordType: MyApp.Foo, conditions:"firstName = 'John'"});
  var records = MyApp.store.findAll(q);
  equals(records.get('length'), 1, 'record length should be 1');
  equals(records.objectAt(0).get('firstName'), 'John', 'name should be John');

});

test("should find records based on SC.Query", function() {
  
  var q = SC.Query.create({recordType: MyApp.Foo, conditions:"firstName = 'Jane'"});
  
  var records = MyApp.store.findAll(q);
  equals(records.get('length'), 1, 'record length should be 1');
  equals(records.objectAt(0).get('firstName'), 'Jane', 'name should be Jane');

});

test("should find records based on SC.Query without recordType", function() {
  
  var q = SC.Query.create({conditions:"firstName = 'Jane'"});
  
  var records = MyApp.store.findAll(q);
  equals(records.get('length'), 2, 'record length should be 2');
  equals(records.objectAt(0).get('firstName'), 'Jane', 'name should be Jane');
  equals(records.objectAt(1).get('firstName'), 'Jane', 'name should be Jane');

});

test("should find records within a passed record array", function() {

  var q = SC.Query.create({recordType: MyApp.Foo, conditions:"firstName = 'Emily'"});

  var recArray = MyApp.store.findAll(MyApp.Foo);
  var records = MyApp.store.findAll(q, null, recArray);
  
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
  
  var q = SC.Query.create({recordType: MyApp.Foo, conditions:"firstName = 'John'"});
  
  var records = MyApp.store.findAll(q);
  
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

test("SC.Query returned from fetchRecords() should return result set", function() {
  
  var q = SC.Query.create({recordType: MyApp.Foo, conditions:"firstName = 'John'"});
  
  var records = MyApp.store2.findAll(q);
  equals(records.get('length'), 1, 'record length should be 1');
  equals(records.objectAt(0).get('firstName'), 'John', 'name should be John');

});

test("Loading records after SC.Query is returned in fetchRecords() should show up", function() {
  
  var q = SC.Query.create({recordType: MyApp.Foo, conditions:"firstName = 'John'"});
  
  var records = MyApp.store2.findAll(q);
  equals(records.get('length'), 1, 'record length should be 1');
  equals(records.objectAt(0).get('firstName'), 'John', 'name should be John');
  
  var recordsToLoad = [
    { guid: 20, firstName: "John", lastName: "Johnson" },
    { guid: 21, firstName: "John", lastName: "Anderson" },
    { guid: 22, firstName: "Barbara", lastName: "Jones" }
  ];
  
  MyApp.store2.loadRecords(MyApp.Foo, recordsToLoad);
  
  equals(records.get('length'), 3, 'record length should be 3');
  
  equals(records.objectAt(0).get('firstName'), 'John', 'name should be John');
  equals(records.objectAt(1).get('firstName'), 'John', 'name should be John');
  equals(records.objectAt(2).get('firstName'), 'John', 'name should be John');
  
});

test("Loading records after getting empty record array based on SC.Query should update", function() {
  
  var q = SC.Query.create({recordType: MyApp.Foo, conditions:"firstName = 'Maria'"});
  
  var records = MyApp.store2.findAll(q);
  equals(records.get('length'), 0, 'record length should be 0');
  
  var recordsToLoad = [
    { guid: 20, firstName: "Maria", lastName: "Johnson" }
  ];
  
  MyApp.store2.loadRecords(MyApp.Foo, recordsToLoad);
  
  equals(records.get('length'), 1, 'record length should be 1');
  
  equals(records.objectAt(0).get('firstName'), 'Maria', 'name should be Maria');
  
});

test("Changing a record should make it show up in RecordArrays based on SC.Query", function() {
  
  var q = SC.Query.create({recordType: MyApp.Foo, conditions:"firstName = 'Maria'"});
  
  var records = MyApp.store2.findAll(q);
  equals(records.get('length'), 0, 'record length should be 0');
  
  var record = MyApp.store2.find(MyApp.Foo, 1);
  record.set('firstName', 'Maria');
  
  equals(records.get('length'), 1, 'record length should be 1');
  
  equals(records.objectAt(0).get('firstName'), 'Maria', 'name should be Maria');
  
});

test("Deleting a record should make the RecordArray based on SC.Query update accordingly", function() {
  
  var q = SC.Query.create({recordType: MyApp.Foo, conditions:"firstName = 'John'"});
  
  var records = MyApp.store2.findAll(q);
  equals(records.get('length'), 1, 'record length should be 1');
  
  MyApp.store2.destroyRecord(MyApp.Foo, 1);
  
  equals(records.get('length'), 0, 'record length should be 0');
  
});

test("Using findAll with SC.Query on store with no data source should work", function() {
  
  // create a store with no data source
  MyApp.store3 = SC.Store.create();
  
  var q = SC.Query.create({recordType: MyApp.Foo, conditions:"firstName = 'John'"});
  
  var records = MyApp.store3.findAll(q);
  equals(records.get('length'), 0, 'record length should be 0');
  
  var recordsToLoad = [
    { guid: 20, firstName: "John", lastName: "Johnson" },
    { guid: 21, firstName: "John", lastName: "Anderson" },
    { guid: 22, firstName: "Barbara", lastName: "Jones" }
  ];
  
  MyApp.store3.loadRecords(MyApp.Foo, recordsToLoad);
  
  equals(records.get('length'), 2, 'record length should be 2');
  
});

test("Using orderBy in SC.Query returned from findAll()", function() {
  
  var q = SC.Query.create({recordType: MyApp.Foo, orderBy:"firstName ASC"});
  
  var records = MyApp.store.findAll(q);
  equals(records.get('length'), 5, 'record length should be 5');
  
  same(records.getEach('firstName'), ["Bert", "Emily", "Jane", "John", "Johnny"], 'first name should be properly sorted');
  
});

test("Using orderBy in SC.Query returned from findAll() and loading more records to original store key array", function() {
  
  var q = SC.Query.create({recordType: MyApp.Foo, orderBy:"firstName ASC"});
  
  var records = MyApp.store.findAll(q);
  equals(records.get('length'), 5, 'record length should be 5');
  
  equals(records.objectAt(0).get('firstName'), 'Bert', 'name should be Bert');
  equals(records.objectAt(4).get('firstName'), 'Johnny', 'name should be Johnny');
  
  var newStoreKeys2 = MyApp.store.loadRecords(MyApp.Foo, [
    { guid: 11, firstName: "Anna", lastName: "Petterson" }
  ]);
  
  MyApp.DataSource.storeKeys.replace(0,0,newStoreKeys2);
  
  equals(records.objectAt(0).get('firstName'), 'Anna', 'name should be Anna');
  equals(records.objectAt(1).get('firstName'), 'Bert', 'name should be Bert');
  equals(records.objectAt(5).get('firstName'), 'Johnny', 'name should be Johnny');
  
});


test("Using orderBy in SC.Query and loading more records to the store", function() {
  
  var q = SC.Query.create({recordType: MyApp.Foo, orderBy:"firstName ASC"});
  
  var records = MyApp.store2.findAll(q);
  equals(records.get('length'), 5, 'record length should be 5');
  equals(records.objectAt(0).get('firstName'), 'Bert', 'name should be Bert');
  
  MyApp.store2.loadRecords(MyApp.Foo, [
    { guid: 11, firstName: "Anna", lastName: "Petterson" }
  ]);
  
  equals(records.get('length'), 6, 'record length should be 6');
  
  equals(records.objectAt(0).get('firstName'), 'Anna', 'name should be Anna');
  equals(records.objectAt(5).get('firstName'), 'Johnny', 'name should be Johnny');
  
});

test("Chaining findAll() queries", function() {
  
  var q = SC.Query.create({recordType: MyApp.Foo, conditions:"lastName='Doe'"});
  
  var records = MyApp.store.findAll(q);
  equals(records.get('length'), 2, 'record length should be 2');
  
  var q2 = SC.Query.create({recordType: MyApp.Foo, conditions:"firstName='John'"});
  
  var records2 = records.findAll(q2);
  
  equals(records2.get('length'), 1, 'record length should be 1');
  
  equals(records2.objectAt(0).get('firstName'), 'John', 'name should be John');
  
});

test("Chaining findAll() queries and loading more records", function() {
  
  var q = SC.Query.create({recordType: MyApp.Foo, conditions:"lastName='Doe'"});
  var q2 = SC.Query.create({recordType: MyApp.Foo, conditions:"firstName='John'"});
  
  var records = MyApp.store2.findAll(q).findAll(q2);
  equals(records.get('length'), 1, 'record length should be 1');
  
  MyApp.store2.loadRecords(MyApp.Foo, [
    { guid: 11, firstName: "John", lastName: "Doe" }
  ]);
  
  equals(records.get('length'), 2, 'record length should be 2');
  
});
