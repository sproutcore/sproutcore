// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Apple, Inc. and contributors.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

var MyFoo = null, callInfo ;
module("SC.Record#refresh", {
  setup: function() {
    MyApp = SC.Object.create({
      store: SC.Store.create()
    })  ;
  
    MyApp.Foo = SC.Record.extend();
    MyApp.json = { 
      foo: "bar", 
      number: 123,
      bool: YES,
      array: [1,2,3] 
    };
    
    MyApp.foo = MyApp.store.createRecord(MyApp.json, MyApp.Foo);
    
    // modify store so that everytime refreshRecords() is called it updates 
    // callInfo
    callInfo = null ;
    MyApp.store.refreshRecords = function(records) {
      callInfo = SC.A(arguments) ; // save method call
    };
  }
});

test("calling refresh on a newRecord should do nothing", function() {
  ok(MyApp.foo.get('newRecord'), 'precond Record.newRecord should be YES');
  MyApp.foo.refresh();
  equals(callInfo, null, 'refreshRecords() should not be called on parent');
});

test("calling refresh on existing record should call refreshRecords() on store", function() {
  MyApp.foo.newRecord = NO; // fake it till you make it
  MyApp.foo.refresh();
  same(callInfo[0], [MyApp.foo], 'refreshRecords() should be called with record in array as first param');
});

test("should receiver receiver", function() {
  equals(MyApp.foo.refresh(), MyApp.foo, 'should return receiver');
});

