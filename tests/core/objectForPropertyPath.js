// ========================================================================
// SC.objectForPropertyPath Tests
// ========================================================================
/*globals module test ok isObj equals expects */

// An ObjectController will make a content object or an array of content objects 
module("SC.objectForPropertyPath") ;

test("should be able to resolve an object on the window", function() {
  var myLocal = window['myGlobal'] = { test: 'this '} ;
  
  isObj(myLocal, { test: 'this '}) ;
  isObj(window['myGlobal'], { test: 'this '}) ;
  
  // verify we can resolve our binding path
  isObj(SC.objectForPropertyPath('myGlobal'), { test: 'this '}) ;
  
  delete g ;
});
