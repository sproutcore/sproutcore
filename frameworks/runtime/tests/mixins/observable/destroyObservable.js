// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            portions copyright @2009 Apple Inc.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/*globals module test ok equals same */

var object, object2, binding;

module("object.destroyObservable", {
  setup: function() {
    object = SC.Object.create({
      test1: "Hi",
      test2: "start"
    });
    object2 = SC.Object.create({
      test1: "Hello",
      test2: ""
    });
  }
});

test("destroyObservable removes all observers", function(){
  // a function which increments a number, and allows us to know if an observer
  // is being called.
  var i = 0;
  var f = function(){
    i += 1;
  };
  
  // add the observer and make sure that worked (it should...)
  object.addObserver("test1", this, f);
  object.set("test1", "HELLO");
  equals(i, 1, "The observer should have been called.");
  equals(object._observersActive.length, 1, "The object should have one observer.");
  
  // destroy observable
  object.destroyObservable("test1", this);
  
  // and try again
  object.set("test1", "Hello");
  equals(i, 1, "The observer should not have been called.");
  equals(object._observersActive.length, 0, "The object should have no observers.");
});

test("destroyObservable removes all bindings", function(){
  // make a binding
  object2.bind("test2", [object, "test2"]);
  SC.Binding.flushPendingChanges() ; // actually sets up up the connection
  
  // check initial state
  equals(object2.get("test2"), "start", "Nothing should have happened yet.");
  
  // test a simple change to make sure we are bound and I didn't mess up
  object.set("test2", "change1");
  equals(object2.get("test2"), "start", "Binding should not update yet."); // should not yet be modified
  SC.Binding.flushPendingChanges() ;
  equals(object2.get("test2"), "change1", "Binding should be updated.");
    
  // check binding count
  equals(object2.bindings.length, 1, "Bound object should have one binding.");
  equals(object._observersActive.length, 1, "Object bound to should have one observer.");
  
  // now that it is settled, try destroying the observer
  object2.destroyObservable();
  
  // try a manual, effect-based test
  object.set("test2", "change2");
  SC.Binding.flushPendingChanges() ;
  equals(object2.get("test2"), "change1");
  
  // now a less manual one
  equals(object._observersActive.length, 0, "Object bound to should have zero observers.");
  equals(object2.bindings.length, 0, "Bound object should have zero bindings.");
  
});
