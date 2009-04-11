// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Apple, Inc. and contributors.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/*global module test equals context ok same notest */

var set ;
module("SC.IndexSet#contains", {
  setup: function() {
    set = SC.IndexSet.create().add(1000, 10).add(2000,1);
  }
});

test("handle index in set", function() {
  equals(set.contains(1001), YES, 'index 1001 should be in set %@'.fmt(set));
  equals(set.contains(1009), YES, 'index 1009 should be in set %@'.fmt(set));
  equals(set.contains(2000), YES, 'index 2000 should be in set %@'.fmt(set));
});

test("handle index not in set", function() {
  equals(set.contains(0), NO, 'index 0 should not be in set');
  equals(set.contains(10), NO, 'index 10 should not be in set');
  equals(set.contains(1100), NO, 'index 1100 should not be in set');
});

test("handle index past end of set", function() {
  equals(set.contains(3000), NO, 'index 3000 should not be in set');
});

