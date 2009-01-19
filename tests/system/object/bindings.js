// ========================================================================
// SC.Object bindings Tests
// ========================================================================
/*globals module test ok isObj equals expects */

var testObject, fromObject, extraObject, TestNamespace ; // global variables

module("bind() method", {
  
  setup: function() {
    testObject = SC.Object.create({
      foo: "bar",
      bar: "foo",
      extraObject: null 
    });
    
    fromObject = SC.Object.create({
      bar: "foo",
      extraObject: null 
    }) ;
    
    extraObject = SC.Object.create({
      foo: "extraObjectValue"
    }) ;
    
    TestNamespace = {
      fromObject: fromObject,
      testObject: testObject
    } ;
  },
  
  teardown: function() { 
    testObject = undefined ; 
    fromObject = undefined ;
    extraObject = undefined ;
    TestNamespace = undefined ;
  }
  
});
  
// FAILS
test("bind(TestNamespace.fromObject.bar) should follow absolute path", function() {
  // create binding
  testObject.bind("foo", "TestNamespace.fromObject.bar") ;
  
  // now make a change to see if the binding triggers.
  fromObject.set("bar", "changedValue") ;
  
  // support new-style bindings if available
  if (SC.Binding.flushPendingChanges) SC.Binding.flushPendingChanges();
  equals("changedValue", testObject.get("foo"), "testObject.foo");
});
  
// FAILS
test("bind(.bar) should bind to relative path", function() {
  // create binding
  testObject.bind("foo", ".bar") ;
  
  // now make a change to see if the binding triggers.
  testObject.set("bar", "changedValue") ;
  
  // support new-style bindings if available
  if (SC.Binding.flushPendingChanges) SC.Binding.flushPendingChanges();
  equals("changedValue", testObject.get("foo"), "testObject.foo");
});

// FAILS
test("bind(SC.Binding.Bool(TestNamespace.fromObject.bar)) should create binding with bool transform", function() {
  // create binding
  testObject.bind("foo", SC.Binding.Bool("TestNamespace.fromObject.bar")) ;
  
  // now make a change to see if the binding triggers.
  fromObject.set("bar", 1) ;
  
  // support new-style bindings if available
  if (SC.Binding.flushPendingChanges) SC.Binding.flushPendingChanges();
  equals(YES, testObject.get("foo"), "testObject.foo == YES");
  
  fromObject.set("bar", 0) ;
  
  // support new-style bindings if available
  if (SC.Binding.flushPendingChanges) SC.Binding.flushPendingChanges();
  equals(NO, testObject.get("foo"), "testObject.foo == NO");
});

// FAILS
test("bind(TestNamespace.fromObject*extraObject.foo) should create chained binding", function() {
  testObject.bind("foo", "TestNamespace.fromObject*extraObject.foo");
  fromObject.set("extraObject", extraObject) ;
  
  // support new-style bindings if available
  if (SC.Binding.flushPendingChanges) SC.Binding.flushPendingChanges();
  equals("extraObjectValue", testObject.get("foo"), "testObject.foo") ;
});

// FAILS
test("bind(*extraObject.foo) should create locally chained binding", function() {
  testObject.bind("foo", "*extraObject.foo");
  testObject.set("extraObject", extraObject) ;
  
  // support new-style bindings if available
  if (SC.Binding.flushPendingChanges) SC.Binding.flushPendingChanges();
  equals("extraObjectValue", testObject.get("foo"), "testObject.foo") ;
});

var TestObject ; // global variables

module("fooBinding method", {
  
  setup: function() {
    TestObject = SC.Object.extend({
      foo: "bar",
      bar: "foo",
      extraObject: null 
    });
    
    fromObject = SC.Object.create({
      bar: "foo",
      extraObject: null 
    }) ;
    
    extraObject = SC.Object.create({
      foo: "extraObjectValue"
    }) ;
        
    TestNamespace = {
      fromObject: fromObject,
      testObject: testObject
    } ;
  },
  
  teardown: function() { 
    TestObject = undefined ;
    fromObject = undefined ;
    extraObject = undefined ;
    TestNamespace = undefined ;
  }
  
});

