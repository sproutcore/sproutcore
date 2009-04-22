// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Apple, Inc. and contributors.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

// test normalize method for SC.Record
var storeKeys, rec;
module("SC.Record normalize method", {
  setup: function() {

    MyApp = SC.Object.create({
      store: SC.Store.create()
    });
    
    MyApp.Foo = SC.Record.extend({
      
      // test simple reading of a pass-through prop
      firstName: SC.Record.attr(String),

      // test Array
      anArray: SC.Record.attr(Array),
      
      // used to test default value
      defaultValue: SC.Record.attr(String, {
        defaultValue: "default"
      }),
      
      // test toOne relationships
      relatedTo: SC.Record.toOne('MyApp.Foo', { defaultValue: '1' })
      
    });
    
    MyApp.Bar = SC.Record.extend({});
    
    storeKeys = MyApp.store.loadRecords(MyApp.Foo, [
      { 
        guid: 'foo1', 
        firstName: 123, 
        anArray: ['one', 'two', 'three']
      },
      
      { 
        guid: 'foo2', 
        firstName: "Jane", 
        relatedTo: 'foo1'
      },
      
      {
        guid: 'foo3'
      }
      
    ]);
    
    rec = MyApp.store.find(MyApp.Foo, 'foo1');
    rec2 = MyApp.store.find(MyApp.Foo, 'foo2');
    rec3 = MyApp.store.find(MyApp.Foo, 'foo3');
    
    equals(rec.storeKey, storeKeys[0], 'should find record');
    
  }
});

// ..........................................................
// NORMALIZING
// 

test("normalizing a pre-populated record" ,function() {
  
  equals(rec.attributes()['firstName'], 123, 'hash value of firstName is 123');
  equals(rec.get('firstName'), '123', 'get value of firstName is 123 string');
  
  rec.normalize();
  
  var sameValue = rec.attributes()['firstName'] === '123';
  
  ok(sameValue, 'hash value of firstName after normalizing is 123 string');
  equals(rec.get('firstName'), '123', 'get value of firstName after normalizing is 123 string');
  
});

test("normalizing an empty record" ,function() {
  
  equals(rec3.attributes()['defaultValue'], undefined, 'hash value of defaultValue is undefined');
  equals(rec3.get('defaultValue'), 'default', 'get value of defaultValue is default');
  
  rec3.normalize();
  
  equals(rec3.attributes()['defaultValue'], 'default', 'hash value of defaultValue after normalizing is default');
  equals(rec3.get('defaultValue'), 'default', 'get value of defaultValue after normalizing is default');
  
});

test("normalizing with includeNull flag" ,function() {
  
  equals(rec3.attributes()['firstName'], undefined, 'hash value of firstName is undefined');
  equals(rec3.get('firstName'), null, 'get value of firstName is null');
  
  rec3.normalize(YES);
  
  equals(rec3.attributes()['firstName'], null, 'hash value of firstName after normalizing is null');
  equals(rec3.get('firstName'), null, 'get value of firstName after normalizing is null');
  
});