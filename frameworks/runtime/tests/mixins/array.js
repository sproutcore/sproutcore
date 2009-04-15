// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

// Unit test some standard SC.Array implementations.

// ..........................................................
// BUILT-IN ARRAY
// 

SC.ArraySuite.generate("built-in Array");

// ..........................................................
// DUMMY ARRAY (BASIC FAKE IMPLEMENTATION)
// 

// Test the SproutCore Array interface on a custom object.
var DummyArray = SC.Object.extend(SC.Array, {
  
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

SC.ArraySuite.generate("DummyArray", {
  newObject: function(amt) {
    if (amt === undefined) amt = 0;
    var ret = [];
    while(--amt >= 0) ret[amt] = amt ;
    return DummyArray.create({ content: ret, length: ret.length }) ;
  }
});

