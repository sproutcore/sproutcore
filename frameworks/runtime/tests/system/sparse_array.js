// ========================================================================
// SC.SparseArray Tests
// ========================================================================
/*globals module test ok isObj equals expects */
var objectA = 23, objectB = 12, objectC = 31;
module("SC.SparseArray") ;

test("new SparseArray has expected length", function() {
  var ary = SC.SparseArray.create(10000) ;
  equals(10000, ary.get('length'), "length") ;
});

test("fetching the index of the object", function() {
	var ary = SC.SparseArray.create(10);
	var arr = ["I'll","be","there","4u"];
	ary = arr;
	equals(2 ,ary.indexOf('there'), "Index of 'there' is");
});

test("fetching the index of objects absent from the array", function() {
	var ary = SC.SparseArray.create(6);
	ary = ["you","give","love","a","bad","name"];
	equals(-1, ary.indexOf("bon"), "Index for objects out of bounds");
});

test("creating a clone of a sparse array", function() {
	var ary = SC.SparseArray.create(10);
	var arr = ["captain","crash","and","the","beauty","queen","from","Mars"];
	ary = arr;
	// var cpy = ary.clone();
});

test("Update the sparse array using provideContentAtIndex", function() {
	var ary = SC.SparseArray.create(2);
	var obj = "not";
	ary.provideContentAtIndex(0, obj);
	equals(obj, ary._sa_content[0],"Content at 0th index");
	obj = "now";
	ary.provideContentAtIndex(1, obj);
	equals(obj, ary._sa_content[1],"Content at 1st index");
	obj = "ever";
	ary.provideContentAtIndex(1, obj);
	equals(obj, ary._sa_content[1],"Updating the 1st index");
});

test("Updating the array beyond its limits using provideContentAtIndex", function() {
	var ary = SC.SparseArray.create(2);
	var obj = "hula";
	var ret = ary.provideContentAtIndex(2, obj);
	equals(2, ary.length, "Sparse array length");
	equals(obj, ary._sa_content[2],"Checking the third index");
});

test("flush() should remove the sparse array content",function(){
	var spArray = SC.SparseArray.create(3) ;
	obj = 'value1';
	obj1 = 'value2';
	obj2 = 'value3';
	spArray.provideContentAtIndex(0,obj);
	spArray.provideContentAtIndex(1,obj);
	spArray.provideContentAtIndex(2,obj);
	spArray.flush();
	equals(null,spArray._sa_content);
});

test("objectAt() should get the object at the specified index",function() {
	var spArray = SC.SparseArray.create(4) ;
	var arr = [SC.Object.create({ dummy: YES }),"Sproutcore",2,true];
	spArray = arr;
	equals(4,spArray.length,'the length');
	equals(arr[0],spArray.objectAt(0),'first object');
	equals(arr[1],spArray.objectAt(1),'second object');
	equals(arr[2],spArray.objectAt(2),'third object');
	equals(arr[3],spArray.objectAt(3),'fourth object');
});

test("objectAt() should get the object at an index outside the arrays limits",function() {
	var spArray = SC.SparseArray.create(4) ;
	var arr = [SC.Object.create({ dummy: YES }),"Sproutcore",2,true];
	spArray = arr;
	equals(4,spArray.length,'the length');
	equals(null,spArray.objectAt(4),'object at beyond arrays limits');
});

module("SC.replace",{
	setup: function() {
		// create objects
		numbers= [1,2,3] ;
		new_numbers = [4,5,6];
	}
});

test("replace() to replace elements in a sparse arrray", function() {
	var ary = SC.SparseArray.create(5) ;
	equals(5, ary.get('length'), "length") ;
	ary = numbers;
	ary.replace(7,3,new_numbers,"put the new number at idx>len ");
	equals(6, ary.get('length'), "length") ;
	
	var ary1 = SC.SparseArray.create(5) ;
	equals(5, ary1.get('length'), "length") ;
	numbers= [1,2,3] ;
	ary1 = numbers;
	ary1.replace(4,3,new_numbers,"put the new number at idx < len ");
	equals(7, ary1.get('length'), "length") ;
	
	var ary2 = SC.SparseArray.create(5) ;
	equals(5, ary2.get('length'), "length") ;
	numbers= [1,2,3] ;
	ary2 = numbers;
	ary2.replace(2,3,new_numbers,"put the new number overlapping existing numbers ");
	equals(7, ary2.get('length'), "length") ;
	
});


