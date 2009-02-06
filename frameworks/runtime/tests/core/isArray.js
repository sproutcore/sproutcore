// ========================================================================
// SC.isArray Tests
// ========================================================================
/*globals module test */

var objectA,objectB,objectC; //global variables

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

module("Make Array ", {
  setup: function() {
    var objectA = [1,2,3,4,5] ;  
	var objectC = SC.hashFor(objectA);
	var objectD = null;
	var stringA = "string A" ;		
  }
});

test("should return an array for the object passed ",function(){
	var arrayA  = ['value1','value2'] ;
	var numberA = 100;
	var stringA = "SproutCore" ;
	var obj = {} ;
	var ret = SC.makeArray(obj);
	equals(SC.isArray(ret),true);	
	ret = SC.makeArray(stringA);
	equals(SC.isArray(ret), false) ;  	
	ret = SC.makeArray(numberA);
	equals(SC.isArray(ret),true) ;  	
	ret = SC.makeArray(arrayA);
	equals(SC.isArray(ret),true) ;
});

test("should get a key array for a specified object ",function(){
	var object1 = {};
	
	object1.names = "Rahul";
	object1.age = "23";
	object1.place = "Mangalore";
	
	var object2 = [];
	object2 = SC.keys(object1);
	equals(object2,'names,age,place');
});


