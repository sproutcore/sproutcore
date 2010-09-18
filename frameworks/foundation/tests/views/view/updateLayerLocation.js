// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test equals context ok same */

// .......................................................
//  updateLayerLocation() 
//
var parent, child, parentLayer, childLayer;
module("SC.View#updateLayerLocation", {
	setup: function() {
		parent = SC.View.create({ 
			childViews: [SC.View]
		});
		child = parent.childViews[0];
	
		parent.createLayer();
		parentLayer = parent.get('layer');
		childLayer = child.get('layer');
	},
	
	teardown: function() {
		parent = child = parentLayer = childLayer = null;
	}
});  

test("returns receiver", function() {
	var view = SC.View.create();
	equals(view.updateLayerLocation(), view, 'returns receiver');
});


// helper method for testing if a parent still contains a child node
function parentHasChild(parent, child) {
	var cur = parent.firstChild;
	while(cur) {
		if (cur === child) return YES;
		cur = cur.nextSibling ;
	}
	return NO ;
}

test("CASE 1: remove child from parent - remove child layer from parent layer", function() {

	equals(childLayer.parentNode, parentLayer, 'child layer currently belongs to parent');

	child.removeFromParent();
	child.updateLayerLocation();
	ok(!parentHasChild(parentLayer, childLayer), 'child layer no longer belongs to parent node') ;
});

test("CASE 2: add child to new parent view with no layer if its own, destroy the layer...", function() {

	var newParent = SC.View.create();
	ok(!newParent.get('layer'), 'precond - new parent has no layer');
	newParent.appendChild(child);
	
	child.updateLayerLocation() ;
	ok(!parentHasChild(parentLayer, childLayer), 'child layer was removed from parent layer');
	ok(!child.get('layer'), 'child no longer has layer either');
});

test("CASE 3: add child with no layer or parent with no layer.  nothing to do.  this test ensures no errors are thrown", function() {

	// create a few new views w/ no layers...
	var newParent = SC.View.create();
	var newChild = SC.View.create();
	ok(!newParent.get('layer'), 'precond - new parent has no layer');
	ok(!newChild.get('layer'), 'precond - new child has no layer');
	newParent.appendChild(newChild);
	
	ok(!newParent.get('layer'), 'new parent still has no layer');
	ok(!newChild.get('layer'), 'new child still has no layer');
});

test("CASE 4: add child with no layer to parent with layer.  create layer for child", function() {

	var newChild = SC.View.create();
	ok(!newChild.get('layer'), 'precond - new child has no layer');

	parent.appendChild(newChild);
	newChild.updateLayerLocation();
	
	var layer = newChild.get('layer');
	ok(layer, 'newChild now has layer');
	equals(layer.parentNode, parentLayer, 'newChild layer belongs to parent layer');	
});

test("CASE 5: add child with layer to parent with layer.  move layer from previous location to new parent", function() {

	var newParent = SC.View.create();
	var layer = newParent.createLayer().get('layer');
	ok(layer, 'precond - newParent has layer');
	
	newParent.appendChild(child);
	child.updateLayerLocation();
	
	ok(!parentHasChild(parentLayer, childLayer), 'old parent layer no longer has child layer');
	ok(parentHasChild(layer, childLayer), 'newParent layer now has child');
});

test("CASE 5a: insert child before a sibling w/ layer - should insert child layer before sibling layer", function() {

	var newParent = SC.View.create({
	  childViews: [SC.View]
	}).createLayer();
	var newParentLayer = newParent.get('layer');

	var sibling = newParent.childViews[0];
	var siblingLayer = sibling.get('layer');

	ok(newParentLayer, 'precond - newParent has layer');
	ok(siblingLayer, 'precond - sibling has layer');
	ok(parentHasChild(newParentLayer, siblingLayer), 'precond - siblingLayer belongs to new parent layer')	;
	
	newParent.insertBefore(child, sibling);
	child.updateLayerLocation();
	
	equals(childLayer.nextSibling, siblingLayer, 'child layer inserted before sibling layer');
	ok(parentHasChild(newParentLayer, childLayer), 'newParentLayer does not have childLayer');
});


test("CASE 5b: insert child w/ layer before a sibling w/ NO layer - should create and insert sibling & child's layers", function() {

	var newParent = SC.View.create().createLayer();
	var newParentLayer = newParent.get('layer');

	var sibling = SC.View.create();

	ok(newParentLayer, 'precond - newParent has layer');
	ok(!sibling.get('layer'), 'precond - sibling should have NO layer');
	
	// add layer-less sibling to parent before child..
	newParent.appendChild(sibling);
	newParent.insertBefore(child, sibling);
	
	ok(sibling.get('layerLocationNeedsUpdate'), 'sibling.layerLocationNeedsUpdate should be YES');
	
	child.updateLayerLocation();
	
	var siblingLayer = sibling.get('layer');
	ok(siblingLayer, 'sibling should have layer now');
	ok(parentHasChild(newParentLayer, siblingLayer), 'sibling layer should belong to newParent layer');
	
	equals(childLayer.nextSibling, siblingLayer, 'child layer should be inserted before sibling layer');
	ok(parentHasChild(newParentLayer, childLayer), 'newParentLayer should have childLayer');
});

// .......................................................
//  updateLayerLocationIfNeeded() 
//
var view, runCount ;
module("SC.View#updateLayerLocationIfNeeded",{
 setup: function() {
   view = SC.View.create({
     updateLayerLocation: function() { runCount++; }
   });
   runCount = 0;
 },
 
 teardown: function() { view = null; }
});  

test("returns receiver", function() {
	equals(view.updateLayerLocationIfNeeded(), view, 'returns receiver');
});

test("invokes updateLayerLocation if layerLocationNeedsUpdate is YES", function() {
  
  view.set('layerLocationNeedsUpdate', YES);
  view.updateLayerLocationIfNeeded();
  equals(runCount, 1, 'did invoke');  
});

test("does NOT invoke updateLayerLocation if layerLocationNeedsUpdate is NO", function() {
  
  view.set('layerLocationNeedsUpdate', NO);
  view.updateLayerLocationIfNeeded();
  equals(runCount, 0, 'did NOT invoke');  
});

test("sets layerLocationNeedsUpdate to NO when run", function() {
  var view = SC.View.create(); // this needs to _not_ override updateLayerLocation.
  view.set('layerLocationNeedsUpdate', YES);
  view.updateLayerLocationIfNeeded();
  equals(view.get('layerLocationNeedsUpdate'), NO, 'did reset');
});



