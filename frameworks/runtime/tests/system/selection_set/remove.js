// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Apple Inc. and contributors.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

var set, array, array2, expected, expected2 ;
module("SC.SelectionSet#remove", {
  setup: function() {
    set = SC.SelectionSet.create();
    array = '0 1 2 3 4 5 6 7 8 9'.w();
    array2 = 'a b c d e f g h i k l m'.w();
    
    expected = SC.IndexSet.create(4,3);
    expected2 = SC.IndexSet.create(1);
    expected.source = array;
    expected2.source = array2;
  }
});

/* 
  validates that the selection set has the expected content.  pass index sets
  with sources set appropriately.  The order of the array is not important.
*/
function validate(set, expected, defaultSource) {
  var sources = set.get('sources'),
      len  = expected.length,
      idx, cur, actual ;
      
  equals(sources.length, expected.length, 'should have same number of sources (actual sources: %@)'.fmt(sources));  
  
  for(idx=0;idx<len;idx++) {
    cur = expected[idx];
    if (!cur.source) cur.source =defaultSource; 
    actual = set.indexSetForSource(cur.source, NO);
    ok(actual, 'should have indexSet for source: %@'.fmt(cur.source));
    equals(actual.source, cur.source, 'indexSet.source should match source');
    ok(actual.isEqual(cur), 'indexSet should match for source %@ (actual: %@ expected: %@)'.fmt(cur.source, actual, cur));
  }
}
// ..........................................................
// BASIC REMOVES
// 

test("Removed indexes for single source", function() {
  set.add(array, 4, 3);
  validate(set, [SC.IndexSet.create(4,3)], array); // precondition

  set.remove(array, 4, 1);
  validate(set, [SC.IndexSet.create(5,2)], array);
});

test("Removed multiple sources", function() {
  
  set.add(array, 4, 3).add(array2, 1);
  validate(set, [expected, expected2]); // precondition

  set.remove(array, 4,1).remove(array2, 1);
  expected.remove(4,1);
  validate(set, [expected]); // precondition
});

test("Remove IndexSet with source", function() {
  set.add(array, 4, 3);
  validate(set, [SC.IndexSet.create(4,3)], array); // precondition

  var s = SC.IndexSet.create(4,1);
  s.source = array;
  set.remove(s);
  validate(set, [SC.IndexSet.create(5,2)], array);
});

test("Adding another SelectionSet", function() {
  
  set.add(array, 4, 3).add(array2, 1);
  validate(set, [expected, expected2]); // precondition

  var x = SC.SelectionSet.create().add(array, 4,1).add(array2, 1);
  set.remove(x);
  
  expected.remove(4,1);
  validate(set, [SC.IndexSet.create(5,2)], array);
});




