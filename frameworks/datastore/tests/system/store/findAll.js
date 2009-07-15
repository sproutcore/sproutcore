// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Apple Inc. and contributors.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

// test querying through findAll on the store
var MyApp;
module("SC.Query querying findAll on a store", {
  setup: function() {
    SC.RunLoop.begin();
    // setup dummy app and store
    MyApp = SC.Object.create({});
    
    // setup data source that just returns cached storeKeys
    MyApp.DataSource = SC.DataSource.create({

      prepareQuery: function(store, query) {  
      },
      
      fetchQuery: function(store, query) {
        this.query = query;
        this.store = store;
        this.fetchCount++ ;
      },
      
      reset: function() {
        this.query = this.store = null ;
        this.fetchCount = this.prepareCount = 0 ;
      },
      
      fetchEquals: function(store, query, count, desc) {
        if (desc===undefined && typeof count === 'string') {
          desc = count;  count = undefined;
        }
        if (count===undefined) count = 1; 
        
        equals(this.store, store, desc + ': should get store');
        equals(this.query, query, desc + ': should get query');
        equals(this.fetchCount, count, desc + ': should get count');
      },
      
      destroyRecord: function(store, storeKey){
        store.dataSourceDidDestroy(storeKey);
        return YES;
      }
      
    });
    
    MyApp.store = SC.Store.create().from(MyApp.DataSource);
    
    // setup a dummy model
    MyApp.Foo = SC.Record.extend({});
    MyApp.Faa = SC.Record.extend({});
    
    var records = [
      { guid: 1, firstName: "John", lastName: "Doe", married: true },
      { guid: 2, firstName: "Jane", lastName: "Doe", married: false },
      { guid: 3, firstName: "Emily", lastName: "Parker", bornIn: 1975, married: true },
      { guid: 4, firstName: "Johnny", lastName: "Cash", married: true },
      { guid: 5, firstName: "Bert", lastName: "Berthold", married: true }
    ];
    
    // load some data
    MyApp.DataSource.storeKeys = MyApp.store.loadRecords(MyApp.Foo, records);
    SC.RunLoop.end();
    
    SC.RunLoop.begin();
    // for sanity check, load two record types
    MyApp.store.loadRecords(MyApp.Faa, records);
    SC.RunLoop.end();
    
  }
  
});

// ..........................................................
// RECORD ARRAY CACHING
// 

test("findAll caching for a single store", function() {
  var r1 = MyApp.store.findAll(MyApp.Foo);  
  var r2 = MyApp.store.findAll(MyApp.Foo);
  ok(!!r1, 'should return a record array');
  equals(r1.get('store'), MyApp.store, 'return object should be owned by store');
  equals(r2, r1, 'should return same record array for multiple calls');
});

test("findAll caching for a chained store", function() {
  var r1 = MyApp.store.findAll(MyApp.Foo);  
  
  var child = MyApp.store.chain();
  var r2 = child.findAll(MyApp.Foo);
  var r3 = child.findAll(MyApp.Foo);

  ok(!!r1, 'should return a record array from base store');
  equals(r1.get('store'), MyApp.store, 'return object should be owned by store');
  
  ok(!!r2, 'should return a recurd array from child store');
  equals(r2.get('store'), child, 'return object should be owned by child store');
  
  ok(r2 !== r1, 'return value for child store should not be same as parent');
  equals(r3, r2, 'return value from child store should be the same after multiple calls');
  
  // check underlying queries
  ok(!!r1.get('query'), 'record array should have a query');
  equals(r2.get('query'), r1.get('query'), 'record arrays from parent and child stores should share the same query');
});

test("data source must get the right calls", function() {
  var ds = MyApp.store.get('dataSource');
  
  ds.reset();
  var records = MyApp.store.findAll(MyApp.Foo);
  var q = MyApp.store.queryFor(MyApp.Foo);
  ds.fetchEquals(MyApp.store, q, 'after fetch');
});

// ..........................................................
// RECORD PROPERTIES
// 

