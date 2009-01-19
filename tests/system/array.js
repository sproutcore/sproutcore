// ========================================================================
// SC.Array Unit Tests
// ========================================================================
/*globals module test ok isObj equals expects */

var arrays, observer ; // global variables

// Test the SproutCore Array interface on a custom object.
DummyArray = SC.Object.extend(SC.Array, {
  
  length: 0,
  
  content: null,
  
  replace: function(idx, amt, objects) {
    if (!this.content) this.content = [] ;

    this.beginPropertyChanges() ;
    this.content.replace(idx,amt,objects) ;
    
    this.set('length', this.content.length) ;
    this.enumerableContentDidChange() ;
    this.endPropertyChanges() ;
  },
  
  objectAt: function(idx) {
    if (!this.content) this.content = [] ;
    return this.content[idx] ;
  }
  
});

// This is a generic set of tests.  To apply these, create a new contact, and
// call this function passing in a factory function to build your element.
module("Array, DummyArray and SC.SparseArray", {

  setup: function() {
    arrays = [[], DummyArray.create(), SC.SparseArray.create()] ;
    
    // this will record observed changes.
    observer = SC.Object.create({
      
      init: function() {
        arguments.callee.base.apply(this, arguments) ; // sc_super() ;
        
        var that = this ;
        this.observer = function(target, key, value) {
          that.notified[key] = true ;
          that.notifiedValue[key] = value ;
        }.bind(this) ;
      
        this.resetObservers = function() {
          this.notified = {} ;
          this.notifiedValue = {} ;
        } ;
      
        this.observe = function() {
          var keys = SC.$A(arguments) ;
          var loc = keys.length ;
          while(--loc >= 0) {
            this.a.addObserver(keys[loc], this, this.observer) ;
          }
        };
      
        this.didNotify = function(key) {
          return this.notified[key] == true ;
        } ;
        
        this.resetObservers() ;
      }
    });
  }
  
});

test("[].replace(0,0,'X') => ['X'] + notify", function() {
  var ary2 = arrays ;
  for (var idx2=0, len2=ary2.length; idx2<len2; idx2++) {
    observer.a = ary2[idx2] ;
    observer.observe('[]') ;
    observer.a.replace(0,0,['X']) ;
    
    equals(observer.a.length, 1) ;
    equals(observer.a.objectAt(0), 'X') ;
    equals(YES, observer.didNotify('[]'), 'didNotify([])') ;
  }
});

test("[A,B,C,D].replace(1,2,X) => [A,X,D] + notify", function() {
  var ary2 = arrays ;
  for (var idx2=0, len2=ary2.length; idx2<len2; idx2++) {
    observer.a = ary2[idx2] ;
    observer.a.replace(0,0, $w('A B C D')) ;
    observer.observe('[]') ;
    
    observer.a.replace(1,2,['X']) ;
    
    equals(observer.a.get('length'), 3) ;
    equals(observer.a.objectAt(0), 'A') ;
    equals(observer.a.objectAt(1), 'X') ;
    equals(observer.a.objectAt(2), 'D') ;
    equals(observer.didNotify("[]"), YES) ;
  }
});

test("[A,B,C,D].replace(1,2,[X,Y]) => [A,X,Y,D] + notify", function() {
  var ary2 = arrays ;
  for (var idx2=0, len2=ary2.length; idx2<len2; idx2++) {
    observer.a = ary2[idx2] ;
    observer.a.replace(0,0, $w('A B C D')) ;
    observer.observe('[]') ;
    
    observer.a.replace(1,2, $w('X Y')) ;
    
    equals(observer.a.get('length'), 4) ;
    equals(observer.a.objectAt(0), 'A') ;
    equals(observer.a.objectAt(1), 'X') ;
    equals(observer.a.objectAt(2), 'Y') ;
    equals(observer.a.objectAt(3), 'D') ;
    equals(observer.didNotify("[]"), YES) ;
  }
});

test("[A,B].replace(1,0,[X,Y]) => [A,X,Y,B] + notify", function() {
  var ary2 = arrays ;
  for (var idx2=0, len2=ary2.length; idx2<len2; idx2++) {
    observer.a = ary2[idx2] ;
    observer.a.replace(0,0, $w('A B')) ;
    observer.observe('[]') ;
    
    observer.a.replace(1,0, $w('X Y')) ;
    
    equals(observer.a.get('length'), 4) ;
    equals(observer.a.objectAt(0), 'A') ;
    equals(observer.a.objectAt(1), 'X') ;
    equals(observer.a.objectAt(2), 'Y') ;
    equals(observer.a.objectAt(3), 'B') ;
    equals(observer.didNotify("[]"), YES) ;
  }
});

