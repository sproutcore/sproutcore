// ========================================================================
// SC.CollectionView selectNextItem Unit Test
// ========================================================================
/*globals module test ok isObj equals expects */

var array, collectionView ; // global variables

module("CollectionView selectNextItem", {
	
	setup: function() {
		array = [{ item:1 }, { item:2 }, { item:3 }, { item:4 }, { item:5 }] ;
		collectionView = SC.CollectionView.create({ content: array }) ;
	},
	
	teardown: function() {
		collectionView: null ;
	}
	
}) ;

test("should select next item stepby numberOfItems", function() {

	// test stepby numberOfItems for selectNextItem
	[1,2,3].map(function(n) {
		var length = array.length;
		
		for (var idx = 0; idx < length; idx++) {
			// set current selection to array idx
			collectionView.set('selection', [collectionView.get('content').get(idx)]) ;
			var c = collectionView.get('selection')[0].item;
			
			// perform selectNextItem with numberOfItems
			collectionView.selectNextItem(false, n) ;

			if (idx < (length - n)) {
				// idx is < length of array minus stepby numberOfItems, a selectNextItem will be equal to current idx plus stepby numberOfItems
				equals(collectionView.selection[0].item, array[idx+n].item, 'selection(%@ of 5) should step forward by n(%@) items'.fmt(c,n)) ;
			} else {
				// idx is > stepby numberOfItems, a selectNextItem will be equal to current idx
				equals(collectionView.selection[0].item, array[idx].item, 'selection(%@ of 5) should try to step forward by n(%@) items'.fmt(c,n)) ;
			}
		} ;
	}) ;

}) ;
