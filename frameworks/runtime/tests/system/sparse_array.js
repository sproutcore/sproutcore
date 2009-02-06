// ========================================================================
// SC.SparseArray Tests
// ========================================================================
/*globals module test ok isObj equals expects */

module("SC.SparseArray") ;

test("new SparseArray has expected length", function() {
  var ary = SC.SparseArray.create(10000) ;
  equals(10000, ary.get('length'), "length") ;
});

