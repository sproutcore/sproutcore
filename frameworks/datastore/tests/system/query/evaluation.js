// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Apple, Inc. and contributors.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

// test parsing of query string
var store, storeKey, storeId, rec, MyApp, q;
module("SC.Query evaluation", {
  setup: function() {
    // setup dummy app and store
    MyApp = SC.Object.create({
      store: SC.Store.create()
    });
    
    // setup a dummy model
    MyApp.Foo = SC.Record.extend({});
    
    // load some data
    MyApp.store.loadRecords(MyApp.Foo, [
      { guid: 1, firstName: "John", lastName: "Doe" },
      { guid: 2, firstName: "Jane", lastName: "Doe" },
      { guid: 3, firstName: "Emily", lastName: "Parker" },
      { guid: 4, firstName: "Johnny", lastName: "Cash" }
    ]);
    
    storeKey = MyApp.store.storeKeyFor(MyApp.Foo, 1);
    
    // get record
    rec = MyApp.store.materializeRecord(storeKey);
    storeId = rec.get('id');
    
    q = SC.Query.create();
  }
});


// ..........................................................
// COMPARATORS
// 

test("should compare all primitives", function() {
  
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
  // true is considered to be a primitive
  // and boolean operators only accept comparators as arguments,
  // "true AND true" will not parse into a tree!
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
  