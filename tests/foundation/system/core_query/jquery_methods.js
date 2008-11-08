// ========================================================================
// CoreQuery Tests
// ========================================================================

module("CoreQuery-jQuery Compatibility");

test("map() should return value of function", function() {
  // create an array of object to test.
  var values = [1,2,3,4]; 
  var objects = values.map(function(x) { return { value: x }; }) ;
  
  // Now do CoreQuery-style map
  var result = SC.CoreQuery.map(objects, function(x) { return x.value; });
  same(result, values, "return values of result") ;
});

test("map() should exclude null values", function() {
  // create an array of object to test.
  var values = [1,null,3,null]; 
  var objects = values.map(function(x) { return { value: x }; }) ;
  
  // Now do CoreQuery-style map
  var result = SC.CoreQuery.map(objects, function(x) { return x.value; });
  same(result.length, 2, "number of results") ;
  same(result, [1,3], "return values of result") ;
});
