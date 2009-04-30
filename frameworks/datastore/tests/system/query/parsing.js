// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Apple, Inc. and contributors.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

// test parsing of query string
var q;
module("SC.Query parsing", {
  setup: function() {
    q = SC.Query.create();
  }
});


// ..........................................................
// TOKENIZER
// 

test("should recognize all primitives", function() {
  // PROPERTY
  q.queryString = "what_to_do_now";
  q.parseQuery();
  ok(q.tokenList.length == 1, 'list should have one token');
  equals(q.tokenList[0].tokenType, 'PROPERTY', 'type should be PROPERTY');
  equals(q.tokenList[0].tokenValue, 'what_to_do_now', 'value should be what_to_do_now');
  
  // PROPERTY - one character
  q.queryString = "a";
  q.parseQuery();
  ok(q.tokenList.length == 1, 'list should have one token');
  equals(q.tokenList[0].tokenType, 'PROPERTY', 'type should be PROPERTY');
  equals(q.tokenList[0].tokenValue, 'a', 'value should be "a"');
  
  // BOOLEAN VALUE - false
  q.queryString = "false";
  q.parseQuery();
  ok(q.tokenList.length == 1, 'list should have one token');
  equals(q.tokenList[0].tokenType, 'BOOL_VAL', 'type should be BOOL_VAL');
  equals(q.tokenList[0].tokenValue, 'false', 'value should be false');
  
  // BOOLEAN VALUE - true
  q.queryString = "true";
  q.parseQuery();
  ok(q.tokenList.length == 1, 'list should have one token');
  equals(q.tokenList[0].tokenType, 'BOOL_VAL', 'type should be BOOL_VAL');
  equals(q.tokenList[0].tokenValue, 'true', 'value should be true');
  
  // NULL
  q.queryString = "null undefined";
  q.parseQuery();
  ok(q.tokenList.length == 2, 'list should have 2 tokens');
  equals(q.tokenList[0].tokenType, 'NULL', 'type should be NULL');
  equals(q.tokenList[1].tokenType, 'NULL', 'type should be NULL');
  
  // NUMBER - integer
  q.queryString = "1234";
  q.parseQuery();
  ok(q.tokenList.length == 1, 'list should have one token');
  equals(q.tokenList[0].tokenType, 'NUMBER', 'type should be NUMBER');
  equals(q.tokenList[0].tokenValue, 1234, 'value should be 1234');
  
  // NUMBER - float
  q.queryString = "12.34";
  q.parseQuery();
  ok(q.tokenList.length == 1, 'list should have one token');
  equals(q.tokenList[0].tokenType, 'NUMBER', 'type should be NUMBER');
  equals(q.tokenList[0].tokenValue, 12.34, 'value should be 12.34');
  
  // STRING - single quoted
  q.queryString = "'ultravisitor'";
  q.parseQuery();
  ok(q.tokenList.length == 1, 'list should have one token');
  equals(q.tokenList[0].tokenType, 'STRING', 'type should be STRING');
  equals(q.tokenList[0].tokenValue, 'ultravisitor', 'value should be ultravisitor');
  
  // STRING - double quoted
  q.queryString = '"Feed me weird things"';
  q.parseQuery();
  ok(q.tokenList.length == 1, 'list should have one token');
  equals(q.tokenList[0].tokenType, 'STRING', 'type should be STRING');
  equals(q.tokenList[0].tokenValue, 'Feed me weird things', 'value should be Feed me weird things');

  // STRING - empty
  q.queryString = "''";
  q.parseQuery();
  ok(q.tokenList.length == 1, 'list should have one token');
  equals(q.tokenList[0].tokenType, 'STRING', 'type should be STRING');
  equals(q.tokenList[0].tokenValue, '', 'value should be ""');
  
  // PARAMETER
  q.queryString = "{my_best_friends}";
  q.parseQuery();
  ok(q.tokenList.length == 1, 'list should have one token');
  equals(q.tokenList[0].tokenType, 'PARAMETER', 'type should be PARAMETER');
  equals(q.tokenList[0].tokenValue, 'my_best_friends', 'value should be my_best_friends');
  
  // WILD CARD
  q.queryString = "%@";
  q.parseQuery();
  ok(q.tokenList.length == 1, 'list should have one token');
  equals(q.tokenList[0].tokenType, 'WILD_CARD', 'type should be WILD_CARD');
  equals(q.tokenList[0].tokenValue, 0, 'value should be 0');
  
  // PARENTHESES
  q.queryString = "()";
  q.parseQuery();
  ok(q.tokenList.length == 2, 'list should have two tokens');
  equals(q.tokenList[0].tokenType, 'OPEN_PAREN', 'type should be OPEN_PAREN');
  equals(q.tokenList[1].tokenType, 'CLOSE_PAREN', 'type should be CLOSE_PAREN');
  
  // COMPARATORS
  q.queryString = "= != < <= > >= BEGINS_WITH ENDS_WITH ANY MATCHES";
  q.parseQuery();
  ok(q.tokenList.length == 10, 'list should have 10 tokens');
  equals(q.tokenList[0].tokenType, 'COMPARATOR', 'type should be COMPARATOR');
  equals(q.tokenList[0].tokenValue, '=', 'value should be =');
  equals(q.tokenList[1].tokenType, 'COMPARATOR', 'type should be COMPARATOR');
  equals(q.tokenList[1].tokenValue, '!=', 'value should be !=');
  equals(q.tokenList[2].tokenType, 'COMPARATOR', 'type should be COMPARATOR');
  equals(q.tokenList[2].tokenValue, '<', 'value should be <');
  equals(q.tokenList[3].tokenType, 'COMPARATOR', 'type should be COMPARATOR');
  equals(q.tokenList[3].tokenValue, '<=', 'value should be <=');
  equals(q.tokenList[4].tokenType, 'COMPARATOR', 'type should be COMPARATOR');
  equals(q.tokenList[4].tokenValue, '>', 'value should be >');
  equals(q.tokenList[5].tokenType, 'COMPARATOR', 'type should be COMPARATOR');
  equals(q.tokenList[5].tokenValue, '>=', 'value should be >=');
  equals(q.tokenList[6].tokenType, 'COMPARATOR', 'type should be COMPARATOR');
  equals(q.tokenList[6].tokenValue, 'BEGINS_WITH', 'value should be BEGINS_WITH');
  equals(q.tokenList[7].tokenType, 'COMPARATOR', 'type should be COMPARATOR');
  equals(q.tokenList[7].tokenValue, 'ENDS_WITH', 'value should be ENDS_WITH');
  equals(q.tokenList[8].tokenType, 'COMPARATOR', 'type should be COMPARATOR');
  equals(q.tokenList[8].tokenValue, 'ANY', 'value should be ANY');
  equals(q.tokenList[9].tokenType, 'COMPARATOR', 'type should be COMPARATOR');
  equals(q.tokenList[9].tokenValue, 'MATCHES', 'value should be MATCHES');
  
  // BOOLEAN OPERATORS
  q.queryString = "AND OR NOT";
  q.parseQuery();
  ok(q.tokenList.length == 3, 'list should have 3 tokens');
  equals(q.tokenList[0].tokenType, 'BOOL_OP', 'type should be BOOL_OP');
  equals(q.tokenList[0].tokenValue, 'AND', 'value should be AND');
  equals(q.tokenList[1].tokenType, 'BOOL_OP', 'type should be BOOL_OP');
  equals(q.tokenList[1].tokenValue, 'OR', 'value should be OR');
  equals(q.tokenList[2].tokenType, 'BOOL_OP', 'type should be BOOL_OP');
  equals(q.tokenList[2].tokenValue, 'NOT', 'value should be NOT');
  
}); 
  
  
  // ..........................................................
  // TREE-BUILDING 
  // 


test("token tree should build", function() {  
  // Just some examples
  
  q.queryString = "(firstName MATCHES {firstName} OR lastName BEGINS_WITH 'Lone') AND is_a_beauty = true";
  q.parseQuery();
  ok(q.tokenList.length == 13, 'list should have 13 tokens');
  ok(!q.tokenTree.error, 'there should be no errors');
  ok(q.tokenTree.tokenValue == 'AND', 'tree root shoud be AND');
  
});


