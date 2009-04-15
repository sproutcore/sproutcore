// ========================================================================
// ObjectController Tests
// ========================================================================
/*globals module test ok same equals expects */

var c, single, multiple, single_a, empty_a, dummy_a ; // global variables

// An ObjectController will make a content object or an array of content objects 
module("SC.ObjectController", {
  
  setup: function() {
    c = SC.ObjectController.create() ;
    
    single = SC.Object.create({ 
      test: 'NAME0', value: 0, flag: YES, array: [0,0,0],
      object: SC.Object.create({ test: 'NAME1', value: 1, flag: NO, array: [1,1,1] }),
      
      commitChanges: function() {
        this.didCommitChanges = YES ;
      },
      
      didCommitChanges: NO
    });
    
    multiple = [
      SC.Object.create({ test: 'NAME0', value: 0, flag: YES, array: [0,0,0] }),
      SC.Object.create({ test: 'NAME1', value: 1, flag: NO, array: [1,1,1] })
    ] ;
    
    single_a = [
      SC.Object.create({ test: 'NAME0', value: 0, flag: YES, array: [0,0,0] })
    ] ;
    
    empty_a = [] ;
    
    dummy_a = SC.Object.create(SC.Array, {
      length: 2,
      
      replace: function(idx, amt, objects) {
        this._items.replace(idx,amt,objects) ;
        set('length', this._items.length) ;
      },
      
      objectAt: function(idx) {
        return this._items.objectAt(idx) ;
      },
      
      _items: multiple
    });
    
  }
  
});

test("hasNoContent should be true when content != null and false otherwise", function() {
  c.set('content', null) ;
  equals(c.get('hasNoContent'), YES) ;
  
  c.set('content', single) ;
  equals(c.get('hasNoContent'), NO) ;  
});

test("hasSingleContent should be true only when content is a single object", function() {
  c.set('content', null) ;
  equals(c.get('hasSingleContent'), NO) ;
  
  c.set('content', single) ;
  equals(c.get('hasSingleContent'), YES) ;
  
  c.set('content', single_a) ;
  equals(c.get('hasSingleContent'), YES) ;
  
  c.set('content', multiple) ;
  equals(c.get('hasSingleContent'), NO) ;
});

test("hasMultipleContent should be true when content = array with multiple items", function() {
  c.set('content', null) ;
  equals(c.get('hasMultipleContent'), NO) ;
  
  c.set('content', single) ;
  equals(c.get('hasMultipleContent'), NO) ;
  
  c.set('content', single_a) ;
  equals(c.get('hasMultipleContent'), NO) ;
  
  c.set('content', multiple) ;
  equals(c.get('hasMultipleContent'), YES) ;
});

test("GET EMPTY: properties should return null", function() {
  c.set('content', null) ;
  equals((c.get('test') == null), YES) ;
  equals((c.get('value') == null), YES) ;
  equals((c.get('flag') == null), YES) ;
  equals((c.get('array') == null), YES) ;
});

test("GET EMPTY ARRAY: properties should return null", function() {
  c.set('content', empty_a) ;
  equals((c.get('test') == null), YES) ;
  equals((c.get('value') == null), YES) ;
  equals((c.get('flag') == null), YES) ;
  equals((c.get('array') == null), YES) ;
});

test("GET SINGLE: should return properties of content", function() {
  c.set('content', single) ;
  
  equals(c.get('test'), 'NAME0') ;
  equals(c.get('value'), 0) ;
  equals(c.get('flag'), YES) ;
  same(c.get('array'), [0,0,0]) ;
});

test("GET SINGLE ARRAY: should return properties of first content object", function() {
  c.set('content', single_a) ;
  
  equals(c.get('test'), 'NAME0') ;
  equals(c.get('value'), 0) ;
  equals(c.get('flag'), YES) ;
  same(c.get('array'), [0,0,0]) ;
});

test("GET MULTIPLE: should return arrays with values from each content object", function() {
  c.set('content', multiple) ;
  
  same(c.get('test'), ['NAME0', 'NAME1']) ;
  same(c.get('value'), [0,1]) ;
  same(c.get('flag'), [YES, NO]) ;
  
  var ar = c.get('array') ;
  equals(ar.length, 2) ;
  same(ar[0], [0,0,0]) ;
  same(ar[1], [1,1,1]) ;
});

