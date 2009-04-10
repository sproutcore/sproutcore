// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Apple, Inc. and contributors.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

// test core array-mapping methods for ManyArray with ManyAttribute
var storeKeys, rec;
module("SC.ManyAttribute core methods", {
  setup: function() {

    MyApp = SC.Object.create({
      store: SC.Store.create()
    });
    
    MyApp.Foo = SC.Record.extend({
      
      // test simple reading of a pass-through prop
      firstName: SC.Record.attr(String),

      // test mapping to another internal key
      otherName: SC.Record.attr(String, { key: "firstName" }),
      
      // test mapping Date
      date: SC.Record.attr(Date),
      
      // used to test default value
      defaultValue: SC.Record.attr(String, {
        defaultValue: "default"
      }),
      
      // test toMany relationships
      fooMany: SC.Record.toMany('MyApp.Foo')
      
    });
    
    storeKeys = MyApp.store.loadRecords(MyApp.Foo, [
      { guid: 1, firstName: "John", lastName: "Doe" },
      { guid: 2, firstName: "Jane", lastName: "Doe" },
      { guid: 3, firstName: "Emily", lastName: "Parker", fooMany: [1,2] },
      { guid: 4, firstName: "Johnny", lastName: "Cash" }
    ]);
    
    rec = MyApp.store.find(MyApp.Foo, 1);
    rec2 = MyApp.store.find(MyApp.Foo, 2);
    rec3 = MyApp.store.find(MyApp.Foo, 3);
    rec4 = MyApp.store.find(MyApp.Foo, 4);
    equals(rec.storeKey, storeKeys[0], 'should find record');
  }
});

// ..........................................................
// READING
// 

test("pass-through should return builtin value" ,function() {
  equals(rec.get('firstName'), 'John', 'reading prop should get attr value');
});

test("getting toMany relationship should map guid to real records", function() {
  var rec3 = MyApp.store.find(MyApp.Foo, 3);
  equals(rec3.get('id'), 3, 'precond - should find record 3');
  equals(rec3.get('fooMany').objectAt(0), rec, 'should get rec1 instance for rec3.fooMany');
  equals(rec3.get('fooMany').objectAt(1), rec2, 'should get rec2 instance for rec3.fooMany');
});

// ..........................................................
// WRITING
// 

test("writing to a to-many relationship should update set guids", function() {
  var rec3 = MyApp.store.find(MyApp.Foo, 3);
  equals(rec3.get('id'), 3, 'precond - should find record 3');
  equals(rec3.get('fooMany').objectAt(0), rec, 'should get rec1 instance for rec3.fooMany');
  
  rec3.set('fooMany', [rec2, rec4]);
  equals(rec3.get('fooMany').objectAt(0), rec2, 'should get rec2 instance for rec3.fooMany');
  equals(rec3.get('fooMany').objectAt(1), rec4, 'should get rec2 instance for rec3.fooMany');
});

test("pushing an object to a to-many relationship attribute should update set guids", function() {
  var rec3 = MyApp.store.find(MyApp.Foo, 3);
  equals(rec3.get('id'), 3, 'precond - should find record 3');
  equals(rec3.get('fooMany').length(), 2, 'should be 2 foo instances related');
  
  rec3.get('fooMany').pushObject(rec4);
  
  equals(rec3.get('fooMany').length(), 3, 'should be 3 foo instances related');
  
  equals(rec3.get('fooMany').objectAt(0), rec, 'should get rec instance for rec3.fooMany');
  equals(rec3.get('fooMany').objectAt(1), rec2, 'should get rec2 instance for rec3.fooMany');
  equals(rec3.get('fooMany').objectAt(2), rec4, 'should get rec4 instance for rec3.fooMany');
});
