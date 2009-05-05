// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Apple, Inc. and contributors.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

// test parsing of query string
var store, storeKey, rec1, rec2, rec3, rec4, rec5, MyApp, q;
module("SC.Query comparison/ordering of records", {
  setup: function() {
    // setup dummy app and store
    MyApp = SC.Object.create({
      store: SC.Store.create()
    });
    
    // setup a dummy model
    MyApp.Foo = SC.Record.extend({});
    
    // load some data
    MyApp.store.loadRecords(MyApp.Foo, [
      { guid: 1, firstName: "John", lastName: "Doe", year: 1974 },
      { guid: 2, firstName: "Jane", lastName: "Doe", year: 1975 },
      { guid: 3, firstName: "Emily", lastName: "Parker", year: 1975 },
      { guid: 4, firstName: "Johnny", lastName: "Cash" },
      { guid: 5, firstName: "Bert", lastName: "Berthold" }
    ]);
    
    rec1 = MyApp.store.find(MyApp.Foo,1);
    rec2 = MyApp.store.find(MyApp.Foo,2);
    rec3 = MyApp.store.find(MyApp.Foo,3);
    rec4 = MyApp.store.find(MyApp.Foo,4);
    rec5 = MyApp.store.find(MyApp.Foo,5);
    
    
    q = SC.Query.create();
  }
});


// ..........................................................
// TESTS
// 

test("building the order", function() {
  // single property
  q.orderBy = "firstName";
  q.parseQuery();
  equals(q.order[0].propertyName,'firstName'], 'propertyName should be firstName');
  
  // more properties
  q.orderBy = "lastName, firstName";
  q.parseQuery();
  equals(q.order[0].propertyName,'lastName'], 'propertyName should be lastName');
  equals(q.order[1].propertyName,'firstName'], 'propertyName should be firstName');
  
  // more properties with direction
  q.orderBy = "lastName, firstName, year DESC";
  q.parseQuery();
  equals(q.order[0].propertyName,'lastName'], 'propertyName should be lastName');
  equals(q.order[1].propertyName,'firstName'], 'propertyName should be firstName');
  equals(q.order[1].descending,false], 'descending should be false');
  equals(q.order[2].propertyName,'year'], 'propertyName should be year');
  equals(q.order[2].descending,true], 'descending should be true');
});


test("ordering numbers should work", function() {
  
  q.orderBy = "year";
  q.parseQuery();
  ok(q.compare(rec1,rec2) == -1, '1974 should be before 1975');
  
  q.orderBy = "year DESC";
  q.parseQuery();
  ok(q.compare(rec1,rec2) == 1, '1974 should be after 1975 with DESC');
  
  q.orderBy = "year";
  q.parseQuery();
  ok(q.compare(rec2,rec3) == 0, '1975 should equal 1975');
  
}); 


test("ordering strings should work", function() {
  
  q.orderBy = "firstName";
  q.parseQuery();
  ok(q.compare(rec1,rec2) == 1, 'John should be after Jane');
  
  q.orderBy = "firstName DESC";
  q.parseQuery();
  ok(q.compare(rec1,rec2) == -1, 'John should be before Jane with DESC');
  
  q.orderBy = "lastName";
  q.parseQuery();
  ok(q.compare(rec1,rec2) == 0, 'Doe should equal Doe');
  
}); 
  
