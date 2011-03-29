// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

var callCount, obj;

module("SC.Observers.isObservingSuspended", {
  setup: function() {
    callCount = 0;
    
    obj = SC.Object.create({ 
      foo: "bar",

      fooDidChange: function() { 
        callCount++; 
      }.observes('foo')
    });
  }
});

test("suspending observers stops notification", function() {
  SC.Observers.suspendPropertyObserving();
  SC.Observers.suspendPropertyObserving();
  obj.set("foo");
  equals(callCount, 0, 'should not notify observer while suspended');

  SC.Observers.resumePropertyObserving();
  equals(callCount, 0, 'should not notify observer while still suspended');
  
  SC.Observers.resumePropertyObserving();
  equals(callCount, 1, 'should notify observer when resumed');
  
});

// ..........................................................
// SPECIAL CASES
// 

// this test verifies a specific bug in the SC.Observing.propertyDidChange method.
test("suspended notifications should work when nesting property change groups", function() {
  
  SC.Observers.suspendPropertyObserving();
  obj.beginPropertyChanges();
  obj.set("foo");
  equals(callCount, 0, 'should not notify observer while suspended');

  obj.endPropertyChanges();
  equals(callCount, 0, 'should not notify observer while suspended');

  SC.Observers.resumePropertyObserving();
  equals(callCount, 1, 'should notify observer when resumed');
});


module("SC.Observers.addObserver");

test("Object not yet instantiated", function() {
  var garage, car, observer, queueLength;
  
  garage = SC.Object.create({
    car: SC.Object.extend({
      make: null
    })
  });
  
  car = garage.get('car');
  
  observer = SC.Object.create({
    callCount: 0,
    makeDidChange: function() {
      this.callCount += 1;
    }
  });
  
  ok(car.isClass, "The car object is not yet an instance, it's a class for now.");
  
  queueLength = SC.Observers.queue.length;
  SC.Observers.addObserver('car.make', observer, 'makeDidChange', garage);
  equals(SC.Observers.queue.length, queueLength + 1, "The observer should have been queued because the car object is a class, not an instance.");
  
  car = garage.car = car.create({ make: 'Renault' });
  
  SC.Observers.flush(garage);
  
  car.set('make', 'Ferrari');
  equals(observer.callCount, 1, "The observer should have been called once.");
});
