// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Apple, Inc. and contributors.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/*global module test equals context ok same */

var set ;
module("SC.IndexSet#add", {
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

// test("add range to end of set", function() {
//   set.add(1000,5);
//   equals(set.get('length'), 5, 'should have correct index count');  
//   console.log(set.inspect());  
//   same(iter(set), [1000,1001,1002,1003,1004]);
// });
// 
// test("add range into middle of empty range", function() {
//   set.add(100,2); // add initial set.
//   equals(iter(set)[0], 100, 'precond - first index is 100');
//   
//   // now add second range
//   set.add(10,1);
//   equals(set.get('length'), 3, 'should have extra length');
//   same(iter(set), [10, 100, 101]);
//   console.log(set.inspect());  
// });

notest("add range over front edge of range", function() {
  set.add(100,2); // add initial set.
  equals(iter(set)[0], 100, 'precond - first index is 100');
  
  // now add second range
  set.add(99,2);
  equals(set.get('length'), 3, 'should have extra length');
  same(iter(set), [99, 100, 101]);
  console.log(set.inspect());  
});

test("add range over middle of last range", function() {
  set.add(100,2); // add initial set.
  equals(iter(set)[0], 100, 'precond - first index is 100');
  
  // now add second range
  set.add(101,2);
  equals(set.get('length'), 3, 'should have extra length');
  same(iter(set), [100, 101, 102]);
  console.log(set.inspect());  
});

// ..........................................................
// OTHER BEHAVIORS
// 
// test("adding a range should trigger an observer notification", function() {
//   var callCnt = 0;
//   set.addObserver('[]', function() { callCnt++; });
//   set.add(10,10);
//   equals(callCnt, 1, 'should have called observer once');
// });
