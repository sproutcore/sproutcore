var object;
module("item type", {
  setup: function() {
     object = SC.Object.create({
	
	    method:function(){
		
	    }
     });
	
  }   
  
});

test("should return the type for the passed item", function() {
	  var a = null;
	  var arr = [1,2,3];
	  var obj = {};
	  
      equals(SC.T_NULL,SC.typeOf(a),"item of type null ");
	  equals(SC.T_ARRAY,SC.typeOf(arr),"item of type array ");		  
	  equals(SC.T_HASH,SC.typeOf(obj),"item of type hash");
	  equals(SC.T_OBJECT,SC.typeOf(object),"item of type object");
	  equals(SC.T_FUNCTION,SC.typeOf(object.method),"item of type function") ;
	  equals(SC.T_CLASS,SC.typeOf(SC.Object),"item of type class");
});

var a,b;
module("none or undefined object type",{
	setup: function() {
		a = null;
		b = undefined; 
  }
});

test("should return true for null and undefined ",function(){
	equals(YES,SC.none(a),"for a null parameter passed  ");
	equals(YES,SC.none(b),"for a undefined parameter passed ");
});