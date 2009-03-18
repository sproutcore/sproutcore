// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
/*globals module test ok equals same */

// ..........................................................
// CREATE
// 

var Test ;
module("Create new Record", {
  setup: function() {
    Test = SC.Object.create({
      store: SC.Store.create()
    });
    Test.Foo = SC.Record.extend();    
  }
});

test("create test and set/get properties on dataHash", function() {
  window.Test = Test ;
  window.record = Test.store.createRecord({
    foo: "foo", bar: "bar"
  }, Test.Foo);
});