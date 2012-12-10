// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2011 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*global module test htmlbody ok equals same stop start Q$ */

// note: need to test interaction with Validators here
// possibly move Validator support to TextFieldView specifically.
var pane, view0, view1, view2;

module("SC.DateFieldView", {
  setup: function() {
    SC.RunLoop.begin();
    pane = SC.MainPane.create({
      childViews: [
      SC.DateFieldView.extend({
        hint: 'dd/mm/yyyy',
        value: SC.DateTime.create({ day: 1, month: 1, year: 2010})
      }),
      SC.DateFieldView.extend({
        hint: 'dd/mm/yyyy hh:mm AM/PM',
        value: SC.DateTime.create({ day: 1, month: 1, year: 2010, hour: 11, minute: 20 }),
        showTime: YES,
        isEnabled: NO
      }),
      SC.DateFieldView.extend({
        hint: 'hh:mm AM/PM',
        value: SC.DateTime.create({ hour: 11, minute: 20 }),
        showDate: NO,
        showTime: YES
      }),
      SC.DateFieldView.extend({
        formatDateTime: '%y-%m-%d %I:%M:%S',
        value: SC.DateTime.create({ day: 1, month: 1, year: 2010, hour: 11, minute: 20, second: 10 }),
        showTime: YES,
      })]
    });
    pane.append(); // make sure there is a layer...
    SC.RunLoop.end();

    view0 = pane.childViews[0];
    view1 = pane.childViews[1];
    view2 = pane.childViews[2];
    view3 = pane.childViews[3];
  },

  teardown: function() {
    pane.remove();
    pane = view0 = view1 = view2 = null;
  }
});

test("renders an text field input tag with appropriate attributes",
function() {
  equals(view0.get('fieldValue'), '01/01/2010', 'Field value should be equal - Date Only');
  equals(view1.get('fieldValue'), '01/01/2010 11:20 AM', 'Field value should be equal - Date & Time');
  equals(view2.get('fieldValue'), '11:20 AM', 'Field value should be equal - Time Only');
  equals(view0.get('isEnabled'), YES, 'field enabled');
  equals(view1.get('isEnabled'), NO, 'field not enabled');
  var q = Q$('input', view0.get('layer'));
  equals(q.attr('type'), 'text', 'should have type as text');
  equals(q.attr('name'), view0.get('layerId'), 'should have name as view_layerid');
});

test("isEnabled=NO should add disabled class",
function() {
  SC.RunLoop.begin();
  view0.set('isEnabled', NO);
  SC.RunLoop.end();
  ok(view0.$().hasClass('disabled'), 'should have disabled class');
});

test("isEnabled=NO isEditable=NO should add disabled attribute", function() {
  SC.RunLoop.begin();
  view0.set('isEnabled', NO);
  view0.set('isEditable', NO);
  SC.RunLoop.end();
  ok(view0.$input().attr('disabled'), 'should have disabled attribute');
  ok(!view0.$input().attr('readOnly'), 'should not have readOnly attribute');
});

test("isEnabled=NO isEditable=YES should add disabled attribute", function() {
  SC.RunLoop.begin();
  view0.set('isEnabled', NO);
  view0.set('isEditable', YES);
  SC.RunLoop.end();
  ok(view0.$input().attr('disabled'), 'should have disabled attribute');
  ok(!view0.$input().attr('readOnly'), 'should not have readOnly attribute');
});

test("isEnabled=YES isEditable=NO should add readOnly attribute", function() {
  SC.RunLoop.begin();
  view0.set('isEnabled', YES);
  view0.set('isEditable', NO);
  SC.RunLoop.end();
  ok(!view0.$input().attr('disabled'), 'should not have disabled attribute');
  ok(view0.$input().attr('readOnly'), 'should have readOnly attribute');
});

test("isEnabled=YES isEditable=YES should not add disable or readOnly attribute", function() {
  SC.RunLoop.begin();
  view0.set('isEnabled', YES);
  view0.set('isEditable', YES);
  SC.RunLoop.end();
  ok(!view0.$input().attr('disabled'), 'should not have disabled attribute');
  ok(!view0.$input().attr('readOnly'), 'should not have readOnly attribute');
});


