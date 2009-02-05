// ========================================================================
// SC.CollectionView selectNextItem Unit Test
// ========================================================================
/*globals module test ok isObj equals expects */

var array, collectionView ; // global variables

module("CollectionView selectNextItem", {
	
	setup: function() {
		array = [{ item:1 }, { item:2 }, { item:3 }, { item:4 }, { item:5 }] ;
		collectionView = SC.CollectionView.create({ content: array }) ;
	}
	
}) ;

test("should select next item stepby numberOfItems", function() {

	// test stepby numberOfItems for selectPreviousItem
	[1,2,3].map(function(n) {
		var length = array.length;
		
		for (var idx = 0; idx < length; idx++) {
			// set current selection to array idx
			collectionView.set('selection', [collectionView.get('content').get(idx)]) ;
			
			// perform selectNextItem with numberOfItems
			collectionView.selectNextItem(false, n) ;

			if (idx < (length - n)) {
				// idx is < length of array minus stepby numberOfItems, a selectNextItem will be equal to current idx plus stepby numberOfItems
				equals(collectionView.selection[0].item, array[idx+n].item) ;
			} else {
				// idx is > stepby numberOfItems, a selectNextItem will be equal to current idx
				equals(collectionView.selection[0].item, array[idx].item) ;
			}
		} ;
	}) ;

}) ;