test("[A,B,C,D].replace(2,2) => [A,B] + notify", function() {
  var ary2 = arrays ;
  for (var idx2=0, len2=ary2.length; idx2<len2; idx2++) {
    observer.a = ary2[idx2] ;
    observer.a.replace(0,0, $w('A B C D')) ;
    observer.observe('[]') ;
    
    observer.a.replace(2,2) ;
    
    equals(observer.a.get('length'), 2) ;
    equals(observer.a.objectAt(0), 'A') ;
    equals(observer.a.objectAt(1), 'B') ;
    equals(observer.didNotify("[]"), YES) ;
  }
});

test("[].insertAt(0,X) => [X] + notify", function() {
  var ary2 = arrays ;
  for (var idx2=0, len2=ary2.length; idx2<len2; idx2++) {
    observer.a = ary2[idx2] ;
    observer.observe('[]') ;
    
    observer.a.insertAt(0,['X']) ;
    
    equals(observer.a.get('length'), 1) ;
    equals(observer.a.objectAt(0), 'X') ;
    equals(observer.didNotify("[]"), YES) ;
  }
});

test("[].removeObject(obj) should remove regardless of index position", function() {
  var ary2 = arrays ;
  for (var idx2=0, len2=ary2.length; idx2<len2; idx2++) {
    observer.a = ary2[idx2] ;
    // spec for bug in Rev:402 where removeObject was skipping index 0 when scanning the array
    observer.a.set('[]', $w('A B C')) ;
    equals(observer.a.get('length'), 3) ;
    
    observer.a.removeObject('C') ;
    equals(observer.a.get('length'), 2) ;
    observer.a.removeObject('B') ;
    equals(observer.a.get('length'), 1) ;
    observer.a.removeObject('A') ;
    equals(observer.a.get('length'), 0) ;
  }
});

test("[].objectAt(0) => undefined", function() {
  var ary2 = arrays ;
  for (var idx2=0, len2=ary2.length; idx2<len2; idx2++) {
    observer.a = ary2[idx2] ;
    equals(observer.a.get('length'), 0) ;
    equals((observer.a.objectAt(0) === undefined), YES) ;
  }
});

test("[A,B,C].objectAt(5) => undefined", function() {
  var ary2 = arrays ;
  for (var idx2=0, len2=ary2.length; idx2<len2; idx2++) {
    observer.a = ary2[idx2] ;
    equals(observer.a.get('length'), 0) ;
    observer.a.set('[]', $w('A B C')) ;
    equals(observer.a.get('length'), 3) ;
    equals(observer.a.objectAt(0), 'A') ;
    equals((observer.a.objectAt(5) === undefined), YES) ;
  }
});

test("[A,B,C].set('[]',[X,Y]) => [X,Y] + notify", function() {
  var ary2 = arrays ;
  for (var idx2=0, len2=ary2.length; idx2<len2; idx2++) {
    observer.a = ary2[idx2] ;
    observer.a.replace(0,0, $w('A B C')) ;
    observer.observe('[]') ;
    
    observer.a.set('[]', $w('X Y')) ;
    
    equals(observer.a.get('length'), 2) ;
    equals(observer.a.objectAt(0), 'X') ;
    equals(observer.a.objectAt(1), 'Y') ;
    equals(observer.didNotify('[]'), YES) ;
  }
});

test("[A,B,C] should be Enumerable", function() {
  var ary2 = arrays ;
  for (var idx2=0, len2=ary2.length; idx2<len2; idx2++) {
    observer.a = ary2[idx2] ;
    observer.a.replace(0, 0, $w('A B C')) ;
    
    var cnt = 0 ;
    var items = [] ;
    observer.a.forEach(function( item, idx ) {
      items.push(item) ;
      cnt++ ;
    }) ;
    equals(cnt, observer.a.get('length')) ;
    equals('A', items[0]) ;
    equals('B', items[1]) ;
    equals('C',items[2]) ;
  }
});

