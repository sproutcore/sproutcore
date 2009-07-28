// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Apple Inc. and contributors.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/*global module test equals context ok same notest */

var source, indexes, observer, obj ; // base array to work with
module("SC.RangeObserver#create", {
  setup: function() {
    
    // create array with 5 SC.Object's in them
    source = [1,2,3,4,5].map(function(x) {
      return SC.Object.create({ item: x, foo: "bar" }) ;
    }, this); 

    indexes = SC.IndexSet.create(2,2); // select 2..3
    
    observer = SC.Object.create({
      
      callCount: 0, 
      
      rangeDidChange: function() { 
        this.callCount++;
      }
      
    });

    obj = SC.RangeObserver.create(source, indexes, observer, observer.rangeDidChange, "context", YES);
    
  }
});

test("returns new instance", function() {
  ok(obj && obj.isRangeObserver, 'returns range observer');
});

test("sets up observing on properties for each object in range in index if isDeep", function() {
  var len = source.length, idx;
  for(idx=0;idx<len;idx++) {
    source[idx].set('foo', 'baz');
  }
  equals(observer.callCount, 2, 'range observer should fire twice');
});

test("does not observe object properties if isDeep is NO", function() {
  // remove unneeded observer
  obj.destroy();
  
  // use new observer
  obj = SC.RangeObserver.create(source, indexes, observer, observer.rangeDidChange, "context", NO);
  
  var len = source.length, idx;
  for(idx=0;idx<len;idx++) {
    source[idx].set('foo', 'baz');
  }
  equals(observer.callCount, 0, 'range observer should not fire');
});
