// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test equals context ok same */

module("SC.Validator.Date");

test("Converts into date if a value is given",function(){
    var date = new Date(1234947136000),
        utcDate = new Date(Number(date) + (date.getTimezoneOffset() * 60000)); // Adjust for timezone offset

    var c = SC.Validator.Date.fieldValueForObject(Number(utcDate),'','');
    var expected = "Feb 18, 2009 8:52:16 AM";
    ok(c === expected, "Number converted to date format. Expected: (%@) but got (%@)".fmt(expected, c));
});

test("Converts into number when date string is given", function(){
    var expected = 1234918336000;
    var date = new Date(expected);
    var d = SC.Validator.Date.objectForFieldValue(date.format('NNN d, yyyy h:mm:ss a'),'','');
    ok(d === expected, "Date String compared with value in seconds. Expected: (%@) but got (%@)".fmt(expected, d));
    ok(SC.typeOf(d) == "number", "Number is obtained");
});
