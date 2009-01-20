// ========================================================================
// SC.Binding Tests
// ========================================================================
/*globals module test ok isObj equals expects */

var fromObject, toObject, binding ; // global variables

module("basic object binding", {
  
  setup: function() {
    fromObject = SC.Object.create({ value: 'start' }) ;
    toObject = SC.Object.create({ value: 'end' }) ;
    binding = SC.Binding.from("value", fromObject).to("value", toObject).connect() ;
    SC.Binding.flushPendingChanges() ; // actually sets up up the connection
  }
});
  
test("binding is connected", function() {
  equals(binding.isConnected, YES, "binding.isConnected") ;
});

test("binding has actually been setup", function() {
  equals(binding._connectionPending, NO, "binding._connectionPending") ;
});

test("changing fromObject should mark binding as dirty", function() {
  fromObject.set("value", "change") ;
  equals(binding._changePending, YES) ;
});

test("fromObject change should propogate to toObject only after flush", function() {
  fromObject.set("value", "change") ;
  equals(toObject.get("value"), "end") ;
  SC.Binding.flushPendingChanges() ;
  equals(toObject.get("value"), "change") ;    
});

test("changing toObject should mark binding as dirty", function() {
  toObject.set("value", "change") ;
  equals(binding._changePending, YES) ;
});

test("toObject change should propogate to fromObject only after flush", function() {
  toObject.set("value", "change") ;
  equals(fromObject.get("value"), "start") ;
  SC.Binding.flushPendingChanges() ;
  equals(fromObject.get("value"), "change") ;    
});

module("one way binding", {
  
  setup: function() {
    fromObject = SC.Object.create({ value: 'start' }) ;
    toObject = SC.Object.create({ value: 'end' }) ;
    binding = SC.Binding.from("value", fromObject).to("value", toObject).oneWay().connect() ;
    SC.Binding.flushPendingChanges() ; // actually sets up up the connection
  }
  
});
  
test("changing fromObject should mark binding as dirty", function() {
  fromObject.set("value", "change") ;
  equals(binding._changePending, YES) ;
});

test("fromObject change should propogate after flush", function() {
  fromObject.set("value", "change") ;
  equals(toObject.get("value"), "end") ;
  SC.Binding.flushPendingChanges() ;
  equals(toObject.get("value"), "change") ;    
});

test("changing toObject should not make binding dirty", function() {
  toObject.set("value", "change") ;
  equals(binding._changePending, NO) ;
});

test("toObject change should NOT propogate", function() {
  toObject.set("value", "change") ;
  equals(fromObject.get("value"), "start") ;
  SC.Binding.flushPendingChanges() ;
  equals(fromObject.get("value"), "start") ;    
});

var first, second, third, binding1, binding2 ; // global variables

module("chained binding", {
  
  setup: function() {
    first = SC.Object.create({ output: 'first' }) ;
    
    second = SC.Object.create({ 
      input: 'second',
      output: 'second',
      
      inputDidChange: function() {
        this.set("output", this.get("input")) ;
      }.observes("input")  
    }) ;
    
    third = SC.Object.create({ input: "third" }) ;
    
    binding1 = SC.Binding.from("output", first).to("input", second).connect() ;
    binding2 = SC.Binding.from("output", second).to("input", third).connect() ;
    SC.Binding.flushPendingChanges() ; // actually sets up up the connection
  }
  
});

test("changing first output should propograte to third after flush", function() {
  first.set("output", "change") ;
  equals("change", first.get("output"), "first.output") ;
  ok("change" !== third.get("input"), "third.input") ;
  
  SC.Binding.flushPendingChanges() ;
  
  // bindings should not have bending changes
  equals(NO, binding1._changePending, "binding1._changePending === NO") ;
  equals(NO, binding2._changePending, "binding2._changePending === NO") ;
  
  equals("change", first.get("output"), "first.output") ;
  equals("change", second.get("input"), "second.input") ;
  equals("change", second.get("output"), "second.output") ;
  equals("change", third.get("input"), "third.input") ;
});
