// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2011 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test htmlbody ok equals same stop start Q$ */


// note: need to test interaction with Validators here
// possibly move Validator support to TextFieldView specifically.

var pane, view, view1, view2;

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
          }),
          SC.TextFieldView.extend({
            layerId: 'fieldWithCustomId'
          })
        ]
    });
    pane.append(); // make sure there is a layer...
    SC.RunLoop.end();
    
    view  = pane.childViews[0];
    view1 = pane.childViews[1];
    view2 = pane.childViews[2];
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
  equals(q.attr('name'), view.get('layerId'), 'should have name as view_layerid');
});

test("renders an text field with a custom layerId with correct id and name html attributes", function() {  
  equals(view2.$().attr('id'), 'fieldWithCustomId', 'label html element should have the custom id');
  equals(view2.$input().attr('name'), 'fieldWithCustomId', 'input html element should have the custom name');
});

test("isEnabled=NO should add disabled class", function() {
  SC.RunLoop.begin();
  view.set('isEnabled', NO);
  SC.RunLoop.end();  
  ok(view.$().hasClass('disabled'), 'should have disabled class');
});

test("isEnabled=NO isEditable=NO should add disabled attribute", function() {
  SC.RunLoop.begin();
  view.set('isEnabled', NO);
  view.set('isEditable', NO);
  SC.RunLoop.end();  
  ok(view.$input().attr('disabled'), 'should have disabled attribute');
  ok(!view.$input().attr('readOnly'), 'should not have readOnly attribute');
});

test("isEnabled=NO isEditable=YES should add disabled attribute", function() {
  SC.RunLoop.begin();
  view.set('isEnabled', NO);
  view.set('isEditable', YES);
  SC.RunLoop.end();  
  ok(view.$input().attr('disabled'), 'should have disabled attribute');
  ok(!view.$input().attr('readOnly'), 'should not have readOnly attribute');
});

test("isEnabled=YES isEditable=NO should add readOnly attribute", function() {
  SC.RunLoop.begin();
  view.set('isEnabled', YES);
  view.set('isEditable', NO);
  SC.RunLoop.end();  
  ok(!view.$input().attr('disabled'), 'should not have disabled attribute');
  ok(view.$input().attr('readOnly'), 'should have readOnly attribute');
});

test("isEnabled=YES isEditable=YES should not add disable or readOnly attribute", function() {
  SC.RunLoop.begin();
  view.set('isEnabled', YES);
  view.set('isEditable', YES);
  SC.RunLoop.end();  
  ok(!view.$input().attr('disabled'), 'should not have disabled attribute');
  ok(!view.$input().attr('readOnly'), 'should not have readOnly attribute');
});

test("autoCapitalize=YES should add autocapitalize", function() {
  SC.RunLoop.begin();
  view.set('autoCapitalize', YES);
  view.displayDidChange();
  SC.RunLoop.end();
  ok(view.$input().attr('autocapitalize') !== "off", 'should have an autocapitalize attribute');
});

test("autoCapitalize=NO should add autocapitalize='off'", function() {
  SC.RunLoop.begin();
  view.set('autoCapitalize', NO);
  view.displayDidChange();
  SC.RunLoop.end();
  ok(view.$input().attr('autocapitalize') === "off", 'should have an autocapitalize attribute set to "off"');
});

test("autoCapitalize=null should not add autocapitalize", function() {
  SC.RunLoop.begin();
  view.set('autoCapitalize', null);
  view.displayDidChange();
  SC.RunLoop.end();
  ok(!view.$input().attr('autocapitalize'), 'should not have an autocapitalize attribute set');
});

test("autoCorrect=YES should add autocorrect", function() {
  SC.RunLoop.begin();
  view.set('autoCorrect', YES);
  view.displayDidChange();
  SC.RunLoop.end();
  ok(view.$input().attr('autocorrect') !== "off", 'should have an autocorrect attribute');
});

test("autoCorrect=NO should add autocorrect='off'", function() {
  SC.RunLoop.begin();
  view.set('autoCorrect', NO);
  view.displayDidChange();
  SC.RunLoop.end();
  ok(view.$input().attr('autocorrect') === "off", 'should have an autocorrect attribute set to "off"');
});

test("autoCorrect=null should not add autocorrect", function() {
  SC.RunLoop.begin();
  view.set('autoCorrect', null);
  view.displayDidChange();
  SC.RunLoop.end();
  ok(!view.$input().attr('autocorrect'), 'should not have an autocorrect attribute set');
});

test("interpretKeyEvents should allow key command methods to be implemented.", function() {
  view1.insertNewline = function() { successFlag = YES; return YES; };
  // Hit enter.
  SC.RunLoop.begin();
  var evt = SC.Event.simulateEvent(view1.get('layer'), 'keydown', { which: SC.Event.KEY_RETURN, keyCode: SC.Event.KEY_RETURN })
  view1.keyDown(evt);
  SC.RunLoop.end();
  // Test.
  ok(successFlag, 'insertNewline should have been triggered.');
});

// test("isEnabled=NO should add disabled attr to input", function() {
//   SC.RunLoop.begin();
//   view1.set('isEnabled', NO);
//   SC.RunLoop.end();  
//   ok(view1.$input().attr('disabled'), 'should have disabled attr');  
//   view1.set('isEditing',YES);
//   ok(view1.get('value') === 'SproutCore', 'value cannot be changed');
//   });

