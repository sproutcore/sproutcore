// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Apple, Inc. and contributors.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

// This file tests the initial state of the store when it is first created
// either independently or as a chained store.

// ..........................................................
// SC.Store#init
// 
module("SC.Store#init");

test("initial setup for root store", function() {
  var store = SC.Store.create();
  
  ok(!store.parentStore, 'should not have parentStore');
  ok(store.get('isTransient'), 'should be isTransient = YES');
  
  equals(SC.typeOf(store.dataHashes), SC.T_HASH, 'should have dataHashes');
  equals(SC.typeOf(store.revisions), SC.T_HASH, 'should have revisions');
  equals(SC.typeOf(store.statuses), SC.T_HASH, 'should have statuses');
  
  ok(!store.locks, 'should not have locks');
  ok(!store.changedDataHashes, 'should not have changedDataHashes');
  ok(!store.editables, 'should not have editables');
}); 

// ..........................................................
// SC.Store#chain - init
// 
module("SC.Store#chain - init");

test("initial setup for chained store", function() {
  var parent = SC.Store.create();
  var store  = parent.chain();
  
  ok(store !== parent, 'chain should return new child store');
  
  equals(store.get('parentStore'), parent, 'should have parentStore');
  ok(store.get('isTransient'), 'should be isTransient = YES');
  
  equals(SC.typeOf(store.dataHashes), SC.T_HASH, 'should have dataHashes');
  parent.dataHashes.foo = 'bar';
  equals(store.dataHashes.foo, 'bar', 'dataHashes should inherit from parent');
    
  equals(SC.typeOf(store.revisions), SC.T_HASH, 'should have revisions');
  parent.revisions.foo = 'bar';
  equals(store.revisions.foo, 'bar', 'revisions should inherit from parent');

  equals(SC.typeOf(store.statuses), SC.T_HASH, 'should have statuses');
  parent.statuses.foo = 'bar';
  equals(store.statuses.foo, 'bar', 'statuses should inherit from parent');
  
  ok(!store.locks, 'should not have locks');
  ok(!store.changedDataHashes, 'should not have changedDataHashes');
  ok(!store.editables, 'should not have editables');
}); 