notest("should find records based on boolean", function() {
  var q = SC.Query.create({recordType: MyApp.Foo, conditions:"married=true"});
  
  var records = MyApp.store.findAll(q);
  equals(records.get('length'), 4, 'record length should be 4');
  
});

notest("should find records based on query string", function() {
  
  var q = SC.Query.create({recordType: MyApp.Foo, conditions:"firstName = 'John'"});
  var records = MyApp.store.findAll(q);
  equals(records.get('length'), 1, 'record length should be 1');
  equals(records.objectAt(0).get('firstName'), 'John', 'name should be John');

});

notest("should find records based on SC.Query", function() {
  
  var q = SC.Query.create({recordType: MyApp.Foo, conditions:"firstName = 'Jane'"});
  
  var records = MyApp.store.findAll(q);
  equals(records.get('length'), 1, 'record length should be 1');
  equals(records.objectAt(0).get('firstName'), 'Jane', 'name should be Jane');

});

notest("should find records based on SC.Query without recordType", function() {
  
  var q = SC.Query.create({conditions:"lastName = 'Doe'"});
  
  var records = MyApp.store.findAll(q);
  equals(records.get('length'), 2, 'record length should be 2');
  equals(records.objectAt(0).get('firstName'), 'John', 'name should be John');
  equals(records.objectAt(1).get('firstName'), 'Jane', 'name should be Jane');

});

notest("should find records within a passed record array", function() {

  var q = SC.Query.create({recordType: MyApp.Foo, conditions:"firstName = 'Emily'"});

  var recArray = MyApp.store.findAll(MyApp.Foo);
  var records = MyApp.store.findAll(q, null, recArray);
  
  equals(records.get('length'), 1, 'record length should be 1');
  equals(records.objectAt(0).get('firstName'), 'Emily', 'name should be Emily');

});

notest("changing the original store key array from data source should propagate to record array", function() {
  
  var records = MyApp.store.findAll(MyApp.Foo);
  
  equals(records.get('length'), 5, 'record length should be 5');
  
  var newStoreKeys = MyApp.DataSource.storeKeys;
  newStoreKeys.pop();
  
  // .replace() will call .enumerableContentDidChange()
  MyApp.DataSource.storeKeys.replace(0,100,newStoreKeys);
  
  equals(records.get('length'), 4, 'record length should be 4');

});


notest("loading more data into the store should propagate to record array", function() {
  
  var records = MyApp.store.findAll(MyApp.Foo);
  
  equals(records.get('length'), 5, 'record length before should be 5');
  
  var newStoreKeys = MyApp.store.loadRecords(MyApp.Foo, [
    { guid: 10, firstName: "John", lastName: "Johnson" }
  ]);
  
  MyApp.DataSource.storeKeys.replace(0,0,newStoreKeys);
  
  equals(records.get('length'), 6, 'record length after should be 6');

});

notest("loading more data into the store should propagate to record array with query", function() {
  SC.RunLoop.begin();
  var q = SC.Query.create({recordType: MyApp.Foo, conditions:"firstName = 'John'"});
  
  var records = MyApp.store.findAll(q);
  
  equals(records.get('length'), 1, 'record length before should be 1');
  
  var newStoreKeys = MyApp.store.loadRecords(MyApp.Foo, [
    { guid: 10, firstName: "John", lastName: "Johnson" }
  ]);
  
  // .replace() will call .enumerableContentDidChange()
  // and should fire original SC.Query again
  
  MyApp.DataSource.storeKeys.replace(0,0,newStoreKeys);
  SC.RunLoop.end();
  equals(records.get('length'), 2, 'record length after should be 2');
  
  // subsequent updates to store keys should also work
  SC.RunLoop.begin();
  var newStoreKeys2 = MyApp.store.loadRecords(MyApp.Foo, [
    { guid: 11, firstName: "John", lastName: "Norman" }
  ]);
  
  MyApp.DataSource.storeKeys.replace(0,0,newStoreKeys2);
  SC.RunLoop.end();
  
  equals(records.get('length'), 3, 'record length after should be 3');
  
});

