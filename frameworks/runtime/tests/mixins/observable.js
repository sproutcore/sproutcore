// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/*globals module test ok isObj equals expects */

var object ; // global variables

module("object.get()", {
  
  setup: function() {
    object = SC.Object.create({
      
      normal: 'value',
      numberVal: 24,
      toggleVal: true,

      computed: function() { return 'value'; }.property(),
      
      method: function() { return "value"; },
      
      nullProperty: null,
      
      unknownProperty: function(key, value) {
        this.lastUnknownProperty = key ;
        return "unknown" ;
      }
      
    });
  }
  
});

test("should get normal properties", function() {
  equals(object.get('normal'), 'value') ;
});

test("should call computed properties and return their result", function() {
  equals(object.get("computed"), "value") ;
});

test("should return the function for a non-computed property", function() {
  var value = object.get("method") ;
  equals(SC.typeOf(value), SC.T_FUNCTION) ;
});

test("should return null when property value is null", function() {
  equals(object.get("nullProperty"), null) ;
});

test("should call unknownProperty when value is undefined", function() {
  equals(object.get("unknown"), "unknown") ;
  equals(object.lastUnknownProperty, "unknown") ;
});


module("object.set()", {
  
  setup: function() {
    object = SC.Object.create({
      
      // normal property
      normal: 'value',
      
      // computed property
      _computed: "computed",
      computed: function(key, value) {
        if (value !== undefined) {
          this._computed = value ;
        }
        return this._computed ;
      }.property(),
      
      // method, but not a property
      _method: "method",
      method: function(key, value) {
        if (value !== undefined) {
          this._method = value ;
        }
        return this._method ;
      },
      
      // null property
      nullProperty: null,
      
      // unknown property
      _unknown: 'unknown',
      unknownProperty: function(key, value) {
        if (value !== undefined) {
          this._unknown = value ;
        }
        return this._unknown ;
      }
      
    });
  }

});

test("should change normal properties and return this", function() {
  var ret = object.set("normal", "changed") ;
  equals(object.normal, "changed") ;
  equals(ret, object) ;
});

test("should call computed properties passing value and return this", function() {
  var ret = object.set("computed", "changed") ;
  equals(object._computed, "changed") ;
  equals(SC.typeOf(object.computed), SC.T_FUNCTION) ;
  equals(ret, object) ;
});

test("should replace the function for a non-computed property and return this", function() {
  var ret = object.set("method", "changed") ;
  equals(object._method, "method") ; // make sure this was NOT run
  ok(SC.typeOf(object.method) !== SC.T_FUNCTION) ;
  equals(ret, object) ;
});

test("should replace prover when property value is null", function() {
  var ret = object.set("nullProperty", "changed") ;
  equals(object.nullProperty, "changed") ;
  equals(object._unknown, "unknown"); // verify unknownProperty not called.
  equals(ret, object) ;
});

test("should call unknownProperty with value when property is undefined", function() {
  var ret = object.set("unknown", "changed") ;
  equals(object._unknown, "changed") ;
  equals(ret, object) ;
});


module("Observable objects & object properties ", {
  
  setup: function() {
    object = SC.Object.create({
      
      normal: 'value',
	  abnormal: 'zeroValue',
      numberVal: 24,
      toggleVal: true,
      observedProperty:'beingWatched',
	  testRemove:'observerToBeRemoved',	

      automaticallyNotifiesObserversFor: function(key) { 
	    return NO;
	  },
	  
	  getEach: function() {
	    	var keys = ['normal','abnormal'];
	    	var ret = [];
	    	for(var idx=0; idx<keys.length;idx++) {
	      		ret[ret.length] = this.getPath(keys[idx]);
	    	}
	    	return ret ;
	  },
	  
	  newObserver:function(){
			this.abnormal = 'changedValueObserved';
	  },
	
	  testObserver:function(){
			this.abnormal = 'removedObserver';
	  }
	
    });
  }
  
});

// CAJ:
// it's not clear here what you are testing from your description.  make it 
// clear you are testing the incrementProperty() and decrementProperty().
// the way these test descriptions are written if someone sees them in the
// test runner, they won't know what methods you are testing.
test('should increment and decrement the value of a property',function(){
  	var newValue = object.incrementProperty('numberVal');
    equals(25,newValue);
	object.numberVal = 24;
	newValue = object.decrementProperty('numberVal');
    equals(23,newValue);
});

