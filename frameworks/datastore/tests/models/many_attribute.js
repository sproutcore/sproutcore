// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Apple Inc. and contributors.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

// test core array-mapping methods for ManyArray with ManyAttribute
var storeKeys, rec;
module("SC.ManyAttribute core methods", {
  setup: function() {
    SC.RunLoop.begin();
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
    
    SC.RunLoop.end();
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

test("getting toMany relation should not change record state", function() {
  equals(rec3.get('status'), SC.Record.READY_CLEAN, 'precond - status should be READY_CLEAN');
  
  var recs = rec3.get('fooMany');
  ok(recs, 'rec3.get(fooMany) should return records');
  equals(rec3.get('status'), SC.Record.READY_CLEAN, 'getting toMany should not change state');
});

test("reading toMany in chained store", function() {
  var recs1, recs2, store, rec3a;
  
  recs1 = rec3.get('fooMany');
  store = MyApp.store.chain();
  
  rec3a = store.find(rec3);
  recs2 = rec3a.get('fooMany');
      
  same(recs2.getEach('storeKey'), recs1.getEach('storeKey'), 'returns arrays from chained and parent should be same');
  ok(recs2 !== recs1, 'returned arrays should not be same instance');
  
});

test("reading a null relation", function() {
  
  // note: rec1 hash has NO array
  equals(rec.readAttribute('fooMany'), null, 'rec1.fooMany attr should be null');
  
  var ret = rec.get('fooMany');
  equals(ret.get('length'), 0, 'rec1.get(fooMany).length should be 0'); 
  same(ret.getEach('storeKey'), [], 'rec1.get(fooMany) should return empty array');
});

// ..........................................................
// WRITING
// 

test("writing to a to-many relationship should update set guids", function() {
  var rec3 = MyApp.store.find(MyApp.Foo, 3);
  equals(rec3.get('id'), 3, 'precond - should find record 3');
  equals(rec3.get('fooMany').objectAt(0), rec, 'should get rec1 instance for rec3.fooMany');
  
  SC.RunLoop.begin();
  rec3.set('fooMany', [rec2, rec4]);
  SC.RunLoop.end();
  
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

test("modifying a toMany array should mark the record as changed", function() {
  var recs = rec3.get('fooMany');
  equals(rec3.get('status'), SC.Record.READY_CLEAN, 'precond - rec3.status should be READY_CLEAN');
  ok(!!rec4, 'precond - rec4 should be defined');
  
  recs.pushObject(rec4);
  equals(rec3.get('status'), SC.Record.READY_DIRTY, 'record status should have changed to dirty');

});

test("modifying a toMany array within a nested store", function() {

  var child = MyApp.store.chain() ; // get a chained store
  var parentFooMany = rec3.get('fooMany'); // base foo many
  
  var childRec3 = child.find(rec3); 
  var childFooMany = childRec3.get('fooMany'); // get the nested fooMany
  
  // save store keys before modifying for easy testing
  var expected = parentFooMany.getEach('storeKey');
  
  // now trying modifying...
  var childRec4 = child.find(rec4);
  equals(childFooMany.get('length'), 2, 'precond - childFooMany should be like parent');
  childFooMany.pushObject(childRec4);
  equals(childFooMany.get('length'), 3, 'childFooMany should have 1 more item');
  
  SC.RunLoop.end(); // allow notifications to process, if there were any...
  
  same(parentFooMany.getEach('storeKey'), expected, 'parent.fooMany should not have changed yet');
  equals(rec3.get('status'), SC.Record.READY_CLEAN, 'parent rec3 should still be READY_CLEAN');
  
  expected = childFooMany.getEach('storeKey'); // update for after commit

  SC.RunLoop.begin();
  child.commitChanges();
  SC.RunLoop.end();
  
  // NOTE: not getting fooMany from parent again also tests changing an array
  // underneath.  Does it clear caches, etc?
  equals(parentFooMany.get('length'), 3, 'parent.fooMany length should have changed');
  same(parentFooMany.getEach('storeKey'), expected, 'parent.fooMany should now have changed form child store');
  equals(rec3.get('status'), SC.Record.READY_DIRTY, 'parent rec3 should now be READY_DIRTY');
  
});

test("should be able to modify an initially empty record", function() {
  
  same(rec.get('fooMany').getEach('storeKey'), [], 'precond - fooMany should be empty');
  rec.get('fooMany').pushObject(rec4);
  same(rec.get('fooMany').getEach('storeKey'), [rec4.get('storeKey')], 'after edit should have new array');
});