test("GET CONTROLLER FOR VALUE: should return a controller for the requested value if one exists", function() {
  c.set('content', single) ;
  
  equals(c.get('test'), 'NAME0') ;
  equals(c.get('testController'), 'NAME0') ;
  
  equals(c.get('value'), 0) ;
  equals(c.get('valueController'), 0) ;
  
  equals(c.get('flag'), YES) ;
  equals(c.get('flagController'), YES) ;
  
  same(c.get('array'), [0,0,0]) ;
  equals(c.get('arrayController').instanceOf( SC.ArrayController ), YES) ;
  
  equals(c.get('object').instanceOf( SC.Object ), YES) ;
  equals(c.get('objectController').instanceOf( SC.ObjectController ), YES) ;
});

test("SET should notify observers of valueController properties", function() {
  c.set('content', single) ;
  
  var observer = SC.Object.create({
    valueDidChange: function() {
      this.notified = YES ;
    }
  });

  c.addObserver('object', observer, observer.valueDidChange) ;
  c.set('object', SC.Object.create({ test: "NAME12" })) ;
  equals(observer.notified, YES) ;
});

test("SET value should reset the valueController property", function() {
  c.set('content', single) ;
  
  c.set('array', single_a) ;
  equals(c.get('arrayController').get('length'), 1) ;
  c.set('array', empty_a) ;
  equals(c.get('arrayController').get('length'), 0) ;
});

test("SET controller content should reset all valueController properties", function() {
  c.set('content', SC.Object.create({ array: [1,2,3] })) ;
  equals(c.get('arrayController').get('length'), 3) ;
  
  c.set('content', SC.Object.create({ array: [1] })) ;
  equals(c.get('arrayController').get('length'), 1) ;
});

test("SET with no autocommit should store in controller, but not in source object", function() {
  
  c.set('content', single) ;
  equals(c.get('test'), 'NAME0') ;
  
  // edit the content, but don't save.
  c.set('test', 'NAME1') ;
  
  equals(c.get('hasChanges'), YES) ;
  equals(c.get('test'), 'NAME1') ;
  equals(single.get('test'), 'NAME0') ;
  
  // save content.
  equals($ok(c.commitChanges()), YES) ;
  
  equals(c.get('hasChanges'), NO) ;
  equals(c.get('test'), 'NAME1') ;
  equals(single.get('test'), 'NAME1') ;
});

test("SET on null content should allow set but return error on commit", function() {
  c.set('content', null) ;
  c.set('test', 'NAME1') ;
  
  equals($ok(c.commitChanges()), NO) ;
});

test("SET on empty array content should allow set but return error on commit", function() {
  c.set('content', empty_a) ;
  c.set('test', 'NAME1') ;
  
  equals($ok(c.commitChanges()), NO) ;
});

test("SET on single array should copy values to object on commit", function() {
  c.set('content', single) ;
  c.set('test','NAME1') ;
  
  equals($ok(c.commitChanges()), YES) ;
  equals(single.get('test'), 'NAME1') ;
});

test("SET on single-item array should copy values to object on commit", function() {
  c.set('content', single_a) ;
  c.set('test','NAME1') ;
  
  equals($ok(c.commitChanges()), YES) ;
  equals(single_a[0].get('test'), 'NAME1') ;
});

test("SET on multiple with array values should copy value to content object at the same index", function() {
  c.set('content', multiple) ;
  c.set('test', ['NAME2','NAME3'] ) ;
  
  equals($ok(c.commitChanges()), YES) ;
  equals(multiple[0].get('test'), 'NAME2') ;
  equals(multiple[1].get('test'), 'NAME3') ;
});

test("SET on multiple with a non-array value should copy same value to each content object", function() {
  c.set('content', multiple) ;
  c.set('test', 'NAME2') ;
  
  equals($ok(c.commitChanges()), YES) ;
  equals(multiple[0].get('test'), 'NAME2') ;
  equals(multiple[1].get('test'), 'NAME2') ;
});

test("Calling performDiscardChanges() should notify property observers of a change", function() {
  var observer = SC.Object.create({
    notified: 0,
    valueDidChange: function() {
      this.notified = this.notified + 1 ;
    }
  });
  
  c.set('content', single) ;
  c.addObserver('test', observer, observer.valueDidChange) ;
  
  // set the property
  c.set('test', 'NAME2') ;
  equals(c.get('hasChanges'), YES) ;
  equals(observer.notified, 1) ;
  
  c.performDiscardChanges() ;
  equals(c.get('hasChanges'), NO) ;
  equals(observer.notified, 2) ;
});

test("Support commitChanges() on content objects", function() {
  c.set('content', single) ;
  c.set('test', 'NAME2') ;
  
  equals($ok(c.commitChanges()), YES) ;
  equals(single.didCommitChanges, YES) ;
});

