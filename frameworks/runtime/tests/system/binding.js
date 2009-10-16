// ========================================================================
// SC.Binding Tests
// ========================================================================
/*globals module test ok isObj equals expects */

var fromObject, toObject, binding, Bon1, bon2 ; // global variables

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

test("binding should have synced on connect", function() {
  equals(toObject.get("value"), "start", "toObject.value should match fromObject.value");
});

test("changing fromObject should mark binding as dirty", function() {
  fromObject.set("value", "change") ;
  equals(binding._changePending, YES) ;
});

test("fromObject change should propogate to toObject only after flush", function() {
  fromObject.set("value", "change") ;
  equals(toObject.get("value"), "start") ;
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

test("suspended observing during bindings", function() {

  // setup special binding
  fromObject = SC.Object.create({
    value1: 'value1',
    value2: 'value2'
  });
  
  toObject = SC.Object.create({
    value1: 'value1',
    value2: 'value2',
    
    callCount: 0,
    
    observer: function() {
      equals(this.get('value1'), 'CHANGED', 'value1 when observer fires');
      equals(this.get('value2'), 'CHANGED', 'value2 when observer fires');
      this.callCount++;
    }.observes('value1', 'value2')
  });
  
  toObject.bind('value1', fromObject, 'value1');
  toObject.bind('value2', fromObject, 'value2');

  // change both value1 + value2, then  flush bindings.  observer should only
  // fire after bindings are done flushing.
  fromObject.set('value1', 'CHANGED').set('value2', 'CHANGED');
  SC.Binding.flushPendingChanges();
  
  equals(toObject.callCount, 2, 'should call observer twice');
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
  equals(toObject.get("value"), "start") ;
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
  
  var didChange = YES;
  while(didChange) didChange = SC.Binding.flushPendingChanges() ;
  
  // bindings should not have bending changes
  equals(binding1._changePending, NO, "binding1._changePending") ;
  equals(binding2._changePending, NO, "binding2._changePending") ;
  
  equals("change", first.get("output"), "first.output") ;
  equals("change", second.get("input"), "second.input") ;
  equals("change", second.get("output"), "second.output") ;
  equals("change", third.get("input"), "third.input") ;
});

module("Custom Binding", {
  
  setup: function() {
	Bon1 = SC.Object.extend({
		value1: "hi",
		value2: 83,
		array1: []
	});
	
	bon2 = SC.Object.create({
		val1: "hello",
		val2: 25,
		arr: [1,2,3,4]
	});
	
	TestNamespace = {
      bon2: bon2,
      Bon1: Bon1
    } ;
  },
  
  teardown: function() { 
    delete Bon1 ;
    delete bon2 ;
	//delete TestNamespace;
  }
});

test("Binding value1 such that it will recieve only single values", function() {
	var bon1 = Bon1.create({
		value1Binding: SC.Binding.single("TestNamespace.bon2.val1"),
		array1Binding: SC.Binding.single("TestNamespace.bon2.arr")
	});
	SC.Binding.flushPendingChanges();
	var a = [23,31,12,21];
	bon2.set("arr", a);
	bon2.set("val1","changed");
	SC.Binding.flushPendingChanges();
	equals(bon2.get("val1"),bon1.get("value1"));
	equals("@@MULT@@",bon1.get("array1"));
	bon1.destroy();
});

test("Single binding using notEmpty function.", function() {
	var bond = Bon1.create ({
	  array1Binding: SC.Binding.single("TestNamespace.bon2.arr").notEmpty(null,'(EMPTY)')
	});
	SC.Binding.flushPendingChanges();
	bon2.set("arr", []);
	SC.Binding.flushPendingChanges();
	equals("(EMPTY)",bond.get("array1"));
});

test("Binding with transforms, function to check the type of value", function() {
	var jon = Bon1.create({
		value1Binding: SC.Binding.transform(function(val1) {
			return (SC.typeOf(val1) == SC.T_STRING)? val1 : "";
		}).from("TestNamespace.bon2.val1")
	});
	SC.Binding.flushPendingChanges();
	bon2.set("val1","changed");
	SC.Binding.flushPendingChanges();
	equals(jon.get("value1"), bon2.get("val1"));
});

test("two bindings to the same value should sync in the order they are initialized", function() {

  SC.LOG_BINDINGS = YES;

  SC.RunLoop.begin();

  window.a = SC.Object.create({ 
    foo: "bar" 
  });
  
  var a = window.a;
  
  window.b = SC.Object.create({ 
    foo: "baz",
    fooBinding: "a.foo",
    
    C: SC.Object.extend({
      foo: "bee",
      fooBinding: "*owner.foo"
    }),
    
    init: function() {
      sc_super();
      this.set('c', this.C.create({ owner: this }));
    }
    
  });
  
  var b = window.b;

  SC.LOG_BINDINGS = YES;
    
  SC.RunLoop.end();
  
  equals(a.get('foo'), "bar", 'a.foo should not change');
  equals(b.get('foo'), "bar", 'a.foo should propogate up to b.foo');
  equals(b.c.get('foo'), "bar", 'a.foo should propogate up to b.c.foo');
  
  window.a = window.b = null ;
  
});
