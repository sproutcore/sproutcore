// ========================================================================
// SC.makeArray Tests
// ========================================================================
/*globals module test */

var objectA,objectB,objectC; //global variables

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
	equals(SC.isArray(ret), true) ;  	
	ret = SC.makeArray(numberA);
	equals(SC.isArray(ret),true) ;  	
	ret = SC.makeArray(arrayA);
	equals(SC.isArray(ret),true) ;
});