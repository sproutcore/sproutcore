// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2011 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test htmlbody ok equals same stop start */

var pane, view ;

module("SC.SplitView",{
  setup: function() {
    SC.RunLoop.begin();
	pane = SC.MainPane.create({
	  childViews: [ SC.SplitView.extend() ]
	});
	pane.append(); // make sure there is a layer...	    
	SC.RunLoop.end();
	
	view = pane.childViews[0];
  },
    	
  teardown: function() {
    pane.remove();
    pane = view = null ;
  }		
});

test("the views are collapsible", function() {
	equals(YES,view.canCollapseView(view.get('topLeftView')),'the top left view is collapsable');
	equals(YES,view.canCollapseView(view.get('bottomRightView')),'the bottom right view is collapsable');	
	equals(YES,view.splitViewCanCollapse(view,view.get('topLeftView')),'should return true');
	view.set('canCollapseViews','NO');
});

test("the thickness of the views",function(){
	ok(view.thicknessForView(view.get('topLeftView')),'thickness of the topLeftView');
	ok(view.thicknessForView(view.get('bottomRightView')),'thickness of the bottomRightView');
});

test("Layout direction is Horizontal",function() {
  view.set('layoutDirection', SC.LAYOUT_HORIZONTAL) ;
  equals(view.getPath('thumbViewCursor.cursorStyle'),"ew-resize",'The Cursor is');
});

test("Layout direction is Vertical",function() {
  view.set('layoutDirection', SC.LAYOUT_VERTICAL) ;
  equals(view.getPath('thumbViewCursor.cursorStyle'),"ns-resize",'The Cursor is');
});

test("Cursor remains correct after drag", function() {
  view.set('layoutDirection', SC.LAYOUT_HORIZONTAL) ;
  equals(view.getPath('thumbViewCursor.cursorStyle'), "ew-resize", 'The Cursor is');
 	
 	// Trigger the action
 	var elem = view.getPath('dividerView.layer');
 	SC.Event.trigger(elem, 'mousedown'); 	
 	SC.Event.trigger(elem, 'mouseup');
  
  equals(view.getPath('thumbViewCursor.cursorStyle'), "ew-resize",'The Cursor is');
});

// 
// test("performing the mouse up event", function() {
// 	var elem = thumb.get('layer');
// 	SC.Event.trigger(elem, 'mouseUp');
// });

// 	
// module("TODO: Test SC.SplitDividerView Methods");
// module("TODO: Test SC.ThumbView Methods");
