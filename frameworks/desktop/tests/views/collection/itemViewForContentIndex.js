// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            portions copyright @2009 Apple Inc.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

var view, del, content ;

module("SC.CollectionView.itemViewForContentIndex", {
  setup: function() {
    content = "a b c".w().map(function(x) { 
      return SC.Object.create({ title: x });
    });
    
    del = {
      fixture: {
        isEnabled: YES,
        isSelected: YES,
        outlineLevel: 3,
        disclosureState: SC.LEAF_NODE
      },
      
      contentIndexIsEnabled: function() { 
        return this.fixture.isEnabled; 
      },
      
      contentIndexIsSelected: function() { 
        return this.fixture.isSelected; 
      },

      contentIndexOutlineLevel: function() { 
        return this.fixture.outlineLevel; 
      },
      
      contentIndexDisclosureState: function() {
        return this.fixture.disclosureState ;
      }
    };

    // NOTE: delegate methods above are added here.
    view = SC.CollectionView.create(del, {
      content: content,
      
      layoutForContentIndex: function(contentIndex) {
        return this.fixtureLayout ;
      },
      
      fixtureLayout: { left: 0, right: 0, top:0, bottom: 0 },
      
      groupExampleView: SC.View.extend(), // custom for testing
      
      exampleView: SC.View.extend(), // custom for testing
      
      testAsGroup: NO,
      
      contentIndexIsGroup: function() { return this.testAsGroup; },
      
      contentGroupIndexes: function() {
        if (this.testAsGroup) {
          return SC.IndexSet.create(0, this.get('length'));
        } else return null ;
      },
      
      fixtureNowShowing: SC.IndexSet.create(0,3),
      computeNowShowing: function() {
        return this.fixtureNowShowing;
      }
      
    });
    
    // add in delegate mixin
    del = SC.mixin({}, SC.CollectionContent, del);
    
  }
});

function shouldMatchFixture(itemView, fixture) {
  var key;
  for(key in fixture) {
    if (!fixture.hasOwnProperty(key)) continue;
    equals(itemView.get(key), fixture[key], 'itemView.%@ should match delegate value'.fmt(key));
  }
}

test("creating basic item view", function() {
  var itemView = view.itemViewForContentIndex(1);
  
  // should use exampleView
  ok(itemView, 'should return itemView');
  ok(itemView.kindOf(view.exampleView), 'itemView %@ should be kindOf %@'.fmt(itemView, view.exampleView));
  
  // set added properties
  equals(itemView.get('content'), content.objectAt(1), 'itemView.content should be set to content item');
  equals(itemView.get('contentIndex'), 1, 'itemView.contentIndex should be set');
  equals(itemView.get('owner'), view, 'itemView.owner should be collection view');
  equals(itemView.get('displayDelegate'), view, 'itemView.displayDelegate should be collection view');
  equals(itemView.get('parentView'), view, 'itemView.parentView should be collection view');
  
  // test data from delegate
  shouldMatchFixture(itemView, view.fixture);
});

test("returning item from cache", function() {
  
  var itemView1 = view.itemViewForContentIndex(1);
  ok(itemView1, 'precond - first call returns an item view');
  
  var itemView2 = view.itemViewForContentIndex(1);
  equals(itemView2, itemView1, 'retrieving multiple times should same instance');

  // Test internal case
  var itemView3 = view.itemViewForContentIndex(1, YES);
  ok(itemView1 !== itemView3, 'itemViewForContentIndex(1, YES) should return new item even if it is already cached actual :%@'.fmt(itemView3));

  var itemView4 = view.itemViewForContentIndex(1, NO);
  equals(itemView4, itemView3, 'itemViewForContentIndex(1) [no reload] should return newly cached item after recache');
  
});

// ..........................................................
// ALTERNATE WAYS TO GET AN EXAMPLE VIEW
// 

test("contentExampleViewKey is set and content has property", function() {
  var CustomView = SC.View.extend();
  var obj = content.objectAt(1);
  obj.set('foo', CustomView);
  view.set('contentExampleViewKey', 'foo');

  var itemView = view.itemViewForContentIndex(1);
  ok(itemView, 'should return item view');
  ok(itemView.kindOf(CustomView), 'itemView should be custom view specified on object. actual: %@'.fmt(itemView));
});

test("contentExampleViewKey is set and content is null", function() {
  var CustomView = SC.View.extend();
  view.set('contentExampleViewKey', 'foo');
  content.replace(1,1,[null]);

  var itemView = view.itemViewForContentIndex(1);
  ok(itemView, 'should return item view');
  equals(itemView.get('content'), null, 'itemView content should be null');
  ok(itemView.kindOf(view.exampleView), 'itemView should be exampleView (%@). actual: %@'.fmt(view.exampleView, itemView));
});

