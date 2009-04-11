// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Apple, Inc. and contributors.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/*global module test equals context ok same notest */
var set ;
module("SC.IndexSet#remote", {
  setup: function() {
    set = SC.IndexSet.create();
  }
});

function iter(s) {
  var ret = [];
  set.forEach(function(k) { ret.push(k); });
  return ret ;
}

// ..........................................................
// BASIC ADDS
// 

test("remove a range after end of set", function() {
  equals(set.get('length'), 0, 'precond - should be empty');  

  set.remove(1000, 5);
  equals(set.get('length'), 0, 'should still be empty');  
  same(iter(set), [], 'should be empty');
});

test("remove range in middle of an existing range", function() {
  set.add(100,4);
  same(iter(set), [100, 101, 102, 103], 'precond - should have range');
  
  set.remove(101,2);
  equals(set.get('length'), 2, 'new length should not include removed range');
  same(iter(set), [100,103], 'should remove range in the middle'); 
  console.log(set.inspect()); 
});

test("remove range overlapping front edge of range", function() {
  set.add(100,2); // add initial set.
  equals(iter(set)[0], 100, 'precond - first index is 100');
  
  // now add second range
  set.remove(99,2);
  equals(set.get('length'), 1, 'should have extra length');
  same(iter(set), [101]);
  console.log(set.inspect()); 
});

test("remove range overlapping last edge of range", function() {
  set.add(100,2).add(200,2); // make sure not last range
  same(iter(set), [100,101,200,201], 'should have two sets');
  
  // now add overlapping range
  set.remove(101,2);
  equals(set.get('length'), 3, 'new set.length');
  same(iter(set), [100,200,201], 'should remove 101-102');
  console.log(set.inspect()); 
});

test("remove range overlapping two ranges, remove parts of both", function() {
  set.add(100,2).add(110,2);
  same(iter(set), [100,101,110,111], 'should have two sets');
  
  // now add overlapping range
  set.remove(101,10);
  equals(set.get('length'), 2, 'new set.length');
  same(iter(set), [100,111], 'should remove range 101-110');
});

test("remove range overlapping three ranges, removing one and parts of the others", function() {
  set.add(100,2).add(105,2).add(110,2);
  same(iter(set), [100,101,105,106,110,111], 'should have two sets');
  
  // now add overlapping range
  set.remove(101,10);
  equals(set.get('length'), 2, 'new set.length');
  same(iter(set), [100,111], 'should remove range 101-110');
});

test("remove range partially overlapping one range and replacing another range", function() {
  set.add(100,2).add(105,2);
  same(iter(set), [100,101,105,106], 'should have two sets');
  
  // now add overlapping range
  set.remove(101,10);
  equals(set.get('length'), 1, 'new set.length');
  console.log(set.inspect());

  same(iter(set), [100], 'should include one range 100-110');
});

test("remove range overlapping last index", function() {
  set.add(100,2); // add initial set.
  equals(iter(set)[0], 100, 'precond - first index is 100');
  
  // now add second range
  set.remove(101,2);
  equals(set.get('length'), 1, 'should have extra length');
  same(iter(set), [100]);
});

test("remove range matching existing range", function() {
  set.add(100,5); // add initial set.
  same(iter(set), [100, 101, 102, 103, 104]);
  
  // now add second range
  set.remove(100,5);
  equals(set.get('length'), 0, 'should be empty');
  same(iter(set), []);  
});


// ..........................................................
// OTHER BEHAVIORS
// 
test("remove a range should trigger an observer notification", function() {
  var callCnt = 0;
  set.add(10, 20);
  
  set.addObserver('[]', function() { callCnt++; });
  set.remove(10,10);
  equals(callCnt, 1, 'should have called observer once');
});

test("removing a non-existant range should not trigger observer notification", function() {
  var callCnt = 0;
  
  set.addObserver('[]', function() { callCnt++; });
  set.remove(10,10); // 10-20 are already empty
  equals(callCnt, 0, 'should NOT have called observer');
});

