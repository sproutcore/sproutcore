// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
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

    // figure out the range that changed.  If amt + objects are the same, use
    // amt.  Otherwise use total length.
    var len = objects ? objects.get('length') : 0;
    this.enumerableContentDidChange(idx, amt, len - amt) ;
    this.endPropertyChanges() ;
  },
  
  objectAt: function(idx) {
    if (!this.content) this.content = [] ;
    return this.content[idx] ;
  }
  
});

SC.ArraySuite.generate("DummyArray", {
  newObject: function(expected) {
    if (!expected || typeof expected === SC.T_NUMBER) {
      expected = this.expected(expected); 
    }
    return DummyArray.create({ content: expected, length: expected.length }) ;
  }
});

