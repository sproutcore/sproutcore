// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

// test parsing of query string
var store, storeKey, rec1, rec2, rec3, rec4, rec5, rec6, MyApp, q;
module("SC.Query evaluation of records", {
  setup: function() {
    
    SC.RunLoop.begin();
    
    // setup dummy app and store
    MyApp = SC.Object.create({
      store: SC.Store.create()
    });
    
    // setup a dummy model
    MyApp.Foo = SC.Record.extend({});
    
    // load some data
    MyApp.store.loadRecords(MyApp.Foo, [
      { guid: 1, firstName: "John", lastName: "Doe", married: true },
      { guid: 2, firstName: "Jane", lastName: "Doe", married: false },
      { guid: 3, firstName: "Emily", lastName: "Parker", bornIn: 1975, married: true },
      { guid: 4, firstName: "Johnny", lastName: "Cash", married: true },
      { guid: 5, firstName: "Bert", lastName: "Berthold", married: true },
      { guid: 6, firstName: "Ronald", lastName: "Fitzgerald", parents: { father: "Frank", mother: "Nancy" }}
    ]);
    
    rec1 = MyApp.store.find(MyApp.Foo,1);
    rec2 = MyApp.store.find(MyApp.Foo,2);
    rec3 = MyApp.store.find(MyApp.Foo,3);
    rec4 = MyApp.store.find(MyApp.Foo,4);
    rec5 = MyApp.store.find(MyApp.Foo,5);
    rec6 = MyApp.store.find(MyApp.Foo,6);
    

    SC.RunLoop.end();
    
    q = SC.Query.create();
  }
});


// ..........................................................
// RECORD PROPERTIES
// 

test("should get record properties correctly", function() {

  q.conditions = "fakeProp = 'Foo'";
  q.parse();
  equals(q.contains(rec1), false, 'John should not match: fakeProp = "Foo"');
  
  q.conditions = "firstName = 'John'";
  q.parse();
  equals(q.contains(rec1), true, 'John should match: firstName = "John"');
  equals(q.contains(rec2), false, 'Jane should not match: firstName = "John"');

  q.conditions = "parents.father = 'Frank'";
  q.parse();
  equals(q.contains(rec6), true, "Ronald should match: parents.father = 'Frank'");
  equals(q.contains(rec1), false, "John should not match: parents.father = 'Frank'");

  q.conditions = "lastName BEGINS_WITH firstName";
  q.parse();
  equals(q.contains(rec5), true, 'Bert Berthold should match: lastName BEGINS_WITH firstName');
  equals(q.contains(rec2), false, 'Jane Doe should not match: lastName BEGINS_WITH firstName');
  
  q.conditions = "lastName CONTAINS firstName";
  q.parse();
  equals(q.contains(rec5), true, 'Bert Berthold should match: lastName CONTAINS firstName');
  equals(q.contains(rec2), false, 'Jane Doe should not match: lastName CONTAINS firstName');

}); 


test("should handle undefined record properties correctly", function() {
  
  q.conditions = "bornIn = 1975";
  q.parse();
  equals(q.contains(rec3), true, 'record with bornIn set should match');
  equals(q.contains(rec2), false, 'record without bornIn set should not match');
  
  q.conditions = "bornIn = undefined";
  q.parse();
  equals(q.contains(rec3), false, 'record with bornIn set different to null should not match');
  equals(q.contains(rec2), true, 'record without bornIn set should match');
  
}); 

test("should handle boolean correctly", function() {
  
  q.conditions = "married = true";
  q.parse();
  equals(q.contains(rec1), true, 'record with married set should match');
  equals(q.contains(rec2), false, 'record without married set should not match');
  
});
  