test("contentExampleViewKey is set and content property is empty", function() {
  var CustomView = SC.View.extend();
  view.set('contentExampleViewKey', 'foo');

  var itemView = view.itemViewForContentIndex(1);
  ok(itemView, 'should return item view');
  equals(itemView.get('content'), content.objectAt(1), 'itemView should have content');
  ok(itemView.kindOf(view.exampleView), 'itemView should be exampleView (%@). actual: %@'.fmt(view.exampleView, itemView));
});

// ..........................................................
// GROUP EXAMPLE VIEW
// 

test("delegate says content is group", function() {
  view.testAsGroup = YES ;
  var itemView = view.itemViewForContentIndex(1);
  ok(itemView, 'should return itemView');
  ok(itemView.kindOf(view.groupExampleView), 'itemView should be groupExampleView (%@). actual: %@'.fmt(view.groupExampleView, itemView));
  ok(itemView.isGroupView, 'itemView.isGroupView should be YES');
});

test("contentGroupExampleViewKey is set and content has property", function() {
  view.testAsGroup = YES ;
  
  var CustomView = SC.View.extend();
  var obj = content.objectAt(1);
  obj.set('foo', CustomView);
  view.set('contentGroupExampleViewKey', 'foo');

  var itemView = view.itemViewForContentIndex(1);
  ok(itemView, 'should return item view');
  ok(itemView.kindOf(CustomView), 'itemView should be custom view specified on object. actual: %@'.fmt(itemView));
  ok(itemView.isGroupView, 'itemView.isGroupView should be YES');
});

test("contentGroupExampleViewKey is set and content is null", function() {
  view.testAsGroup = YES ;

  var CustomView = SC.View.extend();
  view.set('contentGroupExampleViewKey', 'foo');
  content.replace(1,1,[null]);

  var itemView = view.itemViewForContentIndex(1);
  ok(itemView, 'should return item view');
  equals(itemView.get('content'), null, 'itemView content should be null');
  ok(itemView.kindOf(view.groupExampleView), 'itemView should be exampleView (%@). actual: %@'.fmt(view.groupExampleView, itemView));
  ok(itemView.isGroupView, 'itemView.isGroupView should be YES');
});

test("contentGroupExampleViewKey is set and content property is empty", function() {
  view.testAsGroup = YES ;

  var CustomView = SC.View.extend();
  view.set('contentGroupExampleViewKey', 'foo');

  var itemView = view.itemViewForContentIndex(1);
  ok(itemView, 'should return item view');
  equals(itemView.get('content'), content.objectAt(1), 'itemView should have content');
  ok(itemView.kindOf(view.groupExampleView), 'itemView should be exampleView (%@). actual: %@'.fmt(view.groupExampleView, itemView));
  ok(itemView.isGroupView, 'itemView.isGroupView should be YES');
});


// ..........................................................
// DELEGATE SUPPORT
// 

test("consults delegate if set", function() {
  view.fixture = null; //break to make sure this is not used
  view.delegate = del;
  
  var itemView = view.itemViewForContentIndex(1);
  ok(itemView, 'returns item view');
  shouldMatchFixture(itemView, del.fixture);
});

test("consults content if implements mixin and delegate not set", function() {
  view.fixture = null; //break to make sure this is not used
  view.delegate = null;
  
  SC.mixin(content, del) ; // add delegate methods to content
  
  var itemView = view.itemViewForContentIndex(1);
  ok(itemView, 'returns item view');
  shouldMatchFixture(itemView, content.fixture);
});


test("prefers delegate over content if both implement mixin", function() {
  view.fixture = null; //break to make sure this is not used
  view.delegate = del;
  SC.mixin(content, del) ; // add delegate methods to content
  content.fixture = null ; //break
  
  var itemView = view.itemViewForContentIndex(1);
  ok(itemView, 'returns item view');
  shouldMatchFixture(itemView, del.fixture);
});

// ..........................................................
// SPECIAL CASES
// 

test("after making an item visible then invisible again", function() {

  view.isVisibleInWindow = YES ;
  
  // STEP 1- setup with some nowShowing
  SC.run(function() {
    view.set('fixtureNowShowing', SC.IndexSet.create(1));
    view.notifyPropertyChange('nowShowing');
  });
  equals(view.get('childViews').length, 1, 'precond - should have a child view');

  var itemView = view.itemViewForContentIndex(1);
  equals(itemView.get('parentView'), view, 'itemView has parent view');
  
  // STEP 2- setup with NONE visible
  SC.run(function() {
    view.set('fixtureNowShowing', SC.IndexSet.create());
    view.notifyPropertyChange('nowShowing');
  });
  equals(view.get('childViews').length, 0, 'precond - should have no childview');

  itemView = view.itemViewForContentIndex(1);
  equals(itemView.get('parentView'), view, 'itemView has parent view');


  // STEP 3- go back to nowShowing
  SC.run(function() {
    view.set('fixtureNowShowing', SC.IndexSet.create(1));
    view.notifyPropertyChange('nowShowing');
  });
  equals(view.get('childViews').length, 1, 'precond - should have a child view');

  itemView = view.itemViewForContentIndex(1);
  equals(itemView.get('parentView'), view, 'itemView has parent view');
  
});


