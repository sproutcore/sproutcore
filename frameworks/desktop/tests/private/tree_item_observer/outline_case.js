// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

// The TreeItemObserver is tested based on the common use cases.

var content, delegate, obs, flattened;

// default delegate class.  Does the bare minimum for tree item to function
var Delegate = SC.Object.extend(SC.TreeItemDelegate, {
  
  content: null, // must contain content array
  
  treeItemChildren: function(item, parent, index) {
    if (item) return item.get ? item.get('children') : item.children;
    else return parent ? null : this.get('content');
  },

  treeItemDisclosureState: function(item, parent, idx) {
    if (item && this.treeItemChildren(item,parent,idx)) {
      return item.get('isExpanded') ? SC.BRANCH_OPEN : SC.BRANCH_CLOSED;
    } else return SC.LEAF_NODE;
  }

});

var TestObject = SC.Object.extend({
  toString: function() { return "TestObject(%@)".fmt(this.get('title')); }
});


module("SC._TreeItemObserver - Outline Use Case", {
  setup: function() {
    content = [
      TestObject.create({
        title: "A",
        isExpanded: YES,
        
        children: [
          TestObject.create({ title: "A.i" }),

          TestObject.create({ title: "A.ii",
            isExpanded: NO,
            children: [
              TestObject.create({ title: "A.ii.1" }),
              TestObject.create({ title: "A.ii.2" }),
              TestObject.create({ title: "A.ii.3" })]
          }),

          TestObject.create({ title: "A.iii" })]
      }),

      TestObject.create({
        title: "B",
        isExpanded: YES,

        children: [
          TestObject.create({ title: "B.i",
            isExpanded: YES,
            children: [
              TestObject.create({ title: "B.i.1" }),
              TestObject.create({ title: "B.i.2" }),
              TestObject.create({ title: "B.i.3" })]
          }),

          TestObject.create({ title: "B.ii" }),
          TestObject.create({ title: "B.iii" })]
      }),

      TestObject.create({
        isGroup: NO,
        title: "C"
      })];

    flattened = [
      content[0],
      content[0].children[0],
      content[0].children[1],
      content[0].children[2],
      content[1],
      content[1].children[0],
      content[1].children[0].children[0],
      content[1].children[0].children[1],
      content[1].children[0].children[2],
      content[1].children[1],
      content[1].children[2],
      content[2]];    
        
    delegate = Delegate.create({ content: content });

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
