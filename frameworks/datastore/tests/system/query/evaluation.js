// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Apple, Inc. and contributors.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

// test parsing of query string
var q;
module("SC.Query evaluation", {
  setup: function() {  
    q = SC.Query.create();
  }
});


// ..........................................................
// PRIMITIVES
// 

test("should evaluate all primitives", function() {
  
  // null
  q.queryString = "null";
  q.parseQuery();
  ok(q.tokenTree.evaluate() == null, 'null should be null');
  
  // undefined
  q.queryString = "undefined";
  q.parseQuery();
  ok(q.tokenTree.evaluate() == null, 'undefined should be null');
  
  // true
  q.queryString = "true";
  q.parseQuery();
  ok(q.tokenTree.evaluate() == true, 'true should be true');
  
  // false
  q.queryString = "false";
  q.parseQuery();
  ok(q.tokenTree.evaluate() == false, 'false should be false');
  
  // integer
  q.queryString = "1";
  q.parseQuery();
  ok(q.tokenTree.evaluate() == 1, '1 should be 1');
  
  // float
  q.queryString = "1.5";
  q.parseQuery();
  ok(q.tokenTree.evaluate() == 1.5, '1.5 should be 1.5');
  
  // string
  q.queryString = "'Hyperion'";
  q.parseQuery();
  ok(q.tokenTree.evaluate() == 'Hyperion', "'Hyperion' should be 'Hyperion'");
  
});

// ..........................................................
// COMPARATORS
// 

test("should evaluate all comparators", function() {
  
  q.queryString = "true = true";
  q.parseQuery();
  ok(q.tokenTree.evaluate() == true, 'true = true should be true');
  
  q.queryString = "true = false";
  q.parseQuery();
  ok(q.tokenTree.evaluate() == false, 'true = false should be false');
  
  q.queryString = "false != true";
  q.parseQuery();
  ok(q.tokenTree.evaluate() == true, 'false != true should be true');
  
  q.queryString = "1 < 1.2";
  q.parseQuery();
  ok(q.tokenTree.evaluate() == true, '1 < 1.2 should be true');
  
  q.queryString = "1.1 <= 1.2";
  q.parseQuery();
  ok(q.tokenTree.evaluate() == true, '1.1 <= 1.2 should be true');
  
  q.queryString = "1.2 <= 1.2";
  q.parseQuery();
  ok(q.tokenTree.evaluate() == true, '1.2 <= 1.2 should be true');
  
  q.queryString = "1.1 > 1.2";
  q.parseQuery();
  ok(q.tokenTree.evaluate() == false, '1.1 > 1.2 should be false');
  
  q.queryString = "1.3 >= 1.2";
  q.parseQuery();
  ok(q.tokenTree.evaluate() == true, '1.3 >= 1.2 should be true');
  
  q.queryString = "'Tea pot' BEGINS_WITH 'Tea'";
  q.parseQuery();
  ok(q.tokenTree.evaluate() == true, "'Tea pot' BEGINS_WITH 'Tea' should be true");
  
  q.queryString = "'Tea pot' BEGINS_WITH 'Coffee'";
  q.parseQuery();
  ok(q.tokenTree.evaluate() == false, "'Tea pot' BEGINS_WITH 'Coffee' should be false");
  
  q.queryString = "'Tea pot' ENDS_WITH 'a pot'";
  q.parseQuery();
  ok(q.tokenTree.evaluate() == true, "'Tea pot' ENDS_WITH 'a pot' should be true");
  
  q.queryString = "'Tea pot' ENDS_WITH 'a cup'";
  q.parseQuery();
  ok(q.tokenTree.evaluate() == false, "'Tea pot' ENDS_WITH 'a cup' should be false");
  
  q.queryString = "'Tea pot' MATCHES {myCup}";
  q.parseQuery();
  ok(q.tokenTree.evaluate(null,{myCup: /a\sp/}) == true, "'Tea pot' MATCHES /a\sp/ should be true");
  
  q.queryString = "'Tea pot' MATCHES {myCup}";
  q.parseQuery();
  ok(q.tokenTree.evaluate(null,{myCup: /ap/}) == false, "'Tea pot' MATCHES /ap/ should be false");
  
  q.queryString = "'Veterano' ANY {drinks}";
  q.parseQuery();
  ok(q.tokenTree.evaluate(null,{drinks: ['Tempranillo','Bacardi','Veterano']}) == true, "'Veterano' should be in ['Tempranillo','Bacardi','Veterano']");
  
  q.queryString = "'Veterano' ANY {drinks}";
  q.parseQuery();
  ok(q.tokenTree.evaluate(null,{drinks: ['soda','water']}) == false, "'Veterano' should not be in ['soda','water']");
}); 
  

// ..........................................................
// BOOLEAN OPERATORS
// 

test("boolean operators should work", function() {
  
  // here we see a limitation of the tree builder:
  // boolean values like true are considered to be a primitive
  // and boolean operators only accept comparators as arguments,
  // so "true AND true" will not parse into a tree!
  // hence i used a small hack here
  
  q.queryString = "1=1 AND 1=1";
  q.parseQuery();
  ok(q.tokenTree.evaluate() == true, "true AND true should be true");
  
  q.queryString = "1=1 AND 1=2";
  q.parseQuery();
  ok(q.tokenTree.evaluate() == false, "true AND false should be false");
  
  q.queryString = "1=1 OR 1=1";
  q.parseQuery();
  ok(q.tokenTree.evaluate() == true, "true OR true should be true");
  
  q.queryString = "1=2 OR 1=2";
  q.parseQuery();
  ok(q.tokenTree.evaluate() == false, "false OR false should be false");
  
  q.queryString = "NOT 1=1";
  q.parseQuery();
  ok(q.tokenTree.evaluate() == false, "NOT true should be false");
  
});  
  