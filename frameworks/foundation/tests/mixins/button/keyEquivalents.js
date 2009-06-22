// ==========================================================================
// Project: SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Apple, Inc. and contributors.
// License: Licened under MIT license (see license.js)
// ==========================================================================
 
/*global module test equals context ok same */
 
// ..........................................................
// performKeyEquivalent() - verify that return value is correct.
//
var view;
 
module('SC.Button#performKeyEquivalent', {
  setup: function() {
    view = SC.View.create(SC.Button);
    view.set('title', 'hello world');
    view.set('keyEquivalent', 'return');
  },
  
  teardown: function() {
    view.destroy();
    view = null;
  }
});
 
test("handles matching key equivalent 'return'", function() {
  view.triggerAction = function(evt) { return YES; }; // act like we handled it if we get here
  ok(view.performKeyEquivalent('return'), "should return truthy value indicating it handled the key equivalent 'return'");
});
 
test("ignores non-matching key equivalent 'wrong_key'", function() {
  view.triggerAction = function(evt) { return YES; }; // act like we handled it if we get here (we shouldn't in this case)
  ok(!view.performKeyEquivalent('wrong_key'), "should return falsy value indicating it ignored the non-matching key equivalent 'wrong_key'");
});