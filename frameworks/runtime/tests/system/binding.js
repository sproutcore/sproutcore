// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
// ========================================================================
// SC.Binding Tests
// ========================================================================
/*globals module test ok isObj equals expects */

var fromObject, toObject, binding, Bon1, bon2 ; // global variables

module("basic object binding", {

  setup: function () {
    fromObject = SC.Object.create({ value: 'start' }) ;
    midObject = SC.Object.create({ value: 'middle' });
    toObject = SC.Object.create({ value: 'end' }) ;
    binding1 = SC.Binding.from("value", fromObject).to("value", midObject).connect() ;
    binding2 = SC.Binding.from("value", midObject).to("value", toObject).connect();
    SC.Binding.flushPendingChanges() ; // actually sets up up the connection
  },

  teardown: function () {
    fromObject.destroy();
    midObject.destroy();
    toObject.destroy();
    fromObject = midObject = toObject = binding1 = binding2 = null;
  }
});

test("binding is connected", function() {
  equals(binding1.isConnected, YES, "binding1.isConnected") ;
  equals(binding2.isConnected, YES, "binding2.isConnected") ;
});

test("binding has actually been setup", function() {
  equals(binding1._connectionPending, NO, "binding1._connectionPending") ;
  equals(binding2._connectionPending, NO, "binding2._connectionPending") ;
});

test("binding should have synced on connect", function() {
  equals(toObject.get("value"), "start", "toObject.value should match fromObject.value");
  equals(midObject.get("value"), "start", "midObject.value should match fromObject.value");
});

test("changing fromObject should mark binding as dirty", function() {
  fromObject.set("value", "change") ;
  ok(SC.Binding._changeQueue.contains(binding1), "the binding should be in the _changeQueue");
  SC.Binding.flushPendingChanges() ;
  ok(SC.Binding._changeQueue.contains(binding2), "the binding should be in the _changeQueue");
});

test("fromObject change should propogate to toObject only after flush", function() {
  fromObject.set("value", "change") ;
  equals(midObject.get("value"), "start") ;
  equals(toObject.get("value"), "start") ;
  SC.Binding.flushPendingChanges() ;
  equals(midObject.get("value"), "change") ;
  SC.Binding.flushPendingChanges() ;
  equals(toObject.get("value"), "change") ;
});

test("changing toObject should mark binding as dirty", function() {
  toObject.set("value", "change") ;
  ok(SC.Binding._changeQueue.contains(binding2), "the binding should be in the _changeQueue");
  SC.Binding.flushPendingChanges() ;
  ok(SC.Binding._changeQueue.contains(binding1), "the binding should be in the _changeQueue");
});

