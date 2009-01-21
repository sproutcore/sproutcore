// ========================================================================
// ArrayController Tests
// ========================================================================
/*globals module test ok isObj equals expects */

var c, multiple_a, single_a, empty_a, dummy_a ; // global vars

module("SC.ArrayController", {
  
  setup: function() {
    c = SC.ArrayController.create() ;
    
    multiple_a = [
      SC.Object.create({ test: 'NAME0', value: 0, flag: YES, array: [0,0,0] }),
      SC.Object.create({ test: 'NAME1', value: 1, flag: NO, array: [1,1,1] })
    ];
    
    single_a = [
      SC.Object.create({ test: 'NAME0', value: 0, flag: YES, array: [0,0,0] })
    ];
    
    empty_a = [] ;
    
    dummy_a = SC.Object.create(SC.Array, {
      length: 2,
      replace: function(idx, amt, objects) {
        _items.replace(idx,amt,objects) ;
        set('length', _items.length) ;
      },
      objectAt: function(idx) {
        return _items.objectAt(idx) ;
      },
      _items: multiple_a
    });
  }
  
});

test("Should act like an empty array if it has non array-like content", function() {
  var obj, ary = [null, false, "FOOBAR!", 12, {}] ;
  for (var idx=0, len=ary.length; idx<len; idx++) {
    obj = ary[idx] ;
    c.set('content', obj) ;
    equals(c.isEqual([]), true) ;
    equals(c.get('length'), 0) ;
    equals((c.objectAt(0) == undefined), true) ;
  }
});

test("Should act like a clone of whatever array was set as it's content", function() {
  c.set('content', multiple_a) ;
  equals(c.get('length'), 2) ;
  equals(c.objectAt(0).get('test'), 'NAME0') ;
  equals(c.objectAt(1).get('test'), 'NAME1') ;
  equals((c.objectAt(2) == undefined), true) ;
});

test("Should not clone it's content until a change has been made", function() {
  // note that we're not directly requesting the public 'contentClone' property, because
  // doing so would cause the clone to be created.
  equals((c.get('contentClone') == undefined), true) ;
  c.set('content', multiple_a) ;
  equals((c.get('contentClone') == undefined), true) ;
  c.popObject() ;
  equals((c.get('contentClone') == undefined), false) ;
});

test("Should modify it's managed content when making changes", function() {
  c.set('content', multiple_a) ;
  equals(c.get('content').get('length'), 2) ;
  c.popObject() ;
  equals(c.get('content').get('length'), 2) ;
  equals(c.get('contentClone').get('length'), 1) ;
});

test("Should not modify managed content until commitChanges() if commitChangesImmediately is disabled", function() {
  c.set('commitChangesImmediately', false) ;
  
  var content = multiple_a ;
  c.set('content', content) ;
  equals(content.get('length'), 2) ;
  
  c.popObject() ;
  equals(content.get('length'), 2) ;
  equals(c.get('length'), 1) ;
  
  c.commitChanges() ;
  equals(content.get('length'), 1) ;
  equals(c.get('length'), 1) ;
});

test("Should flag itself as dirty when adding an item to the array", function() {
  c.set('content', multiple_a) ;
  equals(c.get('hasChanges'), false) ;
  c.pushObject(SC.Object.create({ test: 'NAME2' })) ;
  equals(c.get('hasChanges'), true) ;
});

test("Should not delete object on removal only if destroyOnRemoval = true", function() {
  var content = multiple_a ;
  
  c.set('content', content) ;
  c.set('destroyOnRemoval', true) ;
  
  var didDestroy = false ;
  content[0].destroy = function() { didDestroy = true; } ;
  content[1].destroy = function() { didDestroy = true; } ;
  
  c.removeAt(1) ;
  c.commitChanges() ; // force this to happen immediately.  It may be queued otherwise
  equals(didDestroy, true) ;
  
  didDestroy = false ;
  c.set('destroyOnRemoval', false) ;
  c.removeAt(0) ;
  c.commitChanges() ; 
  equals(didDestroy, false) ;
});