test("ary.isEqual() should return true when array contents match", function() {
  var ary2 = arrays ;
  for (var idx2=0, len2=ary2.length; idx2<len2; idx2++) {
    observer.a = ary2[idx2] ;
    observer.a.replace(0,0, $w('A B C')) ;
    
    var ary = $w('A B C') ; // test against a different object.
    equals(observer.a.isEqual(ary), true) ;
    
    ary = $w('A B') ;
    equals(observer.a.isEqual(ary), false) ;
    
    ary = $w('X Y Z') ;
    equals(observer.a.isEqual(ary), false) ;
    
    equals(observer.a.isEqual(observer.a), true) ;
  }
});

// // Test the SproutCore Array interface on native arrays.
// Test.context("SC.Array", ArrayTests(function() { return []; })) ;
// 
// 
// Test.context("DummyArray", ArrayTests(function() { 
//   return DummyArray.create()  ;
// }));

// // This is a generic set of tests.  To apply these, create a new contact, and
// // call this function passing in a factory function to build your element.
// ArrayTests = function(factoryFunc) {
//   return {
//     
//     setup: function() {
//       this.a = factoryFunc() ;
//       
//       // this will record observed changes.
//       var that = this ;
//       this.observer = function(target, key, value) {
//         that.notified[key] = true ;
//         that.notifiedValue[key] = value ;
//       }.bind(this) ;
//       
//       this.resetObservers = function() {
//         this.notified = {} ;
//         this.notifiedValue = {} ;
//       } ;
//       
//       this.observe = function() {
//         var keys = SC.$A(arguments) ;
//         var loc = keys.length ;
//         while(--loc >= 0) {
//           this.a.addObserver(keys[loc], this, this.observer) ;
//         }
//       };
//       
//       this.didNotify = function(key) {
//         return this.notified[key] == true ;
//       } ;
//       
//       this.resetObservers() ;
//     },
//     
//     "[].replace(0,0,'X') => ['X'] + notify": function() {
//       this.observe('[]') ;
//       this.a.replace(0,0,['X']) ;
//       
//       this.a.length.shouldEqual(1) ;
//       this.a.objectAt(0).shouldEqual('X') ;
//       assertEqual(YES, this.didNotify('[]'), 'didNotify([])') ;
//     },
//     
//     "[A,B,C,D].replace(1,2,X) => [A,X,D] + notify": function() {
//       this.a.replace(0,0, $w('A B C D')) ;
//       this.observe('[]') ;
//       
//       this.a.replace(1,2,['X']) ;
//       
//       this.a.get('length').shouldEqual(3) ;
//       this.a.objectAt(0).shouldEqual('A') ;
//       this.a.objectAt(1).shouldEqual('X') ;
//       this.a.objectAt(2).shouldEqual('D') ;
//       this.didNotify("[]").shouldEqual(YES) ;
//     },
//     
//     "[A,B,C,D].replace(1,2,[X,Y]) => [A,X,Y,D] + notify": function() {
//       this.a.replace(0,0, $w('A B C D')) ;
//       this.observe('[]') ;
//       
//       this.a.replace(1,2, $w('X Y')) ;
//       
//       this.a.get('length').shouldEqual(4) ;
//       this.a.objectAt(0).shouldEqual('A') ;
//       this.a.objectAt(1).shouldEqual('X') ;
//       this.a.objectAt(2).shouldEqual('Y') ;
//       this.a.objectAt(3).shouldEqual('D') ;
//       this.didNotify("[]").shouldEqual(YES) ;
//     },
// 
//     "[A,B].replace(1,0,[X,Y]) => [A,X,Y,B] + notify": function() {
//       this.a.replace(0,0, $w('A B')) ;
//       this.observe('[]') ;
//       
//       this.a.replace(1,0, $w('X Y')) ;
//       
//       this.a.get('length').shouldEqual(4) ;
//       this.a.objectAt(0).shouldEqual('A') ;
//       this.a.objectAt(1).shouldEqual('X') ;
//       this.a.objectAt(2).shouldEqual('Y') ;
//       this.a.objectAt(3).shouldEqual('B') ;
//       this.didNotify("[]").shouldEqual(YES) ;
//     },
//     
//     "[A,B,C,D].replace(2,2) => [A,B] + notify": function() {
//       this.a.replace(0,0, $w('A B C D')) ;
//       this.observe('[]') ;
//       
//       this.a.replace(2,2) ;
//       
//       this.a.get('length').shouldEqual(2) ;
//       this.a.objectAt(0).shouldEqual('A') ;
//       this.a.objectAt(1).shouldEqual('B') ;
//       this.didNotify("[]").shouldEqual(YES) ;
//     },
//     
//     "[].insertAt(0,X) => [X] + notify": function() {
//       this.observe('[]') ;
//       this.a.insertAt(0,['X']) ;
//       this.a.get('length').shouldEqual(1) ;
//       this.a.objectAt(0).shouldEqual('X') ;
//       this.didNotify("[]").shouldEqual(YES) ;
//     },
//     
//     "[].removeObject(obj) should remove regardless of index position": function()
//     {
//       // spec for bug in Rev:402 where removeObject was skipping index 0 when scanning the array
//       this.a.set('[]', $w('A B C'));
//       this.a.get('length').shouldEqual(3);
// 
//       this.a.removeObject('C');
//       this.a.get('length').shouldEqual(2);
//       this.a.removeObject('B');
//       this.a.get('length').shouldEqual(1);
//       this.a.removeObject('A');
//       this.a.get('length').shouldEqual(0);
//     },
// 
//     
//     "[].objectAt(0) => undefined": function()
//     {
//       this.a.get('length').shouldEqual(0);
//       (this.a.objectAt(0) === undefined).shouldEqual(YES);
//     },
//     "[A,B,C].objectAt(5) => undefined": function()
//     {
//       this.a.get('length').shouldEqual(0);
//       this.a.set('[]', $w('A B C')) ;
//       this.a.get('length').shouldEqual(3) ;
//       this.a.objectAt(0).shouldEqual('A');
//       (this.a.objectAt(5) === undefined).shouldEqual(YES);
//     },
//     
//     "[A,B,C].set('[]',[X,Y]) => [X,Y] + notify": function() {
//       this.a.replace(0,0, $w('A B C')) ;
//       this.observe('[]') ;
//       
//       this.a.set('[]', $w('X Y')) ;
//       
//       this.a.get('length').shouldEqual(2) ;
//       this.a.objectAt(0).shouldEqual('X') ;
//       this.a.objectAt(1).shouldEqual('Y') ;
//       this.didNotify('[]').shouldEqual(YES) ;
//     },
//     
//     "[A,B,C] should be Enumerable": function() {
//       this.a.replace(0, 0, $w('A B C')) ;
//       
//       var cnt = 0 ;
//       var items = [] ;
//       this.a.forEach(function( item, idx ) {
//         items.push(item) ;
//         cnt++ ;
//       }) ;
//       cnt.shouldEqual(this.a.get('length')) ;
//       assertEqual('A', items[0]) ;
//       assertEqual('B', items[1]) ;
//       assertEqual('C',items[2]) ;
//     },
//     
//     "ary.isEqual() should return true when array contents match": function() {
//       this.a.replace(0,0, $w('A B C')) ;
//       
//       var ary = $w('A B C') ; // test against a different object.
//       this.a.isEqual(ary).shouldEqual(true) ;
//       
//       ary = $w('A B') ;
//       this.a.isEqual(ary).shouldEqual(false) ;
//       
//       ary = $w('X Y Z') ;
//       this.a.isEqual(ary).shouldEqual(false) ;
//       
//       this.a.isEqual(this.a).shouldEqual(true) ;
//     }
//   } ;
// } ;
// 
// // Test the SproutCore Array interface on native arrays.
// Test.context("SC.Array", ArrayTests(function() { return []; })) ;
// 
// // Test the SproutCore Array interface on a custom object.
// DummyArray = SC.Object.extend(SC.Array, {
//   
//   length: 0,
//   
//   content: null,
//   
//   replace: function(idx, amt, objects) {
//     if (!this.content) this.content = [] ;
// 
//     this.beginPropertyChanges() ;
//     this.content.replace(idx,amt,objects) ;
//     
//     this.set('length', this.content.length) ;
//     this.enumerableContentDidChange() ;
//     this.endPropertyChanges() ;
//   },
//   
//   objectAt: function(idx) {
//     if (!this.content) this.content = [] ;
//     return this.content[idx] ;
//   }
// }) ;
// 
// Test.context("DummyArray", ArrayTests(function() { 
//   return DummyArray.create()  ;
// }));
