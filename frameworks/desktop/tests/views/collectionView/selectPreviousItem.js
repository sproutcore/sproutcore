// ========================================================================
// SC.CollectionView selectPreviousItem Unit Test
// ========================================================================
/*globals module test ok isObj equals expects */

var array, collectionView ; // global variables

module("CollectionView selectPreviousItem", {
	
	setup: function() {
		array = [{ item:1 }, { item:2 }, { item:3 }, { item:4 }, { item:5 }] ;
		collectionView = SC.CollectionView.create({ content: array }) ;
	}
	
}) ;

test("should select previous item stepby numberOfItems", function() {

	// test stepby numberOfItems for selectPreviousItem
	[1,2,3].map(function(n) {
		for (var idx = array.length - 1; idx >= 0; idx--) {
			// set current selection to array idx
			collectionView.set('selection', [collectionView.get('content').get(idx)]) ;
			
			// perform selectPreviousItem with numberOfItems
			collectionView.selectPreviousItem(false, n) ;

			if (idx >= n) {
				// idx is >= stepby numberOfItems, a selectPreviousItem will be equal to current idx minus stepby numberOfItems
				equals(collectionView.selection[0].item, array[idx-n].item) ;
			} else {
				// idx is < stepby numberOfItems, a selectPreviousItem will be equal to current idx
				equals(collectionView.selection[0].item, array[idx].item) ;
			}
		} ;
	}) ;

}) ;
