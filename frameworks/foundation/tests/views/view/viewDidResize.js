// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Apple, Inc. and contributors.
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
