// ==========================================================================
// Project: SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Apple Inc. and contributors.
// License: Licened under MIT license (see license.js)
// ==========================================================================
 
/*global module test equals context ok same */
 
// ..........................................................
// performKeyEquivalent() - verify that return value is correct.
//
var view;
 
module('SC.Button#performKeyEquivalent', {
  setup: function() {
    view = SC.View.create(SC.Button, {
      triggerAction: function() { return YES; }
    });
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

test("triggers on return if isDefault is set and no keyEquivalent is set", function() {
  view.set('isDefault', YES);
  view.set('keyEquivalent', null);
  ok(view.performKeyEquivalent('return'), 'should be handled');
  
  view.set('keyEquivalent', 'a');
  ok(!view.performKeyEquivalent('return'), 'should NOT be handled');
});


test("triggers on escape if isCancel is set and no keyEquivalent is set", function() {
  view.set('isCancel', YES);
  view.set('keyEquivalent', null);
  ok(view.performKeyEquivalent('escape'), 'should be handled');
  
  view.set('keyEquivalent', 'a');
  ok(!view.performKeyEquivalent('escape'), 'should NOT be handled');
});
