// ========================================================================
// SC.isEqual Tests
// ========================================================================
/*globals module test */

var StringA, StringB, StringC;

module("String's - isEqual", {
	
	setup: function(){
	StringA = "Hello";
	StringB = "Hi";
	StringC = "Hello";
    }

});

test("strings should be equal ",function(){
	equals(SC.isEqual(StringA,StringB),false);
	equals(SC.isEqual(StringA,StringC),true);
});

var num1, num2, num3;

module("Number's - isEqual",{
 
     setup: function(){
	 num1 = 24;
	 num2 = 24;
	 num3 = 21;
     }

});
 
test("numericals should be equal ",function(){
    equals(SC.isEqual(num1,num2),true);
	equals(SC.isEqual(num1,num3),false);
}); 

var objectA,objectB, objectC; //global variables

module("Array's - isEqual",{
	
	setup: function(){
	objectA = [1,2];
	objectB = [1,2];
	objectC = [1];	
	}
	
});
	
test("array should be equal  ",function(){
	// NOTE: We don't test for array contents -- that would be too expensive.
	equals(SC.isEqual(objectA,objectB),false, 'two array instances with the same values should not be equal');
	equals(SC.isEqual(objectA,objectC),false, 'two array instances with different values should not be equal');
});	



	
