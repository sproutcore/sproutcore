// ========================================================================
// SC.clone Tests
// ========================================================================
/*globals module test ok isObj equals expects */

module("Clonned Objects", {
  setup: function() {
    
	object = SC.Object.create({
	
	  name:'Cloned Object',
	  value:'value1',
	 
	  clone: function(object) {
	    var ret = object ;
	    switch (SC.typeOf(object)) {
	  
	  	 case SC.T_ARRAY:
	        ret = object.slice() ;
	    	break ;

	     case SC.T_OBJECT:
	        ret = {} ;
	        for(var key in object) ret[key] = object[key] ;
	    }

	    return ret ;
	  }
	});
  }
});


test("should return a cloned object", function() {
	var objectA = [1,2,3,4,5] ;
	var objectB = "SproutCore" ;
	var objectC = SC.hashFor(objectA);	
	var objectE = 100;
	var a = SC.clone(objectA);
	var b = SC.clone(objectA);
	
  	equals(SC.clone(objectB), SC.clone(objectB)) ;
	equals(SC.clone(objectC), SC.clone(objectC)) ;
	equals(SC.clone(objectE), SC.clone(objectE)) ;
	equals(true, SC.isEqual(a,b));
	
});

test("should return cloned object when the object is null", function() {
	var objectD = null;
  	equals(SC.clone(objectD), SC.clone(objectD)) ;
});

test("Condition to test --> else part of case SC.T_ARRAY --> object.slice()", function() {
	var arrayA  = ['value1','value2'] ;
	var resultArray = object.clone(arrayA);
	equals(resultArray[0] == arrayA[0],resultArray[1] == arrayA[1],true);
    	
});

test("Condition to test --> else part of case SC.T_OBJECT ", function() {
	// var obj1 = object;
	// obj2 = object.clone(object);
	// equals(obj2,obj1);
});