// CAJ:
// same as above.  you should mention the names of the method you are testing 
// in the test description so that someone who is viewing the unit test 
// results can tell what it is.
test('should toggle with value of a property',function(){
  	equals(object.toggleProperty('toggleVal',true,false),object.get('toggleVal')); 
    equals(object.toggleProperty('toggleVal',true,false),object.get('toggleVal'));
    equals(object.toggleProperty('toggleVal',undefined,undefined),object.get('toggleVal'));
});

// CAJ: This test doesn't make much sense.  It's testing the method you 
// defines on the example object above.  You actually need to set the property
// and verify that an observer does not fire on it when this function returns
// false.
test('should not notify the observers automatically',function(){
  	equals(NO,object.automaticallyNotifiesObserversFor('normal')); 
});

// CAJ:  This is not how getEach should work.  In fact, that this works is 
// probably a bug.  You should need to call:
//   object.getEach('value', 'zeroValue');
// to get the results you are testing for here.
//
// In fact, you should add another test to verify that calling 
// object.getEach() with no params will return an empty array (since no keys
// were passed)
//
test("getEach(): should get all the values for the keys",function(){
     var valueArray = object.getEach();
     equals(valueArray[0],'value');
     equals(valueArray[1],'zeroValue');
});

// CAJ:  This test is wrong.  You should add an observer by passing the 
// object and then the method you want invoked. For example:
//
//  object.addObserver('observedProperty', object, object.newObserver);  <-- no ()!
//
// then, to trigger the observer, you need to change the property value by 
// using set:
//
//  object.set('observedProperty', 'beingObserved') ;
//
// calling set() on an object triggers the observer in addition to changing
// the value.
//
// it looks like you test this properly belo actually (see 'should register 
// an observer for a property')  so you could probably just remove this test.
//
test("addObserver(): should add an observer",function(){
	object.addObserver('observedProperty',object,object.newObserver());
	object.observedProperty = 'beingObserved';
	equals(object.abnormal,'changedValueObserved') ;
});

module("object.addObserver()", {	
	setup: function() {
				
		ObjectC = SC.Object.create({
			normal: 'value',
			normal1: 'zeroValue',
			normal2: 'dependentValue',
			incrementor: 10,
										
			action: function() {
				this.normal1= 'newZeroValue';
			},
			
			observeOnceAction: function() {
				this.incrementor= this.incrementor+1;
			}
		});
   	}
});

test("should register an observer for a property", function() {
	ObjectC.addObserver('normal', ObjectC, 'action');
	ObjectC.set('normal','newValue');
	equals(ObjectC.normal1, 'newZeroValue');
});

module("object.removeObserver()", {	
	setup: function() {
		ObjectD = SC.Object.create({
			normal: 'value',
			normal1: 'zeroValue',
			normal2: 'dependentValue',
			ArrayKeys: ['normal','normal1'],
						
			addAction: function() {
				this.normal1= 'newZeroValue';
			},
			
			removeAction: function() {
				this.normal2= 'newDependentValue';
			}
		});
   	}
});

test("should unregister an observer for a property", function() {
	ObjectD.addObserver('normal', ObjectD, 'addAction');
	ObjectD.set('normal','newValue');
	equals(ObjectD.normal1, 'newZeroValue');
	
	ObjectD.set('normal1','zeroValue');
	
	ObjectD.removeObserver('normal', ObjectD, 'addAction');
	ObjectD.set('normal','newValue');
	equals(ObjectD.normal1, 'zeroValue');	
});


test("should unregister an observer for a property - special case when key has a '.' in it.", function() {
		// CAJ:  I provided info in my last email about what you should put here.
});



module("Bind function ", {
  
  setup: function() {
    objectA = SC.Object.create({
      name: "Sproutcore",
      location: "Timbaktu"
    });

   	objectB = SC.Object.create({
      normal: "value",
 	  computed:function(){
		this.normal = 'newValue';
	  }
    }) ;
         
    Namespace = {
      objectA: objectA,
	  objectB: objectB	
    } ;
  }
});

test("should bind property with method parameter as undefined", function() {
  // creating binding
  objectA.bind("name", "Namespace.objectB.normal",undefined) ;
  SC.Binding.flushPendingChanges() ; // actually sets up up the binding
  
  // now make a change to see if the binding triggers.
  objectB.set("normal", "changedValue") ;
  
  // support new-style bindings if available
  SC.Binding.flushPendingChanges();
  equals("changedValue", objectA.get("name"), "objectA.name is binded");
});
