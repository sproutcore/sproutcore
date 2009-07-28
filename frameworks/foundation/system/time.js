// ========================================================================
// SproutCore -- JavaScript Application Framework
// Copyright ©2006-2008, Sprout Systems, Inc. and contributors.
// Portions copyright ©2008 Apple Inc.  All rights reserved.
// ========================================================================

/**
  The time library provides a common way for working with time offsets.

  #1 - Fast, not-chained
  
  t = SC.time.month(123) ;
  
  #2 - Chained
  
  t = SC.time(123).month(3).day(12).year(2003).done();

  t = SC.time(123).month(3) ;
*/
SC.time = function(timeoffset) {
  var ret = SC.beget(fn) ;
  ret.value = timeOffset ;
  return ret ;
} ;

(function() {

  var date = new Date();
  
  SC.mixin(SC.time, /** @scope SC.time @static */ { 

    month: function(offset, newMonth) {
      date.setTime(offset) ;
      if (newMonth === undefined) return date.getMonth() ;
      date.setMonth(newMonth) ;
      return date.getTime() ;
    },
    
    /**
      Converts an offset in local time into an offset in UTC time.
      
      @param {Time} offset the local time offset
      @returns {Time} the new offset
    */
    utc: function(offset) {
      date.setTime(offset) ;
      return offset + (date.getTimezoneOffset()*60*1000);  
    },
    
    local: function(offset) {
      date.setTime(offset) ;
      return offset - (date.getTimezoneOffset()*60*1000);  
    },
    
    parse: function(string) {
      
    },
    
    format: function(offset) {
      
    }

  }) ;
  
})() ;

SC.time.fmt = SC.time.format ;

SC.time.fn = {
  
  done: function() { return this.value ; }
  
} ;

"month day year".split(' ').forEach(function(key) {
  SC.time.fn[key] = function(newTime) {
    if (newTime === undefined) {
      return SC.time[key](this.value);
    } else {
      this.value = SC.time[key](this.value, newTime) ;
      return this ;  
    }
  } ;
}) ;

//-----

// Test.context("test basic Date mapping functions", {
//   "month() should return month, month(value) should set month": function() {
//     //...
//   }
// }) ;
// 
// Test.context("test basic Date mapping functions", (function() {
//   var methods = "month day".split(' ') ;
//   var tests = {} ;
//   methods.forEach(function(name) {
//     var testName = "%@() should return %@, %@(value) should set %@".fmt(name,name,name,name) ;
//     
//     tests[testName] = function() {
//       var date = new Date() ;
//       var time = date.getTime() ;
// 
//       var value = date["get%@".fmt(name.capitalize())]() ;
//       equals(value, SC.time[name](), "get");
//       
//       var value = date["set%@".fmt(name.capitalize())](3).getTime() ;
//       equals(value, SC.time[name](3), "set");
//       
//     } ;
//   });
//   
//   return tests ;
// })()) ;


// Extensions to the Date object. Comes from JavaScript Toolbox at:
// http://www.mattkruse.com/javascript/date/source.html

// ------------------------------------------------------------------
// These functions use the same 'format' strings as the 
// java.text.SimpleDateFormat class, with minor exceptions.
// The format string consists of the following abbreviations:
// 
// Field        | Full Form          | Short Form
// -------------+--------------------+-----------------------
// Year         | yyyy (4 digits)    | yy (2 digits), y (2 or 4 digits)
// Month        | MMM (name or abbr.)| MM (2 digits), M (1 or 2 digits)
//              | NNN (abbr.)        |
// Day of Month | dd (2 digits)      | d (1 or 2 digits)
// Day of Week  | EE (name)          | E (abbr)
// Hour (1-12)  | hh (2 digits)      | h (1 or 2 digits)
// Hour (0-23)  | HH (2 digits)      | H (1 or 2 digits)
// Hour (0-11)  | KK (2 digits)      | K (1 or 2 digits)
// Hour (1-24)  | kk (2 digits)      | k (1 or 2 digits)
// Minute       | mm (2 digits)      | m (1 or 2 digits)
// Second       | ss (2 digits)      | s (1 or 2 digits)
// AM/PM        | a                  |
//
// NOTE THE DIFFERENCE BETWEEN MM and mm! Month=MM, not mm!
// Examples:
//  "MMM d, y" matches: January 01, 2000
//                      Dec 1, 1900
//                      Nov 20, 00
//  "M/d/yy"   matches: 01/20/00
//                      9/2/00
//  "MMM dd, yyyy hh:mm:ssa" matches: "January 01, 2000 12:30:45AM"
// ------------------------------------------------------------------

