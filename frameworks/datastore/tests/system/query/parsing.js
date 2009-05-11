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
  q.conditions = "what_to_do_now";
  q.parseQuery();
  ok(q.tokenList.length == 1, 'list should have one token');
  equals(q.tokenList[0].tokenType, 'PROPERTY', 'type should be PROPERTY');
  equals(q.tokenList[0].tokenValue, 'what_to_do_now', 'value should be what_to_do_now');
  
  // PROPERTY - one character
  q.conditions = "a";
  q.parseQuery();
  ok(q.tokenList.length == 1, 'list should have one token');
  equals(q.tokenList[0].tokenType, 'PROPERTY', 'type should be PROPERTY');
  equals(q.tokenList[0].tokenValue, 'a', 'value should be "a"');
  
  // BOOLEAN VALUE - false
  q.conditions = "false";
  q.parseQuery();
  ok(q.tokenList.length == 1, 'list should have one token');
  equals(q.tokenList[0].tokenType, 'false', 'type should be false');
  equals(q.tokenList[0].tokenValue, 'false', 'value should be false');
  
  // BOOLEAN VALUE - true
  q.conditions = "true";
  q.parseQuery();
  ok(q.tokenList.length == 1, 'list should have one token');
  equals(q.tokenList[0].tokenType, 'true', 'type should be true');
  equals(q.tokenList[0].tokenValue, 'true', 'value should be true');
  
  // NULL
  q.conditions = "null undefined";
  q.parseQuery();
  ok(q.tokenList.length == 2, 'list should have 2 tokens');
  equals(q.tokenList[0].tokenType, 'null', 'type should be null');
  equals(q.tokenList[1].tokenType, 'undefined', 'type should be undefined');
  
  // NUMBER - integer
  q.conditions = "1234";
  q.parseQuery();
  ok(q.tokenList.length == 1, 'list should have one token');
  equals(q.tokenList[0].tokenType, 'NUMBER', 'type should be NUMBER');
  equals(q.tokenList[0].tokenValue, 1234, 'value should be 1234');
  
  // NUMBER - float
  q.conditions = "12.34";
  q.parseQuery();
  ok(q.tokenList.length == 1, 'list should have one token');
  equals(q.tokenList[0].tokenType, 'NUMBER', 'type should be NUMBER');
  equals(q.tokenList[0].tokenValue, 12.34, 'value should be 12.34');
  
  // STRING - single quoted
  q.conditions = "'ultravisitor'";
  q.parseQuery();
  ok(q.tokenList.length == 1, 'list should have one token');
  equals(q.tokenList[0].tokenType, 'STRING', 'type should be STRING');
  equals(q.tokenList[0].tokenValue, 'ultravisitor', 'value should be ultravisitor');
  
  // STRING - double quoted
  q.conditions = '"Feed me weird things"';
  q.parseQuery();
  ok(q.tokenList.length == 1, 'list should have one token');
  equals(q.tokenList[0].tokenType, 'STRING', 'type should be STRING');
  equals(q.tokenList[0].tokenValue, 'Feed me weird things', 'value should be Feed me weird things');

  // STRING - empty
  q.conditions = "''";
  q.parseQuery();
  ok(q.tokenList.length == 1, 'list should have one token');
  equals(q.tokenList[0].tokenType, 'STRING', 'type should be STRING');
  equals(q.tokenList[0].tokenValue, '', 'value should be ""');
  
  // PARAMETER
  q.conditions = "{my_best_friends}";
  q.parseQuery();
  ok(q.tokenList.length == 1, 'list should have one token');
  equals(q.tokenList[0].tokenType, 'PARAMETER', 'type should be PARAMETER');
  equals(q.tokenList[0].tokenValue, 'my_best_friends', 'value should be my_best_friends');
  
  // WILD CARD
  q.conditions = "%@";
  q.parseQuery();
  ok(q.tokenList.length == 1, 'list should have one token');
  equals(q.tokenList[0].tokenType, '%@', 'type should be %@');
  equals(q.tokenList[0].tokenValue, 0, 'value should be 0');
  
  // PARENTHESES
  q.conditions = "()";
  q.parseQuery();
  ok(q.tokenList.length == 2, 'list should have two tokens');
  equals(q.tokenList[0].tokenType, 'OPEN_PAREN', 'type should be OPEN_PAREN');
  equals(q.tokenList[1].tokenType, 'CLOSE_PAREN', 'type should be CLOSE_PAREN');
  
  // COMPARATORS
  q.conditions = "= != < <= > >= BEGINS_WITH ENDS_WITH ANY MATCHES TYPE_IS";
  q.parseQuery();
  ok(q.tokenList.length == 11, 'list should have 10 tokens');
  equals(q.tokenList[0].tokenType, '=', 'type should be =');
  equals(q.tokenList[0].tokenValue, '=', 'value should be =');
  equals(q.tokenList[1].tokenType, '!=', 'type should be !=');
  equals(q.tokenList[1].tokenValue, '!=', 'value should be !=');
  equals(q.tokenList[2].tokenType, '<', 'type should be <');
  equals(q.tokenList[2].tokenValue, '<', 'value should be <');
  equals(q.tokenList[3].tokenType, '<=', 'type should be <=');
  equals(q.tokenList[3].tokenValue, '<=', 'value should be <=');
  equals(q.tokenList[4].tokenType, '>', 'type should be >');
  equals(q.tokenList[4].tokenValue, '>', 'value should be >');
  equals(q.tokenList[5].tokenType, '>=', 'type should be >=');
  equals(q.tokenList[5].tokenValue, '>=', 'value should be >=');
  equals(q.tokenList[6].tokenType, 'BEGINS_WITH', 'type should be BEGINS_WITH');
  equals(q.tokenList[6].tokenValue, 'BEGINS_WITH', 'value should be BEGINS_WITH');
  equals(q.tokenList[7].tokenType, 'ENDS_WITH', 'type should be ENDS_WITH');
  equals(q.tokenList[7].tokenValue, 'ENDS_WITH', 'value should be ENDS_WITH');
  equals(q.tokenList[8].tokenType, 'ANY', 'type should be ANY');
  equals(q.tokenList[8].tokenValue, 'ANY', 'value should be ANY');
  equals(q.tokenList[9].tokenType, 'MATCHES', 'type should be MATCHES');
  equals(q.tokenList[9].tokenValue, 'MATCHES', 'value should be MATCHES');
  equals(q.tokenList[10].tokenType, 'TYPE_IS', 'type should be TYPE_IS');
  equals(q.tokenList[10].tokenValue, 'TYPE_IS', 'value should be TYPE_IS');
  
  // BOOLEAN OPERATORS
  q.conditions = "AND OR NOT";
  q.parseQuery();
  ok(q.tokenList.length == 3, 'list should have 3 tokens');
  equals(q.tokenList[0].tokenType, 'AND', 'type should be AND');
  equals(q.tokenList[0].tokenValue, 'AND', 'value should be AND');
  equals(q.tokenList[1].tokenType, 'OR', 'type should be OR');
  equals(q.tokenList[1].tokenValue, 'OR', 'value should be OR');
  equals(q.tokenList[2].tokenType, 'NOT', 'type should be NOT');
  equals(q.tokenList[2].tokenValue, 'NOT', 'value should be NOT');
  
}); 
  
  
  // ..........................................................
  // TREE-BUILDING 
  // 


test("token tree should build", function() {  
  // Just some examples
  
  q.conditions = "(firstName MATCHES {firstName} OR lastName BEGINS_WITH 'Lone') AND is_a_beauty = true";
  q.parseQuery();
  ok(q.tokenList.length == 13, 'list should have 13 tokens');
  ok(!q.tokenTree.error, 'there should be no errors');
  ok(q.tokenTree.tokenValue == 'AND', 'tree root shoud be AND');
  
});