// FAILS
test("fooBinding: TestNamespace.fromObject.bar should follow absolute path", function() {
  // create binding
  testObject = TestObject.create({
    fooBinding: "TestNamespace.fromObject.bar"
  }) ;
  
  // now make a change to see if the binding triggers.
  fromObject.set("bar", "changedValue") ;
  
  // support new-style bindings if available
  if (SC.Binding.flushPendingChanges) SC.Binding.flushPendingChanges();
  equals("changedValue", testObject.get("foo"), "testObject.foo");
});

// FAILS
test("fooBinding: .bar should bind to relative path", function() {
  
  testObject = TestObject.create({
    fooBinding: ".bar"
  }) ;
  
  // now make a change to see if the binding triggers.
  testObject.set("bar", "changedValue") ;
  
  // support new-style bindings if available
  if (SC.Binding.flushPendingChanges) SC.Binding.flushPendingChanges();
  equals("changedValue", testObject.get("foo"), "testObject.foo");
});

// FAILS
test("fooBinding: SC.Binding.Bool(TestNamespace.fromObject.bar should create binding with bool transform", function() {
  
  testObject = TestObject.create({
    fooBinding: SC.Binding.Bool("TestNamespace.fromObject.bar") 
  }) ;
  
  // now make a change to see if the binding triggers.
  fromObject.set("bar", 1) ;
  
  // support new-style bindings if available
  if (SC.Binding.flushPendingChanges) SC.Binding.flushPendingChanges();
  equals(YES, testObject.get("foo"), "testObject.foo == YES");
  
  fromObject.set("bar", 0) ;
  
  // support new-style bindings if available
  if (SC.Binding.flushPendingChanges) SC.Binding.flushPendingChanges();
  equals(NO, testObject.get("foo"), "testObject.foo == NO");
});

// FAILS
test("fooBinding: TestNamespace.fromObject*extraObject.foo should create chained binding", function() {
  
  testObject = TestObject.create({
    fooBinding: "TestNamespace.fromObject*extraObject.foo" 
  }) ;
  
  fromObject.set("extraObject", extraObject) ;
  
  // support new-style bindings if available
  if (SC.Binding.flushPendingChanges) SC.Binding.flushPendingChanges();
  equals("extraObjectValue", testObject.get("foo"), "testObject.foo") ;
});

// FAILS
test("fooBinding: *extraObject.foo should create locally chained binding", function() {
  
  testObject = TestObject.create({
    fooBinding: "*extraObject.foo" 
  }) ;
  
  testObject.set("extraObject", extraObject) ;
  
  // support new-style bindings if available
  if (SC.Binding.flushPendingChanges) SC.Binding.flushPendingChanges();
  equals("extraObjectValue", testObject.get("foo"), "testObject.foo") ;
});

module("fooBindingDefault: SC.Binding.Bool (old style)", {
  
  setup: function() {
    TestObject = SC.Object.extend({
      foo: "bar",
      fooBindingDefault: SC.Binding.Bool,
      bar: "foo",
      extraObject: null 
    });
    
    fromObject = SC.Object.create({
      bar: "foo",
      extraObject: null 
    }) ;
    
    TestNamespace = {
      fromObject: fromObject,
      testObject: testObject
    } ;
  },
  
  teardown: function() { 
    TestObject = undefined ;
    fromObject = undefined ;
    TestNamespace = undefined ;
  }
  
});

// FAILS
test("fooBinding: TestNamespace.fromObject.bar should have bool binding", function() {
  // create binding
  testObject = TestObject.create({
    fooBinding: "TestNamespace.fromObject.bar"
  }) ;
  
  // now make a change to see if the binding triggers.
  fromObject.set("bar", 1) ;
  
  // support new-style bindings if available
  if (SC.Binding.flushPendingChanges) SC.Binding.flushPendingChanges();
  equals(YES, testObject.get("foo"), "testObject.foo == YES");
  
  fromObject.set("bar", 0) ;
  
  // support new-style bindings if available
  if (SC.Binding.flushPendingChanges) SC.Binding.flushPendingChanges();
  equals(NO, testObject.get("foo"), "testObject.foo == NO");
});