notest("SC.Query returned from fetchRecords() should return result set", function() {
  
  var q = SC.Query.create({recordType: MyApp.Foo, conditions:"firstName = 'John'"});
  
  var records = MyApp.store.findAll(q);
  equals(records.get('length'), 1, 'record length should be 1');
  equals(records.objectAt(0).get('firstName'), 'John', 'name should be John');

});

notest("Loading records after SC.Query is returned in fetchRecords() should show up", function() {
  
  SC.RunLoop.begin();
  var q = SC.Query.create({recordType: MyApp.Foo, conditions:"firstName = 'John'"});
  
  var records = MyApp.store.findAll(q);
  equals(records.get('length'), 1, 'record length should be 1');
  equals(records.objectAt(0).get('firstName'), 'John', 'name should be John');
  
  var recordsToLoad = [
    { guid: 20, firstName: "John", lastName: "Johnson" },
    { guid: 21, firstName: "John", lastName: "Anderson" },
    { guid: 22, firstName: "Barbara", lastName: "Jones" }
  ];
  
  MyApp.store.loadRecords(MyApp.Foo, recordsToLoad);
  SC.RunLoop.end();
  
  equals(records.get('length'), 3, 'record length should be 3');
  
  equals(records.objectAt(0).get('firstName'), 'John', 'name should be John');
  equals(records.objectAt(1).get('firstName'), 'John', 'name should be John');
  equals(records.objectAt(2).get('firstName'), 'John', 'name should be John');
  
});

notest("Loading records after getting empty record array based on SC.Query should update", function() {
  
  SC.RunLoop.begin();
  var q = SC.Query.create({recordType: MyApp.Foo, conditions:"firstName = 'Maria'"});
  
  var records = MyApp.store.findAll(q);
  equals(records.get('length'), 0, 'record length should be 0');
  
  var recordsToLoad = [
    { guid: 20, firstName: "Maria", lastName: "Johnson" }
  ];
  
  MyApp.store.loadRecords(MyApp.Foo, recordsToLoad);
  SC.RunLoop.end();
  
  equals(records.get('length'), 1, 'record length should be 1');
  
  equals(records.objectAt(0).get('firstName'), 'Maria', 'name should be Maria');
  
});

notest("Changing a record should make it show up in RecordArrays based on SC.Query", function() {
  
  SC.RunLoop.begin();
  
  var q = SC.Query.create({recordType: MyApp.Foo, conditions:"firstName = 'Maria'"});
  
  var records = MyApp.store.findAll(q);
  equals(records.get('length'), 0, 'record length should be 0');
  
  var record = MyApp.store.find(MyApp.Foo, 1);
  record.set('firstName', 'Maria');
  
  SC.RunLoop.end();
  
  equals(records.get('length'), 1, 'record length should be 1');
  
  equals(records.objectAt(0).get('firstName'), 'Maria', 'name should be Maria');
  
});

notest("Deleting a record should make the RecordArray based on SC.Query update accordingly", function() {
  
  SC.RunLoop.begin();
  var q = SC.Query.create({recordType: MyApp.Foo, conditions:"firstName = 'John'"});
  
  var records = MyApp.store.findAll(q);
  equals(records.get('length'), 1, 'record length should be 1');
  
  MyApp.store.destroyRecord(MyApp.Foo, 1);
  SC.RunLoop.end();
  
  equals(records.get('length'), 0, 'record length should be 0');
  
});

notest("Using findAll with SC.Query on store with no data source should work", function() {
  
  SC.RunLoop.begin();
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
  
  SC.RunLoop.end();
  
  equals(records.get('length'), 2, 'record length should be 2');
  
});

notest("Using orderBy in SC.Query returned from findAll()", function() {
  
  var q = SC.Query.create({recordType: MyApp.Foo, orderBy:"firstName ASC"});
  
  var records = MyApp.store.findAll(q);
  equals(records.get('length'), 5, 'record length should be 5');
  
  same(records.getEach('firstName'), ["Bert", "Emily", "Jane", "John", "Johnny"], 'first name should be properly sorted');
  
});