var MONTH_NAMES=new Array('January','February','March','April','May','June','July','August','September','October','November','December','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec');
var DAY_NAMES=new Array('Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sun','Mon','Tue','Wed','Thu','Fri','Sat');
function LZ(x) {return(x<0||x>9?"":"0")+x;}

SC.Locale.define('en', {
  longMonthNames: 'January February March April May'.split(' '),
  shortMonthNames: [],
  
  shortDateFormat: 'dd/mm/yy',
  longDateFormat: ''
}) ;

SC.mixin(Date,{
  
  // returns the current time as an offset
  now: function() {
    return new Date().getTime() ;
  },
  
  // ------------------------------------------------------------------
  // isDate ( date_string, format_string )
  // Returns true if date string matches format of format string and
  // is a valid date. Else returns false.
  // It is recommended that you trim whitespace around the value before
  // passing it to this function, as whitespace is NOT ignored!
  // ------------------------------------------------------------------
  isDate: function(val,format) {
  	var date = Date.getDateFromFormat(val,format);
  	if (date==0) { return false; }
  	return true;
	},

  // -------------------------------------------------------------------
  // compareDates(date1,date1format,date2,date2format)
  //   Compare two date strings to see which is greater.
  //   Returns:
  //   1 if date1 is greater than date2
  //   0 if date2 is greater than date1 of if they are the same
  //  -1 if either of the dates is in an invalid format
  // -------------------------------------------------------------------
  compareDates: function(date1,dateformat1,date2,dateformat2) {
  	var d1= Date.getDateFromFormat(date1,dateformat1);
  	var d2= Date.getDateFromFormat(date2,dateformat2);
  	if (d1==0 || d2==0) {
  		return -1;
  		}
  	else if (d1 > d2) {
  		return 1;
  		}
  	return 0;
	},
	
  // ------------------------------------------------------------------
  // getDateFromFormat( date_string , format_string )
  //
  // This function takes a date string and a format string. It matches
  // If the date string matches the format string, it returns the 
  // getTime() of the date. If it does not match, it returns 0.
  // ------------------------------------------------------------------
  getDateFromFormat: function(val,format) {
  	val=val+"";
  	format=format+"";
  	var i_val=0;
  	var i_format=0;
  	var c="";
  	var token="";
  	var token2="";
  	var x,y;
  	var now=new Date();
  	var year=now.getFullYear();
  	var month=now.getMonth()+1;
  	var date=1;
  	var hh=now.getHours();
  	var mm=now.getMinutes();
  	var ss=now.getSeconds();
  	var ampm="";

    var locale = SC.Locale.currentLocale; 

  	while (i_format < format.length) {
  		// Get next token from format string
  		c=format.charAt(i_format);
  		token="";
  		while ((format.charAt(i_format)==c) && (i_format < format.length)) {
  			token += format.charAt(i_format++);
  			}
  		// Extract contents of value based on format token
  		if (token=="yyyy" || token=="yy" || token=="y") {
  			if (token=="yyyy") { x=4;y=4; }
  			if (token=="yy")   { x=2;y=2; }
  			if (token=="y")    { x=2;y=4; }
  			year=Date._getInt(val,i_val,x,y);
  			if (year==null) { return 0; }
  			i_val += year.length;
  			if (year.length==2) {
  				if (year > 70) { year=1900+(year-0); }
  				else { year=2000+(year-0); }
  				}
  			}
  		else if (token=="MMM"||token=="NNN"){
  			month=0;
  			for (var i=0; i<MONTH_NAMES.length; i++) {
  				var month_name=MONTH_NAMES[i];
  				if (val.substring(i_val,i_val+month_name.length).toLowerCase()==month_name.toLowerCase()) {
  					if (token=="MMM"||(token=="NNN"&&i>11)) {
  						month=i+1;
  						if (month>12) { month -= 12; }
  						i_val += month_name.length;
  						break;
  						}
  					}
  				}
  			if ((month < 1)||(month>12)){return 0;}
  			}
  		else if (token=="EE"||token=="E"){
  			for (var i=0; i<DAY_NAMES.length; i++) {
  				var day_name=DAY_NAMES[i];
  				if (val.substring(i_val,i_val+day_name.length).toLowerCase()==day_name.toLowerCase()) {
  					i_val += day_name.length;
  					break;
  					}
  				}
  			}
  		else if (token=="MM"||token=="M") {
  			month=Date._getInt(val,i_val,token.length,2);
  			if(month==null||(month<1)||(month>12)){return 0;}
  			i_val+=month.length;}
  		else if (token=="dd"||token=="d") {
  			date=Date._getInt(val,i_val,token.length,2);
  			if(date==null||(date<1)||(date>31)){return 0;}
  			i_val+=date.length;}
  		else if (token=="hh"||token=="h") {
  			hh=Date._getInt(val,i_val,token.length,2);
  			if(hh==null||(hh<1)||(hh>12)){return 0;}
  			i_val+=hh.length;}
  		else if (token=="HH"||token=="H") {
  			hh=Date._getInt(val,i_val,token.length,2);
  			if(hh==null||(hh<0)||(hh>23)){return 0;}
  			i_val+=hh.length;}
  		else if (token=="KK"||token=="K") {
  			hh=Date._getInt(val,i_val,token.length,2);
  			if(hh==null||(hh<0)||(hh>11)){return 0;}
  			i_val+=hh.length;}
  		else if (token=="kk"||token=="k") {
  			hh=Date._getInt(val,i_val,token.length,2);
  			if(hh==null||(hh<1)||(hh>24)){return 0;}
  			i_val+=hh.length;hh--;}
  		else if (token=="mm"||token=="m") {
  			mm=Date._getInt(val,i_val,token.length,2);
  			if(mm==null||(mm<0)||(mm>59)){return 0;}
  			i_val+=mm.length;}
  		else if (token=="ss"||token=="s") {
  			ss=Date._getInt(val,i_val,token.length,2);
  			if(ss==null||(ss<0)||(ss>59)){return 0;}
  			i_val+=ss.length;}
  		else if (token=="a") {
  			if (val.substring(i_val,i_val+2).toLowerCase()=="am") {ampm="AM";}
  			else if (val.substring(i_val,i_val+2).toLowerCase()=="pm") {ampm="PM";}
  			else {return 0;}
  			i_val+=2;}
  		else {
  			if (val.substring(i_val,i_val+token.length)!=token) {return 0;}
  			else {i_val+=token.length;}
  			}
  		}
  	// If there are any trailing characters left in the value, it doesn't match
  	if (i_val != val.length) { return 0; }
  	// Is date valid for month?
  	if (month==2) {
  		// Check for leap year
  		if ( ( (year%4==0)&&(year%100 != 0) ) || (year%400==0) ) { // leap year
  			if (date > 29){ return 0; }
  			}
  		else { if (date > 28) { return 0; } }
  		}
  	if ((month==4)||(month==6)||(month==9)||(month==11)) {
  		if (date > 30) { return 0; }
  		}
  	// Correct hours value
  	if (hh<12 && ampm=="PM") { hh=hh-0+12; }
  	else if (hh>11 && ampm=="AM") { hh-=12; }
  	var newdate=new Date(year,month-1,date,hh,mm,ss);
  	return newdate.getTime();
  },

  // ------------------------------------------------------------------
  // parseDate( date_string [, prefer_euro_format] )
  //
  // This function takes a date string and tries to match it to a
  // number of possible date formats to get the value. It will try to
  // match against the following international formats, in this order:
  // y-M-d   MMM d, y   MMM d,y   y-MMM-d   d-MMM-y  MMM d
  // M/d/y   M-d-y      M.d.y     MMM-d     M/d      M-d
  // d/M/y   d-M-y      d.M.y     d-MMM     d/M      d-M
  // 
  // Also understands: 
  // 
  // yesterday, today, tomorrow, now
  //
  // A second argument may be passed to instruct the method to search
  // for formats like d/M/y (european format) before M/d/y (American).
  // Returns a Date object or null if no patterns match.
  // ------------------------------------------------------------------
  parseDate: function(val) {
  	var preferEuro=(arguments.length==2)?arguments[1]:false;
  	generalFormats=new Array('E NNN dd HH:mm:ss UTC yyyy','y-M-d','y-M-d','MMM d, y','MMM d,y','y-MMM-d','d-MMM-y','MMM d','d MMM y','d.MMM.y','y MMM d','y.MMM.d');
  	monthFirst=new Array('M/d/y','M-d-y','M.d.y','MMM-d','M/d','M-d');
  	dateFirst =new Array('d/M/y','d-M-y','d.M.y','d-MMM','d/M','d-M');
  	var checkList=new Array('generalFormats',preferEuro?'dateFirst':'monthFirst',preferEuro?'monthFirst':'dateFirst');
  	var d=null;
  	
  	// first look for natural language
  	d = 0 ; var now = new Date().getTime() ;
  	switch(val.toLowerCase()) {
  	  case 'yesterday'.loc():
  	    d = now - (24*60*60*1000) ;
  	    break ;
  	  case 'today'.loc():
  	  case 'now'.loc():
  	    d = now ;
  	    break ;
  	  case 'tomorrow'.loc():
  	    d = now + (24*60*60*1000) ;
  	    break;
  	}
  	if (d>0) return new Date(d) ;
  	
  	for (var i=0; i<checkList.length; i++) {
  		var l=window[checkList[i]];
  		for (var j=0; j<l.length; j++) {
  			d=Date.getDateFromFormat(val,l[j]);
  			if (d==0) d = Date.getDateFromFormat(val,l[j] + ' H:m:s') ;
  			if (d==0) d = Date.getDateFromFormat(val,l[j] + ' h:m:s a') ;
  			if (d!=0) return new Date(d); 
  		}
  	}
  	return null;
  },
  
  // ------------------------------------------------------------------
  // Utility functions for parsing in getDateFromFormat()
  // ------------------------------------------------------------------
  _isInteger: function(val) {
  	var digits="1234567890";
  	for (var i=0; i < val.length; i++) {
  		if (digits.indexOf(val.charAt(i))==-1) { return false; }
  	}
  	return true;
  },
  
  _getInt: function(str,i,minlength,maxlength) {
  	for (var x=maxlength; x>=minlength; x--) {
  		var token=str.substring(i,i+x);
  		if (token.length < minlength) { return null; }
  		if (Date._isInteger(token)) { return token; }
  	}
  	return null;
  }

}) ;

