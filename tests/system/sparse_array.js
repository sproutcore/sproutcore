// ========================================================================
// SC.SparseArray Tests
// ========================================================================

Test.context("SC.SparseArray calls delegate", {
  
  "new SparseArray has expected length": function() {
    var ary = SC.SparseArray.create(10000) ;
    assertEqual(10000, ary.get('length'), "length") ;
  }

});

