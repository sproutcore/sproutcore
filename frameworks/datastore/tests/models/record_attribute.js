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
      
      firstName: SC.Record.attr(String)
      
    });
    
    storeKeys = MyApp.store.loadRecords(MyApp.Foo, [
      { guid: 1, firstName: "John", lastName: "Doe" }
    ]);
    
    rec = MyApp.store.find(MyApp.Foo, 1);
    equals(rec.storeKey, storeKeys[0], 'should find record');
  }
});

test("pass-through should return builtin value" ,function() {
  equals(rec.get('firstName'), 'John', 'reading prop should get attr value');
});

