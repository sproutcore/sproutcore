// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

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