SC.mixin(Date.prototype, {
  
  // ------------------------------------------------------------------
  // formatDate (date_object, format)
  // Returns a date in the output format specified.
  // The format string uses the same abbreviations as in getDateFromFormat()
  // 
  // ------------------------------------------------------------------
  format: function(format) {
  	format=format+"";
    var date = this ;
  	var result="";
  	var i_format=0;
  	var c="";
  	var token="";
  	var y=date.getFullYear()+"";
  	var M=date.getMonth()+1;
  	var d=date.getDate();
  	var E=date.getDay();
  	var H=date.getHours();
  	var m=date.getMinutes();
  	var s=date.getSeconds();
  	var yyyy,yy,MMM,MM,dd,hh,h,mm,ss,ampm,HH,H,KK,K,kk,k;
  	// Convert real date parts into formatted versions
  	var value=new Object();
  	if (y.length < 4) {y=""+(y-0+1900);}
  	value["y"]=""+y;
  	value["yyyy"]=y;
  	value["yy"]=y.substring(2,4);
  	value["M"]=M;
  	value["MM"]=LZ(M);
  	value["MMM"]=MONTH_NAMES[M-1];
  	value["NNN"]=MONTH_NAMES[M+11];
  	value["d"]=d;
  	value["dd"]=LZ(d);
  	value["E"]=DAY_NAMES[E+7];
  	value["EE"]=DAY_NAMES[E];
  	value["H"]=H;
  	value["HH"]=LZ(H);
  	if (H==0){value["h"]=12;}
  	else if (H>12){value["h"]=H-12;}
  	else {value["h"]=H;}
  	value["hh"]=LZ(value["h"]);
  	if (H>11){value["K"]=H-12;} else {value["K"]=H;}
  	value["k"]=H+1;
  	value["KK"]=LZ(value["K"]);
  	value["kk"]=LZ(value["k"]);
  	if (H > 11) { value["a"]="PM"; }
  	else { value["a"]="AM"; }
  	value["m"]=m;
  	value["mm"]=LZ(m);
  	value["s"]=s;
  	value["ss"]=LZ(s);
  	while (i_format < format.length) {
  		c=format.charAt(i_format);
  		token="";
  		while ((format.charAt(i_format)==c) && (i_format < format.length)) {
  			token += format.charAt(i_format++);
  			}
  		if (value[token] != null) { result=result + value[token]; }
  		else { result=result + token; }
  		}
  	return result;
  },
  
  utcFormat: function() { return (new Date(this.getTime() + (this.getTimezoneOffset() * 60 * 1000))).format('E NNN dd HH:mm:ss UTC yyyy'); }

}) ;
