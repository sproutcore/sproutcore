// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Apple, Inc. and contributors.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

// This file tests the initial state of the store when it is first created
// either independently or as a chained store.

// ..........................................................
// UTILITIES
// 

var TestDataSource = SC.DataSource.extend({
  
  store: null,
  callCount: 0,
  query: null,
  
  reset: function() { 
    this.store = this.query = null; 
    this.callCount = 0;
  },
  
  prepareQuery: function(store, query) {
    this.store = store ;
    this.query = query;
    this.callCount++;
    query.set('isMarked', YES);
    equals(query.get('isFrozen'), NO, 'query should not be frozen yet');
  },
  
  equals: function(store, query, callCount, desc) {
    if (desc===undefined && (typeof callCount === 'string')) {
      desc = callCount;  callCount = undefined;
    }
    if (callCount === undefined) callCount = 1 ; // assume one call
    if (desc === undefined) desc = '';
    
    equals(this.store, store, desc + ':store');
    equals(this.query, query, desc + ':query');
    equals(this.callCount, callCount, desc + ':callCount');
  }
});

var TestRecord = SC.Record.extend();
var TestRecord2 = SC.Record.extend();

function queryEquals(q, recordType, conditions, extra, desc) {
  if (desc===undefined && typeof extra === 'string') {
    desc = extra;  extra = undefined ;
  }
  if (!desc) desc = '';
  
  ok(!!q, desc + ': should have a query');
  if (q) {
    if (recordType && recordType.isEnumerable) {
      equals(q.get('recordTypes'), recordType, desc + ': should have recordTypes (plural)');
    } else {
      equals(q.get('recordType'), recordType, desc + ': should have recordType (singular)');
    }
    
    equals(q.get('conditions'), conditions, desc + ': should have conditions');
    
    equals(q.get('isFrozen'), YES, desc + ': should be frozen');
    
    if (extra) {
      for (var key in extra) {
        if (!extra.hasOwnProperty(key)) continue;
        equals(q.get(key), extra[key], desc + ': should have extra key ' + key);
      }
    }
  }
} 

// ..........................................................
// queryFor Test
// 

module("SC.Store#queryFor");

test("basic query with just record type", function() {
  var store = SC.Store.create();
  
  var q = store.queryFor(TestRecord);
  queryEquals(q, TestRecord, null, 'first query');
  
  var q1 = store.queryFor(TestRecord);
  equals(q1, q, 'second queryFor call should return cached value');
});

test("query with multiple recordtypes", function() {
  
  var store = SC.Store.create();
  var types = [TestRecord, TestRecord2]; 
  
  // create first query
  var q1 = store.queryFor(types);
  queryEquals(q1, types, null, 'first query');
  
  // try again - should get cache
  var q2 = store.queryFor(types);
  equals(q2, q1, 'second queryFor call should return cached value');
  
  // try again - different order
  var q3 = store.queryFor([TestRecord2, TestRecord]);
  equals(q3, q1, 'queryFor with different order of record types should return same cached value');
  
  // try again - using a set
  var set = SC.Set.create().add(TestRecord).add(TestRecord2);
  var q4  = store.queryFor(set);
  equals(q4, q1, 'should return cached query even if using an enumerable for types');
});

test("query with record type and conditions", function() {
  var store = SC.Store.create();
  
  var q1 = store.queryFor(TestRecord, 'foobar');
  queryEquals(q1, TestRecord, 'foobar', 'first query');
  
  var q2 = store.queryFor(TestRecord, 'foobar');
  equals(q2, q1, 'second call to queryFor(TestRecord, foobar) should return cached instance');
  
  var q3 = store.queryFor(TestRecord2, 'foobar');
  queryEquals(q3, TestRecord2, 'foobar', 'query(TestRecord2, foobar)');
  ok(q3 !== q1, 'different recordType same conditions should return new query');
  
  var q4 = store.queryFor(TestRecord, 'baz');
  queryEquals(q4, TestRecord, 'baz', 'query(TestRecord2, baz)');
  ok(q4 !== q1, 'different conditions should return new query');
  
  var q5 = store.queryFor(TestRecord, 'baz');
  equals(q5, q4, 'second call for different conditions should return cache');
});

test("query with no record type and with conditions", function() {
  var store = SC.Store.create();
  
  var q1 = store.queryFor(null, 'foobar');
  queryEquals(q1, null, 'foobar', 'first query');
  
  var q2 = store.queryFor(null, 'foobar');
  equals(q2, q1, 'should return cached value');
});

test("query with recordtype, conditions, and parameters hash", function() {
  var store = SC.Store.create();
  var opts  = { opt1: 'bar', opt2: 'baz' };
  
  var q1 = store.queryFor(TestRecord, 'foo', opts);
  queryEquals(q1, TestRecord, 'foo', opts, 'first query');

  var q2 = store.queryFor(TestRecord, 'foo', opts);
  ok(q1 !== q2, 'second call to queryFor with opts cannot be cached');
  queryEquals(q1, TestRecord, 'foo', opts, 'second query');
});

test("query with recordtype, conditions, and parameters array", function() {
  var store = SC.Store.create();
  var opts  = ['foo', 'bar'];
  
  var q1 = store.queryFor(TestRecord, 'foo', opts);
  queryEquals(q1, TestRecord, 'foo', { parameters: opts }, 'first query should include parameters prop');

  var q2 = store.queryFor(TestRecord, 'foo', opts);
  ok(q1 !== q2, 'second call to queryFor with opts cannot be cached');
  queryEquals(q1, TestRecord, 'foo', { parameters: opts }, 'second query');
});

test("passing query object", function() {
  var store = SC.Store.create();
  var q = store.queryFor(TestRecord);
  
  var q2 = store.queryFor(q);
  equals(q2, q, 'passing a query should just return the query');
});

test("no options (matches everything)", function() {
  var store = SC.Store.create();
  var q1 = store.queryFor(); 
  queryEquals(q1, null, null, 'first query - matches everything');
  
  var q2 = store.queryFor();
  equals(q2, q1, 'should return same cached query');
  
});

test("calling the datasource", function() {
  var source = TestDataSource.create();
  var store = SC.Store.create().from(source);
  
  source.reset();
  var q1 = store.queryFor(TestRecord, 'conditions');
  queryEquals(q1, TestRecord, 'conditions', 'query');
  equals(q1.get('isMarked'), YES, 'query should be modified by data source');
  source.equals(store, q1, 'after first run');
  
  source.reset();
  var q2 = store.queryFor(TestRecord, 'conditions');
  equals(q2, q1, 'should return cached query on second call');
  source.equals(null, null, 0, 'should not call prepareQuery again');
  
  source.reset();
  var q3 = store.queryFor(TestRecord, 'conditions2');
  source.equals(store, q3, 'should call again for another query');
  
});

// ..........................................................
// Test with nested store
// 

// queries do not belong to any particular store in a china.  verify that this 
// is the case.
test("nested store should return same query object as parent store", function() {
  var store = SC.Store.create();
  var q1 = store.queryFor(TestRecord);
  
  var child = store.chain();
  var q2 = child.queryFor(TestRecord);  // test against pre-existing query
  
  var q3 = store.queryFor(TestRecord, 'foo');
  var q4 = child.queryFor(TestRecord, 'foo'); // test against new query
  
  var q5 = child.queryFor(TestRecord, 'baz3'); // new query in child
  var q6 = store.queryFor(TestRecord, 'baz3'); 
  
  equals(q2, q1, 'child should return preexisting cached query');
  equals(q4, q3, 'child should return newly created cached query');
  equals(q6, q5, 'parent should return newly created cached query from child');
});
