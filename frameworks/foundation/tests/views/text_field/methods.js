// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            portions copyright @2009 Apple Inc.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/*global module test htmlbody ok equals same stop start */


// note: need to test interaction with Validators here
// possibly move Validator support to TextFieldView specifically.

var pane, view ;
module("SC.TextFieldView",{
	setup: function() {
	    SC.RunLoop.begin();
	    pane = SC.MainPane.create({
		  childViews: [
		   SC.TextFieldView.extend({
			hint:'First Name',
			value:'',
			title:'First Name'
		   }),
		   SC.TextFieldView.extend({
			hint:'Name',
			value:'SproutCore',
			isEnabled: NO
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

test("renders an text field input tag with appropriate attributes", function() {
  equals(view.get('value'), '', 'value should be empty');
  equals(view1.get('value'), 'SproutCore', 'value should not be empty ');
  equals(view.get('isEnabled'),YES,'field enabled' );	
  equals(view1.get('isEnabled'),NO,'field not enabled' );
  var q = Q$('input', view.get('layer'));
  equals(q.attr('type'), 'text', 'should have type as text');
  equals(q.attr('name'), SC.guidFor(view), 'should have name as view_guid');
});

test("isEnabled=NO should add disabled class", function() {
  SC.RunLoop.begin();
  view.set('isEnabled', NO);
  SC.RunLoop.end();  
  ok(view.$().hasClass('disabled'), 'should have disabled class');
});

// test("isEnabled=NO should add disabled attr to input", function() {
//   SC.RunLoop.begin();
//   view1.set('isEnabled', NO);
//   SC.RunLoop.end();  
//   ok(view1.$input().attr('disabled'), 'should have disabled attr');  
//   view1.set('isEditing',YES);
//   ok(view1.get('value') === 'SproutCore', 'value cannot be changed');
//   });

test("isEnabled and isEditable mapping", function() {
  	obj= SC.TextFieldView.create();
	obj.set('isEnabled',false)
	equals(obj.get('isEditable'),false);
	obj.set('isEnabled',true)
	equals(obj.get('isEditable'),true);
});
