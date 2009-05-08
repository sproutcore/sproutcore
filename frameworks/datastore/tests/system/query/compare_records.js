// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Apple, Inc. and contributors.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */
 
// test parsing of query string
var store, storeKey, rec1, rec2, rec3, rec4, rec5, MyApp, q;
module("SC.Query comparison of records", {
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
      { guid: 3, firstName: "Emily", lastName: "Parker", year: 1975, active: null },
      { guid: 4, firstName: "Johnny", lastName: "Cash", active: false },
      { guid: 5, firstName: "Bert", lastName: "Berthold", active: true }
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

test("parseQuery should work with conditions = null", function(){
  q.parseQuery();
});
 
test("building the order", function() {
  // undefined orderBy
  q.orderBy = null;
  q.parseQuery();
  equals(q.order.length, 0, 'order should be empty');
  
  // empty orderBy
  q.orderBy = "";
  q.parseQuery();
  equals(q.order.length, 0, 'order should be empty');
  
  // single property
  q.orderBy = "firstName";
  q.parseQuery();
  equals(q.order[0].propertyName,'firstName', 'propertyName should be firstName');
  
  // more properties
  q.orderBy = "lastName, firstName";
  q.parseQuery();
  equals(q.order[0].propertyName,'lastName', 'propertyName should be lastName');
  equals(q.order[1].propertyName,'firstName', 'propertyName should be firstName');
  
  // more properties with direction
  q.orderBy = "lastName, firstName, year DESC";
  q.parseQuery();
  equals(q.order[0].propertyName,'lastName', 'propertyName should be lastName');
  ok(!q.order[0].descending, 'descending should be false');
  equals(q.order[1].propertyName,'firstName', 'propertyName should be firstName');
  ok(!q.order[1].descending, 'descending should be false');
  equals(q.order[2].propertyName,'year', 'propertyName should be year');
  ok(q.order[2].descending, 'descending should be true');
});

test("no order should result in comparison by guid", function() {
  q.orderBy = null;
  q.parseQuery();
  equals(q.compare(rec1,rec2), -1, 'guid 1 should be before guid 2');
});

test("comparing non existant properties", function() {
  q.orderBy = "year";
  q.parseQuery();
  equals(q.compare(rec5,rec1), -1, 'null should be before 1974');
});
 
test("comparing null and boolean properties", function() {
  q.orderBy = "active";
  q.parseQuery();
  equals(q.compare(rec3,rec4), -1, 'null should be before false');
  equals(q.compare(rec4,rec5), -1, 'false should be before true');
});
 
test("comparing number properties", function() {
  q.orderBy = "year";
  q.parseQuery();
  equals(q.compare(rec1,rec2), -1, '1974 should be before 1975');
  
  q.orderBy = "year DESC";
  q.parseQuery();
  equals(q.compare(rec1,rec2), 1, '1974 should be after 1975 with DESC');
}); 
 
 
test("comparing string properties", function() {
  q.orderBy = "firstName";
  q.parseQuery();
  equals(q.compare(rec1,rec2), 1, 'John should be after Jane');
  
  q.orderBy = "firstName DESC";
  q.parseQuery();
  equals(q.compare(rec1,rec2), -1, 'John should be before Jane with DESC');
}); 

test("comparing by equal properties should use guid for order", function() {
  q.orderBy = "lastName";
  q.parseQuery();
  equals(q.compare(rec1,rec2), -1, 'guid 1 should be before guid 2');
});