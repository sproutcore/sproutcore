// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Apple, Inc. and contributors.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

var store, child, Foo, json, foo ;
module("SC.Record#storeDidChangeProperties", {
  setup: function() {
    store = SC.Store.create();
    Foo = SC.Record.extend({
      
      // record diagnostic change
      statusCnt: 0,
      statusDidChange: function() {
        this.statusCnt++;
      }.observes('status'),
      
      fooCnt: 0,
      fooDidChange: function() {
        this.fooCnt++;
      }.observes('foo')
      
    });
    
    
    json = { 
      foo: "bar", 
      number: 123,
      bool: YES,
      array: [1,2,3] 
    };
    
    foo = store.createRecord(Foo, json);
    store.writeStatus(foo.storeKey, SC.Record.READY_CLEAN); 
  }
});

function checkPreconditions() {
  equals(foo.statusCnt, 0, 'precond - statusCnt');
  equals(foo.fooCnt, 0, 'precond - fooCnt');
}

function expect(expectedStatusCnt, expectedFooCnt) {
  equals(foo.statusCnt, expectedStatusCnt, 'status should have changed');
  equals(foo.fooCnt, expectedFooCnt, 'foo should have changed');
}

// ..........................................................
// BASIC BEHAVIORS
// 

test("should change status only if statusOnly=YES", function() {
  checkPreconditions();
  
  foo.storeDidChangeProperties(YES);

  expect(1,0);
});


test("should change attrs  & status if statusOnly=NO", function() {
  checkPreconditions();
  
  foo.storeDidChangeProperties(NO);
  
  expect(1,1);
});

// ..........................................................
// VERIFY CALL SCENARIOS
// 

test("editing a clean record should change all", function() {
  checkPreconditions();
  foo.writeAttribute("foo", "bar");
  expect(1,1);
});

test("destroying a record should change all", function() {
  checkPreconditions();
  foo.destroy();
  expect(1,1);
});

test("refreshing a record should change status", function() {
  checkPreconditions();
  foo.refresh();
  expect(1,0);
});

test("committing attribute changes from nested store should change attrs", function() {
  checkPreconditions();
  
  var child = store.chain();
  var foo2 = child.materializeRecord(foo.storeKey);
  foo2.writeAttribute('foo', 'bar');
  
  // no changes should happen yet on foo.
  expect(0,0);
  
  // commit
  child.commitChanges();

  // now changes
  expect(1,1);
});

test("changing attributes on a parent store should notify child store if inherited", function() {
  
  var child = store.chain();
  var oldfoo = foo;
  foo = child.materializeRecord(foo.storeKey);
  equals(child.storeKeyEditState(foo.storeKey), SC.Store.INHERITED, 'precond - foo should be inherited from parent store');
  
  oldfoo.writeAttribute('foo', 'bar');
  
  expect(1,1); // should reflect on child
});

test("changing attributes on a parent store should NOT notify child store if locked", function() {
  
  var child = store.chain();
  var oldfoo = foo;
  foo = child.materializeRecord(foo.storeKey);
  foo.readAttribute('foo');
  equals(child.storeKeyEditState(foo.storeKey), SC.Store.EDITABLE, 'precond - foo should be locked from parent store');
  
  oldfoo.writeAttribute('foo', 'bar');
  
  expect(0,0); // should not reflect on child
  
  // discarding changes should update
  child.discardChanges(); // make it match parent again
  expect(1,1);
});

