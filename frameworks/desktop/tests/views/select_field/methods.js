// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            portions copyright @2009 Apple, Inc.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/*global module test htmlbody ok equals same stop start */

var pane, view ;
module("SC.SelectFieldView",{
	setup: function() {
	    SC.RunLoop.begin();
	    pane = SC.MainPane.create({
		  childViews: [
		   SC.SelectFieldView.extend({
			objects:[1,6,11,2,8]
		   }),
		   SC.SelectFieldView.extend({
			objects:["Apple","Sproutcore 1.0","Development","Charles"]// ,
			// sortObjects:function(objects){
			// 				console.log('Displaying the options without sorting');
			// 			}
		   })]	
		});
		pane.append(); // make sure there is a layer...
	    SC.RunLoop.end();
	
		view = pane.childViews[0];
		view1= pane.childViews[1];
		
	},
	
	teardown: function() {
    	pane.remove();
    	pane = view = null ;
  	}
});

test("renders a select field input tag with appropriate attributes", function() {
	equals(view.get('tagName'), 'select', 'should have type as text');	
	var q = Q$('select', view.get('layer'));
	equals(view.$().attr('id'), SC.guidFor(view), 'should have id as view_guid');
});

test("select component with options", function() {
 	equals(5,view.objects.length,'The select component should have 5 options');
	equals(null,view.nameKey,'the select should not have any name key');
	equals(null,view.valueKey,'the select should not have any value key');
});

test("sortObjects() sorts the options of the select component", function() {	
	var obj = view.objects;
	view.objects = view.sortObjects(obj);

	equals(1,obj.get(0),'should be the first element');
	equals(2,obj.get(1),'should be the second element');
	equals(6,obj.get(2),'should be the third element');
	equals(8,obj.get(3),'should be the forth element');
	equals(11,obj.get(4),'should be the fifth element');
});

test("rebuildMenu() populates the select component with new data", function() {	
	var newObj = ['Hai,','how','are','you?'];
	view1.objects = newObj;
	var obj = view1.objects;
	equals('Hai,',obj.get(0),'should be the first element');
	equals('how',obj.get(1),'should be the second element');
	equals('are',obj.get(2),'should be the third element');
	equals('you?',obj.get(3),'should be the forth element');
});

test("isEnabled=NO should add disabled class", function() {
    SC.RunLoop.begin();
    view.set('isEnabled', NO);
    SC.RunLoop.end();  
    ok(view.$().hasClass('disabled'), 'should have disabled class');
});



