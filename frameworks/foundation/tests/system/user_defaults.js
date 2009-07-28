// ========================================================================
// SC.UserDefaults Base Tests
// ========================================================================
/*globals module test ok isObj equals expects */

var obj; //global variables

module("User Defaults",{
 	   
 	  setup: function(){
 	   
 	   obj = SC.Object.create({
 		   bck : 'green'
 	    }); 	
 	}
});



test("To check if the user defaults are stored and read from local storage",function(){
    SC.userDefaults.writeDefault('Back',obj.bck);
    equals(SC.userDefaults.readDefault('Back'), obj.bck, 'should read written property');
});

