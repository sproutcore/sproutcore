// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Apple, Inc. and contributors.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

// test parsing of query string
var store, storeKey, rec1, rec2, rec3, rec4, rec5, MyApp, q;
module("SC.Query evaluation of records", {
  setup: function() {
    // setup dummy app and store
    MyApp = SC.Object.create({
      store: SC.Store.create()
    });
    
    // setup a dummy model
    MyApp.Foo = SC.Record.extend({});
    
    // load some data
    MyApp.store.loadRecords(MyApp.Foo, [
      { guid: 1, firstName: "John", lastName: "Doe" },
      { guid: 2, firstName: "Jane", lastName: "Doe" },
      { guid: 3, firstName: "Emily", lastName: "Parker" },
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
// RECORD PROPERTIES
// 

test("should get record properties correctly", function() {
  
  q.queryString = "firstName = 'John'";
  q.parseQuery();
  ok(q.tokenTree.evaluate(rec1) == true, 'John should be in');
  ok(q.tokenTree.evaluate(rec2) == false, 'Jane should be out');
  
  q.queryString = "lastName BEGINS_WITH firstName";
  q.parseQuery();
  ok(q.tokenTree.evaluate(rec5) == true, 'Bert should be in');
  ok(q.tokenTree.evaluate(rec2) == false, 'Jane should be out');

});  
  