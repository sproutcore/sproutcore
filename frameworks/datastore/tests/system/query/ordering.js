// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Apple, Inc. and contributors.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

// test parsing of query string
var v = [], q, c;
module("SC.Query ordering", {
  setup: function() {
    // setup dummy data
    v[0]  = null;
    v[1]  = false;
    v[2]  = true;
    v[3]  = -12;
    v[4]  = 3.5;
    v[5]  = 'a string';
    v[6]  = 'another string';
    v[7]  = 'anöther string';
    v[8]  = [1,2];
    v[9]  = [1,2,3];
    v[10] = [1,3];
    
    q = SC.Query.create();
    c = q.compareObjects;
  }
});


// ..........................................................
// TESTS
// 

test("ordering should work", function() {
  for (var j=0; j < v.length; j++) {
    equals(c(v[j],v[j]), 0, j +' should equal itself');
    for (var i=j+1; i < v.length; i++) {
      equals(c(v[j],v[i]), -1, j + ' should be smaller than ' + i );
    };
    
  };
}); 
  
