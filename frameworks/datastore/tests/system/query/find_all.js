// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Apple, Inc. and contributors.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

// test querying through findAll on the store
var store, storeKey, rec1, rec2, rec3, rec4, rec5, MyApp, q;
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
