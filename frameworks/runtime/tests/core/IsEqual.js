// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/*globals module test */

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

var objectA,objectB; //global variables

module("Array's - isEqual",{
	
	setup: function(){
	objectA = [1,2];
	objectB = [1,2];
	objectC = [1];	
	}
	
});
	
test("array should be equal on if they were same instance", function(){
	equals(SC.isEqual(objectA,objectB),false);
	equals(SC.isEqual(objectB,objectB),true);
	equals(SC.isEqual(objectA,objectC),false);
	
});	



	
