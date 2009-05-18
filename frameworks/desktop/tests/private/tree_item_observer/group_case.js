// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

// The TreeItemObserver is tested based on the common use cases.

var content, delegate, flattened, obs;

// default delegate class.  Does the bare minimum for tree item to function
var Delegate = SC.Object.extend(SC.TreeItemDelegate, {
  
  content: null, // must contain content array
  
  treeItemChildren: function(item, parent, index) {
    if (index<0) return this.get('content');
    else if (item) return item.get ? item.get('children') : item.children;
    else return null;
  },
  
  treeItemDisclosureState: function(item, parent, idx) {
    if (!item) return SC.LEAF_NODE;
    else return item.get('isExpanded') ? SC.BRANCH_OPEN : SC.BRANCH_CLOSED;
  }
  
});

var TestObject = SC.Object.extend({
  toString: function() { return "TestObject(%@)".fmt(this.get('title')); }
});

module("SC._TreeItemObserver - Group Use Case", {
  setup: function() {
    content = [
      TestObject.create({
        isGroup: YES,
        title: "A",
        isExpanded: YES,
        children: "0 1 2 3 4".w().map(function(x) { 
          return TestObject.create({ title: "A.%@".fmt(x) });
        })
      }),

      TestObject.create({
        isGroup: YES,
        title: "B",
        isExpanded: YES,
        children: "0 1 2 3 4".w().map(function(x) { 
          return TestObject.create({ title: "B.%@".fmt(x) });
        })
      }),

      TestObject.create({
        isGroup: YES,
        title: "C",
        isExpanded: NO,
        children: "0 1 2 3 4".w().map(function(x) { 
          return TestObject.create({ title: "C.%@".fmt(x) });
        })
      })];
      
    flattened = [
      content[0],
      content[0].children[0],
      content[0].children[1],
      content[0].children[2],
      content[0].children[3],
      content[0].children[4],
      content[1],
      content[1].children[0],
      content[1].children[1],
      content[1].children[2],
      content[1].children[3],
      content[1].children[4],
      content[2]];
      
    delegate = Delegate.create({ content: content });

    // create root observer
    obs = SC._TreeItemObserver.create({
      delegate: delegate, children: content
    });
  },
  
  teardown: function() {
    if (obs) obs.destroy(); // cleanup
    content = delegate = obs = null ;
  }
});


// ..........................................................
// LENGTH
// 

test("length on create", function() {
  equals(obs.get('length'), flattened.length, 'should have length of array on create');
});


// ..........................................................
// OBJECT AT
// 

function verifyObjectAt(obs, expected, desc) {
  var idx, len = expected.get('length'), actual;

  equals(obs.get('length'), len, "%@ - length should match".fmt(desc));
  for(idx=0;idx<len;idx++) {
    actual = obs.objectAt(idx);
    equals(actual, expected[idx], "%@ - observer.objectAt(%@) should match expected".fmt(desc, idx));
  }
}

test("objectAt on create", function() {
  verifyObjectAt(obs, flattened, "on create");
});