test("test updateValue method", function() {
  view1.updateValue('%d', 2);
  equals(view1.get('fieldValue'), '12/01/2010 11:20 AM', 'Field value should be equal - Date & Time');
  view1.updateValue('%d', 0);
  view1.updateValue('%d', 2);
  equals(view1.get('fieldValue'), '02/01/2010 11:20 AM', 'Field value should be equal - Date & Time');
  view1.updateValue('%d', 5);
  view1.updateValue('%d', 2);
  equals(view1.get('fieldValue'), '25/01/2010 11:20 AM', 'Field value should be equal - Date & Time');
  view1.updateValue('%m', 2);
  equals(view1.get('fieldValue'), '25/12/2010 11:20 AM', 'Field value should be equal - Date & Time');
  view1.updateValue('%m', 0);
  view1.updateValue('%m', 2);
  equals(view1.get('fieldValue'), '25/02/2010 11:20 AM', 'Field value should be equal - Date & Time');
  view1.updateValue('%m', 9);
  equals(view1.get('fieldValue'), '25/02/2010 11:20 AM', 'Field value should be equal - Date & Time');
  view1.updateValue('%Y', 0);
  equals(view1.get('fieldValue'), '25/02/2010 11:20 AM', 'Field value should be equal - Date & Time');
  view1.updateValue('%Y', 0);
  equals(view1.get('fieldValue'), '25/02/1000 11:20 AM', 'Field value should be equal - Date & Time');
  view1.updateValue('%Y', 2);
  view1.updateValue('%Y', 0);
  view1.updateValue('%Y', 1);
  view1.updateValue('%Y', 2);
  equals(view1.get('fieldValue'), '25/02/2012 11:20 AM', 'Field value should be equal - Date & Time');
  view1.updateValue('%I', 0);
  equals(view1.get('fieldValue'), '25/02/2012 10:20 AM', 'Field value should be equal - Date & Time');
  view1.updateValue('%I', 9);
  equals(view1.get('fieldValue'), '25/02/2012 09:20 AM', 'Field value should be equal - Date & Time');
  view1.updateValue('%I', 9);
  view1.updateValue('%I', 9);
  equals(view1.get('fieldValue'), '25/02/2012 09:20 AM', 'Field value should be equal - Date & Time');
  view1.updateValue('%M', 9);
  equals(view1.get('fieldValue'), '25/02/2012 09:09 AM', 'Field value should be equal - Date & Time');
  view1.updateValue('%M', 9);
  equals(view1.get('fieldValue'), '25/02/2012 09:09 AM', 'Field value should be equal - Date & Time');

  view3.updateValue('%S', 9);
  equals(view3.get('fieldValue'), '10-01-01 11:20:09', 'Field value should be equal - Date & Time');
  view3.updateValue('%S', 8);
  equals(view3.get('fieldValue'), '10-01-01 11:20:09', 'Field value should be equal - Date & Time');
  view3.updateValue('%S', 5);
  view3.updateValue('%S', 5);
  equals(view3.get('fieldValue'), '10-01-01 11:20:55', 'Field value should be equal - Date & Time');
  view3.updateValue('%y', 2);
  view3.updateValue('%y', 5);
  equals(view3.get('fieldValue'), '25-01-01 11:20:55', 'Field value should be equal - Date & Time');
  view3.updateValue('%y', 0);
  view3.updateValue('%y', 0);
  equals(view3.get('fieldValue'), '00-01-01 11:20:55', 'Field value should be equal - Date & Time');
  view3.updateValue('%y', 9);
  equals(view3.get('fieldValue'), '09-01-01 11:20:55', 'Field value should be equal - Date & Time');
  view3.updateValue('%y', 9);
  equals(view3.get('fieldValue'), '99-01-01 11:20:55', 'Field value should be equal - Date & Time');
  view3.updateValue('%y', 1);
  view3.updateValue('%y', 0);
  view3.updateValue('%y', 0);
  equals(view3.get('fieldValue'), '00-01-01 11:20:55', 'Field value should be equal - Date & Time');
});





















