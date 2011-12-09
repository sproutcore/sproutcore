// ========================================================================
// SC.isArray Tests
// ========================================================================
/*globals module test */

var objectA,objectB,objectC, objectD, objectE; //global variables

module("Array Check" , {
	
	setup: function(){
		objectA = [1,2,3];
		objectB = 23;
		objectC = ["Hello","Hi"];
		objectD = "Hello";
		objectE	= {};
	}
});

test("should check if a given object is an array or not " ,function(){
	equals(SC.isArray(objectA),true);
	equals(SC.isArray(objectB),false);
	equals(SC.isArray(objectC),true);
	equals(SC.isArray(objectD),false);
	equals(SC.isArray(objectE),false);
});
