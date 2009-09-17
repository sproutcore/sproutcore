// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Apple Inc. and contributors.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/*global module test equals context ok same Q$ htmlbody */

// ..........................................................
// viewDidResize()
// 
module("SC.View#viewDidResize");

test("invokes parentViewDidResize on all child views - ignoring views that do not implement method", function() {
  var callCount = 0 ;
  var ChildView = SC.View.extend({ 
    parentViewDidResize: function() { callCount++; } 
  });
  
  var view = SC.View.create({
    childViews: [ChildView, ChildView, ChildView]    
  });
  
  // one of the childViews should NOT implement method
  view.childViews[2].parentViewDidResize = null ;
  
  // now test...
  view.viewDidResize();
  equals(callCount, 2, 'should invoke parentViewDidResize() on two methods that support it');
});

test("triggers whenever layout property is changed", function() {
  var callCount = 0 ;
  var view = SC.View.create({
    // use the callback below to detect when viewDidResize is icalled.
    childViews: [SC.View.extend({
      parentViewDidResize: function() { callCount++; }
    })]
  });
  
  view.set('layout', { top: 10, left: 20, height: 50, width: 40 });
  equals(callCount, 1, 'viewDidResize should invoke once');
});

test("making sure that the frame value is correct inside viewDidResize()", function() {
  // We want to test to be sure that when the view's viewDidResize() method is
  // called, its frame has been updated.  But rather than run the test inside
  // the method itself, we'll cache a global reference to the then-current
  // value and test it later.
  var cachedFrame;
  
  var view = SC.View.create({
    
    layout: { left:0, top:0, width:400, height:400 },
    
    viewDidResize: function() {
        sc_super();
        
        // Set a global reference to my frame at this point so that we can
        // test for the correct value later.
        cachedFrame = this.get('frame');
      }
  });


  // Access the frame once before resizing the view, to make sure that the
  // previous value was cached.  That way, when we ask for the frame again
  // after the resize, we can verify that the cache invalidation logic is
  // working correctly.
  var originalFrame = view.get('frame');
  
  SC.RunLoop.begin();
  view.adjust('height', 314);
  SC.RunLoop.end();

  // Now that we've adjusted the view, the cached view (as it was inside its
  // viewDidResize() method) should be the same value, because the cached
  // 'frame' value should have been invalidated by that point.
  same(view.get('frame').height, cachedFrame.height, 'height');
});


// ..........................................................
// parentViewDidResize()
// 
module("SC.View#parentViewDidResize");

// view.callCount must increments whenever something interesting happens
function testParentViewDidResizeWithAlignments(view) {
  // try with fixed layout
  view.set('layout', { top: 10, left: 10, height: 10, width: 10 });
  view.callCount = 0 ;
  view.parentViewDidResize();
  equals(view.callCount, 0, 'should not notify frame changed');

  // try with flexible height
  view.set('layout', { top: 10, left: 10, bottom: 10, width: 10 });
  view.callCount = 0 ;
  view.parentViewDidResize();
  equals(view.callCount, 1, 'should notify frame changed');

  // try with flexible width
  view.set('layout', { top: 10, left: 10, height: 10, right: 10 });
  view.callCount = 0 ;
  view.parentViewDidResize();
  equals(view.callCount, 1, 'should notify frame changed');

  // try with right align
  view.set('layout', { top: 10, right: 10, height: 10, width: 10 });
  view.callCount = 0 ;
  view.parentViewDidResize();
  equals(view.callCount, 1, 'should notify frame changed');

  // try with bottom align
  view.set('layout', { top: 10, bottom: 10, height: 10, width: 10 });
  view.callCount = 0 ;
  view.parentViewDidResize();
  equals(view.callCount, 1, 'should notify frame changed');

  // try with center horizontal align
  view.set('layout', { centerX: 10, top: 10, height: 10, width: 10 });
  view.callCount = 0 ;
  view.parentViewDidResize();
  equals(view.callCount, 1, 'should notify frame changed');

  // try with center vertical align
  view.set('layout', { left: 10, centerY: 10, height: 10, width: 10 });
  view.callCount = 0 ;
  view.parentViewDidResize();
  equals(view.callCount, 1, 'should notify frame changed');
}

test("notifies 'frame' property change unless layout is fixed", function() {
  var view = SC.View.create({
    // instrument...
    callCount: 0 ,
    frameDidChange: function() { 
      this.callCount++; 
    }.observes('frame')
  });
  testParentViewDidResizeWithAlignments(view);
});

test("calls viewDidResize on self unless layout is fixed", function() {
  var view = SC.View.create({
    // instrument...
    callCount: 0 ,
    viewDidResize: function() { this.callCount++; }
  });
  testParentViewDidResizeWithAlignments(view);
});

test("invoked whenever view is added to a new parentView but not when it is removed", function() {
  var callCount = 0;
  var view = SC.View.create({
    parentViewDidResize: function() { callCount++; }
  });
  var parent = SC.Pane.create().append(); // must be visible in window...
  
  callCount = 0 ;
  parent.appendChild(view);
  equals(callCount, 1, 'should call parentViewDidResize');
  
  callCount = 0;
  parent.removeChild(view);
  equals(callCount, 0, 'should not call parentViewDidResize()');
  
  parent.remove();
});

// ..........................................................
// beginLiveResize()
// 
module("SC.View#beginLiveResize");

test("invokes willBeginLiveResize on receiver and any child views that implement it", function() {
  var callCount = 0;  
  var ChildView = SC.View.extend({
    willBeginLiveResize: function() { callCount++ ;}
  });
  
  var view = ChildView.create({ // <-- has callback
    childViews: [SC.View.extend({ // <-- this does not implement callback
      childViews: [ChildView] // <-- has callback
    })]
  });
  
  callCount = 0 ;
  view.beginLiveResize();
  equals(callCount, 2, 'should invoke willBeginLiveResize when implemented');
});

test("returns receiver", function() {
  var view = SC.View.create();
  equals(view.beginLiveResize(), view, 'returns receiver');
});

// ..........................................................
// endLiveResize()
// 
module("SC.View#endLiveResize");

test("invokes didEndLiveResize on receiver and any child views that implement it", function() {
  var callCount = 0;  
  var ChildView = SC.View.extend({
    didEndLiveResize: function() { callCount++; }
  });
  
  var view = ChildView.create({ // <-- has callback
    childViews: [SC.View.extend({ // <-- this does not implement callback
      childViews: [ChildView] // <-- has callback
    })]
  });
  
  callCount = 0 ;
  view.endLiveResize();
  equals(callCount, 2, 'should invoke didEndLiveResize when implemented');
});

test("returns receiver", function() {
  var view = SC.View.create();
  equals(view.endLiveResize(), view, 'returns receiver');
});
