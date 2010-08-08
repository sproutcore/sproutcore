// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

var MyApp, foo1, foo2, bar1, bar2, snafu1, snafu2;

module("SC.Polymorphic relationship", {
  setup: function() {
    MyApp = window.MyApp = SC.Object.create({
      store: SC.Store.create()
    });
    
    MyApp.Foo = SC.Record.extend({
      // simple case
      simplePoly: SC.Record.toOneOf(['MyApp.Bar', 'MyApp.Snafu'], {typeKey:'simplePolyType'}),
      simplePolyType: SC.Record.attr(String),
      
      // mapped
      mappedPoly: SC.Record.toOneOf(['MyApp.Bar', 'MyApp.Snafu'], {typeMap:['Bar', 'Snafu'], typeKey:'mappedPolyType'}),
      mappedPolyType: SC.Record.attr(String)
    });
    
    MyApp.Bar = SC.Record.extend();    
    MyApp.Snafu = SC.Record.extend();
    
    // need to add classnames manually because SC._object_className in frameworks/runtime/core.js
    // won't find the objects correctly
    MyApp.Foo._object_className = "MyApp.Foo";
    MyApp.Bar._object_className = "MyApp.Bar";
    MyApp.Snafu._object_className = "MyApp.Snafu";
    
    SC.RunLoop.begin();
    MyApp.store.loadRecords(MyApp.Foo, [
      { 
        guid: 'foo1',
        simplePolyType: 'MyApp.Bar',
        mappedPolyType: 'Bar',
        simplePoly: 1,
        mappedPoly: 1
      },{
        guid: 'foo2',
        simplePolyType: 'MyApp.Snafu',
        mappedPolyType: 'Snafu',
        simplePoly: 1,
        mappedPoly: 1
      }
    ]);
    
    MyApp.store.loadRecords(MyApp.Bar, [
      {
        guid: 1
      },{
        guid: 2
      }
    ]);
    
    
    MyApp.store.loadRecords(MyApp.Snafu, [
      {
        guid: 1
      },{
        guid: 2
      }
    ]);
    
    SC.RunLoop.end();
    
    foo1 = MyApp.store.find(MyApp.Foo, 'foo1');
    foo2 = MyApp.store.find(MyApp.Foo, 'foo2');
    
    bar1 = MyApp.store.find(MyApp.Bar, 1);
    bar2 = MyApp.store.find(MyApp.Bar, 2);
    
    snafu1 = MyApp.store.find(MyApp.Snafu, 1);
    snafu2 = MyApp.store.find(MyApp.Snafu, 2);
  },
  
  teardown: function() {
    MyApp = window.MyApp = foo1 = foo2 = bar1 = bar2 = snafu1 = snafu2 = null;
  }
});

// ..........................................................
// READING
// 

test("polymorphic with key", function() {
  equals(foo1.get('simplePoly'), bar1);
  equals(foo2.get('simplePoly'), snafu1);
});

test("polymorphic with key, map", function() {
  equals(foo1.get('mappedPoly'), bar1, "type attribute mapped to record type");
  equals(foo2.get('mappedPoly'), snafu1, "type attribute mapped to different record type");
});

// ..........................................................
// WRITING
// 

test("polymorphic writing - simple case", function() {
  foo1.set('simplePoly', bar2);
  equals(foo1.get('simplePoly'), bar2, "setting polymorphic attribute to different record of same recordtype");
  equals(foo1.get('simplePolyType'), 'MyApp.Bar', "polymorphic type attribute matches record");
  
  foo1.set('simplePoly', snafu1);
  equals(foo1.get('simplePoly'), snafu1, "setting polymorphic attribute to different recordtype");
  equals(foo1.get('simplePolyType'), 'MyApp.Snafu', "polymorphic type attribute matches different record type");
  
});

test("polymorphic writing - mapped case", function() {
  foo1.set('mappedPoly', bar2);
  equals(foo1.get('mappedPoly'), bar2, "setting polymorphic attribute to different record of same recordtype");
  equals(foo1.get('mappedPolyType'), 'Bar', "polymorphic type attribute matches record");
  
  foo1.set('mappedPoly', snafu1);
  equals(foo1.get('mappedPoly'), snafu1, "setting polymorphic attribute to different recordtype");
  equals(foo1.get('mappedPolyType'), 'Snafu', "polymorphic type attribute matches different record type");
  
});