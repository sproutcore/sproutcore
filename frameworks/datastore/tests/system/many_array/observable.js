// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

// test obserable getPath methods for ManyArray
var store, storeKey, storeId, rec, storeIds, recs, arrayRec;
module("SC.ManyArray obsersable compliance", {
  setup: function() {
    
    // setup dummy app and store
    MyApp = SC.Object.create({
      store: SC.Store.create()
    });
    
    // setup a dummy model
    MyApp.Foo = SC.Record.extend({});
    
    SC.RunLoop.begin();
    
    // load some data
    storeIds = [1,2,3,4];
    MyApp.store.loadRecords(MyApp.Foo, [
      { guid: 1, firstName: "John", lastName: "Doe", age: 32 },
      { guid: 2, firstName: "Jane", lastName: "Doe", age: 30 },
      { guid: 3, firstName: "Emily", lastName: "Parker", age: 7 },
      { guid: 4, firstName: "Johnny", lastName: "Cash", age: 17 },
      { guid: 50, firstName: "Holder", fooMany: storeIds }
    ]);
     
    storeKey = MyApp.store.storeKeyFor(MyApp.Foo, 1);
    
    // get record
    rec = MyApp.store.materializeRecord(storeKey);
    storeId = rec.get('id');
    
    // get many array.
    arrayRec = MyApp.store.materializeRecord(MyApp.store.storeKeyFor(MyApp.Foo, 50));
    
    recs = SC.ManyArray.create({ 
      record: arrayRec,
      propertyName: "fooMany", 
      recordType: MyApp.Foo,
      isEditable: YES
    });
    arrayRec.relationships = [recs]; 
  },
  
  teardown: function() {
    SC.RunLoop.end();
  }
});

// ..........................................................
// get
// 

test("should return a property at a given array index", function() {
  equals(recs.get('1').get('firstName'), "Jane");
});

test("should return a property at a given array index relative to the passed object", function() {
  equals(SC.get(recs, '1').get('firstName'), "Jane");
});


// ..........................................................
// getPath
// 

test("should return a property at a given path relative to the window", function() {
  window.Foo = SC.Object.create({
    Bar: recs
  });

  try {
    equals(SC.getPath('Foo.Bar.1.firstName'), "Jane");
  } finally {
    window.Foo = undefined;
  }
});

test("should return a property at a given path relative to the passed object", function() {
  var foo = SC.Object.create({
    bar: recs
  });

  equals(SC.getPath(foo, 'bar.1.firstName'), "Jane");
});