notest("Using orderBy in SC.Query returned from findAll() and loading more records to original store key array", function() {
  
  SC.RunLoop.begin();
  var q = SC.Query.create({recordType: MyApp.Foo, orderBy:"firstName ASC"});
  
  var records = MyApp.store.findAll(q);
  equals(records.get('length'), 5, 'record length should be 5');
  
  equals(records.objectAt(0).get('firstName'), 'Bert', 'name should be Bert');
  equals(records.objectAt(4).get('firstName'), 'Johnny', 'name should be Johnny');
  
  var newStoreKeys2 = MyApp.store.loadRecords(MyApp.Foo, [
    { guid: 11, firstName: "Anna", lastName: "Petterson" }
  ]);
  
  MyApp.DataSource.storeKeys.replace(0,0,newStoreKeys2);
  SC.RunLoop.end();
  
  equals(records.objectAt(0).get('firstName'), 'Anna', 'name should be Anna');
  equals(records.objectAt(1).get('firstName'), 'Bert', 'name should be Bert');
  equals(records.objectAt(5).get('firstName'), 'Johnny', 'name should be Johnny');
  
});


notest("Using orderBy in SC.Query and loading more records to the store", function() {
  
  SC.RunLoop.begin();
  var q = SC.Query.create({recordType: MyApp.Foo, orderBy:"firstName ASC"});
  
  var records = MyApp.store.findAll(q);
  equals(records.get('length'), 5, 'record length should be 5');
  equals(records.objectAt(0).get('firstName'), 'Bert', 'name should be Bert');
  
  MyApp.store.loadRecords(MyApp.Foo, [
    { guid: 11, firstName: "Anna", lastName: "Petterson" }
  ]);
  SC.RunLoop.end();
  
  equals(records.get('length'), 6, 'record length should be 6');
  
  equals(records.objectAt(0).get('firstName'), 'Anna', 'name should be Anna');
  equals(records.objectAt(5).get('firstName'), 'Johnny', 'name should be Johnny');
  
});

notest("Chaining findAll() queries", function() {
  
  var q = SC.Query.create({recordType: MyApp.Foo, conditions:"lastName='Doe'"});
  
  var records = MyApp.store.findAll(q);
  equals(records.get('length'), 2, 'record length should be 2');
  
  var q2 = SC.Query.create({recordType: MyApp.Foo, conditions:"firstName='John'"});
  
  var records2 = records.findAll(q2);
  
  equals(records2.get('length'), 1, 'record length should be 1');
  
  equals(records2.objectAt(0).get('firstName'), 'John', 'name should be John');
  
});

notest("Chaining findAll() queries and loading more records", function() {
  
  SC.RunLoop.begin();
  var q = SC.Query.create({recordType: MyApp.Foo, conditions:"lastName='Doe'"});
  var q2 = SC.Query.create({recordType: MyApp.Foo, conditions:"firstName='John'"});
  
  var records = MyApp.store.findAll(q).findAll(q2);
  equals(records.get('length'), 1, 'record length should be 1');
  
  MyApp.store.loadRecords(MyApp.Foo, [
    { guid: 11, firstName: "John", lastName: "Doe" }
  ]);
  SC.RunLoop.end();
  
  equals(records.get('length'), 2, 'record length should be 2');
  
});


module("create record");

notest("creating record appears in future findAll", function() {
  var Rec = SC.Record.extend({ title: SC.Record.attr(String) });
  var store = SC.Store.create();
  SC.run(function() {
    store.loadRecords(Rec, 
      [{ title: "A", guid: 1 }, { title: "B", guid: 2 }]);
  });
  
  equals(store.findAll(Rec).get('length'), 2, 'should have two initial record');

  var r;
  
  SC.run(function() {
    store.createRecord(Rec, { title: "C" });
    r = store.findAll(Rec);
    equals(r.get('length'), 3, 'should return additional record');
  });

  r = store.findAll(Rec);
  equals(r.get('length'), 3, 'should return additional record');
  
});