test("toObject change should propogate to fromObject only after flush", function() {
  toObject.set("value", "change") ;
  equals(midObject.get("value"), "start") ;
  equals(fromObject.get("value"), "start") ;
  SC.Binding.flushPendingChanges() ;
  equals(midObject.get("value"), "change") ;
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

test("binding will disconnect", function() {
  binding1.disconnect();
  equals(binding1.isConnected, NO, "binding1.isConnected");
});

test("binding disconnection actually works", function() {
  binding1.disconnect();
  fromObject.set('value', 'change');
  SC.Binding.flushPendingChanges();
  equals(midObject.get('value'), 'start');
  SC.Binding.flushPendingChanges();
  equals(toObject.get('value'), 'start');

  binding1.connect();
  SC.Binding.flushPendingChanges();
  equals(midObject.get('value'), 'change');
  SC.Binding.flushPendingChanges();
  equals(toObject.get('value'), 'change');
});

test("binding destruction actually works", function() {
  binding1.destroy()
  ok(binding1.isDestroyed, "binding marks itself as destroyed.");
  ok(!binding1._fromTarget && !binding1._toTarget, "binding destruction removes binding targets.");
});

module("bindings on classes");

test("should connect when multiple instances of class are created", function() {
  window.TestNamespace = {};
  window.TestNamespace.stubController = SC.Object.create({
    name: 'How to Be Happy'
  });

  try {
    var myClass = SC.Object.extend({
      fooBinding: SC.Binding.from('TestNamespace.stubController.name')
    });

    var myFirstObj;

    SC.run(function() { myFirstObj = myClass.create(); });
    equals(myFirstObj.get('foo'), "How to Be Happy");

    var mySecondObj;
    SC.run(function() { mySecondObj = myClass.create() });
    equals(mySecondObj.get('foo'), "How to Be Happy");

    SC.run(function() { myFirstObj.destroy(); })
    ok(myFirstObj.fooBinding.isDestroyed, "destroying an object destroys its class bindings.");

  } finally {
    window.TestNamespace = undefined;
  }
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
  ok(SC.Binding._changeQueue.contains(binding), "the binding should be in the _changeQueue");
});

test("fromObject change should propogate after flush", function() {
  fromObject.set("value", "change") ;
  equals(toObject.get("value"), "start") ;
  SC.Binding.flushPendingChanges() ;
  equals(toObject.get("value"), "change") ;
});

test("changing toObject should not make binding dirty", function() {
  toObject.set("value", "change") ;
  ok(!SC.Binding._changeQueue.contains(binding), "the binding should not be in the _changeQueue");
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

test("changing first output should propagate to third after flush", function() {
  first.set("output", "change") ;
  equals("change", first.get("output"), "first.output") ;
  ok("change" !== third.get("input"), "third.input") ;

  var didChange = YES;
  while(didChange) didChange = SC.Binding.flushPendingChanges() ;

  // bindings should not have bending changes
  ok(!SC.Binding._changeQueue.contains(binding1), "the binding should not be in the _changeQueue");
  ok(!SC.Binding._changeQueue.contains(binding2), "the binding should not be in the _changeQueue");

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
    bon2.destroy();
  }
});

test("Binding value1 such that it will receive only single values", function() {
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

  SC.LOG_BINDINGS = NO;

  SC.RunLoop.end();

  equals(a.get('foo'), "bar", 'a.foo should not change');
  equals(b.get('foo'), "bar", 'a.foo should propogate up to b.foo');
  equals(b.c.get('foo'), "bar", 'a.foo should propogate up to b.c.foo');

  window.a = window.b = null ;

});

module("AND binding", {

  setup: function() {
    // temporarily set up two source objects in the SC namespace so we can
    // use property paths to access them
    SC.testControllerA = SC.Object.create({ value: NO });
    SC.testControllerB = SC.Object.create({ value: NO });

    toObject = SC.Object.create({
      value: null,
      valueBinding: SC.Binding.and('SC.testControllerA.value', 'SC.testControllerB.value')
    });
  },

  teardown: function() {
    SC.testControllerA.destroy();
    SC.testControllerB.destroy();
  }

});

test("toObject.value should be YES if both sources are YES", function() {
  SC.RunLoop.begin();
  SC.testControllerA.set('value', YES);
  SC.testControllerB.set('value', YES);
  SC.RunLoop.end();

  SC.Binding.flushPendingChanges();
  equals(toObject.get('value'), YES);
});

test("toObject.value should be NO if either source is NO", function() {
  SC.RunLoop.begin();
  SC.testControllerA.set('value', YES);
  SC.testControllerB.set('value', NO);
  SC.RunLoop.end();

  SC.Binding.flushPendingChanges();
  equals(toObject.get('value'), NO);

  SC.RunLoop.begin();
  SC.testControllerA.set('value', YES);
  SC.testControllerB.set('value', YES);
  SC.RunLoop.end();

  SC.Binding.flushPendingChanges();
  equals(toObject.get('value'), YES);

  SC.RunLoop.begin();
  SC.testControllerA.set('value', NO);
  SC.testControllerB.set('value', YES);
  SC.RunLoop.end();

  SC.Binding.flushPendingChanges();
  equals(toObject.get('value'), NO);
});

module("OR binding", {

  setup: function() {
    // temporarily set up two source objects in the SC namespace so we can
    // use property paths to access them
    SC.testControllerA = SC.Object.create({ value: NO });
    SC.testControllerB = SC.Object.create({ value: null });

    toObject = SC.Object.create({
      value: null,
      valueBinding: SC.Binding.or('SC.testControllerA.value', 'SC.testControllerB.value')
    });
  },

  teardown: function() {
    SC.testControllerA.destroy();
    SC.testControllerB.destroy();
  }

});

test("toObject.value should be first value if first value is truthy", function() {
  SC.RunLoop.begin();
  SC.testControllerA.set('value', 'first value');
  SC.testControllerB.set('value', 'second value');
  SC.RunLoop.end();

  SC.Binding.flushPendingChanges();
  equals(toObject.get('value'), 'first value');
});

test("toObject.value should be second value if first is falsy", function() {
  SC.RunLoop.begin();
  SC.testControllerA.set('value', NO);
  SC.testControllerB.set('value', 'second value');
  SC.RunLoop.end();

  SC.Binding.flushPendingChanges();
  equals(toObject.get('value'), 'second value');
});

module("Binding with '[]'", {
  setup: function() {
    fromObject = SC.Object.create({ value: [] });
    toObject = SC.Object.create({ value: '' });
    binding = SC.Binding.transform(function(v) {
      return v ? v.join(',') : '';
    }).from("value.[]", fromObject).to("value", toObject).connect();
  }
});

test("Binding refreshes after a couple of items have been pushed in the array", function() {
  fromObject.get('value').pushObjects(['foo', 'bar']);
  SC.Binding.flushPendingChanges();
  equals(toObject.get('value'), 'foo,bar');
});


module("propertyNameBinding with longhand", {
  setup: function(){
    TestNamespace = {
      fromObject: SC.Object.create({
        value: "originalValue"
      }),
      toObject: SC.Object.create({
        valueBinding: SC.Binding.from('TestNamespace.fromObject.value'),
        localValue: "originalLocal",
        relativeBinding: SC.Binding.from('.localValue')
      })
    };
  },
  teardown: function(){
    TestNamespace.fromObject.destroy();
    TestNamespace.toObject.destroy();
    delete TestNamespace.fromObject;
    delete TestNamespace.toObject;
  }
});

test("works with full path", function(){
  SC.RunLoop.begin();
  TestNamespace.fromObject.set('value', "updatedValue");
  SC.RunLoop.end();

  equals(TestNamespace.toObject.get('value'), "updatedValue");

  SC.RunLoop.begin();
  TestNamespace.fromObject.set('value', "newerValue");
  SC.RunLoop.end();

  equals(TestNamespace.toObject.get('value'), "newerValue");
});

test("works with local path", function(){
  SC.RunLoop.begin();
  TestNamespace.toObject.set('localValue', "updatedValue");
  SC.RunLoop.end();

  equals(TestNamespace.toObject.get('relative'), "updatedValue");

  SC.RunLoop.begin();
  TestNamespace.toObject.set('localValue', "newerValue");
  SC.RunLoop.end();

  equals(TestNamespace.toObject.get('relative'), "newerValue");
});

module("Binding transforms", {
  setup: function() {
    fromObject = SC.Object.create({ stringValue: '1A' });
    toObject = SC.Object.create({ numberValue: 1 });
    binding = SC.Binding.transform(function(value, isForward, binding) {
      if (isForward) {
        // We get a String to transform into a Number
        return parseInt(value);
      } else {
        // We get a Number to transform into a String (w/ 'A' on the end)
        return value + "A";
      }
    }, NO).from("stringValue", fromObject).to("numberValue", toObject).connect();
  }
});

test("The binding transforms in both directions", function() {
  // Set in one direction
  fromObject.set('stringValue', '2A');
  SC.Binding.flushPendingChanges();
  equals(toObject.get('numberValue'), 2);
  
  // Set in the other
  toObject.set('numberValue', 3);
  SC.Binding.flushPendingChanges();
  equals(fromObject.get('stringValue'), '3A');

  stop(100);
  setTimeout(function() {
    equals(toObject.get('numberValue'), 3);
    start();
  }, 10);
});

module("Binding transforms sync", {
  setup: function() {
    fromObject = SC.Object.create({ fromValue: 1 });
    toObject = SC.Object.create({ toValue: 1 });
    binding = SC.Binding.transform(function(value) {
      return ((SC.typeOf(value) === SC.T_NUMBER) && (value < 10)) ? 10 : value ;
    }).from("fromValue", fromObject).to("toValue", toObject).connect();
  }
});

test("The binding transforms sync the from value", function() {
  // Set in one direction
  fromObject.set('fromValue', 9);
  SC.Binding.flushPendingChanges();
  equals(toObject.get('toValue'), 10);

  stop(100);
  setTimeout(function() {
    equals(fromObject.get('fromValue'), 10);
    start();
  }, 10);
});
