// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Apple, Inc. and contributors.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

// test core array-mapping methods for RecordArray
var storeKeys, rec;
module("SC.RecordArray core methods", {
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
      
      // test toOne relationships
      foo: SC.Record.attr('MyApp.Foo')
      
    });
    
    storeKeys = MyApp.store.loadRecords(MyApp.Foo, [
      { guid: 1, 
        firstName: "John", lastName: "Doe", 
        date: "2009-03-01T20:30-08:00" 
      },
      
      { guid: 2, firstName: "Jane", lastName: "Doe", foo: 1 }
    ]);
    
    rec = MyApp.store.find(MyApp.Foo, 1);
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

test("getting toOne relationship should map guid to a real record", function() {
  var rec2 = MyApp.store.find(MyApp.Foo, 2);
  equals(rec2.get('id'), 2, 'precond - should find record 2');
  equals(rec2.get('foo'), rec, 'should get rec1 instance for rec2.foo');
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
  var rec2 = MyApp.store.find(MyApp.Foo, 2);
  equals(rec2.get('id'), 2, 'precond - should find record 2');
  equals(rec2.get('foo'), rec, 'precond - should get rec1 instance for rec2.foo');
  
  rec2.set('foo', rec2);
  equals(rec2.readAttribute('foo'), 2, 'should write ID for set record to foo attribute');
});

test("writing a date should generate an ISO date" ,function() {
  var date = new Date(1238650083966);
  equals(rec.set('date', date), rec, 'returns reciever');
  equals(rec.readAttribute('date'), '2009-04-01T22:28:03-07:00', 'should have new time (%@)'.fmt(date.toString()));
});
