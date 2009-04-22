// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Apple, Inc. and contributors.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

// test core array-mapping methods for RecordArray with RecordAttribute
var storeKeys, rec;
module("SC.RecordAttribute core methods", {
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
      
      // test Array
      anArray: SC.Record.attr(Array),
      
      // test Object
      anObject: SC.Record.attr(Object),
      
      // used to test default value
      defaultValue: SC.Record.attr(String, {
        defaultValue: "default"
      }),
      
      // test toOne relationships
      relatedTo: SC.Record.toOne('MyApp.Foo'),
      
      // test toOne relationship with computed type
      relatedToComputed: SC.Record.toOne(function() {
        // not using .get() to avoid another transform which will 
        // trigger an infinite loop
        return (this.readAttribute('relatedToComputed').indexOf("foo")==0) ? MyApp.Foo : MyApp.Bar;
      })
      
    });
    
    MyApp.Bar = SC.Record.extend({});
    
    storeKeys = MyApp.store.loadRecords(MyApp.Foo, [
      { 
        guid: 'foo1', 
        firstName: "John", 
        lastName: "Doe", 
        date: "2009-03-01T20:30-08:00",
        anArray: ['one', 'two', 'three'],
        anObject: { 'key1': 'value1', 'key2': 'value2' }
      },
      
      { 
        guid: 'foo2', 
        firstName: "Jane", 
        lastName: "Doe", 
        relatedTo: 'foo1',
        anArray: 'notAnArray',
        anObject: 'notAnObject'
      },
      
      { 
        guid: 'foo3', 
        firstName: "Alex", 
        lastName: "Doe", 
        relatedToComputed: 'bar1',
        anArray: ['one', 'two', 'three'],
        anObject: { 'key1': 'value1', 'key2': 'value2' }
      }
      
    ]);
    
    MyApp.store.loadRecords(MyApp.Bar, [
      { guid: 'bar1', city: "Chicago" }
    ]);
    
    rec = MyApp.store.find(MyApp.Foo, 'foo1');
    rec2 = MyApp.store.find(MyApp.Foo, 'foo2');
    
    bar = MyApp.store.find(MyApp.Bar, 'bar1');
    equals(rec.storeKey, storeKeys[0], 'should find record');
    
  }
});

// ..........................................................
// READING
// 

test("pass-through should return builtin value" ,function() {
  equals(rec.get('firstName'), 'John', 'reading prop should get attr value');
});

test("returns default value if underyling value is empty", function() {
  equals(rec.get('defaultValue'), 'default', 'reading prop should return default value');
});

test("naming a key should read alternate attribute", function() {
  equals(rec.get('otherName'), 'John', 'reading prop otherName should get attr from firstName');
});

test("getting an array and object", function() {
  equals(rec.get('anArray').length, 3, 'reading prop anArray should get attr as array');
  equals((typeof rec.get('anObject')), 'object', 'reading prop anObject should get attr as object');
});

test("getting an array and object attributes where underlying value is not", function() {
  equals(rec2.get('anArray').length, 0, 'reading prop anArray should return empty array');
  equals((typeof rec2.get('anObject')), 'object', 'reading prop anObject should return empty object');
});

test("getting toOne relationship should map guid to a real record", function() {
  var rec2 = MyApp.store.find(MyApp.Foo, 'foo2');
  equals(rec2.get('id'), 'foo2', 'precond - should find record 2');
  equals(rec2.get('relatedTo'), rec, 'should get rec1 instance for rec2.relatedTo');
});

test("getting toOne relationship from computed attribute should map guid to a real record", function() {
  var rec3 = MyApp.store.find(MyApp.Foo, 'foo3');
  equals(rec3.get('id'), 'foo3', 'precond - should find record 3');
  equals(rec3.get('relatedToComputed'), bar, 'should get bar1 instance for rec3.relatedToComputed');
});

test("reading date should parse ISO date", function() {
  var d = new Date(1235968200000); // should be proper date
  equals(rec.get('date').toString(), d.toString(), 'should have matched date');
});

// ..........................................................
// WRITING
// 

test("writing pass-through should simply set value", function() {
  rec.set("firstName", "Foo");
  equals(rec.readAttribute("firstName"), "Foo", "should write string");

  rec.set("firstName", 23);
  equals(rec.readAttribute("firstName"), 23, "should write number");

  rec.set("firstName", YES);
  equals(rec.readAttribute("firstName"), YES, "should write bool");
  
});

test("writing a value should override default value", function() {

  equals(rec.get('defaultValue'), 'default', 'precond - returns default');
  rec.set('defaultValue', 'not-default');
  equals(rec.get('defaultValue'), 'not-default', 'newly written value should replace default value');
});

test("writing to a to-one relationship should update set guid", function() {
  var rec2 = MyApp.store.find(MyApp.Foo, 'foo2');
  equals(rec2.get('id'), 'foo2', 'precond - should find record 2');
  equals(rec2.get('relatedTo'), rec, 'precond - should get rec1 instance for rec2.relatedTo');
  
  rec2.set('relatedTo', rec2);
  equals(rec2.readAttribute('relatedTo'), 'foo2', 'should write ID for set record to relatedTo attribute');
});

test("writing to a to-one computed relationship should update set guid", function() {
  var rec3 = MyApp.store.find(MyApp.Foo, 'foo3');
  equals(rec3.get('id'), 'foo3', 'precond - should find record 2');
  equals(rec3.get('relatedToComputed'), bar, 'precond - should get bar1 instance for rec3.relatedToComputed');
  
  rec3.set('relatedToComputed', rec);
  equals(rec3.readAttribute('relatedToComputed'), 'foo1', 'should write ID for set record to relatedTo attribute');
});

test("writing a date should generate an ISO date" ,function() {
  var date = new Date(1238650083966);
  equals(rec.set('date', date), rec, 'returns reciever');
  equals(rec.readAttribute('date'), '2009-04-01T22:28:03-07:00', 'should have new time (%@)'.fmt(date.toString()));
});
