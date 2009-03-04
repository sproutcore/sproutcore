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
    SC.userDefaults.readDefault('Back');

   // [Exception... "Security error" code: "1000" nsresult: "0x805303e8 (NS_ERROR_DOM_SECURITY_ERR)" 
   //   location: "http://localhost:4020/static/sproutcore/foundation/en/current/source/system/user_defaults.js?1234934251 Line: 131"]
});