// FAILS
test("fooBinding: SC.Binding.Not(TestNamespace.fromObject.bar should override default", function() {
  
  testObject = TestObject.create({
    fooBinding: SC.Binding.Not("TestNamespace.fromObject.bar") 
  }) ;
  
  // now make a change to see if the binding triggers.
  fromObject.set("bar", 1) ;
  
  // support new-style bindings if available
  if (SC.Binding.flushPendingChanges) SC.Binding.flushPendingChanges();
  equals(NO, testObject.get("foo"), "testObject.foo == NO");
  
  fromObject.set("bar", 0) ;
  
  // support new-style bindings if available
  if (SC.Binding.flushPendingChanges) SC.Binding.flushPendingChanges();
  equals(YES, testObject.get("foo"), "testObject.foo == YES");
});

module("fooBindingDefault: SC.Binding.bool() (new style)", {
  
  setup: function() {
    TestObject = SC.Object.extend({
      foo: "bar",
      fooBindingDefault: SC.Binding.bool(),
      bar: "foo",
      extraObject: null 
    });
    
    fromObject = SC.Object.create({
      bar: "foo",
      extraObject: null 
    }) ;
    
    TestNamespace = {
      fromObject: fromObject,
      testObject: testObject
    } ;
  },
  
  teardown: function() { 
    TestObject = undefined ;
    fromObject = undefined ;
    TestNamespace = undefined ;
  }
  
});

// FAILS
test("fooBinding: TestNamespace.fromObject.bar should have bool binding", function() {
  // create binding
  testObject = TestObject.create({
    fooBinding: "TestNamespace.fromObject.bar"
  }) ;
  
  // now make a change to see if the binding triggers.
  fromObject.set("bar", 1) ;
  
  // support new-style bindings if available
  if (SC.Binding.flushPendingChanges) SC.Binding.flushPendingChanges();
  equals(YES, testObject.get("foo"), "testObject.foo == YES");
  
  fromObject.set("bar", 0) ;
  
  // support new-style bindings if available
  if (SC.Binding.flushPendingChanges) SC.Binding.flushPendingChanges();
  equals(NO, testObject.get("foo"), "testObject.foo == NO");
});

// FAILS
test("fooBinding: SC.Binding.Not(TestNamespace.fromObject.bar should override default", function() {
  
  testObject = TestObject.create({
    fooBinding: SC.Binding.Not("TestNamespace.fromObject.bar") 
  }) ;
  
  // now make a change to see if the binding triggers.
  fromObject.set("bar", 1) ;
  
  // support new-style bindings if available
  if (SC.Binding.flushPendingChanges) SC.Binding.flushPendingChanges();
  equals(NO, testObject.get("foo"), "testObject.foo == NO");
  
  fromObject.set("bar", 0) ;
  
  // support new-style bindings if available
  if (SC.Binding.flushPendingChanges) SC.Binding.flushPendingChanges();
  equals(YES, testObject.get("foo"), "testObject.foo == YES");
});
  

