// ========================================================================
// SC.Object Base Tests
// ========================================================================
/*globals module test ok isObj equals expects */

var obj ; // global variables

module("A new SC.Object instance", {
  
  setup: function() {
    obj = SC.Object.create({
      foo: "bar",
      total: 12345,
      aMethodThatExists: function() {},
      aMethodThatReturnsTrue: function() { return true; },
      aMethodThatReturnsFoobar: function() { return "Foobar"; }
    });
  },
  
  teardown: function() {
    obj = undefined ;
  }
  
});

test("Should identify it's methods using the 'respondsTo' method", function() {
  equals(obj.respondsTo('aMethodThatExists'), true) ;
  equals(obj.respondsTo('aMethodThatDoesNotExist'), false) ;
});

test("Should return false when asked to perform a method it does not have", function() {
  equals(obj.tryToPerform('aMethodThatDoesNotExist'), false) ;
});

test("Should pass back the return value of a method it was asked to perform", function() {
  equals(obj.tryToPerform('aMethodThatReturnsTrue'), true) ;
  equals(obj.tryToPerform('aMethodThatReturnsFoobar'), "Foobar") ;
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
  equals(obj.didChangeFor( this, 'foo' ), true) ;
  equals(obj.didChangeFor( this, 'foo' ), false) ;
});

test("Should advertise changes once per request to SC.Object#didChangeFor when setting property to NULL", function() {
  obj.set( 'foo', null );
  equals(obj.didChangeFor( this, 'foo' ), true) ;
  equals(obj.didChangeFor( this, 'foo' ), false) ;
});
