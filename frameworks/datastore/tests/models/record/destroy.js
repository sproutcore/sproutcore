// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Apple, Inc. and contributors.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

var MyFoo = null, callInfo ;
module("SC.Record#destroy", {
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
    MyApp.store.__orig = MyApp.store.destroyRecords;
    MyApp.store.destroyRecords = function(records) {
      callInfo = SC.A(arguments) ; // save method call
      MyApp.store.__orig.apply(MyApp.store, arguments); 
    };
  }
});

test("calling destroy on a newRecord will mark the record as destroyed and calls destroyRecords on the store", function() {
  ok(MyApp.foo.get('newRecord'), 'precond Record.newRecord should be YES');
  ok(MyApp.foo.get('status') !== SC.RECORD_DELETED, 'precond - status is not DELETED');

  MyApp.foo.destroy();

  same(callInfo, [[MyApp.foo]], 'destroyRecords() should not be called');
  equals(MyApp.foo.get('status'), SC.RECORD_DELETED, 'status should be SC.RECORD_DELETED');
});

test("calling destroy on existing record should call destroyRecords() on store", function() {
  MyApp.foo.newRecord = NO; // fake it till you make it
  ok(MyApp.foo.get('status') !== SC.RECORD_DELETED, 'precond - status is not DELETED');

  MyApp.foo.destroy();

  same(callInfo, [[MyApp.foo]], 'destroyRecords() should not be called');
  equals(MyApp.foo.get('status'), SC.RECORD_DELETED, 'status should be SC.RECORD_DELETED');
});

test("calling destroy on a record that is already destroyed should do nothing", function() {

  // destroy once
  MyApp.foo.destroy();
  equals(MyApp.foo.get('status'), SC.RECORD_DELETED, 'status should be SC.RECORD_DELETED');
  callInfo = null ; // reset call info
  
  MyApp.foo.destroy();
  equals(MyApp.foo.get('status'), SC.RECORD_DELETED, 'status should be SC.RECORD_DELETED');
  equals(callInfo, null, 'store.destroyRecords() should not be called');
});

test("should return receiver", function() {
  equals(MyApp.foo.destroy(), MyApp.foo, 'should return receiver');
});

