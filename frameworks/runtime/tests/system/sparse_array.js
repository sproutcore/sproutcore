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

test("fetching the object at index", function() {
	var ary = SC.SparseArray.create(10);
	var arr = ["I'll","be","there","4u"];
	ary = arr;
	equals(2 ,ary.indexOf('there'), "Index of 'there' is");
});

test("creating a clone of a sparse array", function() {
	var ary = SC.SparseArray.create(10);
	var arr = ["captain","crash","and the","beauty","queen","from Mars"];
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
});

test("SC.flush + sparsh array flushed",function(){
	var spArr = SC.SparseArray.create(3);
	var arr = [1,"hello",true];
	//spArr.flush();
	equals(0,spArr.length,'length of sparse array');
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

module("SC.replace",{
	setup: function() {
		// create objects...
		numbers= [1,2,3] ;
		new_numbers = [4,5,6];
	}
});

test("element to be added is at idx > length of array ", function() {
	var ary = SC.SparseArray.create(5) ;
	equals(5, ary.get('length'), "length") ;
	ary = numbers;
	ary.replace(7,3,new_numbers,"put the new number at idx>len ");
	equals(6, ary.get('length'), "length") ;
});

test("element to be added is such that amt + idx > length of array ", function() {
	var ary = SC.SparseArray.create(5) ;
	equals(5, ary.get('length'), "length") ;
	ary = numbers;
	ary.replace(4,3,new_numbers,"put the new number at idx < len ");
	equals(6, ary.get('length'), "length") ;
});

test("element to be added is at idx > length of array ", function() {
	var ary = SC.SparseArray.create(5) ;
	equals(5, ary.get('length'), "length") ;
	ary = numbers;
	ary.replace(2,3,new_numbers,"put the new number overlapping existing numbers ");
	equals(5, ary.get('length'), "length") ;
});