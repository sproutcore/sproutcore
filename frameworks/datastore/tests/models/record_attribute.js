// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Apple, Inc. and contributors.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

// test core array-mapping methods for RecordArray
var MyApp, storeKeys, rec;
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
      
      // used to test default value
      defaultValue: SC.Record.attr(String, {
        defaultValue: "default"
      })
      
    });
    
    storeKeys = MyApp.store.loadRecords(MyApp.Foo, [
      { guid: 1, firstName: "John", lastName: "Doe" }
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