test("Should update both values when commitChanges() on content objects", function() {
  SC.RunLoop.begin() ;
    
    var cc = window.cc = SC.ArrayController.create({
      allowsEmptySelection: false,
      allowsMultipleSelection: false
    });
    
    // verify we can resolve our binding path
    same(SC.objectForPropertyPath('cc'), cc, "SC.objectForPropertyPath('cc') found collection controller") ;
    
    var _contentDidChangeCalled = NO ;
    var oc = SC.ObjectController.create({
      contentBinding: 'cc.selection',
      commitChangesImmediately: false,
      
      _contentDidChange: function() {
        _contentDidChangeCalled = YES ;
        return arguments.callee.base.apply(this, arguments) ;
      }
    });
    Contact = SC.Object.extend({});
    
    // need to actually connect the bindings!
    SC.Binding.flushPendingChanges() ;
    
    // verify that the collecition has no selection
    ok(SC.none(cc.getPath('selection')), "collection controller has null or undefined selection") ;
    
    var single = Contact.create({'test' : 'NAME1', 'value' : 0});
    var rcrds = [single] ;
    cc.set('content', rcrds) ;
    
    // verify that the collection controller sees the changes
    equals(cc.get('length'), 1, "array controller return one for .get('length')") ;
    
    // verify that the collecition now has a selection
    equals(cc.getPath('selection.length'), 1, "collection controller has one selected object") ;
    
    // make sure bindings have processed
    SC.Binding.flushPendingChanges() ;
    
    // verify that the object controller's content was updated from the selection
    // test internal implementation
    ok(_contentDidChangeCalled, 'object controller did not get the changes') ;
    ok(oc.get('content') !== null, "oc.get('content') should not be null") ;
    
  SC.RunLoop.end() ;
  
  // make sure bindings have processed
  SC.Binding.flushPendingChanges() ;
  
  oc.set('test', 'NAME2') ;
  oc.set('value', 123) ;
  
  // test internal implementation
  var changes = oc._changes ;
  equals('NAME2', changes['test'], "oc._changes['test']") ;
  equals(123, changes['value'], "oc._changes['value']") ;
  
  equals(YES, oc.get('hasChanges'), "oc.get('hasChanges')") ;
  equals(YES, $ok(oc.commitChanges()), "$ok(oc.commitChanges())") ;
  equals("NAME2", single.get('test'), "single.get(test)") ;
  equals(123, single.get('value'), "single.get(value)") ;
  
  delete cc, oc, Contact ; // cleanup
});

test("Support content objects that implement SC.Array but are not arrays", function() {
  c.set('content', dummy_a) ;
  
  // test initial content
  same(c.get('test'), ['NAME0', 'NAME1']) ;
  same(c.get('value'), [0,1]) ;
  same(c.get('flag'), [YES, NO]) ;
  
  var ar = c.get('array') ;
  equals(ar.length, 2) ;
  same(ar[0], [0,0,0]) ;
  same(ar[1], [1,1,1]) ;
  
  // test changing contents
  c.set('test', 'NAME2') ;
  equals($ok(c.commitChanges()), YES) ;
  equals(dummy_a.objectAt(0).get('test'), 'NAME2') ;
});

test("Support content objects that are not Observable", function() {
  var obj = { 
    test: 'NAME0', value: 0, flag: YES, array: [0,0,0],
    
    commitChanges: function() {
      this.didCommitChanges = YES ;
    },
    
    didCommitChanges: NO
  } ;
  
  c.set('content', obj) ;
  equals(c.get('test'), 'NAME0') ;
  
  c.set('test', 'NAME1') ;
  equals($ok(c.commitChanges()), YES) ;
  
  equals(obj.test, 'NAME1') ;
  equals(obj.didCommitChanges, YES) ;
});

test("Should not set content properties when setting controller properties", function() {
   c.set('content', SC.Object.create()) ;
   c.set('nonContentProp', 'test') ;
   equals(c.getPath('content.nonContentProp'), null) ;
   
   delete c.nonContentProp;
});

test("Support observing non-content properties", function() {
  var observer = SC.Object.create({
    notified: 0,
    valueDidChange: function() {
      this.notified = this.notified + 1 ;
    }
  });
  
  c.addObserver('nonContentProp', observer, observer.valueDidChange) ;
  
  c.set('nonContentProp', 'test') ;
  equals(observer.notified, 1) ;
  
  // Make sure we didn't pass property on to content.
  equals(c.get('content'), null) ;
  
  delete c.nonContentProp;
});

test("Content changes fire observer on non-content properties", function () {
  c.nonContentProp = null ;
  var notified = 0 ;
  var observer = function () {
     if (notified === 0) c.set('content', SC.Object.create()) ;
     notified++; 
  }
  c.addObserver('nonContentProp', c, observer) ;
  
  c.set('nonContentProp', 'test') ;
  equals(notified, 2) ;
  
  delete c.nonContentProp ;
});