// Test.context("bind() method", {
//   
//   setup: function() {
//     this.testObject = SC.Object.create({
//       foo: "bar",
//       bar: "foo",
//       extraObject: null 
//     });
//     
//     this.fromObject = SC.Object.create({
//       bar: "foo",
//       extraObject: null 
//     }) ;
//     
//     this.extraObject = SC.Object.create({
//       foo: "extraObjectValue"
//     }) ;
//     
//     window.TestNamespace = {
//       fromObject: this.fromObject,
//       testObject: this.testObject
//     } ;
//   },
// 
//   teardown: function() { 
//     delete this.testObject; 
//     delete this.fromObject;
//     delete window.TestNamespace ;
//   },
//   
//   // FAILS
//   "bind(TestNamespace.fromObject.bar) should follow absolute path": function() {
//     
//     window.testObject = this.testObject ;
//   
//     // create binding
//     this.testObject.bind("foo", "TestNamespace.fromObject.bar") ;
//   
//     // now make a change to see if the binding triggers.
//     this.fromObject.set("bar", "changedValue") ;
//   
//     // support new-style bindings if available
//     if (SC.Binding.flushPendingChanges) SC.Binding.flushPendingChanges();
//     assertEqual("changedValue", this.testObject.get("foo"), "testObject.foo");
//   },
//     
//   // FAILS
//   "bind(.bar) should bind to relative path": function() {
//     // create binding
//     this.testObject.bind("foo", ".bar") ;
//   
//     // now make a change to see if the binding triggers.
//     this.testObject.set("bar", "changedValue") ;
//   
//     // support new-style bindings if available
//     if (SC.Binding.flushPendingChanges) SC.Binding.flushPendingChanges();
//     assertEqual("changedValue", this.testObject.get("foo"), "testObject.foo");
//   },
// 
//   // FAILS
//   "bind(SC.Binding.Bool(TestNamespace.fromObject.bar)) should create binding with bool transform": function() {
//     // create binding
//     this.testObject.bind("foo", SC.Binding.Bool("TestNamespace.fromObject.bar")) ;
//   
//     // now make a change to see if the binding triggers.
//     this.fromObject.set("bar", 1) ;
//   
//     // support new-style bindings if available
//     if (SC.Binding.flushPendingChanges) SC.Binding.flushPendingChanges();
//     assertEqual(YES, this.testObject.get("foo"), "testObject.foo == YES");
// 
//     this.fromObject.set("bar", 0) ;
//   
//     // support new-style bindings if available
//     if (SC.Binding.flushPendingChanges) SC.Binding.flushPendingChanges();
//     assertEqual(NO, this.testObject.get("foo"), "testObject.foo == NO");
//   },
// 
// // FAILS
// "bind(TestNamespace.fromObject*extraObject.foo) should create chained binding": function() {
//   this.testObject.bind("foo", "TestNamespace.fromObject*extraObject.foo");
//   this.fromObject.set("extraObject", this.extraObject) ;
//   
//   // support new-style bindings if available
//   if (SC.Binding.flushPendingChanges) SC.Binding.flushPendingChanges();
//   assertEqual("extraObjectValue", this.testObject.get("foo"), "testObject.foo") ;
// },
// 
//   // FAILS
//   "bind(*extraObject.foo) should create locally chained binding": function() {
//     this.testObject.bind("foo", "*extraObject.foo");
//     this.testObject.set("extraObject", this.extraObject) ;
//     
//     // support new-style bindings if available
//     if (SC.Binding.flushPendingChanges) SC.Binding.flushPendingChanges();
//     assertEqual("extraObjectValue", this.testObject.get("foo"), "testObject.foo") ;
//   }
//   
// });
// 
// Test.context("fooBinding method", {
//   
//   setup: function() {
//     this.TestObject = SC.Object.extend({
//       foo: "bar",
//       bar: "foo",
//       extraObject: null 
//     });
//     
//     this.fromObject = SC.Object.create({
//       bar: "foo",
//       extraObject: null 
//     }) ;
//     
//     this.extraObject = SC.Object.create({
//       foo: "extraObjectValue"
//     }) ;
//         
//     window.TestNamespace = {
//       fromObject: this.fromObject,
//       testObject: this.testObject
//     } ;
//   },
// 
//   teardown: function() { 
//     delete this.TestObject ;
//     delete this.testObject; 
//     delete this.fromObject;
//     delete window.TestNamespace ;
//   },
// 
//   // FAILS
//   "fooBinding: TestNamespace.fromObject.bar should follow absolute path": function() {
//     // create binding
//     this.testObject = this.TestObject.create({
//       fooBinding: "TestNamespace.fromObject.bar"
//     }) ;
//     
//     // now make a change to see if the binding triggers.
//     this.fromObject.set("bar", "changedValue") ;
//     
//   // support new-style bindings if available
//   if (SC.Binding.flushPendingChanges) SC.Binding.flushPendingChanges();
//     assertEqual("changedValue", this.testObject.get("foo"), "testObject.foo");
//   },
//   
//   // FAILS
//   "fooBinding: .bar should bind to relative path": function() {
//     
//     this.testObject = this.TestObject.create({
//       fooBinding: ".bar"
//     }) ;
//     
//     // now make a change to see if the binding triggers.
//     this.testObject.set("bar", "changedValue") ;
// 
//   // support new-style bindings if available
//   if (SC.Binding.flushPendingChanges) SC.Binding.flushPendingChanges();
//     assertEqual("changedValue", this.testObject.get("foo"), "testObject.foo");
//   },
//   
//   // FAILS
//   "fooBinding: SC.Binding.Bool(TestNamespace.fromObject.bar should create binding with bool transform": function() {
// 
//     this.testObject = this.TestObject.create({
//       fooBinding: SC.Binding.Bool("TestNamespace.fromObject.bar") 
//     }) ;
//     
//     // now make a change to see if the binding triggers.
//     this.fromObject.set("bar", 1) ;
// 
//     // support new-style bindings if available
//     if (SC.Binding.flushPendingChanges) SC.Binding.flushPendingChanges();
//     assertEqual(YES, this.testObject.get("foo"), "testObject.foo == YES");
// 
//     this.fromObject.set("bar", 0) ;
// 
//     // support new-style bindings if available
//     if (SC.Binding.flushPendingChanges) SC.Binding.flushPendingChanges();
//     assertEqual(NO, this.testObject.get("foo"), "testObject.foo == NO");
//   },
// 
//   // FAILS
//   "fooBinding: TestNamespace.fromObject*extraObject.foo should create chained binding": function() {
// 
//     this.testObject = this.TestObject.create({
//       fooBinding: "TestNamespace.fromObject*extraObject.foo" 
//     }) ;
// 
//     this.fromObject.set("extraObject", this.extraObject) ;
// 
//     // support new-style bindings if available
//     if (SC.Binding.flushPendingChanges) SC.Binding.flushPendingChanges();
//     assertEqual("extraObjectValue", this.testObject.get("foo"), "testObject.foo") ;
//   },
// 
//   // FAILS
//   "fooBinding: *extraObject.foo should create locally chained binding": function() {
//     this.testObject = this.TestObject.create({
//       fooBinding: "*extraObject.foo" 
//     }) ;
//     this.testObject.set("extraObject", this.extraObject) ;
// 
//     // support new-style bindings if available
//     if (SC.Binding.flushPendingChanges) SC.Binding.flushPendingChanges();
//     assertEqual("extraObjectValue", this.testObject.get("foo"), "testObject.foo") ;
//   }
//   
// });
// 
// Test.context("fooBindingDefault: SC.Binding.Bool (old style)", {
//   
//   setup: function() {
//     this.TestObject = SC.Object.extend({
//       foo: "bar",
//       fooBindingDefault: SC.Binding.Bool,
//       bar: "foo",
//       extraObject: null 
//     });
//     
//     this.fromObject = SC.Object.create({
//       bar: "foo",
//       extraObject: null 
//     }) ;
//     
//     window.TestNamespace = {
//       fromObject: this.fromObject,
//       testObject: this.testObject
//     } ;
//   },
// 
//   teardown: function() { 
//     delete this.TestObject ;
//     delete this.testObject; 
//     delete this.fromObject;
//     delete window.TestNamespace ;
//   },
// 
//   // FAILS
//   "fooBinding: TestNamespace.fromObject.bar should have bool binding": function() {
//     // create binding
//     this.testObject = this.TestObject.create({
//       fooBinding: "TestNamespace.fromObject.bar"
//     }) ;
//     
//     // now make a change to see if the binding triggers.
//     this.fromObject.set("bar", 1) ;
// 
//     // support new-style bindings if available
//     if (SC.Binding.flushPendingChanges) SC.Binding.flushPendingChanges();
//     assertEqual(YES, this.testObject.get("foo"), "testObject.foo == YES");
// 
//     this.fromObject.set("bar", 0) ;
// 
//     // support new-style bindings if available
//     if (SC.Binding.flushPendingChanges) SC.Binding.flushPendingChanges();
//     assertEqual(NO, this.testObject.get("foo"), "testObject.foo == NO");
//   },
//   
//   // FAILS
//   "fooBinding: SC.Binding.Not(TestNamespace.fromObject.bar should override default": function() {
// 
//     this.testObject = this.TestObject.create({
//       fooBinding: SC.Binding.Not("TestNamespace.fromObject.bar") 
//     }) ;
//     
//     // now make a change to see if the binding triggers.
//     this.fromObject.set("bar", 1) ;
// 
//     // support new-style bindings if available
//     if (SC.Binding.flushPendingChanges) SC.Binding.flushPendingChanges();
//     assertEqual(NO, this.testObject.get("foo"), "testObject.foo == NO");
// 
//     this.fromObject.set("bar", 0) ;
// 
//     // support new-style bindings if available
//     if (SC.Binding.flushPendingChanges) SC.Binding.flushPendingChanges();
//     assertEqual(YES, this.testObject.get("foo"), "testObject.foo == YES");
//   }
//   
// });
// 
// Test.context("fooBindingDefault: SC.Binding.bool() (new style)", {
//   
//   setup: function() {
//     this.TestObject = SC.Object.extend({
//       foo: "bar",
//       fooBindingDefault: SC.Binding.bool(),
//       bar: "foo",
//       extraObject: null 
//     });
//     
//     this.fromObject = SC.Object.create({
//       bar: "foo",
//       extraObject: null 
//     }) ;
//     
//     window.TestNamespace = {
//       fromObject: this.fromObject,
//       testObject: this.testObject
//     } ;
//   },
// 
//   teardown: function() { 
//     delete this.TestObject ;
//     delete this.testObject; 
//     delete this.fromObject;
//     delete window.TestNamespace ;
//   },
// 
//   // FAILS
//   "fooBinding: TestNamespace.fromObject.bar should have bool binding": function() {
//     // create binding
//     this.testObject = this.TestObject.create({
//       fooBinding: "TestNamespace.fromObject.bar"
//     }) ;
//     
//     // now make a change to see if the binding triggers.
//     this.fromObject.set("bar", 1) ;
// 
//     // support new-style bindings if available
//     if (SC.Binding.flushPendingChanges) SC.Binding.flushPendingChanges();
//     assertEqual(YES, this.testObject.get("foo"), "testObject.foo == YES");
// 
//     this.fromObject.set("bar", 0) ;
// 
//     // support new-style bindings if available
//     if (SC.Binding.flushPendingChanges) SC.Binding.flushPendingChanges();
//     assertEqual(NO, this.testObject.get("foo"), "testObject.foo == NO");
//   },
//   
//   // FAILS
//   "fooBinding: SC.Binding.Not(TestNamespace.fromObject.bar should override default": function() {
// 
//     this.testObject = this.TestObject.create({
//       fooBinding: SC.Binding.Not("TestNamespace.fromObject.bar") 
//     }) ;
//     
//     // now make a change to see if the binding triggers.
//     this.fromObject.set("bar", 1) ;
// 
//     // support new-style bindings if available
//     if (SC.Binding.flushPendingChanges) SC.Binding.flushPendingChanges();
//     assertEqual(NO, this.testObject.get("foo"), "testObject.foo == NO");
// 
//     this.fromObject.set("bar", 0) ;
// 
//     // support new-style bindings if available
//     if (SC.Binding.flushPendingChanges) SC.Binding.flushPendingChanges();
//     assertEqual(YES, this.testObject.get("foo"), "testObject.foo == YES");
//   }
//   
// });
// 
