// ========================================================================
// SC.Object Base Tests
// ========================================================================
/*globals module test ok isObj equals expects same plan */

var obj, obj1, don, don1 ; // global variables

module("A new SC.Object instance", {
  
  setup: function() {
    obj = SC.Object.create({
      foo: "bar",
      total: 12345,
      aMethodThatExists: function() {},
      aMethodThatReturnsTrue: function() { return true; },
      aMethodThatReturnsFoobar: function() { return "Foobar"; },
      aMethodThatReturnsFalse: function() { return NO; }
    });
  },
  
  teardown: function() {
    obj = undefined ;
  }
  
});

test("Should identify it's methods using the 'respondsTo' method", function() {
  equals(obj.respondsTo('aMethodThatExists'), true, "method that exists") ;
  equals(obj.respondsTo('aMethodThatDoesNotExist'), false, "method that does not exist") ;
});

test("Should return false when asked to perform a method it does not have", function() {
  equals(obj.tryToPerform('aMethodThatDoesNotExist'), false) ;
});

test("Should pass back the return YES if method returned YES, NO if method not implemented or returned NO", function() {
  equals(obj.tryToPerform('aMethodThatReturnsTrue'), YES, 'method that returns YES') ;
  equals(obj.tryToPerform('aMethodThatReturnsFoobar'), YES, 'method that returns non-NO') ;
  equals(obj.tryToPerform('aMethodThatReturnsFalse'), NO, 'method that returns NO') ;
  equals(obj.tryToPerform('imaginaryMethod'), NO, 'method that is not implemented') ;
});

test("Should return it's properties when requested using SC.Object#get", function() {
  equals(obj.get('foo'), 'bar') ;
  equals(obj.get('total'), 12345) ;
});

test("Should allow changing of those properties by calling SC.Object#set", function() {
  equals(obj.get('foo'), 'bar') ;
  equals(obj.get('total'), 12345) ;
  
  obj.set( 'foo', 'Chunky Bacon' ) ;
  obj.set( 'total', 12 ) ;
  
  equals(obj.get('foo'), 'Chunky Bacon') ;
  equals(obj.get('total'), 12) ;
});

test("Should only advertise changes once per request to SC.Object#didChangeFor", function() {
  obj.set( 'foo', 'Chunky Bacon' );
  equals(obj.didChangeFor( this, 'foo' ), true, "first request") ;
  equals(obj.didChangeFor( this, 'foo' ), false, "second request") ;
});

test("Should advertise changes once per request to SC.Object#didChangeFor when setting property to NULL", function() {
  obj.set( 'foo', null );
  equals(obj.didChangeFor( this, 'foo' ), true, "first request") ;
  equals(obj.didChangeFor( this, 'foo' ), false, "second request") ;
});

test("When the object is destroyed the 'isDestroyed' and 'isDestroyedObservable' status should change accordingly", function() {
	equals(obj.get('isDestroyed'), NO, "Object is destroyed");
	equals(obj.get('isDestroyedObservable'), NO, "Observable is destroyed");
	obj.destroy();
	equals(obj.get('isDestroyed'), YES, "Object is destroyed");
	equals(obj.get('isDestroyedObservable'), YES, "Observable is destroyed");
});


module("SC.Object instance extended", {  
  setup: function() {
    obj = SC.Object.extend();
	obj1 = obj.create();
	don = SC.Object.extend();
	don1 = don.create();
  },
  
  teardown: function() {
    obj = undefined ;
    obj1 = undefined ;
    don = undefined ;
    don1 = undefined ;
  }
  
});

test("Checking the instance of method for an object", function() {
	equals(obj1.instanceOf(obj), YES, "obj1 instance of obj");
	equals(obj1.instanceOf(don), NO, "obj1 instance of don");
});

test("Checking the kind of method for an object", function() {
	equals(obj1.kindOf(obj), YES, "obj1 kind of of obj");
	equals(obj1.kindOf(don), NO, "obj1 kind of don");
	
	equals(SC.kindOf(obj1, obj), YES, "obj1 kind of obj");
	equals(SC.kindOf(obj1, don), NO, "obj1 kind of don");
	equals(SC.kindOf(null, obj1), NO, "null kind of obj1");
});


module("SC.Object superclass and subclasses", {  
  setup: function() {
    obj = SC.Object.extend ({
	  method1: function() {
		return "hello";
	  }
	});
	obj1 = obj.extend();
	don = obj1.create ({
	  method2: function() {
		  return this.superclass();
		}
	});
  },

  teardown: function() {
    obj = undefined ;
    obj1 = undefined ;
    don = undefined ;
  }
});

test("Checking the superclass method for an existing function", function() {
	equals(don.method2().method1(), "hello");
});

test("Checking the subclassOf function on an object and its subclass", function(){
	equals(obj1.subclassOf(obj), YES, "obj1 subclass of obj");
	equals(obj.subclassOf(obj1), NO, "obj subclass of obj1");
});

test("subclasses should contain defined subclasses", function() {
  ok(obj.subclasses.contains(obj1), 'obj.subclasses should contain obj1');
  
  equals(obj1.subclasses.get('length'),0,'obj1.subclasses should be empty');
  
  var kls2 = obj1.extend();
  ok(obj1.subclasses.contains(kls2), 'obj1.subclasses should contain kls2');
});
