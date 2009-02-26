// ========================================================================
// SC.Validator.Date  Tests
// ========================================================================


var num,da; // global variables

module("SC.Validator.Date");

test("Converts into date if a value is given",function(){
    num = 1234947136000; // represents time in secs
    c = SC.Validator.Date.fieldValueForObject(1234947136000,'','');
    equals(YES,c === "Feb 18, 2009 2:22:16 PM","Number converted to date format");
});

test("Converts into number when date string is given", function(){
    da = "Feb 18, 2009 2:22:16 PM"; // date string
    d = SC.Validator.Date.objectForFieldValue("Feb 18, 2009 2:22:16 PM",'','');
    equals(YES,d === 1234947136000,"Date String compared with value in seconds");
    equals(YES,SC.typeOf(d) == "number","Number is obtained"); 	
});