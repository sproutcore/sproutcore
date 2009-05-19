// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

// The TreeItemObserver is tested based on the common use cases.

var content, delegate, flattened, obs, extra, extrachild;

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
  },

  // This method is used to record range change info
  
  rangeIndexes: null,
  rangeCallCount: 0,
  
  rangeDidChange: function(array, objects, key, indexes) {
    this.rangeCallCount++;
    this.rangeIndexes = indexes.frozenCopy();
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
      
    extra = TestObject.create({ title: "EXTRA" });
    
    extrachild = TestObject.create({
      title: "EXTRA",
      isExpanded: YES,
      children: "0 1 2".w().map(function(x) { 
        return TestObject.create({ title: "EXTRA.%@".fmt(x) });
      })
    });
    
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
    
    obs.addRangeObserver(null, delegate, delegate.rangeDidChange);
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

function verifyObjectAt(obs, expected, eindexes, desc) {
  var idx, len = expected.get('length'), actual;

  // eindexes is optional
  if (desc === undefined) {
    desc = eindexes;
    eindexes = undefined;
  }
  
  equals(obs.get('length'), len, "%@ - length should match".fmt(desc));
  for(idx=0;idx<len;idx++) {
    actual = obs.objectAt(idx);
    equals(actual, expected[idx], "%@ - observer.objectAt(%@) should match expected".fmt(desc, idx));
  }
  
  if (eindexes !== undefined) {
    if (eindexes) {
      ok(delegate.rangeCallCount>0, 'range observer should be called (actual callCount=%@)'.fmt(delegate.rangeCallCount));
    } else {
      ok(delegate.rangeCallCount===0, 'range observer should NOT be called (actual callCount=%@)'.fmt(delegate.rangeCallCount));
    }
    
    same(delegate.rangeIndexes, eindexes, 'range observer should be called with expected indexes');
  }
  
}

test("objectAt on create", function() {
  verifyObjectAt(obs, flattened, null, "on create");
});

// ..........................................................
// CHANGING MODEL LAYER CONTENT - TOP LEVEL/NO CHILDREN
// 

test("pushing object to top level with no children", function() {

  SC.run(function() { content.pushObject(extra); });
  flattened.pushObject(extra);

  var change = SC.IndexSet.create(flattened.length-1);
  verifyObjectAt(obs, flattened, change, "after pushing top level object");
});

test("popping object to top level with no children", function() {
  SC.run(function() { content.popObject(); });
  flattened.popObject();

  var change = SC.IndexSet.create(flattened.length);
  verifyObjectAt(obs, flattened, change, "after popping top level object");
});

test("inserting object in middle of top level with no children", function() {
  SC.run(function() { content.insertAt(2,extra); });
  flattened.insertAt(12, extra);

  var change = SC.IndexSet.create(12,flattened.length-12);
  verifyObjectAt(obs, flattened, change, "after pushing top level object");
});

test("replacing object at top level with no children", function() {
  SC.run(function() { content.replace(2,1, [extra]); });
  flattened.replace(12, 1, [extra]);

  var change = SC.IndexSet.create(12);
  verifyObjectAt(obs, flattened, change, "after pushing top level object");
});

test("removing object at top level with no children", function() {
  SC.run(function() { content.removeAt(2); });
  flattened.removeAt(12);

  var change = SC.IndexSet.create(12, flattened.length-11);
  verifyObjectAt(obs, flattened, change,"after pushing top level object");
});

// ..........................................................
// CHANGING MODEL LAYER CONTENT - GROUP LEVEL
// 

test("pushing object to group", function() {
  var base = content[1].children;
  SC.run(function() { base.pushObject(extra); });
  flattened.insertAt(12, extra);

  // changed reflect nearest top-level group
  var change = SC.IndexSet.create(6, flattened.length-6);
  verifyObjectAt(obs, flattened, change, "after pushing");
});

test("popping object from group", function() {
  var base = content[1].children;
  SC.run(function() { base.popObject(); });
  flattened.removeAt(11);

  // changed reflect nearest top-level group
  var change = SC.IndexSet.create(6, flattened.length-5);
  verifyObjectAt(obs, flattened, change, "after popping");
});

test("inserting object in middle of group", function() {
  var base = content[1].children;
  SC.run(function() { base.insertAt(2,extra); });
  flattened.insertAt(9, extra);

  // changed reflect nearest top-level group
  var change = SC.IndexSet.create(6, flattened.length-6);
  verifyObjectAt(obs, flattened, change, "after insert");
});

test("replacing object in group", function() {
  var base = content[1].children;
  SC.run(function() { base.replace(2,1, [extra]); });
  flattened.replace(9, 1, [extra]);

  // changed reflect nearest top-level group
  var change = SC.IndexSet.create(6, flattened.length-7);
  verifyObjectAt(obs, flattened, change, "after replacing");
});

test("removing object in gorup", function() {
  var base = content[1].children;
  SC.run(function() { base.removeAt(2); });
  flattened.removeAt(9);

  // changed reflect nearest top-level group
  var change = SC.IndexSet.create(6, flattened.length-5);
  verifyObjectAt(obs, flattened, change, "after removing");
});

test("replacing group children array", function() {
  var children = extrachild.children;
  SC.run(function() { content[1].set('children', children); });
  flattened.replace(7,5,children);
  
  // changed reflect nearest top-level group
  var change = SC.IndexSet.create(6, flattened.length-4);
  verifyObjectAt(obs, flattened, change, "after removing");
});

test("changing expansion property on group", function() {
  SC.run(function() { content[1].set('isExpanded', NO); });
  flattened.removeAt(7,5);
  
  // changed reflect nearest top-level group
  var change = SC.IndexSet.create(6, flattened.length-1);
  verifyObjectAt(obs, flattened, change, "after removing");
});

// ..........................................................
// CHANGING MODEL LAYER CONTENT - TOP LEVEL, W CHILDREN, NOT EXPANDED
// 

test("pushing object to top level with children, not expanded", function() {
  extrachild.set('isExpanded', NO);
  SC.run(function() { content.pushObject(extrachild); });
  flattened.pushObject(extrachild);
  verifyObjectAt(obs, flattened, "after pushing top level object");
});

test("inserting object in middle of top level with children, not expanded", function() {
  extrachild.set('isExpanded', NO);
  SC.run(function() { content.insertAt(2,extrachild); });
  flattened.insertAt(12, extrachild);
  verifyObjectAt(obs, flattened, "after pushing top level object");
});

// ..........................................................
// CHANGING MODEL LAYER CONTENT - TOP LEVEL/CHILDREN/EXPANDED
// 

test("pushing object to top level with children", function() {
  SC.run(function() { content.pushObject(extrachild); });
  flattened.replace(flattened.length,0,[extrachild]);
  flattened.replace(flattened.length,0,extrachild.children);
  
  verifyObjectAt(obs, flattened, "after pushing top level object");
});

test("popping object at top level with children", function() {
  SC.run(function() { 
    content.popObject(); // first one has no children
    content.popObject(); // second one has children 
  });
  
  flattened.length=6; // truncate
  verifyObjectAt(obs, flattened, "after popping top level object");
});

test("inserting object in middle of top level with children", function() {
  SC.run(function() { content.insertAt(2,extrachild); });
  flattened.replace(12,0,[extrachild]);
  flattened.replace(13,0,extrachild.children);
  verifyObjectAt(obs, flattened, "after pushing top level object");
});

test("inserting object in middle of top level between items with children", function() {
  SC.run(function() { content.insertAt(1,extrachild); });
  flattened.replace(6,0,[extrachild]);
  flattened.replace(7,0,extrachild.children);
  verifyObjectAt(obs, flattened, "after pushing top level object");
});

test("replacing object at top level with no children => children", function() {
  SC.run(function() { content.replace(2,1, [extrachild]); });
  flattened.replace(12,1,[extrachild]);
  flattened.replace(13,0,extrachild.children);
  verifyObjectAt(obs, flattened, "after inserting top level object");
});

test("replacing object at top level with children => children", function() {
  SC.run(function() { content.replace(1,1, [extrachild]); });
  flattened.replace(6,6,[extrachild]);
  flattened.replace(7,0,extrachild.children);
  verifyObjectAt(obs, flattened, "after replacing top level object");
});

test("removing object at top level with children", function() {
  SC.run(function() { content.removeAt(1); });
  flattened.replace(6,6,null);
  verifyObjectAt(obs, flattened, "after removing top level object");
});

